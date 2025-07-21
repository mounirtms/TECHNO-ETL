import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/docs/', // Use relative paths
  publicDir: 'assets', // Directory for public assets
  build: {
    outDir: 'dist', // Output directory for build files
    emptyOutDir: true, // Clear the output directory before building
    minify: 'esbuild', // Minification method
    cssMinify: true, // Minify CSS
    assetsDir: '', // No specific assets directory since we only have images
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
           if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `fonts/[name].[hash][extname]`;
          }
          else if (/\.css$/i.test(assetInfo.name)) {
            return `css/[name].[hash][extname]`;
          }
          return `[name].[hash][extname]`; // Default
        },
        chunkFileNames: 'js/[name].[hash].js', // Chunk file names
        entryFileNames: 'js/[name].[hash].js' // Entry file names
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url))
    }
  },
  server: {
    port: 3000, // Development server port
    open: true // Open the browser on server start
  }
});