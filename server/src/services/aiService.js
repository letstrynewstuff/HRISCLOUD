// src/services/aiService.js
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/**
 * Generic AI call — simple prompt in, text out.
 * Used by your existing /api/ai/test route.
 */
export async function askAI(
  prompt,
  { system, temperature = 0.4, maxTokens = 800 } = {},
) {
  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  });

  return completion.choices?.[0]?.message?.content?.trim() ?? "";
}

/**
 * Turns a list of rules-engine-flagged payroll anomalies into a plain-English
 * narrative for HR. IMPORTANT: the AI does NOT detect anomalies — the rules
 * engine (payrollAnomaly.service.js) already did that with plain arithmetic.
 * The AI's only job here is to explain the findings in readable language.
 */
export async function generateAnomalyNarrative({ run, anomalies }) {
  if (!anomalies || anomalies.length === 0) {
    return "No anomalies were detected in this payroll run. All calculations (gross pay, pension, NHF, PAYE, deductions, and net pay) match expected values within tolerance.";
  }

  const system = `You are a payroll compliance assistant for a Nigerian company using the Nigeria Tax Act 2025 (effective Jan 2026).
You will be given a JSON list of payroll anomalies that were already detected by a deterministic rules engine — you do not detect anomalies yourself, you only explain them.

Rules:
- Never invent numbers, employees, or anomalies that are not present in the JSON provided.
- For each anomaly: 1-3 plain-language sentences — what was flagged, for which employee, and why it matters.
- End with a short overall summary line (e.g. how many critical vs medium issues).
- Use ₦ for currency amounts.
- Do not just restate the raw JSON back at the user.`;

  const prompt = `Payroll run: ${run.period} (Run ID: ${run.id})
Total employees in run: ${run.employeeCount}

Anomalies detected by rules engine:
${JSON.stringify(anomalies, null, 2)}

Write the HR-facing narrative now.`;

  return askAI(prompt, { system, temperature: 0.3, maxTokens: 1000 });
}
