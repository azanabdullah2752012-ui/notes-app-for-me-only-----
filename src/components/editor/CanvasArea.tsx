import React from "react";
import { BookOpen, Plus } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useNotebookStore } from "@/store/notebookStore";
import { Button } from "@/components/ui";
import TldrawEditor from "./TldrawEditor";

/**
 * CanvasArea — always renders TldrawEditor (single mount).
 *
 * CRITICAL: TldrawEditor is NEVER unmounted. When no page is selected,
 * we show an overlay on top of the editor rather than removing it.
 * This preserves the editor instance for the entire app lifetime.
 */
export default function CanvasArea() {
  const activePageId = useUIStore((s) => s.activePageId);
  const activeNotebookId = useUIStore((s) => s.activeNotebookId);
  const { notebooks, createNotebook } = useNotebookStore();
  const { setActiveNotebook, setActivePage } = useUIStore();

  const handleCreate = () => {
    const nb = createNotebook("My First Notebook");
    const firstPage = useNotebookStore.getState().pages.find((p) => p.notebookId === nb.id);
    setActiveNotebook(nb.id);
    if (firstPage) setActivePage(firstPage.id);
  };

  const hasNotebooks = notebooks.filter((n) => !n.isDeleted).length > 0;

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
      id="canvas-area"
      aria-label="Drawing canvas"
    >
      {/* tldraw is ALWAYS mounted — single instance for app lifetime */}
      <TldrawEditor />

      {/* Empty state overlay — shown ABOVE tldraw when no page selected */}
      {!activePageId && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 select-none"
          style={{ background: "var(--bg-base)", zIndex: 10 }}
        >
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] flex items-center justify-center shadow-[var(--shadow-lg)]">
            <BookOpen size={28} className="text-white" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="font-semibold text-[var(--text-primary)]">
              {hasNotebooks ? "Select a page" : "Welcome to ByNotes"}
            </h2>
            <p className="text-sm text-[var(--text-tertiary)]">
              {hasNotebooks
                ? "Choose a notebook and page from the sidebar"
                : "Create your first notebook to start drawing"}
            </p>
          </div>
          {!hasNotebooks && (
            <Button variant="accent" size="md" onClick={handleCreate}>
              <Plus size={14} />
              New Notebook
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
