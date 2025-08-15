import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Ensure environment variables have proper fallbacks
  const isDev = mode === 'development';
  const isProd = mode === 'production';
  
  // Set default API base URL based on environment
  const defaultApiUrl = isProd ? '/api' : 'http://localhost:5000';
  const apiBaseUrl = env.VITE_API_BASE_URL || defaultApiUrl;

  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
    server: {
      host: "0.0.0.0",
      port: 8080,
      proxy: {
        "/api": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      // Ensure all environment variables are properly defined
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
      'import.meta.env.VITE_APP_TITLE': JSON.stringify(env.VITE_APP_TITLE || 'PaiNaiDee'),
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      'import.meta.env.VITE_ENVIRONMENT': JSON.stringify(mode),
      'import.meta.env.VITE_ENABLE_DEBUG': JSON.stringify(env.VITE_ENABLE_DEBUG || String(isDev)),
      'import.meta.env.VITE_ENABLE_ANALYTICS': JSON.stringify(env.VITE_ENABLE_ANALYTICS || String(isProd)),
      'import.meta.env.VITE_ENABLE_PWA': JSON.stringify(env.VITE_ENABLE_PWA || String(isProd)),
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false // Disable PWA in development
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg}'],
          maximumFileSizeToCacheInBytes: 3000000, // 3MB limit
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                }
              }
            },
            {
              urlPattern: /\.(png|jpg|jpeg|svg|gif)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Pai Naidee - Thailand Travel Guide',
          short_name: 'PaiNaidee',
          description: 'Discover amazing places in Thailand and beyond',
          theme_color: '#000000',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      }),
      visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    build: {
      outDir: './dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: !isProd, // Only generate sourcemaps in development
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover'],
            query: ['@tanstack/react-query'],
            icons: ['lucide-react'],
            leaflet: ['leaflet', 'react-leaflet'],
            three: ['three', '@react-three/fiber', '@react-three/drei']
          },
          // Add asset file naming for better caching
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
        }
      },
      chunkSizeWarningLimit: 500,
      minify: isProd ? 'terser' : false,
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug', 'console.info']
        },
        mangle: {
          safari10: true
        }
      } : undefined
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});