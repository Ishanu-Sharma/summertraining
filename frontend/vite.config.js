import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// package.json sets "type": "module", so this config is loaded as ESM and
// __dirname does not exist.
const rootDir = dirname(fileURLToPath(import.meta.url));

/**
 * Stamps a unique build id into the service worker after the bundle is written.
 *
 * public/sw.js is copied verbatim by Vite (that is the point of public/), so it
 * cannot use an import or a define. Rewriting the emitted file is the simplest
 * thing that works, and the only thing that matters is that the bytes change on
 * every deploy: that is what makes the browser notice an update at all.
 */
function serviceWorkerBuildId() {
  return {
    name: "quad-sw-build-id",
    apply: "build",
    closeBundle() {
      const file = resolve(rootDir, "dist", "sw.js");
      if (!existsSync(file)) {
        this.warn("dist/sw.js not found; the update prompt will not work.");
        return;
      }
      const buildId = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
      const source = readFileSync(file, "utf8").replace("__BUILD_ID__", buildId);
      writeFileSync(file, source);
      this.info?.(`Service worker build id: ${buildId}`);
    }
  };
}

export default defineConfig({
  plugins: [react(), serviceWorkerBuildId()],
  build: {
    rollupOptions: {
      output: {
        // three.js is the single largest dependency and only the home page's
        // hero needs it. Splitting it out keeps it off the critical path for
        // every signed-in route.
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) return "react";
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY || "http://localhost:4000",
        changeOrigin: true
      }
    }
  }
});
