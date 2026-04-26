// src/admin/training/CertificationTracker.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getCertifications } from "../../api/service/trainingApi";
import { C } from "../employeemanagement/sharedData";

export default function CertificationTracker() {
  const [certs, setCerts] = useState([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = () => {
    setLoading(true);
    setError(null);
    getCertifications()
      .then((res) => {
        setCerts(res.data ?? []);
        setExpiringCount(res.expiringCount ?? 0);
      })
      .catch((e) =>
        setError(
          e?.response?.data?.message ?? "Failed to load certifications.",
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      {expiringCount > 0 && (
        <div
          className="flex items-center gap-3 bg-amber-50 p-4 rounded-2xl"
          style={{ border: "1px solid #FDE68A" }}
        >
          <AlertTriangle size={20} color="#D97706" />
          <p className="text-sm text-amber-700">
            <strong>{expiringCount}</strong> certification
            {expiringCount !== 1 ? "s" : ""} expiring in the next 60 days
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={fetch}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            color: C.textSecondary,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{
            background: C.dangerLight,
            border: `1px solid ${C.danger}33`,
          }}
        >
          <AlertCircle size={16} color={C.danger} />
          <p className="text-sm flex-1" style={{ color: C.danger }}>
            {error}
          </p>
          <button
            onClick={fetch}
            className="text-xs font-bold px-3 py-1 rounded-lg"
            style={{
              background: C.danger,
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: C.surface, borderColor: C.border }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: C.surfaceAlt }}>
              {[
                "Employee",
                "Training / Certification",
                "Expiry Date",
                "Status",
                "Certificate",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-4 text-left text-xs font-bold uppercase"
                  style={{ color: C.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <Loader2
                    size={20}
                    color={C.primary}
                    className="animate-spin mx-auto"
                  />
                </td>
              </tr>
            ) : certs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm"
                  style={{ color: C.textMuted }}
                >
                  No certifications issued yet.
                </td>
              </tr>
            ) : (
              certs.map((cert, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b"
                  style={{ borderColor: C.border }}
                >
                  <td
                    className="px-5 py-4 font-medium text-sm"
                    style={{ color: C.textPrimary }}
                  >
                    {cert.employee_name}
                  </td>
                  <td
                    className="px-5 py-4 text-sm"
                    style={{ color: C.textSecondary }}
                  >
                    {cert.training_title}
                  </td>
                  <td
                    className="px-5 py-4 text-sm"
                    style={{
                      color:
                        cert.cert_status === "Expired"
                          ? C.danger
                          : cert.cert_status === "Expiring"
                            ? C.warning
                            : C.textSecondary,
                    }}
                  >
                    {cert.expiry_date
                      ? new Date(cert.expiry_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "No expiry"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-4 py-1 text-xs rounded-full font-semibold ${
                        cert.cert_status === "Valid"
                          ? "bg-emerald-100 text-emerald-700"
                          : cert.cert_status === "Expiring"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cert.cert_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                      Issued
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
