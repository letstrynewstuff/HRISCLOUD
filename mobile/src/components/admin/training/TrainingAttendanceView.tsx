// // src/components/admin/training/TrainingAttendanceView.tsx
// // Mobile equivalent of TrainingAttendance.jsx — per-training enrollment
// // attendance marking + certificate issuance. Named "TrainingAttendanceView"
// // (scoped under components/admin/training) to avoid colliding with the
// // unrelated payroll AttendanceLogView under components/admin/attendance.

// import { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   ActivityIndicator,
// } from "react-native";
// import { RefreshCw, AlertCircle, Users } from "lucide-react-native";

// import C from "../../../styles/colors";
// import {
//   listTrainings,
//   getEnrollments,
//   markAttendance,
//   issueCertificate,
// } from "../../../api/service/trainingApi";
// import StatusChip from "../attendance/StatusChip";
// import MobileSelect from "../employee/MobileSelect";
// import {
//   ATTENDANCE_STATUS_CFG,
//   initials,
// } from "../../../hooks/trainingHelpers";

// interface Props {
//   showToast: (msg: string, type?: "success" | "error" | "info") => void;
// }

// export default function TrainingAttendanceView({ showToast }: Props) {
//   const [trainings, setTrainings] = useState<any[]>([]);
//   const [selectedId, setSelectedId] = useState("");
//   const [records, setRecords] = useState<any[]>([]);
//   const [loadingTrainings, setLoadingTrainings] = useState(true);
//   const [loadingRecords, setLoadingRecords] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
//     {},
//   );

//   useEffect(() => {
//     listTrainings({ limit: 100 })
//       .then((r: any) => {
//         setTrainings(r.data ?? []);
//         if (r.data?.[0]) setSelectedId(r.data[0].id);
//       })
//       .catch((e: any) =>
//         setError(e?.response?.data?.message ?? "Failed to load trainings."),
//       )
//       .finally(() => setLoadingTrainings(false));
//   }, []);

//   const fetchRecords = useCallback(async () => {
//     if (!selectedId) return;
//     setLoadingRecords(true);
//     setError(null);
//     try {
//       const res = await getEnrollments(selectedId);
//       setRecords(res.data ?? []);
//     } catch (e: any) {
//       setError(e?.response?.data?.message ?? "Failed to load attendance.");
//     } finally {
//       setLoadingRecords(false);
//     }
//   }, [selectedId]);

//   useEffect(() => {
//     fetchRecords();
//   }, [fetchRecords]);

//   const handleMark = async (record: any, status: string) => {
//     const key = `${record.employee_id}-attend`;
//     setActionLoading((p) => ({ ...p, [key]: true }));
//     try {
//       await markAttendance(selectedId, record.employee_id, status);
//       setRecords((prev) =>
//         prev.map((r) =>
//           r.employee_id === record.employee_id
//             ? { ...r, attendance_status: status }
//             : r,
//         ),
//       );
//       showToast("Attendance updated.");
//     } catch {
//       showToast("Failed to update attendance.", "error");
//     } finally {
//       setActionLoading((p) => ({ ...p, [key]: false }));
//     }
//   };

//   const handleCert = async (record: any) => {
//     const key = `${record.employee_id}-cert`;
//     setActionLoading((p) => ({ ...p, [key]: true }));
//     try {
//       await issueCertificate(selectedId, record.employee_id);
//       setRecords((prev) =>
//         prev.map((r) =>
//           r.employee_id === record.employee_id
//             ? { ...r, certificate_issued: true }
//             : r,
//         ),
//       );
//       showToast("Certificate issued.");
//     } catch (e: any) {
//       showToast(
//         e?.response?.data?.message ?? "Failed to issue certificate.",
//         "error",
//       );
//     } finally {
//       setActionLoading((p) => ({ ...p, [key]: false }));
//     }
//   };

//   const trainingOptions = trainings.map((t) => ({
//     label: t.title,
//     value: t.id,
//   }));

//   return (
//     <View style={{ gap: 14 }}>
//       {/* Training selector */}
//       <View style={s.selectorRow}>
//         <View style={{ flex: 1 }}>
//           <MobileSelect
//             value={selectedId}
//             onChange={setSelectedId}
//             options={trainingOptions}
//             placeholder={
//               loadingTrainings ? "Loading trainings…" : "Select training"
//             }
//           />
//         </View>
//         <Pressable onPress={fetchRecords} style={s.refreshBtn}>
//           <RefreshCw size={14} color={C.textSecondary} />
//         </Pressable>
//       </View>

//       {error ? (
//         <View style={s.errorBox}>
//           <AlertCircle size={16} color={C.danger} />
//           <Text style={s.errorText}>{error}</Text>
//         </View>
//       ) : null}

