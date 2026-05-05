export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-500 overflow-hidden">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        <div className="absolute top-1/2 -right-1/4 w-80 h-80 bg-indigo-400/5 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <span className="font-bold text-xl">VisaHub</span>
        </div>

        {/* Content */}
        <div className="z-10">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Streamline your visa operations effortlessly.
          </h1>
          <p className="text-indigo-200 max-w-sm text-lg leading-relaxed">
            Manage suppliers, track applications, and deliver seamless
            experiences across 150+ countries.
          </p>
        </div>

        {/* Footer pills */}
        <div className="flex gap-3 flex-wrap z-10 text-sm">
          <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            150+ Countries
          </span>
          <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Real-time Tracking
          </span>
          <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/20 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure
          </span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-4 sm:p-8 lg:p-16">
        <div className="w-full max-w-md animate-fade-up">
          {children}
        </div>
      </div>
    </div>
  );
}
