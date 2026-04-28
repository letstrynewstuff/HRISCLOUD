import { Navigate } from "react-router-dom";

export default function SuperAdminRoute({ children }) {
  // Check for the specific token created during Super Admin login
  const token = localStorage.getItem("superAdminToken");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "super_admin") {
    // Redirect to the super admin login page if not authenticated
    return <Navigate to="/super-admin/login" replace />;
  }

  return children;
}
