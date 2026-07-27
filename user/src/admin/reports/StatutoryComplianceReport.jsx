import { motion } from "framer-motion";
import C from "../../styles/colors";



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
          <h3 className="text-lg mb-2">{report.title}</h3>
          <p className="text-sm text-slate-500 mb-6">{report.desc}</p>
          <div className="text-3xl font-bold mb-8">{report.amount}</div>
          <motion.button
            className="w-full py-3 rounded-full text-sm font-semibold"
            style={{ background: C.primary, color: "#fff" }}
          >
            Generate & Export
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}
