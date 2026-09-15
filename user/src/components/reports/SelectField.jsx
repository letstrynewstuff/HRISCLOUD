// src/components/shared/SelectField.jsx
//
// Web replacement for the mobile MobileSelect component.
// A plain styled <select> — simplest reliable cross-browser option;
// swap for a custom listbox later if you want the animated dropdown
// treatment used elsewhere without extra dependencies.

import { C } from "../../admin/employeemanagement/sharedData";
// ^ Adjust path if your shared color palette lives elsewhere.

export default function SelectField({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  error,
  disabled = false,
}) {
  return (
    <select
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none"
      style={{
        background: C.surfaceAlt,
        border: `1.5px solid ${error ? C.danger : value ? C.primary + "66" : C.border}`,
        color: value ? C.textPrimary : C.textMuted,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
