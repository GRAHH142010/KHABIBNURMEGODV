import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  base: "./",
  root: path.resolve(__dirname, "client"),
  build: {
    target: "ES2022",
    outDir: path.resolve(__dirname, "dist", "public"),
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: path.resolve(__dirname, "client", "index.html"),
      output: {
        manualChunks: undefined,
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      },
      external: (id) => {
        // Don't bundle Node.js built-ins
        return ['fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'querystring'].includes(id);
      }
    }
  },
  publicDir: path.resolve(__dirname, "client", "public"),
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  esbuild: {
    target: "ES2022",
    platform: "browser",
    format: "esm"
  }
});