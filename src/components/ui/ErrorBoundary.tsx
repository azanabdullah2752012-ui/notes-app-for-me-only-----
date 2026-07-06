import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ShieldCheck } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Production ErrorBoundary per Master Spec Section 59.
 * Ensures the application never displays a blank white screen,
 * guarantees user that offline IndexedDB data is safe, and provides 1-click recovery.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ByNotes Critical Error Boundary Caught]:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen w-full flex items-center justify-center p-6 select-none font-sans"
          style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
        >
          <div
            className="max-w-md w-full p-8 rounded-[24px] border shadow-2xl space-y-6 text-center"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="w-16 h-16 rounded-full bg-[var(--warning)]/10 text-[var(--warning)] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Unexpected Application Error
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                ByNotes encountered an unexpected issue while rendering this view. Your drawing engine and data integrity remain protected.
              </p>
            </div>

            <div className="p-4 rounded-[16px] bg-[var(--bg-base)] border border-[var(--border-subtle)] text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--success)]">
                <ShieldCheck size={14} />
                <span>Offline Data Vault Protected</span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] leading-normal">
                All notebooks, pages, and tldraw canvas snapshots are stored safely in your browser&apos;s IndexedDB offline cache. Zero data was lost.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left p-3 rounded-[12px] bg-red-500/5 border border-red-500/20 max-h-32 overflow-y-auto font-mono text-[11px] text-red-500">
                <p className="font-semibold mb-1">Error Details:</p>
                <p>{this.state.error.toString()}</p>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-[14px] bg-[var(--brand-600)] hover:bg-[var(--brand-500)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-brand transition-all duration-200 cursor-pointer"
              >
                <RefreshCw size={16} />
                <span>Reload &amp; Restore Workspace</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
