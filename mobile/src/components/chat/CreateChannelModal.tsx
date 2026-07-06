// src/components/chat/CreateChannelModal.tsx
// Manager-only modal for creating a group channel.
// Shows only employees from the manager's own department/team.

import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { X, Hash, Search, Check } from "lucide-react-native";
import C from "../../styles/colors";
import ChatAvatar from "./ChatAvatar";

export type TeamEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  jobRoleName?: string;
  departmentName?: string;
};

type CreateChannelModalProps = {
  open: boolean;
  teamEmployees: TeamEmployee[];
  onClose: () => void;
  onSave: (payload: {
    name: string;
    description: string;
    memberIds: string[];
  }) => void;
  saving?: boolean;
};

export default function CreateChannelModal({
  open,
  teamEmployees,
  onClose,
  onSave,
  saving,
}: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const toggle = (id: string) =>
    setMembers((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  const filtered = teamEmployees.filter((e) => {
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    const role = (e.jobRoleName ?? "").toLowerCase();
    return (
      !search ||
      fullName.includes(search.toLowerCase()) ||
      role.includes(search.toLowerCase())
    );
  });

  const handleCreate = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: desc.trim(), memberIds: members });
  };

  const reset = () => {
    setName("");
    setDesc("");
    setMembers([]);
    setSearch("");
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.overlay}
        onPress={() => {
          onClose();
          reset();
        }}
      >
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Hash size={16} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Create Team Channel</Text>
              <Text style={styles.headerSub}>
                Visible only to added members
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => {
                onClose();
                reset();
              }}
            >
              <X size={16} color={C.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Channel Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. product-design, engineering"
                placeholderTextColor={C.textMuted}
                style={styles.input}
              />
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                value={desc}
                onChangeText={setDesc}
                placeholder="What is this channel for?"
                placeholderTextColor={C.textMuted}
                style={styles.input}
              />
            </View>

            {/* Members */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                Add Members ({members.length} selected)
              </Text>
              <View style={styles.searchRow}>
                <Search size={13} color={C.textMuted} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search team members…"
                  placeholderTextColor={C.textMuted}
                  style={styles.searchInput}
                />
              </View>

              <View style={styles.memberList}>
                {filtered.length === 0 ? (
                  <Text style={styles.emptyText}>No team members found</Text>
                ) : (
                  filtered.map((e) => {
                    const fullName = `${e.firstName} ${e.lastName}`;
                    const sel = members.includes(e.id);
                    return (
                      <Pressable
                        key={e.id}
                        onPress={() => toggle(e.id)}
                        style={[
                          styles.memberRow,
                          sel && styles.memberRowSelected,
                        ]}
                      >
                        <ChatAvatar name={fullName} size={30} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.memberName}>{fullName}</Text>
                          <Text style={styles.memberRole}>
                            {e.jobRoleName ?? "Employee"}
                          </Text>
                        </View>
                        {sel && <Check size={15} color={C.primary} />}
                      </Pressable>
                    );
                  })
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                onClose();
                reset();
              }}
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleCreate}
              disabled={!name.trim() || !!saving}
              style={({ pressed }) => [
                styles.createBtn,
                (!name.trim() || saving) && { opacity: 0.55 },
                pressed && name.trim() && !saving && { opacity: 0.85 },
              ]}
            >
              {saving ? <ActivityIndicator size={13} color="#fff" /> : null}
              <Text style={styles.createLabel}>
                {saving ? "Creating…" : "Create Channel"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  sheet: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "86%",
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.primaryLight,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textPrimary,
  },
  headerSub: {
    fontSize: 10.5,
    color: C.textMuted,
    marginTop: 1,
  },
  body: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 7,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 13.5,
    color: C.textPrimary,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.textPrimary,
  },
  memberList: {
    gap: 6,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  memberRowSelected: {
    backgroundColor: C.primaryLight,
    borderColor: C.primary,
  },
  memberName: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.textPrimary,
  },
  memberRole: {
    fontSize: 10.5,
    color: C.textMuted,
    marginTop: 1,
  },
  emptyText: {
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
    paddingVertical: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.textSecondary,
  },
  createBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  createLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#fff",
  },
});
