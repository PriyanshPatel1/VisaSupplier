"use client";

import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
  size = "md",
}: EmptyStateProps) {
  const padMap = { sm: "py-8", md: "py-14", lg: "py-20" };
  const iconMap = { sm: "text-3xl mb-2", md: "text-5xl mb-3", lg: "text-6xl mb-4" };
  const titleMap = { sm: "text-sm font-semibold", md: "text-base font-bold", lg: "text-lg font-bold" };

  return (
    <div className={["flex flex-col items-center text-center", padMap[size]].join(" ")}>
      <p className={iconMap[size]}>{icon}</p>
      <p className={["text-gray-700", titleMap[size]].join(" ")}>{title}</p>
      {description && (
        <p className="text-sm text-gray-400 mt-1 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
