// // src/components/admin/attendance/AttendanceLogView.tsx
// // Mobile equivalent of AttendanceLog.jsx — table rows become cards,
// // CSV export uses the native Share sheet instead of a browser download.

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   Pressable,
//   ActivityIndicator,
//   Share,
// } from "react-native";
// import {
//   Download,
//   RefreshCw,
//   MapPin,
//   Coffee,
//   Users,
// } from "lucide-react-native";

// import C from "../../../styles/colors";
// import { attendanceApi } from "../../../api/service/attendanceApi";
// import { getEmployees } from "../../../api/service/employeeApi";
// import { departmentApi } from "../../../api/service/departmentApi";
// import MobileSelect from "../employee/MobileSelect";
// import StatusChip from "./StatusChip";
// import {
//   STATUS_CFG,
//   buildEmpMap,
//   fmtShortDate,
//   fmtClock,
//   fmtHours,
//   fmtMinutes,
//   initials,
// } from "../../../hooks/attendanceHelpers";
// import { Loader } from "../../../hooks/loaderManager";

// const LIMIT = 30;

// interface Props {
//   searchQuery: string;
//   showToast: (msg: string, type?: "success" | "error" | "info") => void;
// }

// export default function AttendanceLogView({ searchQuery, showToast }: Props) {
//   const [records, setRecords] = useState<any[]>([]);
//   const [employees, setEmployees] = useState<any[]>([]);
//   const [departments, setDepartments] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filterStatus, setFilterStatus] = useState("all");
//   const [filterDept, setFilterDept] = useState("all");
//   const [page, setPage] = useState(1);
//   const [total, setTotal] = useState(0);
//   const [exporting, setExporting] = useState(false);

//   // const load = useCallback(async () => {
//   //   setLoading(true);
//   //   setError(null);
//   //   try {
//   //     const params: any = {
//   //       page,
//   //       limit: LIMIT,
//   //       ...(filterStatus !== "all" && { status: filterStatus }),
//   //       ...(filterDept !== "all" && { departmentId: filterDept }),
//   //     };
//   //     const [attRes, empRes, deptRes] = await Promise.all([
//   //       attendanceApi.getAll(params),
//   //       getEmployees({ limit: 500 }),
//   //       departmentApi.list(),
//   //     ]);
//   //     setRecords(attRes.rows ?? []);
//   //     setTotal(attRes.total ?? 0);
//   //     const empData = empRes.data ?? empRes;
//   //     setEmployees(Array.isArray(empData) ? empData : []);
//   //     const deptData = deptRes.data ?? deptRes;
//   //     setDepartments(Array.isArray(deptData) ? deptData : []);
//   //   } catch (err) {
//   //     setError("Failed to load attendance records.");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }, [page, filterStatus, filterDept]);
// const load = useCallback(async () => {
//   setLoading(true);
//   setError(null);
//   Loader.show();
//   try {
//     const params: any = {
//       page,
//       limit: LIMIT,
//       ...(filterStatus !== "all" && { status: filterStatus }),
//       ...(filterDept !== "all" && { departmentId: filterDept }),
//     };
//     const [attRes, empRes, deptRes] = await Promise.all([
//       attendanceApi.getAll(params),
//       getEmployees({ limit: 500 }),
//       departmentApi.list(),
//     ]);
//     setRecords(attRes.rows ?? []);
//     setTotal(attRes.total ?? 0);
//     const empData = empRes.data ?? empRes;
//     setEmployees(Array.isArray(empData) ? empData : []);
//     const deptData = deptRes.data ?? deptRes;
//     setDepartments(Array.isArray(deptData) ? deptData : []);
//   } catch (err) {
//     setError("Failed to load attendance records.");
//   } finally {
//     setLoading(false);
//     Loader.hide();
//   }
// }, [page, filterStatus, filterDept]);
//   useEffect(() => {
//     load();
//   }, [load]);

//   const empMap = useMemo(() => buildEmpMap(employees), [employees]);

