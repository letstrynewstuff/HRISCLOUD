// src/components/ProtectedRoute.jsx
// Guards all employee pages. Redirects to /login if not authenticated.
// Optionally gate by role: <ProtectedRoute requireManager /> blocks non-managers.

import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ children, requireManager = false }) {
  const { user, employee, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F0F2F8",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "3px solid #4F46E5",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Block non-managers from /managerprofile
  if (requireManager && !employee?.isManager) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}
