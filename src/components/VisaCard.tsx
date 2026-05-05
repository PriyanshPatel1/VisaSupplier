import Link from "next/link";
import { VisaType } from "@/types";

interface VisaCardProps {
  visa: VisaType;
  showCountry?: boolean;
  countryFlag?: string;
  countryName?: string;
}

const categoryColors: Record<VisaType["category"], string> = {
  tourist: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  student: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  work: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  business: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const categoryIcons: Record<VisaType["category"], string> = {
  tourist: "🏖️",
  student: "🎓",
  work: "💼",
  business: "🤝",
};

export default function VisaCard({
  visa,
  showCountry = false,
  countryFlag,
  countryName,
}: VisaCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-indigo-500/40 hover:bg-white/[0.08] transition-all duration-300 flex flex-col group">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
            categoryColors[visa.category]
          }`}
        >
          {categoryIcons[visa.category]} {visa.category}
        </span>
        <div className="text-right">
          {showCountry && countryFlag && (
            <span className="text-2xl block mb-1">{countryFlag}</span>
          )}
          <span className="text-xl font-bold text-white">${visa.fee}</span>
        </div>
      </div>

      {showCountry && countryName && (
        <p className="text-xs text-gray-500 mb-1">{countryName}</p>
      )}

      <h3 className="font-semibold text-white text-base mb-3 leading-tight group-hover:text-indigo-300 transition-colors">
        {visa.name}
      </h3>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4 flex-1">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">⏱ Processing</p>
          <p className="text-xs text-white font-medium leading-tight">{visa.processingTime}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">📅 Validity</p>
          <p className="text-xs text-white font-medium leading-tight">{visa.validity}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 col-span-2">
          <p className="text-xs text-gray-500 mb-1">🗓 Max Stay</p>
          <p className="text-xs text-white font-medium">{visa.stayDuration}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/visa/${visa.id}`}
          className="text-center py-2 rounded-xl border border-white/15 text-gray-400 text-xs font-medium hover:bg-white/5 hover:text-white transition-all"
        >
          Details
        </Link>
        <Link
          href={`/apply/${visa.id}`}
          className="text-center py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition-all"
        >
          Apply →
        </Link>
      </div>
    </div>
  );
}