//   const filtered = useMemo(() => {
//     if (!searchQuery) return records;
//     const q = searchQuery.toLowerCase();
//     return records.filter((r) => {
//       const emp = empMap[r.employeeId] ?? r.employee ?? {};
//       const name = emp.name ?? `${emp.firstName ?? ""} ${emp.lastName ?? ""}`;
//       return name.toLowerCase().includes(q);
//     });
//   }, [records, searchQuery, empMap]);

//   const exportCSV = async () => {
//     setExporting(true);
//     try {
//       const rows = [
//         [
//           "Employee",
//           "Department",
//           "Date",
//           "Clock In",
//           "Clock Out",
//           "Hours",
//           "Break",
//           "Location",
//           "Status",
//         ],
//         ...filtered.map((r) => {
//           const emp = empMap[r.employeeId] ?? {};
//           const name =
//             emp.name ??
//             `${r.employee?.firstName ?? ""} ${r.employee?.lastName ?? ""}`.trim();
//           const loc = r.clockInLocation
//             ? `${r.clockInLocation.lat}, ${r.clockInLocation.lng}`
//             : "—";
//           return [
//             name,
//             emp.department ?? r.employee?.department ?? "—",
//             r.attendanceDate,
//             r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : "—",
//             r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : "—",
//             r.hoursWorked ?? "—",
//             r.totalBreakMinutes ? `${r.totalBreakMinutes}m` : "—",
//             loc,
//             r.status,
//           ];
//         }),
//       ];
//       const csv = rows
//         .map((row) => row.map((v) => `"${v}"`).join(","))
//         .join("\n");
//       await Share.share({
//         message: csv,
//         title: `attendance-${new Date().toISOString().split("T")[0]}.csv`,
//       });
//     } catch {
//       showToast("Export failed", "error");
//     } finally {
//       setExporting(false);
//     }
//   };

//   const totalPages = Math.ceil(total / LIMIT);
//   const deptOptions = [
//     { label: "All Departments", value: "all" },
//     ...departments.map((d) => ({ label: d.name, value: d.id })),
//   ];

//   return (
//     <View style={{ gap: 14 }}>
//       {/* Filters */}
//       <View style={s.filterCard}>
//         <View style={s.statusRow}>
//           {["all", "present", "late", "absent"].map((st) => {
//             const active = filterStatus === st;
//             return (
//               <Pressable
//                 key={st}
//                 onPress={() => {
//                   setFilterStatus(st);
//                   setPage(1);
//                 }}
//                 style={[s.statusPill, active && s.statusPillActive]}
//               >
//                 <Text
//                   style={[s.statusPillText, active && s.statusPillTextActive]}
//                 >
//                   {st === "all"
//                     ? "All"
//                     : st.charAt(0).toUpperCase() + st.slice(1)}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </View>

//         <MobileSelect
//           value={filterDept}
//           onChange={(v) => {
//             setFilterDept(v);
//             setPage(1);
//           }}
//           options={deptOptions}
//           placeholder="All Departments"
//         />

//         <View style={s.actionsRow}>
//           <Pressable onPress={load} style={s.iconBtn}>
//             <RefreshCw size={14} color={C.textSecondary} />
//           </Pressable>
//           <Pressable
//             onPress={exportCSV}
//             disabled={exporting}
//             style={s.exportBtn}
//           >
//             {exporting ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <>
//                 <Download size={13} color="#fff" />
//                 <Text style={s.exportBtnText}>Export CSV</Text>
//               </>
//             )}
//           </Pressable>
//         </View>
//       </View>

//       {/* List */}
//       {loading ? (
//         <View style={s.center}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       ) : error ? (
//         <Text style={s.errorText}>{error}</Text>
//       ) : filtered.length === 0 ? (
//         <View style={s.center}>
//           <Users size={28} color={C.textMuted} />
//           <Text style={s.emptyText}>No attendance records found.</Text>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {filtered.map((record) => {
//             const emp = empMap[record.employeeId] ?? {};
//             const name =
//               emp.name ??
//               `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim();
//             const dept = emp.department ?? record.employee?.department ?? "—";
//             const status = (record.status ?? "absent").toLowerCase();
//             const cfg = STATUS_CFG[status] ?? STATUS_CFG.absent;
//             const breakFmt = fmtMinutes(record.totalBreakMinutes);
//             const loc = record.clockInLocation;
//             const hasLoc = loc?.lat != null;

