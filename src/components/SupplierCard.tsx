"use client";

import type { Supplier } from "@/types";

interface SupplierCardProps {
  supplier: Supplier;
  basePrice: number;
  selected: boolean;
  onSelect: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  embassy: "Embassy",
  agent: "Agency",
  government: "Government",
  courier: "Courier",
};

function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-xs text-indigo-100/65">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-amber-300">
        <path d="M10 2.7l2.2 4.4 4.8.7-3.5 3.4.8 4.8L10 13.7 5.7 16l.8-4.8L3 7.8l4.8-.7L10 2.7z" />
      </svg>
      <span>{value.toFixed(1)}</span>
    </div>
  );
}

export default function SupplierCard({ supplier, basePrice, selected, onSelect }: SupplierCardProps) {
  const multiplier = supplier.priceMultiplier ?? 1;
  const total = Math.round(basePrice * multiplier);
  const serviceFee = total - basePrice;
  const rating = supplier.rating ?? 4.5;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-indigo-300/55 bg-indigo-500/16"
          : "border-indigo-300/22 bg-[#0b1431] hover:border-indigo-300/40"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#131d43] text-sm font-bold text-white">
            {supplier.name[0]?.toUpperCase() ?? "S"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{supplier.name}</p>
            <p className="mt-1 text-xs text-indigo-100/58">{TYPE_LABEL[supplier.type] ?? "Agency"}</p>
            <Rating value={rating} />
          </div>
        </div>

        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${selected ? "border-indigo-300/55 text-white" : "border-indigo-300/20 text-indigo-100/65"}`}>
          {selected ? "Selected" : "Choose"}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-indigo-300/15 pt-3">
        <div className="text-xs text-indigo-100/65">
          {serviceFee > 0 ? `Service fee: +$${serviceFee}` : "No service fee"}
        </div>
        <div className="text-right">
          {serviceFee > 0 ? <p className="text-[11px] text-indigo-100/45">Base ${basePrice}</p> : null}
          <p className="text-xl font-bold text-white">${total}</p>
        </div>
      </div>
    </button>
  );
}
