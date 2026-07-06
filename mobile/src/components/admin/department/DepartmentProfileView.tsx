// src/components/admin/department/DepartmentProfileView.tsx
// Mobile equivalent of the web VIEW slide-over on DepartmentsPage.jsx.

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Edit2,
  UserPlus,
  Building2,
  Crown,
  Users,
} from "lucide-react-native";

import C from "../../../styles/colors";
import {
  getPalette,
  empFullName,
  empInitials,
  deptFmtDate,
} from "../../../hooks/deptHelpers";

interface Props {
  department: any;
  deptEmployees: any[];
  headEmployee: any | null;
  index: number;
  empLoading: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAssign: () => void;
}

export default function DepartmentProfileView({
  department,
  deptEmployees,
  headEmployee,
  index,
  empLoading,
  onClose,
  onEdit,
  onAssign,
}: Props) {
  const insets = useSafeAreaInsets();
  const pal = getPalette(department, index);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={onClose} style={s.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <Text style={s.headerTitle}>Department Details</Text>
        <View style={s.headerActions}>
          <Pressable
            onPress={onAssign}
            style={[s.headerBtn, { backgroundColor: C.successLight }]}
          >
            <UserPlus size={13} color={C.success} />
            <Text style={[s.headerBtnText, { color: C.success }]}>Assign</Text>
          </Pressable>
          <Pressable
            onPress={onEdit}
            style={[s.headerBtn, { backgroundColor: C.primaryLight }]}
          >
            <Edit2 size={13} color={C.primary} />
            <Text style={[s.headerBtnText, { color: C.primary }]}>Edit</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.scrollContent}>
        <View style={[s.accentBar, { backgroundColor: pal.color }]} />

        <View style={s.titleRow}>
          <View style={[s.titleIconWrap, { backgroundColor: pal.bg }]}>
            <Building2 size={26} color={pal.color} />
          </View>
          <View>
            <Text style={s.titleName}>{department.name}</Text>
            <Text style={s.titleMeta}>
              {deptFmtDate(department.created_at)}
            </Text>
          </View>
        </View>

        <Text style={s.description}>
          {department.description || "No description provided."}
        </Text>

        <View style={s.statGrid}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Headcount</Text>
            <Text style={s.statValue}>{deptEmployees.length} employees</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Parent</Text>
            <Text style={s.statValue}>
              {department.parent_department_name ?? "None"}
            </Text>
          </View>
        </View>

        {(headEmployee || department.head_name) && (
          <View style={[s.headCard, { backgroundColor: pal.bg }]}>
            <View style={s.headCardTitleRow}>
              <Crown size={12} color="#F59E0B" />
              <Text style={[s.headCardTitle, { color: pal.color }]}>
                Department Head
              </Text>
            </View>
            <View style={s.headCardBody}>
              <View style={[s.headAvatar, { backgroundColor: pal.color }]}>
                <Text style={s.headAvatarText}>
                  {empInitials(
                    headEmployee ?? { first_name: department.head_name },
                  )}
                </Text>
              </View>
              <View>
                <Text style={s.headName}>
                  {headEmployee
                    ? empFullName(headEmployee)
                    : department.head_name}
                </Text>
                {headEmployee?.job_title && (
                  <Text style={s.headJob}>{headEmployee.job_title}</Text>
                )}
                {headEmployee?.email && (
                  <Text style={s.headEmail}>{headEmployee.email}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={s.membersHeader}>
          <Text style={s.membersTitle}>Team Members</Text>
          <View style={s.membersHeaderRight}>
            <View style={[s.memberCountPill, { backgroundColor: pal.bg }]}>
              <Text style={[s.memberCountPillText, { color: pal.color }]}>
                {deptEmployees.length}
              </Text>
            </View>
            <Pressable onPress={onAssign} style={s.addBtn}>
              <UserPlus size={10} color={C.primary} />
              <Text style={s.addBtnText}>Add</Text>
            </Pressable>
          </View>
        </View>

        {empLoading ? (
          <Text style={s.emptyText}>Loading employees…</Text>
        ) : deptEmployees.length === 0 ? (
          <View style={s.emptyMembers}>
            <Users size={24} color={C.textMuted} />
            <Text style={s.emptyText}>No employees assigned yet</Text>
            <Pressable onPress={onAssign} style={s.emptyAssignBtn}>
              <UserPlus size={12} color={C.primary} />
              <Text style={s.emptyAssignBtnText}>Assign employees</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {deptEmployees.map((emp) => (
              <View key={emp.id} style={s.memberRow}>
                <View style={[s.memberAvatar, { backgroundColor: pal.color }]}>
                  <Text style={s.memberAvatarText}>{empInitials(emp)}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={s.memberNameRow}>
                    <Text style={s.memberName} numberOfLines={1}>
                      {empFullName(emp)}
                    </Text>
                    {emp.id === department.head_id && (
                      <Crown size={10} color="#F59E0B" />
                    )}
                  </View>
                  {(emp.job_title ?? emp.position) && (
                    <Text style={s.memberJob} numberOfLines={1}>
                      {emp.job_title ?? emp.position}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    s.statusPill,
                    {
                      backgroundColor:
                        emp.status === "active" ? C.successLight : C.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.statusPillText,
                      {
                        color:
                          emp.status === "active" ? C.success : C.textMuted,
                      },
                    ]}
                  >
                    {emp.status ?? "active"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
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
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: C.textPrimary,
  },
  headerActions: { flexDirection: "row", gap: 8 },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  headerBtnText: { fontSize: 11, fontWeight: "700" },

  scrollContent: { padding: 16, gap: 16 },
  accentBar: { height: 4, width: "100%", borderRadius: 4 },

  titleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  titleIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  titleName: {
    fontSize: 20,
    fontWeight: "800",
    color: C.textPrimary,
    fontFamily: Platform.OS === "ios" ? "Sora" : "sans-serif",
  },
  titleMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  description: { fontSize: 13, color: C.textSecondary, lineHeight: 20 },

  statGrid: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
  },
  statLabel: { fontSize: 10, color: C.textMuted },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
    color: C.textPrimary,
    marginTop: 3,
  },

  headCard: { padding: 14, borderRadius: 16 },
  headCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  headCardTitle: { fontSize: 11, fontWeight: "800" },
  headCardBody: { flexDirection: "row", alignItems: "center", gap: 12 },
  headAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headAvatarText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  headName: { fontSize: 14, fontWeight: "700", color: C.textPrimary },
  headJob: { fontSize: 12, color: C.textSecondary, marginTop: 1 },
  headEmail: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 1,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  membersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  membersTitle: { fontSize: 13, fontWeight: "800", color: C.textPrimary },
  membersHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  memberCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  memberCountPillText: { fontSize: 10, fontWeight: "800" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: C.primaryLight,
  },
  addBtnText: { fontSize: 10, fontWeight: "800", color: C.primary },

  emptyMembers: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 24,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
  },
  emptyText: { fontSize: 12, color: C.textMuted, textAlign: "center" },
  emptyAssignBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: C.primaryLight,
  },
  emptyAssignBtnText: { fontSize: 12, fontWeight: "700", color: C.primary },

  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  memberAvatarText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  memberNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  memberName: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
  memberJob: { fontSize: 10, color: C.textMuted, marginTop: 1 },
  statusPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
  statusPillText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
