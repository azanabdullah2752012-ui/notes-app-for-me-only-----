import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, Sun, Monitor, Info, Keyboard, HardDrive } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { Button, Divider } from "@/components/ui";
import { Theme } from "@/types";

const THEMES: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "dark", label: "Dark", icon: <Moon size={14} /> },
  { value: "light", label: "Light", icon: <Sun size={14} /> },
  { value: "system", label: "System", icon: <Monitor size={14} /> },
];

const SHORTCUTS = [
  { key: "⌘Z", action: "Undo" },
  { key: "⌘⇧Z", action: "Redo" },
  { key: "⌘K", action: "Search" },
  { key: "⌘N", action: "New page" },
  { key: "⌘⇧N", action: "New notebook" },
  { key: "⌘E", action: "Export" },
  { key: "⌘⇧S", action: "Toggle sidebar" },
  { key: "⌘,", action: "Settings" },
  { key: "⌘=", action: "Zoom in" },
  { key: "⌘-", action: "Zoom out" },
  { key: "⌘0", action: "Reset zoom" },
];

export default function SettingsModal() {
  const { settingsOpen, setSettingsOpen, theme, setTheme } = useUIStore();
  const [tab, setTab] = React.useState<"appearance" | "shortcuts" | "storage" | "about">("appearance");

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none"
            aria-modal="true"
            role="dialog"
            aria-label="Settings"
          >
            <div
              className="pointer-events-auto w-[560px] max-h-[80vh] rounded-[16px] overflow-hidden flex shadow-[var(--shadow-xl)] border border-[var(--border-default)]"
              style={{ background: "var(--bg-elevated)" }}
            >
              {/* Sidebar tabs */}
              <div
                className="w-36 flex-shrink-0 flex flex-col gap-0.5 p-3 border-r"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] px-2 mb-2">
                  Settings
                </p>
                {(["appearance", "shortcuts", "storage", "about"] as const).map((t) => {
                  const icons = {
                    appearance: <Sun size={13} />,
                    shortcuts: <Keyboard size={13} />,
                    storage: <HardDrive size={13} />,
                    about: <Info size={13} />,
                  };
                  const labels = {
                    appearance: "Appearance",
                    shortcuts: "Shortcuts",
                    storage: "Storage",
                    about: "About",
                  };
                  return (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-[7px] text-sm text-left transition-all ${
                        tab === t
                          ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-medium"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {icons[t]}
                      {labels[t]}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <h2 className="font-semibold text-[var(--text-primary)] capitalize">
                    {tab}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSettingsOpen(false)}
                    aria-label="Close settings"
                  >
                    <X size={15} />
                  </Button>
                </div>

                <Divider className="mx-5" />

                <div className="px-5 py-4 space-y-4">
                  {tab === "appearance" && (
                    <>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Theme</p>
                        <div className="flex gap-2">
                          {THEMES.map((t) => (
                            <button
                              key={t.value}
                              onClick={() => setTheme(t.value)}
                              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-[10px] border text-sm transition-all ${
                                theme === t.value
                                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                  : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]"
                              }`}
                            >
                              {t.icon}
                              <span className="text-xs">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {tab === "shortcuts" && (
                    <div className="space-y-1">
                      {SHORTCUTS.map((s) => (
                        <div
                          key={s.key}
                          className="flex items-center justify-between py-1.5 px-2 rounded-[6px] hover:bg-[var(--bg-hover)]"
                        >
                          <span className="text-sm text-[var(--text-secondary)]">{s.action}</span>
                          <kbd className="px-2 py-0.5 text-xs rounded-[5px] border border-[var(--border-strong)] text-[var(--text-secondary)] font-mono">
                            {s.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "storage" && (
                    <div className="space-y-3">
                      <p className="text-sm text-[var(--text-secondary)]">
                        ByNotes stores all data locally in your browser using IndexedDB. Your notebooks
                        are available offline.
                      </p>
                      <div className="p-3 rounded-[10px] bg-[var(--bg-overlay)] border border-[var(--border-subtle)]">
                        <p className="text-xs text-[var(--text-tertiary)]">Storage type</p>
                        <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">
                          IndexedDB (local) + Supabase (cloud sync)
                        </p>
                      </div>
                      <div className="p-3 rounded-[10px] bg-[var(--bg-overlay)] border border-[var(--border-subtle)]">
                        <p className="text-xs text-[var(--text-tertiary)]">Sync</p>
                        <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">
                          Offline-first — works without internet
                        </p>
                      </div>
                    </div>
                  )}

                  {tab === "about" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[12px] bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] flex items-center justify-center">
                          <span className="text-white font-bold text-lg">B</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">ByNotes</p>
                          <p className="text-sm text-[var(--text-tertiary)]">Version 1.0.0</p>
                        </div>
                      </div>
                      <Divider />
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        A premium digital notebook built on the official tldraw SDK. Designed for
                        focused thinking.
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        Drawing engine: tldraw v5 · React v19 · Vite v8
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
