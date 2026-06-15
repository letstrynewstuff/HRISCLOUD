

// src/admin/accounting/ChartOfAccounts.jsx
// Sub-page rendered inside AccountingPage — mirrors AttendanceLog structure.

import { useState, useEffect, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, X, RefreshCw, ChevronDown, ChevronRight,
  CheckCircle2, AlertCircle,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import API from "../../api/axios";
import Loader from "../../components/Loader";

// ── API ───────────────────────────────────────────────────────
const accountingApi = {
  listAccounts:   ()         => API.get("/accounting/accounts").then((r) => r.data),
  createAccount:  (payload)  => API.post("/accounting/accounts", payload).then((r) => r.data),
  updateAccount:  (id, data) => API.put(`/accounting/accounts/${id}`, data).then((r) => r.data),
  toggleAccount:  (id, val)  => API.patch(`/accounting/accounts/${id}/status`, { isActive: val }).then((r) => r.data),
};

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Income", "Expense"];
const TYPE_COLORS = {
  Asset:     { bg: "#EEF2FF", color: "#4F46E5" },
  Liability: { bg: "#FEE2E2", color: "#EF4444" },
  Equity:    { bg: "#D1FAE5", color: "#10B981" },
  Income:    { bg: "#ECFEFF", color: "#06B6D4" },
  Expense:   { bg: "#FEF3C7", color: "#F59E0B" },
};

const EMPTY_FORM = { accountCode: "", accountName: "", accountType: "Asset", parentAccountId: "" };

const fmt = (kobo) =>
  kobo != null ? `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}` : "₦0.00";

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, type, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <Motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl"
      style={{ background: C.navy ?? "#1E1B4B", color: "#fff", minWidth: 300 }}
    >
      {type === "error" ? <AlertCircle size={15} color="#EF4444" /> : <CheckCircle2 size={15} color="#10B981" />}
      <span className="text-sm font-medium">{msg}</span>
      <button onClick={onDismiss} className="ml-auto"><X size={13} color="rgba(255,255,255,0.5)" /></button>
    </Motion.div>
  );
}

