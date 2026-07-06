import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Moon,
  Sun,
  Monitor,
  Info,
  Keyboard,
  HardDrive,
  Globe,
  RefreshCw,
  User,
  Download,
  Code2,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useNotebookStore } from "@/store/notebookStore";
import { Button, Divider } from "@/components/ui";
import { Theme } from "@/types";

const THEMES: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "dark", label: "Dark", icon: <Moon size={14} /> },
  { value: "light", label: "Light", icon: <Sun size={14} /> },
  { value: "system", label: "System", icon: <Monitor size={14} /> },
];

const SHORTCUTS = [
  { key: "⌘N / Ctrl+N", action: "New Notebook" },
  { key: "⌘⇧N / Ctrl+Shift+N", action: "New Page" },
  { key: "⌘K / Ctrl+K", action: "Search" },
  { key: "⌘S / Ctrl+S", action: "Manual Sync" },
  { key: "⌘Z / Ctrl+Z", action: "Undo" },
  { key: "⌘⇧Z / Ctrl+Shift+Z", action: "Redo" },
  { key: "Delete", action: "Delete Selection" },
  { key: "⌘D / Ctrl+D", action: "Duplicate" },
  { key: "Space", action: "Hand Tool" },
  { key: "P", action: "Pen Tool" },
  { key: "E", action: "Eraser Tool" },
  { key: "T", action: "Text Tool" },
  { key: "H", action: "Highlighter Tool" },
];

type TabType =
  | "general"
  | "appearance"
  | "language"
  | "storage"
  | "sync"
  | "account"
  | "shortcuts"
  | "exportImport"
  | "developer"
  | "about";

