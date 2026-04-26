// src/admin/training/TrainingAttendance.jsx
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Check, RefreshCw } from "lucide-react";
import {
  listTrainings,
  getEnrollments,
  markAttendance,
  issueCertificate,
} from "../../api/service/trainingApi";
import { C } from "../employeemanagement/sharedData";

export default function TrainingAttendance() {
  const [trainings, setTrainings] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [records, setRecords] = useState([]);
  const [loadingTrainings, setLoadingTrainings] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    listTrainings({ limit: 100 })
      .then((r) => {
        setTrainings(r.data ?? []);
        if (r.data?.[0]) setSelectedId(r.data[0].id);
      })
      .catch((e) =>
        setError(e?.response?.data?.message ?? "Failed to load trainings."),
      )
      .finally(() => setLoadingTrainings(false));
  }, []);

  const fetchRecords = useCallback(async () => {
    if (!selectedId) return;
    setLoadingRecords(true);
    setError(null);
    try {
      const res = await getEnrollments(selectedId);
      setRecords(res.data ?? []);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Failed to load attendance.");
    } finally {
      setLoadingRecords(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleMark = async (record, status) => {
    const key = `${record.employee_id}-attend`;
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      await markAttendance(selectedId, record.employee_id, status);
      setRecords((prev) =>
        prev.map((r) =>
          r.employee_id === record.employee_id
            ? { ...r, attendance_status: status }
            : r,
        ),
      );
      showToast("Attendance updated.");
    } catch (e) {
      showToast("Failed to update attendance.");
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  };

  const handleCert = async (record) => {
    const key = `${record.employee_id}-cert`;
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      await issueCertificate(selectedId, record.employee_id);
      setRecords((prev) =>
        prev.map((r) =>
          r.employee_id === record.employee_id
            ? { ...r, certificate_issued: true }
            : r,
        ),
      );
      showToast("Certificate issued.");
    } catch (e) {
      showToast(e?.response?.data?.message ?? "Failed to issue certificate.");
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-white text-sm"
          style={{ background: C.success }}
        >
          <Check size={14} /> {toast}
        </motion.div>
      )}

      {/* Training selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none appearance-none"
          style={{
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            color: C.textPrimary,
            minWidth: 260,
          }}
          disabled={loadingTrainings}
        >
          {trainings.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        <button
          onClick={fetchRecords}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            color: C.textSecondary,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{
            background: C.dangerLight,
            border: `1px solid ${C.danger}33`,
          }}
        >
          <AlertCircle size={16} color={C.danger} />
          <p className="text-sm flex-1" style={{ color: C.danger }}>
            {error}
          </p>
        </div>
      )}

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: C.surface, borderColor: C.border }}
      >
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
                "Code",
                "Department",
                "Status",
                "Certificate",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left text-xs font-bold uppercase"
                  style={{ color: C.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loadingRecords ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2
                    size={20}
                    color={C.primary}
                    className="animate-spin mx-auto"
                  />
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm"
                  style={{ color: C.textMuted }}
                >
                  No enrollments for this training yet.
                </td>
              </tr>
            ) : (
              records.map((r, i) => (
                <motion.tr
                  key={r.employee_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b"
                  style={{ borderColor: C.border }}
                >
                  <td
                    className="px-5 py-4 font-medium text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    {r.employee_name}
                  </td>
                  <td
                    className="px-5 py-4 text-xs font-mono"
                    style={{ color: C.textMuted }}
                  >
                    {r.employee_code}
                  </td>
                  <td
                    className="px-5 py-4 text-sm"
                    style={{ color: C.textSecondary }}
                  >
                    {r.department_name ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-4 py-1 text-xs rounded-full font-semibold ${r.attendance_status === "attended" ? "bg-emerald-100 text-emerald-700" : r.attendance_status === "absent" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {r.attendance_status ?? "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs rounded-full ${r.certificate_issued ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {r.certificate_issued ? "Issued" : "Not issued"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {r.attendance_status !== "attended" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleMark(r, "attended")}
                          disabled={actionLoading[`${r.employee_id}-attend`]}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl"
                          style={{
                            background: C.successLight,
                            color: C.success,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {actionLoading[`${r.employee_id}-attend`] ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            "Mark Attended"
                          )}
                        </motion.button>
                      )}
                      {r.attendance_status === "attended" &&
                        !r.certificate_issued && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleCert(r)}
                            disabled={actionLoading[`${r.employee_id}-cert`]}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl"
                            style={{
                              background: C.primaryLight,
                              color: C.primary,
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            {actionLoading[`${r.employee_id}-cert`] ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              "Issue Certificate"
                            )}
                          </motion.button>
                        )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
