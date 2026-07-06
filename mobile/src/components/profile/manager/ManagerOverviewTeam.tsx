// src/components/profile/manager/ManagerOverviewTeam.tsx
// OverviewTab — team stats + quick team preview + pending approvals
// TeamTab     — full searchable team list with employee detail sheet

import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Eye,
  X,
} from "lucide-react-native";
import C from "../../../styles/colors";
import InfoRow from "../InfoRow";

// ─── Avatar initials ──────────────────────────────────────────
function AvatarEl({
  first,
  last,
  size = 40,
}: {
  first?: string;
  last?: string;
  size?: number;
}) {
  const ini = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size * 0.28 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{ini}</Text>
    </View>
  );
}

// ─── Status chip ──────────────────────────────────────────────
function StatusChip({ status }: { status?: string }) {
  const cfgMap: Record<string, { bg: string; color: string }> = {
    active: { bg: C.successLight, color: C.success },
    on_leave: { bg: C.warningLight, color: C.warning },
    suspended: { bg: C.dangerLight, color: C.danger },
    terminated: { bg: C.surfaceAlt, color: C.textMuted },
  };
  const cfg = cfgMap[status?.toLowerCase() ?? "active"] ?? cfgMap.active;
  return (
    <View style={[styles.chip, { backgroundColor: cfg.bg }]}>
      <View style={[styles.chipDot, { backgroundColor: cfg.color }]} />
      <Text style={[styles.chipText, { color: cfg.color }]}>
        {status
          ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
          : "Active"}
      </Text>
    </View>
  );
}

// ═══════════════════════ OVERVIEW TAB ═════════════════════════
type OverviewTabProps = {
  team: any[];
  pendingApprovals: any[];
  attendanceSummary: { present: number; absent: number; late: number } | null;
};

