import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await userAPI.getProfile();
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.login({ username, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      
      const userResponse = await userAPI.getProfile();
      setUser(userResponse.data);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signupInitiate = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.signupInitiate(userData);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signupVerify = async (verificationData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.signupVerify(verificationData);
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      const userResponse = await userAPI.getProfile();
      setUser(userResponse.data);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Verification failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (phone) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.forgotInitiate({ phone });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to initiate password reset';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetData) => {
    try {
      setError(null);
      setLoading(true);
      await authAPI.forgotReset({
        phone: resetData.phone,
        otp: resetData.otp,
        // Fix: Use "new_password" key to match the backend API's JSON tag.
        new_password: resetData.newPassword,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password reset failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await userAPI.updateProfile(profileData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signupInitiate,
    signupVerify,
    forgotPassword,
    resetPassword,
    updateProfile,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};