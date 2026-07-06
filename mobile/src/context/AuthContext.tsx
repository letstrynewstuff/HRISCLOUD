// // src/context/AuthContext.tsx
// // Mobile equivalent of the web AuthContext — same shape, same API,
// // SecureStore instead of localStorage, router.replace instead of
// // react-router's navigate.

// import {
//   createContext,
//   useState,
//   useEffect,
//   useCallback,
//   ReactNode,
// } from "react";
// import * as SecureStore from "expo-secure-store";
// import { router } from "expo-router";
// import { authApi } from "../api/service/authApi";

// type Employee = {
//   id: string;
//   name: string;
//   initials: string;
//   role: string;
//   jobTitle: string;
//   email: string;
//   avatar: string | null;
//   employeeCode: string | null;
//   department: string | null;
//   companyId: string;
//   isManager: boolean;
// };

// type AuthContextType = {
//   user: any;
//   employee: Employee | null;
//   loading: boolean;
//   error: string | null;
//   logout: () => Promise<void>;
//   refreshUser: () => Promise<void>;
//   setUser: (u: any) => void;
//   setEmployee: (e: Employee | null) => void;
// };

// export const AuthContext = createContext<AuthContextType | null>(null);

// // ─── Role → route map ───────────────────────────────────────
// const ROLE_ROUTES: Record<string, string> = {
//   // hr_admin: "/employee/dashboard", // swap when an admin stack exists
//   // admin: "/employee/dashboard",
//   hr_admin: "/admin/dashboard", 
//   admin: "/admin/dashboard",
//   hr: "/employee/dashboard",
//   employee: "/employee/dashboard",
// };

// function shapeEmployee(u: any): Employee {
//   const isManager =
//     u.role === "manager" || u.isManager === true || u.manages_team === true;

//   return {
//     id: u.employeeId ?? u.id,
//     name:
//       `${u.firstName ?? u.first_name ?? ""} ${u.lastName ?? u.last_name ?? ""}`.trim() ||
//       u.email,
//     initials:
//       `${(u.firstName ?? u.first_name ?? "")[0]?.toUpperCase() ?? ""}${
//         (u.lastName ?? u.last_name ?? "")[0]?.toUpperCase() ?? ""
//       }` || "NA",
//     role: u.role ?? "employee",
//     jobTitle: u.jobTitle ?? u.job_title ?? "Employee",
//     email: u.email,
//     avatar: u.avatar ?? null,
//     employeeCode: u.employeeCode ?? u.employee_code ?? null,
//     department: u.department ?? u.department_name ?? null,
//     companyId: u.companyId ?? u.company_id,
//     isManager,
//   };
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<any>(null);
//   const [employee, setEmployee] = useState<Employee | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // ─── Fetch current user on mount ────────────────────────────
//   const fetchMe = useCallback(async () => {
//     const token = await SecureStore.getItemAsync("accessToken");

//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await authApi.getMe();
//       const u = res.user ?? res.data ?? res;

//       setUser(u);
//       setEmployee(shapeEmployee(u));
//     } catch (err: any) {
//       await SecureStore.deleteItemAsync("accessToken");
//       await SecureStore.deleteItemAsync("refreshToken");

//       setUser(null);
//       setEmployee(null);
//       setError(err?.response?.data?.message || "Session expired");

//       router.replace("/auth/login");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchMe();
//   }, [fetchMe]);

//   // ─── Manual logout ───────────────────────────────────────────
//   const logout = useCallback(async () => {
//     try {
//       const refreshToken = await SecureStore.getItemAsync("refreshToken");
//       await authApi.logout(refreshToken ?? undefined);
//     } catch (_) {}

//     await SecureStore.deleteItemAsync("accessToken");
//     await SecureStore.deleteItemAsync("refreshToken");

//     setUser(null);
//     setEmployee(null);

//     router.replace("/auth/login");
//   }, []);

//   // ─── Refresh user ────────────────────────────────────────────
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

// export { ROLE_ROUTES };


// src/context/AuthContext.tsx
// Handles BOTH employees and standalone HR admins.

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { authApi } from "../api/service/authApi";

type Employee = {
  id: string;
  name: string;
  initials: string;
  role: string;
  jobTitle: string;
  email: string;
  avatar: string | null;
  employeeCode: string | null;
  department: string | null;
  companyId: string;
  isManager: boolean;
};

type AuthContextType = {
  user: any;
  employee: Employee | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: any) => void;
  setEmployee: (e: Employee | null) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

// ─── Role → route map ───────────────────────────────────────
// hr_admin and super_admin are STANDALONE admins, not employees.
const ROLE_ROUTES: Record<string, string> = {
  hr_admin: "/admin/dashboard",
  super_admin: "/admin/dashboard",
  hr: "/employee/dashboard",
  employee: "/employee/dashboard",
  manager: "/employee/dashboard",
};

// ─── Check if user is a standalone admin (not an employee) ──
function isStandaloneAdmin(role?: string): boolean {
  return role === "hr_admin" || role === "super_admin";
}

function shapeEmployee(u: any): Employee | null {
  // If user is a standalone admin, they have NO employee record
  if (isStandaloneAdmin(u.role)) {
    return null;
  }

  const isManager =
    u.role === "manager" || u.isManager === true || u.manages_team === true;

  return {
    id: u.employeeId ?? u.id,
    name:
      `${u.firstName ?? u.first_name ?? ""} ${u.lastName ?? u.last_name ?? ""}`.trim() ||
      u.email,
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
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch current user on mount ────────────────────────────
  const fetchMe = useCallback(async () => {
    const token = await SecureStore.getItemAsync("accessToken");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getMe();
      const u = res.user ?? res.data ?? res;

      setUser(u);
      setEmployee(shapeEmployee(u));
    } catch (err: any) {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");

      setUser(null);
      setEmployee(null);
      setError(err?.response?.data?.message || "Session expired");

      router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // ─── Manual logout ───────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      await authApi.logout(refreshToken ?? undefined);
    } catch (_) {}

    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");

    setUser(null);
    setEmployee(null);

    router.replace("/auth/login");
  }, []);

  // ─── Refresh user ────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      const u = res.user ?? res.data ?? res;

      setUser(u);
      setEmployee(shapeEmployee(u));
    } catch (_) {}
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

export { ROLE_ROUTES, isStandaloneAdmin };