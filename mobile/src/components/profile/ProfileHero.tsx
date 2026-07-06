// src/components/profile/ProfileHero.tsx
// Avatar, name, role badge, department/code, and a profile-completion bar.
// Shared between employee and manager profile screens.

import { View, Text, StyleSheet } from "react-native";
import { Award } from "lucide-react-native";
import C from "../../styles/colors";

type ProfileHeroProps = {
  firstName?: string | null;
  lastName?: string | null;
  jobRoleName?: string | null;
  departmentName?: string | null;
  employeeCode?: string | null;
  avatar?: string | null;
  employmentStatus?: string | null;
  isManager?: boolean;
  completionPct?: number;
};

function initialsOf(first?: string | null, last?: string | null) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

const STATUS_CFG: Record<string, { bg: string; color: string }> = {
  active: { bg: C.successLight, color: C.success },
  on_leave: { bg: C.warningLight, color: C.warning },
  suspended: { bg: C.dangerLight, color: C.danger },
  terminated: { bg: C.surfaceAlt, color: C.textMuted },
};

export default function ProfileHero({
  firstName,
  lastName,
  jobRoleName,
  departmentName,
  employeeCode,
  isManager,
  employmentStatus,
  completionPct = 0,
}: ProfileHeroProps) {
  const initials = initialsOf(firstName, lastName);
  const statusCfg =
    STATUS_CFG[employmentStatus?.toLowerCase() ?? "active"] ??
    STATUS_CFG.active;

  return (
    <View style={styles.container}>
      <View style={styles.gradient}>
        <View style={styles.topRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {isManager && (
              <View style={styles.mgrBadge}>
                <Award size={8} color="#fff" />
                <Text style={styles.mgrBadgeText}>MGR</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {firstName} {lastName}
              </Text>
              {isManager && (
                <View style={styles.mgrChip}>
                  <Text style={styles.mgrChipText}>Manager</Text>
                </View>
              )}
              <View
                style={[styles.statusChip, { backgroundColor: statusCfg.bg }]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusCfg.color },
                  ]}
                />
                <Text style={[styles.statusText, { color: statusCfg.color }]}>
                  {employmentStatus
                    ? employmentStatus.charAt(0).toUpperCase() +
                      employmentStatus.slice(1).replace("_", " ")
                    : "Active"}
                </Text>
              </View>
            </View>
            <Text style={styles.sub} numberOfLines={1}>
              {jobRoleName ?? "—"} · {departmentName ?? "—"}
            </Text>
            {!!employeeCode && <Text style={styles.code}>{employeeCode}</Text>}
          </View>
        </View>
      </View>

      {/* Completion bar */}
      <View style={styles.completionBar}>
        <View style={styles.completionLabelRow}>
          <Text style={styles.completionLabel}>Profile completion</Text>
          <Text style={styles.completionPct}>{completionPct}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${completionPct}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
  },
  gradient: {
    backgroundColor: C.navy,
    padding: 18,
    paddingBottom: 22,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  mgrBadge: {
    position: "absolute",
    bottom: -6,
    right: -6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  mgrBadgeText: {
    fontSize: 7.5,
    fontWeight: "800",
    color: "#fff",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    flexShrink: 1,
  },
  mgrChip: {
    backgroundColor: "rgba(245,158,11,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  mgrChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#F59E0B",
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 999,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  sub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 2,
  },
  code: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontFamily: "monospace",
  },
  completionBar: {
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  completionLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  completionLabel: {
    fontSize: 11,
    color: C.textMuted,
  },
  completionPct: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
  },
  track: {
    height: 4,
    borderRadius: 999,
    backgroundColor: C.border,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: C.primary,
  },
});
