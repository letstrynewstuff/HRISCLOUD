// src/admin/attendance/OvertimeManagement.jsx
import { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { attendanceApi } from "../../api/service/attendanceApi";
import { getEmployees } from "../../api/service/employeeApi";
import { C } from "../employeemanagement/sharedData";

import Loader from "../../components/Loader";

export default function OvertimeManagement() {
  const [records, setRecords] = useState([]);
  const [empMap, setEmpMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioning, setActioning] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [attRes, empRes] = await Promise.all([
        attendanceApi.getAll({ limit: 200 }),
        getEmployees({ limit: 500 }),
      ]);

      const all = attRes.rows ?? [];
      setRecords(all.filter((r) => r.overtimeHours > 0));

      const map = {};
      (empRes.data ?? empRes ?? []).forEach((e) => {
        map[e.id] = {
          name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
          department: e.department_name ?? e.department ?? "—",
        };
      });
      setEmpMap(map);
    } catch {
      setError("Failed to load overtime records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (record) => {
    setActioning(record.id);
    try {
      await attendanceApi.correct(record.id, {
        overtimeHours: record.overtimeHours,
        editReason: "Overtime approved by HR",
      });
      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id ? { ...r, isManuallyEdited: true } : r,
        ),
      );
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to approve overtime.");
    } finally {
      setActioning(null);
    }
  };

  const empName = (r) => {
    const e = empMap[r.employeeId] ?? r.employee ?? {};
    return (e.name ?? `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim()) || "—";
  };

  const empDept = (r) => {
    const e = empMap[r.employeeId] ?? r.employee ?? {};
    return e.department ?? "—";
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="rounded-2xl overflow-hidden min-h-[420px] flex items-center justify-center"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        {loading ? (
          <Loader />
        ) : error ? (
          <div
            className="py-12 text-center text-sm"
            style={{ color: C.danger }}
          >
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2">
            <Clock size={28} style={{ color: C.textMuted }} />
            <p className="text-sm" style={{ color: C.textMuted }}>
              No overtime records found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: C.surfaceAlt,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {[
                    "Employee",
                    "Department",
                    "Date",
                    "Hours Worked",
                    "Overtime Hours",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold uppercase"
                      style={{ color: C.textMuted }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const approved = r.isManuallyEdited;
                  return (
                    <tr
                      key={r.id}
                      className="border-b"
                      style={{ borderColor: C.border }}
                    >
                      <td
                        className="px-4 py-3 font-medium text-sm"
                        style={{ color: C.textPrimary }}
                      >
                        {empName(r)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: C.primaryLight,
                            color: C.primary,
                          }}
                        >
                          {empDept(r)}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: C.textSecondary }}
                      >
                        {r.attendanceDate
                          ? new Date(r.attendanceDate).toLocaleDateString(
                              "en-GB",
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-sm">
                        {r.hoursWorked != null
                          ? `${Number(r.hoursWorked).toFixed(1)}h`
                          : "—"}
                      </td>
                      <td
                        className="px-4 py-3 font-semibold text-sm"
                        style={{ color: C.warning }}
                      >
                        +{Number(r.overtimeHours).toFixed(1)}h
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{
                            background: approved ? "#D1FAE5" : "#FEF3C7",
                            color: approved ? "#10B981" : "#F59E0B",
                          }}
                        >
                          {approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!approved && (
                          <Motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApprove(r)}
                            disabled={actioning === r.id}
                            className="flex items-center gap-1.5 p-2 rounded-lg"
                            style={{ background: "#D1FAE5", color: "#10B981" }}
                          >
                            {actioning === r.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={14} />
                            )}
                          </Motion.button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Motion.div>
  );
}
