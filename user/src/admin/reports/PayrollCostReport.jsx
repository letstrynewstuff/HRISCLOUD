import { motion } from "framer-motion";
import C from "../../styles/colors";
import { REPORTS_MOCK } from "./ReportsMockData";



export default function PayrollCostReport() {
  const data = REPORTS_MOCK.payroll;

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border p-6"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <h3 className="mb-6">Monthly Payroll Trend</h3>
        <div className="h-80 flex items-end gap-4">
          {data.monthlyTrend.map((m, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end items-center gap-2"
            >
              <div className="text-xs text-slate-500">
                ₦{(m.gross / 1000000).toFixed(1)}M
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(m.gross / 130000000) * 100}%` }}
                className="w-full bg-primary rounded-t"
              />
              <div className="text-xs mt-2">{m.month}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="rounded-2xl p-6 border text-center"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <p className="text-sm text-slate-500">PAYE Paid</p>
          <p className="text-4xl font-bold mt-3" style={{ color: C.danger }}>
            ₦{(data.taxPaid / 1000000).toFixed(1)}M
          </p>
        </div>
        <div
          className="rounded-2xl p-6 border text-center"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <p className="text-sm text-slate-500">Pension Contributions</p>
          <p className="text-4xl font-bold mt-3" style={{ color: C.success }}>
            ₦{(data.pensionPaid / 1000000).toFixed(1)}M
          </p>
        </div>
        <div
          className="rounded-2xl p-6 border text-center"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <p className="text-sm text-slate-500">Net Pay This Month</p>
          <p className="text-4xl font-bold mt-3">
            ₦
            {(
              data.monthlyTrend[data.monthlyTrend.length - 1].net / 1000000
            ).toFixed(1)}
            M
          </p>
        </div>
      </div>
    </div>
  );
}
