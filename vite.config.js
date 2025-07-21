import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
    port: 80,
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
      '/api': {
        target: process.env.NODE_ENV === 'production'
          ? 'https://api.techno-dz.com'
          : 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const origin = process.env.NODE_ENV === 'production'
              ? 'https://etl.techno-dz.com'
              : 'http://localhost:80';
            proxyReq.setHeader('Origin', origin);
            proxyReq.setHeader('User-Agent', 'Techno-ETL/1.0.0 (etl.techno-dz.com)');
          });
        }
      },
      '/magento-api': {
        target: 'https://technostationery.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/magento-api/, '/rest/V1'),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/cegid-api': {
        target: 'http://10.0.2.58/Y2_LAB',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cegid-api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Cegid proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
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
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser', // Always use terser for consistency
    target: 'es2015',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
          charts: ['recharts'],
          utils: ['axios', 'date-fns'],
        },
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/i.test(name ?? '')) {
            return 'assets/images/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 1000,
    assetsInclude: [
      '**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg',
      '**/*.json', '**/*.csv', '**/*.xml',
      'docs/dist/**/*.html',
      'docs/dist/**/*.css',
      'docs/dist/**/*.js',
      'docs/dist/assets/**/*'
    ],
    copyPublicDir: true
  },
  define: {
    global: 'globalThis',
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
});
