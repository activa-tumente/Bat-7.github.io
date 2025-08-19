import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Configuración global para todos los tests

// Limpiar después de cada test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Configurar MSW (Mock Service Worker)
beforeAll(() => {
  // Iniciar el servidor de mocks
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  // Resetear handlers después de cada test
  server.resetHandlers();
});

afterAll(() => {
  // Cerrar el servidor después de todos los tests
  server.close();
});

// Mock de módulos globales
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null
    })),
    useParams: vi.fn(() => ({}))
  };
});

// Mock de react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    warn: vi.fn()
  },
  ToastContainer: vi.fn(() => null)
}));

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de fetch si no está disponible
if (!global.fetch) {
  global.fetch = vi.fn();
}

// Configuración de console para tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Silenciar errores esperados en tests
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: An invalid form control'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps has been renamed')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Utilidades de testing globales
global.testUtils = {
  // Función para crear un mock de usuario
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    nombre: 'Test',
    apellido: 'User',
    tipo_usuario: 'estudiante',
    ...overrides
  }),

  // Función para crear un mock de cuestionario
  createMockQuestionnaire: (overrides = {}) => ({
    id: 'test-questionnaire-id',
    title: 'Test Questionnaire',
    description: 'Test description',
    duration: 30,
    questions: [],
    ...overrides
  }),

  // Función para crear un mock de respuesta
  createMockResponse: (overrides = {}) => ({
    id: 'test-response-id',
    questionnaireId: 'test-questionnaire-id',
    userId: 'test-user-id',
    answers: {},
    score: 85,
    completedAt: new Date().toISOString(),
    ...overrides
  }),

  // Función para esperar por elementos async
  waitFor: async (callback, options = {}) => {
    const { timeout = 1000, interval = 50 } = options;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await callback();
        if (result) return result;
      } catch (error) {
        // Continuar intentando
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Timeout after ${timeout}ms`);
  }
};

// Configuración de variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.VITE_ENABLE_AUDIT_LOGGING = 'false';
