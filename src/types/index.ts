// ─── Notebook & Page Types ──────────────────────────────────────────────────

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  color?: string;
  icon?: string;
}

export interface Notebook {
  id: string;
  name: string;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt?: number;
  color?: string;
  icon?: string;
  coverImage?: string;
}

export interface Page {
  id: string;
  notebookId: string;
  name: string;
  order: number;
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  deletedAt?: number;
  thumbnailDataUrl?: string;
  /** Serialised TLStore snapshot JSON */
  snapshotJson?: string;
}

// ─── UI State ────────────────────────────────────────────────────────────────

export type Theme = "dark" | "light" | "system";

export type SyncStatus = "idle" | "syncing" | "saved" | "offline" | "error";

export type SaveStatus = "saved" | "saving" | "unsaved";

// ─── Supabase Row Types ───────────────────────────────────────────────────────

export interface DBFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBNotebook {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  color: string | null;
  icon: string | null;
  is_favorite: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBPage {
  id: string;
  notebook_id: string;
  user_id: string;
  name: string;
  order: number;
  is_deleted: boolean;
  deleted_at: string | null;
  snapshot_json: string | null;
  thumbnail_data_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Auth & Sync Types ────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: number;
  last_login?: number;
}

export interface SyncQueueItem {
  operation_id: string;
  type:
    | "upsert_notebook"
    | "delete_notebook"
    | "upsert_page"
    | "delete_page"
    | "upsert_folder"
    | "delete_folder"
    | "upsert_snapshot";
  payload: any;
  timestamp: number;
  status: "pending" | "uploading" | "synced" | "failed";
  retry_count: number;
}

