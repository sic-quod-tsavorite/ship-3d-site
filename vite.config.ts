import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const launchEditor = env.VITE_LAUNCH_EDITOR || "code";
  const backend = env.VITE_BACKEND || "http://localhost:4000";

  return {
    base: "./",
    plugins: [
      vue(),
      tailwindcss(),
      vueDevTools({
        launchEditor: launchEditor,
      }),
    ],
    css: {
      transformer: "lightningcss",
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string): string | undefined {
            if (id.includes("node_modules")) {
              /**
               * Split three into separate js files
               */
              if (id.includes("three/build/three.module.js")) {
                return "libraries/three/three-core";
              }
              if (id.includes("three/examples/jsm/controls/")) {
                return "libraries/three/three-controls";
              }
              if (id.includes("three/examples/jsm/loaders/")) {
                return "libraries/three/three-loaders";
              }
              if (id.includes("three/examples/jsm/libs/")) {
                return "libraries/three/three-libs";
              }
              if (id.includes("three")) {
                // Catch any other three.js related modules
                return "libraries/three/three-other";
              }

              /**
               * Split vue into separate js file
               */
              if (id.includes("vue")) {
                return "libraries/vue/vue";
              }
            }
          },
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
    server: {
      headers: {
        "Content-Security-Policy": `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: ${backend}; font-src 'self'; connect-src 'self' blob: ${backend}; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:;`,
      },
    },
  };
});
