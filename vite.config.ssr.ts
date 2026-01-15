import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  root: "./client",
  build: {
    outDir: "../dist/ssr",
    emptyOutDir: true,
    ssr: true,
    rollupOptions: {
      input: "./client/src/entry-server.tsx",
      output: {
        format: "esm",
      },
    },
  },
  ssr: {
    noExternal: ["wouter", "react-helmet-async"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./client/public"),
    },
  },
});
