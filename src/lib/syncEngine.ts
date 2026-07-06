import { supabase, isSupabaseConfigured } from "./supabase";
import {
  enqueueSyncOp,
  getPendingSyncOps,
  removeSyncOp,
  updateSyncOpStatus,
  saveNotebookToDB,
  savePageToDB,
  savePageSnapshot,
} from "./db";
import { useNotebookStore } from "@/store/notebookStore";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";
import { SyncQueueItem } from "@/types";

let isSyncing = false;
let syncTimer: ReturnType<typeof setTimeout> | null = null;
let realtimeSubscription: any = null;

/**
 * Schedule a background cloud sync (debounced by 1.5s per Section 46).
 */
export function scheduleCloudSync(delayMs = 1500) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    processSyncQueue();
  }, delayMs);
}

/**
 * Enqueue a change to be synced to cloud and trigger background upload.
 */
export async function queueOperation(
  type: SyncQueueItem["type"],
  payload: any
): Promise<void> {
  const operation_id = `${type}_${payload.id || Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  const item: SyncQueueItem = {
    operation_id,
    type,
    payload,
    timestamp: Date.now(),
    status: "pending",
    retry_count: 0,
  };

  await enqueueSyncOp(item);
  scheduleCloudSync(1000);
}

/**
 * Process pending operations in IndexedDB sync queue.
 * Fulfills Section 44, 46, 47, 50, 51.
 */
export async function processSyncQueue(): Promise<void> {
  if (isSyncing) return;
  if (!navigator.onLine) {
    useNotebookStore.getState().setSyncStatus("offline");
    return;
  }

  const user = useAuthStore.getState().user;
  if (!isSupabaseConfigured || !supabase || !user) {
    // Offline-first or guest mode
    useNotebookStore.getState().setSyncStatus("saved");
    return;
  }

  const pendingOps = await getPendingSyncOps();
  if (pendingOps.length === 0) {
    useNotebookStore.getState().setSyncStatus("saved");
    return;
  }

  isSyncing = true;
  useNotebookStore.getState().setSyncStatus("syncing");

  try {
    for (const op of pendingOps) {
      if (op.retry_count > 5) {
        await updateSyncOpStatus(op.operation_id, "failed", op.retry_count);
        continue;
      }

      await updateSyncOpStatus(op.operation_id, "uploading", op.retry_count);
      let success = false;

      try {
        if (op.type === "upsert_notebook") {
          const { error } = await supabase.from("notebooks").upsert({
            id: op.payload.id,
            user_id: user.id,
            folder_id: op.payload.folderId || null,
            name: op.payload.name,
            is_favorite: op.payload.isFavorite || false,
            is_deleted: op.payload.isDeleted || false,
            deleted_at: op.payload.deletedAt ? new Date(op.payload.deletedAt).toISOString() : null,
            created_at: new Date(op.payload.createdAt).toISOString(),
            updated_at: new Date(op.payload.updatedAt).toISOString(),
          });
          if (!error) success = true;
          else throw error;
        } else if (op.type === "delete_notebook") {
          const { error } = await supabase.from("notebooks").delete().eq("id", op.payload.id);
          if (!error) success = true;
          else throw error;
        } else if (op.type === "upsert_page") {
          const { error } = await supabase.from("pages").upsert({
            id: op.payload.id,
            notebook_id: op.payload.notebookId,
            user_id: user.id,
            name: op.payload.name,
            order: op.payload.order || 0,
            is_deleted: op.payload.isDeleted || false,
            deleted_at: op.payload.deletedAt ? new Date(op.payload.deletedAt).toISOString() : null,
            thumbnail_data_url: op.payload.thumbnailDataUrl || null,
            created_at: new Date(op.payload.createdAt).toISOString(),
            updated_at: new Date(op.payload.updatedAt).toISOString(),
          });
          if (!error) success = true;
          else throw error;
        } else if (op.type === "delete_page") {
          const { error } = await supabase.from("pages").delete().eq("id", op.payload.id);
          if (!error) success = true;
          else throw error;
        } else if (op.type === "upsert_snapshot") {
          const { error } = await supabase.from("page_snapshots").upsert({
            id: op.payload.pageId,
            page_id: op.payload.pageId,
            snapshot_json: op.payload.snapshotJson,
            updated_at: new Date(op.payload.updatedAt || Date.now()).toISOString(),
          });
          if (!error) success = true;
          else throw error;
        } else {
          success = true;
        }
      } catch (err: any) {
        console.warn(`[ByNotes Sync] Operation ${op.operation_id} failed:`, err.message);
        await updateSyncOpStatus(op.operation_id, "failed", op.retry_count + 1);
      }

      if (success) {
        await removeSyncOp(op.operation_id);
      }
    }

    const remaining = await getPendingSyncOps();
    if (remaining.length === 0) {
      useNotebookStore.getState().setSyncStatus("saved");
    } else {
      useNotebookStore.getState().setSyncStatus("error");
    }
  } catch (err) {
    console.error("[ByNotes Sync] Queue processing error:", err);
    useNotebookStore.getState().setSyncStatus("error");
  } finally {
    isSyncing = false;
  }
}

/**
 * Initialize background sync engine, event listeners, and realtime subscription (Section 48).
 */
export function initializeSyncEngine() {
  window.addEventListener("online", () => {
    useUIStore.getState().addNotification({
      title: "Internet Reconnected",
      message: "Syncing pending offline changes to cloud...",
      type: "info",
    });
    processSyncQueue();
  });

  window.addEventListener("offline", () => {
    useNotebookStore.getState().setSyncStatus("offline");
    useUIStore.getState().addNotification({
      title: "Offline Mode Active",
      message: "You can continue working normally. Changes will sync when online.",
      type: "info",
    });
  });

  // Setup realtime sync if online and authenticated
  setupRealtimeSubscription();
}

/**
 * Real-Time Sync (Section 48): subscribe to Supabase changes across devices.
 */
export function setupRealtimeSubscription() {
  const user = useAuthStore.getState().user;
  if (!isSupabaseConfigured || !supabase || !user) return;

  if (realtimeSubscription) {
    supabase.removeChannel(realtimeSubscription);
  }

  realtimeSubscription = supabase
    .channel("bynotes-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notebooks", filter: `user_id=eq.${user.id}` },
      async (payload) => {
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const dbNb = payload.new as any;
          // Last write wins check
          const localNb = useNotebookStore.getState().notebooks.find((n) => n.id === dbNb.id);
          const remoteUpdatedAt = new Date(dbNb.updated_at).getTime();
          if (!localNb || remoteUpdatedAt > localNb.updatedAt) {
            const nb = {
              id: dbNb.id,
              name: dbNb.name,
              folderId: dbNb.folder_id,
              createdAt: new Date(dbNb.created_at).getTime(),
              updatedAt: remoteUpdatedAt,
              isFavorite: dbNb.is_favorite,
              isDeleted: dbNb.is_deleted,
              deletedAt: dbNb.deleted_at ? new Date(dbNb.deleted_at).getTime() : undefined,
            };
            await saveNotebookToDB(nb);
            // Merge into store
            useNotebookStore.setState((s) => ({
              notebooks: s.notebooks.some((n) => n.id === nb.id)
                ? s.notebooks.map((n) => (n.id === nb.id ? nb : n))
                : [...s.notebooks, nb],
            }));
          }
        }
      }
    )
    .subscribe();
}
