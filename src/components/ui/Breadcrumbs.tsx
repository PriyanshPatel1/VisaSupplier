"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  supplier: "Supplier",
  user: "My Account",
  dashboard: "Dashboard",
  applications: "Applications",
  forms: "Form Builder",
  users: "Users",
  suppliers: "Suppliers",
  payments: "Payments",
  visas: "Visa Types",
  countries: "Countries",
  notifications: "Notifications",
  support: "Support",
  settings: "Settings",
  profile: "Profile",
  documents: "Documents",
  billing: "Billing",
  new: "New",
  edit: "Edit",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Don't show on root or single-segment paths
  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    // Dynamic route segments look like UUIDs or specific IDs — display shortened
    const isDynamic = seg.length > 20 || /^[0-9a-f-]{8,}$/i.test(seg);
    const label = isDynamic
      ? seg.slice(0, 8) + "…"
      : (SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1));

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-gray-400">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-300">/</span>}
          {crumb.isLast ? (
            <span className="text-gray-700 font-semibold">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-gray-700 transition-colors font-medium"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
