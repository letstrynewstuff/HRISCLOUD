// src/utils/schedule.js
//
// Shared shift/schedule resolution logic. Extracted out of
// attendance.controller.js so it can also be used by
// attendanceStats.js (streak / attendance-rate calculations) without
// duplicating the same queries and day-math in two places.
//
// Nothing here changes behavior — this is the exact same logic
// clockIn/clockOut already used, just made reusable. See the matching
// diff in attendance.controller.js for how to switch it over to these
// imports.

import { db } from "../config/db.js";

export const DAY_CODES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** 'Sun'..'Sat' for a given Date, in the server's local time. */
export function todayDayCode(date = new Date()) {
  return DAY_CODES[date.getDay()];
}

/** minutes-from-midnight → 'HH:MM' for user-facing messages */
export function minutesToHHMM(mins) {
  const h = Math.floor((((mins % 1440) + 1440) % 1440) / 60);
  const m = ((mins % 60) + 60) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Parse 'HH:MM' → total minutes from midnight */
export function parseTimeToMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

/** The shift assigned to this employee (employees.shift_id), or null. */
export async function resolveEmployeeShift(employeeId) {
  const result = await db.query(
    `SELECT s.*
     FROM employees e
     JOIN shifts s ON s.id = e.shift_id
     WHERE e.id = $1 AND s.is_active IS NOT FALSE`,
    [employeeId],
  );
  return result.rows[0] ?? null;
}

/**
 * Resolves everything needed to evaluate a clock-in/out — or a
 * streak/attendance-rate calculation — against a schedule: which days
 * count as "working days", whether it's a fixed-window or
 * hours-target shift, and the standard hours to compare worked time
 * against (for overtime purposes).
 */
export function resolveSchedule(shift, settings) {
  const workingDays = shift?.days?.length
    ? shift.days
    : (settings?.working_days ?? ["Mon", "Tue", "Wed", "Thu", "Fri"]);

  const scheduleType = shift?.schedule_type ?? "fixed";

  if (scheduleType === "hours_target") {
    return {
      workingDays,
      scheduleType,
      standardHours: Number(shift?.target_hours_per_day ?? 8),
    };
  }

  const workStart =
    shift?.start_time ?? settings?.working_hours_start ?? "08:00";
  const workEnd = shift?.end_time ?? settings?.working_hours_end ?? "17:00";
  const [startH, startM] = workStart.split(":").map(Number);
  const [endH, endM] = workEnd.split(":").map(Number);

  return {
    workingDays,
    scheduleType,
    workStart,
    workEnd,
    graceMinutesBefore: shift?.grace_minutes_before ?? 30,
    lateGraceMinutes: shift?.late_grace_minutes ?? 15,
    standardHours: (endH * 60 + endM - (startH * 60 + startM)) / 60,
  };
}
