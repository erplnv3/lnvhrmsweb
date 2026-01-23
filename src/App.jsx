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





// import React, { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import LoginPage from "./components/LoginPage";
// import HomePage from "./components/HomePage";
// import ProfilePage from "./components/ProfilePage";

// // iOS Device Check Component
// const iOSCheckComponent = () => {
//   const [isIOS, setIsIOS] = useState(false);
//   const [isChecking, setIsChecking] = useState(true);

//   useEffect(() => {
//     const checkIOSDevice = () => {
//       const userAgent = window.navigator.userAgent.toLowerCase();
//       const platform = window.navigator.platform;
      
//       console.log('📱 User Agent:', userAgent);
//       console.log('📱 Platform:', platform);
      
//       // Check for iOS devices (iPhone, iPad, iPod)
//       const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      
//       // Check for iOS Safari
//       const isIOSSafari = 
//         /safari/.test(userAgent) && 
//         /applewebkit/.test(userAgent) && 
//         !/chrome|chromium|edg|opr|brave|vivaldi/.test(userAgent) &&
//         (isIOSDevice || /mac/.test(platform));
      
//       // Check for iPad on iOS 13+ (MacIntel with touch)
//       const isIpad = 
//         platform === 'MacIntel' && 
//         navigator.maxTouchPoints > 1;
      
//       // Check for iOS Chrome (still shows as Safari)
//       const isIOSChrome = 
//         /crios/.test(userAgent) || // Chrome on iOS
//         (isIOSDevice && /chrome/.test(userAgent));
      
//       // Final check
//       const isAppleDevice = 
//         isIOSDevice || 
//         isIpad || 
//         isIOSSafari || 
//         isIOSChrome ||
//         platform.includes('iPhone') ||
//         platform.includes('iPad') ||
//         platform.includes('iPod');
      
//       console.log('📱 Is iOS Device:', isAppleDevice);
//       console.log('📱 Max Touch Points:', navigator.maxTouchPoints);
//       console.log('📱 Platform:', platform);
      
//       setIsIOS(isAppleDevice);
//       setIsChecking(false);
      
//       // Save to localStorage
//       localStorage.setItem('isIOSDevice', isAppleDevice.toString());
//     };
    
//     checkIOSDevice();
//   }, []);

//   if (isChecking) {
//     return (
//       <div className="ios-loading-screen">
//         <div className="ios-spinner-large"></div>
//         <p>Checking device compatibility...</p>
//       </div>
//     );
//   }

//   if (!isIOS) {
//     return (
//       <div className="ios-error-screen">
//         <div className="ios-error-icon">📱</div>
//         <h1>iOS Device Required</h1>
//         <p className="ios-error-message">
//           This application is designed specifically for iOS devices (iPhone, iPad, iPod).
//         </p>
//         <div className="ios-error-details">
//           <p>Your device: <strong>{navigator.userAgent}</strong></p>
//           <p>Please open this app on an iOS device.</p>
//         </div>
//         <div className="ios-device-list">
//           <h3>Compatible Devices:</h3>
//           <ul>
//             <li>📱 iPhone 8 and later</li>
//             <li>📱 iPad (all models)</li>
//             <li>📱 iPod Touch</li>
//           </ul>
//         </div>
//         <p className="ios-contact-note">
//           For assistance, please contact your administrator.
//         </p>
//       </div>
//     );
//   }

//   return null; // Allow app to proceed if iOS
// };

// // PWA Install Button Component
// const PWAInstallButton = () => {
//   const handleInstall = async () => {
//     const promptEvent = window.deferredPrompt;
//     if (!promptEvent) return;
    
//     promptEvent.prompt();
//     const result = await promptEvent.userChoice;
//     console.log('User choice:', result);
//     window.deferredPrompt = null;
//   };

//   return (
//     <button 
//       id="install-btn"
//       className="ios-install-button"
//       onClick={handleInstall}
//       style={{ display: 'none' }}
//     >
//       Install App
//     </button>
//   );
// };

// // SIMPLE Protected Route - FIXED VERSION
// const ProtectedRoute = ({ children }) => {
//   const [authChecked, setAuthChecked] = useState(false);
  
//   useEffect(() => {
//     console.log('🔐 ProtectedRoute: Checking authentication...');
    
//     // Simple and reliable auth check
//     const checkAuth = () => {
//       const token = localStorage.getItem('authToken');
//       const userStr = localStorage.getItem('user');
      
