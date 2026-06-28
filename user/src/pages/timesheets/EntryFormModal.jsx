// src/components/timesheets/EntryFormModal.jsx
import { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { X, Clock, FileText, Tag, Zap } from "lucide-react";
import { C } from "../../admin/employeemanagement/sharedData";

function calcDuration(start, end) {
  if (!start || !end) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
}

function timeOptions() {
  const opts = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      opts.push(`${hh}:${mm}`);
    }
  }
  return opts;
}

const TIME_OPTIONS = timeOptions();

const FIELD = {
  background: "transparent",
  border: `1.5px solid ${C.border}`,
  color: C.textPrimary,
  borderRadius: 12,
  fontFamily: "DM Sans, sans-serif",
  fontSize: 14,
  outline: "none",
  width: "100%",
};

export default function EntryFormModal({
  open,
  entry,
  defaultDate,
  onSave,
  onClose,
  loading,
}) {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    entryDate: defaultDate ?? today,
    startTime: "09:00",
    endTime: "10:00",
    description: "",
    projectTag: "",
  });

  useEffect(() => {
    if (open) {
      if (entry) {
        setForm({
          entryDate: entry.entryDate ?? today,
          startTime: (entry.startTime ?? "09:00").slice(0, 5),
          endTime: (entry.endTime ?? "10:00").slice(0, 5),
          description: entry.description ?? "",
          projectTag: entry.projectTag ?? "",
        });
      } else {
        setForm({
          entryDate: defaultDate ?? today,
          startTime: "09:00",
          endTime: "10:00",
          description: "",
          projectTag: "",
        });
      }
    }
  }, [open, entry, defaultDate]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const duration = calcDuration(form.startTime, form.endTime);
  const descLen = form.description.length;
  const canSave =
    form.entryDate &&
    form.startTime &&
    form.endTime &&
    duration &&
    form.description.trim().length >= 3;

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <Motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: C.surface }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${C.border}` }}
            >
              <div>
                <h2
                  className="font-bold text-lg"
                  style={{
                    color: C.textPrimary,
                    fontFamily: "Sora,sans-serif",
                  }}
                >
                  {entry ? "Edit Entry" : "Log Work"}
                </h2>
                <p className="text-xs" style={{ color: C.textMuted }}>
                  {entry
                    ? "Update this timesheet entry"
                    : "Add what you worked on today"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: C.surfaceAlt ?? "#F3F4F6" }}
              >
                <X size={15} color={C.textSecondary} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Date */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: C.textSecondary }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={form.entryDate}
                  onChange={(e) => set("entryDate", e.target.value)}
                  style={{ ...FIELD, padding: "10px 14px" }}
                />
              </div>

              {/* Time row */}
              <div className="grid grid-cols-2 gap-3">
                {["startTime", "endTime"].map((k) => (
                  <div key={k}>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: C.textSecondary }}
                    >
                      <Clock size={11} className="inline mr-1" />
                      {k === "startTime" ? "Start time" : "End time"}
                    </label>
                    <select
                      value={form[k]}
                      onChange={(e) => set(k, e.target.value)}
                      style={{
                        ...FIELD,
                        padding: "10px 14px",
                        cursor: "pointer",
                      }}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Duration pill */}
              <div
                className="rounded-xl px-4 py-2.5 flex items-center gap-2"
                style={{
                  background: duration ? "#EEF2FF" : "#F9FAFB",
                  border: `1px solid ${duration ? "#C7D2FE" : C.border}`,
                }}
              >
                <Zap size={14} color={duration ? C.primary : C.textMuted} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: duration ? C.primary : C.textMuted }}
                >
                  {duration
                    ? `Duration: ${duration}`
                    : "End time must be after start time"}
                </span>
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: C.textSecondary }}
                >
                  <FileText size={11} className="inline mr-1" />
                  What did you work on?{" "}
                  <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="e.g. Updated login module code, fixed payment bug, attended client meeting..."
                  style={{
                    ...FIELD,
                    padding: "12px 14px",
                    resize: "none",
                    lineHeight: 1.6,
                    border: `1.5px solid ${form.description.length >= 3 ? C.primary : C.border}`,
                  }}
                />
                <div className="flex justify-between mt-1">
                  {form.description.trim().length < 3 &&
                    form.description.length > 0 && (
                      <span className="text-xs" style={{ color: "#DC2626" }}>
                        At least 3 characters required
                      </span>
                    )}
                  <span
                    className="text-xs ml-auto"
                    style={{ color: descLen > 500 ? "#F59E0B" : C.textMuted }}
                  >
                    {descLen} chars
                  </span>
                </div>
              </div>

              {/* Project tag */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: C.textSecondary }}
                >
                  <Tag size={11} className="inline mr-1" />
                  Project / Tag{" "}
                  <span style={{ color: C.textMuted }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.projectTag}
                  onChange={(e) => set("projectTag", e.target.value)}
                  placeholder="e.g. Website Redesign"
                  style={{ ...FIELD, padding: "10px 14px" }}
                />
              </div>
            </div>

            {/* Footer actions */}
            <div
              className="px-6 py-4 flex flex-col sm:flex-row gap-3"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <button
                onClick={() => onSave(form, "draft")}
                disabled={!canSave || loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background:
                    canSave && !loading
                      ? (C.surfaceAlt ?? "#EEF2FF")
                      : "#F3F4F6",
                  color: canSave && !loading ? C.primary : C.textMuted,
                  border: `1.5px solid ${canSave && !loading ? C.primary : C.border}`,
                  cursor: canSave && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                {loading === "draft" ? "Saving…" : "Save as Draft"}
              </button>
              <button
                onClick={() => onSave(form, "submit")}
                disabled={!canSave || loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{
                  background: canSave && !loading ? C.primary : "#F3F4F6",
                  color: canSave && !loading ? "#fff" : C.textMuted,
                  cursor: canSave && !loading ? "pointer" : "not-allowed",
                  boxShadow:
                    canSave && !loading
                      ? "0 2px 8px rgba(79,70,229,0.3)"
                      : "none",
                  transition: "all 0.2s",
                }}
              >
                {loading === "submit" ? "Submitting…" : "Save & Submit"}
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
