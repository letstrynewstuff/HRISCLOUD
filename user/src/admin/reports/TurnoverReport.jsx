import { motion } from "framer-motion";
import C from "../../styles/colors";
import { REPORTS_MOCK } from "./ReportsMockData";



export default function TurnoverReport() {
  const data = REPORTS_MOCK.turnover;

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-8 border text-center"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <p className="text-7xl font-bold text-red-600">{data.rate}%</p>
        <p className="text-xl mt-4">Annual Turnover Rate</p>
        <p className="text-sm text-slate-500 mt-2">
          {data.exits} employees exited this year
        </p>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <h3 className="mb-6">Exits by Reason</h3>
        {data.byReason.map((item, i) => (
          <div
            key={i}
            className="flex justify-between py-4 border-b last:border-0"
            style={{ borderColor: C.border }}
          >
            <span>{item.reason}</span>
            <span className="font-semibold">{item.count}</span>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-slate-500">
        Average tenure before exit:{" "}
        <span className="font-medium text-slate-700">
          {data.avgTenure} years
        </span>
      </div>
    </div>
  );
}
