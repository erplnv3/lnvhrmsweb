// import React, { useEffect, useState } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import LoginPage from "./components/LoginPage";
// import HomePage from "./components/HomePage";
// import ProfilePage from "./components/ProfilePage";

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

// // App Component - SIMPLIFIED
// function App() {
//   const [initialized, setInitialized] = useState(false);
  
//   useEffect(() => {
//     console.log('🚀 App mounted');
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

// export default App;





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






import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";

// Windows/Android Device Check Component
const NoniOSCheckComponent = () => {
  const [isNonIOS, setIsNonIOS] = useState(false); 
  const [showWarning, setShowWarning] = useState(true);
  
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const platform = window.navigator.platform;
      
      console.log('📱 Non-iOS Check:');
      console.log('📱 User Agent:', userAgent);
      console.log('📱 Platform:', platform);
      
      // Check for Windows
      const isWindows = /windows/.test(userAgent) || platform.includes('Win');
      
      // Check for Android
      const isAndroid = /android/.test(userAgent) || /linux arm/.test(userAgent);
      
      // Check for macOS (but not iOS)
      const isMacOS = /mac/.test(platform) && !/iphone|ipad|ipod/.test(userAgent);
      
      // Check for Linux
      const isLinux = /linux/.test(platform) && !/android/.test(userAgent);
      
      // Check for Chrome on non-iOS
      const isChrome = /chrome/.test(userAgent) && !/crios/.test(userAgent);
      
      // Check for Edge
      const isEdge = /edg/.test(userAgent);
      
      // Check for Firefox
      const isFirefox = /firefox/.test(userAgent);
      
      // Check for Samsung Browser
      const isSamsungBrowser = /samsungbrowser/.test(userAgent);
      
      // Final non-iOS check
      const isNonIOSDevice = 
        isWindows || 
        isAndroid || 
        isMacOS || 
        isLinux ||
        isChrome ||
        isEdge ||
        isFirefox ||
        isSamsungBrowser;
      
      console.log('📱 Is Non-iOS Device:', isNonIOSDevice);
      
      // Save to localStorage
      localStorage.setItem('isNonIOSDevice', isNonIOSDevice.toString());
      setIsNonIOS(isNonIOSDevice);
      
      // Check if warning was already shown in this session
      const warningShown = sessionStorage.getItem('nonIOSWarningShown');
      if (isNonIOSDevice && !warningShown) {
        // Show alert message
        setTimeout(() => {
          alert('📱 iOS App Detected\n\n⚠️ This app is optimized for iOS devices.\n\nFor best experience, please use:\n• iPhone/iPad with Safari\n• iOS 12 or later\n\nYou may experience limited functionality on this device.');
        }, 1500);
        
        // Mark warning as shown for this session
        sessionStorage.setItem('nonIOSWarningShown', 'true');
      }
    };
    
    checkDevice();
  }, []);
  
  if (!isNonIOS || !showWarning) return null;
  
  // Get device type
  const getDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform;
    
    if (/windows/.test(userAgent) || platform.includes('Win')) return 'Windows';
    if (/android/.test(userAgent)) return 'Android';
    if (/mac/.test(platform) && !/iphone|ipad|ipod/.test(userAgent)) return 'macOS';
    if (/linux/.test(platform)) return 'Linux';
    return 'Unknown';
  };
  
  // Get browser name
  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edg')) return 'Edge';
    return 'Unknown Browser';
  };
  
  return (
    <div className="non-ios-warning">
      <div className="non-ios-warning-content">
        <div className="non-ios-icon">📱</div>
        <h2>iOS App Detected</h2>
        <p className="non-ios-message">
          <strong>Note:</strong> You're accessing an iOS-optimized application on a non-iOS device.
        </p>
        
        <div className="non-ios-details">
          <h3>📊 Device Information:</h3>
          <div className="device-info-grid">
            <div className="device-info-item">
              <span className="info-label">Device:</span>
              <span className="info-value">{getDeviceType()}</span>
            </div>
            <div className="device-info-item">
              <span className="info-label">Browser:</span>
              <span className="info-value">{getBrowserName()}</span>
            </div>
            <div className="device-info-item">
              <span className="info-label">Platform:</span>
              <span className="info-value">{navigator.platform}</span>
            </div>
          </div>
        </div>
        
        <div className="non-ios-recommendation">
          <h3>✅ Recommended Devices:</h3>
          <ul>
            <li>📱 <strong>iPhone</strong> with Safari browser</li>
            <li>📱 <strong>iPad</strong> with Safari browser</li>
            <li>📱 <strong>iPod Touch</strong> with Safari browser</li>
          </ul>
        </div>
        
        <div className="non-ios-limitations">
          <h3>⚠️ Limitations on this device:</h3>
          <ul>
            <li>📍 Location services may be less accurate</li>
            <li>📱 iOS-specific features may not work</li>
            <li>🎨 UI may not be optimized for this screen</li>
            <li>🔔 Notifications may not work properly</li>
            <li>📱 PWA installation may not be available</li>
          </ul>
        </div>
        
        <div className="non-ios-actions">
          <p className="continue-note">
            You can continue using the app, but some features may be limited.
          </p>
          
          <p 
            // className="ios-button primary"
            onClick={() => setShowWarning(false)}
          >
            .
          </p>
          
          <button 
            className="ios-button secondary"
            onClick={() => {
              alert('📱 iOS Setup Instructions:\n\n1. Open this link on your iPhone/iPad\n2. Use Safari browser (not Chrome)\n3. Tap the Share button (□→↑)\n4. Select "Add to Home Screen"\n5. Launch from Home Screen for best experience\n\n📍 Enable Location Services in Settings for accurate attendance tracking.');
            }}
          >
            Show iOS Instructions
          </button>
        </div>
        
        <div className="non-ios-footer">
          <p className="support-note">
            Need help? Contact support for iOS device setup assistance.
          </p>
          {/* <button 
            className="ios-button ghost"
            onClick={() => {
              sessionStorage.setItem('dontShowAgain', 'true');
              setShowWarning(false);
            }}
          >
            Don't Show Again
          </button> */}
        </div>
      </div>
      
      <style>{`
        .non-ios-warning {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        
        .non-ios-warning-content {
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
          border-radius: 20px;
          padding: 30px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          color: white;
          border: 1px solid #444;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease;
        }
        
        .non-ios-icon {
          font-size: 60px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .non-ios-warning h2 {
          font-size: 28px;
          text-align: center;
          margin-bottom: 15px;
          color: #ff9500;
          font-weight: 700;
        }
        
        .non-ios-message {
          text-align: center;
          font-size: 16px;
          margin-bottom: 25px;
          color: #ccc;
          line-height: 1.5;
        }
        
        .non-ios-details {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .non-ios-details h3 {
          font-size: 18px;
          margin-bottom: 15px;
          color: #64d2ff;
        }
        
        .device-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }
        
        .device-info-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .info-label {
          font-size: 12px;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-size: 14px;
          color: white;
          font-weight: 600;
        }
        
        .non-ios-recommendation,
        .non-ios-limitations {
          background: rgba(255, 255, 255, 0.05);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .non-ios-recommendation h3 {
          color: #34c759;
          font-size: 18px;
          margin-bottom: 15px;
        }
        
        .non-ios-limitations h3 {
          color: #ff3b30;
          font-size: 18px;
          margin-bottom: 15px;
        }
        
        .non-ios-recommendation ul,
        .non-ios-limitations ul {
          list-style: none;
          padding: 0;
        }
        
        .non-ios-recommendation li,
        .non-ios-limitations li {
          padding: 10px 0;
          font-size: 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .non-ios-recommendation li:last-child,
        .non-ios-limitations li:last-child {
          border-bottom: none;
        }
        
        .non-ios-actions {
          text-align: center;
          margin-top: 30px;
        }
        
        .continue-note {
          font-size: 14px;
          color: #aaa;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .ios-button {
          padding: 14px 28px;
          border-radius: 12px;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 10px;
          min-width: 200px;
        }
        
        .ios-button.primary {
          background: #007AFF;
          color: white;
        }
        
        .ios-button.primary:hover {
          background: #0056CC;
          transform: translateY(-2px);
        }
        
        .ios-button.secondary {
          background: transparent;
          color: #007AFF;
          border: 2px solid #007AFF;
        }
        
        .ios-button.secondary:hover {
          background: rgba(0, 122, 255, 0.1);
        }
        
        .ios-button.ghost {
          background: transparent;
          color: #aaa;
          border: 1px solid #444;
          padding: 8px 16px;
          font-size: 14px;
          min-width: auto;
          margin: 10px 0 0 0;
        }
        
        .ios-button.ghost:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        
        .non-ios-footer {
          margin-top: 30px;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .support-note {
          font-size: 13px;
          color: #888;
          margin-bottom: 10px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 600px) {
          .non-ios-warning-content {
            padding: 20px;
          }
          
          .non-ios-warning h2 {
            font-size: 24px;
          }
          
          .device-info-grid {
            grid-template-columns: 1fr;
          }
          
          .ios-button {
            width: 100%;
            margin: 5px 0;
          }
        }
      `}</style>
    </div>
  );
};

