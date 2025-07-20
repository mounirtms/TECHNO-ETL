import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  entry: './server.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  target: 'node',
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'queries/*.sql', to: 'queries/[name][ext]', context: path.resolve(__dirname) },
        { from: 'start-server.js', to: 'start-server.js', context: path.resolve(__dirname) },
        { from: 'package.json', to: 'package.json', context: path.resolve(__dirname) }
      ],
    }),
  ],
  ignoreWarnings: [
    {
      message: /Critical dependency: the request of a dependency is an expression/
    }
  ]
};