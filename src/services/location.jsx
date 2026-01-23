// import { useRef, useCallback, useState } from 'react';

// export const useLocationService = () => {
//   const watchId = useRef(null);
//   const [permissionState, setPermissionState] = useState('prompt');
  
//   const options = {
//     enableHighAccuracy: true,
//     timeout: 30000,
//     maximumAge: 0
//   };

//   const getCurrentLocation = useCallback(() => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         console.log('📍 Geolocation not available, using fallback');
//         getFallbackLocation().then(resolve).catch(reject);
//         return;
//       }

//       console.log('📍 Requesting location...');
      
//       const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
//       const timeout = isMobile ? 30000 : 15000;
      
//       let timer;
//       if (isMobile) {
//         timer = setTimeout(() => {
//           console.log('📍 Mobile timeout, trying fallback...');
//           getFallbackLocation().then(resolve).catch(reject);
//         }, timeout + 5000);
//       }

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           if (timer) clearTimeout(timer);
//           const location = {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//             accuracy: position.coords.accuracy,
//             source: 'gps'
//           };
//           console.log('📍 GPS Location obtained:', location);
//           resolve(location);
//         },
//         (error) => {
//           if (timer) clearTimeout(timer);
//           console.error('📍 Geolocation error:', error.message);
          
//           if (isMobile) {
//             getFallbackLocation()
//               .then(resolve)
//               .catch(() => {
//                 resolve(getMockLocation());
//               });
//           } else {
//             reject(getErrorMessage(error));
//           }
//         },
//         { ...options, timeout }
//       );
//     });
//   }, []);

//   const getFallbackLocation = useCallback(async () => {
//     console.log('📍 Trying fallback location methods...');
    
//     try {
//       const ipLocation = await getIPBasedLocation();
//       if (ipLocation) {
//         console.log('📍 IP-based location obtained');
//         return ipLocation;
//       }
      
//       const html5Location = await tryHTML5Geolocation();
//       if (html5Location) {
//         console.log('📍 HTML5 geolocation obtained');
//         return html5Location;
//       }
      
//       throw new Error('All fallback methods failed');
//     } catch (error) {
//       console.error('📍 Fallback location failed:', error);
//       return getMockLocation();
//     }
//   }, []);

//   const getIPBasedLocation = useCallback(async () => {
//     try {
//       const services = [
//         'https://ipapi.co/json/',
//         'https://ipinfo.io/json',
//         'https://geolocation-db.com/json/'
//       ];

//       for (const service of services) {
//         try {
//           const controller = new AbortController();
//           const timeoutId = setTimeout(() => controller.abort(), 8000);
          
//           const response = await fetch(service, {
//             signal: controller.signal,
//             headers: { 'Accept': 'application/json' }
//           });
          
//           clearTimeout(timeoutId);
          
//           if (response.ok) {
//             const data = await response.json();
            
//             let lat, lon, city, country;
            
//             if (service.includes('ipapi.co')) {
//               lat = data.latitude;
//               lon = data.longitude;
//               city = data.city;
//               country = data.country_name;
//             } else if (service.includes('ipinfo.io')) {
//               const [latStr, lonStr] = data.loc?.split(',') || ['19.0760', '72.8777'];
//               lat = parseFloat(latStr);
//               lon = parseFloat(lonStr);
//               city = data.city;
//               country = data.country;
//             } else if (service.includes('geolocation-db.com')) {
//               lat = data.latitude;
//               lon = data.longitude;
//               city = data.city;
//               country = data.country_name;
//             }

//             if (lat && lon) {
//               return {
//                 latitude: lat,
//                 longitude: lon,
//                 accuracy: 50000,
//                 city: city,
//                 country: country,
//                 source: 'ip',
//                 address: city && country ? `${city}, ${country} (Approximate)` : 'Location detected'
//               };
//             }
//           }
//         } catch (serviceError) {
//           continue;
//         }
//       }
      