export default function ChartOfAccounts({ searchQuery }) {
  const [accounts,    setAccounts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [formError,   setFormError]   = useState("");
  const [toast,       setToast]       = useState(null);
  const [collapsed,   setCollapsed]   = useState({});
  const [filterType,  setFilterType]  = useState("all");

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await accountingApi.listAccounts();
      setAccounts(res.accounts ?? res.data ?? []);
    } catch {
      setError("Failed to load chart of accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = accounts;
    if (filterType !== "all") list = list.filter((a) => a.accountType === filterType || a.account_type === filterType);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          (a.accountName ?? a.account_name ?? "").toLowerCase().includes(q) ||
          (a.accountCode ?? a.account_code ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [accounts, filterType, searchQuery]);

  // Group by type
  const grouped = useMemo(() => {
    const g = {};
    ACCOUNT_TYPES.forEach((t) => { g[t] = []; });
    filtered.forEach((a) => {
      const t = a.accountType ?? a.account_type ?? "Asset";
      if (g[t]) g[t].push(a);
    });
    return g;
  }, [filtered]);

  const openCreate = () => {
    setEditing(null); setForm(EMPTY_FORM); setFormError(""); setShowModal(true);
  };
  const openEdit = (acc) => {
    setEditing(acc);
    setForm({
      accountCode: acc.accountCode ?? acc.account_code ?? "",
      accountName: acc.accountName ?? acc.account_name ?? "",
      accountType: acc.accountType ?? acc.account_type ?? "Asset",
      parentAccountId: acc.parentAccountId ?? acc.parent_account_id ?? "",
    });
    setFormError(""); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.accountCode.trim() || !form.accountName.trim()) {
      setFormError("Account code and name are required."); return;
    }
    setSaving(true); setFormError("");
    try {
      if (editing) {
        await accountingApi.updateAccount(editing.id, form);
        showToast("Account updated.");
      } else {
        await accountingApi.createAccount(form);
        showToast("Account created.");
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setFormError(err?.response?.data?.message ?? "Failed to save account.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (acc) => {
    try {
      const current = acc.isActive ?? acc.is_active ?? true;
      await accountingApi.toggleAccount(acc.id, !current);
      showToast(`Account ${current ? "deactivated" : "activated"}.`);
      await load();
    } catch {
      showToast("Failed to update account status.", "error");
    }
  };

  const toggleSection = (type) =>
    setCollapsed((p) => ({ ...p, [type]: !p[type] }));

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* ── Toolbar ── */}
      <div
        className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: C.textMuted }}>Type:</span>
          {["all", ...ACCOUNT_TYPES].map((t) => (
            <Motion.button
              key={t}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterType(t)}
              className="px-3 py-1 text-xs rounded-lg font-medium"
              style={{
                background: filterType === t ? C.primary : C.surfaceAlt,
                color: filterType === t ? "#fff" : C.textSecondary,
              }}
            >
              {t === "all" ? "All" : t}
            </Motion.button>
          ))}
        </div>
        <div className="ml-auto">
          <Motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
            style={{ background: C.primary, color: "#fff" }}
          >
            <Plus size={15} /> Add Account
          </Motion.button>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden min-h-[420px]"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        {loading ? (
          <div className="flex items-center justify-center min-h-[420px]"><Loader /></div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[420px] text-sm" style={{ color: C.danger }}>{error}</div>
        ) : (
          <div className="overflow-x-auto">
            {ACCOUNT_TYPES.map((type) => {
              const rows = grouped[type] ?? [];
              if (rows.length === 0 && filterType !== "all" && filterType !== type) return null;
              const tc = TYPE_COLORS[type] ?? { bg: C.primaryLight, color: C.primary };
              const isCollapsed = collapsed[type];

              return (
                <div key={type}>
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(type)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left"
                    style={{
                      background: tc.bg,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {isCollapsed
                      ? <ChevronRight size={14} color={tc.color} />
                      : <ChevronDown  size={14} color={tc.color} />}
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: tc.color }}>
                      {type}s — {rows.length} account{rows.length !== 1 ? "s" : ""}
                    </span>
                  </button>

                  {/* Rows */}
                  {!isCollapsed && rows.length > 0 && (
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: C.surfaceAlt, borderBottom: `1px solid ${C.border}` }}>
                          {["Code", "Account Name", "Type", "Balance", "Status", "Actions"].map((h) => (
                            <th key={h} className="px-5 py-2.5 text-left text-xs font-bold uppercase tracking-wide" style={{ color: C.textMuted }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((acc, i) => {
                          const isActive = acc.isActive ?? acc.is_active ?? true;
                          const isDefault = acc.isDefault ?? acc.is_default ?? false;
                          return (
                            <Motion.tr
                              key={acc.id}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                              className="border-b"
                              style={{ borderColor: C.border }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <td className="px-5 py-3 font-mono text-sm font-semibold" style={{ color: C.primary }}>
                                {acc.accountCode ?? acc.account_code}
                              </td>
                              <td className="px-5 py-3">
                                <div>
                                  <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
                                    {acc.accountName ?? acc.account_name}
                                  </p>
                                  {isDefault && (
                                    <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>Default</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: tc.bg, color: tc.color }}>
                                  {acc.accountType ?? acc.account_type}
                                </span>
                              </td>
                              <td className="px-5 py-3 font-semibold text-sm" style={{ color: C.textPrimary }}>
                                {fmt(acc.balance)}
                              </td>
                              <td className="px-5 py-3">
                                <span
                                  className="text-xs px-2.5 py-1 rounded-full font-semibold"
                                  style={{
                                    background: isActive ? "#D1FAE5" : "#FEE2E2",
                                    color:      isActive ? "#10B981" : "#EF4444",
                                  }}
                                >
                                  {isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <Motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => openEdit(acc)}
                                    className="p-1.5 rounded-lg"
                                    style={{ background: C.primaryLight, color: C.primary }}
                                    title="Edit"
                                  >
                                    <Edit2 size={13} />
                                  </Motion.button>
                                  {!isDefault && (
                                    <Motion.button
                                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                      onClick={() => handleToggle(acc)}
                                      className="px-2.5 py-1 text-xs font-semibold rounded-lg"
                                      style={{
                                        background: isActive ? "#FEE2E2" : "#D1FAE5",
                                        color:      isActive ? "#EF4444" : "#10B981",
                                      }}
                                    >
                                      {isActive ? "Deactivate" : "Activate"}
                                    </Motion.button>
                                  )}
                                </div>
                              </td>
                            </Motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {!isCollapsed && rows.length === 0 && (
                    <div className="px-5 py-4 text-xs" style={{ color: C.textMuted, borderBottom: `1px solid ${C.border}` }}>
                      No {type.toLowerCase()} accounts found.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal — mirrors ShiftManagement modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl p-6 space-y-4"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg" style={{ color: C.textPrimary }}>
                  {editing ? "Edit Account" : "New Account"}
                </h3>
                <button onClick={() => setShowModal(false)}><X size={18} color={C.textMuted} /></button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                      Account Code <span style={{ color: C.danger }}>*</span>
                    </label>
                    <input
                      value={form.accountCode}
                      onChange={(e) => setForm((f) => ({ ...f, accountCode: e.target.value }))}
                      placeholder="e.g. 1001"
                      className="w-full p-2.5 rounded-xl outline-none text-sm font-mono"
                      style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                      Account Type <span style={{ color: C.danger }}>*</span>
                    </label>
                    <select
                      value={form.accountType}
                      onChange={(e) => setForm((f) => ({ ...f, accountType: e.target.value }))}
                      className="w-full p-2.5 rounded-xl outline-none text-sm appearance-none"
                      style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
                    >
                      {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                    Account Name <span style={{ color: C.danger }}>*</span>
                  </label>
                  <input
                    value={form.accountName}
                    onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
                    placeholder="e.g. Cash and Cash Equivalents"
                    className="w-full p-2.5 rounded-xl outline-none text-sm"
                    style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: C.textPrimary }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: C.textPrimary }}>
                    Parent Account (optional)
                  </label>
                  <select
                    value={form.parentAccountId}
                    onChange={(e) => setForm((f) => ({ ...f, parentAccountId: e.target.value }))}
                    className="w-full p-2.5 rounded-xl outline-none text-sm appearance-none"
                    style={{ background: C.surfaceAlt, border: `1.5px solid ${C.border}`, color: form.parentAccountId ? C.textPrimary : C.textMuted }}
                  >
                    <option value="">None (top-level)</option>
                    {accounts
                      .filter((a) => (a.accountType ?? a.account_type) === form.accountType && (!editing || a.id !== editing.id))
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.accountCode ?? a.account_code} — {a.accountName ?? a.account_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-xs font-medium" style={{ color: C.danger }}>{formError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: C.surfaceAlt, color: C.textSecondary }}
                >
                  Cancel
                </button>
                <Motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
                >
                  {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving…</> : editing ? "Update Account" : "Create Account"}
                </Motion.button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </Motion.div>
  );
}