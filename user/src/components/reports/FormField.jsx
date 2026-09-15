// src/components/shared/FormField.jsx
//
// Web replacement for the mobile MobileFormField component.
// Wraps a label + optional "required" marker + hint + error text
// around any input/select/textarea child.

import { C } from "../../admin/employeemanagement/sharedData";
// ^ Adjust path if your shared color palette lives elsewhere.

export default function FormField({ label, required, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: C.textPrimary }}>
        {label} {required && <span style={{ color: C.danger }}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px]" style={{ color: C.textMuted }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-[11px] font-medium" style={{ color: C.danger }}>
          {error}
        </p>
      )}
    </div>
  );
}
