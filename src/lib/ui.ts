/**
 * Shared UI utilities — single source of truth.
 * Previously duplicated in navbar.tsx, sidebar.tsx, topbar.tsx, dashboard/page.tsx
 */

export function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function timeAgo(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.floor(diff / 60_000);
  const hr = Math.floor(diff / 3_600_000);
  const day = Math.floor(diff / 86_400_000);

  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day === 1) return "Yesterday";
  if (day < 30) return `${day}d ago`;
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