//       console.log('🔐 Auth check details:', {
//         hasToken: !!token,
//         hasUser: !!userStr,
//         tokenLength: token?.length || 0,
//         path: window.location.pathname
//       });
      
//       // Check if we have both token and user
//       if (token && userStr) {
//         try {
//           const user = JSON.parse(userStr);
//           // Check if user has at least one identifier
//           const hasValidUser = user && (
//             user.id || 
//             user.userId || 
//             user.username || 
//             user.email
//           );
          
//           if (hasValidUser) {
//             console.log('✅ Authentication valid');
//             setAuthChecked(true);
//             return;
//           }
//         } catch (error) {
//           console.error('🔐 Error parsing user:', error);
//         }
//       }
      
//       // If we get here, auth is invalid
//       console.log('❌ Authentication invalid, redirecting to login');
      
//       // Clear invalid data
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('user');
      
//       // Use window.location for immediate redirect
//       setTimeout(() => {
//         window.location.href = '/login';
//       }, 100);
//     };
    
//     checkAuth();
//   }, []);
  
//   // Show loading while checking
//   if (!authChecked) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         background: '#f5f5f7'
//       }}>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{
//             width: '40px',
//             height: '40px',
//             border: '3px solid #f3f3f3',
//             borderTop: '3px solid #007AFF',
//             borderRadius: '50%',
//             animation: 'spin 1s linear infinite',
//             margin: '0 auto 20px'
//           }}></div>
//           <p style={{ color: '#8E8E93', fontSize: '14px' }}>Verifying authentication...</p>
//         </div>
//         <style>{`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//       </div>
//     );
//   }
  
//   console.log('🔐 Rendering protected content');
//   return children;
// };

// // App Component
// function App() {
//   const [initialized, setInitialized] = useState(false);
//   const [deviceCheckPassed, setDeviceCheckPassed] = useState(false);
  
//   useEffect(() => {
//     console.log('🚀 App mounted');
    
//     // First check if device is iOS
//     const checkDevice = () => {
//       const userAgent = navigator.userAgent.toLowerCase();
//       const platform = navigator.platform;
      
//       const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
//       const isIpad = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
//       const isAppleDevice = isIOSDevice || isIpad;
      
//       console.log('📱 Device Check Result:', isAppleDevice);
      
//       if (!isAppleDevice) {
//         console.log('📱 Non-iOS device detected, showing error');
//         setDeviceCheckPassed(false);
//         return false;
//       }
      
//       setDeviceCheckPassed(true);
//       return true;
//     };
    
//     if (!checkDevice()) {
//       setInitialized(true);
//       return;
//     }
    
//     console.log('🚀 Initial path:', window.location.pathname);
//     console.log('🚀 Initial localStorage:', {
//       authToken: localStorage.getItem('authToken') ? 'Exists' : 'Missing',
//       user: localStorage.getItem('user') ? 'Exists' : 'Missing'
//     });
    
//     // Handle initial routing
//     const handleInitialRoute = () => {
//       const currentPath = window.location.pathname;
//       const token = localStorage.getItem('authToken');
//       const userStr = localStorage.getItem('user');
      
//       console.log('🚀 Route check:', {
//         currentPath,
//         hasToken: !!token,
//         hasUser: !!userStr
//       });
      
//       // If user is on login page but already authenticated
//       if (currentPath === '/login' && token && userStr) {
//         try {
//           const user = JSON.parse(userStr);
//           if (user && (user.id || user.userId || user.username || user.email)) {
//             console.log('🚀 Already authenticated, redirecting to home');
//             // Use replaceState to avoid history entry
//             window.history.replaceState(null, '', '/home');
//             // Force reload to trigger ProtectedRoute
//             window.location.href = '/home';
//             return;
//           }
//         } catch (error) {
//           console.error('🚀 Error parsing user:', error);
//         }
//       }
      
//       // If user is on protected route but not authenticated
//       if ((currentPath === '/home' || currentPath === '/profile') && (!token || !userStr)) {
//         console.log('🚀 Not authenticated, redirecting to login');
//         window.history.replaceState(null, '', '/login');
//         window.location.href = '/login';
//         return;
//       }
      
//       setInitialized(true);
//     };
    
//     // Small delay to ensure everything is loaded
//     setTimeout(handleInitialRoute, 100);
    
