import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    const hasRequiredRole = rolesArray.includes(user?.role);

    if (!hasRequiredRole) {
      console.log(
        `Access denied. User role: ${user?.role}, Required: ${rolesArray.join(", ")}`,
      );
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};
