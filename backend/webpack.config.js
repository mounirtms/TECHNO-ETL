import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export default (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isAnalyze = env && env.analyze;

  return {
    entry: {
      server: './simple-server.js',
      'server-full': './server.js'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        type: 'commonjs2'
      },
      environment: {
        module: false
      },
      clean: true
    },
    ignoreWarnings: [
      {
        message: /Critical dependency/
      },
      {
        message: /Module not found/
      }
    ],
    optimization: {
      moduleIds: 'deterministic',
      minimize: isProduction,
      minimizer: isProduction ? [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            ecma: 2020,
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug'],
              passes: 2
            },
            format: {
              comments: false,
              beautify: false
            },
            mangle: {
              safari10: true
            }
          },
          extractComments: false
        })
      ] : [],
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            test: /[\/]node_modules[\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true
          }
        }
      },
      usedExports: true,
      sideEffects: false
    },
    target: 'node',
    resolve: {
      extensions: ['.js', '.mjs'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@middleware': path.resolve(__dirname, 'src/middleware'),
        '@routes': path.resolve(__dirname, 'src/routes')
      }
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
    externals: [nodeExternals({
      allowlist: [
        // Include specific modules that should be bundled
        /^@keyv/,
        /^keyv/
      ]
    })],
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      },
      cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/webpack')
    },
    plugins: [
      ...(isAnalyze ? [new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html'
      })] : [])
    ],
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  };
};