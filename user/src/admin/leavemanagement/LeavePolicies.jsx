// src/admin/leavemanagement/LeavePolicies.jsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  X,
  ScrollText,
  Info,
  ChevronRight,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import C from "../../styles/colors";
import { leaveApi } from "../../api/service/leaveApi";

// ── Leave type UI map ─────────────────────────────────────────
const LEAVE_TYPES_UI = [
  { name: "Annual Leave", color: "#4F46E5", light: "#EEF2FF", icon: "☀️" },
  { name: "Sick Leave", color: "#EF4444", light: "#FEE2E2", icon: "🏥" },
  { name: "Maternity Leave", color: "#EC4899", light: "#FDF2F8", icon: "🤱" },
  { name: "Paternity Leave", color: "#06B6D4", light: "#ECFEFF", icon: "👨‍👩‍👧" },
  { name: "Compassionate", color: "#8B5CF6", light: "#EDE9FE", icon: "🕊️" },
  { name: "Study Leave", color: "#10B981", light: "#D1FAE5", icon: "📚" },
  { name: "Unpaid Leave", color: "#F59E0B", light: "#FEF3C7", icon: "⏸️" },
];
const getUI = (lt) =>
  LEAVE_TYPES_UI.find((t) => t.name === lt) ?? LEAVE_TYPES_UI[0];
