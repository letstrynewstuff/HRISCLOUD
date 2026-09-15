// import { createContext, useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { authApi } from "../api/service/authApi";

// export const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [employee, setEmployee] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const navigate = useNavigate();

//   // ─── Normalize employee data ───────────────────────────────
//   const shapeEmployee = (u) => {
//     const isManager =
//       u.role === "manager" || u.isManager === true || u.manages_team === true;

//     return {
//       id: u.employeeId ?? u.id,
//       name:
//         `${u.firstName ?? u.first_name ?? ""} ${
//           u.lastName ?? u.last_name ?? ""
//         }`.trim() || u.email,
//       initials:
//         `${(u.firstName ?? u.first_name ?? "")[0]?.toUpperCase() ?? ""}${
//           (u.lastName ?? u.last_name ?? "")[0]?.toUpperCase() ?? ""
//         }` || "NA",
//       role: u.role ?? "employee",
//       jobTitle: u.jobTitle ?? u.job_title ?? "Employee",
//       email: u.email,
//       avatar: u.avatar ?? null,
//       employeeCode: u.employeeCode ?? u.employee_code ?? null,
//       department: u.department ?? u.department_name ?? null,
//       companyId: u.companyId ?? u.company_id,
//       isManager,
//     };
//   };

//   // ─── Fetch current user ────────────────────────────────────
//   const fetchMe = useCallback(async () => {
//     const token = localStorage.getItem("accessToken");

//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await authApi.getMe();
//       const u = res.user ?? res.data ?? res;

//       setUser(u);
//       setEmployee(shapeEmployee(u));
//     } catch (err) {
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");

//       setUser(null);
//       setEmployee(null);
//       setError(err?.response?.data?.message || "Session expired");

//       // optional redirect safety
//       navigate("/login", { replace: true });
//     } finally {
//       setLoading(false);
//     }
//   }, [navigate]);

//   // ─── Init auth on mount ────────────────────────────────────
//   useEffect(() => {
//     fetchMe();
//   }, [fetchMe]);

//   // ─── Listen for global logout event (from axios) ──────────
//   useEffect(() => {
//     const handleLogout = () => {
//       setUser(null);
//       setEmployee(null);
//       setLoading(false);

//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");

//       navigate("/login", { replace: true });
//     };

//     window.addEventListener("auth:logout", handleLogout);

//     return () => {
//       window.removeEventListener("auth:logout", handleLogout);
//     };
//   }, [navigate]);

//   // ─── Manual logout ─────────────────────────────────────────
//   const logout = useCallback(async () => {
//     try {
//       await authApi.logout(localStorage.getItem("refreshToken"));
//     } catch (_) {}

//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");

//     setUser(null);
//     setEmployee(null);

//     navigate("/login", { replace: true });
//   }, [navigate]);

//   // ─── Refresh user ──────────────────────────────────────────
//   const refreshUser = useCallback(async () => {
//     try {
//       const res = await authApi.getMe();
//       const u = res.user ?? res.data ?? res;

//       setUser(u);
//       setEmployee(shapeEmployee(u));
//     } catch (_) {}
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         employee,
//         loading,
//         error,
//         logout,
//         refreshUser,
//         setUser,
//         setEmployee,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// import { createContext, useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { authApi } from "../api/service/authApi";

// export const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [employee, setEmployee] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const navigate = useNavigate();

//   // ─────────────────────────────────────────────
//   // Normalize employee data
//   // ─────────────────────────────────────────────
//   const shapeEmployee = (u) => {
//     const isManager =
//       u.role === "manager" || u.isManager === true || u.manages_team === true;

//     return {
//       id: u.employeeId ?? u.id,
//       name:
//         `${u.firstName ?? u.first_name ?? ""} ${
//           u.lastName ?? u.last_name ?? ""
//         }`.trim() || u.email,

//       initials:
//         `${(u.firstName ?? u.first_name ?? "")[0]?.toUpperCase() ?? ""}${
//           (u.lastName ?? u.last_name ?? "")[0]?.toUpperCase() ?? ""
//         }` || "NA",

//       role: u.role ?? "employee",
//       jobTitle: u.jobTitle ?? u.job_title ?? "Employee",
//       email: u.email,
//       avatar: u.avatar ?? null,
//       employeeCode: u.employeeCode ?? u.employee_code ?? null,
//       department: u.department ?? u.department_name ?? null,
//       companyId: u.companyId ?? u.company_id,
//       isManager,
//     };
//   };

//   // ─────────────────────────────────────────────
//   // Fetch current logged in user
//   // ─────────────────────────────────────────────
//   // const fetchMe = useCallback(async () => {
//   //   const token = localStorage.getItem("accessToken");

//   //   if (!token) {
//   //     setLoading(false);
//   //     return;
//   //   }

//   //   try {
//   //     const res = await authApi.getMe();
//   //     const u = res.user ?? res.data ?? res;

//   //     setUser(u);
//   //     setEmployee(shapeEmployee(u));
//   //     setError(null);
//   //   } catch (err) {
//   //     localStorage.removeItem("accessToken");

//   //     setUser(null);
//   //     setEmployee(null);
//   //     setError(err?.response?.data?.message || "Session expired");

//   //     navigate("/login", { replace: true });
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }, [navigate]);

//   const fetchMe = useCallback(async () => {
//     const token = localStorage.getItem("accessToken");

//     try {
//       // If we have no access token, try using the refresh cookie
//       if (!token) {
//         const refresh = await authApi.refresh();

