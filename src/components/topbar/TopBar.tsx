import React, { useEffect, useState } from "react";
import {
  Monitor,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Redo2,
  Search,
  Settings,
  Sun,
  Undo2,
  User,
  Download,
} from "lucide-react";
import clsx from "clsx";
import { useUIStore } from "@/store/uiStore";
import { useNotebookStore } from "@/store/notebookStore";
import { Button, Tooltip } from "@/components/ui";
import { Theme, SaveStatus } from "@/types";

// ─── Save Status Indicator ───────────────────────────────────────────────────

function SaveIndicator({ status }: { status: SaveStatus }) {
  const [displayStatus, setDisplayStatus] = useState<string>("Saved");

  useEffect(() => {
    if (status === "saving") setDisplayStatus("Saving…");
    else if (status === "saved") setDisplayStatus("Saved");
    else if (status === "unsaved") setDisplayStatus("Offline");
  }, [status]);

  return (
    <div
      className={clsx(
        "flex items-center gap-2 text-xs px-2.5 py-1 rounded-full transition-all duration-300 select-none",
        status === "saved" && "text-[var(--text-tertiary)] bg-[var(--bg-hover)]/50",
        status === "saving" && "text-[var(--warning)] bg-[var(--warning)]/10 font-medium",
        status === "unsaved" && "text-[var(--text-tertiary)] bg-[var(--bg-hover)]"
      )}
    >
      {status === "saving" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)] animate-pulse" />
      )}
      {status === "saved" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
      )}
      {status === "unsaved" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
      )}
      <span className="hidden sm:inline transition-opacity duration-200">
        {displayStatus}
      </span>
    </div>
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useUIStore();

  const cycle: Record<Theme, Theme> = { dark: "light", light: "system", system: "dark" };
  const icons: Record<Theme, React.ReactNode> = {
    dark: <Moon size={14} />,
    light: <Sun size={14} />,
    system: <Monitor size={14} />,
  };
  const labels: Record<Theme, string> = {
    dark: "Dark mode",
    light: "Light mode",
    system: "System theme",
  };

  return (
    <Tooltip label={labels[theme]} side="bottom">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(cycle[theme])}
        aria-label={`Switch theme (current: ${theme})`}
      >
        {icons[theme]}
      </Button>
    </Tooltip>
  );
}

// ─── Notebook Title ───────────────────────────────────────────────────────────

function NotebookTitle() {
  const activeNotebookId = useUIStore((s) => s.activeNotebookId);
  const activePageId = useUIStore((s) => s.activePageId);
  const { notebooks, pages, renameNotebook, renamePage } = useNotebookStore();

  const notebook = notebooks.find((n) => n.id === activeNotebookId);
  const page = pages.find((p) => p.id === activePageId);

  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  const displayTitle = page?.name ?? notebook?.name ?? "ByNotes";

  const handleDoubleClick = () => {
    setDraftTitle(displayTitle);
    setEditingTitle(true);
  };

  const handleCommit = () => {
    if (draftTitle.trim()) {
      if (page) renamePage(page.id, draftTitle.trim());
      else if (notebook) renameNotebook(notebook.id, draftTitle.trim());
    }
    setEditingTitle(false);
  };

  if (editingTitle) {
    return (
      <input
        autoFocus
        value={draftTitle}
        onChange={(e) => setDraftTitle(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCommit();
          if (e.key === "Escape") setEditingTitle(false);
        }}
        className="bg-transparent border-b border-[var(--accent)] text-[var(--text-primary)] text-sm font-semibold outline-none px-1 max-w-[240px]"
        aria-label="Rename"
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="flex items-center gap-1.5 cursor-default select-none"
      title="Double-click to rename"
    >
      {notebook && (
        <>
          <span className="text-sm text-[var(--text-tertiary)]">{notebook.name}</span>
          {page && (
            <>
              <span className="text-[var(--text-tertiary)]">/</span>
              <span className="text-sm font-semibold text-[var(--text-primary)]">{page.name}</span>
            </>
          )}
        </>
      )}
      {!notebook && (
        <span className="text-sm font-semibold text-[var(--text-primary)]">ByNotes</span>
      )}
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function TopBar({ onUndo, onRedo, canUndo, canRedo }: TopBarProps) {
  const { sidebarOpen, toggleSidebar, setSettingsOpen, setSearchOpen, setExportOpen } = useUIStore();
  const saveStatus = useNotebookStore((s) => s.saveStatus);

  // Keyboard shortcut: Cmd+K → search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSearchOpen]);

  return (
    <header
      className="flex items-center gap-2 px-3 h-16 flex-shrink-0 border-b"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(var(--glass-blur))",
        WebkitBackdropFilter: "blur(var(--glass-blur))",
        borderColor: "var(--border-subtle)",
      }}
      aria-label="Top bar"
    >
      {/* Sidebar toggle */}
      <Tooltip label={sidebarOpen ? "Hide sidebar" : "Show sidebar"} side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </Button>
      </Tooltip>

      {/* Title */}
      <div className="flex-1 flex items-center justify-center">
        <NotebookTitle />
      </div>

      {/* Save status */}
      <SaveIndicator status={saveStatus} />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <Tooltip label="Undo (⌘Z)" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo2 size={14} />
          </Button>
        </Tooltip>
        <Tooltip label="Redo (⌘⇧Z)" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Redo2 size={14} />
          </Button>
        </Tooltip>
      </div>

      {/* Search */}
      <Tooltip label="Search (⌘K)" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(true)}
          aria-label="Search"
        >
          <Search size={14} />
        </Button>
      </Tooltip>

      {/* Export */}
      <Tooltip label="Export" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setExportOpen(true)}
          aria-label="Export"
        >
          <Download size={14} />
        </Button>
      </Tooltip>

      {/* Theme */}
      <ThemeToggle />

      {/* Settings */}
      <Tooltip label="Settings" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
        >
          <Settings size={14} />
        </Button>
      </Tooltip>

      {/* User avatar */}
      <button
        className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] flex items-center justify-center flex-shrink-0"
        aria-label="User profile"
      >
        <User size={13} className="text-white" />
      </button>
    </header>
  );
}
