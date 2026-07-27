// src/components/timesheets/StatusBadge.jsx
import C from "../../styles/colors";

export default function StatusBadge({ status, size = "sm" }) {
  const config = {
    Draft: { bg: C.bgMid, color: C.textSecondary, label: "Draft" },
    Submitted: { bg: C.primaryLight, color: C.accent, label: "Submitted" },
    Approved: { bg: C.successLight, color: "#047857", label: "Approved" },
    Rejected: { bg: C.dangerLight, color: "#B91C1C", label: "Rejected" },
  };

  const c = config[status] ?? config.Draft;
  const px = size === "xs" ? "6px 10px" : "4px 12px";
  const fs = size === "xs" ? "11px" : "12px";

  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        padding: px,
        borderRadius: 20,
        fontSize: fs,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {c.label}
    </span>
  );
}
