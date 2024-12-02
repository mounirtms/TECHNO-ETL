import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      fastRefresh: true,
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@images': path.resolve(__dirname, 'src/assets/images'),
      '@data': path.resolve(__dirname, 'src/assets/data'),
      '@cegid': path.resolve(__dirname, 'src/assets/CegidApi')
    },
  },
  server: {
    port: 2524,
    strictPort: true,
    open: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      overlay: false
    },
    watch: {
      usePolling: true,
      interval: 100,
      include: ['src/**', 'index.html']
    },
    proxy: {
      '/rest': {
        target: 'https://technostationery.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/rest/, '/rest'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      },
      '/api': {
        target: 'http://localhost:2524',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/magento-api': {
        target: 'https://technostationery.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/magento-api/, ''),
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Origin', 'https://techno-webapp.web.app');
            proxyReq.setHeader('Access-Control-Request-Method', 'POST, GET, OPTIONS');
            proxyReq.setHeader('Access-Control-Request-Headers', 'Content-Type, Authorization');
          });
        }
      }
    },
    cors: {
      origin: 'https://techno-webapp.web.app',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          charts: ['recharts']
        },
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/i.test(name ?? '')) {
            return 'assets/images/[name][extname]'
          }
          if (/\.(json|csv|xml)$/i.test(name ?? '')) {
            return 'assets/data/[name][extname]'
          }
          return 'assets/[name][extname]'
        }
      }
    },
    assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg', '**/*.json', '**/*.csv', '**/*.xml'],
    copyPublicDir: true,
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'recharts'
    ],
    exclude: ['@assets/*'],
    esbuildOptions: {
      target: 'esnext'
    },
    force: true
  },
  publicDir: 'public'
})
