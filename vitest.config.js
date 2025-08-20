import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Configuración del entorno de testing
    environment: 'jsdom',
    
    // Archivos de configuración global
    setupFiles: ['./src/test/setup.js'],
    
    // Patrones de archivos de test
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'tests/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    
    // Archivos a excluir
    exclude: [
      'node_modules',
      'dist',
      'cypress',
      'src/test/mocks',
      'src/test/fixtures'
    ],
    
    // Configuración de coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
        'src/**/*.config.{js,ts}',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/main.jsx',
        'src/vite-env.d.ts',
        'cypress/',
        'dist/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // Configuración de globals
    globals: true,
    
    // Timeout para tests
    testTimeout: 10000,
    
    // Configuración de reporters
    reporter: ['verbose', 'json', 'html'],
    
    // Configuración de watch
    watch: {
      exclude: ['node_modules/**', 'dist/**', 'coverage/**']
    },
    
    // Configuración de mock
    clearMocks: true,
    restoreMocks: true,
    
    // Configuración de alias
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './src/test'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@services': resolve(__dirname, './src/services')
    }
  },
  
  // Configuración para resolver módulos
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './src/test'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@services': resolve(__dirname, './src/services')
    }
  }
});
