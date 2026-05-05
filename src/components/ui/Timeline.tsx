"use client";

import React from "react";

export type TimelineStatus = "submitted" | "processing" | "approved" | "rejected" | "pending";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status: TimelineStatus;
  actor?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

const statusConfig: Record<TimelineStatus, { dot: string; icon: string }> = {
  submitted:  { dot: "bg-blue-500 ring-blue-100",    icon: "📤" },
  processing: { dot: "bg-amber-500 ring-amber-100",  icon: "⚙️" },
  approved:   { dot: "bg-emerald-500 ring-emerald-100", icon: "✅" },
  rejected:   { dot: "bg-red-500 ring-red-100",      icon: "❌" },
  pending:    { dot: "bg-gray-400 ring-gray-100",    icon: "🕐" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Timeline({ events }: TimelineProps) {
  if (!events.length) return null;

  return (
    <div className="relative pl-6">
      {/* vertical line */}
      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-200" />

      <div className="space-y-6">
        {events.map((ev, i) => {
          const cfg = statusConfig[ev.status] ?? statusConfig.pending;
          const isFirst = i === 0;
          return (
            <div key={ev.id} className="relative flex gap-4">
              {/* Dot */}
              <div
                className={[
                  "absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ring-4 flex-shrink-0 mt-0.5 text-[10px]",
                  cfg.dot,
                  isFirst ? "animate-pulse" : "",
                ].join(" ")}
              >
                <span>{cfg.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-sm font-bold text-gray-900">{ev.title}</p>
                  <p className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatDate(ev.timestamp)}
                  </p>
                </div>
                {ev.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{ev.description}</p>
                )}
                {ev.actor && (
                  <p className="text-xs text-gray-400 mt-2">by {ev.actor}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Timeline;
