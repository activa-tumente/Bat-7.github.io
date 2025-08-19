
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/tailwind.css';
import './styles/global.css';
import AppRoutes from './routes/AppRoutes';
import useTheme from './hooks/useTheme';

function App() {
  useTheme();

  return (
    <div className="app">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AppRoutes />
    </div>
  );
}

export default App;

