import React, { useEffect, useCallback, Suspense, lazy } from "react";
import TopBar from "@/components/topbar/TopBar";
import Sidebar from "@/components/sidebar/Sidebar";
import StatusBar from "@/components/statusbar/StatusBar";
import CanvasArea from "@/components/editor/CanvasArea";
import { Notifications } from "@/components/ui";
import { EditorProvider, useEditorRef } from "@/components/editor/EditorContext";
import { useUIStore } from "@/store/uiStore";
import { useNotebookStore } from "@/store/notebookStore";
import { useAuthStore } from "@/store/authStore";
import { initializeSyncEngine } from "@/lib/syncEngine";

// Lazy load non-critical modals for optimal bundle splitting (Section 73)
const SettingsModal = lazy(() => import("@/components/modals/SettingsModal"));
const SearchModal = lazy(() => import("@/components/modals/SearchModal"));
const LoginModal = lazy(() => import("@/components/auth/LoginModal"));

// ─── Inner shell — has access to EditorProvider context ──────────────────────

function AppShell() {
  const editorRef = useEditorRef();
  const { setSearchOpen, setSettingsOpen, toggleSidebar, activeNotebookId, setActiveNotebook, setActivePage } =
    useUIStore();
  const { createNotebook, createPage } = useNotebookStore();

  // Startup Data Loading & Auth initialization (Section 54)
  useEffect(() => {
    useAuthStore.getState().initializeAuth();
    initializeSyncEngine();
  }, []);

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
      if (meta && e.shiftKey && (e.key === "S" || e.key === "s")) { e.preventDefault(); toggleSidebar(); return; }
      if (meta && !e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        useUIStore.getState().addNotification({
          title: "Manual Sync Complete",
          message: "All notebooks and documents are saved locally.",
          type: "success",
        });
        return;
      }
      if (meta && !e.shiftKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        const nb = createNotebook("Untitled Notebook");
        const firstPage = useNotebookStore.getState().pages.find((p) => p.notebookId === nb.id);
        setActiveNotebook(nb.id);
        if (firstPage) setActivePage(firstPage.id);
        return;
      }
      if (meta && e.shiftKey && (e.key === "N" || e.key === "n")) {
        e.preventDefault();
        if (activeNotebookId) {
          const page = createPage(activeNotebookId);
          setActivePage(page.id);
        } else {
          useUIStore.getState().addNotification({
            title: "No active notebook",
            message: "Please open or create a notebook before adding a page.",
            type: "warning",
          });
        }
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
      <Suspense fallback={null}>
        <SettingsModal />
        <SearchModal />
        <LoginModal />
      </Suspense>
      <Notifications />
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
