// // import { Navigate } from "react-router-dom";

// // export default function SuperAdminRoute({ children }) {
// //   // Check for the specific token created during Super Admin login
// //   const token = localStorage.getItem("superAdminToken");
// //   const role = localStorage.getItem("userRole");

// //   if (!token || role !== "super_admin") {
// //     // Redirect to the super admin login page if not authenticated
// //     return <Navigate to="/super-admin/login" replace />;
// //   }

// //   return children;
// // }

// import { useEffect } from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "./useAuth";
// import Loader from "../components/Loader";

// export default function SuperAdminRoute({ children }) {
//   const { user, loading, logout } = useAuth();

//   const hasAccess = user && user.role === "super_admin";

//   useEffect(() => {
//     if (user && !hasAccess) {
//       logout();
//     }
//   }, [user, hasAccess, logout]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen w-full bg-[#F0F2F8]">
//         <Loader />
//       </div>
//     );
//   }

//   if (!user || !hasAccess) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// }

import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import Loader from "../components/Loader";
import SecurityRedirect from "./security/SecurityRedirect";

export default function SuperAdminRoute({ children }) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-[#F0F2F8]">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = user.role === "super_admin";

  if (!hasAccess) {
    const correctPath =
      user.role === "hr_admin" ? "/admin/dashboard" : "/dashboard";

    return (
      <SecurityRedirect to={correctPath} userId={user.id} logout={logout} />
    );
  }

  return children;
}