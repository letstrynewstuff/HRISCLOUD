import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Download } from "lucide-react";


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

const availableFields = [
  "Name",
  "Department",
  "Grade",
  "Basic Salary",
  "Attendance Rate",
  "Leave Balance",
  "Performance Score",
  "Join Date",
];

export default function CustomReportBuilder() {
  const [selectedFields, setSelectedFields] = useState([
    "Name",
    "Department",
    "Basic Salary",
  ]);
  const [previewData] = useState([
    {
      Name: "Amara Johnson",
      Department: "Engineering",
      "Basic Salary": "₦1,250,000",
    },
    { Name: "Tunde Bakare", Department: "Product", "Basic Salary": "₦980,000" },
  ]);

  const toggleField = (field) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter((f) => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Field Selector */}
        <div
          className="w-80 rounded-2xl border p-6"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <h3 className="font-semibold mb-4">Select Fields</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableFields.map((field) => (
              <motion.button
                key={field}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleField(field)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm flex justify-between items-center ${selectedFields.includes(field) ? "bg-primary text-white" : "hover:bg-slate-100"}`}
              >
                {field}
                {selectedFields.includes(field) && (
                  <span className="text-xs">✓</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div
          className="flex-1 rounded-2xl border p-6"
          style={{ background: C.surface, borderColor: C.border }}
        >
          <div className="flex justify-between mb-6">
            <h3 className="font-semibold">Report Preview</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold"
              style={{ background: C.primary, color: "#fff" }}
            >
              <Download size={16} /> Export Excel
            </motion.button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: C.surfaceAlt }}>
                  {selectedFields.map((f) => (
                    <th key={f} className="px-4 py-3 text-left font-medium">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b"
                    style={{ borderColor: C.border }}
                  >
                    {selectedFields.map((f) => (
                      <td key={f} className="px-4 py-4">
                        {row[f] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
