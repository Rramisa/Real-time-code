import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    hometown: '',
    favoriteAnimal: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/editor');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || 
        !formData.hometown || !formData.favoriteAnimal || !formData.dateOfBirth) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await register(
      formData.username, 
      formData.email, 
      formData.password,
      formData.hometown,
      formData.favoriteAnimal,
      formData.dateOfBirth
    );
    
    if (result.success) {
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } else {
      toast.error(result.message || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img className="auth-logo" src="/code-sync.png" width={80} height={80} alt="code-sync-logo"/>
          <h2>Create Account</h2>
          <p>Join our collaborative coding platform</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hometown">What's your hometown?</label>
            <input
              type="text"
              id="hometown"
              name="hometown"
              value={formData.hometown}
              onChange={handleChange}
              placeholder="Enter your hometown"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="favoriteAnimal">What's your favorite animal?</label>
            <input
              type="text"
              id="favoriteAnimal"
              name="favoriteAnimal"
              value={formData.favoriteAnimal}
              onChange={handleChange}
              placeholder="Enter your favorite animal"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Sign in
            </Link>
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

export default Register; 