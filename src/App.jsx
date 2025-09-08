import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ChatProvider } from './contexts/ChatContext.jsx';
import { WebSocketProvider } from './contexts/WebSocketContext.jsx';

// Components
import Layout from './components/common/Layout';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import ChatLayout from './components/chat/ChatLayout';
import ProfilePage from './components/profile/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              <Layout requireAuth={false}>
                <LoginPage />
              </Layout>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <Layout requireAuth={false}>
                <SignupPage />
              </Layout>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <Layout requireAuth={false}>
                <ForgotPasswordPage />
              </Layout>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/chat" 
            element={
              <Layout requireAuth={true}>
                <ChatProvider>
                  <WebSocketProvider>
                    <ChatLayout />
                  </WebSocketProvider>
                </ChatProvider>
              </Layout>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <Layout requireAuth={true}>
                <ProfilePage />
              </Layout>
            } 
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;