//             return (
//               <View key={record.id} style={s.card}>
//                 <View style={s.cardTop}>
//                   <View style={s.avatar}>
//                     <Text style={s.avatarText}>{initials(name)}</Text>
//                   </View>
//                   <View style={{ flex: 1, minWidth: 0 }}>
//                     <Text style={s.name} numberOfLines={1}>
//                       {name}
//                     </Text>
//                     <Text style={s.jobTitle} numberOfLines={1}>
//                       {emp.jobTitle ?? "—"}
//                     </Text>
//                   </View>
//                   <StatusChip label={cfg.label} color={cfg.color} bg={cfg.bg} />
//                 </View>

//                 <View style={s.metaRow}>
//                   <View style={[s.deptPill]}>
//                     <Text style={s.deptPillText} numberOfLines={1}>
//                       {dept}
//                     </Text>
//                   </View>
//                   <Text style={s.dateText}>
//                     {fmtShortDate(record.attendanceDate)}
//                   </Text>
//                 </View>

//                 <View style={s.timesRow}>
//                   <View style={s.timeBlock}>
//                     <Text style={s.timeLabel}>Clock In</Text>
//                     <Text style={s.timeValue}>{fmtClock(record.clockIn)}</Text>
//                   </View>
//                   <View style={s.timeBlock}>
//                     <Text style={s.timeLabel}>Clock Out</Text>
//                     <Text style={s.timeValue}>{fmtClock(record.clockOut)}</Text>
//                   </View>
//                   <View style={s.timeBlock}>
//                     <Text style={s.timeLabel}>Hours</Text>
//                     <Text style={s.timeValue}>
//                       {record.hoursWorked != null
//                         ? `${Number(record.hoursWorked).toFixed(1)}h`
//                         : "—"}
//                     </Text>
//                   </View>
//                 </View>

//                 {(breakFmt || hasLoc) && (
//                   <View style={s.tagsRow}>
//                     {breakFmt && (
//                       <View style={s.tag}>
//                         <Coffee size={10} color="#8B5CF6" />
//                         <Text style={[s.tagText, { color: "#8B5CF6" }]}>
//                           {breakFmt}
//                         </Text>
//                       </View>
//                     )}
//                     {hasLoc && (
//                       <View style={[s.tag, { backgroundColor: "#ECFEFF" }]}>
//                         <MapPin size={10} color="#06B6D4" />
//                         <Text
//                           style={[s.tagText, { color: "#06B6D4" }]}
//                           numberOfLines={1}
//                         >
//                           {loc.address
//                             ? loc.address.length > 24
//                               ? loc.address.slice(0, 24) + "…"
//                               : loc.address
//                             : `${Number(loc.lat).toFixed(3)}, ${Number(loc.lng).toFixed(3)}`}
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                 )}
//               </View>
//             );
//           })}
//         </View>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <View style={s.pagination}>
//           <Text style={s.pageInfo}>
//             {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
//           </Text>
//           <View style={{ flexDirection: "row", gap: 8 }}>
//             <Pressable
//               disabled={page === 1}
//               onPress={() => setPage((p) => p - 1)}
//               style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
//             >
//               <Text
//                 style={[s.pageBtnText, page === 1 && s.pageBtnTextDisabled]}
//               >
//                 Prev
//               </Text>
//             </Pressable>
//             <Pressable
//               disabled={page === totalPages}
//               onPress={() => setPage((p) => p + 1)}
//               style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]}
//             >
//               <Text
//                 style={[
//                   s.pageBtnText,
//                   page === totalPages && s.pageBtnTextDisabled,
//                 ]}
//               >
//                 Next
//               </Text>
//             </Pressable>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   filterCard: {
//     padding: 14,
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     gap: 12,
//   },
//   statusRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
//   statusPill: {
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 10,
//     backgroundColor: C.surfaceAlt,
//   },
//   statusPillActive: { backgroundColor: C.primary },
//   statusPillText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
//   statusPillTextActive: { color: "#fff" },

