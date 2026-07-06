import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "bynotes";
const DB_VERSION = 1;
const STORE_NAME = "page-snapshots";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Save a tldraw snapshot JSON string for a page.
 */
export async function savePageSnapshot(pageId: string, snapshotJson: string): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, snapshotJson, pageId);
  } catch (err) {
    console.error("[ByNotes] Failed to save snapshot:", err);
  }
}

/**
 * Load a tldraw snapshot JSON string for a page.
 * Returns null if no snapshot exists.
 */
export async function loadPageSnapshot(pageId: string): Promise<string | null> {
  try {
    const db = await getDB();
    const value = await db.get(STORE_NAME, pageId);
    return typeof value === "string" ? value : null;
  } catch (err) {
    console.error("[ByNotes] Failed to load snapshot:", err);
    return null;
  }
}

/**
 * Delete a snapshot for a page (e.g. when page is permanently deleted).
 */
export async function deletePageSnapshot(pageId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, pageId);
  } catch (err) {
    console.error("[ByNotes] Failed to delete snapshot:", err);
  }
}
