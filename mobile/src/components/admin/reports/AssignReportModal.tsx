// src/components/admin/reports/AssignReportModal.tsx

import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { UserCheck, X, Check } from "lucide-react-native";
import C from "../../../styles/colors";
import { companyApi } from "../../../api/service/companyApi";
import { getInitials, ReportAvatar } from "./reportShared";

import { Loader } from "../../../hooks/loaderManager";


interface Props {
  visible: boolean;
  currentAssignedId?: string | null;
  saving?: boolean;
  onSave: (assignedTo: string | null) => void;
  onClose: () => void;
}

export default function AssignReportModal({
  visible,
  currentAssignedId,
  saving,
  onSave,
  onClose,
}: Props) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(
    currentAssignedId ?? null,
  );

//   useEffect(() => {
//     if (!visible) return;
//     setSelected(currentAssignedId ?? null);
//     setLoading(true);
//     companyApi
//       .listAdmins()
//       .then((res) => setAdmins(res?.data ?? res ?? []))
//       .catch(() => setAdmins([]))
//       .finally(() => setLoading(false));
//   }, [visible, currentAssignedId]);
useEffect(() => {
  if (!visible) return;
  setSelected(currentAssignedId ?? null);
  setLoading(true);
  Loader.show();
  companyApi
    .listAdmins()
    .then((res) => setAdmins(res?.data ?? res ?? []))
    .catch(() => setAdmins([]))
    .finally(() => {
      setLoading(false);
      Loader.hide();
    });
}, [visible, currentAssignedId]);
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <View style={s.iconWrap}>
              <UserCheck size={16} color={C.primary} />
            </View>
            <Text style={s.title}>Assign Report</Text>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <X size={13} color={C.textSecondary} />
            </Pressable>
          </View>

          {loading ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator size="small" color={C.primary} />
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: 320 }}
              showsVerticalScrollIndicator={false}
            >
              <Pressable
                onPress={() => setSelected(null)}
                style={[s.row, !selected && s.rowActive]}
              >
                <ReportAvatar initials="—" color={C.textMuted} size={32} />
                <Text style={s.rowText}>Unassigned</Text>
                {!selected && <Check size={15} color={C.primary} />}
              </Pressable>
              {admins.map((a) => {
                const name =
                  `${a.firstName ?? a.first_name ?? ""} ${a.lastName ?? a.last_name ?? ""}`.trim();
                const active = selected === a.id;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => setSelected(a.id)}
                    style={[s.row, active && s.rowActive]}
                  >
                    <ReportAvatar
                      initials={getInitials(name)}
                      color={C.primary}
                      size={32}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowText}>{name || "HR Admin"}</Text>
                      <Text style={s.rowSub}>{a.email}</Text>
                    </View>
                    {active && <Check size={15} color={C.primary} />}
                  </Pressable>
                );
              })}
              {admins.length === 0 && (
                <Text style={s.emptyText}>No other HR admins found.</Text>
              )}
            </ScrollView>
          )}

          <View style={s.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                s.cancelBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={s.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onSave(selected)}
              disabled={saving}
              style={({ pressed }) => [
                s.saveBtn,
                (saving || pressed) && { opacity: 0.85 },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.saveBtnText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  sheet: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  title: { fontSize: 15, fontWeight: "800", color: C.textPrimary, flex: 1 },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 14,
    marginBottom: 6,
  },
  rowActive: { backgroundColor: C.primaryLight },
  rowText: { fontSize: 12, fontWeight: "700", color: C.textPrimary },
  rowSub: { fontSize: 10, color: C.textMuted, marginTop: 1 },
  emptyText: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
    paddingVertical: 12,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primary,
  },
  saveBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },
});
