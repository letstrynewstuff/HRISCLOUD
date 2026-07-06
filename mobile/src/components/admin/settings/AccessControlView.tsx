// src/components/admin/settings/AccessControlView.tsx
// Roles & permissions management. Each role expands to show a permission
// checklist across HRIS modules (Employees, Payroll, Leave, Reports).

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Users,
  Check,
  AlertCircle,
} from "lucide-react-native";
import { useTheme } from "../../ThemeContext";
import {
  getRoles,
  updateRolePermissions,
  getTeamMembers,
} from "../../../api/service/settingsApi";
import SettingsHeader from "./SettingsHeader";
import { Loader } from "../../../hooks/loaderManager";

// Modules × actions checklist shown per role. Adjust to match your actual
// permission model — this is a reasonable default HRIS permission set.
const MODULES = [
  { key: "employees", label: "Employees" },
  { key: "payroll", label: "Payroll" },
  { key: "leave", label: "Leave" },
  { key: "reports", label: "Reports" },
];
const ACTIONS = [
  { key: "view", label: "View" },
  { key: "edit", label: "Edit" },
  { key: "approve", label: "Approve" },
];

// Fallback roles shown before the API responds, or if it fails — keeps the
// screen usable/demo-able without a live backend.
const FALLBACK_ROLES = [
  {
    id: "owner",
    name: "Owner",
    memberCount: 1,
    editable: false,
    permissions: {},
  },
  {
    id: "hr-admin",
    name: "HR Admin",
    memberCount: 2,
    editable: true,
    permissions: {},
  },
  {
    id: "manager",
    name: "Manager",
    memberCount: 5,
    editable: true,
    permissions: {},
  },
  {
    id: "employee",
    name: "Employee",
    memberCount: 48,
    editable: true,
    permissions: {},
  },
];

type Props = { onClose: () => void };