//         localStorage.setItem("accessToken", refresh.accessToken);
//       }

//       const res = await authApi.getMe();
//       const u = res.user ?? res.data ?? res;

//       setUser(u);
//       setEmployee(shapeEmployee(u));
//     } catch (err) {
//       localStorage.removeItem("accessToken");

//       setUser(null);
//       setEmployee(null);
//       setError(err?.response?.data?.message || "Session expired");

//       navigate("/login", { replace: true });
//     } finally {
//       setLoading(false);
//     }
//   }, [navigate]);

//   // ─────────────────────────────────────────────
//   // Initial auth check
//   // ─────────────────────────────────────────────
//   useEffect(() => {
//     fetchMe();
//   }, [fetchMe]);

//   // ─────────────────────────────────────────────
//   // Listen for logout from axios interceptor
//   // ─────────────────────────────────────────────
//   useEffect(() => {
//     const handleLogout = () => {
//       localStorage.removeItem("accessToken");

//       setUser(null);
//       setEmployee(null);
//       setLoading(false);

//       navigate("/login", { replace: true });
//     };

//     window.addEventListener("auth:logout", handleLogout);

//     return () => {
//       window.removeEventListener("auth:logout", handleLogout);
//     };
//   }, [navigate]);

//   // ─────────────────────────────────────────────
//   // Manual logout
//   // ─────────────────────────────────────────────
//   const logout = useCallback(async () => {
//     try {
//       // Cookie is sent automatically
//       await authApi.logout();
//     } catch (err) {
//       console.error(err);
//     }

//     localStorage.removeItem("accessToken");

//     setUser(null);
//     setEmployee(null);

//     navigate("/login", { replace: true });
//   }, [navigate]);

//   // ─────────────────────────────────────────────
//   // Refresh user profile
//   // ─────────────────────────────────────────────
//   const refreshUser = useCallback(async () => {
//     try {
//       const res = await authApi.getMe();
//       const u = res.user ?? res.data ?? res;

//       setUser(u);
//       setEmployee(shapeEmployee(u));
//     } catch (err) {
//       console.error(err);
//     }
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         employee,
//         loading,
//         error,
//         logout,
//         refreshUser,
//         setUser,
//         setEmployee,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/service/authApi";

export const AuthContext = createContext(null);

// ─── Cookie helpers ──────────────────────────────────────────
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, minutes = 60) {
  const isProd = import.meta.env.MODE === "production";
  const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${
    isProd ? "; Secure" : ""
  }`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// ─── Clear violation cookie on fresh login ───────────────────
function clearViolationCookie() {
  document.cookie =
    "auth_violations=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ─────────────────────────────────────────────
  // Normalize employee data
  // ─────────────────────────────────────────────
  const shapeEmployee = (u) => {
    const isManager =
      u.role === "manager" || u.isManager === true || u.manages_team === true;

    return {
      id: u.employeeId ?? u.id,
      name:
        `${u.firstName ?? u.first_name ?? ""} ${
          u.lastName ?? u.last_name ?? ""
        }`.trim() || u.email,

      initials:
        `${(u.firstName ?? u.first_name ?? "")[0]?.toUpperCase() ?? ""}${
          (u.lastName ?? u.last_name ?? "")[0]?.toUpperCase() ?? ""
        }` || "NA",

      role: u.role ?? "employee",
      jobTitle: u.jobTitle ?? u.job_title ?? "Employee",
      email: u.email,
      avatar: u.avatar ?? null,
      employeeCode: u.employeeCode ?? u.employee_code ?? null,
      department: u.department ?? u.department_name ?? null,
      companyId: u.companyId ?? u.company_id,
      isManager,
    };
  };

  // ─────────────────────────────────────────────
  // Fetch current logged in user
  // ─────────────────────────────────────────────
  const fetchMe = useCallback(async () => {
    const token = getCookie("accessToken");

    try {
      // If we have no access token, try using the refresh cookie
      if (!token) {
        const refresh = await authApi.refresh();
        setCookie("accessToken", refresh.accessToken, 60); // 60 min
      }

      const res = await authApi.getMe();
      const u = res.user ?? res.data ?? res;

      setUser(u);
      setEmployee(shapeEmployee(u));

      // Clean slate on successful auth
      clearViolationCookie();
    } catch (err) {
      deleteCookie("accessToken");

      setUser(null);
      setEmployee(null);
      setError(err?.response?.data?.message || "Session expired");

      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ─────────────────────────────────────────────
  // Initial auth check
  // ─────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const performFetch = async () => {
      if (isMounted) {
        await fetchMe();
      }
    };

    performFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─────────────────────────────────────────────
  // Listen for logout from axios interceptor
  // ─────────────────────────────────────────────
  useEffect(() => {
    const handleLogout = () => {
      deleteCookie("accessToken");

      setUser(null);
      setEmployee(null);
      setLoading(false);

      navigate("/login", { replace: true });
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [navigate]);

  // ─────────────────────────────────────────────
  // Manual logout
  // ─────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // Cookie is sent automatically
      await authApi.logout();
    } catch (err) {
      console.error(err);
    }

    deleteCookie("accessToken");

    setUser(null);
    setEmployee(null);

    navigate("/login", { replace: true });
  }, [navigate]);

  // ─────────────────────────────────────────────
  // Refresh user profile
  // ─────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      const u = res.user ?? res.data ?? res;

      setUser(u);
      setEmployee(shapeEmployee(u));
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        loading,
        error,
        logout,
        refreshUser,
        setUser,
        setEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
