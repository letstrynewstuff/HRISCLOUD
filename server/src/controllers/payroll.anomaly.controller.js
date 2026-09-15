


// src/controllers/payroll.anomaly.controller.js
import { detectAnomaliesForRun } from "../services/payrollAnomaly.service.js";
import { generateAnomalyNarrative } from "../services/aiService.js";

// Wrap any promise so it rejects instead of hanging forever.
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

// GET /api/payroll/runs/:id/anomalies
export async function getPayrollAnomalies(req, res) {
  const { id } = req.params;
  const { companyId } = req.user;
  console.log("[anomalies] START run:", id, "company:", companyId);

  try {
    // ── 1. Rules engine (pure DB + math) — 20s ceiling ─────────────────
    const t0 = Date.now();
    const { run, anomalies } = await withTimeout(
      detectAnomaliesForRun(id, companyId),
      // 20_000,
      30_000,
      "Rules engine",
    );
    console.log(
      `[anomalies] rules engine done in ${Date.now() - t0}ms, found:`,
      anomalies.length,
    );

    // ── 2. AI narrative — 15s ceiling, never blocks the response ───────
    let narrative = null;
    try {
      const t1 = Date.now();
      narrative = await withTimeout(
        generateAnomalyNarrative({ run, anomalies }),
        15_000,
        "AI narrative",
      );
      console.log(`[anomalies] AI narrative done in ${Date.now() - t1}ms`);
    } catch (aiErr) {
      // Rules-engine results are still fully valid even if the AI call fails
      // or times out — never let an AI outage/slowness block HR from seeing
      // the flagged anomalies.
      console.error("[anomalies] AI narrative FAILED:", aiErr.message);
      narrative =
        "AI narrative unavailable right now — see the anomalies list below.";
    }

    console.log("[anomalies] sending response");
    return res.status(200).json({
      run,
      anomalyCount: anomalies.length,
      anomalies,
      narrative,
    });
  } catch (err) {
    console.error("[anomalies] RULES ENGINE FAILED:", err.message);
    const status = err.message === "Payroll run not found." ? 404 : 500;
    return res
      .status(status)
      .json({ message: err.message || "Error detecting anomalies." });
  }
}