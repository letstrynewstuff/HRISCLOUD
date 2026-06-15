// src/admin/accounting/BankReconciliation.jsx
//
// Manual reconciliation flow:
//   1. Pick account TYPE (Asset / Liability / Equity / Income / Expense)
//   2. Pick a specific GL account within that type
//   3. View all POSTED journal entry lines for that account
//   4. Tick checkboxes to confirm each line against your bank/physical statement
//   5. Save confirmations — backend marks lines as reconciled
//
// Wired to accountingApi.recon.{getAccountsByType, getLines, confirm, unconfirm, getSummary}

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  X,
  RefreshCw,
  Check,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileText,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Save,
  Undo2,
  Circle,
  CheckSquare,
  Square,
} from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import {
  accountingApi,
  formatNaira,
  COA_TYPE_COLORS,
} from "../../api/service/accountingApi";
import Loader from "../../components/Loader";

const ACCOUNT_TYPES = ["Asset", "Liability", "Equity", "Income", "Expense"];

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

// ── Step indicator ────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Account Type", "Select Account", "Confirm Transactions"];
  return (
    <div className="flex items-center gap-2 mb-1">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: active
                  ? C.primary
                  : done
                    ? "#D1FAE5"
                    : C.surfaceAlt,
                color: active ? "#fff" : done ? "#065F46" : C.textMuted,
              }}
            >
              {done ? <CheckCircle2 size={12} /> : <Circle size={12} />}
              {label}
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={14} color={C.textMuted} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 1 — Account Type Picker
// ═══════════════════════════════════════════════════════════════
function TypePicker({ onSelect }) {
  const ICONS = {
    Asset: Wallet,
    Liability: TrendingDown,
    Equity: TrendingUp,
    Income: TrendingUp,
    Expense: TrendingDown,
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div>
        <h3 className="font-bold text-base" style={{ color: C.textPrimary }}>
          Select an Account Type
        </h3>
        <p className="text-sm mt-1" style={{ color: C.textMuted }}>
          Choose the category of account you want to reconcile.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {ACCOUNT_TYPES.map((type) => {
          const tc = COA_TYPE_COLORS[type] ?? {
            bg: C.surfaceAlt,
            color: C.textMuted,
          };
          const Icon = ICONS[type] ?? Wallet;
          return (
            <Motion.button
              key={type}
              whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(type)}
              className="rounded-2xl p-5 text-left flex flex-col gap-3"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: tc.bg }}
              >
                <Icon size={18} color={tc.color} />
              </div>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: C.textPrimary }}
                >
                  {type}
                </p>
                <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
                  Reconcile {type.toLowerCase()} accounts
                </p>
              </div>
              <ChevronRight
                size={14}
                color={C.textMuted}
                className="self-end"
              />
            </Motion.button>
          );
        })}
      </div>
    </Motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 2 — Account Picker (within a type)
