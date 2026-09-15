export default function LoansPage() {
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
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Loans</h1>
              <p className="text-sm text-gray-500">Employee loan management</p>
            </div>
          </div>

          {/* Coming Soon Placeholder */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
              <svg
                className="h-8 w-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Coming Soon</h2>
            <p className="mt-2 max-w-xs text-center text-sm text-gray-500">
              The loans module is currently under development. Check back later
              for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
