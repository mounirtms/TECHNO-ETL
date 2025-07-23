const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './server.js',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        type: 'commonjs2'
      },
      environment: {
        module: false
      }
    },
    ignoreWarnings: [
      {
        message: /Critical dependency/
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
            compress: { drop_console: true },
            format: { comments: false }
          }
        })
      ] : [],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\/]node_modules[\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      },
      runtimeChunk: 'single'
    },
    target: 'node',
    resolve: {
      extensions: ['.js']
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
    externals: [nodeExternals()],
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename]
      }
    }
  };
};