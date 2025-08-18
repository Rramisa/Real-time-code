
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ErrorBoundary from './components/ErrorBoundary';

import VSCodeLayout from './components/VSCodeLayout';
import { Toaster } from 'react-hot-toast';
import Status from './pages/Status';

// Import verification for development
if (process.env.NODE_ENV === 'development') {
  import('./verification').then(module => {
    window.verifyReactSetup = module.verifyReactSetup;
  });
}

// Global error handler for script errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Prevent the default browser error handling
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the default browser error handling
  event.preventDefault();
});

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div>
          <Toaster 
            position="top-center" 
            toastOptions={{
              success: {
                theme: {
                  primary: '#4aed88'
                }
              }
            }}
          />
        </div>
        <BrowserRouter>
          <Routes> 
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/forgot-password" element={<ForgotPassword/>} />
            <Route 
              path="/status" 
              element={
                <ProtectedRoute>
                  <Status/>
                </ProtectedRoute>
              } 
            />
                      <Route 
              path="/editor" 
              element={
                <ProtectedRoute>
                  <VSCodeLayout/>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
