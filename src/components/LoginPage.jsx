import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';
import { HiBuildingOffice2 } from 'react-icons/hi2';
import { authAPI } from '../services/api';
import logo from '../assets/lnv-logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in both email and password');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔐 Login attempt with:', email);
      
      // API call
      const response = await authAPI.login(email, password);
      
      console.log('🔐 Login API response:', response);
      
      // Debug: Check localStorage after login
      console.log('🔐 localStorage after login:', {
        authToken: localStorage.getItem('authToken'),
        user: localStorage.getItem('user')
      });
      
      // Check if login was successful
      if (response.success) {
        console.log('✅ Login successful!');
        console.log('✅ User data stored:', response.user);
        console.log('✅ Token stored:', response.token ? 'Yes' : 'No');
        
        // Force page reload to ensure auth state is updated
        setTimeout(() => {
          console.log('✅ Redirecting to /home');
          window.location.href = '/home';
        }, 500);
        
      } else {
        console.log('❌ Login failed:', response.message);
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login catch error:', error);
      
      // Handle different error formats
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.status) {
        errorMessage = error.response.data.status;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Debug: Check current auth state
  const checkAuthState = () => {
    console.log('🔍 Current auth state check:');
    console.log('🔍 localStorage keys:', Object.keys(localStorage));
    console.log('🔍 authToken:', localStorage.getItem('authToken'));
    console.log('🔍 user:', localStorage.getItem('user'));
    console.log('🔍 authAPI.isAuthenticated():', authAPI.isAuthenticated());
    console.log('🔍 authAPI.getCurrentUser():', authAPI.getCurrentUser());
    
    alert(
      `Auth State Check:\n` +
      `Token: ${localStorage.getItem('authToken') ? 'Exists' : 'Missing'}\n` +
      `User: ${localStorage.getItem('user') ? 'Exists' : 'Missing'}\n` +
      `isAuthenticated: ${authAPI.isAuthenticated()}\n` +
      `Check console for details`
    );
  };

  const handleTestLogin = () => {
    setEmail('abc');
    setPassword('admin');
    alert('Test credentials filled. Click Sign In to login.');
  };

  return (
    <div className="ios-auth-container">
      <div className="ios-status-bar"></div>

      <div className="ios-auth-content">
        <div className="ios-auth-header">
          <div className="ios-company-logo">
            <img src={logo} alt="LNV Group" />
            <div className="ios-company-badge">
              <HiBuildingOffice2 size={20} />
            </div>
          </div>
          <h1 className="ios-auth-title">Welcome Back</h1>
          <p className="ios-auth-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div className="ios-error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="ios-auth-form">
          <div className="ios-input-group">
            <div className="ios-input-label">
              <HiMail size={18} className="ios-input-icon" />
              <label>Username</label>
            </div>
            <input
              type="text"
              className="ios-text-input"
              placeholder="Enter your username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="username"
            />
          </div>

          <div className="ios-input-group">
            <div className="ios-input-label">
              <HiLockClosed size={18} className="ios-input-icon" />
              <label>Password</label>
            </div>
            <input
              type="password"
              className="ios-text-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="current-password"
            />
            {/* <a href="#" className="ios-forgot-link">Forgot Password?</a> */}
          </div>

          <div className="ios-remember-group">
            <label className="ios-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="ios-checkmark"></span>
              Remember me
            </label>
          </div>

          <button 
            type="submit" 
            className="ios-primary-button"
            disabled={loading}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In</span>
                <HiArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Debug Buttons */}
        {/* <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleTestLogin}
            className="ios-secondary-button"
            style={{ padding: '10px 20px' }}
          >
            Fill Test Credentials
          </button>
          
          <button
            onClick={checkAuthState}
            className="ios-secondary-button"
            style={{ 
              padding: '10px 20px',
              background: '#007AFF',
              color: 'white'
            }}
          >
            Check Auth State
          </button>
        </div> */}
        
        {/* <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
          Username: abc | Password: admin
        </p> */}

        <div className="ios-auth-footer">
          <p>Don't have an account? <a href="#" className="ios-link">Contact HR</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;