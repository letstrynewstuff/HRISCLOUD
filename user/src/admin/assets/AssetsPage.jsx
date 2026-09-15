// src/admin/assets/AssetsPage.jsx

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Laptop,
  Plus,
  Users,
  Package,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Menu,
  Search,
  AlertTriangle,
  Tag,
  MapPin,
  RotateCcw,
  Trash2,
  History,
  ChevronLeft,
  ChevronRight,
  Wrench,
  Ban,
  DollarSign,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import { assetApi } from "../../api/service/assetApi";
import { getEmployees } from "../../api/service/employeeApi";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.36 },
  }),
};

const CATEGORY_CONFIG = {
  laptop: { label: "Laptop", bg: "#DBEAFE", color: "#2563EB" },
  phone: { label: "Phone", bg: C.successLight, color: C.success },
  monitor: { label: "Monitor", bg: "#F3E8FF", color: "#7C3AED" },
  access_card: { label: "Access Card", bg: "#FEF3C7", color: "#B45309" },
  vehicle: { label: "Vehicle", bg: C.dangerLight, color: C.danger },
  furniture: { label: "Furniture", bg: C.primaryLight, color: C.primary },
  other: { label: "Other", bg: C.surfaceAlt, color: C.textMuted },
};

const STATUS_CONFIG = {
  available: { label: "Available", bg: C.successLight, color: C.success },
  assigned: { label: "Assigned", bg: "#DBEAFE", color: "#2563EB" },
  under_repair: { label: "Under Repair", bg: "#FEF3C7", color: "#B45309" },
  retired: { label: "Retired", bg: C.surfaceAlt, color: C.textMuted },
  lost: { label: "Lost", bg: C.dangerLight, color: C.danger },
};

const CONDITION_OPTIONS = ["good", "fair", "damaged", "lost"];

// ── Atoms ─────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const Icon = type === "success" ? CheckCircle2 : XCircle;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 40, x: "-50%" }}
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        background: "#1E1B4B",
        boxShadow: "0 12px 40px rgba(15,23,42,0.35)",
        minWidth: 260,
      }}
    >
      <Icon size={16} color={type === "success" ? C.success : C.danger} />
      <span className="text-white text-sm font-semibold">{msg}</span>
    </motion.div>
  );
}

function ModalShell({
  onClose,
  icon,
  iconBg,
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          boxShadow: "0 24px 64px rgba(15,23,42,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: iconBg }}
            >
              {icon}
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
                {title}
              </p>
              {subtitle && (
                <p className="text-[10px]" style={{ color: C.textMuted }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: C.surfaceAlt }}
          >
            <X size={13} color={C.textMuted} />
          </button>
        </div>

        <div className="p-5 space-y-4">{children}</div>

        {footer && <div className="flex gap-3 px-5 pb-5">{footer}</div>}
      </motion.div>
    </motion.div>
  );
}

function FieldLabel({ children }) {
  return (
    <label
      className="block text-xs font-semibold mb-1"
      style={{ color: C.textPrimary }}
    >
      {children}
    </label>
  );
}

const fieldStyle = {
  background: C.surfaceAlt,
  border: `1.5px solid ${C.border}`,
  color: C.textPrimary,
};

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      className="flex items-center gap-2 p-3 rounded-xl"
      style={{ background: C.dangerLight }}
    >
      <AlertTriangle size={13} color={C.danger} />
      <p className="text-xs" style={{ color: C.danger }}>
        {message}
      </p>
    </div>
  );
}

