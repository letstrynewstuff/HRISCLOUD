// src/components/admin/reports/ReportDetailView.tsx

import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Users,
  Target,
  RefreshCw,
  UserCheck,
  MessageSquarePlus,
  ShieldAlert,
  AlertTriangle,
  Lock,
  FileText,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { reportApi } from "../../../api/service/reportApi";
import { useAuth } from "../../../hooks/useAuth";
import {
  CategoryPill,
  SeverityBadge,
  StatusBadge,
  ReportAvatar,
  getInitials,
  fmtDateTime,
} from "./reportShared";
import StatusUpdateModal from "./StatusUpdateModal";
import AssignReportModal from "./AssignReportModal";
import AddNoteModal from "./AddNoteModal";
import RevealIdentityModal from "./RevealIdentityModal";
import { Loader } from "../../../hooks/loaderManager";

interface Props {
  reportId: string;
  onClose: () => void;
}

function InfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <View style={s.infoBlock}>
      <Icon size={13} color={C.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ReportDetailView({ reportId, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusModal, setStatusModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [revealModal, setRevealModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [revealed, setRevealed] = useState<any>(null);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await reportApi.getReport(reportId);
//       setReport(res.data ?? res);
//     } catch {
//       setError("Failed to load report.");
//     } finally {
//       setLoading(false);
//     }
//   }, [reportId]);
const load = useCallback(async () => {
  setLoading(true);
  setError(null);
  Loader.show();
  try {
    const res = await reportApi.getReport(reportId);
    setReport(res.data ?? res);
  } catch {
    setError("Failed to load report.");
  } finally {
    setLoading(false);
    Loader.hide();
  }
}, [reportId]);
  useEffect(() => {
    load();
  }, [load]);

  const handleStatusSave = async (status: string, note: string) => {
    setActionLoading(true);
    try {
      await reportApi.updateStatus(reportId, {
        status,
        note: note || undefined,
      });
      await load();
      setStatusModal(false);
    } catch {
      // could surface a toast
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSave = async (assignedTo: string | null) => {
    setActionLoading(true);
    try {
      await reportApi.assign(reportId, { assignedTo });
      await load();
      setAssignModal(false);
    } catch {
      // could surface a toast
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (note: string, visibleToReporter: boolean) => {
    setActionLoading(true);
    try {
      await reportApi.addNote(reportId, { note, visibleToReporter });
      await load();
      setNoteModal(false);
    } catch {
      // could surface a toast
    } finally {
      setActionLoading(false);
    }
  };

  const handleReveal = async (reason: string) => {
    setActionLoading(true);
    try {
      const res = await reportApi.revealIdentity(reportId, { reason });
      setRevealed(res.data?.reporter ?? res.reporter ?? null);
      setRevealModal(false);
    } catch {
      // could surface a toast
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <AlertTriangle size={32} color={C.danger} />
        <Text style={{ color: C.danger, marginTop: 10 }}>
          {error ?? "Report not found."}
        </Text>
        <Pressable
          onPress={onClose}
          style={[s.secondaryBtn, { marginTop: 14 }]}
        >
          <Text style={s.secondaryBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const reporterDisplay = revealed ?? report.reporter;
  const isAnonymous = report.isAnonymous && !revealed;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={onClose} style={s.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{report.referenceCode}</Text>
          <Text style={s.headerSubtitle}>Report Details</Text>
        </View>
        <Pressable onPress={load} style={s.headerBack}>
          <RefreshCw size={15} color={C.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={s.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary card */}
        <View style={s.card}>
          <View style={s.badgeRow}>
            <CategoryPill category={report.category} />
            <SeverityBadge severity={report.severity} />
            <StatusBadge status={report.status} />
          </View>
          <Text style={s.subject}>{report.subject}</Text>
          <Text style={s.description}>{report.description}</Text>
        </View>

        {/* Incident details */}
        {(report.incidentDate ||
          report.location ||
          report.involvedParties ||
          report.witnesses ||
          report.desiredOutcome) && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Incident Details</Text>
            <InfoBlock
              icon={Calendar}
              label="Incident Date"
              value={report.incidentDate}
            />
            <InfoBlock icon={MapPin} label="Location" value={report.location} />
            <InfoBlock
              icon={Users}
              label="Involved Parties"
              value={report.involvedParties}
            />
            <InfoBlock
              icon={FileText}
              label="Witnesses"
              value={report.witnesses}
            />
            <InfoBlock
              icon={Target}
              label="Desired Outcome"
              value={report.desiredOutcome}
            />
          </View>
        )}

        {/* Reporter */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Reporter</Text>
          <View style={s.reporterRow}>
            <ReportAvatar
              initials={getInitials(reporterDisplay?.name)}
              anonymous={isAnonymous}
              size={40}
            />
            <View style={{ flex: 1 }}>
              <Text style={s.reporterName}>
                {isAnonymous ? "Anonymous" : (reporterDisplay?.name ?? "—")}
              </Text>
              {!isAnonymous && (
                <Text style={s.reporterMeta} numberOfLines={1}>
                  {reporterDisplay?.department ?? "—"} ·{" "}
                  {reporterDisplay?.code ?? "—"}
                </Text>
              )}
              {isAnonymous && (
                <View style={s.anonBadge}>
                  <Lock size={9} color={C.textMuted} />
                  <Text style={s.anonBadgeText}>Identity protected</Text>
                </View>
              )}
            </View>
          </View>
          {isAnonymous && isSuperAdmin && (
            <Pressable onPress={() => setRevealModal(true)} style={s.revealBtn}>
              <ShieldAlert size={13} color={C.danger} />
              <Text style={s.revealBtnText}>Reveal Identity</Text>
            </Pressable>
          )}
        </View>

        {/* Assignment */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <Text style={s.cardTitle}>Assigned To</Text>
            <Pressable onPress={() => setAssignModal(true)} style={s.smallBtn}>
              <Text style={s.smallBtnText}>
                {report.assignedTo ? "Reassign" : "Assign"}
              </Text>
            </Pressable>
          </View>
          {report.assignedTo ? (
            <View style={s.reporterRow}>
              <ReportAvatar
                initials={getInitials(report.assignedTo.name)}
                size={36}
              />
              <Text style={s.reporterName}>{report.assignedTo.name}</Text>
            </View>
          ) : (
            <Text style={s.mutedText}>No one assigned yet.</Text>
          )}
        </View>

        {/* Action buttons */}
        <View style={s.actionRow}>
          <Pressable onPress={() => setStatusModal(true)} style={s.primaryBtn}>
            <RefreshCw size={13} color="#fff" />
            <Text style={s.primaryBtnText}>Update Status</Text>
          </Pressable>
          <Pressable onPress={() => setNoteModal(true)} style={s.secondaryBtn}>
            <MessageSquarePlus size={13} color={C.primary} />
            <Text style={s.secondaryBtnText}>Add Note</Text>
          </Pressable>
        </View>

        {/* Timeline / notes */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Investigation Timeline</Text>
          {(report.notes ?? []).length === 0 ? (
            <Text style={s.mutedText}>No notes yet.</Text>
          ) : (
            <View style={{ gap: 12 }}>
              {report.notes.map((n: any) => (
                <View key={n.id} style={s.noteRow}>
                  <View
                    style={[
                      s.noteIcon,
                      {
                        backgroundColor: n.isStatusChange
                          ? C.primaryLight
                          : C.surfaceAlt,
                      },
                    ]}
                  >
                    <MessageSquarePlus
                      size={12}
                      color={n.isStatusChange ? C.primary : C.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.noteText}>{n.note}</Text>
                    <View style={s.noteMetaRow}>
                      <Text style={s.noteMeta}>{fmtDateTime(n.createdAt)}</Text>
                      {n.visibleToReporter && (
                        <View style={s.visiblePill}>
                          <Text style={s.visiblePillText}>
                            Visible to reporter
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 8 }} />
      </ScrollView>

      <StatusUpdateModal
        visible={statusModal}
        currentStatus={report.status}
        saving={actionLoading}
        onSave={handleStatusSave}
        onClose={() => setStatusModal(false)}
      />
      <AssignReportModal
        visible={assignModal}
        currentAssignedId={report.assignedTo?.id ?? null}
        saving={actionLoading}
        onSave={handleAssignSave}
        onClose={() => setAssignModal(false)}
      />
      <AddNoteModal
        visible={noteModal}
        saving={actionLoading}
        onSave={handleAddNote}
        onClose={() => setNoteModal(false)}
      />
      <RevealIdentityModal
        visible={revealModal}
        saving={actionLoading}
        onConfirm={handleReveal}
        onClose={() => setRevealModal(false)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: C.textPrimary,
    fontFamily: "monospace",
  },
  headerSubtitle: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  body: { padding: 16, gap: 14, paddingBottom: 24 },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  subject: { fontSize: 16, fontWeight: "800", color: C.textPrimary },
  description: { fontSize: 13, lineHeight: 20, color: C.textSecondary },

  infoBlock: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoLabel: { fontSize: 10, color: C.textMuted },
  infoValue: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textPrimary,
    marginTop: 2,
    lineHeight: 17,
  },

  reporterRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  reporterName: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  reporterMeta: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  anonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
  },
  anonBadgeText: { fontSize: 9, color: C.textMuted, fontWeight: "700" },

  revealBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.dangerLight,
  },
  revealBtnText: { fontSize: 12, fontWeight: "800", color: C.danger },

  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
  },
  smallBtnText: { fontSize: 11, fontWeight: "700", color: C.primary },
  mutedText: { fontSize: 12, color: C.textMuted },

  actionRow: { flexDirection: "row", gap: 10 },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  primaryBtnText: { fontSize: 12, fontWeight: "800", color: "#fff" },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
  },
  secondaryBtnText: { fontSize: 12, fontWeight: "800", color: C.primary },

  noteRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  noteIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  noteText: { fontSize: 12, color: C.textPrimary, lineHeight: 17 },
  noteMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  noteMeta: { fontSize: 10, color: C.textMuted },
  visiblePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 20,
    backgroundColor: C.successLight,
  },
  visiblePillText: { fontSize: 9, fontWeight: "700", color: C.success },
});
