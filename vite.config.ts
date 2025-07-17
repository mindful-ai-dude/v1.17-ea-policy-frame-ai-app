import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'
import { VitePWA } from 'vite-plugin-pwa'
import imagemin from 'vite-plugin-imagemin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      react(),
      compression({
        algorithm: 'gzip',
        exclude: [/\.(br)$/, /\.(gz)$/],
      }),
      compression({
        algorithm: 'brotliCompress',
        exclude: [/\.(br)$/, /\.(gz)$/],
      }),
      imagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 80,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
            },
            {
              name: 'removeEmptyAttrs',
              active: false,
            },
          ],
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'EA PolicyFrame App',
          short_name: 'PolicyFrame',
          description: 'Strategic AI policy content framing application',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    build: {
      // Generate source maps for production builds
      sourcemap: mode === 'development',
      // Minify output
      minify: 'terser',
      // Configure chunk splitting strategy
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'convex-vendor': ['convex/react'],
            'ui-components': [
              './src/components/GlassButton.tsx',
              './src/components/GlassCard.tsx',
              './src/components/GlassInput.tsx',
              './src/components/GlassModal.tsx',
              './src/components/GlassNavigation.tsx',
            ],
          },
          // Add content hash to file names for cache busting
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
      // Optimize chunk size warnings threshold
      chunkSizeWarningLimit: 1000,
      // Enable terser options for better minification
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
    },
    // Configure server options
    server: {
      // Enable HTTPS in development
      https: {
        key: './certs/localhost-key.pem',
        cert: './certs/localhost.pem',
      },
      // Configure headers
      headers: {
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    },
    // Define environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
    },
  }
})
