import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig(({ command, mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = command === 'serve';
  const isProd = mode === 'production';

  console.log(`🔧 Building TECHNO-ETL in ${mode} mode`);

  return {
    plugins: [
      react({
        // React automatic JSX runtime
        jsxRuntime: 'automatic'
        // Let Vite handle React refresh and TypeScript automatically
      }),

      // Note: Manual chunk splitting is handled in rollupOptions.output.manualChunks

      // Compression for production
      isProd && compression({
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false
      }),

      isProd && compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        deleteOriginFile: false
      }),

      // Bundle analyzer for production builds
      isProd && visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap'
      })
    ].filter(Boolean),

    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@services': resolve(__dirname, 'src/services'),
        '@contexts': resolve(__dirname, 'src/contexts'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@assets': resolve(__dirname, 'src/assets'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        // Force React to be a singleton to prevent scheduler issues
        'react': resolve(__dirname, 'node_modules/react'),
        'react-dom': resolve(__dirname, 'node_modules/react-dom'),
        'react/jsx-runtime': resolve(__dirname, 'node_modules/react/jsx-runtime'),
        'react-dom/client': resolve(__dirname, 'node_modules/react-dom/client'),
        'react-is': resolve(__dirname, 'node_modules/react-is'),
        'prop-types': resolve(__dirname, 'node_modules/prop-types'),
        'scheduler': resolve(__dirname, 'node_modules/scheduler')
      },
      // Handle Firebase v9 modular imports
      conditions: ['import', 'module', 'browser', 'default'],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      mainFields: ['browser', 'module', 'main']
    },

    // Development server configuration
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,
      cors: true,
      hmr: {
        overlay: true
      },
      proxy: {
        // Optimized proxy configuration for all API calls
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          timeout: 30000, // Increased timeout for better reliability
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🔴 Proxy Error:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🚀 Proxying:', req.method, req.url, '→ Backend:5000');
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('✅ Response:', proxyRes.statusCode, req.url, `(${Date.now()}ms)`);
            });
          }
        }
      }
    },

    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      
      // Generate source maps for debugging in production
      sourcemap: isProd ? 'hidden' : true,
      
      // Minification
      minify: isProd ? 'terser' : false,
      
      // Target modern browsers
      target: ['es2022', 'chrome100', 'firefox100', 'safari15', 'edge100'],
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Enable asset inlining for small files
      assetsInlineLimit: 4096,
      
      // Chunk size warning limit - optimized for production
      chunkSizeWarningLimit: 1000,
      
      // Terser options for production minification
      terserOptions: isProd ? {
        compress: {
          // Remove console logs in production
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          // Remove unused code
          dead_code: true,
          // Optimize boolean expressions
          booleans_as_integers: false
        },
        mangle: {
          // Preserve class names for debugging
          keep_classnames: false,
          // Preserve function names for debugging
          keep_fnames: false
        },
        format: {
          // Remove comments
          comments: false
        }
      } : {},

      // Rollup options for advanced optimization
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        
        output: {
          // FIXED: Simplified chunk strategy to prevent React splitting
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // CRITICAL: Keep ALL React ecosystem in ONE chunk
              if (id.includes('react') || 
                  id.includes('scheduler') || 
                  id.includes('react-is') ||
                  id.includes('prop-types') ||
                  id.includes('@emotion') ||
                  id.includes('stylis') ||
                  id.includes('@mui')) {
                return 'vendor-react'; // Single React chunk
              }
  
              // Firebase separate
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
  
              // Everything else
              return 'vendor-libs';
            }
  
            // App code chunks
            if (id.includes('/contexts/')) {
              return 'app-contexts'; // Keep contexts together
            }
            if (id.includes('/components/')) {
              return 'app-components';
            }
            if (id.includes('/services/')) {
              return 'app-services';
            }
            
            // Default return for other files
            return 'app-main';
          },
          
          // File naming patterns
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.jsx', '').replace('.js', '') : 'chunk';
            return `js/[name]-[hash].js`;
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name?.split('.').pop() || '';
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `images/[name]-[hash].[ext]`;
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `fonts/[name]-[hash].[ext]`;
            }
            if (/css/i.test(extType)) {
              return `css/[name]-[hash].[ext]`;
            }
            return `assets/[name]-[hash].[ext]`;
          }
        },
        
        // External dependencies - prevent React bundling conflicts
        // CRITICAL: Ensure React is never externalized
        external: () => false,
        


        // Preserve module structure for tree shaking
        preserveEntrySignatures: 'allow-extension'
      },

      // Report compressed file sizes
      reportCompressedSize: isProd,
      
      // Write bundle to disk during serve for debugging
      write: true
    },

    // Simplified dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled'
      ],
      exclude: ['firebase'],
      esbuildOptions: {
        target: 'es2022'
      }
    },

    // CSS configuration
    css: {
      // CSS modules configuration
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProd 
          ? '[hash:base64:5]'
          : '[name]__[local]__[hash:base64:5]'
      },
      
      // PostCSS configuration
      postcss: {
        plugins: []
      },
      
      // Sass/SCSS configuration
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/styles/variables.scss";',
          charset: false
        }
      },
      
      // CSS dev source maps
      devSourcemap: isDev
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDev,
      __PROD__: isProd
    },

    // ESBuild configuration
    esbuild: {
      // Keep names for debugging
      keepNames: !isProd,
      
      // Drop specific items in production
      drop: isProd ? ['console', 'debugger'] : [],
      
      // Target
      target: 'es2022',
      
      // JSX configuration
      jsx: 'automatic',
      jsxDev: isDev,
      
      // Modern features
      supported: {
        'top-level-await': true,
        'import-meta': true
      }
    },

    // Worker configuration
    worker: {
      format: 'es',
      plugins: () => []
    },

    // JSON configuration
    json: {
      namedExports: true,
      stringify: false
    },

    // Logging configuration
    logLevel: isDev ? 'info' : 'warn',
    
    // Clear screen
    clearScreen: true,

    // Environment prefix
    envPrefix: ['VITE_', 'TECHNO_ETL_'],

    // Preview configuration for production builds
    preview: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: false,
      cors: true,
      headers: {
        'Cache-Control': 'public, max-age=31536000'
      }
    }
  };
});
