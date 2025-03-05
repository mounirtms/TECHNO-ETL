const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './server.js', // Your main entry point
  output: {
    filename: 'index.js', // Output file name
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  target: 'node', // Since this is a Node.js application
  resolve: {
    extensions: ['.js'], // Resolve .js files
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'queries/*.sql', to: 'queries/[name][ext]', context: path.resolve(__dirname) } // Copy all SQL files
      ],
    }),
  ],
};