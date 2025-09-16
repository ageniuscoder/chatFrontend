import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, userAPI } from '../utils/api';
import { useApi } from '../hooks/useApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ New state for initial loading

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
    try {
      const result = await profileApi.execute();
      if (result.success) {
        setUser(result.data);
      } else { // FIX: Explicitly handle failed authentication
        setUser(null);
      }
    } catch (error) {
      // The useApi hook handles setting the error state, so we just set the user to null here.
      setUser(null);
    } finally {
      setIsLoading(false); // ✅ Set loading to false after check is complete
    }
  };

  const login = async (username, password) => {
    const result = await loginApi.execute({ username, password });
    if (result.success) {
      const profileResult = await profileApi.execute();
      if (profileResult.success) setUser(profileResult.data);
      return { success: true, data: profileResult.data };
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

  const forgotPassword = (email) => forgotApi.execute({ email });

  const resetPassword = async (resetData) => {
    const result = await resetApi.execute({
      email: resetData.email,
      otp: resetData.otp,
      new_password: resetData.new_password,
    });
    return result;
  };

  const updateProfile = async (profileData) => {
    const result = await updateProfileApi.execute(profileData);
    if (result.success) {
      // ✅ FIX: Directly update the user state with the data from the API response.
      // This prevents the race condition and unnecessary re-fetching.
      setUser(result.data);
    }
    return result;
  };

  const logout = async () => {
    // 1. Immediately set the user state to null. This will cause the UI
    //    to unmount protected components and trigger a redirect.
    setUser(null);
    try {
      // 2. Call the backend to clear the HTTP-only cookie in the background.
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      // The state is already updated, so no further action is needed here.
    }
  };

  const value = {
    user,
    isLoading, // ✅ Expose the new state
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