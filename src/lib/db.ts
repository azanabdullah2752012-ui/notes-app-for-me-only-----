import { openDB, type IDBPDatabase } from "idb";
import { Notebook, Page, SyncQueueItem } from "@/types";

const DB_NAME = "bynotes";
const DB_VERSION = 2;

export const STORE_SNAPSHOTS = "page-snapshots";
export const STORE_NOTEBOOKS = "notebooks";
export const STORE_PAGES = "pages";
export const STORE_SYNC_QUEUE = "sync-queue";
export const STORE_SETTINGS = "settings";

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
          db.createObjectStore(STORE_SNAPSHOTS);
        }
        if (!db.objectStoreNames.contains(STORE_NOTEBOOKS)) {
          db.createObjectStore(STORE_NOTEBOOKS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_PAGES)) {
          db.createObjectStore(STORE_PAGES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
          db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: "operation_id" });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS);
        }
      },
    });
  }
  return dbPromise;
}

// ─── Snapshots ────────────────────────────────────────────────────────────────

/**
 * Save a tldraw snapshot JSON string for a page.
 */
export async function savePageSnapshot(pageId: string, snapshotJson: string): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_SNAPSHOTS, snapshotJson, pageId);
  } catch (err) {
    console.error("[ByNotes] Failed to save snapshot to IDB:", err);
  }
}

/**
 * Load a tldraw snapshot JSON string for a page.
 * Returns null if no snapshot exists.
 */
export async function loadPageSnapshot(pageId: string): Promise<string | null> {
  try {
    const db = await getDB();
    const value = await db.get(STORE_SNAPSHOTS, pageId);
    return typeof value === "string" ? value : null;
  } catch (err) {
    console.error("[ByNotes] Failed to load snapshot from IDB:", err);
    return null;
  }
}

/**
 * Delete a snapshot for a page.
 */
export async function deletePageSnapshot(pageId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_SNAPSHOTS, pageId);
  } catch (err) {
    console.error("[ByNotes] Failed to delete snapshot from IDB:", err);
  }
}

// ─── Notebooks & Pages (Offline Cache - Section 43) ───────────────────────────

export async function saveNotebookToDB(notebook: Notebook): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NOTEBOOKS, notebook);
  } catch (err) {
    console.error("[ByNotes] Failed to save notebook to IDB:", err);
  }
}

export async function loadAllNotebooksFromDB(): Promise<Notebook[]> {
  try {
    const db = await getDB();
    return await db.getAll(STORE_NOTEBOOKS);
  } catch (err) {
    console.error("[ByNotes] Failed to load notebooks from IDB:", err);
    return [];
  }
}

export async function savePageToDB(page: Page): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_PAGES, page);
  } catch (err) {
    console.error("[ByNotes] Failed to save page to IDB:", err);
  }
}

export async function loadAllPagesFromDB(): Promise<Page[]> {
  try {
    const db = await getDB();
    return await db.getAll(STORE_PAGES);
  } catch (err) {
    console.error("[ByNotes] Failed to load pages from IDB:", err);
    return [];
  }
}

// ─── Sync Queue (Section 50) ──────────────────────────────────────────────────

export async function enqueueSyncOp(op: SyncQueueItem): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_SYNC_QUEUE, op);
  } catch (err) {
    console.error("[ByNotes] Failed to enqueue sync op:", err);
  }
}

export async function getPendingSyncOps(): Promise<SyncQueueItem[]> {
  try {
    const db = await getDB();
    const ops: SyncQueueItem[] = await db.getAll(STORE_SYNC_QUEUE);
    return ops.filter((o) => o.status === "pending" || o.status === "failed");
  } catch (err) {
    console.error("[ByNotes] Failed to load sync queue:", err);
    return [];
  }
}

export async function removeSyncOp(operationId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_SYNC_QUEUE, operationId);
  } catch (err) {
    console.error("[ByNotes] Failed to remove sync op:", err);
  }
}

export async function updateSyncOpStatus(operationId: string, status: SyncQueueItem["status"], retryCount = 0): Promise<void> {
  try {
    const db = await getDB();
    const op = await db.get(STORE_SYNC_QUEUE, operationId);
    if (op) {
      op.status = status;
      op.retry_count = retryCount;
      await db.put(STORE_SYNC_QUEUE, op);
    }
  } catch (err) {
    console.error("[ByNotes] Failed to update sync op status:", err);
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function saveSettingToDB(key: string, value: any): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_SETTINGS, value, key);
  } catch (err) {
    console.error("[ByNotes] Failed to save setting to IDB:", err);
  }
}

export async function loadSettingFromDB(key: string): Promise<any | null> {
  try {
    const db = await getDB();
    return await db.get(STORE_SETTINGS, key) ?? null;
  } catch (err) {
    console.error("[ByNotes] Failed to load setting from IDB:", err);
    return null;
  }
}
