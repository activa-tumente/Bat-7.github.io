import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Configuración básica
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Configuración de archivos
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // Configuración de video y screenshots
    video: true,
    screenshotOnRunFailure: true,
    
    // Configuración de retry
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Variables de entorno
    env: {
      // URLs de la aplicación
      loginUrl: '/login',
      homeUrl: '/home',
      adminUrl: '/admin',
      
      // Credenciales de prueba
      adminEmail: 'admin@bat7.test',
      adminPassword: 'Test123!',
      psychologistEmail: 'psicologo@bat7.test',
      psychologistPassword: 'Test123!',
      studentEmail: 'candidato@bat7.test',
      studentPassword: 'Test123!',
      
      // Configuración de API
      apiUrl: 'http://localhost:5173/api',
      
      // Configuración de testing
      coverage: true
    },
    
    setupNodeEvents(on, config) {
      // Configuración de plugins
      
      // Plugin de coverage
      require('@cypress/code-coverage/task')(on, config);
      
      // Plugin para limpiar base de datos
      on('task', {
        'db:seed': () => {
          // Aquí implementarías la lógica para sembrar la BD de prueba
          return null;
        },
        'db:clean': () => {
          // Aquí implementarías la lógica para limpiar la BD de prueba
          return null;
        }
      });
      
      // Plugin para logs
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js',
    indexHtmlFile: 'cypress/support/component-index.html'
  },
});