//   actionsRow: { flexDirection: "row", gap: 8 },
//   iconBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surfaceAlt,
//     borderWidth: 1,
//     borderColor: C.border,
//   },
//   exportBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 6,
//     borderRadius: 12,
//     backgroundColor: C.primary,
//     paddingVertical: 10,
//   },
//   exportBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

//   center: { alignItems: "center", gap: 10, paddingVertical: 48 },
//   errorText: {
//     fontSize: 13,
//     color: C.danger,
//     textAlign: "center",
//     paddingVertical: 24,
//   },
//   emptyText: { fontSize: 13, color: C.textMuted },

//   card: {
//     borderRadius: 16,
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//     padding: 14,
//     gap: 10,
//   },
//   cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.primary,
//   },
//   avatarText: { color: "#fff", fontSize: 12, fontWeight: "800" },
//   name: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
//   jobTitle: { fontSize: 11, color: C.textMuted, marginTop: 1 },

//   metaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   deptPill: {
//     paddingHorizontal: 9,
//     paddingVertical: 3,
//     borderRadius: 999,
//     backgroundColor: C.primaryLight,
//     maxWidth: "60%",
//   },
//   deptPillText: { fontSize: 10, fontWeight: "700", color: C.primary },
//   dateText: { fontSize: 11, color: C.textSecondary },

//   timesRow: { flexDirection: "row", justifyContent: "space-between" },
//   timeBlock: { alignItems: "flex-start" },
//   timeLabel: { fontSize: 9, color: C.textMuted, textTransform: "uppercase" },
//   timeValue: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.textPrimary,
//     marginTop: 2,
//   },

//   tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
//   tag: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 999,
//     backgroundColor: "#EDE9FE",
//     maxWidth: "70%",
//   },
//   tagText: { fontSize: 10, fontWeight: "700" },

//   pagination: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   pageInfo: { fontSize: 11, color: C.textMuted },
//   pageBtn: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 10,
//     backgroundColor: C.primary,
//   },
//   pageBtnDisabled: { backgroundColor: C.surfaceAlt },
//   pageBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
//   pageBtnTextDisabled: { color: C.textMuted },
// });