//       {/* List */}
//       {loadingRecords ? (
//         <View style={s.center}>
//           <ActivityIndicator size="large" color={C.primary} />
//         </View>
//       ) : records.length === 0 ? (
//         <View style={s.center}>
//           <Users size={28} color={C.textMuted} />
//           <Text style={s.emptyText}>No enrollments for this training yet.</Text>
//         </View>
//       ) : (
//         <View style={{ gap: 10 }}>
//           {records.map((r) => {
//             const status = r.attendance_status ?? "pending";
//             const cfg =
//               ATTENDANCE_STATUS_CFG[status] ?? ATTENDANCE_STATUS_CFG.pending;
//             const markBusy = actionLoading[`${r.employee_id}-attend`];
//             const certBusy = actionLoading[`${r.employee_id}-cert`];

//             return (
//               <View key={r.employee_id} style={s.card}>
//                 <View style={s.cardTop}>
//                   <View style={s.avatar}>
//                     <Text style={s.avatarText}>
//                       {initials(r.employee_name)}
//                     </Text>
//                   </View>
//                   <View style={{ flex: 1, minWidth: 0 }}>
//                     <Text style={s.name} numberOfLines={1}>
//                       {r.employee_name}
//                     </Text>
//                     <Text style={s.meta} numberOfLines={1}>
//                       {r.employee_code} · {r.department_name ?? "—"}
//                     </Text>
//                   </View>
//                   <StatusChip label={cfg.label} color={cfg.color} bg={cfg.bg} />
//                 </View>

//                 <View style={s.certRow}>
//                   <Text style={s.certLabel}>Certificate</Text>
//                   <View
//                     style={[
//                       s.certPill,
//                       {
//                         backgroundColor: r.certificate_issued
//                           ? "#D1FAE5"
//                           : "#F1F5F9",
//                       },
//                     ]}
//                   >
//                     <Text
//                       style={[
//                         s.certPillText,
//                         { color: r.certificate_issued ? "#059669" : "#64748B" },
//                       ]}
//                     >
//                       {r.certificate_issued ? "Issued" : "Not issued"}
//                     </Text>
//                   </View>
//                 </View>

//                 <View style={s.actionsRow}>
//                   {status !== "attended" && (
//                     <Pressable
//                       onPress={() => handleMark(r, "attended")}
//                       disabled={markBusy}
//                       style={s.markBtn}
//                     >
//                       {markBusy ? (
//                         <ActivityIndicator size="small" color="#059669" />
//                       ) : (
//                         <Text style={s.markBtnText}>Mark Attended</Text>
//                       )}
//                     </Pressable>
//                   )}
//                   {status === "attended" && !r.certificate_issued && (
//                     <Pressable
//                       onPress={() => handleCert(r)}
//                       disabled={certBusy}
//                       style={s.certBtn}
//                     >
//                       {certBusy ? (
//                         <ActivityIndicator size="small" color={C.primary} />
//                       ) : (
//                         <Text style={s.certBtnText}>Issue Certificate</Text>
//                       )}
//                     </Pressable>
//                   )}
//                 </View>
//               </View>
//             );
//           })}
//         </View>
//       )}
//     </View>
//   );
// }

// const s = StyleSheet.create({
//   selectorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
//   refreshBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.surface,
//     borderWidth: 1,
//     borderColor: C.border,
//   },

//   errorBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: "#FEF2F2",
//   },
//   errorText: { fontSize: 12, color: C.danger, flex: 1 },

//   center: { alignItems: "center", gap: 10, paddingVertical: 48 },
//   emptyText: { fontSize: 13, color: C.textMuted, textAlign: "center" },

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
//   meta: { fontSize: 11, color: C.textMuted, marginTop: 1 },

//   certRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   certLabel: { fontSize: 12, color: C.textSecondary },
//   certPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
//   certPillText: { fontSize: 11, fontWeight: "700" },

//   actionsRow: { flexDirection: "row", gap: 10 },
//   markBtn: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 12,
//     alignItems: "center",
//     backgroundColor: "#D1FAE5",
//   },
//   markBtnText: { fontSize: 12, fontWeight: "700", color: "#059669" },
//   certBtn: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 12,
//     alignItems: "center",
//     backgroundColor: C.primaryLight,
//   },
//   certBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },
// });


// src/components/admin/training/TrainingAttendanceView.tsx
// Mobile equivalent of TrainingAttendance.jsx — per-training enrollment
// attendance marking + certificate issuance. Named "TrainingAttendanceView"
// (scoped under components/admin/training) to avoid colliding with the
// unrelated payroll AttendanceLogView under components/admin/attendance.

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { RefreshCw, AlertCircle, Users } from "lucide-react-native";

import C from "../../../styles/colors";
import {
  listTrainings,
  getEnrollments,
  markAttendance,
  issueCertificate,
} from "../../../api/service/trainingApi";
import StatusChip from "../attendance/StatusChip";
import MobileSelect from "../employee/MobileSelect";
import { ATTENDANCE_STATUS_CFG, initials } from "../../../hooks/trainingHelpers";
import { Loader } from "../../../hooks/loaderManager";

