import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

import BantaHRLetterLoader from "../styles/BantaHRLetterLoader";



export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // 1. Centered Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-[#F0F2F8]">
        <BantaHRLetterLoader />
      </div>
    );
  }

  /**
   * 2. Expanded Authorization Logic
   * We now include 'manager' to allow them to handle team-specific
   * tasks like document management and productivity tracking.
   */
  const authorizedRoles = ["hr_admin", "super_admin", "manager"];
  const hasAccess = user && authorizedRoles.includes(user.role);

  // 3. Protection Guard
  if (!user || !hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
