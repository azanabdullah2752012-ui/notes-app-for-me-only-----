import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "@/components/ui";
import "./styles/globals.css";

// Apply stored theme before first paint (prevents flash)
const stored = localStorage.getItem("bynotes-theme") ?? "dark";
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const resolved = stored === "system" ? (prefersDark ? "dark" : "light") : stored;
document.documentElement.classList.add(resolved);
document.documentElement.classList.remove(resolved === "dark" ? "light" : "dark");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
