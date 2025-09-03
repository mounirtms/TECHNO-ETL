import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import serveStatic from 'serve-static';

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
            ['@babel/preset-react', { runtime: 'automatic' }],
          ],
          // Note: Console removal handled by terser in build.terserOptions
        },
      }),

      // Bundle analyzer for production builds
      isProd && visualizer({
        filename: 'dist/bundle-analysis.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
      }),

      // Middleware to serve docs
      isDev && {
        name: 'serve-docs',
        configureServer(server) {
          server.middlewares.use('/docs', serveStatic('docs/dist'));
        },
      },
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
        '@grids': resolve(__dirname, 'src/components/grids'),
        // Force React to be a singleton to prevent scheduler issues
        'react': resolve(__dirname, 'node_modules/react'),
        'react-dom': resolve(__dirname, 'node_modules/react-dom'),
        'react/jsx-runtime': resolve(__dirname, 'node_modules/react/jsx-runtime'),
        'react-dom/client': resolve(__dirname, 'node_modules/react-dom/client'),
        'react-is': resolve(__dirname, 'node_modules/react-is'),
        'prop-types': resolve(__dirname, 'node_modules/prop-types'),
        'scheduler': resolve(__dirname, 'node_modules/scheduler'),
      },
      // Handle Firebase v9 modular imports
      conditions: ['import', 'module', 'browser', 'default'],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      mainFields: ['browser', 'module', 'main'],
    },

    // Development server configuration - Optimized for performance
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT) || 80,
      strictPort: false,
      open: true,
      cors: {
        origin: ['http://localhost:80', 'http://127.0.0.1:80', 'http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true,
      },
      hmr: {
        overlay: isDev,
        port: 24678,
        clientPort: 24678,
      },
      fs: {
        cachedChecks: true,
      },
      warmup: {
        clientFiles: ['./src/main.jsx', './src/App.jsx'],
      },
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
          timeout: isDev ? 10000 : 30000,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('🔴 Proxy Error:', err.message);
            });
            if (isDev && !process.env.VITE_QUIET) {
              proxy.on('proxyReq', (_, req) => {
                if (req.url.includes('/health')) return;
                console.log('🚀 Proxying:', req.method, req.url);
              });
            }
          },
        },
      },
    },

    // Build configuration
    build: {
      onwarn(warning, warn) {
        // Suppress certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        if (warning.code === 'SOURCEMAP_ERROR') return;
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
      // Output directory
      outDir: 'dist',

      // Generate source maps for debugging in production
      sourcemap: isProd ? 'hidden' : true,

      // Minification
      minify: isProd ? 'terser' : false,

      // Target modern browsers
      target: ['es2020', 'edge88', 'chrome80', 'firefox78', 'safari14'],

      // Enable CSS code splitting for better caching
      cssCodeSplit: true,

      // Aggressive code splitting for better caching
      modulePreload: {
        polyfill: true,
        resolveDependencies: (filename, deps) => {
          if (filename.includes('vendor')) {
            return deps.filter(dep => dep.includes('vendor'));
          }
          return deps;
        },
      },

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
          booleans_as_integers: false,
        },
        mangle: {
          // Preserve class names for debugging
          keep_classnames: false,
          // Preserve function names for debugging
          keep_fnames: false,
        },
        format: {
          // Remove comments
          comments: false,
        },
      } : {},

      // Rollup options for advanced optimization
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),

        output: {
          // Optimized chunk strategy to prevent React splitting and improve caching
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // CRITICAL: Keep ALL React ecosystem in ONE chunk for better performance
              if (id.includes('react') ||
                  id.includes('scheduler') ||
                  id.includes('react-is') ||
                  id.includes('prop-types') ||
                  id.includes('@emotion') ||
                  id.includes('stylis') ||
                  id.includes('@mui')) {
                return 'vendor-react'; // Single React chunk
              }

              // Firebase separate for better caching
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }

              // Large libraries in separate chunks
              if (id.includes('recharts') || id.includes('lodash')) {
                return 'vendor-charts';
              }

              // Other vendor libraries
              return 'vendor-libs';
            }

            // App code chunks
            if (id.includes('/contexts/')) {
              return 'app-contexts'; // Keep contexts together
            }
            if (id.includes('/components/') && !id.includes('/components/grids')) {
              return 'app-components';
            }
            if (id.includes('/components/grids')) {
              return 'app-grids';
            }
            if (id.includes('/services/')) {
              return 'app-services';
            }
            if (id.includes('/pages/')) {
              return 'app-pages';
            }
            if (id.includes('/hooks/')) {
              return 'app-hooks';
            }
          },

          // File naming patterns with better organization
          chunkFileNames: () => {
            return 'js/[name]-[hash:8].js'; // Shorter hash for better caching
          },
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name.split('.').pop();

            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return 'images/[name]-[hash:8].[ext]'; // Shorter hash for better caching
            }
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return 'fonts/[name]-[hash:8].[ext]';
            }

            return 'assets/[name]-[hash:8].[ext]';
          },
        },
      },
    },

    // Aggressive dependency optimization for faster development
    optimizeDeps: {
      // Include ALL React-related dependencies to ensure proper bundling
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react-router-dom',
        'react-is',
        'prop-types',
        'scheduler',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled',
      ],

      // Exclude problematic dependencies
      exclude: [
        'firebase',
      ],

      // Force optimization only when needed
      force: false,

      // Enhanced ESBuild options for faster processing
      esbuildOptions: {
        target: 'es2020',
        define: {
          global: 'globalThis',
        },
        // Faster builds in development
        minify: !isDev,
        sourcemap: isDev,
      },
    },

    // CSS configuration
    css: {
      // CSS modules configuration
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProd
          ? '[hash:base64:5]'
          : '[name]__[local]__[hash:base64:5]',
      },

      // PostCSS configuration
      postcss: {
        plugins: [],
      },

      // Sass/SCSS configuration
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/styles/variables.scss";',
          charset: false,
        },
      },

      // CSS dev source maps
      devSourcemap: isDev,
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDev,
      __PROD__: isProd,
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
      jsxDev: isDev,
    },

    // Worker configuration
    worker: {
      format: 'es',
      plugins: [],
    },

    // JSON configuration
    json: {
      namedExports: true,
      stringify: false,
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
      port: 80,
      strictPort: false,
      cors: true,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  };
});
