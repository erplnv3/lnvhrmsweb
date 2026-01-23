import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiMapPin, 
  HiOutlineMapPin,
  HiClock,
  HiCalendar,
  HiCheckCircle
} from 'react-icons/hi2';
import { MdLocationOn } from 'react-icons/md';
import BottomTab from './BottomTab';
import { attendanceAPI, authAPI } from '../services/api';
import useLocationService from '../services/location'; // Updated import

const HomePage = () => {
  const [punchInTime, setPunchInTime] = useState('--:--:--');
  const [punchOutTime, setPunchOutTime] = useState('--:--:--');
  const [totalHours, setTotalHours] = useState('--:--:--');
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [attendanceId, setAttendanceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [userId, setUserId] = useState(null);
  const [todayDate, setTodayDate] = useState('');
  const [hasCompletedAttendance, setHasCompletedAttendance] = useState(false);
  
  // Location states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('Fetching location...');
  const [locationError, setLocationError] = useState('');
  const [locationPermission, setLocationPermission] = useState('prompt');
  
  const navigate = useNavigate();
  
  // Use the custom hook for location service
  const locationService = useLocationService();

  // Initial setup
  useEffect(() => {
    console.log('HomePage mounted');
    
    // Set today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    setTodayDate(today);
    
    checkAuthentication();
    updateCurrentDate();
    initLocation();
    
    return () => {
      locationService.stopTracking();
    };
  }, []);

  // Fetch user status after userId is set
  useEffect(() => {
    if (userId) {
      fetchUserStatus();
    }
  }, [userId]);

  // Timer effect - only run if user is punched in
  useEffect(() => {
    let interval;
    if (isPunchedIn && !hasCompletedAttendance) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (prev === 59) {
            setMinutes(m => {
              if (m === 59) {
                setHours(h => h + 1);
                return 0;
              }
              return m + 1;
            });
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPunchedIn, hasCompletedAttendance]);

  const checkAuthentication = () => {
    const isAuth = authAPI.isAuthenticated();
    
    if (!isAuth) {
      navigate('/login');
      return;
    }
    
    const user = authAPI.getCurrentUser();
    
    if (user && user.id) {
      setUserId(user.id);
      setUserInfo(user);
    } else {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          if (userData.id) {
            setUserId(userData.id);
            setUserInfo(userData);
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
      }
    }
  };

  const initLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    try {
      const permission = await locationService.checkPermissions();
      setLocationPermission(permission);

      if (permission === 'granted') {
        getCurrentLocation();
        startLocationTracking();
      } else if (permission === 'prompt') {
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Error initializing location:', error);
      setLocationError(error.message);
    }
  };

  const startLocationTracking = () => {
    locationService.startTracking((location, error) => {
      if (error) {
        console.error('Location tracking error:', error);
        setLocationError(error);
        return;
      }
      
      if (location) {
        setCurrentLocation(location);
        setLocationError('');
        
        locationService.getAddressFromCoordinates(location.latitude, location.longitude)
          .then(address => {
            if (address) {
              setLocationAddress(address.formattedAddress);
            }
          })
          .catch(err => {
            console.error('Failed to get address:', err);
          });
      }
    });
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    setLocationError('');
    
    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      
      const address = await locationService.getAddressFromCoordinates(
        location.latitude, 
        location.longitude
      );
      
      if (address) {
        setLocationAddress(address.formattedAddress);
      } else {
        setLocationAddress(`Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}`);
      }
      
      return location;
    } catch (error) {
      console.error('Failed to get location:', error);
      setLocationError('Location permission required. Please enable location access.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatus = async () => {
    if (!userId) {
      console.log('No userId, skipping user status fetch');
      return;
    }
    
    console.log('📊 DEBUG: Fetching user status for userId:', userId);
    console.log('📊 DEBUG: Today\'s date:', todayDate);
    
    try {
      setLoading(true);
      const attendanceData = await attendanceAPI.getUserStatus(userId);
      console.log('📊 DEBUG: User status response:', attendanceData);
      
      if (attendanceData && attendanceData.id) {
        // Attendance record exists for today
        setAttendanceId(attendanceData.id);
        
        if (attendanceData.totime) {
          // User already punched out for today
          console.log('📊 DEBUG: User already punched out today');
          
          setIsPunchedIn(false);
          setHasCompletedAttendance(true);
          
          // Set times (API returns 24-hour format)
          const punchInTime24 = attendanceData.fromtime; // e.g., "16:09:55"
          const punchOutTime24 = attendanceData.totime; // e.g., "16:11:17"
          
          setPunchInTime(formatTime(punchInTime24));
          setPunchOutTime(formatTime(punchOutTime24));
          
          // Calculate total hours using 24-hour format
          const total = calculateTimeDifference(punchInTime24, punchOutTime24);
          console.log('📊 DEBUG: Calculated total:', total);
          
          setTotalHours(total.formatted);
          setHours(total.hours);
          setMinutes(total.minutes);
          setSeconds(total.seconds);
        } else {
          // User is still punched in
          console.log('📊 DEBUG: User is currently punched in');
          
          setIsPunchedIn(true);
          setHasCompletedAttendance(false);
          
          const punchInTime24 = attendanceData.fromtime;
          setPunchInTime(formatTime(punchInTime24));
          setPunchOutTime('--:--:--');
          
          // Calculate elapsed time since punch in
          const now = new Date();
          const [hours24, minutes24, seconds24 = '00'] = punchInTime24.split(':').map(Number);
          
          const punchInDate = new Date();
          punchInDate.setHours(hours24, minutes24, seconds24);
          
          const diffMs = now - punchInDate;
          const diffSeconds = Math.floor(diffMs / 1000);
          
          const hours = Math.floor(diffSeconds / 3600);
          const minutes = Math.floor((diffSeconds % 3600) / 60);
          const seconds = diffSeconds % 60;
          
          setHours(hours);
          setMinutes(minutes);
          setSeconds(seconds);
          setTotalHours('--:--:--');
          
          console.log('📊 DEBUG: Elapsed time:', { hours, minutes, seconds });
        }
      } else {
        // No attendance record for today
        console.log('📊 DEBUG: No attendance record for today');
        
        resetToInitialState();
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
      resetToInitialState();
    } finally {
      setLoading(false);
    }
  };

  const resetToInitialState = () => {
    setIsPunchedIn(false);
    setHasCompletedAttendance(false);
    setAttendanceId(null);
    setPunchInTime('--:--:--');
    setPunchOutTime('--:--:--');
    setTotalHours('--:--:--');
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  const updateCurrentDate = () => {
    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    setCurrentDate(now.toLocaleDateString('en-US', options));
  };

  const formatTime = (timeString) => {
    if (!timeString || timeString === '--:--:--') return '--:--:--';
    
    try {
      const [hours, minutes, seconds = '00'] = timeString.split(':');
      const hourNum = parseInt(hours);
      const ampm = hourNum >= 12 ? 'PM' : 'AM';
      const hour12 = hourNum % 12 || 12;
      
      return `${hour12.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const calculateTimeDifference = (fromTime, toTime) => {
    try {
      console.log('⏰ Calculating time difference:', { fromTime, toTime });
      
      // Parse times (remove AM/PM if present)
      let fromTimeClean = fromTime.replace(' AM', '').replace(' PM', '').trim();
      let toTimeClean = toTime.replace(' AM', '').replace(' PM', '').trim();
      
      // Split into hours, minutes, seconds
      const [fromH, fromM, fromS = '00'] = fromTimeClean.split(':').map(Number);
      const [toH, toM, toS = '00'] = toTimeClean.split(':').map(Number);
      
      console.log('⏰ Parsed times:', { 
        fromH, fromM, fromS, 
        toH, toM, toS 
      });
      
      // Check if times are in 12-hour format (with AM/PM)
      const fromHasPM = fromTime.includes('PM');
      const toHasPM = toTime.includes('PM');
      const fromHasAM = fromTime.includes('AM');
      const toHasAM = toTime.includes('AM');
      
      let fromHour24 = fromH;
      let toHour24 = toH;
      
      // Convert to 24-hour format if needed
      if (fromHasPM && fromHour24 < 12) {
        fromHour24 += 12;
      } else if (fromHasAM && fromHour24 === 12) {
        fromHour24 = 0;
      }
      
      if (toHasPM && toHour24 < 12) {
        toHour24 += 12;
      } else if (toHasAM && toHour24 === 12) {
        toHour24 = 0;
      }
      
      console.log('⏰ 24-hour format:', { 
        fromHour24, fromM, fromS, 
        toHour24, toM, toS 
      });
      
      // Calculate total seconds
      const fromTotalSeconds = fromHour24 * 3600 + fromM * 60 + fromS;
      const toTotalSeconds = toHour24 * 3600 + toM * 60 + toS;
      
      console.log('⏰ Total seconds:', { 
        fromTotalSeconds, 
        toTotalSeconds 
      });
      
      let diffSeconds = toTotalSeconds - fromTotalSeconds;
      
      // Handle negative difference (if punch out is next day)
      if (diffSeconds < 0) {
        console.log('⏰ Negative time, adding 24 hours');
        diffSeconds += 24 * 3600; // Add 24 hours
      }
      
      console.log('⏰ Final diff seconds:', diffSeconds);
      
      // Calculate hours, minutes, seconds
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;
      
      console.log('⏰ Result:', { hours, minutes, seconds });
      
      return {
        hours,
        minutes,
        seconds,
        formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      };
    } catch (error) {
      console.error('⏰ Error calculating time difference:', error);
      return { hours: 0, minutes: 0, seconds: 0, formatted: '--:--:--' };
    }
  };

  const handlePunchIn = async () => {
    console.log('📊 DEBUG: Punch In clicked');
    console.log('📊 DEBUG: User ID:', userId);
    console.log('📊 DEBUG: Has completed attendance:', hasCompletedAttendance);
    
    if (!userId) {
      alert('User not found. Please login again.');
      navigate('/login');
      return;
    }

    // Check if already completed attendance today
    if (hasCompletedAttendance) {
      alert('You have already completed your attendance for today.');
      return;
    }

    // Already punched in check
    if (isPunchedIn) {
      alert('You are already punched in for today.');
      return;
    }

    // Check location permission
    if (locationPermission !== 'granted') {
      const shouldProceed = window.confirm(
        'Location access is required for punching in. Do you want to enable location access?'
      );
      if (shouldProceed) {
        await requestLocationPermission();
        if (locationPermission !== 'granted') {
          alert('Location permission is required to punch in.');
          return;
        }
      } else {
        return;
      }
    }

    // Get current location
    let location = currentLocation;
    if (!location) {
      location = await getCurrentLocation();
      if (!location) {
        alert('Unable to get current location. Please enable location services.');
        return;
      }
    }

    setLoading(true);
    setLocationError('');
    
    try {
      const response = await attendanceAPI.punchIn(
        location.latitude,
        location.longitude,
        userId
      );
      
      console.log('📊 DEBUG: Punch In API response:', response);
      
      if (response && response.id) {
        setIsPunchedIn(true);
        setHasCompletedAttendance(false);
        setAttendanceId(response.id);
        
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setPunchInTime(formatTime(timeString));
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setPunchOutTime('--:--:--');
        setTotalHours('--:--:--');
        
        alert('Punched in successfully!');
        
        // Start real-time tracking after punch in
        if (!currentLocation) {
          startLocationTracking();
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Punch In API error:', error);
      alert('Failed to punch in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePunchOut = async () => {
    console.log('📊 DEBUG: Punch Out clicked');
    
    if (!attendanceId || !userId) {
      alert('No active punch in found');
      return;
    }

    if (!isPunchedIn) {
      alert('You are not punched in.');
      return;
    }

    // Get current location
    let location = currentLocation;
    if (!location) {
      location = await getCurrentLocation();
      if (!location) {
        alert('Unable to get location. Please enable location services.');
        return;
      }
    }

    setLoading(true);
    setLocationError('');
    
    try {
      // Get current time in 24-hour format for API
      const now = new Date();
      const toTime24 = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      // Get punch in time from state (already in display format)
      // We need to convert back to 24-hour format for calculation
      let fromTime24 = punchInTime;
      
      // If it has AM/PM, convert to 24-hour
      if (punchInTime.includes('PM') || punchInTime.includes('AM')) {
        const [timePart, ampm] = punchInTime.split(' ');
        const [hours12, minutes, seconds = '00'] = timePart.split(':').map(Number);
        
        let hours24 = hours12;
        if (ampm === 'PM' && hours24 < 12) {
          hours24 += 12;
        } else if (ampm === 'AM' && hours24 === 12) {
          hours24 = 0;
        }
        
        fromTime24 = `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      
      console.log('📊 DEBUG: Times for calculation:', {
        fromTime24,
        toTime24
      });
      
      const response = await attendanceAPI.punchOut(
        attendanceId,
        location.latitude,
        location.longitude,
        userId,
        fromTime24, // Send 24-hour format to API
        todayDate,
        toTime24
      );
      
      console.log('📊 DEBUG: Punch Out API response:', response);
      
      if (response) {
        // Mark attendance as completed
        setIsPunchedIn(false);
        setHasCompletedAttendance(true);
        setAttendanceId(null);
        
        // Set punch out time (convert to display format)
        setPunchOutTime(formatTime(toTime24));
        
        // Calculate total hours using 24-hour format
        const total = calculateTimeDifference(fromTime24, toTime24);
        console.log('📊 DEBUG: Calculated total:', total);
        
        setTotalHours(total.formatted);
        setHours(total.hours);
        setMinutes(total.minutes);
        setSeconds(total.seconds);
        
        alert('Punched out successfully! You have completed your attendance for today.');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Punch Out API error:', error);
      alert('Failed to punch out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    setLoading(true);
    setLocationError('');
    
    try {
      const location = await getCurrentLocation();
      
      if (location) {
        setLocationPermission('granted');
        startLocationTracking();
      }
    } catch (error) {
      if (error.code === 1) {
        setLocationPermission('denied');
        setLocationError('Location permission denied. Please enable location access in browser settings.');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    await getCurrentLocation();
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  if (loading && !userInfo) {
    return (
      <div className="ios-container">
        <div className="ios-loading">
          <div className="ios-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ios-container">
      <div className="ios-status-bar"></div>

      <div className="ios-header">
        <div className="ios-header-content">
          <h1 className="ios-header-title">Attendance</h1>
          <div className="ios-header-subtitle">
            <HiCalendar size={16} />
            <span>{currentDate}</span>
          </div>
        </div>
        {userInfo && (
          <div className="ios-user-badge">
            {userInfo.name || userInfo.username || userInfo.email || 'User'}
          </div>
        )}
      </div>

      <div className="ios-content">
        {/* Location Permission Banner */}
        {locationPermission !== 'granted' && !hasCompletedAttendance && (
          <div className="ios-location-permission-banner">
            <div className="ios-permission-content">
              <MdLocationOn size={24} />
              <div>
                <h4>Location Access Required</h4>
                <p>Enable location services for accurate attendance tracking</p>
              </div>
            </div>
            <button 
              className="ios-permission-button"
              onClick={requestLocationPermission}
              disabled={loading}
            >
              {loading ? 'Requesting...' : 'Enable'}
            </button>
          </div>
        )}

        {/* Location Error Display */}
        {locationError && !hasCompletedAttendance && (
          <div className="ios-location-error">
            <p>{locationError}</p>
            <button 
              onClick={refreshLocation}
              className="ios-refresh-button"
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        {/* Working Hours Card */}
        <div className="ios-widget-card">
          <div className="ios-widget-header">
            <HiClock size={20} className="ios-widget-icon" />
            <h3>Working Hours</h3>
          </div>
          <div className="ios-time-display">
            <div className="ios-time-unit">
              <div className="ios-time-value">{hours.toString().padStart(2, '0')}</div>
              <div className="ios-time-label">HOURS</div>
            </div>
            <div className="ios-time-separator">:</div>
            <div className="ios-time-unit">
              <div className="ios-time-value">{minutes.toString().padStart(2, '0')}</div>
              <div className="ios-time-label">MINUTES</div>
            </div>
            <div className="ios-time-separator">:</div>
            <div className="ios-time-unit">
              <div className="ios-time-value">{seconds.toString().padStart(2, '0')}</div>
              <div className="ios-time-label">SECONDS</div>
            </div>
          </div>
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '12px', 
            borderTop: '1px solid #eee',
            fontSize: '14px',
            color: hasCompletedAttendance ? '#34C759' : isPunchedIn ? '#34C759' : '#FF3B30',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {hasCompletedAttendance ? '✅ Attendance Completed' : isPunchedIn ? '✓ Currently Punched In' : 'Not Punched In'}
          </div>
        </div>

        {/* Today's Activity */}
        <div className="ios-list-card">
          <h3 className="ios-list-title">Today's Activity</h3>
          <div className="ios-list">
            <div className="ios-list-item">
              <div className="ios-list-item-left">
                <div className={`ios-indicator ${(isPunchedIn || hasCompletedAttendance) ? 'ios-indicator-green' : 'ios-indicator-red'}`}></div>
                <span>Punch In</span>
              </div>
              <div className="ios-list-item-right">{punchInTime}</div>
            </div>
            <div className="ios-list-item">
              <div className="ios-list-item-left">
                <div className={`ios-indicator ${hasCompletedAttendance ? 'ios-indicator-green' : 'ios-indicator-red'}`}></div>
                <span>Punch Out</span>
              </div>
              <div className="ios-list-item-right">{punchOutTime}</div>
            </div>
            <div className="ios-list-divider"></div>
            <div className="ios-list-item ios-list-item-total">
              <div className="ios-list-item-left">Total Duration</div>
              <div className="ios-list-item-right ios-total-hours">
                {totalHours}
              </div>
            </div>
          </div>
        </div>

        {/* Live Location Card - Only show if not completed */}
        {!hasCompletedAttendance && (
          <div className="ios-list-card">
            <div className="ios-list-header">
              <h3 className="ios-list-title">Live Location</h3>
              <span className="ios-badge">
                {currentLocation ? 'Active' : 'Offline'}
              </span>
            </div>
            
            <div className="ios-location-preview">
              <div className="ios-location-icon">
                <MdLocationOn size={24} color="#007AFF" />
              </div>
              <div className="ios-location-details">
                <div className="ios-location-title">Current Location</div>
                <div className="ios-location-address">
                  {locationAddress}
                </div>
                {currentLocation && (
                  <div className="ios-location-coords">
                    {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    {currentLocation.accuracy && (
                      <span className="ios-accuracy">
                        ±{Math.round(currentLocation.accuracy)}m
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button 
                onClick={refreshLocation}
                className="ios-location-refresh"
                disabled={loading}
                title="Refresh location"
              >
                <HiOutlineMapPin size={20} />
              </button>
            </div>
            
            <div className="ios-map-placeholder">
              {currentLocation ? (
                <>
                  <MdLocationOn size={32} color="#34C759" />
                  <span>Location Available</span>
                  {currentLocation.accuracy && (
                    <small>Accuracy: ±{Math.round(currentLocation.accuracy)} meters</small>
                  )}
                </>
              ) : (
                <>
                  <HiMapPin size={32} color="#8E8E93" />
                  <span>Waiting for location...</span>
                  <small>Tap refresh button above</small>
                </>
              )}
            </div>
          </div>
        )}

        {/* Completion Message - Show when attendance completed */}
        {hasCompletedAttendance && (
          <div className="ios-completion-card">
            <div className="ios-completion-icon">
              <HiCheckCircle size={48} color="#34C759" />
            </div>
            <div className="ios-completion-content">
              <h3>Attendance Completed</h3>
              <p>You have successfully completed your attendance for today.</p>
              <div className="ios-summary">
                <div className="ios-summary-item">
                  <span>Punch In:</span>
                  <strong>{punchInTime}</strong>
                </div>
                <div className="ios-summary-item">
                  <span>Punch Out:</span>
                  <strong>{punchOutTime}</strong>
                </div>
                <div className="ios-summary-item">
                  <span>Total Hours:</span>
                  <strong>{totalHours}</strong>
                </div>
              </div>
              <p className="ios-note">
                <small>Punch in will be available again tomorrow.</small>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!hasCompletedAttendance ? (
          isPunchedIn ? (
            // Show Punch Out button only if punched in
            <div className="ios-action-container">
              <button 
                className="ios-action-button ios-action-button-red" 
                onClick={handlePunchOut}
                disabled={loading}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Slide to Punch Out</span>
                    <div className="ios-slide-indicator">→</div>
                  </>
                )}
              </button>
            </div>
          ) : (
            // Show Punch In button only if not punched in and not completed
            <div className="ios-action-container">
              <button 
                className="ios-action-button ios-action-button-green" 
                onClick={handlePunchIn}
                disabled={loading || locationPermission === 'denied'}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : locationPermission === 'denied' ? (
                  <span>Enable Location First</span>
                ) : (
                  <>
                    <span>Slide to Punch In</span>
                    <div className="ios-slide-indicator">→</div>
                  </>
                )}
              </button>
            </div>
          )
        ) : (
          // No buttons shown when attendance completed
          <div className="ios-action-container">
            <div className="ios-message-box">
              <p>✅ You have already completed today's attendance.</p>
              <small>Punch in will be available tomorrow.</small>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="ios-action-container">
          <button 
            className="ios-action-button ios-action-button-secondary" 
            onClick={handleLogout}
          >
            <span>Logout</span>
          </button>
        </div>
      </div>

      <BottomTab />
    </div>
  );
};

export default HomePage;