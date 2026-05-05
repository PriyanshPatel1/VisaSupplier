"use client";

import React from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "gray";

type BadgeSize = "xs" | "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  default:  "bg-gray-100 text-gray-700 border-gray-200",
  primary:  "bg-indigo-100 text-indigo-700 border-indigo-200",
  success:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning:  "bg-amber-100 text-amber-700 border-amber-200",
  danger:   "bg-red-100 text-red-700 border-red-200",
  info:     "bg-blue-100 text-blue-700 border-blue-200",
  purple:   "bg-purple-100 text-purple-700 border-purple-200",
  gray:     "bg-gray-50 text-gray-500 border-gray-200",
};

const dotMap: Record<BadgeVariant, string> = {
  default:  "bg-gray-400",
  primary:  "bg-indigo-500",
  success:  "bg-emerald-500",
  warning:  "bg-amber-500",
  danger:   "bg-red-500",
  info:     "bg-blue-500",
  purple:   "bg-purple-500",
  gray:     "bg-gray-400",
};

const sizeMap: Record<BadgeSize, string> = {
  xs: "px-1.5 py-0.5 text-[10px] rounded-md",
  sm: "px-2 py-0.5 text-xs rounded-lg",
  md: "px-2.5 py-1 text-xs rounded-lg",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-semibold border",
        variantMap[variant],
        sizeMap[size],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={["w-1.5 h-1.5 rounded-full flex-shrink-0", dotMap[variant]].join(" ")}
        />
      )}
      {children}
    </span>
  );
}

// ── Application Status Badge ──────────────────────────────────────────────────

type AppStatus = "submitted" | "processing" | "approved" | "rejected" | "draft" | "pending";

const statusMap: Record<AppStatus, { label: string; variant: BadgeVariant }> = {
  submitted:  { label: "Submitted",  variant: "info" },
  processing: { label: "Processing", variant: "warning" },
  approved:   { label: "Approved",   variant: "success" },
  rejected:   { label: "Rejected",   variant: "danger" },
  draft:      { label: "Draft",      variant: "gray" },
  pending:    { label: "Pending",    variant: "primary" },
};

interface StatusBadgeProps {
  status: AppStatus;
  size?: BadgeSize;
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const cfg = statusMap[status] ?? { label: status, variant: "default" as BadgeVariant };
  return (
    <Badge variant={cfg.variant} size={size} dot>
      {cfg.label}
    </Badge>
  );
}

export default Badge;
