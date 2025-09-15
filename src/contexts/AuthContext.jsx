import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, userAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';
import { getCookie,eraseCookie } from '../utils/cookieUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Use your custom hook for API calls
  const loginApi = useApi(authAPI.login);
  const signupInitiateApi = useApi(authAPI.signupInitiate);
  const signupVerifyApi = useApi(authAPI.signupVerify);
  const forgotApi = useApi(authAPI.forgotInitiate);
  const resetApi = useApi(authAPI.forgotReset);
  const updateProfileApi = useApi(userAPI.updateProfile);
  const profileApi = useApi(userAPI.getProfile);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getCookie('token');
    if (token) {
      const result = await profileApi.execute();
      if (result.success) {
        setUser(result.data);
      } else {
        eraseCookie('token');
        setUser(null);
      }
    }
  };

  const login = async (username, password) => {
    const result = await loginApi.execute({ username, password });
    if (result.success) {
      const profileResult = await profileApi.execute();
      if (profileResult.success) setUser(profileResult.data);
      return { success: true,data: profileResult.data}
      
    }
    return { success: false, message: result.error || 'Login failed' };
  };

  const signupInitiate = (userData) => signupInitiateApi.execute(userData);

  const signupVerify = async (verificationData) => {
    const result = await signupVerifyApi.execute(verificationData);
    if (result.success) {
      const profileResult = await profileApi.execute();
      if (profileResult.success) setUser(profileResult.data);
    }
    return result;
  };

  const forgotPassword = (phone) => forgotApi.execute({ phone });

  const resetPassword = async (resetData) => {
    const result = await resetApi.execute({
      phone: resetData.phone,
      otp: resetData.otp,
      new_password: resetData.new_password,
    });
    return result; // Explicitly return the result with success/error properties
  };

  const updateProfile = async (profileData) => {
    const result = await updateProfileApi.execute(profileData);
    if (result.success) setUser(updateProfileApi.data);
    return result;
  };

  const logout = () => {
    eraseCookie('token');
    setUser(null);
  };

  const value = {
    user,
    loading:
      loginApi.loading ||
      signupInitiateApi.loading ||
      signupVerifyApi.loading ||
      forgotApi.loading ||
      resetApi.loading ||
      updateProfileApi.loading ||
      profileApi.loading,
    error:
      loginApi.error ||
      signupInitiateApi.error ||
      signupVerifyApi.error ||
      forgotApi.error ||
      resetApi.error ||
      updateProfileApi.error ||
      profileApi.error,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
