import React, { useState, useEffect } from 'react';
import { 
  HiUserCircle,
  HiCog,
  HiPencil,
  HiShieldCheck,
  HiMail,
  HiCalendar,
  HiBriefcase,
  HiChevronRight
} from 'react-icons/hi';
import { 
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCake
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import BottomTab from './BottomTab';
import { authAPI } from '../services/api';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();
    loadUserProfile();
  }, []);

  const checkAuthentication = () => {
    if (!authAPI.isAuthenticated()) {
      navigate('/login');
      return;
    }
  };

  const loadUserProfile = () => {
    try {
      setLoading(true);
      
      // Get user info from localStorage (stored during login)
      const storedUser = authAPI.getCurrentUser();
      console.log('Stored user data:', storedUser);
      
      if (storedUser && storedUser.fullResponse) {
        // Extract user info from login response
        const loginResponse = storedUser.fullResponse;
        console.log('Full login response:', loginResponse);
        
        const userData = {
          // Basic info from login response
          id: loginResponse.userid || loginResponse.refreshtoken?.user?.id,
          username: loginResponse.username,
          firstname: loginResponse.firstname,
          email: loginResponse.email,
          phonenumber: loginResponse.phonenumber,
          gender: loginResponse.refreshtoken?.user?.gender || 'Not specified',
          
          // User detail info
          employeeId: loginResponse.refreshtoken?.user?.userDetail?.employeecode,
          employeeName: loginResponse.refreshtoken?.user?.userDetail?.employeename,
          employeeEmail: loginResponse.refreshtoken?.user?.userDetail?.employeeemail,
          employeePhone: loginResponse.refreshtoken?.user?.userDetail?.phonenumber,
          employeeType: loginResponse.refreshtoken?.user?.userDetail?.employeetype,
          department: loginResponse.refreshtoken?.user?.userDetail?.department?.departmentname || 'N/A',
          designation: loginResponse.refreshtoken?.user?.userDetail?.designation,
          dateOfBirth: loginResponse.refreshtoken?.user?.userDetail?.dateofbirth,
          dateOfJoining: loginResponse.refreshtoken?.user?.userDetail?.dateofjoining,
          address: loginResponse.refreshtoken?.user?.userDetail?.employeeaddress,
          branch: loginResponse.refreshtoken?.user?.userDetail?.branch?.name,
          experience: calculateExperience(loginResponse.refreshtoken?.user?.userDetail?.dateofjoining),
          
          // Full user object for debugging
          fullUser: loginResponse.refreshtoken?.user,
          userDetail: loginResponse.refreshtoken?.user?.userDetail
        };
        
        console.log('Processed user data:', userData);
        setUserInfo(userData);
      } else if (storedUser) {
        // Use stored user data if fullResponse not available
        console.log('Using stored user data:', storedUser);
        setUserInfo({
          id: storedUser.id,
          username: storedUser.username,
          email: storedUser.email,
          name: storedUser.name,
          phone: storedUser.phone,
          ...storedUser
        });
      } else {
        console.error('No user data found in storage');
        // Try to get from localStorage directly
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            console.log('User data from localStorage:', userData);
            setUserInfo(userData);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate experience from date of joining
  const calculateExperience = (dateOfJoining) => {
    if (!dateOfJoining) return '0y 0m';
    
    try {
      const joinDate = new Date(dateOfJoining);
      const today = new Date();
      
      let years = today.getFullYear() - joinDate.getFullYear();
      let months = today.getMonth() - joinDate.getMonth();
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      return `${years}y ${months}m`;
    } catch (error) {
      console.error('Error calculating experience:', error);
      return '0y 0m';
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const handleUpdateProfile = async () => {
    alert('Update profile functionality to be implemented');
  };

  if (loading) {
    return (
      <div className="ios-profile-container">
        <div className="ios-loading">
          <div className="ios-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="ios-profile-container">
        <div className="ios-error-message">
          Failed to load profile. Please try again.
        </div>
        <button 
          onClick={loadUserProfile}
          style={{
            padding: '10px 20px',
            background: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            margin: '20px auto',
            display: 'block',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="ios-profile-container">
      <div className="ios-status-bar"></div>

      <div className="ios-profile-header">
        <h1 className="ios-profile-title">Profile</h1>
      </div>

      <div className="ios-content">
        {/* Debug Info (remove in production) */}
        {/* <div className="ios-list-card" style={{ marginBottom: '16px', background: '#f8f9fa' }}>
          <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Debug Info</h3>
          <div style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace' }}>
            <div>User ID: {userInfo.id || 'N/A'}</div>
            <div>Data Source: {userInfo.fullUser ? 'Login Response' : 'Stored Data'}</div>
          </div>
        </div> */}

        {/* Profile Card */}
        <div className="ios-profile-card">
          <div className="ios-profile-avatar">
            <div className="ios-avatar-large">
              <HiUserCircle size={80} color="#007AFF" />
            </div>
            <div className="ios-profile-info">
              <h2 className="ios-profile-name">
                {userInfo.firstname || userInfo.employeeName || userInfo.username || 'N/A'}
              </h2>
              <div className="ios-profile-email">
                <HiMail size={16} />
                <span>{userInfo.email || userInfo.employeeEmail || 'No email provided'}</span>
              </div>
              <div className="ios-profile-role" style={{ 
                marginTop: '4px', 
                fontSize: '14px', 
                color: '#8E8E93' 
              }}>
                {userInfo.employeeId ? `ID: ${userInfo.employeeId}` : ''}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="ios-stats-row">
            <div className="ios-stat">
              <div className="ios-stat-value">
                {userInfo.experience || '0y 0m'}
              </div>
              <div className="ios-stat-label">Experience</div>
            </div>
            <div className="ios-stat-divider"></div>
            <div className="ios-stat">
              <div className="ios-stat-value">
                {userInfo.department || 'N/A'}
              </div>
              <div className="ios-stat-label">Department</div>
            </div>
            <div className="ios-stat-divider"></div>
            <div className="ios-stat">
              <div className="ios-stat-value">
                {userInfo.employeeType || 'N/A'}
              </div>
              <div className="ios-stat-label">Type</div>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="ios-settings-section">
          <h3 className="ios-section-title">Personal Information</h3>
          <div className="ios-info-list">
            <div className="ios-info-item">
              <div className="ios-info-label">Full Name</div>
              <div className="ios-info-value">
                {userInfo.firstname || userInfo.employeeName || userInfo.username || 'N/A'}
              </div>
            </div>
            <div className="ios-info-divider"></div>
            <div className="ios-info-item">
              <div className="ios-info-label">Employee ID</div>
              <div className="ios-info-value">
                {userInfo.employeeId || userInfo.id || 'N/A'}
              </div>
            </div>
            <div className="ios-info-divider"></div>
            <div className="ios-info-item">
              <div className="ios-info-label">Gender</div>
              <div className="ios-info-value">
                {userInfo.gender || 'Not specified'}
              </div>
            </div>
            <div className="ios-info-divider"></div>
            <div className="ios-info-item">
              <div className="ios-info-label">
                <HiOutlineCake size={16} />
                <span>Date of Birth</span>
              </div>
              <div className="ios-info-value">
                {userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toLocaleDateString() : 'Not specified'}
              </div>
            </div>
            <div className="ios-info-divider"></div>
            <div className="ios-info-item">
              <div className="ios-info-label">
                <HiOutlinePhone size={16} />
                <span>Phone Number</span>
              </div>
              <div className="ios-info-value">
                {userInfo.phonenumber || userInfo.employeePhone || userInfo.phone || 'Not provided'}
              </div>
            </div>
            <div className="ios-info-divider"></div>
            <div className="ios-info-item">
              <div className="ios-info-label">
                <HiOutlineMapPin size={16} />
                <span>Email</span>
              </div>
              <div className="ios-info-value">
                {userInfo.email || userInfo.employeeEmail || 'Not provided'}
              </div>
            </div>
            <div className="ios-info-divider"></div>
            <div className="ios-info-item">
              <div className="ios-info-label">Date of Joining</div>
              <div className="ios-info-value">
                {userInfo.dateOfJoining ? new Date(userInfo.dateOfJoining).toLocaleDateString() : 'Not specified'}
              </div>
            </div>
            <div className="ios-info-divider"></div>
            <div className="ios-info-item">
              <div className="ios-info-label">Branch</div>
              <div className="ios-info-value">
                {userInfo.branch || 'Not specified'}
              </div>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="ios-settings-section">
          <h3 className="ios-section-title">Account Settings</h3>
          <div className="ios-settings-list">
            <div className="ios-settings-item" onClick={handleUpdateProfile}>
              <div className="ios-settings-icon">
                <HiPencil size={20} />
              </div>
              <span>Edit Profile</span>
              <HiChevronRight size={20} className="ios-chevron" />
            </div>
            <div className="ios-settings-item">
              <div className="ios-settings-icon">
                <HiShieldCheck size={20} />
              </div>
              <span>Privacy & Security</span>
              <HiChevronRight size={20} className="ios-chevron" />
            </div>
            <div className="ios-settings-item">
              <div className="ios-settings-icon">
                <HiCog size={20} />
              </div>
              <span>Settings</span>
              <HiChevronRight size={20} className="ios-chevron" />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="ios-action-container">
          <button 
            className="ios-action-button" 
            onClick={handleLogout}
            style={{
              background: '#FF3B30',
              color: 'white'
            }}
          >
            <span>Logout</span>
          </button>
        </div>
      </div>

      <BottomTab />
    </div>
  );
};

export default ProfilePage;