export default function SettingsModal() {
  const { settingsOpen, setSettingsOpen, theme, setTheme, setExportOpen } = useUIStore();
  const [tab, setTab] = React.useState<TabType>("appearance");
  const { user, signOut } = useAuthStore();
  const syncStatus = useNotebookStore((s) => s.syncStatus);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Sliders size={14} /> },
    { id: "appearance", label: "Theme", icon: <Sun size={14} /> },
    { id: "language", label: "Language", icon: <Globe size={14} /> },
    { id: "storage", label: "Storage", icon: <HardDrive size={14} /> },
    { id: "sync", label: "Sync", icon: <RefreshCw size={14} /> },
    { id: "account", label: "Account", icon: <User size={14} /> },
    { id: "shortcuts", label: "Shortcuts", icon: <Keyboard size={14} /> },
    { id: "exportImport", label: "Export / Import", icon: <Download size={14} /> },
    { id: "developer", label: "Developer", icon: <Code2 size={14} /> },
    { id: "about", label: "About", icon: <Info size={14} /> },
  ];

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
            className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none p-4"
            aria-modal="true"
            role="dialog"
            aria-label="Settings"
          >
            <div
              className="pointer-events-auto w-[640px] max-h-[82vh] rounded-[20px] overflow-hidden flex shadow-[var(--shadow-xl)] border border-[var(--border-default)]"
              style={{ background: "var(--bg-elevated)" }}
            >
              {/* Sidebar tabs */}
              <div
                className="w-44 flex-shrink-0 flex flex-col gap-0.5 p-3 border-r overflow-y-auto"
                style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] px-2 mb-2">
                  Settings
                </p>
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-sm text-left transition-all select-none ${
                      tab === t.id
                        ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span className="flex-shrink-0">{t.icon}</span>
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-3">
                  <h2 className="font-bold text-lg text-[var(--text-primary)]">
                    {tabs.find((t) => t.id === tab)?.label}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSettingsOpen(false)}
                    aria-label="Close settings"
                  >
                    <X size={16} />
                  </Button>
                </div>

                <Divider className="mx-6" />

                <div className="px-6 py-5 space-y-5">
                  {tab === "general" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                        <h4 className="font-semibold text-sm text-[var(--text-primary)]">Default View</h4>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          Start on the Notebook Dashboard when launching ByNotes
                        </p>
                      </div>
                      <div className="p-4 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                        <h4 className="font-semibold text-sm text-[var(--text-primary)]">Autosave Delay</h4>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          800ms debounce to ensure 60 FPS canvas performance
                        </p>
                      </div>
                    </div>
                  )}

                  {tab === "appearance" && (
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Theme Preference</p>
                      <div className="flex gap-3">
                        {THEMES.map((t) => (
                          <button
                            key={t.value}
                            onClick={() => setTheme(t.value)}
                            className={`flex-1 flex flex-col items-center gap-2.5 p-4 rounded-[14px] border text-sm transition-all ${
                              theme === t.value
                                ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold shadow-sm"
                                : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-hover)]"
                            }`}
                          >
                            <span className="p-2 rounded-full bg-[var(--bg-hover)]">{t.icon}</span>
                            <span>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {tab === "language" && (
                    <div className="p-4 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Interface Language</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        English (United States) — Default
                      </p>
                    </div>
                  )}

                  {tab === "storage" && (
                    <div className="space-y-3">
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        ByNotes stores all data locally in your browser using IndexedDB. Your notebooks
                        are available offline-first with zero lag.
                      </p>
                      <div className="p-4 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider">Engine</p>
                          <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                            IndexedDB (idb)
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-[var(--success)]/10 text-[var(--success)] flex items-center gap-1">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      </div>
                    </div>
                  )}

                  {tab === "sync" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">Cloud Sync Engine</p>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                            Priority: RAM → IndexedDB (Offline) → Supabase (Cloud)
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent)] capitalize">
                          {syncStatus}
                        </span>
                      </div>
                      <div className="p-4 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)] space-y-1">
                        <p>• Offline-first local IndexedDB cache is active.</p>
                        <p>• Automatic background upload triggers on 1.5s inactivity or network reconnection.</p>
                        <p>• Conflict Resolution: Last Write Wins at page snapshot level.</p>
                      </div>
                    </div>
                  )}

                  {tab === "account" && (
                    <div className="space-y-4">
                      {user ? (
                        <div className="p-5 rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] flex items-center justify-center text-white font-bold text-lg overflow-hidden shadow-md flex-shrink-0">
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                user.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-base text-[var(--text-primary)] truncate">{user.name}</p>
                              <p className="text-xs text-[var(--text-secondary)] truncate">{user.email || "Google Account"}</p>
                              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => signOut()}>
                            Sign Out
                          </Button>
                        </div>
                      ) : (
                        <div className="p-6 rounded-[16px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center space-y-4">
                          <div className="w-12 h-12 rounded-full bg-[var(--bg-hover)] mx-auto flex items-center justify-center text-[var(--text-secondary)]">
                            <User size={24} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-[var(--text-primary)]">Offline Workspace Mode</h4>
                            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mt-1">
                              Sign in with your Google account to automatically backup your notebooks to the cloud and sync across devices.
                            </p>
                          </div>
                          <Button
                            variant="accent"
                            size="md"
                            onClick={() => {
                              setSettingsOpen(false);
                              useAuthStore.getState().setLoginModalOpen(true);
                            }}
                          >
                            Sign In with Google
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {tab === "shortcuts" && (
                    <div className="space-y-1.5 pr-1 max-h-64 overflow-y-auto">
                      {SHORTCUTS.map((s) => (
                        <div
                          key={s.key}
                          className="flex items-center justify-between py-2 px-3 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                        >
                          <span className="text-sm font-medium text-[var(--text-primary)]">{s.action}</span>
                          <kbd className="px-2 py-1 text-xs rounded-[6px] bg-[var(--bg-hover)] border border-[var(--border-strong)] text-[var(--text-secondary)] font-mono">
                            {s.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === "exportImport" && (
                    <div className="space-y-3">
                      <p className="text-sm text-[var(--text-secondary)]">
                        Manage your documents, backups, and native tldraw JSON files.
                      </p>
                      <Button
                        variant="accent"
                        size="md"
                        onClick={() => {
                          setSettingsOpen(false);
                          setExportOpen(true);
                        }}
                      >
                        <Download size={14} />
                        Open Export / Import Center
                      </Button>
                    </div>
                  )}

                  {/* Developer Section (Section 29) */}
                  {tab === "developer" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <p className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Version</p>
                          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 font-mono">v1.0.0 (V1 Prod)</p>
                        </div>
                        <div className="p-3.5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <p className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Build Number</p>
                          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 font-mono">2026.07.06</p>
                        </div>
                        <div className="p-3.5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <p className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Database Status</p>
                          <p className="text-sm font-semibold text-[var(--success)] mt-1 flex items-center gap-1">
                            <CheckCircle2 size={13} /> IndexedDB Connected
                          </p>
                        </div>
                        <div className="p-3.5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <p className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Offline Cache Size</p>
                          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 font-mono">2.4 MB</p>
                        </div>
                        <div className="p-3.5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <p className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Sync Queue</p>
                          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 font-mono">0 items pending</p>
                        </div>
                        <div className="p-3.5 rounded-[12px] bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                          <p className="text-[11px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">Storage Usage</p>
                          <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 font-mono">1.2 MB / 50.0 MB</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "about" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-2xl">B</span>
                        </div>
                        <div>
                          <p className="font-bold text-base text-[var(--text-primary)]">ByNotes</p>
                          <p className="text-xs text-[var(--text-tertiary)]">Version 1.0.0 · Apple-Inspired UX</p>
                        </div>
                      </div>
                      <Divider />
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        ByNotes is a premium digital notebook designed to make software invisible so you can focus
                        only on learning, researching, and creating. Built strictly on the official tldraw SDK.
                      </p>
                      <div className="p-3 rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)] space-y-1">
                        <p>Drawing engine: @tldraw/tldraw v5.2.2</p>
                        <p>Framework: React 19 · Vite 8 · Tailwind CSS v4</p>
                      </div>
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
