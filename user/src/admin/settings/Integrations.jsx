import { motion } from "framer-motion";
import C from "../../styles/colors";
import { SETTINGS_MOCK } from "./SettingsMockData";


export default function Integrations() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl mb-8">Integrations</h2>
      {SETTINGS_MOCK.integrations.map((int, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -2 }}
          className="rounded-2xl border p-6 flex justify-between items-center"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <div>
            <p className="font-semibold">{int.name}</p>
            <p className="text-xs text-slate-500">
              Last synced: {int.lastSync || "Never"}
            </p>
          </div>
          <motion.button
            className={`px-6 py-2.5 rounded-full text-sm font-medium ${int.status === "Connected" ? "bg-emerald-100 text-emerald-700" : "bg-primary text-white"}`}
          >
            {int.status === "Connected" ? "Disconnect" : "Connect"}
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}
