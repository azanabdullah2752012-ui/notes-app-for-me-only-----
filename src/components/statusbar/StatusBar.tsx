import React from "react";
import { useUIStore } from "@/store/uiStore";
import { useNotebookStore } from "@/store/notebookStore";

export default function StatusBar() {
  const activeNotebookId = useUIStore((s) => s.activeNotebookId);
  const activePageId = useUIStore((s) => s.activePageId);
  const syncStatus = useNotebookStore((s) => s.syncStatus);
  const { notebooks, pages } = useNotebookStore();

  const notebook = notebooks.find((n) => n.id === activeNotebookId);
  const notebookPages = activeNotebookId
    ? pages.filter((p) => p.notebookId === activeNotebookId && !p.isDeleted)
    : [];
  const currentPageIndex = notebookPages.findIndex((p) => p.id === activePageId);

  const syncLabel: Record<string, string> = {
    idle: "Synced",
    syncing: "Syncing…",
    saved: "Saved",
    offline: "Offline",
    error: "Sync error",
  };

  const syncDot: Record<string, string> = {
    idle: "bg-[var(--success)]",
    syncing: "bg-[var(--warning)] animate-pulse",
    saved: "bg-[var(--success)]",
    offline: "bg-[var(--text-tertiary)]",
    error: "bg-[var(--error)]",
  };

  return (
    <footer
      className="flex items-center justify-between px-4 h-7 text-[11px] text-[var(--text-tertiary)] flex-shrink-0 border-t"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(var(--glass-blur))",
        WebkitBackdropFilter: "blur(var(--glass-blur))",
        borderColor: "var(--border-subtle)",
      }}
      aria-label="Status bar"
    >
      {/* Left: page info */}
      <div className="flex items-center gap-3">
        {notebook && (
          <span>{notebook.name}</span>
        )}
        {notebookPages.length > 0 && (
          <span>
            Page {currentPageIndex + 1} of {notebookPages.length}
          </span>
        )}
      </div>

      {/* Right: sync status */}
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${syncDot[syncStatus]}`} />
        <span>{syncLabel[syncStatus]}</span>
      </div>
    </footer>
  );
}
