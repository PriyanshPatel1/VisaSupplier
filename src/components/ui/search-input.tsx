type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function SearchInput({ value, onChange }: Props) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search countries..."
        className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm sm:text-base"
      />
    </div>
  );
}
