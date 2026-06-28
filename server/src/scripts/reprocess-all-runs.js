// scripts/reprocess-all-runs.js
// Run with: node scripts/reprocess-all-runs.js

import { db } from "../src/config/db.js";
import { runPayrollForEmployee } from "../src/services/payroll.engine.js";

async function reprocessAll() {
  console.log("Fetching all payroll runs...");

  const runs = await db.query(`
    SELECT id, company_id, month, year, period
    FROM payroll_runs
    ORDER BY year ASC, month ASC
  `);

  console.log(`Found ${runs.rowCount} runs to reprocess.\n`);

  for (const run of runs.rows) {
    console.log(`\n── Processing: ${run.period} (${run.id})`);

    const employees = await db.query(
      `SELECT DISTINCT employee_id FROM payroll_records WHERE payroll_run_id = $1`,
      [run.id],
    );

    console.log(`   ${employees.rowCount} employees in this run`);

    let ok = 0,
      failed = 0;

    for (const { employee_id } of employees.rows) {
      try {
        // Fetch any overrides (overtime/bonus) that were on the original record
        const orig = await db.query(
          `SELECT overtime, bonus, other_earnings 
           FROM payroll_records 
           WHERE payroll_run_id = $1 AND employee_id = $2`,
          [run.id, employee_id],
        );

        const overrides = orig.rows[0]
          ? {
              overtime: Number(orig.rows[0].overtime ?? 0),
              bonus: Number(orig.rows[0].bonus ?? 0),
              otherEarnings: Number(orig.rows[0].other_earnings ?? 0),
            }
          : {};

        await runPayrollForEmployee(
          employee_id,
          run.company_id,
          run.id,
          run.month,
          run.year,
          overrides,
          db,
        );
        ok++;
      } catch (err) {
        console.error(`   ✗ Employee ${employee_id}: ${err.message}`);
        failed++;
      }
    }

    // Update the run totals to match the recalculated records
    await db.query(
      `
      UPDATE payroll_runs SET
        total_gross       = (SELECT SUM(gross_salary)    FROM payroll_records WHERE payroll_run_id = $1),
        total_deductions  = (SELECT SUM(total_deductions) FROM payroll_records WHERE payroll_run_id = $1),
        total_net         = (SELECT SUM(net_salary)       FROM payroll_records WHERE payroll_run_id = $1),
        employee_count    = (SELECT COUNT(*)              FROM payroll_records WHERE payroll_run_id = $1),
        updated_at        = NOW()
      WHERE id = $1
    `,
      [run.id],
    );

    console.log(`   ✓ ${ok} succeeded, ${failed} failed`);
  }

  console.log("\n✅ Reprocess complete.");
  await db.end();
}

reprocessAll().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