const getColor = (lt) => getUI(lt).color;
const getLight = (lt) => getUI(lt).light;
const getIcon = (lt) => getUI(lt).icon;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Card({ children, style = {}, className = "" }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Policy Create / Edit Modal ─────────────────────────────────
function PolicyModal({ policy, onSave, onClose, saving }) {
  const isNew = !policy;
  const [form, setForm] = useState(
    policy
      ? {
          name: policy.name ?? "",
          leaveType: policy.leave_type ?? "Annual Leave",
          daysAllowed: policy.days_allowed ?? 20,
          carryOverDays: policy.carry_over_days ?? 0,
          noticeDays: policy.notice_days ?? 0,
          requiresApproval: policy.requires_approval ?? true,
          isPaid: policy.is_paid ?? true,
          requiresDocument: policy.requires_document ?? false,
          applicableTo: policy.applicable_to ?? ["full_time"],
          minDaysPerRequest: policy.min_days_per_request ?? 1,
          maxDaysPerRequest: policy.max_days_per_request ?? 15,
          description: policy.description ?? "",
        }
      : {
          name: "",
          leaveType: "Annual Leave",
          daysAllowed: 20,
          carryOverDays: 0,
          noticeDays: 0,
          requiresApproval: true,
          isPaid: true,
          requiresDocument: false,
          applicableTo: ["full_time"],
          minDaysPerRequest: 1,
          maxDaysPerRequest: 15,
          description: "",
        },
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 pt-5 pb-4 flex items-center gap-3"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: C.primaryLight }}
          >
            <ScrollText size={16} color={C.primary} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: C.textPrimary }}>
              {isNew ? "Create New Policy" : "Edit Policy"}
            </h3>
            <p className="text-[11px]" style={{ color: C.textMuted }}>
              {isNew ? "Define leave entitlements" : form.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-xl flex items-center justify-center"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <X size={13} color={C.textSecondary} />
          </button>
        </div>
        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label
                className="text-[10px] font-semibold mb-1 block"
                style={{ color: C.textSecondary }}
              >
                Policy Name
              </label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                }}
                placeholder="e.g. Annual Leave Policy"
              />
            </div>
            <div>
              <label
                className="text-[10px] font-semibold mb-1 block"
                style={{ color: C.textSecondary }}
              >
                Leave Type
              </label>
              <select
                value={form.leaveType}
                onChange={(e) => set("leaveType", e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              >
                {LEAVE_TYPES_UI.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="text-[10px] font-semibold mb-1 block"
                style={{ color: C.textSecondary }}
              >
                Days Allowed
              </label>
              <input
                type="number"
                value={form.daysAllowed}
                onChange={(e) => set("daysAllowed", +e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <div>
              <label
                className="text-[10px] font-semibold mb-1 block"
                style={{ color: C.textSecondary }}
              >
                Notice Days
              </label>
              <input
                type="number"
                value={form.noticeDays}
                onChange={(e) => set("noticeDays", +e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <div>
              <label
                className="text-[10px] font-semibold mb-1 block"
                style={{ color: C.textSecondary }}
              >
                Carry-Over Days
              </label>
              <input
                type="number"
                value={form.carryOverDays}
                onChange={(e) => set("carryOverDays", +e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <div>
              <label
                className="text-[10px] font-semibold mb-1 block"
                style={{ color: C.textSecondary }}
              >
                Max Days / Request
              </label>
              <input
                type="number"
                value={form.maxDaysPerRequest}
                onChange={(e) => set("maxDaysPerRequest", +e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
          </div>
          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Approval Required", key: "requiresApproval" },
              { label: "Paid Leave", key: "isPaid" },
              { label: "Doc Required", key: "requiresDocument" },
            ].map((t) => (
              <div
                key={t.key}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                }}
              >
                <span
                  className="text-[11px] font-medium"
                  style={{ color: C.textSecondary }}
                >
                  {t.label}
                </span>
                <button
                  onClick={() => set(t.key, !form[t.key])}
                  className="w-9 h-5 rounded-full relative transition-colors"
                  style={{ background: form[t.key] ? C.primary : C.border }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: form[t.key] ? "calc(100% - 18px)" : "2px" }}
                  />
                </button>
              </div>
            ))}
          </div>
          <div>
            <label
              className="text-[10px] font-semibold mb-1 block"
              style={{ color: C.textSecondary }}
            >
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full text-xs p-3 rounded-xl resize-none outline-none"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                color: C.textPrimary,
                minHeight: 72,
              }}
              placeholder="Describe this leave policy..."
            />
          </div>
        </div>
        {/* Footer */}
        <div
          className="px-6 py-4 flex gap-2"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textSecondary,
            }}
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSave(form)}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg,${C.primary},#6366F1)`,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving && <RefreshCw size={12} className="animate-spin" />}
            {isNew ? "Create Policy" : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main export — PURE PANEL, no sidebar, no h-screen ─────────
export default function LeavePolicies({ searchQuery = "", onTabChange }) {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    leaveApi
      .getPolicies()
      .then((res) => setPolicies(res.data ?? []))
      .catch(() => setError("Failed to load policies."))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (formData) => {
    setSaving(true);
    try {
      const res = await leaveApi.createPolicy(formData);
      setPolicies((prev) => [...prev, res.data]);
      setModal(null);
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to create policy.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    setSaving(true);
    try {
      const res = await leaveApi.updatePolicy(id, formData);
      setPolicies((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      setModal(null);
    } catch (err) {
      alert(err?.response?.data?.message ?? "Failed to update policy.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (formData) => {
    if (modal === "new") handleCreate(formData);
    else handleUpdate(modal.policy.id, formData);
  };

  // Apply search filter from parent's search bar
  const filtered = policies.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.leave_type?.toLowerCase().includes(q)
    );
  });

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: C.primary }}
        />
      </div>
    );
  if (error)
    return (
      <div
        className="flex items-center gap-3 p-5 rounded-2xl"
        style={{ background: C.dangerLight }}
      >
        <AlertTriangle size={18} color={C.danger} />
        <p className="text-sm" style={{ color: C.danger }}>
          {error}
        </p>
      </div>
    );

  // ── Render: just the content, NO sidebar, NO h-screen ─────────
  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-bold" style={{ color: C.textPrimary }}>
            Leave Policies
          </h2>
          <p className="text-xs" style={{ color: C.textMuted }}>
            {policies.length} policies configured
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setModal("new")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white"
          style={{
            background: `linear-gradient(135deg,${C.primary},#6366F1)`,
            boxShadow: `0 4px 14px ${C.primary}44`,
          }}
        >
          <Plus size={13} /> New Policy
        </motion.button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <ScrollText size={32} color={C.textMuted} />
          <p
            className="text-sm font-semibold"
            style={{ color: C.textSecondary }}
          >
            {searchQuery ? "No policies match your search" : "No policies yet"}
          </p>
          {!searchQuery && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setModal("new")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: C.primary }}
            >
              <Plus size={13} /> Create First Policy
            </motion.button>
          )}
        </div>
      )}

      {/* Policy cards grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((policy, i) => {
            const color = getColor(policy.leave_type);
            const light = getLight(policy.leave_type);
            const icon = getIcon(policy.leave_type);
            const expanded = expandedId === policy.id;
            const isActive = policy.is_active !== false;

            return (
              <motion.div
                key={policy.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Card className="overflow-hidden">
                  {/* Top stripe */}
                  <div className="h-1.5 w-full" style={{ background: color }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                          style={{ background: light }}
                        >
                          {icon}
                        </div>
                        <div>
                          <p
                            className="text-xs font-bold leading-tight"
                            style={{ color: C.textPrimary }}
                          >
                            {policy.name}
                          </p>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: light, color }}
                          >
                            {policy.leave_type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: isActive
                              ? C.successLight
                              : C.surfaceAlt,
                            color: isActive ? C.success : C.textMuted,
                          }}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setModal({ policy })}
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{
                            background: C.surfaceAlt,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <Edit3 size={10} color={C.textSecondary} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        {
                          label: "Days",
                          value: policy.days_allowed,
                          icon: "📅",
                        },
                        {
                          label: "Notice",
                          value: `${policy.notice_days ?? 0}d`,
                          icon: "⏰",
                        },
                        {
                          label: "Paid",
                          value: policy.is_paid ? "Yes" : "No",
                          icon: "💰",
                        },
                        {
                          label: "Carry Over",
                          value:
                            (policy.carry_over_days ?? 0) > 0
                              ? `${policy.carry_over_days}d`
                              : "No",
                          icon: "🔄",
                        },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-xl p-2.5 flex items-center gap-2"
                          style={{
                            background: C.surfaceAlt,
                            border: `1px solid ${C.border}`,
                          }}
                        >
                          <span className="text-sm">{s.icon}</span>
                          <div>
                            <p
                              className="text-[10px]"
                              style={{ color: C.textMuted }}
                            >
                              {s.label}
                            </p>
                            <p
                              className="text-xs font-bold"
                              style={{ color: C.textPrimary }}
                            >
                              {s.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Applicable to */}
                    {policy.applicable_to?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {policy.applicable_to.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: C.primaryLight,
                              color: C.primary,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Description accordion */}
                    {policy.description && (
                      <>
                        <button
                          onClick={() =>
                            setExpandedId(expanded ? null : policy.id)
                          }
                          className="w-full flex items-center justify-between py-1.5 text-[11px] font-semibold"
                          style={{ color }}
                        >
                          <span className="flex items-center gap-1">
                            <Info size={11} /> Description
                          </span>
                          <ChevronRight
                            size={11}
                            style={{
                              transform: expanded ? "rotate(90deg)" : "none",
                              transition: "transform 0.2s",
                            }}
                          />
                        </button>
                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden"
                            >
                              <p
                                className="text-[11px] leading-relaxed pt-1 pb-2"
                                style={{ color: C.textSecondary }}
                              >
                                {policy.description}
                              </p>
                              <p
                                className="text-[10px]"
                                style={{ color: C.textMuted }}
                              >
                                Last updated:{" "}
                                {policy.updated_at
                                  ? new Date(
                                      policy.updated_at,
                                    ).toLocaleDateString("en-NG")
                                  : "—"}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <PolicyModal
            policy={modal === "new" ? null : modal.policy}
            onSave={handleSave}
            onClose={() => setModal(null)}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
