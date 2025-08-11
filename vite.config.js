import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ command, mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = command === 'serve';
  const isProd = mode === 'production';

  console.log(`🔧 Building TECHNO-ETL in ${mode} mode`);

  return {
    plugins: [
      react({
        // Fast Refresh for development
        fastRefresh: isDev,
        // React automatic JSX runtime
        jsxRuntime: 'automatic',
        // Babel options
        babel: {
          presets: [
            ['@babel/preset-react', { runtime: 'automatic' }]
          ]
          // Note: Console removal handled by terser in build.terserOptions
        }
      }),

      // Bundle analyzer for production builds
      isProd && visualizer({
        filename: 'dist/bundle-analysis.html',
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
        'react-dom': resolve(__dirname, 'node_modules/react-dom')
      },
      // Handle Firebase v9 modular imports
      conditions: ['import', 'module', 'browser', 'default'],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      mainFields: ['browser', 'module', 'main']
    },

    // Development server configuration
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT) || 3000,
      strictPort: false,
      cors: true,
      proxy: {
        // Proxy API calls to backend during development
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
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
      target: ['es2020', 'chrome80', 'firefox78', 'safari14', 'edge88'],
      
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
          // Simplified chunk splitting - keep React ecosystem together
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // Keep React, MUI, and Emotion together to prevent initialization issues
              if (id.includes('react') || id.includes('@mui') || id.includes('@emotion')) {
                return 'vendor-react-ui';
              }

              // Firebase
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }

              // Charts and utilities
              if (id.includes('recharts') || id.includes('date-fns') || id.includes('axios')) {
                return 'vendor-utils';
              }

              // Everything else
              return 'vendor-misc';
            }

            // Data chunks - group JSON data files together
            if (id.includes('/assets/data/') && id.endsWith('.json')) {
              return 'data-assets';
            }

            // Feature-based chunks
            if (id.includes('/components/grids/')) {
              return 'components-grids';
            }
            if (id.includes('/components/dashboard/')) {
              return 'components-dashboard';
            }
            if (id.includes('/components/bugBounty/')) {
              return 'components-bugbounty';
            }
            if (id.includes('/services/')) {
              return 'services';
            }
          },
          
          // File naming patterns
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
            return `js/[name]-[hash].js`;
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name.split('.').pop();
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
        external: (id) => {
          // Don't externalize anything for now
          return false;
        },

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
      // Include common dependencies
      include: [
        'react',
        'react-dom',
        'react-router-dom'
      ],

      // Exclude problematic dependencies
      exclude: [
        'firebase'
      ],

      // Force optimization only in development
      force: isDev,

      // Basic ESBuild options
      esbuildOptions: {
        target: 'es2020'
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
      target: 'es2020',
      
      // JSX configuration
      jsx: 'automatic',
      jsxDev: isDev
    },

    // Worker configuration
    worker: {
      format: 'es',
      plugins: []
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
