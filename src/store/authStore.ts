import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { UserProfile } from "@/types";
import { useUIStore } from "./uiStore";

interface AuthState {
  user: UserProfile | null;
  session: any | null;
  isLoading: boolean;
  isGuest: boolean;
  isLoginModalOpen: boolean;

  // Actions
  initializeAuth: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  setLoginModalOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isGuest: true,
      isLoginModalOpen: false,

      initializeAuth: async () => {
        set({ isLoading: true });

        if (!isSupabaseConfigured || !supabase) {
          // Fallback to guest / offline-first mode
          set({ isLoading: false, isGuest: true });
          return;
        }

        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn("[ByNotes Auth] Error checking session:", error.message);
            set({ isLoading: false, isGuest: true });
            return;
          }

          if (session?.user) {
            const u = session.user;
            const userProfile: UserProfile = {
              id: u.id,
              name: u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "ByNotes User",
              email: u.email ?? "",
              avatar_url: u.user_metadata?.avatar_url,
              created_at: new Date(u.created_at).getTime(),
              last_login: Date.now(),
            };
            set({ user: userProfile, session, isGuest: false, isLoading: false });
          } else {
            set({ user: null, session: null, isGuest: true, isLoading: false });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((event, newSession) => {
            if (newSession?.user) {
              const u = newSession.user;
              const userProfile: UserProfile = {
                id: u.id,
                name: u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "ByNotes User",
                email: u.email ?? "",
                avatar_url: u.user_metadata?.avatar_url,
                created_at: new Date(u.created_at).getTime(),
                last_login: Date.now(),
              };
              set({ user: userProfile, session: newSession, isGuest: false, isLoginModalOpen: false });
            } else if (event === "SIGNED_OUT") {
              set({ user: null, session: null, isGuest: true });
            }
          });
        } catch (err) {
          console.error("[ByNotes Auth] Initialize error:", err);
          set({ isLoading: false, isGuest: true });
        }
      },

      signInWithGoogle: async () => {
        if (!isSupabaseConfigured || !supabase) {
          useUIStore.getState().addNotification({
            title: "Offline / Local Mode",
            message: "Supabase cloud credentials not configured. Continuing in offline local storage.",
            type: "info",
          });
          get().continueAsGuest();
          return;
        }

        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: window.location.origin,
            },
          });
          if (error) throw error;
        } catch (err: any) {
          console.error("[ByNotes Auth] Google sign in error:", err);
          useUIStore.getState().addNotification({
            title: "Sign in failed",
            message: err.message || "Could not connect to Google Authentication.",
            type: "error",
          });
        }
      },

      signOut: async () => {
        if (supabase) {
          await supabase.auth.signOut();
        }
        set({ user: null, session: null, isGuest: true });
        useUIStore.getState().addNotification({
          title: "Signed Out",
          message: "You are now in offline local workspace mode.",
          type: "info",
        });
      },

      continueAsGuest: () => {
        set({ isGuest: true, isLoginModalOpen: false });
        useUIStore.getState().addNotification({
          title: "Offline Workspace",
          message: "Your notes are saved locally in your browser with IndexedDB.",
          type: "success",
        });
      },

      setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),
    }),
    {
      name: "bynotes-auth",
      partialize: (state) => ({
        user: state.user,
        isGuest: state.isGuest,
      }),
    }
  )
);
