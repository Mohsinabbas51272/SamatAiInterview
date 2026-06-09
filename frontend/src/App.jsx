import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from './components/UI/Toast';

function App() {
  return (
    <>
      <ToastContainer />
      <AppRoutes />
    </>
  );
}

export default App;