//     // Enable scrolling
//     document.body.style.overflow = 'auto';
//     document.documentElement.style.overflow = 'auto';
    
//   }, []);
  
//   // Show loading during initialization
//   if (!initialized) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '100vh',
//         background: '#f5f5f7'
//       }}>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{
//             width: '50px',
//             height: '50px',
//             border: '4px solid #f3f3f3',
//             borderTop: '4px solid #007AFF',
//             borderRadius: '50%',
//             animation: 'spin 1s linear infinite',
//             margin: '0 auto 20px'
//           }}></div>
//           <p style={{ color: '#8E8E93', fontSize: '16px', fontWeight: '500' }}>Loading Attendance App...</p>
//         </div>
//         <style>{`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//       </div>
//     );
//   }
  
//   // If device check failed, show iOS error
//   if (!deviceCheckPassed) {
//     return <iOSCheckComponent />;
//   }
  
//   console.log('🚀 App rendering...');
  
//   return (
//     <Router>
//       <div className="App">
//         <PWAInstallButton />
        
//         <Routes>
//           {/* Login Route - Always accessible */}
//           <Route path="/login" element={<LoginPage />} />
          
//           {/* Protected Routes */}
//           <Route path="/home" element={
//             <ProtectedRoute>
//               <HomePage />
//             </ProtectedRoute>
//           } />
          
//           <Route path="/profile" element={
//             <ProtectedRoute>
//               <ProfilePage />
//             </ProtectedRoute>
//           } />
          
//           {/* Default Route */}
//           <Route path="/" element={
//             <Navigate to="/home" replace />
//           } />
          
//           {/* Catch-all Route */}
//           <Route path="*" element={
//             <Navigate to="/home" replace />
//           } />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// // CSS for iOS error screen (add to App.css)
// const iOSErrorStyles = `
// .ios-loading-screen,
// .ios-error-screen {
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
//   height: 100vh;
//   padding: 30px;
//   text-align: center;
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   color: white;
// }

// .ios-spinner-large {
//   width: 60px;
//   height: 60px;
//   border: 4px solid rgba(255,255,255,0.3);
//   border-top: 4px solid white;
//   border-radius: 50%;
//   animation: spin 1s linear infinite;
//   margin-bottom: 20px;
// }

// .ios-error-icon {
//   font-size: 80px;
//   margin-bottom: 20px;
// }

// .ios-error-screen h1 {
//   font-size: 28px;
//   margin-bottom: 15px;
//   font-weight: 700;
// }

// .ios-error-message {
//   font-size: 16px;
//   margin-bottom: 25px;
//   opacity: 0.9;
//   max-width: 500px;
//   line-height: 1.5;
// }

// .ios-error-details {
//   background: rgba(255,255,255,0.1);
//   padding: 15px;
//   border-radius: 12px;
//   margin-bottom: 20px;
//   max-width: 500px;
//   width: 100%;
// }

// .ios-error-details p {
//   margin: 8px 0;
//   font-size: 14px;
// }

// .ios-error-details strong {
//   color: #FFD700;
// }

// .ios-device-list {
//   background: rgba(255,255,255,0.1);
//   padding: 15px;
//   border-radius: 12px;
//   margin-bottom: 20px;
//   max-width: 500px;
//   width: 100%;
// }

// .ios-device-list h3 {
//   margin-bottom: 10px;
//   font-size: 18px;
// }

// .ios-device-list ul {
//   list-style: none;
//   padding: 0;
//   text-align: left;
// }

// .ios-device-list li {
//   padding: 8px 0;
//   font-size: 15px;
//   border-bottom: 1px solid rgba(255,255,255,0.1);
// }

// .ios-device-list li:last-child {
//   border-bottom: none;
// }

// .ios-contact-note {
//   font-size: 14px;
//   opacity: 0.8;
//   margin-top: 20px;
// }

// @keyframes spin {
//   0% { transform: rotate(0deg); }
//   100% { transform: rotate(360deg); }
// }

// @media (max-width: 480px) {
//   .ios-error-screen h1 {
//     font-size: 24px;
//   }
  
//   .ios-error-message {
//     font-size: 14px;
//   }
// }
// `;

// // Add styles to document
// if (typeof document !== 'undefined') {
//   const style = document.createElement('style');
//   style.textContent = iOSErrorStyles;
//   document.head.appendChild(style);
// }

// export default App;