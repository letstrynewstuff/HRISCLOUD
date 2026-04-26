import { motion } from "framer-motion";


const C = {
  bg: "#F0F2F8",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F8FC",
  border: "#E4E7F0",
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  success: "#10B981",
  successLight: "#D1FAE5",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  danger: "#EF4444",
  dangerLight: "#FEE2E2",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
};

export default function StatutoryComplianceReport() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        {
          title: "PAYE Schedule",
          desc: "LIRS / FIRS Monthly Tax Return",
          amount: "₦18.5M",
        },
        {
          title: "Pension Remittance",
          desc: "PENCOM / PFA Contribution Schedule",
          amount: "₦9.8M",
        },
        {
          title: "NHF Schedule",
          desc: "National Housing Fund Report",
          amount: "₦3.1M",
        },
      ].map((report, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -4 }}
          className="rounded-2xl p-8 border"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
          <p className="text-sm text-slate-500 mb-6">{report.desc}</p>
          <div className="text-3xl font-bold mb-8">{report.amount}</div>
          <motion.button
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: C.primary, color: "#fff" }}
          >
            Generate & Export
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}
