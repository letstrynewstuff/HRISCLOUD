// // src/admin/attendance/TimesheetApproval.jsx
// // Timesheets are weekly summaries built from attendance records.
// // We aggregate attendance rows by employee per week and allow HR to approve.
// import { useState, useEffect, useMemo } from "react";
// import { motion as Motion} from "framer-motion";
// import { CheckCircle2, RefreshCw, FileText } from "lucide-react";
// import { attendanceApi } from "../../api/service/attendanceApi";
// import { getEmployees } from "../../api/service/employeeApi";
// import { C } from "../employeemanagement/sharedData";

// /** Get the Monday of the week containing a given date */
// function weekStart(dateStr) {
//   const d = new Date(dateStr);
//   const day = d.getDay();
//   const diff = d.getDate() - day + (day === 0 ? -6 : 1);
//   const mon = new Date(d.setDate(diff));
//   return mon.toISOString().split("T")[0];
// }

// function fmt(dateStr) {
//   return new Date(dateStr).toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//   });
// }

// export default function TimesheetApproval() {
//   const [records, setRecords] = useState([]);
//   const [empMap, setEmpMap] = useState({});
//   const [approved, setApproved] = useState({}); // key: `${empId}_${week}` → true
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [actioning, setActioning] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [attRes, empRes] = await Promise.all([
//         attendanceApi.getAll({ limit: 500 }),
//         getEmployees({ limit: 500 }),
//       ]);

//       setRecords(attRes.rows ?? []);

//       const map = {};
//       (empRes.data ?? empRes ?? []).forEach((e) => {
//         map[e.id] = {
//           name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
//           department: e.department_name ?? e.department ?? "—",
//         };
//       });
//       setEmpMap(map);
//     } catch {
//       setError("Failed to load timesheet data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   // Aggregate records into weekly timesheets per employee
//   const timesheets = useMemo(() => {
//     const map = {};
//     records.forEach((r) => {
//       if (!r.attendanceDate) return;
//       const week = weekStart(r.attendanceDate);
//       const key = `${r.employeeId}_${week}`;
//       if (!map[key]) {
//         map[key] = {
//           key,
//           employeeId: r.employeeId,
//           week,
//           weekEnd: null,
//           totalHours: 0,
//           days: 0,
//           recordIds: [],
//         };
//       }
//       map[key].totalHours += Number(r.hoursWorked ?? 0);
//       map[key].days += 1;
//       map[key].recordIds.push(r.id);
//       // Track last day of week
//       if (!map[key].weekEnd || r.attendanceDate > map[key].weekEnd) {
//         map[key].weekEnd = r.attendanceDate;
//       }
//     });
//     return Object.values(map).sort((a, b) => b.week.localeCompare(a.week));
//   }, [records]);

//   const handleApprove = async (ts) => {
//     setActioning(ts.key);
//     try {
//       // Approve all records in this week by correcting with approval note
//       await Promise.all(
//         ts.recordIds.map((id) =>
//           attendanceApi.correct(id, { editReason: "Timesheet approved by HR" }),
//         ),
//       );
//       setApproved((prev) => ({ ...prev, [ts.key]: true }));
//     } catch (err) {
//       alert(err?.response?.data?.message ?? "Failed to approve timesheet.");
//     } finally {
//       setActioning(null);
//     }
//   };

//   return (
//     <Motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0 }}
//     >
//       <div
//         className="rounded-2xl overflow-hidden"
//         style={{ background: C.surface, border: `1px solid ${C.border}` }}
//       >
//         {loading ? (
//           <div className="flex items-center justify-center py-16">
//             <RefreshCw
//               size={22}
//               className="animate-spin"
//               style={{ color: C.primary }}
//             />
//           </div>
//         ) : error ? (
//           <div
//             className="py-12 text-center text-sm"
//             style={{ color: C.danger }}
//           >
//             {error}
//           </div>
//         ) : timesheets.length === 0 ? (
//           <div className="py-12 flex flex-col items-center gap-2">
//             <FileText size={28} style={{ color: C.textMuted }} />
//             <p className="text-sm" style={{ color: C.textMuted }}>
//               No timesheets available.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr
//                   style={{
//                     background: C.surfaceAlt,
//                     borderBottom: `1px solid ${C.border}`,
//                   }}
//                 >
//                   {[
//                     "Employee",
//                     "Department",
//                     "Week",
//                     "Days Worked",
//                     "Total Hours",
//                     "Status",
//                     "Actions",
//                   ].map((h) => (
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
//                 {timesheets.map((ts) => {
//                   const emp = empMap[ts.employeeId] ?? {};
//                   const name = emp.name ?? "—";
//                   const dept = emp.department ?? "—";
//                   const isApproved = approved[ts.key] ?? false;
//                   const isActioning = actioning === ts.key;

//                   return (
//                     <tr
//                       key={ts.key}
//                       className="border-b"
//                       style={{ borderColor: C.border }}
//                     >
//                       <td
//                         className="px-4 py-3 font-medium text-sm"
//                         style={{ color: C.textPrimary }}
//                       >
//                         {name}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span
//                           className="text-xs px-2.5 py-1 rounded-full"
//                           style={{
//                             background: C.primaryLight,
//                             color: C.primary,
//                           }}
//                         >
//                           {dept}
//                         </span>
//                       </td>
//                       <td
//                         className="px-4 py-3 text-sm"
//                         style={{ color: C.textSecondary }}
//                       >
//                         {fmt(ts.week)} – {ts.weekEnd ? fmt(ts.weekEnd) : "—"}
//                       </td>
//                       <td className="px-4 py-3 font-semibold text-sm">
//                         {ts.days}
//                       </td>
//                       <td className="px-4 py-3 font-semibold text-sm">
//                         {ts.totalHours.toFixed(1)}h
//                       </td>
//                       <td className="px-4 py-3">
//                         <span
//                           className="text-xs px-2.5 py-1 rounded-full font-semibold"
//                           style={{
//                             background: isApproved ? "#D1FAE5" : "#FEF3C7",
//                             color: isApproved ? "#10B981" : "#F59E0B",
//                           }}
//                         >
//                           {isApproved ? "Approved" : "Pending"}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         {!isApproved && (
//                           <Motion.button
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => handleApprove(ts)}
//                             disabled={isActioning}
//                             className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl"
//                             style={{
//                               background: C.success,
//                               color: "#fff",
//                               opacity: isActioning ? 0.7 : 1,
//                             }}
//                           >
//                             {isActioning ? (
//                               <>
//                                 <RefreshCw size={12} className="animate-spin" />{" "}
//                                 Approving...
//                               </>
//                             ) : (
//                               <>
//                                 <CheckCircle2 size={12} /> Approve
//                               </>
//                             )}
//                           </Motion.button>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </Motion.div>
//   );
// }


// src/admin/attendance/TimesheetApproval.jsx
import { useState, useEffect, useMemo } from "react";
import { motion as Motion } from "framer-motion";
import { CheckCircle2, RefreshCw, FileText } from "lucide-react";
import { attendanceApi } from "../../api/service/attendanceApi";
import { getEmployees } from "../../api/service/employeeApi";
import { C } from "../employeemanagement/sharedData";
import Loader from "../../components/Loader";   // ← Added

function weekStart(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return mon.toISOString().split("T")[0];
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export default function TimesheetApproval() {
  const [records, setRecords] = useState([]);
  const [empMap, setEmpMap] = useState({});
  const [approved, setApproved] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioning, setActioning] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [attRes, empRes] = await Promise.all([
        attendanceApi.getAll({ limit: 500 }),
        getEmployees({ limit: 500 }),
      ]);

      setRecords(attRes.rows ?? []);

      const map = {};
      (empRes.data ?? empRes ?? []).forEach((e) => {
        map[e.id] = {
          name: `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim(),
          department: e.department_name ?? e.department ?? "—",
        };
      });
      setEmpMap(map);
    } catch {
      setError("Failed to load timesheet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const timesheets = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!r.attendanceDate) return;
      const week = weekStart(r.attendanceDate);
      const key = `${r.employeeId}_${week}`;
      if (!map[key]) {
        map[key] = {
          key,
          employeeId: r.employeeId,
          week,
          weekEnd: null,
          totalHours: 0,
          days: 0,
          recordIds: [],
        };
      }
      map[key].totalHours += Number(r.hoursWorked ?? 0);
      map[key].days += 1;
      map[key].recordIds.push(r.id);
      if (!map[key].weekEnd || r.attendanceDate > map[key].weekEnd) {
        map[key].weekEnd = r.attendanceDate;
      }
    });
    return Object.values(map).sort((a, b) => b.week.localeCompare(a.week));
  }, [records]);

  const handleApprove = async (ts) => {
    setActioning(ts.key);
    try {
      await Promise.all(
        ts.recordIds.map((id) =>
          attendanceApi.correct(id, { editReason: "Timesheet approved by HR" }),
        ),
      );
      setApproved((prev) => ({ ...prev, [ts.key]: true }));
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to approve timesheet.");
    } finally {
      setActioning(null);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      {/* <div
        className="rounded-2xl overflow-hidden"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      > */}
      <div
        className="rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center"
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
        ) : timesheets.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2">
            <FileText size={28} style={{ color: C.textMuted }} />
            <p className="text-sm" style={{ color: C.textMuted }}>
              No timesheets available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    "Week",
                    "Days Worked",
                    "Total Hours",
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
                {timesheets.map((ts) => {
                  const emp = empMap[ts.employeeId] ?? {};
                  const name = emp.name ?? "—";
                  const dept = emp.department ?? "—";
                  const isApproved = approved[ts.key] ?? false;
                  const isActioning = actioning === ts.key;

                  return (
                    <tr
                      key={ts.key}
                      className="border-b"
                      style={{ borderColor: C.border }}
                    >
                      <td
                        className="px-4 py-3 font-medium text-sm"
                        style={{ color: C.textPrimary }}
                      >
                        {name}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{
                            background: C.primaryLight,
                            color: C.primary,
                          }}
                        >
                          {dept}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-sm"
                        style={{ color: C.textSecondary }}
                      >
                        {fmt(ts.week)} – {ts.weekEnd ? fmt(ts.weekEnd) : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-sm">
                        {ts.days}
                      </td>
                      <td className="px-4 py-3 font-semibold text-sm">
                        {ts.totalHours.toFixed(1)}h
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{
                            background: isApproved ? "#D1FAE5" : "#FEF3C7",
                            color: isApproved ? "#10B981" : "#F59E0B",
                          }}
                        >
                          {isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!isApproved && (
                          <Motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleApprove(ts)}
                            disabled={isActioning}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl"
                            style={{
                              background: C.success,
                              color: "#fff",
                              opacity: isActioning ? 0.7 : 1,
                            }}
                          >
                            {isActioning ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />{" "}
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={12} /> Approve
                              </>
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