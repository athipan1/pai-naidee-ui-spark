import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      'process.env': {
        VITE_API_BASE_URL: JSON.stringify(env.VITE_API_BASE_URL)
      }
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    build: {
      outDir: './build'
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});