// src/components/admin/attendance/AttendanceLogView.tsx
// Mobile equivalent of AttendanceLog.jsx — table rows become cards,
// CSV export uses the native Share sheet instead of a browser download.
//
// No local spinners here — Loader.show()/Loader.hide() (the global loader)
// is the only loading indicator in the app, wrapping both the data fetch
// and the CSV export.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Share,
} from "react-native";
import {
  Download,
  RefreshCw,
  MapPin,
  Coffee,
  Users,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { attendanceApi } from "../../../api/service/attendanceApi";
import { getEmployees } from "../../../api/service/employeeApi";
import { departmentApi } from "../../../api/service/departmentApi";
import MobileSelect from "../employee/MobileSelect";
import StatusChip from "./StatusChip";
import {
  STATUS_CFG,
  buildEmpMap,
  fmtShortDate,
  fmtClock,
  fmtHours,
  fmtMinutes,
  initials,
} from "../../../hooks/attendanceHelpers";
import { Loader } from "../../../hooks/loaderManager";

const LIMIT = 30;

interface Props {
  searchQuery: string;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function AttendanceLogView({ searchQuery, showToast }: Props) {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    Loader.show();
    try {
      const params: any = {
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
      setError("Failed to load attendance records.");
    } finally {
      setLoading(false);
      Loader.hide();
    }
  }, [page, filterStatus, filterDept]);

  useEffect(() => {
    load();
  }, [load]);

  const empMap = useMemo(() => buildEmpMap(employees), [employees]);

  const filtered = useMemo(() => {
    if (!searchQuery) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) => {
      const emp = empMap[r.employeeId] ?? r.employee ?? {};
      const name =
        emp.name ??
        `${r.employee?.firstName ?? ""} ${r.employee?.lastName ?? ""}`;

      return name.toLowerCase().includes(q);
    });
  }, [records, searchQuery, empMap]);

  const exportCSV = async () => {
    setExporting(true);
    Loader.show();
    try {
      const rows = [
        [
          "Employee",
          "Department",
          "Date",
          "Clock In",
          "Clock Out",
          "Hours",
          "Break",
          "Location",
          "Status",
        ],
        ...filtered.map((r) => {
          const emp = empMap[r.employeeId] ?? {};
          const name =
            emp.name ??
            `${r.employee?.firstName ?? ""} ${r.employee?.lastName ?? ""}`.trim();
          const loc = r.clockInLocation
            ? `${r.clockInLocation.lat}, ${r.clockInLocation.lng}`
            : "—";
          return [
            name,
            emp.department ?? r.employee?.department ?? "—",
            r.attendanceDate,
            r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : "—",
            r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : "—",
            r.hoursWorked ?? "—",
            r.totalBreakMinutes ? `${r.totalBreakMinutes}m` : "—",
            loc,
            r.status,
          ];
        }),
      ];
      const csv = rows
        .map((row) => row.map((v) => `"${v}"`).join(","))
        .join("\n");
      await Share.share({
        message: csv,
        title: `attendance-${new Date().toISOString().split("T")[0]}.csv`,
      });
    } catch {
      showToast("Export failed", "error");
    } finally {
      setExporting(false);
      Loader.hide();
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const deptOptions = [
    { label: "All Departments", value: "all" },
    ...departments.map((d) => ({ label: d.name, value: d.id })),
  ];

  return (
    <View style={{ gap: 14 }}>
      {/* Filters */}
      <View style={s.filterCard}>
        <View style={s.statusRow}>
          {["all", "present", "late", "absent"].map((st) => {
            const active = filterStatus === st;
            return (
              <Pressable
                key={st}
                onPress={() => {
                  setFilterStatus(st);
                  setPage(1);
                }}
                style={[s.statusPill, active && s.statusPillActive]}
              >
                <Text
                  style={[s.statusPillText, active && s.statusPillTextActive]}
                >
                  {st === "all"
                    ? "All"
                    : st.charAt(0).toUpperCase() + st.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <MobileSelect
          value={filterDept}
          onChange={(v) => {
            setFilterDept(v);
            setPage(1);
          }}
          options={deptOptions}
          placeholder="All Departments"
        />

        <View style={s.actionsRow}>
          <Pressable onPress={load} style={s.iconBtn}>
            <RefreshCw size={14} color={C.textSecondary} />
          </Pressable>
          <Pressable
            onPress={exportCSV}
            disabled={exporting}
            style={[s.exportBtn, exporting && s.exportBtnDisabled]}
          >
            <Download size={13} color="#fff" />
            <Text style={s.exportBtnText}>
              {exporting ? "Exporting…" : "Export CSV"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* List */}
      {error ? (
        <Text style={s.errorText}>{error}</Text>
      ) : loading ? null : filtered.length === 0 ? (
        <View style={s.center}>
          <Users size={28} color={C.textMuted} />
          <Text style={s.emptyText}>No attendance records found.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {filtered.map((record) => {
            const emp = empMap[record.employeeId] ?? {};
            const name =
              emp.name ??
              `${record.employee?.firstName ?? ""} ${record.employee?.lastName ?? ""}`.trim();
            const dept = emp.department ?? record.employee?.department ?? "—";
            const status = (record.status ?? "absent").toLowerCase();
            const cfg = STATUS_CFG[status] ?? STATUS_CFG.absent;
            const breakFmt = fmtMinutes(record.totalBreakMinutes);
            const loc = record.clockInLocation;
            const hasLoc = loc?.lat != null;

            return (
              <View key={record.id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{initials(name)}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.name} numberOfLines={1}>
                      {name}
                    </Text>
                    <Text style={s.jobTitle} numberOfLines={1}>
                      {emp.jobTitle ?? "—"}
                    </Text>
                  </View>
                  <StatusChip label={cfg.label} color={cfg.color} bg={cfg.bg} />
                </View>

                <View style={s.metaRow}>
                  <View style={[s.deptPill]}>
                    <Text style={s.deptPillText} numberOfLines={1}>
                      {dept}
                    </Text>
                  </View>
                  <Text style={s.dateText}>
                    {fmtShortDate(record.attendanceDate)}
                  </Text>
                </View>

                <View style={s.timesRow}>
                  <View style={s.timeBlock}>
                    <Text style={s.timeLabel}>Clock In</Text>
                    <Text style={s.timeValue}>{fmtClock(record.clockIn)}</Text>
                  </View>
                  <View style={s.timeBlock}>
                    <Text style={s.timeLabel}>Clock Out</Text>
                    <Text style={s.timeValue}>{fmtClock(record.clockOut)}</Text>
                  </View>
                  <View style={s.timeBlock}>
                    <Text style={s.timeLabel}>Hours</Text>
                    <Text style={s.timeValue}>
                      {record.hoursWorked != null
                        ? `${Number(record.hoursWorked).toFixed(1)}h`
                        : "—"}
                    </Text>
                  </View>
                </View>

                {(breakFmt || hasLoc) && (
                  <View style={s.tagsRow}>
                    {breakFmt && (
                      <View style={s.tag}>
                        <Coffee size={10} color="#8B5CF6" />
                        <Text style={[s.tagText, { color: "#8B5CF6" }]}>
                          {breakFmt}
                        </Text>
                      </View>
                    )}
                    {hasLoc && (
                      <View style={[s.tag, { backgroundColor: "#ECFEFF" }]}>
                        <MapPin size={10} color="#06B6D4" />
                        <Text
                          style={[s.tagText, { color: "#06B6D4" }]}
                          numberOfLines={1}
                        >
                          {loc.address
                            ? loc.address.length > 24
                              ? loc.address.slice(0, 24) + "…"
                              : loc.address
                            : `${Number(loc.lat).toFixed(3)}, ${Number(loc.lng).toFixed(3)}`}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={s.pagination}>
          <Text style={s.pageInfo}>
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              disabled={page === 1}
              onPress={() => setPage((p) => p - 1)}
              style={[s.pageBtn, page === 1 && s.pageBtnDisabled]}
            >
              <Text
                style={[s.pageBtnText, page === 1 && s.pageBtnTextDisabled]}
              >
                Prev
              </Text>
            </Pressable>
            <Pressable
              disabled={page === totalPages}
              onPress={() => setPage((p) => p + 1)}
              style={[s.pageBtn, page === totalPages && s.pageBtnDisabled]}
            >
              <Text
                style={[
                  s.pageBtnText,
                  page === totalPages && s.pageBtnTextDisabled,
                ]}
              >
                Next
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  filterCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  statusRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
  },
  statusPillActive: { backgroundColor: C.primary },
  statusPillText: { fontSize: 12, fontWeight: "600", color: C.textSecondary },
  statusPillTextActive: { color: "#fff" },

  actionsRow: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  exportBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    backgroundColor: C.primary,
    paddingVertical: 10,
  },
  exportBtnDisabled: { opacity: 0.6 },
  exportBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  center: { alignItems: "center", gap: 10, paddingVertical: 48 },
  errorText: {
    fontSize: 13,
    color: C.danger,
    textAlign: "center",
    paddingVertical: 24,
  },
  emptyText: { fontSize: 13, color: C.textMuted },

  card: {
    borderRadius: 16,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    gap: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  avatarText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  name: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  jobTitle: { fontSize: 11, color: C.textMuted, marginTop: 1 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deptPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: C.primaryLight,
    maxWidth: "60%",
  },
  deptPillText: { fontSize: 10, fontWeight: "700", color: C.primary },
  dateText: { fontSize: 11, color: C.textSecondary },

  timesRow: { flexDirection: "row", justifyContent: "space-between" },
  timeBlock: { alignItems: "flex-start" },
  timeLabel: { fontSize: 9, color: C.textMuted, textTransform: "uppercase" },
  timeValue: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
    marginTop: 2,
  },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#EDE9FE",
    maxWidth: "70%",
  },
  tagText: { fontSize: 10, fontWeight: "700" },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageInfo: { fontSize: 11, color: C.textMuted },
  pageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.primary,
  },
  pageBtnDisabled: { backgroundColor: C.surfaceAlt },
  pageBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  pageBtnTextDisabled: { color: C.textMuted },
});
