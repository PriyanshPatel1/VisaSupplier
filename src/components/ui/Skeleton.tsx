"use client";

import React from "react";

// ── Shimmer base ──────────────────────────────────────────────────────────────

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "relative overflow-hidden bg-gray-100 rounded-lg",
        className,
      ].join(" ")}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite linear",
        }}
      />
      <style>{`@keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }`}</style>
    </div>
  );
}

// ── Text skeleton ─────────────────────────────────────────────────────────────

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = "" }: SkeletonTextProps) {
  return (
    <div className={["space-y-2.5", className].join(" ")}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className={["h-3.5 rounded-full", i === lines - 1 ? "w-3/5" : "w-full"].join(" ")}
        />
      ))}
    </div>
  );
}

// ── Avatar skeleton ───────────────────────────────────────────────────────────

export function SkeletonAvatar({ size = 10 }: { size?: number }) {
  return <Shimmer className={`w-${size} h-${size} rounded-full flex-shrink-0`} />;
}

// ── Stat card skeleton ────────────────────────────────────────────────────────

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Shimmer className="w-8 h-8 rounded-xl" />
        <Shimmer className="w-16 h-5 rounded-full" />
      </div>
      <Shimmer className="w-24 h-8 rounded-lg" />
      <Shimmer className="w-32 h-3.5 rounded-full" />
    </div>
  );
}

// ── Table row skeleton ────────────────────────────────────────────────────────

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 border-b border-gray-50">
      <Shimmer className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3.5 w-48 rounded-full" />
        <Shimmer className="h-3 w-32 rounded-full" />
      </div>
      <Shimmer className="h-6 w-20 rounded-full flex-shrink-0" />
      <Shimmer className="h-3.5 w-16 rounded-full flex-shrink-0 hidden sm:block" />
      <Shimmer className="h-3.5 w-12 rounded-full flex-shrink-0" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <Shimmer className="h-5 w-40 rounded-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}

// ── Card skeleton ─────────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Shimmer className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-40 rounded-full" />
          <Shimmer className="h-3 w-28 rounded-full" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <Shimmer className="h-8 w-full rounded-xl" />
    </div>
  );
}

// ── Dashboard skeleton ────────────────────────────────────────────────────────

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-7 w-52 rounded-xl" />
          <Shimmer className="h-4 w-36 rounded-full" />
        </div>
        <Shimmer className="h-10 w-28 rounded-xl hidden sm:block" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <Shimmer className="h-5 w-40 rounded-full" />
            <Shimmer className="h-32 w-full rounded-xl" />
          </div>
        ))}
      </div>

      {/* Table */}
      <SkeletonTable rows={4} />
    </div>
  );
}

export default SkeletonCard;
