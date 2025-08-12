import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [hometown, setHometown] = useState('');
  const [favoriteAnimal, setFavoriteAnimal] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: security questions, 3: new password
  const { resetPassword, verifySecurityQuestions, resetPasswordConfirm, user, logout } = useAuth();
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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    
    if (result.success) {
      setStep(2);
      toast.success('User found! Please answer your security questions.');
    } else {
      toast.error(result.message || 'User not found');
    }
    
    setLoading(false);
  };

  const handleSecurityQuestionsSubmit = async (e) => {
    e.preventDefault();
    
    if (!hometown || !favoriteAnimal || !dateOfBirth) {
      toast.error('Please answer all security questions');
      return;
    }

    setLoading(true);
    const result = await verifySecurityQuestions(email, hometown, favoriteAnimal, dateOfBirth);
    
    if (result.success) {
      setResetToken(result.data.resetToken);
      setStep(3);
      toast.success('Security questions verified! Set your new password.');
    } else {
      toast.error(result.message || 'Security questions incorrect');
    }
    
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await resetPasswordConfirm(resetToken, newPassword);
    
    if (result.success) {
      toast.success('Password reset successful!');
      navigate('/login');
    } else {
      toast.error(result.message || 'Failed to reset password');
    }
    
    setLoading(false);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Reset Password';
      case 2:
        return 'Security Questions';
      case 3:
        return 'Set New Password';
      default:
        return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Enter your email to start password reset';
      case 2:
        return 'Answer your security questions to verify your identity';
      case 3:
        return 'Enter your new password';
      default:
        return 'Reset your password';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img className="auth-logo" src="/code-sync.png" width={80} height={80} alt="code-sync-logo"/>
          <h2>{getStepTitle()}</h2>
          <p>{getStepDescription()}</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSecurityQuestionsSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="hometown">What's your hometown?</label>
              <input
                type="text"
                id="hometown"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                placeholder="Enter your hometown"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="favoriteAnimal">What's your favorite animal?</label>
              <input
                type="text"
                id="favoriteAnimal"
                value={favoriteAnimal}
                onChange={(e) => setFavoriteAnimal(e.target.value)}
                placeholder="Enter your favorite animal"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify Questions'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-links">
          <Link to="/login" className="link">
            Back to Login
          </Link>
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

export default ForgotPassword; 