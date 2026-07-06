import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

export default function Notifications() {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed bottom-10 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => {
          const icons = {
            success: <CheckCircle2 size={16} className="text-[var(--success)] flex-shrink-0" />,
            info: <Info size={16} className="text-[var(--brand-400)] flex-shrink-0" />,
            warning: <AlertTriangle size={16} className="text-[var(--warning)] flex-shrink-0" />,
            error: <XCircle size={16} className="text-[var(--error)] flex-shrink-0" />,
          };

          const icon = icons[n.type ?? "info"];

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-[14px] shadow-[var(--shadow-xl)] border border-[var(--border-default)]"
              style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
              role="alert"
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                  {n.title}
                </p>
                {n.message && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 rounded-md transition-colors"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