// ── Create Asset Modal ──────────────────────────────────────
function CreateAssetModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    category: "laptop",
    brand: "",
    model: "",
    serialNumber: "",
    condition: "good",
    purchaseDate: "",
    purchaseCost: "",
    warrantyExpiry: "",
    location: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Asset name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await assetApi.create({
        ...form,
        purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
      });
      onSaved(res.data ?? res);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to create asset.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      icon={<Package size={14} color={C.primary} />}
      iconBg={C.primaryLight}
      title="Add Asset"
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
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
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus size={13} />
            )}
            Add Asset
          </motion.button>
        </>
      }
    >
      <ErrorBanner message={error} />

      <div>
        <FieldLabel>Asset Name *</FieldLabel>
        <input
          value={form.name}
          placeholder='e.g. MacBook Pro 14"'
          onChange={(e) => set("name", e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={fieldStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Category</FieldLabel>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={fieldStyle}
          >
            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Condition</FieldLabel>
          <select
            value={form.condition}
            onChange={(e) => set("condition", e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={fieldStyle}
          >
            {CONDITION_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Brand</FieldLabel>
          <input
            value={form.brand}
            placeholder="e.g. Apple"
            onChange={(e) => set("brand", e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={fieldStyle}
          />
        </div>
        <div>
          <FieldLabel>Model</FieldLabel>
          <input
            value={form.model}
            placeholder="e.g. M3 Pro"
            onChange={(e) => set("model", e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={fieldStyle}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Serial Number</FieldLabel>
        <input
          value={form.serialNumber}
          placeholder="Optional"
          onChange={(e) => set("serialNumber", e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={fieldStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Purchase Date</FieldLabel>
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) => set("purchaseDate", e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={fieldStyle}
          />
        </div>
        <div>
          <FieldLabel>Purchase Cost</FieldLabel>
          <input
            type="number"
            min="0"
            value={form.purchaseCost}
            placeholder="₦0.00"
            onChange={(e) => set("purchaseCost", e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={fieldStyle}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Location</FieldLabel>
        <input
          value={form.location}
          placeholder="e.g. Lagos HQ — IT Storage"
          onChange={(e) => set("location", e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={fieldStyle}
        />
      </div>
    </ModalShell>
  );
}

// ── Assign Asset Modal ──────────────────────────────────────
function AssignAssetModal({ asset, onClose, onAssigned }) {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    condition: asset.condition ?? "good",
    expectedReturnDate: "",
    notes: "",
  });
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    getEmployees({ limit: 200 })
      .then((res) => setEmployees(res.data ?? []))
      .catch(() => {});
  }, []);

  const handleAssign = async () => {
    if (!form.employeeId) {
      setError("Choose an employee to assign this asset to.");
      return;
    }
    setAssigning(true);
    setError("");
    try {
      const res = await assetApi.assign(asset.id, form);
      onAssigned(res.data ?? res);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to assign asset.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      icon={<Users size={14} color={C.success} />}
      iconBg={C.successLight}
      title="Assign Asset"
      subtitle={`${asset.name} · ${asset.assetTag}`}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
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
            whileTap={{ scale: 0.98 }}
            onClick={handleAssign}
            disabled={assigning}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: C.success, opacity: assigning ? 0.8 : 1 }}
          >
            {assigning ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Users size={13} />
            )}
            Assign to Employee
          </motion.button>
        </>
      }
    >
      <ErrorBanner message={error} />

      <div>
        <FieldLabel>Select Employee *</FieldLabel>
        <select
          value={form.employeeId}
          onChange={(e) => set("employeeId", e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={fieldStyle}
        >
          <option value="">— Choose employee —</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.first_name} {e.last_name} ({e.employee_code})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Condition Given</FieldLabel>
          <select
            value={form.condition}
            onChange={(e) => set("condition", e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={fieldStyle}
          >
            {CONDITION_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Expected Return</FieldLabel>
          <input
            type="date"
            value={form.expectedReturnDate}
            onChange={(e) => set("expectedReturnDate", e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={fieldStyle}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Notes</FieldLabel>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          placeholder="Optional — e.g. accessories included"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
          style={fieldStyle}
        />
      </div>
    </ModalShell>
  );
}

// ── Return Asset Modal ──────────────────────────────────────
function ReturnAssetModal({ asset, onClose, onReturned }) {
  const [form, setForm] = useState({ condition: "good", notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleReturn = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await assetApi.returnAsset(asset.id, form);
      onReturned(res.data ?? res);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to record return.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      icon={<RotateCcw size={14} color="#B45309" />}
      iconBg="#FEF3C7"
      title="Return Asset"
      subtitle={`${asset.name} · currently with ${asset.assignedTo?.name ?? "employee"}`}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
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
            whileTap={{ scale: 0.98 }}
            onClick={handleReturn}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
            style={{ background: "#B45309", opacity: saving ? 0.8 : 1 }}
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RotateCcw size={13} />
            )}
            Mark Returned
          </motion.button>
        </>
      }
    >
      <ErrorBanner message={error} />
      <p className="text-xs" style={{ color: C.textMuted }}>
        Recording a "damaged" return sends the asset to under repair; "lost"
        retires it as lost. A "good" or "fair" return makes it available again.
      </p>
      <div>
        <FieldLabel>Condition on Return *</FieldLabel>
        <select
          value={form.condition}
          onChange={(e) => set("condition", e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={fieldStyle}
        >
          {CONDITION_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c[0].toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel>Notes</FieldLabel>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          placeholder="Optional"
          className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
          style={fieldStyle}
        />
      </div>
    </ModalShell>
  );
}

// ── History Modal ────────────────────────────────────────────
function HistoryModal({ asset, onClose }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    assetApi
      .getHistory(asset.id)
      .then((res) => setHistory(res.data ?? []))
      .catch((err) =>
        setError(err?.response?.data?.message ?? "Failed to load history."),
      )
      .finally(() => setLoading(false));
  }, [asset.id]);

  return (
    <ModalShell
      onClose={onClose}
      icon={<History size={14} color={C.primary} />}
      iconBg={C.primaryLight}
      title="Assignment History"
      subtitle={`${asset.name} · ${asset.assetTag}`}
    >
      <ErrorBanner message={error} />
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 size={18} className="animate-spin" color={C.textMuted} />
        </div>
      ) : history.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: C.textMuted }}>
          This asset has never been assigned.
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {history.map((h) => (
            <div
              key={h.id}
              className="p-3 rounded-xl"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
              }}
            >
              <div className="flex items-center justify-between">
                <p
                  className="text-xs font-semibold"
                  style={{ color: C.textPrimary }}
                >
                  {h.employeeName ?? "—"}
                </p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: h.status === "assigned" ? "#DBEAFE" : C.surface,
                    color: h.status === "assigned" ? "#2563EB" : C.textMuted,
                  }}
                >
                  {h.status}
                </span>
              </div>
              <p className="text-[11px] mt-1" style={{ color: C.textMuted }}>
                Assigned {h.assignedDate ?? "—"}
                {h.returnedDate
                  ? ` · Returned ${h.returnedDate} (${h.returnedCondition})`
                  : ""}
              </p>
              {h.notes && (
                <p
                  className="text-[11px] mt-1"
                  style={{ color: C.textSecondary }}
                >
                  {h.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}

// ── Asset Card ────────────────────────────────────────────────
function AssetCard({ asset, index, onAssign, onReturn, onRetire, onHistory }) {
  const isAvailable = asset.status === "available";
  const isAssigned = asset.status === "assigned";
  const canRetire = !isAssigned && asset.status !== "retired";

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(79,70,229,0.1)" }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: CATEGORY_CONFIG[asset.category]?.bg ?? C.surfaceAlt,
            }}
          >
            <Laptop
              size={18}
              color={CATEGORY_CONFIG[asset.category]?.color ?? C.textMuted}
            />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: C.textPrimary }}>
              {asset.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Tag size={10} color={C.textMuted} />
              <span className="text-[11px]" style={{ color: C.textMuted }}>
                {asset.assetTag}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onHistory(asset)}
          title="View history"
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: C.surfaceAlt }}
        >
          <History size={13} color={C.textMuted} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <CategoryBadge category={asset.category} />
        <StatusBadge status={asset.status} />
      </div>

      {asset.location && (
        <div className="flex items-center gap-1.5">
          <MapPin size={11} color={C.textMuted} />
          <span className="text-xs" style={{ color: C.textSecondary }}>
            {asset.location}
          </span>
        </div>
      )}

      {asset.assignedTo && (
        <div
          className="flex items-center gap-2 p-2.5 rounded-xl"
          style={{ background: "#EFF6FF" }}
        >
          <Users size={12} color="#2563EB" />
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: "#1E3A8A" }}
            >
              {asset.assignedTo.name}
            </p>
            <p className="text-[10px]" style={{ color: "#3B82F6" }}>
              Since {asset.assignedTo.assignedDate}
            </p>
          </div>
        </div>
      )}

      <div className="mt-auto flex gap-2">
        {isAvailable && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAssign(asset)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: C.successLight,
              color: C.success,
              border: `1px solid ${C.success}33`,
            }}
          >
            <Users size={14} /> Assign
          </motion.button>
        )}
        {isAssigned && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onReturn(asset)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "#FEF3C7",
              color: "#B45309",
              border: "1px solid #B4530933",
            }}
          >
            <RotateCcw size={14} /> Return
          </motion.button>
        )}
        {asset.status === "under_repair" && (
          <div
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: C.surfaceAlt, color: C.textMuted }}
          >
            <Wrench size={14} /> In Repair
          </div>
        )}
        {canRetire && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onRetire(asset)}
            title="Retire asset"
            className="w-11 flex items-center justify-center rounded-xl"
            style={{
              background: C.dangerLight,
              color: C.danger,
              border: `1px solid ${C.danger}33`,
            }}
          >
            <Trash2 size={14} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
