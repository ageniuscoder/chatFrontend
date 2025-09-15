import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Loading from './Loading';

const Layout = ({ children, requireAuth = true }) => {
  const { isLoading, isAuthenticated } = useAuth(); // ✅ Use isLoading

  if (isLoading) { // ✅ Check for the new initial loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    );
  }

  // If a protected page requires authentication, but the user is not authenticated, redirect to login.
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a public page is being accessed by an authenticated user, redirect to chat.
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }
  
  // For any other case (public page and not authenticated), render the child component.
  return <div className="min-h-screen bg-gray-50">{children}</div>;
};

export default Layout;