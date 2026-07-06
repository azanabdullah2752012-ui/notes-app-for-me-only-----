import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Theme } from "@/types";

interface UIState {
  // Theme
  theme: Theme;
  resolvedTheme: "dark" | "light";

  // Sidebar
  sidebarOpen: boolean;
  sidebarWidth: number;

  // Active selections
  activeNotebookId: string | null;
  activePageId: string | null;

  // Search
  searchQuery: string;
  searchOpen: boolean;

  // Modals
  settingsOpen: boolean;
  exportOpen: boolean;
  renameTarget: { type: "notebook" | "page" | "folder"; id: string } | null;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (w: number) => void;
  setActiveNotebook: (id: string | null) => void;
  setActivePage: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setExportOpen: (open: boolean) => void;
  setRenameTarget: (target: UIState["renameTarget"]) => void;
}

function resolveTheme(theme: Theme): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyTheme(resolved: "dark" | "light") {
  const html = document.documentElement;
  html.classList.remove("dark", "light");
  html.classList.add(resolved);
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      resolvedTheme: "dark",
      sidebarOpen: true,
      sidebarWidth: 260,
      activeNotebookId: null,
      activePageId: null,
      searchQuery: "",
      searchOpen: false,
      settingsOpen: false,
      exportOpen: false,
      renameTarget: null,

      setTheme: (theme) => {
        const resolved = resolveTheme(theme);
        applyTheme(resolved);
        localStorage.setItem("bynotes-theme", theme);
        set({ theme, resolvedTheme: resolved });
      },

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarWidth: (w) => set({ sidebarWidth: Math.max(200, Math.min(400, w)) }),
      setActiveNotebook: (id) => set({ activeNotebookId: id }),
      setActivePage: (id) => set({ activePageId: id }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setExportOpen: (open) => set({ exportOpen: open }),
      setRenameTarget: (target) => set({ renameTarget: target }),
    }),
    {
      name: "bynotes-ui",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        sidebarWidth: state.sidebarWidth,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.theme);
          applyTheme(resolved);
          state.resolvedTheme = resolved;
        }
      },
    }
  )
);
