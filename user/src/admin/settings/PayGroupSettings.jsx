import { useState } from "react";
import C from "../../styles/colors";
import { motion } from "framer-motion";
import { SETTINGS_MOCK } from "./SettingsMockData";


export default function PayGroupSettings() {
  const [payGroup, setPayGroup] = useState(SETTINGS_MOCK.payGroup);

  const handleSave = () => {
    alert("Pay Group settings saved successfully!");
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl mb-8">Pay Group Settings</h2>

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
                className={`flex-1 py-3 rounded-full text-sm font-medium ${payGroup.frequency === freq ? "bg-primary text-white" : "border"}`}
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
          className="w-full py-4 rounded-full text-white font-semibold"
          style={{ background: C.primary }}
        >
          Save Pay Group Settings
        </motion.button>
      </div>
    </div>
  );
}
