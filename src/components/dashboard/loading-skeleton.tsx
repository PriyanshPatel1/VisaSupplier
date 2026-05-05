export function TableSkeleton({ columns = 5, rows = 3 }: { columns?: number; rows?: number }) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600 bg-slate-900/50">
              {[...Array(columns)].map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <div className="h-4 bg-slate-600 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(rows)].map((_, i) => (
              <tr key={i} className="border-b border-slate-600">
                {[...Array(columns)].map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-slate-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-6">
      <div className="h-8 bg-slate-600 rounded animate-pulse mb-4 w-1/3" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-700 rounded animate-pulse" />
        <div className="h-4 bg-slate-700 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-slate-700 rounded animate-pulse w-4/6" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-slate-600 rounded animate-pulse mb-3 w-1/4" />
          <div className="h-10 bg-slate-700 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#101829] to-[#0d1320] p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 bg-slate-700 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton columns={5} rows={4} />
      </div>
    </div>
  );
}
