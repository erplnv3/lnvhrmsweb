import axios from 'axios';

// Base URL
export const BASE_URL = 'http://66.116.199.85:8080/hrms1/api/v1';
// export const BASE_URL ='http://192.168.1.221:8080/api/v1';
// Token storage functions
export const tokenStorage = {
  getToken: () => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('🔐 Getting token from storage:', token ? '✓ Token exists' : '✗ No token');
      return token;
    } catch (error) {
      console.error('🔐 Error getting token:', error);
      return null;
    }
  },
  
  setToken: (token) => {
    try {
      console.log('🔐 Setting token:', token ? '✓ Token received' : '✗ No token');
      if (!token) {
        console.warn('🔐 Attempting to set empty token!');
        return;
      }
      localStorage.setItem('authToken', token);
      console.log('🔐 Token stored successfully');
    } catch (error) {
      console.error('🔐 Error setting token:', error);
    }
  },
  
  removeToken: () => {
    try {
      console.log('🔐 Removing token');
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('🔐 Error removing token:', error);
    }
  },
  
  getUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.log('🔐 No user found in storage');
        return null;
      }
      const user = JSON.parse(userStr);
      console.log('🔐 Getting user from storage:', user);
      return user;
    } catch (error) {
      console.error('🔐 Error getting user:', error);
      return null;
    }
  },
  
  setUser: (user) => {
    try {
      if (!user) {
        console.warn('🔐 Attempting to set empty user!');
        return;
      }
      console.log('🔐 Setting user in storage:', user);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('🔐 User stored successfully');
    } catch (error) {
      console.error('🔐 Error setting user:', error);
    }
  },
  
  removeUser: () => {
    try {
      console.log('🔐 Removing user');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('🔐 Error removing user:', error);
    }
  },
  
  clearAll: () => {
    try {
      console.log('🔐 Clearing all auth data');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('🔐 Error clearing auth data:', error);
    }
  }
};

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Token added to request header for:', config.url);
    } else {
      console.log('📤 No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('📤 Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data ? '✓ Data received' : '✗ No data'
    });
    return response;
  },
  (error) => {
    console.error('📥 API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('📥 401 Unauthorized - Clearing tokens');
      tokenStorage.clearAll();
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.log('📥 Redirecting to login page');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs - UPDATED WITH BETTER HANDLING
export const authAPI = {
  login: async (username, password) => {
    try {
      console.log('🔐 LOGIN START - Username:', username);
      
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      
      console.log('🔐 RAW API RESPONSE:', response.data);
      
      if (!response.data) {
        throw new Error('Empty response from server');
      }
      
      const responseData = response.data;
      console.log('🔐 RESPONSE STRUCTURE:', Object.keys(responseData));
      
      // Find token in response (check multiple possible keys)
      let token = null;
      const tokenKeys = ['token', 'jwt', 'access_token', 'accessToken'];
      
      for (const key of tokenKeys) {
        if (responseData[key]) {
          token = responseData[key];
          console.log(`🔐 Found token in key "${key}":`, token.substring(0, 20) + '...');
          break;
        }
      }
      
      if (!token) {
        console.error('🔐 NO TOKEN FOUND in response:', responseData);
        throw new Error('No authentication token received from server');
      }
      
      // Extract user information from various possible structures
      let userData = {};
      
      // Try different response formats
      if (responseData.userid || responseData.username) {
        // Format 1: Direct fields in response
        userData = {
          id: responseData.userid,
          userId: responseData.userid,
          username: responseData.username,
          email: responseData.email,
          name: responseData.firstname,
          phone: responseData.phonenumber,
          roles: responseData.roles,
          status: responseData.status,
          fullResponse: responseData
        };
        console.log('🔐 User data from direct fields');
      } 
      else if (responseData.refreshtoken?.user) {
        // Format 2: Nested in refreshtoken
        const user = responseData.refreshtoken.user;
        userData = {
          id: user.id,
          userId: user.id,
          username: user.username,
          email: user.email,
          name: user.firstname,
          phone: user.phonenumber,
          roles: user.roles,
          userDetail: user.userDetail,
          fullResponse: responseData
        };
        console.log('🔐 User data from refreshtoken.user');
      }
      else if (responseData.user) {
        // Format 3: Direct user object
        const user = responseData.user;
        userData = {
          id: user.id,
          userId: user.id,
          username: user.username,
          email: user.email,
          name: user.firstname,
          phone: user.phonenumber,
          roles: user.roles,
          userDetail: user.userDetail,
          fullResponse: responseData
        };
        console.log('🔐 User data from direct user object');
      }
      else {
        // Format 4: Minimal data - create from what we have
        userData = {
          id: responseData.id || Date.now(),
          userId: responseData.id || Date.now(),
          username: username,
          name: username,
          fullResponse: responseData
        };
        console.log('🔐 Created minimal user data');
      }
      
      // Ensure we have at least username
      if (!userData.username) {
        userData.username = username;
      }
      
      // Ensure we have some ID
      if (!userData.id) {
        userData.id = userData.userId || Date.now();
      }
      
      console.log('🔐 FINAL USER DATA:', userData);
      
      // Store token and user
      tokenStorage.setToken(token);
      tokenStorage.setUser(userData);
      
      // Verify storage
      console.log('🔐 STORAGE VERIFICATION:', {
        storedToken: localStorage.getItem('authToken') ? '✓' : '✗',
        storedUser: localStorage.getItem('user') ? '✓' : '✗',
        tokenLength: token?.length || 0,
        userId: userData.id
      });
      
      return {
        success: true,
        message: responseData.status || 'Login successful',
        token: token,
        user: userData
      };
      
    } catch (error) {
      console.error('🔐 LOGIN ERROR:', error);
      
      // Clear any existing auth data
      tokenStorage.clearAll();
      
      // Parse error message
      let errorMessage = 'Login failed. Please check credentials and try again.';
      
      if (error.response?.data?.status) {
        errorMessage = error.response.data.status;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.success === false && error.message) {
        errorMessage = error.message;
      }
      
      console.log('🔐 ERROR MESSAGE TO USER:', errorMessage);
      
      // Return error object (not throwing)
      return {
        success: false,
        message: errorMessage,
        status: error.response?.status
      };
    }
  },

  logout: () => {
    console.log('🔐 LOGOUT');
    tokenStorage.clearAll();
    // Optional: Call logout API if needed
    // api.post('/auth/logout');
  },

  getCurrentUser: () => {
    const user = tokenStorage.getUser();
    console.log('🔐 Current user from storage:', user);
    return user;
  },
  
  isAuthenticated: () => {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser();
    const hasToken = !!token;
    const hasUser = !!user;
    
    console.log('🔐 Auth check:', {
      hasToken,
      hasUser,
      tokenLength: token?.length || 0,
      userId: user?.id
    });
    
    // Both token and user must exist
    return hasToken && hasUser;
  },
  
  // Helper method to check and fix auth state
  validateAuthState: () => {
    const token = tokenStorage.getToken();
    const user = tokenStorage.getUser();
    
    if (!token || !user) {
      console.log('🔐 Invalid auth state, clearing...');
      tokenStorage.clearAll();
      return false;
    }
    
    // Check if user has minimum required fields
    const hasValidUser = user && (user.id || user.userId || user.username);
    
    if (!hasValidUser) {
      console.log('🔐 Invalid user data, clearing...');
      tokenStorage.clearAll();
      return false;
    }
    
    return true;
  }
};

// Attendance APIs - OPTIMIZED
export const attendanceAPI = {
  punchIn: async (latitude, longitude, userId) => {
    try {
      const payload = {
        fromtime: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        user: { id: userId },
        remark: null
      };
      
      console.log('📝 Punch In payload:', payload);
      
      const response = await api.post('/attendance/save', payload);
      console.log('📝 Punch In response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('📝 Punch In error:', error);
      
      // Re-throw with better message
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.status || 
        'Failed to punch in'
      );
    }
  },

  punchOut: async (attendanceId, latitude, longitude, userId, fromtime, date) => {
    try {
      const totime = new Date().toLocaleTimeString('en-GB', { hour12: false });
      
      const payload = {
        fromtime,
        totime,
        date,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        user: { id: userId }
      };

      console.log('📝 Punch Out payload:', payload);

      const response = await api.put(`/attendance/${attendanceId}`, payload);
      console.log('📝 Punch Out response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('📝 Punch Out error:', error);
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.status || 
        'Failed to punch out'
      );
    }
  },

  getUserStatus: async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const url = `/attendance/${userId}/${today}`;
      
      console.log('📝 Fetching user status:', { url, userId, today });
      
      const response = await api.get(url);
      console.log('📝 User status response:', response.data);
      
      if (response.data && response.data.id) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('📝 Get user status error:', error);
      
      if (error.response?.status === 404) {
        return null;
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.status || 
        'Failed to fetch attendance status'
      );
    }
  },

  updateRemark: async (attendanceId, remark) => {
    try {
      const response = await api.put(`/attendance/update/${attendanceId}`, { remark });
      return response.data;
    } catch (error) {
      console.error('📝 Update remark error:', error);
      throw error;
    }
  },

  getAttendanceById: async (attendanceId) => {
    try {
      const response = await api.get(`/attendance/${attendanceId}`);
      return response.data;
    } catch (error) {
      console.error('📝 Get attendance error:', error);
      throw error;
    }
  },
};

// User APIs
export const userAPI = {
  getStaffById: async (userId) => {
    try {
      const url = `/user/${userId}`;
      console.log('👤 Fetching staff:', url);
      
      const response = await api.get(url);
      console.log('👤 Staff data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('👤 Get staff error:', error);
      throw error;
    }
  },

  updateStaff: async (userId, updatedData) => {
    try {
      const response = await api.put(`/user/${userId}`, updatedData);
      return response.data;
    } catch (error) {
      console.error('👤 Update staff error:', error);
      throw error;
    }
  },
  
  // Get current user profile
  getProfile: async () => {
    try {
      const user = authAPI.getCurrentUser();
      if (!user || !user.id) {
        throw new Error('No user logged in');
      }
      
      return await userAPI.getStaffById(user.id);
    } catch (error) {
      console.error('👤 Get profile error:', error);
      throw error;
    }
  }
};

// Export default api
export default api;