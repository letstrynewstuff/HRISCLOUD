

// src/admin/reports/AdminReportsPage.jsx

import { useState } from "react";
import { BarChart3, ShieldAlert, ChevronLeft } from "lucide-react";
import Header from "../../components/Header";
import { C } from "../employeemanagement/sharedData";
import ReportsListView from "./ReportsListView";
import ReportDetailView from "./ReportDetailView";

export default function AdminReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [headerStats, setHeaderStats] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const isDetail = !!selectedReportId;

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg, fontFamily: "'DM Sans','Sora',sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            title={isDetail ? "Report Details" : "Reports"}
            subtitle={
              isDetail
                ? "Review employee report"
                : `${totalCount} total · handled in confidence`
            }
            icon={BarChart3}
            loading={false}
            searchQuery=""
            setSearchQuery={() => {}}
            setSidebarOpen={setSidebarOpen}
            stats={isDetail ? [] : headerStats}
            actions={
              isDetail ? (
                <button
                  onClick={() => setSelectedReportId(null)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: C.surfaceAlt,
                    color: C.textSecondary,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <ChevronLeft size={15} />
                  Back to List
                </button>
              ) : (
                <button
                  onClick={() => setSelectedReportId("new")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: "#4F46E5",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
                  }}
                >
                  <ShieldAlert size={15} />
                  Submit New Report
                </button>
              )
            }
          />

          <main className="flex-1 overflow-y-auto p-5 md:p-7 space-y-5">
            {isDetail ? (
              <ReportDetailView
                reportId={selectedReportId}
                onClose={() => setSelectedReportId(null)}
              />
            ) : (
              <ReportsListView
                onViewReport={(id) => setSelectedReportId(id)}
                onStatsLoaded={setHeaderStats}
                onTotalLoaded={setTotalCount}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}