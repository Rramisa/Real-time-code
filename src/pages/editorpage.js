import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Client from '../components/Client';
import Editor from '../components/editor';
import toast from 'react-hot-toast';

const Editorpage = () => {
  const [clients, setClients] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Debug: Log user object to see if it's being passed correctly
  console.log('Editor page - User object:', user);

  const handleLeaveRoom = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img
              className="logoImage"
              src="/code-sync.png"
              width={150} 
              height={150}
              alt="logo"
            />
          </div>
          <h3>Connected Users</h3>
          <div className='clientsList'>
            {clients.length > 0 ? (
              clients.map((client) => (
                <Client 
                  key={client.socketID} 
                  username={client.username} 
                />
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#666', 
                fontSize: '14px',
                padding: '20px'
              }}>
                No other users connected
              </div>
            )}
          </div>
        </div>
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid #424242', 
          marginTop: 'auto',
          backgroundColor: '#1c1e29',
          position: 'sticky',
          bottom: '0',
          zIndex: '1000'
        }}>
          <div style={{ 
            marginBottom: '15px', 
            fontSize: '16px', 
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            Welcome, {user?.username || 'User'}!
          </div>
          <div style={{ 
            marginBottom: '15px', 
            fontSize: '12px', 
            color: '#888',
            textAlign: 'center'
          }}>
            {user?.email || 'user@example.com'}
          </div>
          <button 
            onClick={handleLeaveRoom}
            style={{
              backgroundColor: '#ff4757',
              color: 'white',
              fontWeight: 'bold',
              width: '100%',
              padding: '15px',
              border: '2px solid #fff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            🚪 LOGOUT
          </button>
          {/* Debug info */}
          <div style={{ 
            marginTop: '10px', 
            fontSize: '10px', 
            color: '#666',
            textAlign: 'center'
          }}>
            User ID: {user?.id || 'Not set'}
          </div>
        </div>
      </div>
      <div className="editorWrap">
        <Editor />
      </div>
    </div>
  );
};

export default Editorpage;
