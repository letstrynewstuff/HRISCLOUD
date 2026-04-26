

// // src/admin/attendance/AttendanceCorrections.jsx
// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Edit2, RefreshCw, X } from "lucide-react";
// import { attendanceApi } from "../../api/service/attendanceApi";
// import { getEmployees } from "../../api/service/employeeApi";
// import {C }from "../employeemanagement/sharedData";

// export default function AttendanceCorrections() {
//   const [records,   setRecords]   = useState([]);
//   const [empMap,    setEmpMap]    = useState({});
//   const [loading,   setLoading]   = useState(true);
//   const [error,     setError]     = useState(null);
//   const [selected,  setSelected]  = useState(null);
//   const [saving,    setSaving]    = useState(false);
//   const [form,      setForm]      = useState({ clockIn: "", clockOut: "", editReason: "" });
//   const [formError, setFormError] = useState("");

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [attRes, empRes] = await Promise.all([
//         // Pull records that were manually edited or have issues — use all records, HR filters manually
//         attendanceApi.getAll({ limit: 100, status: "absent" }),
//         getEmployees({ limit: 500 }),
//       ]);

//       // Also load present/late so HR can correct any record
//       const allRes = await attendanceApi.getAll({ limit: 200 });
//       setRecords(allRes.rows ?? []);

//       const map = {};
//       (empRes.data ?? empRes ?? []).forEach((e) => {
//         map[e.id] = {
//           name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
//           department: e.department_name ?? e.department ?? "—",
//         };
//       });
//       setEmpMap(map);
//     } catch {
//       setError("Failed to load attendance records.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   const openCorrection = (record) => {
//     setSelected(record);
//     setFormError("");
//     // Pre-fill with existing times if available
//     const ci = record.clockIn  ? new Date(record.clockIn).toTimeString().slice(0, 5)  : "";
//     const co = record.clockOut ? new Date(record.clockOut).toTimeString().slice(0, 5) : "";
//     setForm({ clockIn: ci, clockOut: co, editReason: "" });
//   };

//   const handleSave = async () => {
//     if (!form.editReason.trim()) {
//       setFormError("A reason for the correction is required.");
//       return;
//     }
//     setSaving(true);
//     setFormError("");
//     try {
//       // Build ISO datetime from the attendance date + time inputs
//       const date = selected.attendanceDate
//         ? new Date(selected.attendanceDate).toISOString().split("T")[0]
//         : new Date().toISOString().split("T")[0];

//       const payload = {
//         editReason: form.editReason,
//         ...(form.clockIn  && { clockIn:  `${date}T${form.clockIn}:00`  }),
//         ...(form.clockOut && { clockOut: `${date}T${form.clockOut}:00` }),
//       };

//       const updated = await attendanceApi.correct(selected.id, payload);

//       setRecords((prev) =>
//         prev.map((r) => r.id === selected.id ? (updated.record ?? { ...r, ...payload }) : r)
//       );
//       setSelected(null);
//     } catch (err) {
//       setFormError(err?.response?.data?.message ?? "Failed to save correction.");
//     } finally {
//       setSaving(false);
//     }
//   };

// const name = (record) => {
//   const e = emp(record);
//   return (e.name ?? `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim()) || "—";
// };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0 }}
//       className="space-y-4"
//     >
//       <div
//         className="rounded-2xl overflow-hidden"
//         style={{ background: C.surface, border: `1px solid ${C.border}` }}
//       >
//         {loading ? (
//           <div className="flex items-center justify-center py-16">
//             <RefreshCw size={22} className="animate-spin" style={{ color: C.primary }} />
//           </div>
//         ) : error ? (
//           <div className="py-12 text-center text-sm" style={{ color: C.danger }}>{error}</div>
//         ) : records.length === 0 ? (
//           <div className="py-12 text-center text-sm" style={{ color: C.textMuted }}>
//             No attendance records to correct.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
//                   {["Employee", "Department", "Date", "Clock In", "Clock Out", "Status", "Actions"].map((h) => (
//                     <th
//                       key={h}
//                       className="px-4 py-3 text-left text-xs font-bold uppercase"
//                       style={{ color: C.textMuted }}
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {records.map((r, i) => {
//                   const empName = name(r);
//                   const dept    = emp(r).department ?? "—";
//                   return (
//                     <motion.tr
//                       key={r.id}
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ delay: i * 0.02 }}
//                       className="border-b"
//                       style={{ borderColor: C.border }}
//                     >
//                       <td className="px-4 py-3 font-medium text-sm" style={{ color: C.textPrimary }}>{empName}</td>
//                       <td className="px-4 py-3">
//                         <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: C.primaryLight, color: C.primary }}>
//                           {dept}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-sm" style={{ color: C.textSecondary }}>
//                         {r.attendanceDate ? new Date(r.attendanceDate).toLocaleDateString("en-GB") : "—"}
//                       </td>
//                       <td className="px-4 py-3 font-mono text-sm">
//                         {r.clockIn  ? new Date(r.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
//                       </td>
//                       <td className="px-4 py-3 font-mono text-sm">
//                         {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span
//                           className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
//                           style={{
//                             background: r.status === "present" ? "#D1FAE5" : r.status === "late" ? "#FEF3C7" : "#FEE2E2",
//                             color:      r.status === "present" ? "#10B981" : r.status === "late" ? "#F59E0B" : "#EF4444",
//                           }}
//                         >
//                           {r.status}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         <motion.button
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                           onClick={() => openCorrection(r)}
//                           className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl"
//                           style={{ background: C.primaryLight, color: C.primary }}
//                         >
//                           <Edit2 size={12} /> Correct
//                         </motion.button>
//                       </td>
//                     </motion.tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Correction Modal */}
//       <AnimatePresence>
//         {selected && (
//           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ scale: 0.95, opacity: 0 }}
//               animate={{ scale: 1,    opacity: 1 }}
//               exit={{   scale: 0.95, opacity: 0 }}
//               className="w-full max-w-md rounded-2xl p-6 space-y-4"
//               style={{ background: C.surface, border: `1px solid ${C.border}` }}
//             >
//               <div className="flex items-center justify-between">
//                 <h3 className="font-bold text-lg" style={{ color: C.textPrimary }}>
//                   Correct Attendance
//                 </h3>
//                 <button onClick={() => setSelected(null)}>
//                   <X size={18} color={C.textMuted} />
//                 </button>
//               </div>

//               <div className="rounded-xl p-3 space-y-1" style={{ background: C.surfaceAlt }}>
//                 <p className="text-xs font-semibold" style={{ color: C.textMuted }}>Employee</p>
//                 <p className="text-sm font-bold" style={{ color: C.textPrimary }}>{name(selected)}</p>
//                 <p className="text-xs" style={{ color: C.textMuted }}>
//                   {selected.attendanceDate ? new Date(selected.attendanceDate).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—"}
//                 </p>
//               </div>

//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
//                     Clock-In Time
//                   </label>
//                   <input
//                     type="time"
//                     value={form.clockIn}
//                     onChange={(e) => setForm((f) => ({ ...f, clockIn: e.target.value }))}
//                     className="w-full p-2.5 rounded-xl outline-none text-sm"
//                     style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
//                     Clock-Out Time
//                   </label>
//                   <input
//                     type="time"
//                     value={form.clockOut}
//                     onChange={(e) => setForm((f) => ({ ...f, clockOut: e.target.value }))}
//                     className="w-full p-2.5 rounded-xl outline-none text-sm"
//                     style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
//                   Reason for Correction <span style={{ color: C.danger }}>*</span>
//                 </label>
//                 <textarea
//                   value={form.editReason}
//                   onChange={(e) => setForm((f) => ({ ...f, editReason: e.target.value }))}
//                   rows={3}
//                   placeholder="Explain why this record is being corrected..."
//                   className="w-full p-3 rounded-xl outline-none text-sm resize-none"
//                   style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
//                 />
//               </div>

//               {formError && (
//                 <p className="text-xs font-medium" style={{ color: C.danger }}>{formError}</p>
//               )}

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setSelected(null)}
//                   className="flex-1 py-3 rounded-xl font-semibold text-sm"
//                   style={{ background: C.surfaceAlt, color: C.textSecondary }}
//                 >
//                   Cancel
//                 </button>
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleSave}
//                   disabled={saving}
//                   className="flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
//                   style={{ background: C.success, opacity: saving ? 0.8 : 1 }}
//                 >
//                   {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : "Save Correction"}
//                 </motion.button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }



// src/admin/attendance/AttendanceCorrections.jsx
import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Edit2, RefreshCw, X } from "lucide-react";
import { attendanceApi } from "../../api/service/attendanceApi";
import { getEmployees } from "../../api/service/employeeApi";
import { C } from "../employeemanagement/sharedData";

