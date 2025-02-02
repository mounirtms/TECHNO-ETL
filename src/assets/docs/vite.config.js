import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  base: '',
  
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    minify: 'esbuild',
    cssMinify: true,
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        etl: resolve(__dirname, 'src/ETL-integration.html'),
        jde: resolve(__dirname, 'src/jde-integration.html'),
        magento: resolve(__dirname, 'src/magento-integration.html'),
        cegid: resolve(__dirname, 'src/cegid-integration.html')
      },
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/media/[name].[hash][extname]`;
          }
          else if (/\.(png|jpe?g|gif|svg|ico|webp)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/images/[name].[hash][extname]`;
          }
          else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/fonts/[name].[hash][extname]`;
          }
          else if (/\.css$/i.test(assetInfo.name)) {
            return `assets/css/[name].[hash][extname]`;
          }
          else if (/\.js$/i.test(assetInfo.name)) {
            return `assets/js/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        },
        entryFileNames: 'assets/js/[name].[hash].js',
        chunkFileNames: 'assets/js/[name].[hash].js'
      }
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@images': resolve(__dirname, 'src/assets/images'),
      '@styles': resolve(__dirname, 'src/assets/styles'),
      '@scripts': resolve(__dirname, 'src/assets/scripts')
    }
  },
  
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
        cssnano({
          preset: ['default', {
            discardComments: { removeAll: true }
          }]
        })
      ]
    }
  },
  
  server: {
    port: 3000,
    open: true,
    cors: true
  }
});
