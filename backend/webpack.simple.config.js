import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

export default (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      server: './server.js',
      'cron-runner': './cron-runner.js'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(process.cwd(), 'dist'),
      library: {
        type: 'commonjs2'
      },
      environment: {
        module: false
      },
      clean: true
    },
    target: 'node',
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
    
    // Simple externals without webpack-node-externals
    externals: {
      // Mark all node_modules as external
      'express': 'commonjs express',
      'cors': 'commonjs cors',
      'helmet': 'commonjs helmet',
      'compression': 'commonjs compression',
      'connect-timeout': 'commonjs connect-timeout',
      'express-rate-limit': 'commonjs express-rate-limit',
      'dotenv': 'commonjs dotenv',
      'mssql': 'commonjs mssql',
      'ioredis': 'commonjs ioredis',
      'axios': 'commonjs axios',
      'got': 'commonjs got',
      'joi': 'commonjs joi',
      'morgan': 'commonjs morgan',
      'winston': 'commonjs winston',
      'winston-daily-rotate-file': 'commonjs winston-daily-rotate-file',
      'node-cache': 'commonjs node-cache',
      'node-cron': 'commonjs node-cron',
      'bullmq': 'commonjs bullmq'
    },
    
    resolve: {
      extensions: ['.js', '.mjs'],
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
        '@services': path.resolve(process.cwd(), 'src/services'),
        '@utils': path.resolve(process.cwd(), 'src/utils'),
        '@middleware': path.resolve(process.cwd(), 'src/middleware'),
        '@routes': path.resolve(process.cwd(), 'src/routes')
      }
    },
    
    optimization: {
      minimize: isProduction,
      minimizer: isProduction ? [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            ecma: 2020,
            compress: {
              drop_console: false, // Keep console logs for debugging
              drop_debugger: true,
              passes: 1
            },
            format: {
              comments: false,
              beautify: false
            }
          },
          extractComments: false
        })
      ] : []
    },
    
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    },
    
    performance: {
      hints: false // Disable performance hints for Node.js builds
    }
  };
};
