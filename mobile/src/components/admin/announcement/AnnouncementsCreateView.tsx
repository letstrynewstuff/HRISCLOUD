// src/components/admin/announcements/AnnouncementsCreateView.tsx
// "Compose New" tab — form + publish/draft.

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Send,
  Save,
  Globe,
  Building2,
  AlertCircle,
  X,
} from "lucide-react-native";

import C from "../../../styles/colors";
import { announcementApi } from "../../../api/service/announcementApi";
import { TYPE_CONFIG, DEPARTMENTS } from "./announcementsShared";

interface Props {
  onClose: () => void;
  onPublished?: () => void;
}

const PRIORITY_LEVELS = [
  { id: "low", label: "Low", color: C.success },
  { id: "medium", label: "Medium", color: C.warning },
  { id: "high", label: "High", color: C.danger },
];

export default function AnnouncementsCreateView({
  onClose,
  onPublished,
}: Props) {
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("general");
  const [audience, setAudience] = useState<"all" | "department">("all");
  const [departments, setDepartments] = useState<string[]>([]);
  const [schedule, setSchedule] = useState<"now" | "scheduled">("now");
  const [scheduleDate, setScheduleDate] = useState(""); // YYYY-MM-DD
  const [scheduleTime, setScheduleTime] = useState("09:00"); // HH:MM
  const [priority, setPriority] = useState("medium");
  const [pinToTop, setPinToTop] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const toggleDept = (d: string) =>
    setDepartments((p) =>
      p.includes(d) ? p.filter((x) => x !== d) : [...p, d],
    );

  const buildPayload = (isDraft: boolean) => {
    let publishAt: string | null = null;
    if (!isDraft && schedule === "scheduled" && scheduleDate) {
      publishAt = `${scheduleDate}T${scheduleTime}:00`;
    }
    return {
      title: title.trim(),
      body: `<p>${body.trim()}</p>`,
      audience: audience === "department" ? "department" : "all",
      departmentId: undefined, // TODO: resolve department name -> UUID when a picker/list is wired in
      isPinned: pinToTop,
      publishAt,
      expiresAt: undefined,
    };
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    setType("general");
    setDepartments([]);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError("Please add a title.");
      return;
    }
    if (!body.trim()) {
      setError("Please write the announcement body.");
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      await announcementApi.create(buildPayload(false));
      setPublishing(false);
      setToast(
        schedule === "now"
          ? "Announcement published!"
          : "Announcement scheduled!",
      );
      resetForm();
      setTimeout(() => onPublished?.(), 600);
    } catch (err: any) {
      setPublishing(false);
      setError(
        err?.response?.data?.message ?? "Failed to publish. Please try again.",
      );
    }
  };

  const handleDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 100);
      await announcementApi.create({
        ...buildPayload(true),
        publishAt: future.toISOString(),
      });
      setSaving(false);
      setToast("Draft saved");
      setTimeout(() => setToast(null), 2000);
    } catch (err: any) {
      setSaving(false);
      setError(err?.response?.data?.message ?? "Failed to save draft.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.headerBack}>
          <ChevronLeft size={20} color={C.textSecondary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Compose New</Text>
          <Text style={styles.headerSubtitle}>
            Broadcast a message to employees
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color={C.danger} />
            <Text style={styles.errorBannerText}>{error}</Text>
            <Pressable onPress={() => setError(null)}>
              <X size={14} color={C.danger} />
            </Pressable>
          </View>
        )}

        {/* Type */}
        <Text style={styles.sectionLabel}>Announcement Type</Text>
        <View style={styles.typeGrid}>
          {Object.entries(TYPE_CONFIG).map(([id, cfg]) => {
            const active = type === id;
            return (
              <Pressable
                key={id}
                onPress={() => setType(id)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: active ? cfg.bg : C.surfaceAlt,
                    borderColor: active ? cfg.color : C.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 16 }}>{cfg.icon}</Text>
                <Text
                  style={[
                    styles.typeChipText,
                    { color: active ? cfg.color : C.textSecondary },
                  ]}
                >
                  {cfg.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Title */}
        <Text style={styles.sectionLabel}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Write a clear, descriptive title…"
          placeholderTextColor={C.textMuted}
          style={styles.input}
        />
        <Text style={styles.counter}>{title.length}/255</Text>

        {/* Body */}
        <Text style={styles.sectionLabel}>Message Body *</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Write your announcement here. Be clear, concise, and actionable…"
          placeholderTextColor={C.textMuted}
          style={[styles.input, styles.textarea]}
          multiline
          textAlignVertical="top"
        />

        {/* Audience */}
        <Text style={styles.sectionLabel}>Target Audience</Text>
        <View style={{ gap: 8, marginBottom: 4 }}>
          {[
            { val: "all" as const, label: "All Employees", icon: Globe },
            {
              val: "department" as const,
              label: "Specific Departments",
              icon: Building2,
            },
          ].map((opt) => (
            <Pressable
              key={opt.val}
              onPress={() => setAudience(opt.val)}
              style={[
                styles.optionRow,
                audience === opt.val && styles.optionRowActive,
              ]}
            >
              <opt.icon
                size={15}
                color={audience === opt.val ? C.primary : C.textMuted}
              />
              <Text
                style={[
                  styles.optionLabel,
                  audience === opt.val && { color: C.primary },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {audience === "department" && (
          <View style={styles.chipWrap}>
            {DEPARTMENTS.map((d) => {
              const active = departments.includes(d);
              return (
                <Pressable
                  key={d}
                  onPress={() => toggleDept(d)}
                  style={[styles.deptChip, active && styles.deptChipActive]}
                >
                  <Text
                    style={[styles.deptChipText, active && { color: "#fff" }]}
                  >
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Schedule */}
        <Text style={styles.sectionLabel}>Publish Time</Text>
        <View style={{ gap: 8 }}>
          {[
            { val: "now" as const, label: "Publish Immediately" },
            { val: "scheduled" as const, label: "Schedule for Later" },
          ].map((opt) => (
            <Pressable
              key={opt.val}
              onPress={() => setSchedule(opt.val)}
              style={[
                styles.optionRow,
                schedule === opt.val && styles.optionRowActive,
              ]}
            >
              <Text
                style={[
                  styles.optionLabel,
                  schedule === opt.val && { color: C.primary },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {schedule === "scheduled" && (
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <TextInput
              value={scheduleDate}
              onChangeText={setScheduleDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.textMuted}
              style={[styles.input, { flex: 1 }]}
            />
            <TextInput
              value={scheduleTime}
              onChangeText={setScheduleTime}
              placeholder="HH:MM"
              placeholderTextColor={C.textMuted}
              style={[styles.input, { flex: 1 }]}
            />
          </View>
        )}

        {/* Priority */}
        <Text style={styles.sectionLabel}>Priority Level</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {PRIORITY_LEVELS.map((p) => {
            const active = priority === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPriority(p.id)}
                style={[
                  styles.priorityChip,
                  {
                    borderColor: active ? p.color : C.border,
                    backgroundColor: active ? p.color + "18" : C.surfaceAlt,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityChipText,
                    { color: active ? p.color : C.textSecondary },
                  ]}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Pin */}
        <View style={styles.pinRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionLabel}>Pin to Top</Text>
            <Text style={styles.pinSub}>Show above other announcements</Text>
          </View>
          <Switch
            value={pinToTop}
            onValueChange={setPinToTop}
            trackColor={{ true: C.primary, false: C.border }}
            thumbColor="#fff"
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={handleDraft}
          disabled={saving}
          style={styles.draftBtn}
        >
          {saving ? (
            <ActivityIndicator size="small" color={C.textSecondary} />
          ) : (
            <>
              <Save size={14} color={C.textSecondary} />
              <Text style={styles.draftBtnText}>Save Draft</Text>
            </>
          )}
        </Pressable>
        <Pressable
          onPress={handlePublish}
          disabled={publishing}
          style={styles.publishBtn}
        >
          {publishing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Send size={14} color="#fff" />
              <Text style={styles.publishBtnText}>
                {schedule === "now" ? "Publish" : "Schedule"}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
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
  headerTitle: { fontSize: 17, fontWeight: "800", color: C.textPrimary },
  headerSubtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  scrollContent: { padding: 16, paddingBottom: 8 },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.dangerLight,
    borderWidth: 1,
    borderColor: C.danger + "33",
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: C.danger,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 18,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textPrimary,
    backgroundColor: C.surface,
  },
  textarea: { minHeight: 130 },
  counter: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: "right",
    marginTop: 4,
  },

  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeChipText: { fontSize: 12, fontWeight: "700" },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  optionRowActive: { backgroundColor: C.primaryLight, borderColor: C.primary },
  optionLabel: { fontSize: 13, fontWeight: "700", color: C.textPrimary },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  deptChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  deptChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  deptChipText: { fontSize: 11, fontWeight: "700", color: C.textSecondary },

  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  priorityChipText: { fontSize: 12, fontWeight: "800" },

  pinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  pinSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  draftBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
  },
  draftBtnText: { fontSize: 13, fontWeight: "700", color: C.textSecondary },
  publishBtn: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: C.primary,
  },
  publishBtnText: { fontSize: 13, fontWeight: "800", color: "#fff" },

  toast: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.navy,
  },
  toastText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
});
