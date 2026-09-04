// src/admin/leavemanagement/leaveTypeUi.js
// Canonical presentation map for leave types, shared by every panel in this folder.
//
// `Icon` is a lucide-react component *reference*, not an element — render it at
// the call site (<Icon size={16} color={color} />) so each panel picks its own
// size and colour. The panels used to store an emoji string here instead, which
// meant the glyph was whatever the user's OS shipped and it could not be sized,
// coloured or aligned with the lucide icons sitting next to it.

import {
  Sun,
  Stethoscope,
  Baby,
  Users,
  HeartHandshake,
  GraduationCap,
  PauseCircle,
  ClipboardList,
} from "lucide-react";

export const LEAVE_TYPES_UI = [
  { name: "Annual Leave", color: "#4F46E5", light: "#EEF2FF", Icon: Sun },
  { name: "Sick Leave", color: "#EF4444", light: "#FEE2E2", Icon: Stethoscope },
  { name: "Maternity Leave", color: "#EC4899", light: "#FDF2F8", Icon: Baby },
  { name: "Paternity Leave", color: "#06B6D4", light: "#ECFEFF", Icon: Users },
  {
    name: "Compassionate Leave",
    color: "#8B5CF6",
    light: "#EDE9FE",
    Icon: HeartHandshake,
  },
  {
    name: "Study Leave",
    color: "#10B981",
    light: "#D1FAE5",
    Icon: GraduationCap,
  },
  {
    name: "Unpaid Leave",
    color: "#F59E0B",
    light: "#FEF3C7",
    Icon: PauseCircle,
  },
];

// Icon shown when a leave type isn't in the table above.
export const FALLBACK_LEAVE_ICON = ClipboardList;

// Four panels each kept a private copy of this table and the keys had drifted:
// "Compassionate", "Compassionate Leave" and "Compassionate leave" all appeared,
// so a request always missed the lookup in at least two of them and silently fell
// back to the default indigo. Normalising case and the optional trailing "Leave"
// makes every spelling resolve to the same entry.
const norm = (s) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+leave$/, "");

const BY_NAME = new Map(LEAVE_TYPES_UI.map((t) => [norm(t.name), t]));

/** Returns the UI entry for a leave type, or null if it isn't a known type. */
export const getLeaveTypeUi = (name) => BY_NAME.get(norm(name)) ?? null;
