
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';


import VSCodeLayout from './components/VSCodeLayout';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
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
  );
}

export default App;
