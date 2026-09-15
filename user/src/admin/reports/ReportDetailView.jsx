
// src/admin/reports/ReportDetailView.jsx
import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Target,
  RefreshCw,
  MessageSquarePlus,
  ShieldAlert,
  AlertTriangle,
  Lock,
  FileText,
  Loader2,
} from "lucide-react";

import { C } from "../employeemanagement/sharedData";
import { reportApi } from "../../api/service/reportApi";
import { useAuth } from "../../components/useAuth";
import {
  CategoryPill,
  SeverityBadge,
  StatusBadge,
  ReportAvatar,
  getInitials,
  fmtDateTime,
} from "./reportShared";
import StatusUpdateModal from "./StatusUpdateModal";
import AssignReportModal from "./AssignReportModal";
import AddNoteModal from "./AddNoteModal";
import RevealIdentityModal from "./RevealIdentityModal";

function InfoBlock({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={13} color={C.textMuted} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px]" style={{ color: C.textMuted }}>
          {label}
        </p>
        <p
          className="text-xs font-semibold mt-0.5 leading-snug"
          style={{ color: C.textPrimary }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ReportDetailView({ reportId, onClose }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusModal, setStatusModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [revealModal, setRevealModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [revealed, setRevealed] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportApi.getReport(reportId);
      setReport(res.data ?? res);
    } catch {
      setError("Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusSave = async (status, note) => {
    setActionLoading(true);
    try {
      await reportApi.updateStatus(reportId, {
        status,
        note: note || undefined,
      });
      await load();
      setStatusModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSave = async (assignedTo) => {
    setActionLoading(true);
    try {
      await reportApi.assign(reportId, { assignedTo });
      await load();
      setAssignModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (note, visibleToReporter) => {
    setActionLoading(true);
    try {
      await reportApi.addNote(reportId, { note, visibleToReporter });
      await load();
      setNoteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReveal = async (reason) => {
    setActionLoading(true);
    try {
      const res = await reportApi.revealIdentity(reportId, { reason });
      setRevealed(res.data?.reporter ?? res.reporter ?? null);
      setRevealModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin" color={C.primary} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertTriangle size={32} color={C.danger} />
        <p style={{ color: C.danger }}>{error ?? "Report not found."}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: C.primaryLight, color: C.primary }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const reporterDisplay = revealed ?? report.reporter;
  const isAnonymous = report.isAnonymous && !revealed;

  return (
    <div className="space-y-4">
      {/* Reference code row */}
      <div className="flex items-center justify-between">
        <p
          className="text-sm font-bold font-mono"
          style={{ color: C.textPrimary }}
        >
          {report.referenceCode}
        </p>
        <button
          onClick={load}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: C.surface, border: `1px solid ${C.border}` }}
        >
          <RefreshCw size={15} color={C.textSecondary} />
        </button>
      </div>

      {/* Summary card */}
      <div
        className="p-4 rounded-2xl bg-white space-y-3"
        style={{ border: `1px solid ${C.border}` }}
      >
        <div className="flex flex-wrap gap-1.5">
          <CategoryPill category={report.category} />
          <SeverityBadge severity={report.severity} />
          <StatusBadge status={report.status} />
        </div>
        <p
          className="text-base font-extrabold"
          style={{ color: C.textPrimary }}
        >
          {report.subject}
        </p>
        <p
          className="text-sm leading-relaxed"
          style={{ color: C.textSecondary }}
        >
          {report.description}
        </p>
      </div>

      {/* Incident details */}
      {(report.incidentDate ||
        report.location ||
        report.involvedParties ||
        report.witnesses ||
        report.desiredOutcome) && (
        <div
          className="p-4 rounded-2xl bg-white space-y-3"
          style={{ border: `1px solid ${C.border}` }}
        >
          <p
            className="text-xs font-extrabold"
            style={{ color: C.textPrimary }}
          >
            Incident Details
          </p>
          <InfoBlock
            icon={Calendar}
            label="Incident Date"
            value={report.incidentDate}
          />
          <InfoBlock icon={MapPin} label="Location" value={report.location} />
          <InfoBlock
            icon={Users}
            label="Involved Parties"
            value={report.involvedParties}
          />
          <InfoBlock
            icon={FileText}
            label="Witnesses"
            value={report.witnesses}
          />
          <InfoBlock
            icon={Target}
            label="Desired Outcome"
            value={report.desiredOutcome}
          />
        </div>
      )}

      {/* Reporter */}
      <div
        className="p-4 rounded-2xl bg-white space-y-3"
        style={{ border: `1px solid ${C.border}` }}
      >
        <p className="text-xs font-extrabold" style={{ color: C.textPrimary }}>
          Reporter
        </p>
        <div className="flex items-center gap-2.5">
          <ReportAvatar
            initials={getInitials(reporterDisplay?.name)}
            anonymous={isAnonymous}
            size={40}
          />
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-extrabold"
              style={{ color: C.textPrimary }}
            >
              {isAnonymous ? "Anonymous" : (reporterDisplay?.name ?? "—")}
            </p>
            {!isAnonymous && (
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: C.textMuted }}
              >
                {reporterDisplay?.department ?? "—"} ·{" "}
                {reporterDisplay?.code ?? "—"}
              </p>
            )}
            {isAnonymous && (
              <span
                className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: C.surfaceAlt, color: C.textMuted }}
              >
                <Lock size={9} /> Identity protected
              </span>
            )}
          </div>
        </div>
        {isAnonymous && isSuperAdmin && (
          <button
            onClick={() => setRevealModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold"
            style={{ background: C.dangerLight, color: C.danger }}
          >
            <ShieldAlert size={13} /> Reveal Identity
          </button>
        )}
      </div>

      {/* Assignment */}
      <div
        className="p-4 rounded-2xl bg-white space-y-3"
        style={{ border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center justify-between">
          <p
            className="text-xs font-extrabold"
            style={{ color: C.textPrimary }}
          >
            Assigned To
          </p>
          <button
            onClick={() => setAssignModal(true)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold"
            style={{ background: C.primaryLight, color: C.primary }}
          >
            {report.assignedTo ? "Reassign" : "Assign"}
          </button>
        </div>
        {report.assignedTo ? (
          <div className="flex items-center gap-2.5">
            <ReportAvatar
              initials={getInitials(report.assignedTo.name)}
              size={36}
            />
            <p
              className="text-sm font-extrabold"
              style={{ color: C.textPrimary }}
            >
              {report.assignedTo.name}
            </p>
          </div>
        ) : (
          <p className="text-xs" style={{ color: C.textMuted }}>
            No one assigned yet.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setStatusModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-extrabold text-white"
          style={{ background: C.primary }}
        >
          <RefreshCw size={13} /> Update Status
        </button>
        <button
          onClick={() => setNoteModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-extrabold"
          style={{ background: C.primaryLight, color: C.primary }}
        >
          <MessageSquarePlus size={13} /> Add Note
        </button>
      </div>

      {/* Timeline */}
      <div
        className="p-4 rounded-2xl bg-white space-y-3"
        style={{ border: `1px solid ${C.border}` }}
      >
        <p className="text-xs font-extrabold" style={{ color: C.textPrimary }}>
          Investigation Timeline
        </p>
        {(report.notes ?? []).length === 0 ? (
          <p className="text-xs" style={{ color: C.textMuted }}>
            No notes yet.
          </p>
        ) : (
          <div className="space-y-3">
            {report.notes.map((n) => (
              <div key={n.id} className="flex gap-2.5 items-start">
                <div
                  className="w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: n.isStatusChange
                      ? C.primaryLight
                      : C.surfaceAlt,
                  }}
                >
                  <MessageSquarePlus
                    size={12}
                    color={n.isStatusChange ? C.primary : C.textMuted}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: C.textPrimary }}
                  >
                    {n.note}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px]"
                      style={{ color: C.textMuted }}
                    >
                      {fmtDateTime(n.createdAt)}
                    </span>
                    {n.visibleToReporter && (
                      <span
                        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                        style={{ background: C.successLight, color: C.success }}
                      >
                        Visible to reporter
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StatusUpdateModal
        visible={statusModal}
        currentStatus={report.status}
        saving={actionLoading}
        onSave={handleStatusSave}
        onClose={() => setStatusModal(false)}
      />
      <AssignReportModal
        visible={assignModal}
        currentAssignedId={report.assignedTo?.id ?? null}
        saving={actionLoading}
        onSave={handleAssignSave}
        onClose={() => setAssignModal(false)}
      />
      <AddNoteModal
        visible={noteModal}
        saving={actionLoading}
        onSave={handleAddNote}
        onClose={() => setNoteModal(false)}
      />
      <RevealIdentityModal
        visible={revealModal}
        saving={actionLoading}
        onConfirm={handleReveal}
        onClose={() => setRevealModal(false)}
      />
    </div>
  );
}