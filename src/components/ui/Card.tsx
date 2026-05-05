"use client";

import React from "react";

// ── Card Root ─────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className = "", hover = false, padding = "md" }: CardProps) {
  const padMap = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };
  return (
    <div
      className={[
        "bg-white rounded-2xl border border-gray-100 shadow-sm",
        hover ? "transition-shadow hover:shadow-md cursor-pointer" : "",
        padMap[padding],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

// ── Card Header ───────────────────────────────────────────────────────────────

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, icon, className = "" }: CardHeaderProps) {
  return (
    <div className={["flex items-start justify-between mb-5", className].join(" ")}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  trend?: { value: number; label?: string };
  gradient?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  trend,
  gradient = "from-indigo-500 to-violet-600",
  className = "",
}: StatCardProps) {
  const trendUp = trend && trend.value >= 0;
  return (
    <div
      className={[
        `bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-lg`,
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-3">
        {icon && <span className="text-2xl">{icon}</span>}
        {sub && (
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
            {sub}
          </span>
        )}
      </div>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="text-xs text-white/70 mt-0.5 font-medium">{label}</p>
      {trend && (
        <p className={["text-xs mt-2 font-semibold", trendUp ? "text-green-300" : "text-red-300"].join(" ")}>
          {trendUp ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label ?? "vs last month"}
        </p>
      )}
    </div>
  );
}

export default Card;