export default function AdminAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [createModal, setCreateModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await assetApi.getAll({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
      });
      setAssets(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to load assets.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const handleCreated = (asset) => {
    setAssets((prev) => [asset, ...prev]);
    setCreateModal(false);
    showToast(`${asset.assetTag} created.`);
  };

  const handleAssigned = () => {
    setAssignTarget(null);
    showToast("Asset assigned successfully.");
    load();
  };

  const handleReturned = () => {
    setReturnTarget(null);
    showToast("Asset marked as returned.");
    load();
  };

  const handleRetire = async (asset) => {
    if (
      !window.confirm(
        `Retire ${asset.name}? This can't be assigned again afterwards.`,
      )
    )
      return;
    try {
      await assetApi.retire(asset.id);
      showToast(`${asset.name} retired.`);
      load();
    } catch (err) {
      showToast(
        err?.response?.data?.message ?? "Failed to retire asset.",
        "error",
      );
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TOPBAR */}
          <header
            className="shrink-0 h-[60px] flex items-center px-5 gap-4 z-10"
            style={{
              background: "rgba(240,242,248,0.9)",
              backdropFilter: "blur(12px)",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl hidden md:flex"
              style={{ background: C.surface }}
            >
              <Menu size={16} color={C.textSecondary} />
            </motion.button>
            <div className="relative flex-1 max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                color={C.textMuted}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, tag, or serial no..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
                style={fieldStyle}
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCreateModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: C.primary }}
              >
                <Plus size={14} /> Add Asset
              </motion.button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: C.textPrimary, fontFamily: "Sora,sans-serif" }}
              >
                Assets
              </h1>
              <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>
                Track company-owned equipment and give it to employees.
              </p>
            </div> */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl p-8 text-white"
              style={{
                background:
                  "linear-gradient(135deg,#1E1B4B 0%,#312E81 50%,#1E40AF 100%)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <DollarSign size={28} color="#fff" />
                </div>
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: "Sora,sans-serif" }}
                  >
                    {/* Payroll Management */}
                    Assets
                  </h1>
                  <p className="text-indigo-200 text-sm mt-0.5">
                    {/* Nigeria compliant · Manual & Assisted modes · Auto payslips */}
                     Track company-owned equipment and give it to employees.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Status filter */}
            <div className="flex gap-2 flex-wrap">
              {["all", ...Object.keys(STATUS_CONFIG)].map((s) => {
                const cfg = STATUS_CONFIG[s] ?? {
                  label: "All",
                  bg: C.primaryLight,
                  color: C.primary,
                };
                const active = statusFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                    style={{
                      background: active
                        ? s === "all"
                          ? C.primary
                          : cfg.color
                        : C.surface,
                      color: active ? "#fff" : C.textSecondary,
                      border: `1px solid ${active ? (s === "all" ? C.primary : cfg.color) : C.border}`,
                    }}
                  >
                    {s === "all" ? "All Statuses" : cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {["all", ...Object.keys(CATEGORY_CONFIG)].map((c) => {
                const cfg = CATEGORY_CONFIG[c] ?? {
                  label: "All",
                  bg: C.surfaceAlt,
                  color: C.textMuted,
                };
                const active = categoryFilter === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCategoryFilter(c)}
                    className="text-[11px] font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: active ? cfg.bg : "transparent",
                      color: active ? cfg.color : C.textMuted,
                      border: `1px solid ${active ? cfg.color + "55" : C.border}`,
                    }}
                  >
                    {c === "all" ? "All Categories" : cfg.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div
                className="rounded-xl p-4 flex items-center gap-2"
                style={{ background: C.dangerLight }}
              >
                <AlertTriangle size={15} color={C.danger} />
                <p className="text-sm" style={{ color: C.danger }}>
                  {error}
                </p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl animate-pulse"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  />
                ))}
              </div>
            ) : assets.length === 0 ? (
              <div
                className="rounded-2xl p-16 flex flex-col items-center gap-3"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <Package size={36} color={C.textMuted} />
                <p className="font-semibold" style={{ color: C.textSecondary }}>
                  No assets found
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: C.primary }}
                >
                  <Plus size={14} /> Add First Asset
                </motion.button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {assets.map((asset, i) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      index={i}
                      onAssign={setAssignTarget}
                      onReturn={setReturnTarget}
                      onRetire={handleRetire}
                      onHistory={setHistoryTarget}
                    />
                  ))}
                </div>

                {meta.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      Page {meta.page} of {meta.totalPages} · {meta.total}{" "}
                      assets
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-40"
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <ChevronLeft size={14} color={C.textSecondary} />
                      </button>
                      <button
                        disabled={page >= meta.totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(meta.totalPages, p + 1))
                        }
                        className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-40"
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <ChevronRight size={14} color={C.textSecondary} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {createModal && (
          <CreateAssetModal
            onClose={() => setCreateModal(false)}
            onSaved={handleCreated}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {assignTarget && (
          <AssignAssetModal
            asset={assignTarget}
            onClose={() => setAssignTarget(null)}
            onAssigned={handleAssigned}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {returnTarget && (
          <ReturnAssetModal
            asset={returnTarget}
            onClose={() => setReturnTarget(null)}
            onReturned={handleReturned}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {historyTarget && (
          <HistoryModal
            asset={historyTarget}
            onClose={() => setHistoryTarget(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onDone={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
