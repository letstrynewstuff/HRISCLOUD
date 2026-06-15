


// src/admin/accounting/TaxManagement.jsx

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Settings,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Send,
  Plus,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import {
  accountingApi,
  formatNaira,
  nairaToKobo,
  koboToNaira,
  TAX_STATUS_COLORS,
} from "../../api/service/accountingApi";
import Loader from "../../components/Loader";

// ── Helpers ───────────────────────────────────────────────────
const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <Motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{ background: "#1E1B4B", color: "#fff", minWidth: 320 }}
    >
      {type === "error" ? (
        <AlertCircle size={15} color="#EF4444" />
      ) : (
        <CheckCircle2 size={15} color="#10B981" />
      )}
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onDismiss} className="ml-auto">
        <X size={13} color="rgba(255,255,255,0.5)" />
      </button>
    </Motion.div>
  );
}

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = TAX_STATUS_COLORS?.[status] ?? {
    bg: C?.surfaceAlt ?? "#F1F5F9",
    color: C?.textMuted ?? "#64748B",
  };
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status ?? "Unknown"}
    </span>
  );
}

// ── Summary card ──────────────────────────────────────────────
function SummaryCard({ label, value, sub, color }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: C?.surface ?? "#fff", border: `1px solid ${C?.border ?? "#E2E8F0"}` }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: C?.textMuted ?? "#64748B" }}
      >
        {label}
      </p>
      <p
        className="text-xl font-bold"
        style={{ color: color ?? C?.primary ?? "#4F46E5", fontFamily: "Sora,sans-serif" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: C?.textMuted ?? "#64748B" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Period selector ───────────────────────────────────────────
function PeriodSelect({ value, onChange }) {
  const options = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
      result.push({ val, label });
    }
    return result;
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm rounded-xl outline-none appearance-none"
      style={{
        background: C?.surfaceAlt ?? "#F1F5F9",
        border: `1px solid ${C?.border ?? "#E2E8F0"}`,
        color: C?.textPrimary ?? "#1E293B",
      }}
    >
      {options.map((o) => (
        <option key={o.val} value={o.val}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Remittance modal ──────────────────────────────────────────
function RemittanceModal({ title, period, onClose, onSubmit, saving }) {
  const [form, setForm] = useState({
    period,
    remittanceDate: "",
    remittanceReference: "",
    remittedTo: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: C?.surface ?? "#fff", border: `1px solid ${C?.border ?? "#E2E8F0"}` }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base" style={{ color: C?.textPrimary ?? "#1E293B" }}>
            {title}
          </h3>
          <button onClick={onClose}><X size={16} color={C?.textMuted ?? "#64748B"} /></button>
        </div>

        <div className="space-y-3">
          {[
            { label: "Period", key: "period", type: "text", readOnly: true },
            { label: "Remittance Date *", key: "remittanceDate", type: "date" },
            { label: "Reference Number", key: "remittanceReference", type: "text", placeholder: "FIRS / Agency reference" },
            { label: "Remitted To", key: "remittedTo", type: "text", placeholder: "e.g. FIRS, PFA Name" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1" style={{ color: C?.textPrimary ?? "#1E293B" }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key]}
                readOnly={f.readOnly}
                placeholder={f.placeholder}
                onChange={(e) => !f.readOnly && set(f.key, e.target.value)}
                className="w-full p-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: C?.surfaceAlt ?? "#F1F5F9",
                  border: `1.5px solid ${C?.border ?? "#E2E8F0"}`,
                  color: f.readOnly ? (C?.textMuted ?? "#64748B") : (C?.textPrimary ?? "#1E293B"),
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-sm"
            style={{ background: C?.surfaceAlt ?? "#F1F5F9", color: C?.textSecondary ?? "#475569" }}
          >
            Cancel
          </button>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSubmit(form)}
            disabled={saving || !form.remittanceDate}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: C?.primary ?? "#4F46E5", opacity: saving || !form.remittanceDate ? 0.7 : 1 }}
          >
            {saving ? <><RefreshCw size={14} className="animate-spin" /> Submitting…</> : <><Send size={14} /> Submit</>}
          </Motion.button>
        </div>
      </Motion.div>
    </div>
  );
}

// ── VAT payment modal ─────────────────────────────────────────
function VatPayModal({ period, amount, onClose, onSubmit, saving }) {
  const [form, setForm] = useState({
    period,
    amountPaid: koboToNaira(amount ?? 0).toFixed(2),
    paymentDate: "",
    paymentReference: "",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: C?.surface ?? "#fff", border: `1px solid ${C?.border ?? "#E2E8F0"}` }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base" style={{ color: C?.textPrimary ?? "#1E293B" }}>
            Record VAT Payment
          </h3>
          <button onClick={onClose}><X size={16} color={C?.textMuted ?? "#64748B"} /></button>
        </div>

        <div className="space-y-3">
          {[
            { label: "Period", key: "period", type: "text", readOnly: true },
            { label: "Amount (₦)", key: "amountPaid", type: "number", placeholder: "0.00" },
            { label: "Payment Date *", key: "paymentDate", type: "date" },
            { label: "FIRS Reference", key: "paymentReference", type: "text", placeholder: "Reference number" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold mb-1" style={{ color: C?.textPrimary ?? "#1E293B" }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key]}
                readOnly={f.readOnly}
                placeholder={f.placeholder}
                onChange={(e) => !f.readOnly && set(f.key, e.target.value)}
                className="w-full p-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: C?.surfaceAlt ?? "#F1F5F9",
                  border: `1.5px solid ${C?.border ?? "#E2E8F0"}`,
                  color: f.readOnly ? (C?.textMuted ?? "#64748B") : (C?.textPrimary ?? "#1E293B"),
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-sm"
            style={{ background: C?.surfaceAlt ?? "#F1F5F9", color: C?.textSecondary ?? "#475569" }}
          >
            Cancel
          </button>
          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSubmit({ ...form, amountPaid: nairaToKobo(form.amountPaid) })}
            disabled={saving || !form.paymentDate}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
            style={{ background: C?.primary ?? "#4F46E5", opacity: saving || !form.paymentDate ? 0.7 : 1 }}
          >
            {saving ? <><RefreshCw size={14} className="animate-spin" /> Recording…</> : <><Send size={14} /> Record</>}
          </Motion.button>
        </div>
      </Motion.div>
    </div>
  );
}

// ── History table ─────────────────────────────────────────────
function HistoryTable({ rows, columns, loading }) {
  if (loading) return <div className="flex justify-center py-8"><Loader /></div>;
  if (!rows?.length)
    return (
      <div className="flex flex-col items-center py-10 gap-2" style={{ color: C?.textMuted ?? "#64748B" }}>
        <FileText size={24} />
        <p className="text-sm">No history yet</p>
      </div>
    );
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ border: `1px solid ${C?.border ?? "#E2E8F0"}` }}>
      <table className="w-full">
        <thead>
          <tr style={{ background: C?.surfaceAlt ?? "#F1F5F9", borderBottom: `1px solid ${C?.border ?? "#E2E8F0"}` }}>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: C?.textMuted ?? "#64748B" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <Motion.tr
              key={row.id ?? i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="border-b"
              style={{ borderColor: C?.border ?? "#E2E8F0" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C?.surfaceAlt ?? "#F1F5F9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-sm" style={{ color: C?.textSecondary ?? "#475569" }}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
                </td>
              ))}
            </Motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Tax calendar ──────────────────────────────────────────────
function TaxCalendar({ items, loading }) {
  if (loading) return <div className="flex justify-center py-6"><Loader /></div>;
  if (!items?.length)
    return (
      <div className="flex flex-col items-center py-8 gap-2" style={{ color: C?.textMuted ?? "#64748B" }}>
        <Calendar size={24} />
        <p className="text-sm">No upcoming obligations</p>
      </div>
    );
  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((item, i) => {
        const overdue = item.isOverdue;
        const dueSoon = !overdue && item.daysUntil <= 7;
        const badgeBg  = overdue ? "#FEE2E2" : dueSoon ? "#FEF3C7" : "#D1FAE5";
        const badgeClr = overdue ? "#DC2626" : dueSoon ? "#D97706" : "#065F46";
        const badgeTxt = overdue ? "Overdue" : dueSoon ? "Due Soon" : "Upcoming";
        return (
          <Motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{
              background: C?.surface ?? "#fff",
              border: `1px solid ${overdue ? "#FCA5A5" : (C?.border ?? "#E2E8F0")}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: overdue ? "#FEE2E2" : "#EEF2FF" }}
            >
              <Calendar size={18} color={overdue ? "#DC2626" : (C?.primary ?? "#4F46E5")} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold" style={{ color: C?.textPrimary ?? "#1E293B" }}>{item.taxType}</p>
                {overdue && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              </div>
              <p className="text-xs" style={{ color: C?.textMuted ?? "#64748B" }}>
                {item.label} · Period: {item.period}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold mb-1" style={{ color: C?.textPrimary ?? "#1E293B" }}>
                {item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—"}
              </p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: badgeBg, color: badgeClr }}>
                {badgeTxt}
              </span>
            </div>
          </Motion.div>
        );
      })}
    </div>
  );
}

// ── VAT tab ───────────────────────────────────────────────────
function VatTab({ period, showToast }) {
  const [summary, setSummary]       = useState(null);
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [saving, setSaving]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await accountingApi.tax.vat.summary(period);
      setSummary(r.data);
    } catch {
      showToast("Failed to load VAT summary", "error");
    } finally {
      setLoading(false);
    }
  }, [period, showToast]);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const r = await accountingApi.tax.vat.history();
      setHistory(r.data ?? []);
    } catch {}
    finally { setHistLoading(false); }
  }, []);

  useEffect(() => { load(); loadHistory(); }, [load, loadHistory]);

  const handleFile = async () => {
    setSaving(true);
    try {
      await accountingApi.tax.vat.file(period);
      showToast("VAT return filed successfully");
      load(); loadHistory();
    } catch (err) {
      showToast(err?.response?.data?.message ?? "Failed to file VAT return", "error");
    } finally { setSaving(false); }
  };

  const handlePay = async (payload) => {
    setSaving(true);
    try {
      await accountingApi.tax.vat.pay(payload);
      showToast("VAT payment recorded");
      setShowPayModal(false);
      load();
      loadHistory();
      // } catch (err) {
      //   showToast(err?.response?.data?.message ?? "Failed to record payment", "error");
      // } finally { setSaving(false); }
    } catch (err) {
      console.error("VAT pay error:", err?.response ?? err);
      showToast(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to record payment",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="flex justify-center py-10"><Loader /></div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Output VAT (Collected)"  value={formatNaira(summary.total_vat_collected ?? summary.totalVatCollected)}  color="#1D4ED8" />
            <SummaryCard label="Input VAT (Recoverable)" value={formatNaira(summary.total_vat_recoverable ?? summary.totalVatRecoverable)} color="#065F46" />
            <SummaryCard
              label="Net VAT Payable"
              value={formatNaira(summary.net_vat_payable ?? summary.netVatPayable)}
              color={(summary.net_vat_payable ?? summary.netVatPayable) > 0 ? "#B91C1C" : "#065F46"}
              sub={`Status: ${summary.status}`}
            />
          </div>
          <div className="flex items-center gap-3">
            <Motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleFile}
              disabled={saving || summary.status !== "Open"}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white"
              style={{ background: summary.status === "Open" ? (C?.primary ?? "#4F46E5") : (C?.border ?? "#E2E8F0"), opacity: saving ? 0.7 : 1 }}
            >
              <FileText size={14} /> File VAT Return
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowPayModal(true)}
              disabled={summary.status === "Paid"}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl"
              style={{ background: C?.surfaceAlt ?? "#F1F5F9", color: C?.textSecondary ?? "#475569", border: `1px solid ${C?.border ?? "#E2E8F0"}` }}
            >
              <DollarSign size={14} /> Record Payment
            </Motion.button>
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-sm" style={{ color: C?.textMuted ?? "#64748B" }}>No VAT data for this period</div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: C?.textMuted ?? "#64748B" }}>History</p>
        <HistoryTable
          loading={histLoading}
          rows={history}
          columns={[
            { key: "period", label: "Period" },
            { key: "total_vat_collected",   label: "Output VAT",  render: (v) => formatNaira(v) },
            { key: "total_vat_recoverable", label: "Input VAT",   render: (v) => formatNaira(v) },
            { key: "net_vat_payable",       label: "Net Payable", render: (v) => formatNaira(v) },
            { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
            { key: "filed_date",   label: "Filed", render: (v) => v ? new Date(v).toLocaleDateString("en-NG") : "—" },
            { key: "payment_date", label: "Paid",  render: (v) => v ? new Date(v).toLocaleDateString("en-NG") : "—" },
          ]}
        />
      </div>

      <AnimatePresence>
        {showPayModal && summary && (
          <VatPayModal
            period={period}
            amount={summary.net_vat_payable ?? summary.netVatPayable}
            onClose={() => setShowPayModal(false)}
            onSubmit={handlePay}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── PAYE tab ──────────────────────────────────────────────────
function PayeTab({ period, showToast }) {
  const [summary, setSummary]         = useState(null);
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [saving, setSaving]           = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await accountingApi.tax.paye.summary(period);
      setSummary(r.data);
    } catch { showToast("Failed to load PAYE summary", "error"); }
    finally { setLoading(false); }
  }, [period, showToast]);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const r = await accountingApi.tax.paye.history();
      setHistory(r.data ?? []);
    } catch {}
    finally { setHistLoading(false); }
  }, []);

  useEffect(() => { load(); loadHistory(); }, [load, loadHistory]);

  const handleRemit = async (form) => {
    setSaving(true);
    try {
      await accountingApi.tax.paye.remit(form);
      showToast("PAYE remittance recorded");
      setShowModal(false);
      load();
      loadHistory();
      // } catch (err) {
      //   showToast(err?.response?.data?.message ?? "Failed to record remittance", "error");
      // } finally { setSaving(false); }
    } catch (err) {
      console.error("PAYE remit error:", err?.response ?? err);
      showToast(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to record remittance",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="flex justify-center py-10"><Loader /></div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Total Gross Pay"      value={formatNaira(summary.total_gross_pay ?? summary.totalGrossPay)} color="#1D4ED8" />
            <SummaryCard label="Total PAYE Deducted"  value={formatNaira(summary.total_paye ?? summary.totalPaye)}          color="#B91C1C" />
            <SummaryCard label="Status" value={summary.status} color={summary.status === "Remitted" ? "#065F46" : "#B45309"} />
          </div>
          <Motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            disabled={summary.status === "Remitted"}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white"
            style={{ background: summary.status === "Remitted" ? (C?.border ?? "#E2E8F0") : (C?.primary ?? "#4F46E5") }}
          >
            <Send size={14} /> Record Remittance
          </Motion.button>
        </>
      ) : (
        <div className="py-8 text-center text-sm" style={{ color: C?.textMuted ?? "#64748B" }}>No PAYE data for this period</div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: C?.textMuted ?? "#64748B" }}>History</p>
        <HistoryTable
          loading={histLoading}
          rows={history}
          columns={[
            { key: "period", label: "Period" },
            { key: "total_gross_pay", label: "Gross Pay", render: (v) => formatNaira(v) },
            { key: "total_paye",      label: "PAYE",      render: (v) => formatNaira(v) },
            { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
            { key: "remittance_date",      label: "Remitted",  render: (v) => v ? new Date(v).toLocaleDateString("en-NG") : "—" },
            { key: "remittance_reference", label: "Reference" },
          ]}
        />
      </div>

      <AnimatePresence>
        {showModal && (
          <RemittanceModal title="Record PAYE Remittance" period={period} onClose={() => setShowModal(false)} onSubmit={handleRemit} saving={saving} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── WHT tab ───────────────────────────────────────────────────
function WhtTab({ period, showToast }) {
  const [rows, setRows]               = useState([]);
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [saving, setSaving]           = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await accountingApi.tax.wht.summary(period);
      setRows(r.data ?? []);
    } catch { showToast("Failed to load WHT summary", "error"); }
    finally { setLoading(false); }
  }, [period, showToast]);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const r = await accountingApi.tax.wht.history();
      setHistory(r.data ?? []);
    } catch {}
    finally { setHistLoading(false); }
  }, []);

  useEffect(() => { load(); loadHistory(); }, [load, loadHistory]);

  const totalWht      = rows.reduce((s, r) => s + Number(r.wht_amount_kobo ?? r.withholdingAmount ?? 0), 0);
  const totalRemitted = rows.filter((r) => r.status === "Remitted").reduce((s, r) => s + Number(r.wht_amount_kobo ?? r.withholdingAmount ?? 0), 0);

  const handleRemit = async (form) => {
    setSaving(true);
    try {
      await accountingApi.tax.wht.remit({ ...form, totalAmount: totalWht });
      showToast("WHT remittance recorded");
      setShowModal(false);
      load();
      loadHistory();
      // } catch (err) {
      //   showToast(err?.response?.data?.message ?? "Failed", "error");
      // } finally { setSaving(false); }
    } catch (err) {
      console.error("WHT remit error:", err?.response ?? err);
      showToast(
        err?.response?.data?.message ?? err?.message ?? "Failed",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total WHT Deducted" value={formatNaira(totalWht)}              color="#1D4ED8" />
        <SummaryCard label="Total Remitted"      value={formatNaira(totalRemitted)}         color="#065F46" />
        <SummaryCard label="Outstanding"         value={formatNaira(totalWht - totalRemitted)} color="#B91C1C" />
      </div>
      <Motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white"
        style={{ background: C?.primary ?? "#4F46E5" }}
      >
        <Send size={14} /> Record Remittance
      </Motion.button>
      <HistoryTable
        loading={loading || histLoading}
        rows={history.length ? history : rows}
        columns={[
          { key: "period", label: "Period" },
          { key: "total_remitted_kobo", label: "WHT Amount", render: (v) => formatNaira(v) },
          { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
          { key: "remittance_date",      label: "Remitted",  render: (v) => v ? new Date(v).toLocaleDateString("en-NG") : "—" },
          { key: "remittance_reference", label: "Reference" },
        ]}
      />
      <AnimatePresence>
        {showModal && (
          <RemittanceModal title="Record WHT Remittance" period={period} onClose={() => setShowModal(false)} onSubmit={handleRemit} saving={saving} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Statutory tab (Pension / NHF / NSITF) ────────────────────
function StatutoryTab({ type, period, showToast }) {
  const [summary, setSummary]         = useState(null);
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [saving, setSaving]           = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await accountingApi.tax.statutory.summary(type, period);
      setSummary(r.data);
    } catch { showToast(`Failed to load ${type} summary`, "error"); }
    finally { setLoading(false); }
  }, [type, period, showToast]);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const r = await accountingApi.tax.statutory.history(type);
      setHistory(r.data ?? []);
    } catch {}
    finally { setHistLoading(false); }
  }, [type]);

  useEffect(() => { load(); loadHistory(); }, [load, loadHistory]);

  const handleRemit = async (form) => {
    setSaving(true);
    try {
      await accountingApi.tax.statutory.remit(type, form);
      showToast(`${type} remittance recorded`);
      setShowModal(false);
      load();
      loadHistory();
      // } catch (err) {
      //   showToast(err?.response?.data?.message ?? "Failed", "error");
      // } finally { setSaving(false); }
    } catch (err) {
      console.error("Statutory remit error:", err?.response ?? err);
      showToast(
        err?.response?.data?.message ?? err?.message ?? "Failed",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="flex justify-center py-10"><Loader /></div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Employee Share" value={formatNaira(summary.total_employee_share ?? summary.totalEmployeeShare)} color="#1D4ED8" />
            <SummaryCard label="Employer Share" value={formatNaira(summary.total_employer_share ?? summary.totalEmployerShare)} color="#065F46" />
            <SummaryCard
              label="Total Amount"
              value={formatNaira(summary.total_amount ?? summary.totalAmount ?? (Number(summary.total_employee_share ?? 0) + Number(summary.total_employer_share ?? 0)))}
              color="#B91C1C"
              sub={`Status: ${summary.status}`}
            />
          </div>
          <Motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            disabled={summary.status === "Remitted"}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white"
            style={{ background: summary.status === "Remitted" ? (C?.border ?? "#E2E8F0") : (C?.primary ?? "#4F46E5") }}
          >
            <Send size={14} /> Record Remittance
          </Motion.button>
        </>
      ) : (
        <div className="py-8 text-center text-sm" style={{ color: C?.textMuted ?? "#64748B" }}>No {type} data for this period</div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: C?.textMuted ?? "#64748B" }}>History</p>
        <HistoryTable
          loading={histLoading}
          rows={history}
          columns={[
            { key: "period", label: "Period" },
            { key: "total_amount", label: "Total Amount", render: (v, row) => formatNaira(v ?? (Number(row.total_employee_share ?? 0) + Number(row.total_employer_share ?? 0))) },
            { key: "status", label: "Status", render: (v) => <StatusBadge status={v} /> },
            { key: "remittance_date",      label: "Remitted",    render: (v) => v ? new Date(v).toLocaleDateString("en-NG") : "—" },
            { key: "remittance_reference", label: "Reference" },
            { key: "remitted_to",          label: "Remitted To" },
          ]}
        />
      </div>

      <AnimatePresence>
        {showModal && (
          <RemittanceModal title={`Record ${type} Remittance`} period={period} onClose={() => setShowModal(false)} onSubmit={handleRemit} saving={saving} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Tax settings drawer ───────────────────────────────────────
function TaxSettingsDrawer({ onClose, showToast }) {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(null);

  useEffect(() => {
    // ✅ FIXED: was accountingApi.tax.getAllConfigs() — correct path is accountingApi.tax.config.getAll()
    accountingApi.tax.config.getAll()
      .then((r) => setConfigs(r.data ?? []))
      .catch(() => showToast("Failed to load tax config", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleToggle = async (cfg) => {
    setSaving(cfg.id);
    try {
      if (cfg.is_active ?? cfg.isActive) {
        // ✅ FIXED: was accountingApi.tax.deactivateConfig() — correct path is accountingApi.tax.config.deactivate()
        await accountingApi.tax.config.deactivate(cfg.id);
      } else {
        // ✅ FIXED: was accountingApi.tax.updateConfig() — correct path is accountingApi.tax.config.update()
        await accountingApi.tax.config.update(cfg.id, { isActive: true });
      }
      setConfigs((p) =>
        p.map((c) =>
          c.id === cfg.id
            ? { ...c, is_active: !(cfg.is_active ?? cfg.isActive), isActive: !(cfg.is_active ?? cfg.isActive) }
            : c
        ),
      );
    } catch {
      showToast("Failed to update config", "error");
    } finally {
      setSaving(null);
    }
  };

  return (
    <Motion.div
      className="fixed inset-0 z-50 flex items-center justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <Motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative h-full w-full max-w-md flex flex-col"
        style={{ background: C?.surface ?? "#fff", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${C?.border ?? "#E2E8F0"}` }}
        >
          <h2 className="font-bold text-sm" style={{ color: C?.textPrimary ?? "#1E293B" }}>Tax Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={15} color={C?.textMuted ?? "#64748B"} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-10"><Loader /></div>
          ) : configs.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: C?.textMuted ?? "#64748B" }}>
              No tax configurations yet
            </div>
          ) : (
            <div className="space-y-3">
              {configs.map((cfg) => {
                const isActive = cfg.is_active ?? cfg.isActive;
                return (
                  <div
                    key={cfg.id}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: C?.bg ?? "#F8FAFC", border: `1px solid ${C?.border ?? "#E2E8F0"}` }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: C?.textPrimary ?? "#1E293B" }}>
                        {cfg.tax_type ?? cfg.taxType}
                      </p>
                      <p className="text-xs" style={{ color: C?.textMuted ?? "#64748B" }}>
                        Rate: {cfg.rate}% · Effective: {cfg.effective_date ?? cfg.effectiveDate ?? "—"}
                      </p>
                      {cfg.notes && (
                        <p className="text-xs mt-0.5" style={{ color: C?.textMuted ?? "#64748B" }}>{cfg.notes}</p>
                      )}
                    </div>
                    <div
                      onClick={() => handleToggle(cfg)}
                      className="w-9 h-5 rounded-full cursor-pointer transition-all relative shrink-0"
                      style={{ background: isActive ? (C?.primary ?? "#4F46E5") : (C?.border ?? "#E2E8F0") }}
                    >
                      {saving === cfg.id ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RefreshCw size={10} color="#fff" className="animate-spin" />
                        </div>
                      ) : (
                        <Motion.div
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                          animate={{ left: isActive ? "calc(100% - 18px)" : "2px" }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Motion.div>
    </Motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
const TAX_TABS = [
  { id: "vat",     label: "VAT"     },
  { id: "paye",    label: "PAYE"    },
  { id: "wht",     label: "WHT"     },
  { id: "pension", label: "Pension" },
  { id: "nhf",     label: "NHF"     },
  { id: "nsitf",   label: "NSITF"   },
];

export default function TaxManagement() {
  const [period, setPeriod]           = useState(currentPeriod());
  const [activeTab, setActiveTab]     = useState("vat");
  const [calendar, setCalendar]       = useState([]);
  const [calLoading, setCalLoading]   = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast]             = useState(null);

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  useEffect(() => {
    setCalLoading(true);
    // ✅ FIXED: was accountingApi.tax.calendar.get() — correct is accountingApi.tax.calendar()
    accountingApi.tax.calendar()
      .then((r) => setCalendar(r.data ?? []))
      .catch(() => {})
      .finally(() => setCalLoading(false));
  }, []);

  const overdueCount = calendar?.filter((i) => i.isOverdue).length ?? 0;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C?.textMuted ?? "#64748B" }}>
            Tax Management
          </p>
          {overdueCount > 0 && (
            <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "#DC2626" }}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {overdueCount} overdue obligation{overdueCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelect value={period} onChange={setPeriod} />
          <Motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-xl"
            style={{ background: C?.surfaceAlt ?? "#F1F5F9", border: `1px solid ${C?.border ?? "#E2E8F0"}` }}
          >
            <Settings size={15} color={C?.textSecondary ?? "#475569"} />
          </Motion.button>
        </div>
      </div>

      {/* Tax Calendar */}
      <div className="rounded-2xl p-5" style={{ background: C?.surface ?? "#fff", border: `1px solid ${C?.border ?? "#E2E8F0"}` }}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} color={C?.primary ?? "#4F46E5"} />
          <p className="text-sm font-bold" style={{ color: C?.textPrimary ?? "#1E293B" }}>Upcoming Obligations</p>
        </div>
        <TaxCalendar items={calendar} loading={calLoading} />
      </div>

      {/* Tax type tabs */}
      <div className="rounded-2xl overflow-hidden" style={{ background: C?.surface ?? "#fff", border: `1px solid ${C?.border ?? "#E2E8F0"}` }}>
        <div className="flex gap-1 p-2 overflow-x-auto" style={{ borderBottom: `1px solid ${C?.border ?? "#E2E8F0"}`, scrollbarWidth: "none" }}>
          {TAX_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <Motion.button
                key={tab.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0"
                style={{
                  background: active ? (C?.primary ?? "#4F46E5") : "transparent",
                  color: active ? "#fff" : (C?.textSecondary ?? "#475569"),
                  boxShadow: active ? "0 2px 8px rgba(79,70,229,0.25)" : "none",
                }}
              >
                {tab.label}
              </Motion.button>
            );
          })}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === "vat"     && <Motion.div key="vat"     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><VatTab     period={period} showToast={showToast} /></Motion.div>}
            {activeTab === "paye"    && <Motion.div key="paye"    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PayeTab    period={period} showToast={showToast} /></Motion.div>}
            {activeTab === "wht"     && <Motion.div key="wht"     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><WhtTab     period={period} showToast={showToast} /></Motion.div>}
            {activeTab === "pension" && <Motion.div key="pension" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><StatutoryTab type="Pension" period={period} showToast={showToast} /></Motion.div>}
            {activeTab === "nhf"     && <Motion.div key="nhf"     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><StatutoryTab type="NHF"     period={period} showToast={showToast} /></Motion.div>}
            {activeTab === "nsitf"   && <Motion.div key="nsitf"   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><StatutoryTab type="NSITF"   period={period} showToast={showToast} /></Motion.div>}
          </AnimatePresence>
        </div>
      </div>

      {/* Settings drawer */}
      <AnimatePresence>
        {showSettings && <TaxSettingsDrawer onClose={() => setShowSettings(false)} showToast={showToast} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </Motion.div>
  );
}