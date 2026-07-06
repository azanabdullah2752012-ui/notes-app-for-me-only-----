import React from "react";
import clsx from "clsx";

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  active?: boolean;
}

export function Button({
  variant = "default",
  size = "md",
  active,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 rounded-[8px] select-none cursor-pointer border-0 outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
        "disabled:opacity-40 disabled:pointer-events-none",
        {
          // variants
          "bg-[var(--bg-hover)] text-[var(--text-primary)] hover:bg-[var(--bg-active)]":
            variant === "default",
          "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]":
            variant === "ghost",
          "bg-transparent text-[var(--error)] hover:bg-[rgba(255,69,58,0.10)]":
            variant === "danger",
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-md":
            variant === "accent",
          // active state
          "bg-[var(--accent-subtle)] text-[var(--accent)]": active,
          // sizes
          "px-2 py-1 text-xs": size === "sm",
          "px-3 py-1.5 text-sm": size === "md",
          "px-4 py-2 text-sm": size === "lg",
          "w-7 h-7 p-0": size === "icon",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, className, ...props }: InputProps) {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="absolute left-2.5 text-[var(--text-tertiary)] flex items-center">
          {icon}
        </span>
      )}
      <input
        className={clsx(
          "w-full bg-[var(--bg-overlay)] border border-[var(--border-default)] rounded-[8px]",
          "text-[var(--text-primary)] text-sm placeholder:text-[var(--text-tertiary)]",
          "focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]",
          "transition-all duration-150",
          icon ? "pl-8 pr-3 py-1.5" : "px-3 py-1.5",
          className
        )}
        {...props}
      />
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipProps {
  label: string;
  children: React.ReactElement;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ label, children, side = "bottom" }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={clsx(
            "absolute z-50 px-2 py-1 text-xs rounded-[6px] whitespace-nowrap pointer-events-none",
            "bg-[var(--bg-overlay)] text-[var(--text-primary)] border border-[var(--border-default)]",
            "shadow-[var(--shadow-md)]",
            {
              "bottom-full mb-1.5 left-1/2 -translate-x-1/2": side === "top",
              "top-full mt-1.5 left-1/2 -translate-x-1/2": side === "bottom",
              "right-full mr-1.5 top-1/2 -translate-y-1/2": side === "left",
              "left-full ml-1.5 top-1/2 -translate-y-1/2": side === "right",
            }
          )}
        >
          {label}
        </div>
      )}
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ className }: { className?: string }) {
  return (
    <div
      className={clsx("h-px bg-[var(--border-subtle)] my-1", className)}
    />
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
        "bg-[var(--accent-subtle)] text-[var(--accent)]",
        className
      )}
    >
      {children}
    </span>
  );
}

export { default as Notifications } from "./Notifications";
export * from "./ErrorBoundary";

