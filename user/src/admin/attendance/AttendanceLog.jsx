// src/admin/attendance/AttendanceLog.jsx
import { useState, useEffect, useMemo } from "react";
import { motion as Motion } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";
import { attendanceApi } from "../../api/service/attendanceApi";
import { getEmployees } from "../../api/service/employeeApi";
import { departmentApi } from "../../api/service/departmentApi";
import { C } from "../employeemanagement/sharedData";

// Import Loader
import Loader from "../../components/Loader";

const STATUS_CFG = {
  present: { bg: "#D1FAE5", color: "#10B981", label: "Present" },
  late: { bg: "#FEF3C7", color: "#F59E0B", label: "Late" },
  absent: { bg: "#FEE2E2", color: "#EF4444", label: "Absent" },
};

function initials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AttendanceLog({ searchQuery }) {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 30;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: LIMIT,
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(filterDept !== "all" && { departmentId: filterDept }),
      };

      const [attRes, empRes, deptRes] = await Promise.all([
        attendanceApi.getAll(params),
        getEmployees({ limit: 500 }),
        departmentApi.list(),
      ]);

      setRecords(attRes.rows ?? []);
      setTotal(attRes.total ?? 0);

      const empData = empRes.data ?? empRes;
      setEmployees(Array.isArray(empData) ? empData : []);

      const deptData = deptRes.data ?? deptRes;
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err) {
      console.error("Attendance Load Error:", err);
      setError("Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, filterStatus, filterDept]);

  const empMap = useMemo(() => {
    const m = {};
    (employees ?? []).forEach((e) => {
      m[e.id] = {
        name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
        department: e.department_name ?? e.department ?? "—",
        jobTitle: e.job_title ?? "—",
      };
    });
    return m;
  }, [employees]);

  const filtered = useMemo(() => {
    if (!searchQuery) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) => {
      const emp = empMap[r.employeeId] ?? r.employee ?? {};
      const name = emp.name ?? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`;
      return name.toLowerCase().includes(q);
    });
  }, [records, searchQuery, empMap]);

  const exportCSV = () => {
    const rows = [
      ["Employee", "Department", "Date", "Clock In", "Clock Out", "Hours", "Status"],
      ...filtered.map((r) => {
        const emp = empMap[r.employeeId] ?? {};
        const name = emp.name ?? `${r.employee?.firstName ?? ""} ${r.employee?.lastName ?? ""}`.trim();
        return [
          name,
          emp.department ?? r.employee?.department ?? "—",
          r.attendanceDate,
          r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : "—",
          r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : "—",
          r.hoursWorked ?? "—",
          r.status,
        ];
      }),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Filters */}
      <div
        className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: C.textMuted }}>Status:</span>
          {["all", "present", "late", "absent"].map((s) => (
            <Motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setFilterStatus(s); setPage(1); }}
              className="px-3 py-1 text-xs rounded-lg font-medium capitalize"
              style={{
                background: filterStatus === s ? C.primary : C.surfaceAlt,
                color: filterStatus === s ? "#fff" : C.textSecondary,
              }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Motion.button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-sm rounded-xl outline-none"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.textPrimary }}
          >
            <option value="all">All Departments</option>
            {Array.isArray(departments) &&
              departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>

          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={load}
            className="p-2 rounded-xl"
            style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
          >
            <RefreshCw size={14} color={C.textSecondary} />
          </Motion.button>

          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
            style={{ background: C.primary, color: "#fff" }}
          >
            <Download size={14} /> Export CSV
          </Motion.button>
        </div>
      </div>

      {/* Table Container */}
      <div
        className="rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        {loading ? (
          <Loader />   
        ) : error ? (
          <div className="text-center" style={{ color: C.danger }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-sm" style={{ color: C.textMuted }}>
            No attendance records found.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                  {["Employee", "Department", "Date", "Clock In", "Clock Out", "Hours", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, i) => {
                  const emp = empMap[record.employeeId] ?? {};
                  const name = emp.name ?? `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim();
                  const dept = emp.department ?? record.employee?.department ?? "—";
                  const status = (record.status ?? "absent").toLowerCase();
                  const cfg = STATUS_CFG[status] ?? STATUS_CFG.absent;
                  const ini = initials(name);

                  return (
                    <Motion.tr
                      key={record.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b"
                      style={{ borderColor: C.border }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg,#4F46E5,#06B6D4)" }}>
                            {ini}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>{name}</p>
                            <p className="text-[11px]" style={{ color: C.textMuted }}>{emp.jobTitle ?? "—"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: C.primaryLight, color: C.primary }}>
                          {dept}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm" style={{ color: C.textSecondary }}>
                        {record.attendanceDate ? new Date(record.attendanceDate).toLocaleDateString("en-GB") : "—"}
                      </td>

                      <td className="px-4 py-3 font-mono text-sm" style={{ color: C.textPrimary }}>
                        {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>

                      <td className="px-4 py-3 font-mono text-sm" style={{ color: C.textPrimary }}>
                        {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>

                      <td className="px-4 py-3 font-semibold text-sm" style={{ color: C.textPrimary }}>
                        {record.hoursWorked != null ? `${Number(record.hoursWorked).toFixed(1)}h` : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                    </Motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs" style={{ color: C.textMuted }}>
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Motion.button
              whileTap={{ scale: 0.95 }}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl"
              style={{ background: page === 1 ? C.surfaceAlt : C.primary, color: page === 1 ? C.textMuted : "#fff" }}
            >
              Prev
            </Motion.button>
            <Motion.button
              whileTap={{ scale: 0.95 }}
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl"
              style={{ background: page === totalPages ? C.surfaceAlt : C.primary, color: page === totalPages ? C.textMuted : "#fff" }}
            >
              Next
            </Motion.button>
          </div>
        </div>
      )}
    </Motion.div>
  );
}