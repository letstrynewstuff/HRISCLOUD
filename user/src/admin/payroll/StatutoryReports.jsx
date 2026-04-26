// src/admin/payroll/StatutoryReports.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Download } from "lucide-react";
import { C } from "../employeemanagement/sharedData";
import API from "../../api/axios";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const now = new Date();

const REPORTS = [
  {
    key: "paye",
    title: "PAYE Schedule (LIRS/FIRS)",
    desc: "Monthly income tax remittance report for FIRS/state IRS submission.",
  },
  {
    key: "pension",
    title: "Pension Contribution Schedule",
    desc: "PENCOM/PFA employee and employer pension remittance.",
  },
  {
    key: "nhf",
    title: "NHF Schedule",
    desc: "National Housing Fund monthly remittance to FMBN.",
  },
];

export default function StatutoryReports() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const handleGenerate = async (reportKey) => {
    setLoading((p) => ({ ...p, [reportKey]: true }));
    setError(null);
    try {
      const res = await API.get(`/reports/statutory`, {
        params: { type: reportKey, month, year },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportKey}-${year}-${String(month).padStart(2, "0")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(`Failed to generate ${reportKey} report.`);
    } finally {
      setLoading((p) => ({ ...p, [reportKey]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div
        className="flex items-center gap-3 flex-wrap p-5 rounded-2xl"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <p className="text-sm font-semibold" style={{ color: C.textPrimary }}>
          Report Period
        </p>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
          style={{
            background: C.surfaceAlt,
            border: `1.5px solid ${C.border}`,
            color: C.textPrimary,
          }}
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
          style={{
            background: C.surfaceAlt,
            border: `1.5px solid ${C.border}`,
            color: C.textPrimary,
          }}
        >
          {[year - 1, year].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <p className="text-xs" style={{ color: C.textMuted }}>
          Reports are generated from finalised payroll runs.
        </p>
      </div>

      {error && (
        <p
          className="text-xs p-3 rounded-xl"
          style={{ background: C.dangerLight, color: C.danger }}
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {REPORTS.map((r) => (
          <motion.div
            key={r.key}
            whileHover={{ y: -3 }}
            className="rounded-2xl p-7 border"
            style={{ background: C.surface, borderColor: C.border }}
          >
            <h3
              className="font-semibold text-base mb-2"
              style={{ color: C.textPrimary }}
            >
              {r.title}
            </h3>
            <p className="text-xs mb-6" style={{ color: C.textSecondary }}>
              {r.desc}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGenerate(r.key)}
              disabled={loading[r.key]}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white"
              style={{
                background: C.primary,
                border: "none",
                cursor: loading[r.key] ? "not-allowed" : "pointer",
              }}
            >
              {loading[r.key] ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Download size={13} />
                  Generate CSV
                </>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