export function OverviewTab({
  team,
  pendingApprovals,
  attendanceSummary,
}: OverviewTabProps) {
  const present = attendanceSummary?.present ?? 0;
  const absent = attendanceSummary?.absent ?? 0;
  const total = team.length;
  const rate = total ? Math.round((present / total) * 100) : 0;

  const stats = [
    {
      label: "Team Size",
      value: total,
      Icon: Users,
      color: C.primary,
      bg: C.primaryLight,
    },
    {
      label: "Present Today",
      value: present,
      Icon: CheckCircle2,
      color: C.success,
      bg: C.successLight,
    },
    {
      label: "Absent Today",
      value: absent,
      Icon: XCircle,
      color: C.danger,
      bg: C.dangerLight,
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals.length,
      Icon: Clock,
      color: C.warning,
      bg: C.warningLight,
    },
    {
      label: "Attendance Rate",
      value: `${rate}%`,
      Icon: TrendingUp,
      color: C.accent,
      bg: "#ECFEFF",
    },
  ];

  return (
    <View style={styles.gap}>
      {/* Stat tiles */}
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statTile}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <s.Icon size={16} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: s.color }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Team preview */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[styles.cardIconWrap, { backgroundColor: C.primaryLight }]}
          >
            <Users size={14} color={C.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Team Members</Text>
            <Text style={styles.cardSub}>{total} direct reports</Text>
          </View>
        </View>
        {team.length === 0 ? (
          <Text style={styles.emptyText}>No direct reports found.</Text>
        ) : (
          <View style={styles.cardBody}>
            {team.slice(0, 5).map((emp: any, i: number) => (
              <View
                key={emp.id}
                style={[
                  styles.memberRow,
                  i === Math.min(team.length, 5) - 1 && styles.lastRow,
                ]}
              >
                <AvatarEl
                  first={emp.first_name}
                  last={emp.last_name}
                  size={34}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>
                    {emp.first_name} {emp.last_name}
                  </Text>
                  <Text style={styles.memberSub}>
                    {emp.job_role_name ?? "—"} · {emp.department_name ?? "—"}
                  </Text>
                </View>
                <StatusChip status={emp.employment_status} />
              </View>
            ))}
            {team.length > 5 && (
              <Text style={styles.moreText}>
                +{team.length - 5} more members
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Pending approvals preview */}
      {pendingApprovals.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View
              style={[styles.cardIconWrap, { backgroundColor: C.warningLight }]}
            >
              <Clock size={14} color={C.warning} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Pending Approvals</Text>
              <Text style={styles.cardSub}>Requires your action</Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            {pendingApprovals.slice(0, 3).map((a: any, i: number) => (
              <View
                key={a.id}
                style={[
                  styles.approvalRow,
                  i === Math.min(pendingApprovals.length, 3) - 1 &&
                    styles.lastRow,
                ]}
              >
                <View
                  style={[
                    styles.approvalIcon,
                    { backgroundColor: C.warningLight },
                  ]}
                >
                  <Clock size={13} color={C.warning} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.approvalType}>
                    {a.type ?? a.requestType ?? "Request"}
                  </Text>
                  <Text style={styles.approvalSub}>
                    {a.employeeName ?? a.employee_name ?? "Employee"}
                  </Text>
                </View>
                <View
                  style={[styles.chip, { backgroundColor: C.warningLight }]}
                >
                  <Text style={[styles.chipText, { color: C.warning }]}>
                    Pending
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ═══════════════════════ TEAM TAB ═════════════════════════════
type TeamTabProps = {
  team: any[];
};

export function TeamTab({ team }: TeamTabProps) {
  const [search, setSearch] = useState("");
  const [profileEmp, setProfileEmp] = useState<any | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return team;
    return team.filter(
      (e) =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
        (e.job_role_name ?? "").toLowerCase().includes(q) ||
        (e.department_name ?? "").toLowerCase().includes(q),
    );
  }, [team, search]);

  return (
    <View style={styles.gap}>
      <View style={styles.searchRow}>
        <Search size={14} color={C.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search team members…"
          placeholderTextColor={C.textMuted}
          style={styles.searchInput}
        />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No team members found.</Text>
        </View>
      ) : (
        <View style={styles.gap}>
          {filtered.map((emp: any) => (
            <View key={emp.id} style={styles.teamCard}>
              <View style={styles.teamCardTop}>
                <AvatarEl
                  first={emp.first_name}
                  last={emp.last_name}
                  size={44}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>
                    {emp.first_name} {emp.last_name}
                  </Text>
                  <Text style={styles.memberSub}>
                    {emp.job_role_name ?? "—"}
                  </Text>
                  <Text style={styles.memberDept}>
                    {emp.department_name ?? "—"}
                  </Text>
                </View>
                <StatusChip status={emp.employment_status} />
              </View>
              <View style={styles.teamCardActions}>
                <Pressable
                  onPress={() => setProfileEmp(emp)}
                  style={({ pressed }) => [
                    styles.viewBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Eye size={12} color={C.textSecondary} />
                  <Text style={styles.viewBtnLabel}>View Profile</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Employee detail modal */}
      <Modal
        visible={!!profileEmp}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileEmp(null)}
      >
        <View style={styles.empModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setProfileEmp(null)}
          />
          {profileEmp && (
            <View style={styles.empModalSheet}>
              <View style={styles.empModalBanner}>
                <AvatarEl
                  first={profileEmp.first_name}
                  last={profileEmp.last_name}
                  size={54}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.empModalName}>
                    {profileEmp.first_name} {profileEmp.last_name}
                  </Text>
                  <Text style={styles.empModalSub}>
                    {profileEmp.job_role_name ?? "—"} ·{" "}
                    {profileEmp.department_name ?? "—"}
                  </Text>
                  {!!profileEmp.employee_code && (
                    <Text style={styles.empModalCode}>
                      {profileEmp.employee_code}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={() => setProfileEmp(null)}
                  hitSlop={8}
                  style={styles.empModalClose}
                >
                  <X size={15} color="#fff" />
                </Pressable>
              </View>
              <ScrollView
                style={styles.empModalBody}
                showsVerticalScrollIndicator={false}
              >
                {[
                  {
                    label: "Email",
                    value: profileEmp.work_email ?? profileEmp.personal_email,
                  },
                  { label: "Phone", value: profileEmp.phone },
                  { label: "Location", value: profileEmp.location },
                  {
                    label: "Employment Type",
                    value: profileEmp.employment_type?.replace("_", " "),
                  },
                  {
                    label: "Start Date",
                    value: profileEmp.start_date
                      ? new Date(profileEmp.start_date).toLocaleDateString(
                          "en-NG",
                        )
                      : null,
                  },
                  { label: "Status", value: profileEmp.employment_status },
                ].map((r, i, arr) => (
                  <InfoRow
                    key={r.label}
                    label={r.label}
                    value={r.value}
                    last={i === arr.length - 1}
                  />
                ))}
                <View style={{ height: 12 }} />
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statTile: {
    width: "47%",
    flexGrow: 1,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: C.textPrimary,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    marginTop: 2,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cardIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  cardSub: {
    fontSize: 10,
    color: C.textMuted,
    marginTop: 1,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },
  memberSub: {
    fontSize: 10.5,
    color: C.textMuted,
  },
  memberDept: {
    fontSize: 10,
    color: C.textMuted,
  },
  moreText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.primary,
    paddingVertical: 8,
  },
  approvalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  approvalIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  approvalType: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
  },
  approvalSub: {
    fontSize: 10.5,
    color: C.textMuted,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: C.textPrimary,
    padding: 0,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12.5,
    color: C.textMuted,
    textAlign: "center",
    paddingVertical: 20,
  },
  teamCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  teamCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    marginBottom: 12,
  },
  teamCardActions: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  viewBtnLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    color: C.textSecondary,
  },
  avatar: {
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
  },
  // Employee detail modal
  empModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  empModalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    overflow: "hidden",
  },
  empModalBanner: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    backgroundColor: C.navy,
    padding: 18,
  },
  empModalName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
  empModalSub: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  empModalCode: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.4)",
    fontFamily: "monospace",
    marginTop: 2,
  },
  empModalClose: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start",
  },
  empModalBody: {
    padding: 16,
  },
});
