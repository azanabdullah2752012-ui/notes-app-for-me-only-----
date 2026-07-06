import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Folder, Notebook, Page, SaveStatus, SyncStatus } from "@/types";

interface NotebookState {
  folders: Folder[];
  notebooks: Notebook[];
  pages: Page[];
  saveStatus: SaveStatus;
  syncStatus: SyncStatus;

  // Folder actions
  createFolder: (name: string, parentId?: string | null) => Folder;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;

  // Notebook actions
  createNotebook: (name: string, folderId?: string | null) => Notebook;
  renameNotebook: (id: string, name: string) => void;
  deleteNotebook: (id: string) => void;
  restoreNotebook: (id: string) => void;
  permanentlyDeleteNotebook: (id: string) => void;
  toggleFavorite: (id: string) => void;
  duplicateNotebook: (id: string) => Notebook;

  // Page actions
  createPage: (notebookId: string, name?: string) => Page;
  renamePage: (id: string, name: string) => void;
  deletePage: (id: string) => void;
  restorePage: (id: string) => void;
  permanentlyDeletePage: (id: string) => void;
  duplicatePage: (id: string) => Page;
  updatePageSnapshot: (id: string, snapshotJson: string, thumbnailDataUrl?: string) => void;
  reorderPages: (notebookId: string, pageIds: string[]) => void;

  // Status
  setSaveStatus: (s: SaveStatus) => void;
  setSyncStatus: (s: SyncStatus) => void;
}

const now = () => Date.now();

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set, get) => ({
      folders: [],
      notebooks: [],
      pages: [],
      saveStatus: "saved",
      syncStatus: "idle",

      // ── Folders ──────────────────────────────────────────────────────────
      createFolder: (name, parentId = null) => {
        const folder: Folder = { id: uuidv4(), name, parentId, createdAt: now(), updatedAt: now() };
        set((s) => ({ folders: [...s.folders, folder] }));
        return folder;
      },
      renameFolder: (id, name) => {
        set((s) => ({
          folders: s.folders.map((f) => f.id === id ? { ...f, name, updatedAt: now() } : f),
        }));
      },
      deleteFolder: (id) => {
        set((s) => ({ folders: s.folders.filter((f) => f.id !== id) }));
      },

      // ── Notebooks ─────────────────────────────────────────────────────────
      createNotebook: (name, folderId = null) => {
        const notebook: Notebook = {
          id: uuidv4(), name, folderId, createdAt: now(), updatedAt: now(),
          isFavorite: false, isDeleted: false,
        };
        set((s) => ({ notebooks: [...s.notebooks, notebook] }));
        // Auto-create first page
        const page: Page = {
          id: uuidv4(), notebookId: notebook.id, name: "Page 1",
          order: 0, createdAt: now(), updatedAt: now(), isDeleted: false,
        };
        set((s) => ({ pages: [...s.pages, page] }));
        return notebook;
      },
      renameNotebook: (id, name) => {
        set((s) => ({
          notebooks: s.notebooks.map((n) => n.id === id ? { ...n, name, updatedAt: now() } : n),
        }));
      },
      deleteNotebook: (id) => {
        set((s) => ({
          notebooks: s.notebooks.map((n) =>
            n.id === id ? { ...n, isDeleted: true, deletedAt: now() } : n
          ),
        }));
      },
      restoreNotebook: (id) => {
        set((s) => ({
          notebooks: s.notebooks.map((n) =>
            n.id === id ? { ...n, isDeleted: false, deletedAt: undefined } : n
          ),
        }));
      },
      permanentlyDeleteNotebook: (id) => {
        set((s) => ({
          notebooks: s.notebooks.filter((n) => n.id !== id),
          pages: s.pages.filter((p) => p.notebookId !== id),
        }));
      },
      toggleFavorite: (id) => {
        set((s) => ({
          notebooks: s.notebooks.map((n) =>
            n.id === id ? { ...n, isFavorite: !n.isFavorite, updatedAt: now() } : n
          ),
        }));
      },
      duplicateNotebook: (id) => {
        const original = get().notebooks.find((n) => n.id === id);
        if (!original) throw new Error("Notebook not found");
        const newId = uuidv4();
        const copy: Notebook = { ...original, id: newId, name: `${original.name} (copy)`, createdAt: now(), updatedAt: now() };
        const originalPages = get().pages.filter((p) => p.notebookId === id && !p.isDeleted);
        const copiedPages: Page[] = originalPages.map((p) => ({
          ...p, id: uuidv4(), notebookId: newId, createdAt: now(), updatedAt: now(),
        }));
        set((s) => ({ notebooks: [...s.notebooks, copy], pages: [...s.pages, ...copiedPages] }));
        return copy;
      },

      // ── Pages ─────────────────────────────────────────────────────────────
      createPage: (notebookId, name) => {
        const pages = get().pages.filter((p) => p.notebookId === notebookId && !p.isDeleted);
        const order = pages.length;
        const page: Page = {
          id: uuidv4(), notebookId,
          name: name ?? `Page ${order + 1}`,
          order, createdAt: now(), updatedAt: now(), isDeleted: false,
        };
        set((s) => ({ pages: [...s.pages, page] }));
        return page;
      },
      renamePage: (id, name) => {
        set((s) => ({
          pages: s.pages.map((p) => p.id === id ? { ...p, name, updatedAt: now() } : p),
        }));
      },
      deletePage: (id) => {
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id ? { ...p, isDeleted: true, deletedAt: now() } : p
          ),
        }));
      },
      restorePage: (id) => {
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id ? { ...p, isDeleted: false, deletedAt: undefined } : p
          ),
        }));
      },
      permanentlyDeletePage: (id) => {
        set((s) => ({ pages: s.pages.filter((p) => p.id !== id) }));
      },
      duplicatePage: (id) => {
        const original = get().pages.find((p) => p.id === id);
        if (!original) throw new Error("Page not found");
        const copy: Page = { ...original, id: uuidv4(), name: `${original.name} (copy)`, createdAt: now(), updatedAt: now() };
        set((s) => ({ pages: [...s.pages, copy] }));
        return copy;
      },
      updatePageSnapshot: (id, snapshotJson, thumbnailDataUrl) => {
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id
              ? { ...p, snapshotJson, thumbnailDataUrl: thumbnailDataUrl ?? p.thumbnailDataUrl, updatedAt: now() }
              : p
          ),
        }));
      },
      reorderPages: (notebookId, pageIds) => {
        set((s) => ({
          pages: s.pages.map((p) => {
            if (p.notebookId !== notebookId) return p;
            const idx = pageIds.indexOf(p.id);
            return idx >= 0 ? { ...p, order: idx } : p;
          }),
        }));
      },

      setSaveStatus: (saveStatus) => set({ saveStatus }),
      setSyncStatus: (syncStatus) => set({ syncStatus }),
    }),
    {
      name: "bynotes-data",
      partialize: (state) => ({
        folders: state.folders,
        notebooks: state.notebooks,
        pages: state.pages,
      }),
    }
  )
);