interface Props {
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function TrainingAttendanceView({ showToast }: Props) {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [records, setRecords] = useState<any[]>([]);
  const [loadingTrainings, setLoadingTrainings] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    Loader.show();
    listTrainings({ limit: 100 })
      .then((r: any) => {
        setTrainings(r.data ?? []);
        if (r.data?.[0]) setSelectedId(r.data[0].id);
      })
      .catch((e: any) =>
        setError(e?.response?.data?.message ?? "Failed to load trainings."),
      )
      .finally(() => {
        setLoadingTrainings(false);
        Loader.hide();
      });
  }, []);

  const fetchRecords = useCallback(async () => {
    if (!selectedId) return;
    setLoadingRecords(true);
    setError(null);
    Loader.show();
    try {
      const res = await getEnrollments(selectedId);
      setRecords(res.data ?? []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load attendance.");
    } finally {
      setLoadingRecords(false);
      Loader.hide();
    }
  }, [selectedId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleMark = async (record: any, status: string) => {
    const key = `${record.employee_id}-attend`;
    setActionLoading((p) => ({ ...p, [key]: true }));
    Loader.show();
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
    } catch {
      showToast("Failed to update attendance.", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
      Loader.hide();
    }
  };

  const handleCert = async (record: any) => {
    const key = `${record.employee_id}-cert`;
    setActionLoading((p) => ({ ...p, [key]: true }));
    Loader.show();
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
    } catch (e: any) {
      showToast(
        e?.response?.data?.message ?? "Failed to issue certificate.",
        "error",
      );
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
      Loader.hide();
    }
  };

  const trainingOptions = trainings.map((t) => ({
    label: t.title,
    value: t.id,
  }));

  return (
    <View style={{ gap: 14 }}>
      {/* Training selector */}
      <View style={s.selectorRow}>
        <View style={{ flex: 1 }}>
          <MobileSelect
            value={selectedId}
            onChange={setSelectedId}
            options={trainingOptions}
            placeholder={
              loadingTrainings ? "Loading trainings…" : "Select training"
            }
          />
        </View>
        <Pressable onPress={fetchRecords} style={s.refreshBtn}>
          <RefreshCw size={14} color={C.textSecondary} />
        </Pressable>
      </View>

      {error ? (
        <View style={s.errorBox}>
          <AlertCircle size={16} color={C.danger} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* List */}
      {loadingRecords ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : records.length === 0 ? (
        <View style={s.center}>
          <Users size={28} color={C.textMuted} />
          <Text style={s.emptyText}>No enrollments for this training yet.</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {records.map((r) => {
            const status = r.attendance_status ?? "pending";
            const cfg = ATTENDANCE_STATUS_CFG[status] ?? ATTENDANCE_STATUS_CFG.pending;
            const markBusy = actionLoading[`${r.employee_id}-attend`];
            const certBusy = actionLoading[`${r.employee_id}-cert`];

            return (
              <View key={r.employee_id} style={s.card}>
                <View style={s.cardTop}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>
                      {initials(r.employee_name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.name} numberOfLines={1}>
                      {r.employee_name}
                    </Text>
                    <Text style={s.meta} numberOfLines={1}>
                      {r.employee_code} · {r.department_name ?? "—"}
                    </Text>
                  </View>
                  <StatusChip label={cfg.label} color={cfg.color} bg={cfg.bg} />
                </View>

                <View style={s.certRow}>
                  <Text style={s.certLabel}>Certificate</Text>
                  <View
                    style={[
                      s.certPill,
                      {
                        backgroundColor: r.certificate_issued
                          ? "#D1FAE5"
                          : "#F1F5F9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.certPillText,
                        { color: r.certificate_issued ? "#059669" : "#64748B" },
                      ]}
                    >
                      {r.certificate_issued ? "Issued" : "Not issued"}
                    </Text>
                  </View>
                </View>

                <View style={s.actionsRow}>
                  {status !== "attended" && (
                    <Pressable
                      onPress={() => handleMark(r, "attended")}
                      disabled={markBusy}
                      style={s.markBtn}
                    >
                      {markBusy ? (
                        <ActivityIndicator size="small" color="#059669" />
                      ) : (
                        <Text style={s.markBtnText}>Mark Attended</Text>
                      )}
                    </Pressable>
                  )}
                  {status === "attended" && !r.certificate_issued && (
                    <Pressable
                      onPress={() => handleCert(r)}
                      disabled={certBusy}
                      style={s.certBtn}
                    >
                      {certBusy ? (
                        <ActivityIndicator size="small" color={C.primary} />
                      ) : (
                        <Text style={s.certBtnText}>Issue Certificate</Text>
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  selectorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
  },
  errorText: { fontSize: 12, color: C.danger, flex: 1 },

  center: { alignItems: "center", gap: 10, paddingVertical: 48 },
  emptyText: { fontSize: 13, color: C.textMuted, textAlign: "center" },

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
  meta: { fontSize: 11, color: C.textMuted, marginTop: 1 },

  certRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  certLabel: { fontSize: 12, color: C.textSecondary },
  certPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  certPillText: { fontSize: 11, fontWeight: "700" },

  actionsRow: { flexDirection: "row", gap: 10 },
  markBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#D1FAE5",
  },
  markBtnText: { fontSize: 12, fontWeight: "700", color: "#059669" },
  certBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: C.primaryLight,
  },
  certBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },
});