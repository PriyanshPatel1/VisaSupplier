import { ProtectedRoute } from "@/components/auth/protected-route";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen user-shell">
        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
