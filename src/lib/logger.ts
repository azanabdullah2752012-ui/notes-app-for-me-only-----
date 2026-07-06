/**
 * Production-aware Logging Service per Master Spec Section 60.
 * In development: Helpful console logs, warnings, and performance timings.
 * In production: No unnecessary console output; errors safely captured.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`[ByNotes INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(`[ByNotes WARN] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: unknown[]) => {
    // In production, future integration with error monitoring service (Sentry/Datadog)
    if (isDev || import.meta.env.PROD) {
      console.error(`[ByNotes ERROR] ${message}`, ...args);
    }
  },

  time: (label: string) => {
    if (isDev) {
      console.time(`[ByNotes TIME] ${label}`);
    }
  },

  timeEnd: (label: string) => {
    if (isDev) {
      console.timeEnd(`[ByNotes TIME] ${label}`);
    }
  },
};
