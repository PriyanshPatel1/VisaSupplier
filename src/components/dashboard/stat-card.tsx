interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    direction: "up" | "down";
    percent: number;
  };
}

/**
 * Admin stat card — aligned to --admin-* CSS token system.
 * Previously hardcoded slate-800/slate-700 dark bg which was inconsistent
 * with the rest of the admin shell and broke if tokens changed.
 */
export default function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div
      className="rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
      style={{
        background: "var(--admin-surface)",
        border: "1px solid var(--admin-border)",
      }}
      role="article"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-2xl sm:text-3xl" role="img" aria-hidden="true">{icon}</span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 ${
              trend.direction === "up"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
            aria-label={`${trend.direction === "up" ? "Up" : "Down"} ${trend.percent}%`}
          >
            {/* Arrow shape — not color alone (WCAG 1.4.1) */}
            <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5" aria-hidden="true">
              {trend.direction === "up"
                ? <path d="M5 8V2M2 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M5 2v6M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
            {trend.percent}%
          </span>
        )}
      </div>
      <p className="text-xs sm:text-sm mb-1" style={{ color: "var(--admin-text-muted)" }}>{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
