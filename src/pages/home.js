import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/editor');
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img className="auth-logo" src="/code-sync.png" width={150} height={150} alt="code-sync-logo"/>
          <h2>Welcome to CodeSync</h2>
          <p>Collaborative coding platform for teams</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Join our collaborative coding platform and start coding together in real-time.
          </p>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/login')}
              className="auth-button"
              style={{ flex: '1', minWidth: '120px' }}
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="auth-button"
              style={{ 
                flex: '1', 
                minWidth: '120px',
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
              }}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="auth-links">
          <p style={{ fontSize: '12px', color: '#999' }}>
            Built by Group 8 - CSE471
          </p>
          {user && (
            <button 
              onClick={handleLogout}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#ff4757',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
