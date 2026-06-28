// src/components/timesheets/StatusBadge.jsx
export default function StatusBadge({ status, size = "sm" }) {
  const config = {
    Draft: { bg: "#F3F4F6", color: "#6B7280", label: "Draft" },
    Submitted: { bg: "#EFF6FF", color: "#3B82F6", label: "Submitted" },
    Approved: { bg: "#D1FAE5", color: "#059669", label: "Approved" },
    Rejected: { bg: "#FEE2E2", color: "#DC2626", label: "Rejected" },
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