// iOS Device Check Component (Optional - if you want to block non-iOS)
const iOSCheckComponent = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkIOSDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const platform = window.navigator.platform;
      
      console.log('📱 iOS Check - User Agent:', userAgent);
      console.log('📱 iOS Check - Platform:', platform);
      
      // Check for iOS devices (iPhone, iPad, iPod)
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      
      // Check for iOS Safari
      const isIOSSafari = 
        /safari/.test(userAgent) && 
        /applewebkit/.test(userAgent) && 
        !/chrome|chromium|edg|opr|brave|vivaldi/.test(userAgent) &&
        (isIOSDevice || /mac/.test(platform));
      
      // Check for iPad on iOS 13+ (MacIntel with touch)
      const isIpad = 
        platform === 'MacIntel' && 
        navigator.maxTouchPoints > 1;
      
      // Check for iOS Chrome (still shows as Safari)
      const isIOSChrome = 
        /crios/.test(userAgent) || // Chrome on iOS
        (isIOSDevice && /chrome/.test(userAgent));
      
      // Final check
      const isAppleDevice = 
        isIOSDevice || 
        isIpad || 
        isIOSSafari || 
        isIOSChrome ||
        platform.includes('iPhone') ||
        platform.includes('iPad') ||
        platform.includes('iPod');
      
      console.log('📱 Is iOS Device:', isAppleDevice);
      console.log('📱 Max Touch Points:', navigator.maxTouchPoints);
      
      setIsIOS(isAppleDevice);
      setIsChecking(false);
      
      // Save to localStorage
      localStorage.setItem('isIOSDevice', isAppleDevice.toString());
    };
    
    checkIOSDevice();
  }, []);

  if (isChecking) {
    return (
      <div className="ios-loading-screen">
        <div className="ios-spinner-large"></div>
        <p>Checking device compatibility...</p>
      </div>
    );
  }

  if (!isIOS) {
    // Note: We're not blocking anymore, just showing warning in NoniOSCheckComponent
    return null;
  }

  return null; // Allow app to proceed if iOS
};

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

