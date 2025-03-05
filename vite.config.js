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
    port: 82,
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
      '/magento-api': {
        target: 'https://technostationery.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/magento-api/, '/rest/V1'),
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
        }
      },
      '/cegid-api': {
        target: 'http://10.0.2.58/Y2_LAB',
        changeOrigin: true,
        secure: false,  // Disable SSL verification
        rewrite: (path) => path.replace(/^\/cegid-api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Cegid proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Remove origin and referer headers for development
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            console.log('Cegid request:', req.method, req.url);
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
          // Handle documentation files
          if (name && name.includes('docs/dist/')) {
            return name.replace('docs/dist/', 'assets/docs/');
          }
          // Handle other assets
          if (/\.(gif|jpe?g|png|svg)$/i.test(name ?? '')) {
            return 'assets/images/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    assetsInclude: [
      '**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg', 
      '**/*.json', '**/*.csv', '**/*.xml',
      'docs/dist/**/*.html',
      'docs/dist/**/*.css',
      'docs/dist/**/*.js',
      'docs/dist/assets/**/*'
    ],
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
