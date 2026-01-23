import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";

// PWA Install Button Component
const PWAInstallButton = () => {
  const handleInstall = async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;
    
    promptEvent.prompt();
    const result = await promptEvent.userChoice;
    console.log('User choice:', result);
    window.deferredPrompt = null;
  };

  return (
    <button 
      id="install-btn"
      className="ios-install-button"
      onClick={handleInstall}
      style={{ display: 'none' }}
    >
      Install App
    </button>
  );
};

// SIMPLE Protected Route - FIXED VERSION
const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    console.log('🔐 ProtectedRoute: Checking authentication...');
    
    // Simple and reliable auth check
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      
      console.log('🔐 Auth check details:', {
        hasToken: !!token,
        hasUser: !!userStr,
        tokenLength: token?.length || 0,
        path: window.location.pathname
      });
      
      // Check if we have both token and user
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          // Check if user has at least one identifier
          const hasValidUser = user && (
            user.id || 
            user.userId || 
            user.username || 
            user.email
          );
          
          if (hasValidUser) {
            console.log('✅ Authentication valid');
            setAuthChecked(true);
            return;
          }
        } catch (error) {
          console.error('🔐 Error parsing user:', error);
        }
      }
      
      // If we get here, auth is invalid
      console.log('❌ Authentication invalid, redirecting to login');
      
      // Clear invalid data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Use window.location for immediate redirect
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    };
    
    checkAuth();
  }, []);
  
  // Show loading while checking
  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f7'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #007AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#8E8E93', fontSize: '14px' }}>Verifying authentication...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  console.log('🔐 Rendering protected content');
  return children;
};

// App Component - SIMPLIFIED
function App() {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    console.log('🚀 App mounted');
    console.log('🚀 Initial path:', window.location.pathname);
    console.log('🚀 Initial localStorage:', {
      authToken: localStorage.getItem('authToken') ? 'Exists' : 'Missing',
      user: localStorage.getItem('user') ? 'Exists' : 'Missing'
    });
    
    // Handle initial routing
    const handleInitialRoute = () => {
      const currentPath = window.location.pathname;
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      
      console.log('🚀 Route check:', {
        currentPath,
        hasToken: !!token,
        hasUser: !!userStr
      });
      
      // If user is on login page but already authenticated
      if (currentPath === '/login' && token && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && (user.id || user.userId || user.username || user.email)) {
            console.log('🚀 Already authenticated, redirecting to home');
            // Use replaceState to avoid history entry
            window.history.replaceState(null, '', '/home');
            // Force reload to trigger ProtectedRoute
            window.location.href = '/home';
            return;
          }
        } catch (error) {
          console.error('🚀 Error parsing user:', error);
        }
      }
      
      // If user is on protected route but not authenticated
      if ((currentPath === '/home' || currentPath === '/profile') && (!token || !userStr)) {
        console.log('🚀 Not authenticated, redirecting to login');
        window.history.replaceState(null, '', '/login');
        window.location.href = '/login';
        return;
      }
      
      setInitialized(true);
    };
    
    // Small delay to ensure everything is loaded
    setTimeout(handleInitialRoute, 100);
    
    // Enable scrolling
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
  }, []);
  
  // Show loading during initialization
  if (!initialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f7'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#8E8E93', fontSize: '16px', fontWeight: '500' }}>Loading Attendance App...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  console.log('🚀 App rendering...');
  
  return (
    <Router>
      <div className="App">
        <PWAInstallButton />
        
        <Routes>
          {/* Login Route - Always accessible */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Default Route */}
          <Route path="/" element={
            <Navigate to="/home" replace />
          } />
          
          {/* Catch-all Route */}
          <Route path="*" element={
            <Navigate to="/home" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;