// src/components/timesheets/EntryFormModal.tsx
// Add / edit a timesheet entry. Time inputs are simple text fields
// (HH:mm, 24h) to avoid pulling in a native picker dependency — swap for
// @react-native-community/datetimepicker later if you want a wheel picker.

import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  X,
  Calendar,
  Clock,
  Tag,
  FileText,
  Save,
  Send,
} from "lucide-react-native";
import C from "../../styles/colors";
import { TimesheetEntry } from "./EntryCard";

type FormValues = {
  entryDate: string;
  startTime: string;
  endTime: string;
  description: string;
  projectTag: string;
};

type SaveMode = "draft" | "submit";

type EntryFormModalProps = {
  open: boolean;
  entry?: TimesheetEntry | null;
  defaultDate: string;
  onSave: (form: FormValues, mode: SaveMode) => void;
  onClose: () => void;
  loading?: SaveMode | false;
};

const emptyForm = (defaultDate: string): FormValues => ({
  entryDate: defaultDate,
  startTime: "09:00",
  endTime: "17:00",
  description: "",
  projectTag: "",
});

export default function EntryFormModal({
  open,
  entry,
  defaultDate,
  onSave,
  onClose,
  loading,
}: EntryFormModalProps) {
  const [form, setForm] = useState<FormValues>(emptyForm(defaultDate));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (entry) {
      setForm({
        entryDate: entry.entryDate,
        startTime: entry.startTime,
        endTime: entry.endTime,
        description: entry.description ?? "",
        projectTag: entry.projectTag ?? "",
      });
    } else {
      setForm(emptyForm(defaultDate));
    }
    setError("");
  }, [open, entry, defaultDate]);

  const set = (k: keyof FormValues, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const timeRe = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRe.test(form.startTime) || !timeRe.test(form.endTime)) {
      setError("Use 24h time format, e.g. 09:00");
      return false;
    }
    if (form.startTime >= form.endTime) {
      setError("End time must be after start time.");
      return false;
    }
    if (!form.description.trim()) {
      setError("Add a short description of the work.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSave = (mode: SaveMode) => {
    if (!validate()) return;
    onSave(form, mode);
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>
              {entry ? "Edit Entry" : "New Entry"}
            </Text>
            <Pressable hitSlop={8} onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={C.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Date */}
            <Field
              label="Date"
              icon={<Calendar size={13} color={C.textMuted} />}
            >
              <TextInput
                value={form.entryDate}
                onChangeText={(v) => set("entryDate", v)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.textMuted}
                style={styles.input}
              />
            </Field>

            {/* Time range */}
            <View style={styles.timeRow}>
              <Field
                label="Start time"
                icon={<Clock size={13} color={C.textMuted} />}
                style={{ flex: 1 }}
              >
                <TextInput
                  value={form.startTime}
                  onChangeText={(v) => set("startTime", v)}
                  placeholder="09:00"
                  placeholderTextColor={C.textMuted}
                  keyboardType="numbers-and-punctuation"
                  style={styles.input}
                />
              </Field>
              <Field
                label="End time"
                icon={<Clock size={13} color={C.textMuted} />}
                style={{ flex: 1 }}
              >
                <TextInput
                  value={form.endTime}
                  onChangeText={(v) => set("endTime", v)}
                  placeholder="17:00"
                  placeholderTextColor={C.textMuted}
                  keyboardType="numbers-and-punctuation"
                  style={styles.input}
                />
              </Field>
            </View>

            {/* Description */}
            <Field
              label="Description"
              icon={<FileText size={13} color={C.textMuted} />}
            >
              <TextInput
                value={form.description}
                onChangeText={(v) => set("description", v)}
                placeholder="What did you work on?"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />
            </Field>

            {/* Project tag */}
            <Field
              label="Project tag (optional)"
              icon={<Tag size={13} color={C.textMuted} />}
            >
              <TextInput
                value={form.projectTag}
                onChangeText={(v) => set("projectTag", v)}
                placeholder="e.g. Mobile App"
                placeholderTextColor={C.textMuted}
                style={styles.input}
              />
            </Field>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              onPress={() => handleSave("draft")}
              disabled={!!loading}
              style={({ pressed }) => [
                styles.draftBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Save size={14} color={C.primary} />
              <Text style={styles.draftLabel}>
                {loading === "draft" ? "Saving…" : "Save Draft"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleSave("submit")}
              disabled={!!loading}
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Send size={14} color="#fff" />
              <Text style={styles.submitLabel}>
                {loading === "submit" ? "Submitting…" : "Save & Submit"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  icon,
  children,
  style,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.field, style]}>
      <View style={styles.fieldLabelRow}>
        {icon}
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    maxHeight: "86%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: C.textPrimary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: C.textPrimary,
  },
  textArea: {
    minHeight: 76,
    textAlignVertical: "top",
  },
  timeRow: {
    flexDirection: "row",
    gap: 10,
  },
  errorText: {
    fontSize: 12.5,
    color: C.danger,
    fontWeight: "600",
    marginTop: -4,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  draftBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
  },
  draftLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: C.primary,
  },
  submitBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  submitLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#fff",
  },
});