// App Component
function App() {
  const [initialized, setInitialized] = useState(false);
  const [deviceCheckPassed, setDeviceCheckPassed] = useState(true); // Default to true to allow all devices
  
  useEffect(() => {
    console.log('🚀 App mounted');
    
    // First check if device is iOS
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const platform = navigator.platform;
      
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isIpad = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      const isAppleDevice = isIOSDevice || isIpad;
      
      console.log('📱 Device Check Result (iOS):', isAppleDevice);
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('📱 Platform:', platform);
      
      // We're not blocking any devices anymore
      // Just setting the flag for reference
      setDeviceCheckPassed(true);
      
      return true;
    };
    
    checkDevice();
    
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
        
        {/* Show non-iOS warning if needed */}
        <NoniOSCheckComponent />
        
        {/* iOS Check (Optional - if you want to block, uncomment below) */}
        {/* {!deviceCheckPassed && <iOSCheckComponent />} */}
        
        {/* Show app content for all devices */}
        {deviceCheckPassed && (
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
        )}
      </div>
    </Router>
  );
}

// CSS for iOS error screen (add to App.css)
const iOSErrorStyles = `
.ios-loading-screen,
.ios-error-screen {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 30px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ios-spinner-large {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255,255,255,0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.ios-error-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.ios-error-screen h1 {
  font-size: 28px;
  margin-bottom: 15px;
  font-weight: 700;
}

.ios-error-message {
  font-size: 16px;
  margin-bottom: 25px;
  opacity: 0.9;
  max-width: 500px;
  line-height: 1.5;
}

.ios-error-details {
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  max-width: 500px;
  width: 100%;
}

.ios-error-details p {
  margin: 8px 0;
  font-size: 14px;
}

.ios-error-details strong {
  color: #FFD700;
}

.ios-device-list {
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  max-width: 500px;
  width: 100%;
}

.ios-device-list h3 {
  margin-bottom: 10px;
  font-size: 18px;
}

.ios-device-list ul {
  list-style: none;
  padding: 0;
  text-align: left;
}

.ios-device-list li {
  padding: 8px 0;
  font-size: 15px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.ios-device-list li:last-child {
  border-bottom: none;
}

.ios-contact-note {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .ios-error-screen h1 {
    font-size: 24px;
  }
  
  .ios-error-message {
    font-size: 14px;
  }
}

/* Dark mode support for warning */
@media (prefers-color-scheme: dark) {
  .non-ios-warning-content {
    background: linear-gradient(135deg, #0d0d0d, #1a1a1a);
    border-color: #555;
  }
  
  .non-ios-details,
  .non-ios-recommendation,
  .non-ios-limitations {
    background: rgba(255, 255, 255, 0.08);
  }
  
  .ios-button.ghost {
    border-color: #666;
  }
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = iOSErrorStyles;
  document.head.appendChild(style);
}

export default App;