export default function AccessControlView({ onClose }: Props) {
  const { colors: C } = useTheme();
  const [roles, setRoles] = useState<any[]>(FALLBACK_ROLES);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [rolesRes, membersRes]: any = await Promise.all([
//         getRoles(),
//         getTeamMembers().catch(() => null),
//       ]);
//       const list = rolesRes.data ?? rolesRes ?? [];
//       const members = membersRes?.data ?? membersRes ?? [];
//       const withCounts = (list.length ? list : FALLBACK_ROLES).map(
//         (r: any) => ({
//           ...r,
//           memberCount:
//             r.memberCount ??
//             members.filter((m: any) => m.roleId === r.id || m.role === r.name)
//               .length,
//           permissions: r.permissions ?? {},
//         }),
//       );
//       setRoles(withCounts);
//     } catch (e: any) {
//       setError(
//         e?.response?.data?.message ?? "Couldn't load roles — showing defaults.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);
const load = useCallback(async () => {
  setLoading(true);
  setError(null);
  Loader.show();
  try {
    const [rolesRes, membersRes]: any = await Promise.all([
      getRoles(),
      getTeamMembers().catch(() => null),
    ]);
    const list = rolesRes.data ?? rolesRes ?? [];
    const members = membersRes?.data ?? membersRes ?? [];
    const withCounts = (list.length ? list : FALLBACK_ROLES).map((r: any) => ({
      ...r,
      memberCount:
        r.memberCount ??
        members.filter((m: any) => m.roleId === r.id || m.role === r.name)
          .length,
      permissions: r.permissions ?? {},
    }));
    setRoles(withCounts);
  } catch (e: any) {
    setError(
      e?.response?.data?.message ?? "Couldn't load roles — showing defaults.",
    );
  } finally {
    setLoading(false);
    Loader.hide();
  }
}, []);
  useEffect(() => {
    load();
  }, [load]);

  const togglePermission = (
    roleId: string,
    moduleKey: string,
    actionKey: string,
  ) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        const current: string[] = r.permissions?.[moduleKey] ?? [];
        const has = current.includes(actionKey);
        const next = has
          ? current.filter((a) => a !== actionKey)
          : [...current, actionKey];
        return { ...r, permissions: { ...r.permissions, [moduleKey]: next } };
      }),
    );
  };

  const handleSaveRole = async (role: any) => {
    setSaving(role.id);
    try {
      await updateRolePermissions(role.id, role.permissions);
      Alert.alert("Saved", `Permissions updated for ${role.name}.`);
    } catch {
      Alert.alert("Couldn't save", "Please try again.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      <SettingsHeader
        title="Access Control"
        subtitle="Roles and what each one can do"
        onBack={onClose}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View
            style={[styles.errorBanner, { backgroundColor: C.dangerLight }]}
          >
            <AlertCircle size={14} color={C.danger} />
            <Text style={[styles.errorText, { color: C.danger }]}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {roles.map((role) => {
              const isOpen = expanded === role.id;
              return (
                <View
                  key={role.id}
                  style={[
                    styles.roleCard,
                    { backgroundColor: C.surface, borderColor: C.border },
                  ]}
                >
                  <Pressable
                    onPress={() => setExpanded(isOpen ? null : role.id)}
                    style={styles.roleHeader}
                  >
                    <View
                      style={[
                        styles.roleIcon,
                        { backgroundColor: C.primaryLight },
                      ]}
                    >
                      <ShieldCheck size={16} color={C.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.roleName, { color: C.textPrimary }]}>
                        {role.name}
                      </Text>
                      <View style={styles.memberRow}>
                        <Users size={11} color={C.textMuted} />
                        <Text
                          style={[styles.memberCount, { color: C.textMuted }]}
                        >
                          {role.memberCount} member
                          {role.memberCount === 1 ? "" : "s"}
                        </Text>
                      </View>
                    </View>
                    {isOpen ? (
                      <ChevronUp size={18} color={C.textMuted} />
                    ) : (
                      <ChevronDown size={18} color={C.textMuted} />
                    )}
                  </Pressable>

                  {isOpen && (
                    <View
                      style={[styles.permBlock, { borderTopColor: C.border }]}
                    >
                      {!role.editable && (
                        <Text
                          style={[styles.readonlyNote, { color: C.textMuted }]}
                        >
                          This role has full access by default and can't be
                          edited.
                        </Text>
                      )}
                      {MODULES.map((mod) => (
                        <View key={mod.key} style={styles.moduleRow}>
                          <Text
                            style={[
                              styles.moduleLabel,
                              { color: C.textPrimary },
                            ]}
                          >
                            {mod.label}
                          </Text>
                          <View style={styles.actionsRow}>
                            {ACTIONS.map((action) => {
                              const has = (
                                role.permissions?.[mod.key] ?? []
                              ).includes(action.key);
                              return (
                                <Pressable
                                  key={action.key}
                                  disabled={!role.editable}
                                  onPress={() =>
                                    togglePermission(
                                      role.id,
                                      mod.key,
                                      action.key,
                                    )
                                  }
                                  style={[
                                    styles.actionChip,
                                    {
                                      backgroundColor: has
                                        ? C.primary
                                        : C.surfaceAlt,
                                      borderColor: has ? C.primary : C.border,
                                      opacity: role.editable ? 1 : 0.6,
                                    },
                                  ]}
                                >
                                  {has ? (
                                    <Check size={10} color="#fff" />
                                  ) : null}
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "700",
                                      color: has ? "#fff" : C.textSecondary,
                                    }}
                                  >
                                    {action.label}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      ))}

                      {role.editable && (
                        <Pressable
                          onPress={() => handleSaveRole(role)}
                          disabled={saving === role.id}
                          style={[
                            styles.saveRoleBtn,
                            {
                              backgroundColor: C.primary,
                              opacity: saving === role.id ? 0.7 : 1,
                            },
                          ]}
                        >
                          {saving === role.id ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={styles.saveRoleBtnText}>
                              Save {role.name} Permissions
                            </Text>
                          )}
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { paddingVertical: 40, alignItems: "center" },
  scrollContent: { padding: 16 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 12 },
  roleCard: { borderWidth: 1, borderRadius: 18, overflow: "hidden" },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  roleName: { fontSize: 14, fontWeight: "800" },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  memberCount: { fontSize: 11 },
  permBlock: { borderTopWidth: 1, padding: 14, gap: 12 },
  readonlyNote: { fontSize: 11, fontStyle: "italic", marginBottom: 2 },
  moduleRow: { gap: 8 },
  moduleLabel: { fontSize: 12, fontWeight: "700" },
  actionsRow: { flexDirection: "row", gap: 8 },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  saveRoleBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveRoleBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
