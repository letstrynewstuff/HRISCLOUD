// src/hooks/useTimesheetQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { timesheetApi } from "../api/service/timesheetApi";
import type { TimesheetEntry } from "../components/timesheets/EntryCard";

const QUERY_KEYS = {
  myEntries: (startDate?: string, endDate?: string) =>
    ["timesheets", "my", startDate, endDate] as const,
  mySummary: (startDate?: string, endDate?: string) =>
    ["timesheets", "summary", startDate, endDate] as const,
};

export function useMyEntries(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.myEntries(startDate, endDate),
    queryFn: () => timesheetApi.getMyEntries({ startDate, endDate }),
  });
}

export function useMySummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.mySummary(startDate, endDate),
    queryFn: () => timesheetApi.getMySummary({ startDate, endDate }),
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: timesheetApi.createEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof timesheetApi.updateEntry>[1];
    }) => timesheetApi.updateEntry(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: timesheetApi.deleteEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });
}

export function useSubmitEntries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: timesheetApi.submitEntries,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timesheets"] });
    },
  });
}
