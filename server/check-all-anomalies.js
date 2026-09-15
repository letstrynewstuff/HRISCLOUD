const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkM2FjMWE1My05OGZjLTQwMGItYjE2YS1jODZmMjgyYjBhZmYiLCJjb21wYW55SWQiOiJkZDcwYzlhNi1mYmYzLTRhYWMtOWJlMy1lNzI2YzZjMTM5ODgiLCJyb2xlIjoiaHJfYWRtaW4iLCJpYXQiOjE3ODM4NDk3MTAsImV4cCI6MTc4Mzg1MDYxMH0.9xYQNwh-gcGXxAWt_RTGc3OI2tZzwlj7NCfqtdzZhSA";

async function checkAll() {
  // 1. Get all payroll runs
  const runsRes = await fetch("http://localhost:5000/api/payroll/runs", {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const runs = await runsRes.json();

  console.log(`🔍 Checking ${runs.length} payroll runs...\n`);

  // 2. Check each for anomalies
  for (const run of runs) {
    const res = await fetch(
      `http://localhost:5000/api/payroll/runs/${run.id}/anomalies`,
      { headers: { Authorization: `Bearer ${TOKEN}` } },
    );
    const data = await res.json();

    const status = data.anomalyCount > 0 ? "🚨 ANOMALIES FOUND" : "✅ Clean";
    console.log(`${status} | ${run.period} | ${data.anomalyCount} issues`);

    if (data.anomalyCount > 0) {
      console.log("   Details:", data.anomalies);
    }
  }
}

checkAll();
