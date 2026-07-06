// // src/data/timesheetMockData.ts
// // Local mock data + helpers for the Timesheets screen.
// // No backend calls — everything lives in component state, seeded from here.

// import { TimesheetEntry } from "../components/timesheets/EntryCard";

// function toISO(date: Date) {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// }

// function getMondayOf(date: Date) {
//   const d = new Date(date);
//   const day = d.getDay();
//   const diff = day === 0 ? -6 : 1 - day;
//   d.setDate(d.getDate() + diff);
//   d.setHours(0, 0, 0, 0);
//   return d;
// }

// function addDays(date: Date, n: number) {
//   const d = new Date(date);
//   d.setDate(d.getDate() + n);
//   return d;
// }

// function minutesBetween(start: string, end: string) {
//   const [sh, sm] = start.split(":").map(Number);
//   const [eh, em] = end.split(":").map(Number);
//   return eh * 60 + em - (sh * 60 + sm);
// }

// let mockIdCounter = 1000;
// export function nextMockId() {
//   mockIdCounter += 1;
//   return `mock-${mockIdCounter}`;
// }

// /** Seed a believable week of entries around "today" for first-load demo data. */
// export function seedMockEntries(): TimesheetEntry[] {
//   const monday = getMondayOf(new Date());

//   const raw: Array<
//     Omit<TimesheetEntry, "id" | "durationMinutes"> & { dayOffset: number }
//   > = [
//     {
//       dayOffset: 0,
//       entryDate: "",
//       startTime: "09:00",
//       endTime: "13:00",
//       description: "Sprint planning & backlog grooming",
//       projectTag: "Mobile App",
//       status: "Approved",
//     },
//     {
//       dayOffset: 0,
//       entryDate: "",
//       startTime: "14:00",
//       endTime: "17:30",
//       description: "Built timesheet entry form + validation",
//       projectTag: "Mobile App",
//       status: "Approved",
//     },
//     {
//       dayOffset: 1,
//       entryDate: "",
//       startTime: "09:00",
//       endTime: "12:30",
//       description: "Code review for attendance module",
//       projectTag: "Mobile App",
//       status: "Submitted",
//     },
//     {
//       dayOffset: 2,
//       entryDate: "",
//       startTime: "10:00",
//       endTime: "16:00",
//       description: "Client onboarding call + follow-up notes",
//       projectTag: "Client Success",
//       status: "Submitted",
//     },
//     {
//       dayOffset: 3,
//       entryDate: "",
//       startTime: "09:00",
//       endTime: "11:00",
//       description: "Fixing date-handling bug in week view",
//       projectTag: "Mobile App",
//       status: "Draft",
//     },
//   ];

//   return raw.map((r) => {
//     const date = toISO(addDays(monday, r.dayOffset));
//     return {
//       id: nextMockId(),
//       entryDate: date,
//       startTime: r.startTime,
//       endTime: r.endTime,
//       description: r.description,
//       projectTag: r.projectTag,
//       status: r.status as TimesheetEntry["status"],
//       durationMinutes: minutesBetween(r.startTime, r.endTime),
//     };
//   });
// }

// export { toISO, getMondayOf, addDays, minutesBetween };


// src/data/timesheetMockData.ts
// Date utilities only — mock data removed since we use the real API now.

export function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

// Deprecated: remove these once fully migrated
// export function seedMockEntries() { ... }
// export function nextMockId() { ... }