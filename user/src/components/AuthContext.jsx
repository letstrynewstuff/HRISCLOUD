// src/context/AuthContext.jsx
// Global auth state for the EMPLOYEE-side app.
// Wrap your router with <AuthProvider> in main.jsx / App.jsx.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/service/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const shapeEmployee = (u) => {
    const isManager =
      u.role === "manager" || u.isManager === true || u.manages_team === true;
    return {
      id: u.employeeId ?? u.id,
      name:
        `${u.firstName ?? u.first_name ?? ""} ${u.lastName ?? u.last_name ?? ""}`.trim() ||
        u.email,
      initials:
        `${(u.firstName ?? u.first_name ?? "")[0]?.toUpperCase() ?? ""}${(u.lastName ?? u.last_name ?? "")[0]?.toUpperCase() ?? ""}` ||
        "NA",
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

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      const u = res.user ?? res.data ?? res;
      setUser(u);
      setEmployee(shapeEmployee(u));
    } catch (e) {
      localStorage.removeItem("accessToken");
      setUser(null);
      setEmployee(null);
      setError(e?.response?.data?.message ?? "Session expired.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout(localStorage.getItem("refreshToken"));
    } catch (_) {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setEmployee(null);
    navigate("/login", { replace: true });
  }, [navigate]);

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
      value={{ user, employee, loading, error, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};