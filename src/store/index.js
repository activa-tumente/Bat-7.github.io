import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Importar reducers
import testReducer from './slices/testSlice';

// Configuración de reducers
const rootReducer = {
  test: testReducer,
};

// Configuración del store
export const store = configureStore({
  reducer: rootReducer,
  // Middleware para serialización
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones y paths específicos si es necesario
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  // Configuración para desarrollo
  devTools: process.env.NODE_ENV !== 'production',
});

// Configuración para RTK Query
setupListeners(store.dispatch);

// Exportar tipos para cuando se use TypeScript
export const getRootState = store.getState;
export const getAppDispatch = store.dispatch;
