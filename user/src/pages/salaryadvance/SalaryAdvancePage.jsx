import { useAuth } from "../../components/useAuth";

export default function SalaryAdvancePage() {
  const { employee } = useAuth();

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <svg
                className="h-5 w-5 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Salary Advance
              </h1>
              <p className="text-sm text-gray-500">
                Request an advance on your salary
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-amber-800">
                  Contact Your HR Department
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-amber-700">
                  Please contact your HR department for the salary advance
                  policy and application process. All advance requests are
                  handled directly through HR to ensure compliance with company
                  payroll procedures.
                </p>
              </div>
            </div>
          </div>

          {/* Helper Footer */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Need help?</span> Reach out to your
              HR representative or line manager for guidance on salary advance
              eligibility and requirements.
            </p>
          </div>

          {/* Employee Context (optional) */}
          {employee?.managerId && (
            <div className="mt-4 text-xs text-gray-400">
              Employee ID: {employee.employeeCode ?? employee.id}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
