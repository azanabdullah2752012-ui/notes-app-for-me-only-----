import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Folder,
  FolderOpen,
  Heart,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useUIStore } from "@/store/uiStore";
import { useNotebookStore } from "@/store/notebookStore";
import { Button, Divider, Input, Tooltip } from "@/components/ui";

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  onAdd,
  addLabel,
}: {
  label: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 mb-1 group">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-tertiary)]">
        {label}
      </span>
      {onAdd && (
        <button
          aria-label={addLabel ?? `Add ${label}`}
          onClick={onAdd}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded"
        >
          <Plus size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  active,
  count,
  onClick,
  depth = 0,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  count?: number;
  onClick: () => void;
  depth?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-sm transition-all duration-150 text-left group",
        active
          ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-medium"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
      )}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
    >
      <span className={clsx("flex-shrink-0", active ? "text-[var(--accent)]" : "text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]")}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] text-[var(--text-tertiary)] font-medium">{count}</span>
      )}
    </button>
  );
}

// ─── Notebook Item ────────────────────────────────────────────────────────────

function NotebookItem({
  id,
  name,
  pageCount,
  active,
}: {
  id: string;
  name: string;
  pageCount: number;
  active: boolean;
}) {
  const { setActiveNotebook, setActivePage } = useUIStore();
  const { pages, createPage } = useNotebookStore();
  const [expanded, setExpanded] = useState(active);

  const notebookPages = pages.filter((p) => p.notebookId === id && !p.isDeleted)
    .sort((a, b) => a.order - b.order);

  const activePageId = useUIStore((s) => s.activePageId);

  const handleSelect = () => {
    setActiveNotebook(id);
    setExpanded(true);
    if (notebookPages.length > 0) {
      setActivePage(notebookPages[0].id);
    }
  };

  const handleAddPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const page = createPage(id);
    setActiveNotebook(id);
    setActivePage(page.id);
    setExpanded(true);
  };

  return (
    <div>
      <div
        className={clsx(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-[8px] text-sm cursor-pointer group transition-all duration-150",
          active
            ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
            : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        )}
        onClick={handleSelect}
      >
        <button
          className="flex-shrink-0 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-0.5 rounded"
          onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x); }}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <BookOpen size={14} className="flex-shrink-0" />
        <span className="flex-1 truncate font-medium">{name}</span>
        <span className="text-[10px] text-[var(--text-tertiary)]">{pageCount}</span>
        <button
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          onClick={handleAddPage}
          aria-label="Add page"
        >
          <Plus size={12} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {notebookPages.map((page) => (
              <button
                key={page.id}
                onClick={() => { setActiveNotebook(id); setActivePage(page.id); }}
                className={clsx(
                  "w-full flex items-center gap-2 py-1 pl-10 pr-3 text-xs rounded-[6px] transition-all duration-100 text-left",
                  activePageId === page.id
                    ? "text-[var(--accent)] bg-[var(--accent-subtle)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <FileText size={11} className="flex-shrink-0" />
                <span className="truncate">{page.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { sidebarOpen, sidebarWidth, setSidebarWidth, setSettingsOpen, searchQuery, setSearchQuery, searchOpen, setSearchOpen, activeNotebookId } =
    useUIStore();
  const { notebooks, folders, createNotebook, createFolder } = useNotebookStore();

  const [view, setView] = useState<"all" | "favorites" | "recent" | "trash">("all");
  const [resizing, setResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(sidebarWidth);

  // Resize logic
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setResizing(true);
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      setSidebarWidth(startWidth.current + ev.clientX - startX.current);
    };
    const onUp = () => {
      setResizing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [sidebarWidth, setSidebarWidth]);

  const activeNotebooks = notebooks.filter((n) => !n.isDeleted);
  const favoriteNotebooks = activeNotebooks.filter((n) => n.isFavorite);
  const trashNotebooks = notebooks.filter((n) => n.isDeleted);

  const filteredNotebooks = searchQuery
    ? activeNotebooks.filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeNotebooks;

  const handleNewNotebook = () => {
    createNotebook("Untitled Notebook");
  };

  const handleLogoClick = () => {
    useUIStore.getState().setActiveNotebook(null);
    useUIStore.getState().setActivePage(null);
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarOpen ? sidebarWidth : 72,
        opacity: 1,
      }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex-shrink-0 flex flex-col h-full overflow-hidden select-none"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      aria-label="Sidebar"
    >
      {/* ─── Collapsed 72px Rail ─────────────────────────────────────────── */}
      {!sidebarOpen ? (
        <div className="flex flex-col items-center justify-between h-full py-4 w-[72px]">
          <div className="flex flex-col items-center gap-4 w-full px-2">
            <Tooltip label="📒 ByNotes Dashboard" side="right">
              <button
                onClick={handleLogoClick}
                className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              >
                <BookOpen size={18} className="text-white" />
              </button>
            </Tooltip>
            <Divider className="w-8 my-0.5" />
            <Tooltip label="Search (⌘K)" side="right">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Search size={18} />
              </button>
            </Tooltip>
            <Tooltip label="All Notebooks" side="right">
              <button
                onClick={() => { useUIStore.getState().toggleSidebar(); setView("all"); }}
                className={clsx(
                  "w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors",
                  view === "all" ? "bg-[var(--accent-subtle)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Folder size={18} />
              </button>
            </Tooltip>
            <Tooltip label="Favorites" side="right">
              <button
                onClick={() => { useUIStore.getState().toggleSidebar(); setView("favorites"); }}
                className={clsx(
                  "w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors",
                  view === "favorites" ? "bg-[var(--accent-subtle)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Star size={18} />
              </button>
            </Tooltip>
            <Tooltip label="Recent" side="right">
              <button
                onClick={() => { useUIStore.getState().toggleSidebar(); setView("recent"); }}
                className={clsx(
                  "w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors",
                  view === "recent" ? "bg-[var(--accent-subtle)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Clock size={18} />
              </button>
            </Tooltip>
            <Tooltip label="Trash" side="right">
              <button
                onClick={() => { useUIStore.getState().toggleSidebar(); setView("trash"); }}
                className={clsx(
                  "w-10 h-10 rounded-[10px] flex items-center justify-center transition-colors",
                  view === "trash" ? "bg-[var(--accent-subtle)] text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Trash2 size={18} />
              </button>
            </Tooltip>
          </div>
          <div className="flex flex-col items-center gap-2 w-full px-2">
            <Tooltip label="Settings (⌘,)" side="right">
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Settings size={18} />
              </button>
            </Tooltip>
          </div>
        </div>
      ) : (
        /* ─── Expanded Sidebar ────────────────────────────────────────────── */
        <div className="flex flex-col h-full" style={{ width: sidebarWidth, minWidth: sidebarWidth }}>
          {/* Workspace Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 text-left group flex-1 truncate"
              title="Return to ByNotes Dashboard"
            >
              <div className="w-6 h-6 rounded-[6px] bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <BookOpen size={12} className="text-white" />
              </div>
              <span className="font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                📒 ByNotes
              </span>
            </button>
            <span className="text-[10px] font-medium text-[var(--text-tertiary)] bg-[var(--bg-hover)] px-1.5 py-0.5 rounded">
              Personal
            </span>
          </div>

          {/* Search */}
          <div className="px-3 mb-3">
            <Input
              icon={<Search size={13} />}
              placeholder="Search notebooks…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(e.target.value.length > 0);
              }}
              aria-label="Search notebooks"
            />
          </div>

          {/* Nav Items */}
          <div className="px-2 mb-2 space-y-0.5">
            <NavItem
              icon={<BookOpen size={14} />}
              label="All Notebooks"
              active={view === "all"}
              count={activeNotebooks.length}
              onClick={() => setView("all")}
            />
            <NavItem
              icon={<Star size={14} />}
              label="Favorites"
              active={view === "favorites"}
              count={favoriteNotebooks.length}
              onClick={() => setView("favorites")}
            />
            <NavItem
              icon={<Clock size={14} />}
              label="Recent"
              active={view === "recent"}
              onClick={() => setView("recent")}
            />
            <NavItem
              icon={<Trash2 size={14} />}
              label="Trash"
              active={view === "trash"}
              count={trashNotebooks.length}
              onClick={() => setView("trash")}
            />
          </div>

          <Divider className="mx-3" />

          {/* Notebook List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
            <SectionHeader
              label={view === "trash" ? "Deleted" : view === "favorites" ? "Favorites" : "Notebooks"}
              onAdd={view === "all" ? handleNewNotebook : undefined}
              addLabel="New Notebook"
            />

            {view === "trash" && trashNotebooks.length === 0 && (
              <p className="text-xs text-[var(--text-tertiary)] px-3 py-2">Trash is empty</p>
            )}

            {(view === "all" ? filteredNotebooks : view === "favorites" ? favoriteNotebooks : view === "trash" ? trashNotebooks : activeNotebooks).map(
              (nb) => {
                const pageCount = notebooks.find((n) => n.id === nb.id)
                  ? useNotebookStore.getState().pages.filter((p) => p.notebookId === nb.id && !p.isDeleted).length
                  : 0;
                return (
                  <NotebookItem
                    key={nb.id}
                    id={nb.id}
                    name={nb.name}
                    pageCount={pageCount}
                    active={activeNotebookId === nb.id}
                  />
                );
              }
            )}

            {filteredNotebooks.length === 0 && view === "all" && !searchQuery && (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-[var(--text-tertiary)] mb-2">No notebooks yet</p>
                <button
                  onClick={handleNewNotebook}
                  className="text-xs text-[var(--accent)] hover:underline font-medium"
                >
                  Create your first notebook
                </button>
              </div>
            )}
          </div>

          <Divider className="mx-3" />

          {/* Settings */}
          <div className="px-2 py-2">
            <NavItem
              icon={<Settings size={14} />}
              label="Settings"
              onClick={() => setSettingsOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Resize Handle */}
      {sidebarOpen && (
        <div
          onMouseDown={onMouseDown}
          className={clsx(
            "absolute top-0 right-0 w-1 h-full cursor-col-resize z-10 transition-colors",
            resizing ? "bg-[var(--accent)]" : "hover:bg-[var(--accent)] bg-transparent"
          )}
          aria-label="Resize sidebar"
        />
      )}
    </motion.aside>
  );
}
