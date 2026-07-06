import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/notes-app-for-me-only-----/",
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // tldraw uses ?url imports for assets — exclude from dep optimisation
  optimizeDeps: {
    exclude: ["@tldraw/assets"],
  },
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          tldraw: ["tldraw"],
          react: ["react", "react-dom"],
          ui: ["framer-motion", "lucide-react", "clsx"],
          data: ["zustand", "idb", "@supabase/supabase-js", "uuid"],
        },
      },
    },
  },
});
