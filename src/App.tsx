import React, { useEffect, useCallback } from "react";
import TopBar from "@/components/topbar/TopBar";
import Sidebar from "@/components/sidebar/Sidebar";
import StatusBar from "@/components/statusbar/StatusBar";
import CanvasArea from "@/components/editor/CanvasArea";
import SettingsModal from "@/components/modals/SettingsModal";
import SearchModal from "@/components/modals/SearchModal";
import { EditorProvider, useEditorRef } from "@/components/editor/EditorContext";
import { useUIStore } from "@/store/uiStore";
import { useNotebookStore } from "@/store/notebookStore";

// ─── Inner shell — has access to EditorProvider context ──────────────────────

function AppShell() {
  const editorRef = useEditorRef();
  const { setSearchOpen, setSettingsOpen, toggleSidebar, activeNotebookId, setActiveNotebook, setActivePage } =
    useUIStore();
  const { createNotebook, createPage } = useNotebookStore();

  // ── Undo / Redo ─────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    editorRef.current?.undo();
  }, [editorRef]);

  const handleRedo = useCallback(() => {
    editorRef.current?.redo();
  }, [editorRef]);

  // ── Global Keyboard Shortcuts ────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key === "k") { e.preventDefault(); setSearchOpen(true); return; }
      if (meta && e.key === ",") { e.preventDefault(); setSettingsOpen(true); return; }
      if (meta && e.shiftKey && e.key === "S") { e.preventDefault(); toggleSidebar(); return; }
      if (meta && !e.shiftKey && e.key === "n") {
        e.preventDefault();
        if (activeNotebookId) {
          const page = createPage(activeNotebookId);
          setActivePage(page.id);
        }
        return;
      }
      if (meta && e.shiftKey && e.key === "N") {
        e.preventDefault();
        const nb = createNotebook("Untitled Notebook");
        const firstPage = useNotebookStore.getState().pages.find((p) => p.notebookId === nb.id);
        setActiveNotebook(nb.id);
        if (firstPage) setActivePage(firstPage.id);
        return;
      }
      if (meta && e.key === "e") { e.preventDefault(); useUIStore.getState().setExportOpen(true); return; }
    },
    [activeNotebookId, createNotebook, createPage, setActiveNotebook, setActivePage, setSearchOpen, setSettingsOpen, toggleSidebar]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // ── System theme change listener ─────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const { theme, setTheme } = useUIStore.getState();
      if (theme === "system") setTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      <TopBar onUndo={handleUndo} onRedo={handleRedo} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <CanvasArea />
      </div>
      <StatusBar />
      <SettingsModal />
      <SearchModal />
    </div>
  );
}

// ─── Root App ────────────────────────────────────────────────────────────────

export default function App(): React.ReactElement {
  return (
    <EditorProvider>
      <AppShell />
    </EditorProvider>
  );
}
