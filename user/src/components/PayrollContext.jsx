// src/context/PayrollContext.jsx
// Global state for payroll module — mode selection, active run, deductions cache.
import { createContext, useContext, useReducer, useCallback } from "react";
import {
  getDashboard,
  getDeductions,
  listRuns,
  initRun,
  processRun,
  approveRun,
  markPaid,
} from "../api/service/payrollApi";

/* ─── Initial state ─── */
const INIT = {
  mode: null, // 'manual' | 'assisted' | null
  dashboard: null,
  deductions: [],
  runs: [],
  activeRun: null,
  loadingDash: false,
  loadingRuns: false,
  loadingDeductions: false,
  error: null,
};

/* ─── Reducer ─── */
function reducer(state, action) {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_DASHBOARD":
      return { ...state, dashboard: action.payload, loadingDash: false };
    case "SET_DEDUCTIONS":
      return { ...state, deductions: action.payload, loadingDeductions: false };
    case "SET_RUNS":
      return { ...state, runs: action.payload, loadingRuns: false };
    case "SET_ACTIVE_RUN":
      return { ...state, activeRun: action.payload };
    case "LOADING_DASH":
      return { ...state, loadingDash: true, error: null };
    case "LOADING_RUNS":
      return { ...state, loadingRuns: true, error: null };
    case "LOADING_DEDUCTIONS":
      return { ...state, loadingDeductions: true, error: null };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loadingDash: false,
        loadingRuns: false,
        loadingDeductions: false,
      };
    default:
      return state;
  }
}

const PayrollContext = createContext(null);

export function PayrollProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INIT);

  const setMode = useCallback(
    (mode) => dispatch({ type: "SET_MODE", payload: mode }),
    [],
  );

  const fetchDashboard = useCallback(async () => {
    dispatch({ type: "LOADING_DASH" });
    try {
      const res = await getDashboard();
      dispatch({ type: "SET_DASHBOARD", payload: res.data });
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        payload: e?.response?.data?.message ?? "Failed to load dashboard.",
      });
    }
  }, []);

  const fetchDeductions = useCallback(async () => {
    dispatch({ type: "LOADING_DEDUCTIONS" });
    try {
      const res = await getDeductions();
      dispatch({ type: "SET_DEDUCTIONS", payload: res.data ?? [] });
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        payload: e?.response?.data?.message ?? "Failed to load deductions.",
      });
    }
  }, []);

  const fetchRuns = useCallback(async () => {
    dispatch({ type: "LOADING_RUNS" });
    try {
      const res = await listRuns();
      dispatch({ type: "SET_RUNS", payload: res.data ?? [] });
    } catch (e) {
      dispatch({
        type: "SET_ERROR",
        payload: e?.response?.data?.message ?? "Failed to load runs.",
      });
    }
  }, []);

  const startRun = useCallback(async (payload) => {
    const res = await initRun(payload);
    dispatch({ type: "SET_ACTIVE_RUN", payload: res.data });
    return res.data;
  }, []);

  const runProcess = useCallback(async (id) => {
    const res = await processRun(id);
    dispatch({ type: "SET_ACTIVE_RUN", payload: res.data });
    return res.data;
  }, []);

  const runApprove = useCallback(async (id) => {
    const res = await approveRun(id);
    dispatch({ type: "SET_ACTIVE_RUN", payload: res.data });
    return res.data;
  }, []);

  const runMarkPaid = useCallback(async (id) => {
    const res = await markPaid(id);
    dispatch({ type: "SET_ACTIVE_RUN", payload: res.data });
    return res.data;
  }, []);

  return (
    <PayrollContext.Provider
      value={{
        ...state,
        setMode,
        fetchDashboard,
        fetchDeductions,
        fetchRuns,
        startRun,
        runProcess,
        runApprove,
        runMarkPaid,
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
}

export const usePayroll = () => {
  const ctx = useContext(PayrollContext);
  if (!ctx) throw new Error("usePayroll must be used inside PayrollProvider");
  return ctx;
};