// ═══════════════════════════════════════════════════════════════
function AccountPicker({ type, onSelect, onBack, showToast }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(
    async (q) => {
      setLoading(true);
      try {
        const res = await accountingApi.recon.getAccountsByType(
          type,
          q || undefined,
        );
        setAccounts(res.data ?? res.accounts ?? []);
      } catch {
        showToast("Failed to load accounts", "error");
      } finally {
        setLoading(false);
      }
    },
    [type, showToast],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search, load]);

  const tc = COA_TYPE_COLORS[type] ?? { bg: C.surfaceAlt, color: C.textMuted };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <ChevronLeft size={16} color={C.textSecondary} />
          </button>
          <div>
            <h3
              className="font-bold text-base"
              style={{ color: C.textPrimary }}
            >
              Select {type} Account
            </h3>
            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
              Choose the specific ledger account to reconcile.
            </p>
          </div>
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: tc.bg, color: tc.color }}
        >
          {type}
        </span>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <Search size={14} color={C.textMuted} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${type.toLowerCase()} accounts…`}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: C.textPrimary }}
        />
      </div>

      {/* Account list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${C.border}` }}
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : accounts.length === 0 ? (
          <div
            className="flex flex-col items-center py-12 gap-2"
            style={{ color: C.textMuted }}
          >
            <FileText size={28} />
            <p className="text-sm font-medium">
              No {type.toLowerCase()} accounts found
            </p>
          </div>
        ) : (
          accounts.map((acc, i) => (
            <Motion.button
              key={acc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => onSelect(acc)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
              style={{
                borderBottom: `1px solid ${C.border}`,
                background: "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = C.surfaceAlt)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs"
                style={{ background: tc.bg, color: tc.color }}
              >
                {(acc.accountCode ?? acc.account_code ?? "—")
                  .toString()
                  .slice(0, 4)}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold truncate"
                  style={{ color: C.textPrimary }}
                >
                  {acc.accountName ?? acc.account_name}
                </p>
                <p
                  className="text-xs font-mono mt-0.5"
                  style={{ color: C.textMuted }}
                >
                  Code: {acc.accountCode ?? acc.account_code}
                </p>
              </div>
              {acc.balance != null && (
                <p
                  className="text-sm font-bold shrink-0"
                  style={{ color: tc.color }}
                >
                  {formatNaira(acc.balance)}
                </p>
              )}
              <ChevronRight
                size={16}
                color={C.textMuted}
                className="shrink-0"
              />
            </Motion.button>
          ))
        )}
      </div>
    </Motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 3 — Confirm Transactions
// ═══════════════════════════════════════════════════════════════
function ConfirmTransactions({ account, type, onBack, showToast }) {
  const [lines, setLines] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState({}); // { lineId: true/false }
  const [filterDate, setFilterDate] = useState({ from: "", to: "" });
  const [filterStatus, setFilterStatus] = useState("all"); // all | confirmed | unconfirmed
  const [note, setNote] = useState("");

  const tc = COA_TYPE_COLORS[type] ?? { bg: C.surfaceAlt, color: C.textMuted };
  const accName = account.accountName ?? account.account_name;
  const accCode = account.accountCode ?? account.account_code;

  // ── Load lines + summary ──────────────────────────────────

  //   const load = useCallback(async () => {
  //     setLoading(true);
  //     try {
  //       const params = {};
  //       if (filterDate.from) params.from = filterDate.from;
  //       if (filterDate.to) params.to = filterDate.to;

  //       // Use the GL endpoint that already works, same as GeneralLedger.jsx
  //       const res = await accountingApi.getGeneralLedger(account.id, params);
  //       const data = res.data || res;

  //       // Map GL transactions to the shape ConfirmTransactions expects
  //       const fetchedLines = (data.transactions || []).map((t) => ({
  //         id: t.line_id || t.id,
  //         accountId: account.id,
  //         journalEntryId: t.journal_entry_id,
  //         debitAmount: Number(t.debit_amount || 0),
  //         creditAmount: Number(t.credit_amount || 0),
  //         reconciled: !!(t.is_reconciled || t.reconciled),
  //         isReconciled: !!(t.is_reconciled || t.reconciled),
  //         entryDate: t.entry_date,
  //         description:
  //           t.line_description || t.entry_description || t.description || "—",
  //         referenceNumber: t.reference_number,
  //       }));
  //  const filtered =
  //         filterStatus === "all"
  //           ? fetchedLines
  //           : fetchedLines.filter((l) =>
  //               filterStatus === "confirmed" ? l.reconciled : !l.reconciled,
  //             );

  //       setLines(filtered);

  //       // Compute summary client-side from the full unfiltered set
  //       const totalDebit = fetchedLines.reduce((s, l) => s + l.debitAmount, 0);
  //       const totalCredit = fetchedLines.reduce((s, l) => s + l.creditAmount, 0);
  //       setSummary({
  //         totalLines: fetchedLines.length,
  //         confirmedCount: fetchedLines.filter((l) => l.reconciled).length,
  //         unconfirmedCount: fetchedLines.filter((l) => !l.reconciled).length,
  //         runningBalance: data.closing_balance ?? totalDebit - totalCredit,
  //       });

  //       // 🟢 FIX: Map from fetchedLines so hidden lines don't get cleared out
  //       const initChecked = {};
  //       fetchedLines.forEach((l) => {
  //         initChecked[l.id] = l.reconciled;
  //       });
  //       setChecked(initChecked);
  //     } catch (err) {
  //       console.error("Reconciliation fetch error:", err);
  //       showToast("Failed to load transactions", "error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }, [account.id, filterDate, filterStatus, showToast]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate.from) params.from = filterDate.from;
      if (filterDate.to) params.to = filterDate.to;

      // 1. Fetch GL data and your raw verification tracking data simultaneously
      const [glRes, rawReconTable] = await Promise.all([
        accountingApi.getGeneralLedger(account.id, params),
        // Use your standalone lookup/reconciliation lines endpoint
        accountingApi.recon.getLines(account.id, params),
      ]);

      const glData = glRes.data || glRes;

      // 2. Create a fast lookup Map of your confirmed database statuses
      // Using journal_entry_line_id (or line.id depending on your API structure)
      const dbReconciledMap = new Map(
        (Array.isArray(rawReconTable) ? rawReconTable : []).map((l) => [
          l.journalEntryLineId || l.id,
          !!l.reconciled,
        ]),
      );

      // 3. Map GL transactions, overriding reconciled flag using your status map
      const fetchedLines = (glData.transactions || []).map((t) => {
        const lineId = t.line_id || t.id;
        // If it exists in our lookup tracking table as true, mark it true!
        const realReconciledStatus = dbReconciledMap.has(lineId)
          ? dbReconciledMap.get(lineId)
          : !!(t.is_reconciled || t.reconciled);

        return {
          id: lineId,
          accountId: account.id,
          journalEntryId: t.journal_entry_id,
          debitAmount: Number(t.debit_amount || 0),
          creditAmount: Number(t.credit_amount || 0),
          reconciled: realReconciledStatus,
          isReconciled: realReconciledStatus,
          entryDate: t.entry_date,
          description:
            t.line_description || t.entry_description || t.description || "—",
          referenceNumber: t.reference_number,
        };
      });

      // 4. Run client-side filtering safely
      const filtered =
        filterStatus === "all"
          ? fetchedLines
          : fetchedLines.filter((l) =>
              filterStatus === "confirmed" ? l.reconciled : !l.reconciled,
            );

      setLines(filtered);

      // 5. Compute accurate metrics locally
      const totalDebit = fetchedLines.reduce((s, l) => s + l.debitAmount, 0);
      const totalCredit = fetchedLines.reduce((s, l) => s + l.creditAmount, 0);

      setSummary({
        totalLines: fetchedLines.length,
        confirmedCount: fetchedLines.filter((l) => l.reconciled).length,
        unconfirmedCount: fetchedLines.filter((l) => !l.reconciled).length,
        runningBalance: glData.closing_balance || totalDebit - totalCredit,
      });

      // 6. Keep checkboxes aligned using the full array
      const initChecked = {};
      fetchedLines.forEach((l) => {
        initChecked[l.id] = l.reconciled;
      });
      setChecked(initChecked);
    } catch (err) {
      console.error("Reconciliation fetch error:", err);
      showToast("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  }, [account.id, filterDate, filterStatus, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Helpers ─────────────────────────────────────────────────
  const toggleLine = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));

  const toggleAll = () => {
    const allChecked = lines.every((l) => checked[l.id]);
    const next = {};
    lines.forEach((l) => (next[l.id] = !allChecked));
    setChecked((p) => ({ ...p, ...next }));
  };

  // Lines whose checked state differs from their original reconciled flag
  const { toConfirm, toUnconfirm } = useMemo(() => {
    const tc_ = [];
    const tu_ = [];
    lines.forEach((l) => {
      const wasReconciled = !!(
        l.isReconciled ??
        l.is_reconciled ??
        l.reconciled
      );
      const isChecked = !!checked[l.id];
      if (isChecked && !wasReconciled) tc_.push(l.id);
      if (!isChecked && wasReconciled) tu_.push(l.id);
    });
    return { toConfirm: tc_, toUnconfirm: tu_ };
  }, [lines, checked]);

  const hasChanges = toConfirm.length > 0 || toUnconfirm.length > 0;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  // ── Save ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      if (toConfirm.length > 0) {
        await accountingApi.recon.confirm(
          account.id,
          toConfirm,
          note || undefined,
        );
      }
      if (toUnconfirm.length > 0) {
        await accountingApi.recon.unconfirm(account.id, toUnconfirm);
      }
      showToast(
        `Saved: ${toConfirm.length} confirmed, ${toUnconfirm.length} unconfirmed`,
      );
      setNote("");
      await load();
    } catch (err) {
      showToast(
        err?.response?.data?.message ?? "Failed to save reconciliation",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const allChecked = lines.length > 0 && lines.every((l) => checked[l.id]);
  const someChecked = lines.some((l) => checked[l.id]) && !allChecked;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
            }}
          >
            <ChevronLeft size={16} color={C.textSecondary} />
          </button>
          <div>
            <h3
              className="font-bold text-base flex items-center gap-2"
              style={{ color: C.textPrimary }}
            >
              {accName}
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: tc.bg, color: tc.color }}
              >
                {accCode}
              </span>
            </h3>
            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
              Confirm posted transactions against your records
            </p>
          </div>
        </div>
        <Motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl"
          style={{
            background: C.surfaceAlt,
            color: C.textSecondary,
            border: `1px solid ${C.border}`,
          }}
        >
          <RefreshCw size={12} /> Refresh
        </Motion.button>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Lines",
              value: summary.totalLines ?? summary.total_lines ?? lines.length,
              color: C.primary,
            },
            {
              label: "Confirmed",
              value:
                summary.confirmedCount ??
                summary.confirmed_count ??
                lines.filter((l) => checked[l.id]).length,
              color: "#10B981",
            },
            {
              label: "Unconfirmed",
              value:
                summary.unconfirmedCount ??
                summary.unconfirmed_count ??
                lines.length - lines.filter((l) => checked[l.id]).length,
              color: "#F59E0B",
            },
            {
              label: "Running Balance",
              value: formatNaira(
                summary.runningBalance ??
                  summary.running_balance ??
                  account.balance ??
                  0,
              ),
              color: tc.color,
              isMoney: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-4"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: C.textMuted }}
              >
                {s.label}
              </p>
              <p
                className={
                  s.isMoney ? "text-lg font-bold" : "text-2xl font-bold"
                }
                style={{ color: s.color, fontFamily: "Sora,sans-serif" }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div
        className="rounded-2xl p-4 flex flex-wrap items-center gap-3"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-2">
          <Calendar size={14} color={C.textMuted} />
          <input
            type="date"
            value={filterDate.from}
            onChange={(e) =>
              setFilterDate((p) => ({ ...p, from: e.target.value }))
            }
            className="text-xs rounded-lg px-2 py-1.5 outline-none"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
            }}
          />
          <span className="text-xs" style={{ color: C.textMuted }}>
            to
          </span>
          <input
            type="date"
            value={filterDate.to}
            onChange={(e) =>
              setFilterDate((p) => ({ ...p, to: e.target.value }))
            }
            className="text-xs rounded-lg px-2 py-1.5 outline-none"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              color: C.textPrimary,
            }}
          />
          {(filterDate.from || filterDate.to) && (
            <button
              onClick={() => setFilterDate({ from: "", to: "" })}
              className="text-xs"
              style={{ color: C.primary }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <Filter size={13} color={C.textMuted} />
          {[
            { id: "all", label: "All" },
            { id: "unconfirmed", label: "Unconfirmed" },
            { id: "confirmed", label: "Confirmed" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg"
              style={{
                background: filterStatus === f.id ? C.primary : C.surfaceAlt,
                color: filterStatus === f.id ? "#fff" : C.textSecondary,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${C.border}` }}
      >
        {/* List header */}
        <div
          className="flex items-center gap-4 px-5 py-3"
          style={{
            background: C.surfaceAlt,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <button onClick={toggleAll} className="shrink-0">
            {allChecked ? (
              <CheckSquare size={18} color={C.primary} />
            ) : someChecked ? (
              <div
                className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center"
                style={{ background: C.primary }}
              >
                <div className="w-2 h-0.5 bg-white rounded-full" />
              </div>
            ) : (
              <Square size={18} color={C.textMuted} />
            )}
          </button>
          <p
            className="text-xs font-bold uppercase tracking-wide flex-1"
            style={{ color: C.textMuted }}
          >
            Transaction
          </p>
          <p
            className="text-xs font-bold uppercase tracking-wide w-28 text-right"
            style={{ color: C.textMuted }}
          >
            Debit
          </p>
          <p
            className="text-xs font-bold uppercase tracking-wide w-28 text-right"
            style={{ color: C.textMuted }}
          >
            Credit
          </p>
          <p
            className="text-xs font-bold uppercase tracking-wide w-16 text-center"
            style={{ color: C.textMuted }}
          >
            Status
          </p>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : lines.length === 0 ? (
          <div
            className="flex flex-col items-center py-12 gap-2"
            style={{ color: C.textMuted }}
          >
            <FileText size={28} />
            <p className="text-sm font-medium">No posted transactions found</p>
            <p className="text-xs">Try adjusting your date filters</p>
          </div>
        ) : (
          lines.map((line, i) => {
            const isChecked = !!checked[line.id];
            const wasReconciled = !!(
              line.isReconciled ??
              line.is_reconciled ??
              line.reconciled
            );
            const debit = line.debitAmount ?? line.debit_amount ?? 0;
            const credit = line.creditAmount ?? line.credit_amount ?? 0;
            const date =
              line.entryDate ??
              line.entry_date ??
              line.transactionDate ??
              line.transaction_date;
            const desc =
              line.description ??
              line.entryDescription ??
              line.entry_description ??
              "—";
            const ref = line.referenceNumber ?? line.reference_number;
            const isPending = isChecked !== wasReconciled;

            return (
              <Motion.div
                key={line.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015 }}
                onClick={() => toggleLine(line.id)}
                className="flex items-center gap-4 px-5 py-3 cursor-pointer select-none transition-colors"
                style={{
                  borderBottom: `1px solid ${C.border}`,
                  background: isPending
                    ? isChecked
                      ? "#ECFDF5"
                      : "#FEF2F2"
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isPending)
                    e.currentTarget.style.background = C.surfaceAlt;
                }}
                onMouseLeave={(e) => {
                  if (!isPending)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div className="shrink-0">
                  {isChecked ? (
                    <CheckSquare
                      size={18}
                      color={isPending ? "#10B981" : C.primary}
                    />
                  ) : (
                    <Square
                      size={18}
                      color={isPending ? "#EF4444" : C.textMuted}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{ color: C.textPrimary }}
                  >
                    {desc}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: C.textMuted }}
                  >
                    {date
                      ? new Date(date).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                    {ref ? ` · ${ref}` : ""}
                  </p>
                </div>
                <p
                  className="text-sm font-mono font-bold w-28 text-right"
                  style={{ color: debit > 0 ? "#1D4ED8" : C.textMuted }}
                >
                  {debit > 0 ? formatNaira(debit) : "—"}
                </p>
                <p
                  className="text-sm font-mono font-bold w-28 text-right"
                  style={{ color: credit > 0 ? "#059669" : C.textMuted }}
                >
                  {credit > 0 ? formatNaira(credit) : "—"}
                </p>
                <div className="w-16 flex justify-center">
                  {wasReconciled ? (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#D1FAE5", color: "#065F46" }}
                    >
                      Done
                    </span>
                  ) : (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#FEF3C7", color: "#B45309" }}
                    >
                      Pending
                    </span>
                  )}
                </div>
              </Motion.div>
            );
          })
        )}
      </div>

      {/* Sticky save bar */}
      <AnimatePresence>
        {hasChanges && (
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="sticky bottom-4 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-xl"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm font-bold" style={{ color: C.textPrimary }}>
                {toConfirm.length > 0 && `${toConfirm.length} to confirm`}
                {toConfirm.length > 0 && toUnconfirm.length > 0 && " · "}
                {toUnconfirm.length > 0 && `${toUnconfirm.length} to unconfirm`}
              </p>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note (e.g. 'Matched against Jan bank statement')"
                className="w-full text-xs mt-1.5 rounded-lg px-3 py-1.5 outline-none"
                style={{
                  background: C.surfaceAlt,
                  border: `1px solid ${C.border}`,
                  color: C.textPrimary,
                }}
              />
            </div>
            <button
              onClick={() => {
                const reset = {};
                lines.forEach((l) => {
                  reset[l.id] = !!(
                    l.isReconciled ??
                    l.is_reconciled ??
                    l.reconciled
                  );
                });
                setChecked(reset);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl"
              style={{
                background: C.surfaceAlt,
                color: C.textSecondary,
                border: `1px solid ${C.border}`,
              }}
            >
              <Undo2 size={13} /> Reset
            </button>
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl text-white"
              style={{ background: C.primary, opacity: saving ? 0.8 : 1 }}
            >
              {saving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save size={14} /> Save Confirmation
                </>
              )}
            </Motion.button>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function BankReconciliation() {
  const [step, setStep] = useState(1); // 1 = type, 2 = account, 3 = confirm
  const [selectedType, setSelectedType] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback(
    (msg, type = "success") => setToast({ msg, type }),
    [],
  );

  const handleSelectType = (type) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleSelectAccount = (acc) => {
    setSelectedAccount(acc);
    setStep(3);
  };

  const handleBackToType = () => {
    setStep(1);
    setSelectedType(null);
    setSelectedAccount(null);
  };

  const handleBackToAccount = () => {
    setStep(2);
    setSelectedAccount(null);
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <StepBar step={step} />

      <AnimatePresence mode="wait">
        {step === 1 && <TypePicker key="step1" onSelect={handleSelectType} />}
        {step === 2 && (
          <AccountPicker
            key="step2"
            type={selectedType}
            onSelect={handleSelectAccount}
            onBack={handleBackToType}
            showToast={showToast}
          />
        )}
        {step === 3 && (
          <ConfirmTransactions
            key="step3"
            account={selectedAccount}
            type={selectedType}
            onBack={handleBackToAccount}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </Motion.div>
  );
}
