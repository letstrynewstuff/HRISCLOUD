import { useState } from "react";
import { motion } from "framer-motion";
import { SETTINGS_MOCK } from "./SettingsMockData";

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

export default function PayGroupSettings() {
  const [payGroup, setPayGroup] = useState(SETTINGS_MOCK.payGroup);

  const handleSave = () => {
    alert("Pay Group settings saved successfully!");
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-8">Pay Group Settings</h2>

      <div className="space-y-8">
        <div>
          <label className="block text-xs font-semibold mb-2">
            Pay Frequency
          </label>
          <div className="flex gap-3">
            {["Monthly", "Bi-monthly"].map((freq) => (
              <button
                key={freq}
                onClick={() => setPayGroup({ ...payGroup, frequency: freq })}
                className={`flex-1 py-3 rounded-2xl text-sm font-medium ${payGroup.frequency === freq ? "bg-primary text-white" : "border"}`}
                style={{ borderColor: C.border }}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2">Pay Day</label>
          <select
            value={payGroup.payDay}
            onChange={(e) =>
              setPayGroup({ ...payGroup, payDay: e.target.value })
            }
            className="w-full px-4 py-3 rounded-2xl"
            style={{
              background: C.surfaceAlt,
              border: `1.5px solid ${C.border}`,
            }}
          >
            <option>25th</option>
            <option>28th</option>
            <option>Last working day</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-2">
            Salary Components
          </label>
          <div className="grid grid-cols-2 gap-3">
            {payGroup.components.map((comp, i) => (
              <div
                key={i}
                className="px-4 py-3 rounded-2xl border flex items-center justify-between"
                style={{ borderColor: C.primaryLight }}
              >
                <span>{comp}</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-primary"
                />
              </div>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl text-white font-semibold"
          style={{ background: C.primary }}
        >
          Save Pay Group Settings
        </motion.button>
      </div>
    </div>
  );
}
