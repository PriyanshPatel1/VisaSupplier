import Image from "next/image";
import Link from "next/link";

type Country = {
  name: string;
  code: string;
  price: string;
  approval: string;
  image?: string;
  processing?: string;
  documents?: number;
};

const FlagPlaceholder = ({ code }: { code: string }) => {
  const icons: Record<string, React.ReactNode> = {
    CA: (
      <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11 3.05V2h2v1.05C16.95 3.5 20 6.8 20 11c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.2 3.05-7.5 7-7.95zM12 17c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z"/>
      </svg>
    ),
    UK: (
      <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    US: (
      <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
      </svg>
    ),
    AU: (
      <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1M4.22 4.22l.71.71m12.73 12.73l.71.71M3 12h1m16 0h1M4.22 19.78l.71-.71M18.36 5.64l.71-.71" />
        <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
      </svg>
    ),
    DE: (
      <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0H5m14 0H5" />
      </svg>
    ),
    JP: (
      <svg className="w-12 h-12 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="6" strokeWidth={1.5} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      </svg>
    ),
  };
  return (
    <div className="w-full h-full flex items-center justify-center">
      {icons[code] || (
        <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" />
        </svg>
      )}
    </div>
  );
};

export default function CountryCard({ country }: { country: Country }) {
  const href = `/country/${country.code}`;

  return (
    <div className="group relative h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20">
      {/* Image Container */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-indigo-600/30 to-purple-600/30">
        {country.image ? (
          <>
            <Image
              src={country.image}
              alt={country.name}
              fill
              loading="eager"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <FlagPlaceholder code={country.code} />
        )}

        {/* Badge */}
        <div className="absolute top-4 right-4">
          <span className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-full backdrop-blur-sm">
            {country.code}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 sm:p-6 flex flex-col h-full">
        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-4">
          {country.name}
        </h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Processing</p>
            <p className="text-sm font-bold text-white">{country.processing || "5-7 days"}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Documents</p>
            <p className="text-sm font-bold text-white">{country.documents || 8} needed</p>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <p className="text-xs text-white/60 mb-1">Starting from</p>
          <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {country.price}
          </p>
        </div>

        {/* Approval Rate */}
        <div className="mb-5 flex-grow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white/70">Approval Success Rate</span>
            <span className="text-xs font-bold text-green-400">{country.approval}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 rounded-full transition-all duration-500 shadow-lg shadow-green-500/50"
              style={{ width: country.approval }}
            />
          </div>
        </div>

        {/* Link Button */}
        <Link
          href={href}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-indigo-500/40 active:scale-95 text-sm sm:text-base relative overflow-hidden text-center block"
          aria-label={`Browse visa options for ${country.name}`}
        >
          <span className="relative z-10">Browse Visas →</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </div>
    </div>
  );
}
