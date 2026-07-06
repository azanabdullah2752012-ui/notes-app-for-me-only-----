import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, FileText } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useNotebookStore } from "@/store/notebookStore";

export default function SearchModal() {
  const { searchOpen, setSearchOpen, setActiveNotebook, setActivePage } = useUIStore();
  const { notebooks, pages } = useNotebookStore();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (searchOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const notebookResults = query
    ? notebooks.filter((n) => !n.isDeleted && n.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const pageResults = query
    ? pages.filter((p) => !p.isDeleted && p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const close = () => setSearchOpen(false);

  const handleSelectNotebook = (id: string) => {
    setActiveNotebook(id);
    const firstPage = pages.find((p) => p.notebookId === id && !p.isDeleted);
    if (firstPage) setActivePage(firstPage.id);
    close();
  };

  const handleSelectPage = (page: { id: string; notebookId: string }) => {
    setActiveNotebook(page.notebookId);
    setActivePage(page.id);
    close();
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-[520px] rounded-[14px] overflow-hidden shadow-[var(--shadow-xl)] border border-[var(--border-default)]"
            style={{ background: "var(--bg-elevated)" }}
            aria-modal="true"
            role="dialog"
            aria-label="Search"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <Search size={16} className="text-[var(--text-tertiary)] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search notebooks and pages…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && close()}
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
                aria-label="Search input"
              />
              <button onClick={close} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" aria-label="Close search">
                <X size={14} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {query && notebookResults.length === 0 && pageResults.length === 0 && (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-6">
                  No results for "{query}"
                </p>
              )}

              {notebookResults.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] px-2 mb-1">
                    Notebooks
                  </p>
                  {notebookResults.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleSelectNotebook(n.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] hover:bg-[var(--bg-hover)] text-left transition-colors"
                    >
                      <BookOpen size={14} className="text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-primary)]">{n.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {pageResults.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] px-2 mb-1">
                    Pages
                  </p>
                  {pageResults.map((p) => {
                    const nb = notebooks.find((n) => n.id === p.notebookId);
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPage(p)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] hover:bg-[var(--bg-hover)] text-left transition-colors"
                      >
                        <FileText size={14} className="text-[var(--text-tertiary)]" />
                        <div>
                          <span className="text-sm text-[var(--text-primary)]">{p.name}</span>
                          {nb && (
                            <span className="text-xs text-[var(--text-tertiary)] ml-2">{nb.name}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!query && (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-6">
                  Type to search notebooks and pages
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
