import React from "react";
import { BookOpen, Plus, Upload, Star, Clock, FileText, Layout, Grid, Sparkles } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useNotebookStore } from "@/store/notebookStore";
import { Button, Divider } from "@/components/ui";
import TldrawEditor from "./TldrawEditor";

const TEMPLATES = [
  { title: "Blank Notebook", desc: "Pure white canvas for open thinking", icon: <FileText size={18} /> },
  { title: "Lined Paper", desc: "College ruled notes for lectures", icon: <Layout size={18} /> },
  { title: "Grid Paper", desc: "Engineering & math graph grid", icon: <Grid size={18} /> },
  { title: "Cornell Notes", desc: "Structured learning & revision format", icon: <BookOpen size={18} /> },
  { title: "Meeting Notes", desc: "Agenda, attendees, and action items", icon: <Sparkles size={18} /> },
];

/**
 * CanvasArea — always renders TldrawEditor (single mount per Rule 2).
 *
 * CRITICAL: TldrawEditor is NEVER unmounted. When no notebook or page is selected,
 * we show an Apple-inspired Notebook Dashboard overlay on top of the editor.
 * This preserves the editor instance for the entire app lifetime.
 */
export default function CanvasArea() {
  const activePageId = useUIStore((s) => s.activePageId);
  const activeNotebookId = useUIStore((s) => s.activeNotebookId);
  const { setActiveNotebook, setActivePage, setExportOpen } = useUIStore();
  const { notebooks, pages, createNotebook } = useNotebookStore();

  const activeNotebooks = notebooks.filter((n) => !n.isDeleted);
  const favoriteNotebooks = activeNotebooks.filter((n) => n.isFavorite);
  const recentNotebooks = [...activeNotebooks].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 6);

  const handleCreateNotebook = (title = "Untitled Notebook") => {
    const nb = createNotebook(title);
    const firstPage = useNotebookStore.getState().pages.find((p) => p.notebookId === nb.id);
    setActiveNotebook(nb.id);
    if (firstPage) setActivePage(firstPage.id);
  };

  const handleOpenNotebook = (id: string) => {
    const nbPages = pages.filter((p) => p.notebookId === id && !p.isDeleted).sort((a, b) => a.order - b.order);
    setActiveNotebook(id);
    if (nbPages.length > 0) setActivePage(nbPages[0].id);
  };

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
      id="canvas-area"
      aria-label="Drawing canvas"
    >
      {/* tldraw is ALWAYS mounted — single instance for app lifetime */}
      <TldrawEditor />

      {/* ─── Notebook Dashboard Overlay (Section 23) ─────────────────────────── */}
      {!activeNotebookId && (
        <div
          className="absolute inset-0 z-20 overflow-y-auto p-8 select-none"
          style={{ background: "var(--bg-base)" }}
        >
          <div className="max-w-4xl mx-auto space-y-10 py-6">
            {/* Welcome Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-[24px] bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-lg)]">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent)]">
                  <Sparkles size={12} />
                  <span>ByNotes V1.0 · Premium Digital Notebook</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  Welcome to ByNotes
                </h1>
                <p className="text-sm text-[var(--text-secondary)] max-w-lg leading-relaxed">
                  A fluid, Apple-inspired digital notebook powered by the official tldraw SDK.
                  Focus purely on learning, researching, and creating without distractions.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button variant="default" size="lg" onClick={() => setExportOpen(true)}>
                  <Upload size={16} />
                  Import
                </Button>
                <Button variant="accent" size="lg" onClick={() => handleCreateNotebook("My Notebook")}>
                  <Plus size={16} />
                  New Notebook
                </Button>
              </div>
            </div>

            {/* Favorites Section */}
            {favoriteNotebooks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <Star size={16} className="text-[var(--accent)]" />
                  <span>Favorites</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favoriteNotebooks.map((nb) => {
                    const count = pages.filter((p) => p.notebookId === nb.id && !p.isDeleted).length;
                    return (
                      <div
                        key={nb.id}
                        onClick={() => handleOpenNotebook(nb.id)}
                        className="group relative p-5 rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)] transition-all duration-200 cursor-pointer flex flex-col justify-between h-32"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-9 h-9 rounded-[10px] bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)] group-hover:scale-105 transition-transform">
                            <BookOpen size={18} />
                          </div>
                          <Star size={14} className="text-[var(--accent)] fill-[var(--accent)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                            {nb.name}
                          </h3>
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                            {count} {count === 1 ? "page" : "pages"} · {new Date(nb.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Notebooks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <Clock size={16} className="text-[var(--text-secondary)]" />
                  <span>Recent Notebooks</span>
                </div>
                {activeNotebooks.length > 0 && (
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {activeNotebooks.length} total
                  </span>
                )}
              </div>

              {activeNotebooks.length === 0 ? (
                <div className="p-10 rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center space-y-3">
                  <div className="w-12 h-12 rounded-[14px] bg-[var(--bg-hover)] mx-auto flex items-center justify-center text-[var(--text-tertiary)]">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-[var(--text-primary)]">No notebooks yet</h3>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      Create your first notebook or choose a template below to get started.
                    </p>
                  </div>
                  <Button variant="accent" size="sm" onClick={() => handleCreateNotebook("My First Notebook")}>
                    <Plus size={14} />
                    Create Notebook
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {recentNotebooks.map((nb) => {
                    const count = pages.filter((p) => p.notebookId === nb.id && !p.isDeleted).length;
                    return (
                      <div
                        key={nb.id}
                        onClick={() => handleOpenNotebook(nb.id)}
                        className="group relative p-5 rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] transition-all duration-200 cursor-pointer flex flex-col justify-between h-32"
                      >
                        <div className="flex items-start justify-between">
                          <div className="w-9 h-9 rounded-[10px] bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:scale-105 transition-all">
                            <BookOpen size={18} />
                          </div>
                          {nb.isFavorite && (
                            <Star size={14} className="text-[var(--accent)] fill-[var(--accent)]" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                            {nb.name}
                          </h3>
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                            {count} {count === 1 ? "page" : "pages"} · {new Date(nb.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Templates Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Layout size={16} className="text-[var(--text-secondary)]" />
                <span>Quick Start Templates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.title}
                    onClick={() => handleCreateNotebook(tmpl.title)}
                    className="group p-4 rounded-[14px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)]/30 transition-all duration-150 cursor-pointer flex items-center gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-[var(--bg-hover)] group-hover:bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0">
                      {tmpl.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                        {tmpl.title}
                      </h4>
                      <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">
                        {tmpl.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Empty Page Overlay (When Notebook is selected but no page) ──────── */}
      {activeNotebookId && !activePageId && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 select-none"
          style={{ background: "var(--bg-base)", zIndex: 10 }}
        >
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] flex items-center justify-center shadow-[var(--shadow-lg)]">
            <BookOpen size={28} className="text-white" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="font-semibold text-[var(--text-primary)]">
              Select a page
            </h2>
            <p className="text-sm text-[var(--text-tertiary)]">
              Choose a page from the sidebar or create a new one to start drawing
            </p>
          </div>
          <Button variant="accent" size="md" onClick={() => handleCreateNotebook()}>
            <Plus size={14} />
            New Page
          </Button>
        </div>
      )}
    </div>
  );
}
