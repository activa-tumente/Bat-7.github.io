/**
 * Configuración para la conexión a Supabase
 */
export const supabaseConfig = {
  // Habilitar o deshabilitar Supabase
  enabled: true,
  
  // Timeout para las operaciones (en milisegundos)
  timeout: 10000,
  
  // Configuración para reconexión automática
  reconnect: {
    enabled: true,
    maxAttempts: 3,
    delay: 5000
  },
  
  // Configuración para caché
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000 // 5 minutos
  },
  
  // Configuración para logs
  logs: {
    enabled: true,
    level: 'info' // 'debug', 'info', 'warn', 'error'
  }
};
