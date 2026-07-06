// src/components/admin/department/DepartmentListItem.tsx
// A single department row — mobile equivalent of the web DeptCard.

import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import {
  Building2,
  MoreVertical,
  Eye,
  Edit2,
  UserPlus,
  Trash2,
  Crown,
  UserCircle2,
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
  dept: any;
  index: number;
  deptEmployees: any[];
  headEmployee: any | null;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
}

export default function DepartmentListItem({
  dept,
  index,
  deptEmployees,
  headEmployee,
  onView,
  onEdit,
  onDelete,
  onAssign,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pal = getPalette(dept, index);
  const MAX_SHOWN = 4;
  const shown = deptEmployees.slice(0, MAX_SHOWN);
  const overflow = deptEmployees.length - MAX_SHOWN;

  const menuItems = [
    { label: "View", icon: Eye, action: onView, color: C.primary },
    { label: "Edit", icon: Edit2, action: onEdit, color: C.accent },
    {
      label: "Assign Members",
      icon: UserPlus,
      action: onAssign,
      color: C.success,
    },
    { label: "Delete", icon: Trash2, action: onDelete, color: C.danger },
  ];

  return (
    <Pressable onPress={onView} style={s.card}>
      <View style={[s.accentBar, { backgroundColor: pal.color }]} />
      <View style={s.body}>
        <View style={s.topRow}>
          <View style={[s.iconWrap, { backgroundColor: pal.bg }]}>
            <Building2 size={18} color={pal.color} />
          </View>

          <View style={{ position: "relative" }}>
            <Pressable
              onPress={() => setMenuOpen((p) => !p)}
              hitSlop={8}
              style={s.moreBtn}
            >
              <MoreVertical size={16} color={C.textMuted} />
            </Pressable>
            {menuOpen && (
              <View style={s.menu}>
                {menuItems.map(({ label, icon: Icon, action, color }) => (
                  <Pressable
                    key={label}
                    onPress={() => {
                      setMenuOpen(false);
                      action();
                    }}
                    style={s.menuItem}
                  >
                    <Icon size={13} color={color} />
                    <Text style={[s.menuItemText, { color }]}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        <Text style={s.name}>{dept.name}</Text>
        <Text style={s.desc} numberOfLines={2}>
          {dept.description || "No description provided."}
        </Text>

        {/* Head */}
        <View style={[s.headRow, { backgroundColor: pal.bg + "66" }]}>
          {headEmployee ? (
            <View style={{ position: "relative" }}>
              <View
                style={[
                  s.headAvatar,
                  { backgroundColor: pal.color, borderColor: pal.color },
                ]}
              >
                <Text style={s.headAvatarText}>
                  {empInitials(headEmployee)}
                </Text>
              </View>
              <Crown size={9} color="#F59E0B" style={s.crown} />
            </View>
          ) : (
            <View style={s.headAvatarEmpty}>
              <UserCircle2 size={16} color={C.textMuted} />
            </View>
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.headName} numberOfLines={1}>
              {headEmployee
                ? empFullName(headEmployee)
                : (dept.head_name ?? "No head assigned")}
            </Text>
            <Text style={s.headMeta} numberOfLines={1}>
              {headEmployee?.job_title ?? "Department Head"}
            </Text>
          </View>
        </View>

        {/* Members */}
        {deptEmployees.length > 0 ? (
          <View style={s.avatarsRow}>
            <View style={{ flexDirection: "row" }}>
              {shown.map((emp, idx) => (
                <View
                  key={emp.id}
                  style={[
                    s.memberAvatar,
                    {
                      backgroundColor: pal.color,
                      marginLeft: idx > 0 ? -8 : 0,
                      zIndex: shown.length - idx,
                    },
                  ]}
                >
                  <Text style={s.memberAvatarText}>{empInitials(emp)}</Text>
                </View>
              ))}
              {overflow > 0 && (
                <View
                  style={[s.memberAvatar, s.memberOverflow, { marginLeft: -8 }]}
                >
                  <Text style={s.memberOverflowText}>+{overflow}</Text>
                </View>
              )}
            </View>
            <Text style={s.memberCountText}>
              {deptEmployees.length} member
              {deptEmployees.length !== 1 ? "s" : ""}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onAssign}
            style={[s.addMembersBtn, { backgroundColor: pal.bg }]}
          >
            <UserPlus size={12} color={pal.color} />
            <Text style={[s.addMembersText, { color: pal.color }]}>
              Add members
            </Text>
          </Pressable>
        )}

        <View style={s.footerRow}>
          <View style={s.footerLeft}>
            <View style={[s.footerIconWrap, { backgroundColor: pal.bg }]}>
              <Users size={12} color={pal.color} />
            </View>
            <Text style={[s.footerCount, { color: pal.color }]}>
              {deptEmployees.length}
            </Text>
            <Text style={s.footerLabel}>employees</Text>
          </View>
          <View style={[s.datePill, { backgroundColor: pal.bg }]}>
            <Text style={[s.datePillText, { color: pal.color }]}>
              {deptFmtDate(dept.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  accentBar: { height: 4, width: "100%" },
  body: { padding: 14, gap: 8 },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  moreBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  menu: {
    position: "absolute",
    right: 0,
    top: 34,
    width: 170,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 6,
    zIndex: 40,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  menuItemText: { fontSize: 12, fontWeight: "700" },

  name: { fontSize: 15, fontWeight: "800", color: C.textPrimary, marginTop: 2 },
  desc: { fontSize: 12, color: C.textMuted, lineHeight: 17 },

  headRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 14,
  },
  headAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  headAvatarText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  headAvatarEmpty: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.border,
  },
  crown: { position: "absolute", top: -4, right: -4 },
  headName: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
  headMeta: { fontSize: 10, color: C.textMuted, marginTop: 1 },

  avatarsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  memberAvatarText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  memberOverflow: { backgroundColor: C.surfaceAlt },
  memberOverflowText: { color: C.textMuted, fontSize: 10, fontWeight: "800" },
  memberCountText: { fontSize: 11, color: C.textMuted },

  addMembersBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 2,
  },
  addMembersText: { fontSize: 11, fontWeight: "700" },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  footerCount: { fontSize: 13, fontWeight: "800" },
  footerLabel: { fontSize: 11, color: C.textMuted },
  datePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  datePillText: { fontSize: 10, fontWeight: "700" },
});
