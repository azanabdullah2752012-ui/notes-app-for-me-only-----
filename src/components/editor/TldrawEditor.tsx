import React, { useCallback, useEffect, useRef } from "react";
import {
  Tldraw,
  type Editor,
  type TLStoreSnapshot,
  getSnapshot,
  loadSnapshot,
} from "tldraw";
import { getAssetUrlsByImport } from "@tldraw/assets/imports.vite";
import { useUIStore } from "@/store/uiStore";
import { useNotebookStore } from "@/store/notebookStore";
import { savePageSnapshot, loadPageSnapshot } from "@/lib/db";
import { useEditorRef } from "./EditorContext";
import "tldraw/tldraw.css";

const assetUrls = getAssetUrlsByImport();
const licenseKey = import.meta.env.VITE_TLDRAW_LICENSE_KEY as string | undefined;

// Debounce helper
function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

/**
 * Safe canvas reset for a fresh (unsaved) page.
 *
 * NEVER call editor.store.clear() — it removes tldraw's required system
 * records (document, page, camera) and crashes the internal reactor.
 * Instead, delete only user-created shapes and reset the camera.
 */
function clearCanvasSafely(editor: Editor) {
  try {
    editor.run(() => {
      // Delete all shapes on the current page
      const shapes = editor.getCurrentPageShapes();
      if (shapes.length > 0) {
        editor.deleteShapes(shapes.map((s) => s.id));
      }
      // Reset camera to default position
      editor.setCamera({ x: 0, y: 0, z: 1 });
    });
  } catch {
    // If even this fails, log but don't crash the app
    console.warn("[ByNotes] Could not clear canvas — editor may not be ready yet");
  }
}

/**
 * TldrawEditor — mounts the official tldraw <Tldraw> component ONCE.
 *
 * Critical invariant: this component must NEVER unmount or remount.
 * Page switching only swaps content via loadSnapshot() or clearCanvasSafely().
 */
export default function TldrawEditor() {
  const editorRef = useEditorRef();
  const currentPageIdRef = useRef<string | null>(null);
  // Guards: prevents autosave firing during programmatic page loads
  const isSwitchingRef = useRef(false);

  const activePageId = useUIStore((s) => s.activePageId);
  const { setSaveStatus } = useNotebookStore();

  // ─── Save current page snapshot to IndexedDB ─────────────────────────────
  const saveCurrentPage = useCallback(
    async (pageId: string, editor: Editor) => {
      try {
        setSaveStatus("saving");
        const snapshot = getSnapshot(editor.store);
        await savePageSnapshot(pageId, JSON.stringify(snapshot));
        setSaveStatus("saved");
      } catch (err) {
        console.error("[ByNotes] Save failed:", err);
        setSaveStatus("saved");
      }
    },
    [setSaveStatus]
  );

  // Debounced autosave — 800 ms after last user interaction
  const debouncedSave = useRef(
    debounce((pageId: string, editor: Editor) => {
      saveCurrentPage(pageId, editor);
    }, 800)
  ).current;

  // ─── Load page snapshot into editor ──────────────────────────────────────
  const loadPage = useCallback(
    async (pageId: string, editor: Editor) => {
      isSwitchingRef.current = true;
      try {
        const json = await loadPageSnapshot(pageId);
        if (json) {
          // Restore saved snapshot — tldraw reloads all shapes/camera
          const snapshot = JSON.parse(json) as TLStoreSnapshot;
          loadSnapshot(editor.store, snapshot);
        } else {
          // Fresh page — remove shapes, keep system records intact
          clearCanvasSafely(editor);
        }
      } catch (err) {
        console.error("[ByNotes] Load failed:", err);
        // Safe fallback: clear only shapes, never crash
        clearCanvasSafely(editor);
      } finally {
        // Small tick delay ensures tldraw's reactor has settled
        // before we re-enable the autosave listener
        setTimeout(() => {
          isSwitchingRef.current = false;
        }, 50);
      }
    },
    []
  );

  // ─── Page switch effect ───────────────────────────────────────────────────
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !activePageId) return;

    const prevPageId = currentPageIdRef.current;

    const doSwitch = async () => {
      // Save the page we're leaving before switching
      if (prevPageId && prevPageId !== activePageId) {
        await saveCurrentPage(prevPageId, editor);
      }
      currentPageIdRef.current = activePageId;
      await loadPage(activePageId, editor);
    };

    doSwitch();
  }, [activePageId, saveCurrentPage, loadPage, editorRef]);

  // ─── Editor mount callback ────────────────────────────────────────────────
  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      // Load whichever page was active when the app started
      const initialPageId = useUIStore.getState().activePageId;
      if (initialPageId) {
        currentPageIdRef.current = initialPageId;
        loadPage(initialPageId, editor);
      }

      // Autosave on every user-driven store change (debounced)
      const unsub = editor.store.listen(
        () => {
          if (isSwitchingRef.current) return;
          const pid = currentPageIdRef.current;
          if (!pid) return;
          setSaveStatus("saving");
          debouncedSave(pid, editor);
        },
        // source: "user" means this only fires for local user actions,
        // NOT for programmatic loadSnapshot / shape deletion calls
        { scope: "document", source: "user" }
      );

      return () => {
        unsub();
      };
    },
    // Deliberately empty deps — must only run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="absolute inset-0 tldraw-canvas-wrapper">
      <Tldraw
        assetUrls={assetUrls}
        licenseKey={licenseKey}
        onMount={handleMount}
      />
    </div>
  );
}
