// src/components/PayrollContext.tsx
//
// Shared across the web (src/admin/payroll/PayrollPage.jsx) and native
// (src/app/admin/payroll.tsx) payroll screens — pure React + API calls,
// no DOM or React Native-specific imports, so it works unmodified on both
// platforms.
//
// Wraps the payroll "run" lifecycle (init → process → approve → mark paid)
// behind a small set of stable function names so the wizard views don't
// need to know the underlying endpoint shapes.
//
// NOTE: the four lifecycle calls below (createRun / processRun / approveRun
// / markRunPaid) assume `../api/service/payrollApi` exports functions with
// these names. If your actual payrollApi module names them differently
// (e.g. `initRun`, `runPayroll`, `approvePayrollRun`, `markPaid`), just
// update the import + the four one-line wrapper calls — nothing else in
// this file or in RunPayrollView needs to change, since they only ever
// consume `startRun`, `runProcess`, `runApprove`, and `runMarkPaid` from
// the context.

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import * as payrollApi from "../../../api/service/payrollApi";

export type PayrollMode = "manual" | "assisted";

type StartRunInput = {
  month: number;
  year: number;
  mode: PayrollMode;
  notes?: string;
};

type PayrollContextValue = {
  /** Last-selected payroll mode, persisted across steps/tabs for convenience */
  mode: PayrollMode;
  setMode: (mode: PayrollMode) => void;

  /** id of the run currently being worked on, if any */
  activeRunId: string | null;
  setActiveRunId: (id: string | null) => void;

  /** Step 0 — initialise / fetch-if-existing a run for a given period */
  startRun: (input: StartRunInput) => Promise<any>;
  /** Step 1 — trigger server-side calculation of all employee earnings */
  runProcess: (runId: string) => Promise<any>;
  /** Step 2 — mark the run as approved, unlocking the summary step */
  runApprove: (runId: string) => Promise<any>;
  /** Step 3 — finalise the run as paid (manual) or exported (assisted) */
  runMarkPaid: (runId: string) => Promise<any>;
};

const PayrollContext = createContext<PayrollContextValue | undefined>(
  undefined,
);

const REQUEST_TIMEOUT_MS = 30_000;

// Wrap a promise so slow/hanging requests reject with `{ isTimeout: true }`,
// matching the timeout-recovery branch RunPayrollView already handles.
function withTimeout<T>(
  promise: Promise<T>,
  ms = REQUEST_TIMEOUT_MS,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject({ isTimeout: true, message: "Request timed out." });
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export function PayrollProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PayrollMode>("manual");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const startRun = useCallback(async (input: StartRunInput) => {
    const res: any = await payrollApi.createRun(input);
    const run = res?.data ?? res;
    if (run?.id) setActiveRunId(run.id);
    return run;
  }, []);

  const runProcess = useCallback(async (runId: string) => {
    return withTimeout(
      (async () => {
        const res: any = await payrollApi.processRun(runId);
        return res?.data ?? res;
      })(),
    );
  }, []);

  const runApprove = useCallback(async (runId: string) => {
    const res: any = await payrollApi.approveRun(runId);
    return res?.data ?? res;
  }, []);

  const runMarkPaid = useCallback(async (runId: string) => {
    const res: any = await payrollApi.markRunPaid(runId);
    return res?.data ?? res;
  }, []);

  const value = useMemo<PayrollContextValue>(
    () => ({
      mode,
      setMode,
      activeRunId,
      setActiveRunId,
      startRun,
      runProcess,
      runApprove,
      runMarkPaid,
    }),
    [mode, activeRunId, startRun, runProcess, runApprove, runMarkPaid],
  );

  return (
    <PayrollContext.Provider value={value}>{children}</PayrollContext.Provider>
  );
}

export function usePayroll(): PayrollContextValue {
  const ctx = useContext(PayrollContext);
  if (!ctx) {
    throw new Error("usePayroll must be used within a <PayrollProvider>.");
  }
  return ctx;
}
