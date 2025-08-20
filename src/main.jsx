import React from 'react';
import ReactDOM from 'react-dom/client';
// import SimpleApp from './SimpleApp.jsx';
// import TestApp from './TestApp.jsx';
import { Provider } from 'react-redux';
import { store } from './store';
import { NoAuthProvider } from './context/NoAuthContext';
import App from './App.jsx';
import './index.css';
import './styles/page-effects.css';

// Aplicación sin autenticación para desarrollo
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <NoAuthProvider>
        <App />
      </NoAuthProvider>
    </Provider>
  </React.StrictMode>,
);

// Aplicación completa (usar cuando Supabase esté configurado)
/*
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <SafeAuthProvider>
        <App />
      </SafeAuthProvider>
    </Provider>
  </React.StrictMode>,
);
*/

// Aplicación completa (comentada temporalmente)
/*
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
);
*/

// Versión completa (comentada temporalmente)
/*
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>,
);
*/
