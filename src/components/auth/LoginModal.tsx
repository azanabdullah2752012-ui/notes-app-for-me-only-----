import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui";

export default function LoginModal() {
  const { isLoginModalOpen, setLoginModalOpen, signInWithGoogle, continueAsGuest } = useAuthStore();

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={() => setLoginModalOpen(false)}
            aria-hidden="true"
          />

          {/* Dialog (Section 39 - Minimal, Centered) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none p-4"
            aria-modal="true"
            role="dialog"
            aria-label="Sign In"
          >
            <div
              className="pointer-events-auto w-[420px] rounded-[24px] p-8 text-center shadow-[var(--shadow-xl)] border border-[var(--border-default)] relative overflow-hidden"
              style={{ background: "var(--bg-elevated)" }}
            >
              <button
                onClick={() => setLoginModalOpen(false)}
                className="absolute top-5 right-5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1.5 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              {/* Logo */}
              <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-600)] mx-auto flex items-center justify-center shadow-lg mb-6">
                <BookOpen size={30} className="text-white" />
              </div>

              {/* Title & Description */}
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
                ByNotes
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 px-2">
                Your premium digital notebook. Offline-first with automatic cloud backup and cross-device sync.
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => signInWithGoogle()}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[12px] bg-white text-gray-900 font-semibold text-sm shadow-md hover:bg-gray-100 transition-all duration-150 cursor-pointer border border-gray-200"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => continueAsGuest()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-[12px] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] font-medium text-xs transition-all border border-[var(--border-subtle)]"
                >
                  <span>Continue in Offline Workspace</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Security info */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                <ShieldCheck size={13} className="text-[var(--success)]" />
                <span>Encrypted local IndexedDB storage active</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
