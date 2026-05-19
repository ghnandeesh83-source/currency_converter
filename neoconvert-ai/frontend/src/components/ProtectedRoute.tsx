import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAuthenticated,
  fallback = <div>Please login to access this page</div>
}) => {
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

export default ProtectedRoute;