//       return null;
//     } catch (error) {
//       console.error('📍 IP-based location failed:', error);
//       return null;
//     }
//   }, []);

//   const tryHTML5Geolocation = useCallback(() => {
//     return new Promise((resolve) => {
//       if (!navigator.geolocation) {
//         resolve(null);
//         return;
//       }

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           resolve({
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//             accuracy: position.coords.accuracy,
//             source: 'html5'
//           });
//         },
//         () => resolve(null),
//         { 
//           enableHighAccuracy: false,
//           timeout: 10000,
//           maximumAge: 60000 
//         }
//       );
//     });
//   }, []);

//   const getMockLocation = useCallback(() => {
//     console.log('📍 Providing mock location for testing');
//     return {
//       latitude: 19.0760,
//       longitude: 72.8777,
//       accuracy: 50,
//       city: 'Mumbai',
//       country: 'India',
//       source: 'mock',
//       address: 'Mumbai, India (Test Location)',
//       isMock: true
//     };
//   }, []);

//   const startTracking = useCallback((callback) => {
//     if (!navigator.geolocation) {
//       callback(null, 'Geolocation not supported');
//       return null;
//     }

//     watchId.current = navigator.geolocation.watchPosition(
//       (position) => {
//         const location = {
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//           accuracy: position.coords.accuracy,
//           source: 'gps_track'
//         };
//         callback(location);
//       },
//       (error) => {
//         console.error('📍 Tracking error:', error);
//         callback(null, error.message);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 15000,
//         maximumAge: 0
//       }
//     );

//     return watchId.current;
//   }, []);

//   const stopTracking = useCallback(() => {
//     if (watchId.current) {
//       navigator.geolocation.clearWatch(watchId.current);
//       watchId.current = null;
//     }
//   }, []);

//   const checkPermissions = useCallback(async () => {
//     if (!navigator.permissions || !navigator.permissions.query) {
//       return 'prompt';
//     }

//     try {
//       const permission = await navigator.permissions.query({ name: 'geolocation' });
//       setPermissionState(permission.state);
//       return permission.state;
//     } catch (error) {
//       return 'prompt';
//     }
//   }, []);

//   const getAddressFromCoordinates = useCallback(async (latitude, longitude, retries = 2) => {
//     for (let attempt = 1; attempt <= retries; attempt++) {
//       try {
//         const controller = new AbortController();
//         const timeoutId = setTimeout(() => controller.abort(), 10000);
        
//         const response = await fetch(
//           `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
//           {
//             signal: controller.signal,
//             headers: {
//               'Accept': 'application/json',
//               'Accept-Language': 'en',
//               'User-Agent': 'HRMS-App/1.0'
//             }
//           }
//         );
        
//         clearTimeout(timeoutId);
        
//         if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
//         const data = await response.json();
        
//         return {
//           display_name: data.display_name,
//           address: data.address,
//           fullAddress: formatAddress(data.address)
//         };
//       } catch (error) {
//         if (attempt === retries) {
//           return {
//             display_name: `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
//             address: {},
//             fullAddress: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
//           };
//         }
//         await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
//       }
//     }
//   }, []);

//   const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
//     const R = 6371e3;
//     const φ1 = (lat1 * Math.PI) / 180;
//     const φ2 = (lat2 * Math.PI) / 180;
//     const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//     const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//     const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c;
//   }, []);

//   const isWithinRadius = useCallback((currentLat, currentLon, targetLat, targetLon, radiusMeters = 100) => {
//     const distance = calculateDistance(currentLat, currentLon, targetLat, targetLon);
//     return distance <= radiusMeters;
//   }, [calculateDistance]);

//   const formatAddress = useCallback((addressObj) => {
//     if (!addressObj) return 'Location not found';
    
//     const parts = [];
//     if (addressObj.road) parts.push(addressObj.road);
//     if (addressObj.suburb) parts.push(addressObj.suburb);
//     if (addressObj.city || addressObj.town || addressObj.village) {
//       parts.push(addressObj.city || addressObj.town || addressObj.village);
//     }
//     if (addressObj.state) parts.push(addressObj.state);
//     if (addressObj.country) parts.push(addressObj.country);
    
//     return parts.join(', ') || 'Address not available';
//   }, []);

//   const getErrorMessage = useCallback((error) => {
//     switch(error.code) {
//       case 1: return 'Location permission denied';
//       case 2: return 'Location unavailable';
//       case 3: return 'Location request timed out';
//       default: return `Unable to get location: ${error.message}`;
//     }
//   }, []);

//   const getLocationWithAddress = useCallback(async () => {
//     try {
//       const location = await getCurrentLocation();
//       const address = await getAddressFromCoordinates(location.latitude, location.longitude);
      
//       return {
//         ...location,
//         address: address?.display_name || 'Address not available',
//         formattedAddress: address?.fullAddress || 'Address not available'
//       };
//     } catch (error) {
//       console.error('📍 Failed to get location with address:', error);
//       throw error;
//     }
//   }, [getCurrentLocation, getAddressFromCoordinates]);

//   return {
//     getCurrentLocation,
//     getFallbackLocation,
//     getIPBasedLocation,
//     tryHTML5Geolocation,
//     getMockLocation,
//     startTracking,
//     stopTracking,
//     checkPermissions,
//     getAddressFromCoordinates,
//     calculateDistance,
//     isWithinRadius,
//     formatAddress,
//     getErrorMessage,
//     getLocationWithAddress,
//     permissionState
//   };
// };

// // Default export for backward compatibility
// const useLocation = useLocationService;
// export default useLocation;




import { useRef, useCallback, useState } from 'react';

export const useLocationService = () => {
  const watchId = useRef(null);
  const [permissionState, setPermissionState] = useState('prompt');
  
  const options = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 0
  };

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.log('📍 Geolocation not available');
        reject(new Error('Geolocation not supported by browser'));
        return;
      }

      console.log('📍 Requesting location...');
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const timeout = isMobile ? 30000 : 15000;
      
      let timer;
      if (isMobile) {
        timer = setTimeout(() => {
          console.log('📍 Mobile timeout');
          reject(new Error('Location request timeout'));
        }, timeout + 5000);
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (timer) clearTimeout(timer);
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            source: 'gps'
          };
          console.log('📍 GPS Location obtained:', location);
          resolve(location);
        },
        (error) => {
          if (timer) clearTimeout(timer);
          console.error('📍 Geolocation error:', error.message);
          reject(getErrorMessage(error));
        },
        { ...options, timeout }
      );
    });
  }, []);

  const getFallbackLocation = useCallback(async () => {
    console.log('📍 Trying fallback location...');
    
    try {
      const ipLocation = await getIPBasedLocation();
      if (ipLocation) {
        console.log('📍 IP-based location obtained');
        return ipLocation;
      }
      
      throw new Error('IP-based location failed');
    } catch (error) {
      console.error('📍 Fallback location failed:', error);
      throw error;
    }
  }, []);

  const getIPBasedLocation = useCallback(async () => {
    try {
      const services = [
        'https://ipapi.co/json/',
        'https://ipinfo.io/json',
        'https://geolocation-db.com/json/'
      ];

      for (const service of services) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const response = await fetch(service, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            
            let lat, lon, city, country;
            
            if (service.includes('ipapi.co')) {
              lat = data.latitude;
              lon = data.longitude;
              city = data.city;
              country = data.country_name;
            } else if (service.includes('ipinfo.io')) {
              const [latStr, lonStr] = data.loc?.split(',') || [null, null];
              lat = latStr ? parseFloat(latStr) : null;
              lon = lonStr ? parseFloat(lonStr) : null;
              city = data.city;
              country = data.country;
            } else if (service.includes('geolocation-db.com')) {
              lat = data.latitude;
              lon = data.longitude;
              city = data.city;
              country = data.country_name;
            }

            if (lat && lon) {
              return {
                latitude: lat,
                longitude: lon,
                accuracy: 50000,
                city: city,
                country: country,
                source: 'ip',
                address: city && country ? `${city}, ${country} (Approximate)` : 'Location detected'
              };
            }
          }
        } catch (serviceError) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('📍 IP-based location failed:', error);
      return null;
    }
  }, []);

  // Mock location COMPLETELY REMOVED

  const startTracking = useCallback((callback) => {
    if (!navigator.geolocation) {
      callback(null, 'Geolocation not supported');
      return null;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'gps_track'
        };
        callback(location);
      },
      (error) => {
        console.error('📍 Tracking error:', error);
        callback(null, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    return watchId.current;
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const checkPermissions = useCallback(async () => {
    if (!navigator.permissions || !navigator.permissions.query) {
      return 'prompt';
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionState(permission.state);
      return permission.state;
    } catch (error) {
      return 'prompt';
    }
  }, []);

  const getAddressFromCoordinates = useCallback(async (latitude, longitude, retries = 2) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
          {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Accept-Language': 'en',
              'User-Agent': 'HRMS-App/1.0'
            }
          }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        return {
          display_name: data.display_name,
          address: data.address,
          fullAddress: formatAddress(data.address)
        };
      } catch (error) {
        if (attempt === retries) {
          return {
            display_name: `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            address: {},
            fullAddress: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          };
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  const isWithinRadius = useCallback((currentLat, currentLon, targetLat, targetLon, radiusMeters = 100) => {
    const distance = calculateDistance(currentLat, currentLon, targetLat, targetLon);
    return distance <= radiusMeters;
  }, [calculateDistance]);

  const formatAddress = useCallback((addressObj) => {
    if (!addressObj) return 'Location not found';
    
    const parts = [];
    if (addressObj.road) parts.push(addressObj.road);
    if (addressObj.suburb) parts.push(addressObj.suburb);
    if (addressObj.city || addressObj.town || addressObj.village) {
      parts.push(addressObj.city || addressObj.town || addressObj.village);
    }
    if (addressObj.state) parts.push(addressObj.state);
    if (addressObj.country) parts.push(addressObj.country);
    
    return parts.join(', ') || 'Address not available';
  }, []);

  const getErrorMessage = useCallback((error) => {
    switch(error.code) {
      case 1: return 'Location permission denied. Please allow location access in browser settings.';
      case 2: return 'Location unavailable. Please check your device settings.';
      case 3: return 'Location request timed out. Please try again.';
      default: return `Unable to get location: ${error.message}`;
    }
  }, []);

  const getLocationWithAddress = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      const address = await getAddressFromCoordinates(location.latitude, location.longitude);
      
      return {
        ...location,
        address: address?.display_name || 'Address not available',
        formattedAddress: address?.fullAddress || 'Address not available'
      };
    } catch (error) {
      console.error('📍 Failed to get location:', error);
      // Try fallback if GPS fails
      try {
        const fallbackLocation = await getFallbackLocation();
        if (fallbackLocation) {
          return fallbackLocation;
        }
        throw error;
      } catch (fallbackError) {
        throw new Error('Unable to get your location. Please check location permissions and try again.');
      }
    }
  }, [getCurrentLocation, getFallbackLocation, getAddressFromCoordinates]);

  return {
    getCurrentLocation,
    getFallbackLocation,
    getIPBasedLocation,
    startTracking,
    stopTracking,
    checkPermissions,
    getAddressFromCoordinates,
    calculateDistance,
    isWithinRadius,
    formatAddress,
    getErrorMessage,
    getLocationWithAddress,
    permissionState
  };
};

// Default export for backward compatibility
const useLocation = useLocationService;
export default useLocation;