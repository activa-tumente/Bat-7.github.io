import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Configuración base para despliegue en GitHub Pages
  base: '/Bat-7/',
  plugins: [react()],

  // Opciones de Build
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: false,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    target: 'es2015'
  },

  // Optimizaciones de desarrollo
  server: {
    port: 5173,
    host: true,
    strictPort: false
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@context': path.resolve(__dirname, './src/context'),
      '@assets': path.resolve(__dirname, './src/assets')
    },
  },
});