import Loader from "../../components/Loader";

export default function AttendanceCorrections() {
  const [records, setRecords] = useState([]);
  const [empMap, setEmpMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ clockIn: "", clockOut: "", editReason: "" });
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [attRes, empRes] = await Promise.all([
        attendanceApi.getAll({ limit: 100, status: "absent" }),
        getEmployees({ limit: 500 }),
      ]);

      const allRes = await attendanceApi.getAll({ limit: 200 });
      setRecords(allRes.rows ?? []);

      const map = {};
      (empRes.data ?? empRes ?? []).forEach((e) => {
        map[e.id] = {
          name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
          department: e.department_name ?? e.department ?? "—",
        };
      });
      setEmpMap(map);
    } catch {
      setError("Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCorrection = (record) => {
    setSelected(record);
    setFormError("");
    const ci = record.clockIn ? new Date(record.clockIn).toTimeString().slice(0, 5) : "";
    const co = record.clockOut ? new Date(record.clockOut).toTimeString().slice(0, 5) : "";
    setForm({ clockIn: ci, clockOut: co, editReason: "" });
  };

  const handleSave = async () => {
    if (!form.editReason.trim()) {
      setFormError("A reason for the correction is required.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const date = selected.attendanceDate
        ? new Date(selected.attendanceDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      const payload = {
        editReason: form.editReason,
        ...(form.clockIn && { clockIn: `${date}T${form.clockIn}:00` }),
        ...(form.clockOut && { clockOut: `${date}T${form.clockOut}:00` }),
      };

      const updated = await attendanceApi.correct(selected.id, payload);

      setRecords((prev) =>
        prev.map((r) => r.id === selected.id ? (updated.record ?? { ...r, ...payload }) : r)
      );
      setSelected(null);
    } catch (err) {
      setFormError(err?.response?.data?.message ?? "Failed to save correction.");
    } finally {
      setSaving(false);
    }
  };

  const name = (record) => {
    const e = empMap[record.employeeId] ?? record.employee ?? {};
    return (e.name ?? `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim()) || "—";
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div
        className="rounded-2xl overflow-hidden min-h-[460px] flex items-center justify-center"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="py-12 text-center text-sm" style={{ color: C.danger }}>{error}</div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-sm" style={{ color: C.textMuted }}>
            No attendance records to correct.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full">
              <thead>
                <tr style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                  {["Employee", "Department", "Date", "Clock In", "Clock Out", "Status", "Actions"].map((h) => (
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
                {records.map((r, i) => {
                  const empName = name(r);
                  const dept = empMap[r.employeeId]?.department ?? "—";
                  return (
                    <Motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b"
                      style={{ borderColor: C.border }}
                    >
                      <td className="px-4 py-3 font-medium text-sm" style={{ color: C.textPrimary }}>{empName}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: C.primaryLight, color: C.primary }}>
                          {dept}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: C.textSecondary }}>
                        {r.attendanceDate ? new Date(r.attendanceDate).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize"
                          style={{
                            background: r.status === "present" ? "#D1FAE5" : r.status === "late" ? "#FEF3C7" : "#FEE2E2",
                            color: r.status === "present" ? "#10B981" : r.status === "late" ? "#F59E0B" : "#EF4444",
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openCorrection(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl"
                          style={{ background: C.primaryLight, color: C.primary }}
                        >
                          <Edit2 size={12} /> Correct
                        </Motion.button>
                      </td>
                    </Motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Correction Modal - unchanged */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6 space-y-4"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {/* Modal content remains exactly the same as you provided */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg" style={{ color: C.textPrimary }}>Correct Attendance</h3>
                <button onClick={() => setSelected(null)}>
                  <X size={18} color={C.textMuted} />
                </button>
              </div>

              <div className="rounded-xl p-3 space-y-1" style={{ background: C.surfaceAlt }}>
                <p className="text-xs font-semibold" style={{ color: C.textMuted }}>Employee</p>
                <p className="text-sm font-bold" style={{ color: C.textPrimary }}>{name(selected)}</p>
                <p className="text-xs" style={{ color: C.textMuted }}>
                  {selected.attendanceDate ? new Date(selected.attendanceDate).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>Clock-In Time</label>
                  <input
                    type="time"
                    value={form.clockIn}
                    onChange={(e) => setForm((f) => ({ ...f, clockIn: e.target.value }))}
                    className="w-full p-2.5 rounded-xl outline-none text-sm"
                    style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>Clock-Out Time</label>
                  <input
                    type="time"
                    value={form.clockOut}
                    onChange={(e) => setForm((f) => ({ ...f, clockOut: e.target.value }))}
                    className="w-full p-2.5 rounded-xl outline-none text-sm"
                    style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                  Reason for Correction <span style={{ color: C.danger }}>*</span>
                </label>
                <textarea
                  value={form.editReason}
                  onChange={(e) => setForm((f) => ({ ...f, editReason: e.target.value }))}
                  rows={3}
                  placeholder="Explain why this record is being corrected..."
                  className="w-full p-3 rounded-xl outline-none text-sm resize-none"
                  style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
                />
              </div>

              {formError && <p className="text-xs font-medium" style={{ color: C.danger }}>{formError}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: C.surfaceAlt, color: C.textSecondary }}
                >
                  Cancel
                </button>
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: C.success, opacity: saving ? 0.8 : 1 }}
                >
                  {saving ? (
                    <><RefreshCw size={14} className="animate-spin" /> Saving...</>
                  ) : (
                    "Save Correction"
                  )}
                </Motion.button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}