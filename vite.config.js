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
          ? 'http://etl.techno-dz.com'
          : 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const origin = process.env.NODE_ENV === 'production'
              ? 'http://etl.techno-dz.com'
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
  preview: {
    port: 82, // Use the standard HTTP port
    strictPort: true,
    proxy: {
      '/api': {
        // This MUST point to your backend server.
        // Since it's on the same machine, localhost:5000 is correct.
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Ensure the correct origin is passed to the backend for CORS validation
            const origin = 'http://etl.techno-dz.com';
            proxyReq.setHeader('Origin', origin);
            proxyReq.setHeader('User-Agent', 'Techno-ETL/1.0.0 (etl.techno-dz.com)');
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    target: 'es2020',
    cssTarget: 'chrome80',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@mui')) {
              return 'mui-vendor';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts-vendor';
            }
            if (id.includes('axios') || id.includes('date-fns')) {
              return 'utils-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            return 'vendor';
          }

          // App chunks
          if (id.includes('/src/pages/')) {
            return 'pages';
          }
          if (id.includes('/src/components/')) {
            return 'components';
          }
          if (id.includes('/src/services/')) {
            return 'services';
          }
        },
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/i.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
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
    copyPublicDir: true,
    reportCompressedSize: false,
    emptyOutDir: true
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
      '@mui/x-data-grid',
      'recharts',
      'axios',
      'date-fns',
      'framer-motion'
    ],
    exclude: ['@assets/*'],
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true
      }
    },
    force: false,
    entries: [
      'src/main.jsx',
      'src/pages/**/*.jsx',
      'src/components/**/*.jsx'
    ]
  },
  publicDir: 'public'
});
