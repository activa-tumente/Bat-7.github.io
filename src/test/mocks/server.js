import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Servidor de mocks para testing
 * Intercepta las llamadas HTTP durante los tests
 */
export const server = setupServer(...handlers);
