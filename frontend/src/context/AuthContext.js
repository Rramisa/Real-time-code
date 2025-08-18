import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Tiny inline presence helpers (keep code together here)
  const presenceOnline = async (authToken) => {
    try {
      await fetch('http://localhost:5001/api/presence/online', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
    } catch (e) {
      // ignore
    }
  };

  const presenceOffline = async (authToken, { keepalive = false } = {}) => {
    try {
      await fetch('http://localhost:5001/api/presence/offline', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
        keepalive
      });
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (token) {
      // Verify token and get user data
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        // Mark online immediately
        presenceOnline(data.token);
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const register = async (username, email, password, hometown, favoriteAnimal, dateOfBirth) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, hometown, favoriteAnimal, dateOfBirth })
      });

      const data = await response.json();

      if (response.ok) {
        // Don't automatically log in the user after registration
        // Just return success without setting token/user
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const resetPassword = async (email) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const verifySecurityQuestions = async (email, hometown, favoriteAnimal, dateOfBirth) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-security-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, hometown, favoriteAnimal, dateOfBirth })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const resetPasswordConfirm = async (resetToken, newPassword) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/reset-password-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resetToken, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = async () => {
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      // Mark offline immediately
      await presenceOffline(existingToken);
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Mark offline on tab close/refresh
  useEffect(() => {
    const handler = () => {
      const existingToken = localStorage.getItem('token');
      if (existingToken) {
        // Use keepalive so the request can complete during unload
        presenceOffline(existingToken, { keepalive: true });
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('http://localhost:5001/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile: profileData })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    verifySecurityQuestions,
    resetPasswordConfirm,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 