// "use client";

// import { ChangeEvent, useEffect, useState } from "react";
// import { useAuth, type User } from "@/providers/auth-provider";
// import { useToast } from "@/components/dashboard/toast";
// import { csrfHeaders } from "@/lib/csrf";
// import { Application } from "@prisma/client";

// // ─── Types ────────────────────────────────────────────────────────────────────

// type SectionTab = "applications" | "security";

// type ExtendedUser = User & {
//   role?: string;
//   bio?: string;
//   githubUrl?: string;
//   linkedinUrl?: string;
//   twitterUrl?: string;
//   websiteUrl?: string;
// };

// interface ConnectedApp {
//   id: string;
//   name: string;
//   connectedOn: string;
//   status: "Active" | "Inactive";
//   icon: string; // emoji or initials fallback
//   color: string; // bg colour for icon wrapper
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const PROFILE_FIELDS: Array<{
//   key: keyof ExtendedUser;
//   label: string;
//   type?: string;
//   placeholder: string;
//   full?: boolean;
// }> = [
//   { key: "name", label: "Full Name", placeholder: "Arjun Patel", full: true },
//   {
//     key: "email",
//     label: "Email Address",
//     type: "email",
//     placeholder: "arjun@example.com",
//     full: true,
//   },
//   {
//     key: "phone",
//     label: "Phone Number",
//     type: "tel",
//     placeholder: "+91 98765 43210",
//   },
//   { key: "dob", label: "Date of Birth", type: "date", placeholder: "" },
//   { key: "nationality", label: "Nationality", placeholder: "Indian" },
//   { key: "gender", label: "Gender", placeholder: "Male" },
//   { key: "country", label: "Country of Residence", placeholder: "India" },
//   {
//     key: "address",
//     label: "Home Address",
//     placeholder: "Bengaluru, Karnataka",
//     full: true,
//   },
// ];

// const COMPLETION_KEYS: Array<keyof ExtendedUser> = [
//   "name",
//   "email",
//   "phone",
//   "dob",
//   "nationality",
//   "gender",
//   "country",
//   "address",
// ];

// const MOCK_APPS: ConnectedApp[] = [
//   {
//     id: "github",
//     name: "GitHub",
//     connectedOn: "Feb 12, 2024",
//     status: "Active",
//     icon: "GH",
//     color: "#24292e",
//   },
//   {
//     id: "vercel",
//     name: "Vercel",
//     connectedOn: "Mar 05, 2024",
//     status: "Active",
//     icon: "▲",
//     color: "#000000",
//   },
//   {
//     id: "netlify",
//     name: "Netlify",
//     connectedOn: "Apr 18, 2024",
//     status: "Active",
//     icon: "NF",
//     color: "#00ad9f",
//   },
//   {
//     id: "postman",
//     name: "Postman",
//     connectedOn: "May 21, 2024",
//     status: "Active",
//     icon: "PM",
//     color: "#ef5b25",
//   },
// ];

// const STATS = [
//   {
//     label: "Projects",
//     value: "24",
//     iconBg: "#ede9fe",
//     iconColor: "#7c3aed",
//     icon: IconProjects,
//   },
//   {
//     label: "Articles",
//     value: "18",
//     iconBg: "#dbeafe",
//     iconColor: "#2563eb",
//     icon: IconArticles,
//   },
//   {
//     label: "Followers",
//     value: "1.2K",
//     iconBg: "#dcfce7",
//     iconColor: "#16a34a",
//     icon: IconFollowers,
//   },
//   {
//     label: "Following",
//     value: "320",
//     iconBg: "#fef9c3",
//     iconColor: "#ca8a04",
//     icon: IconFollowing,
//   },
//   {
//     label: "Profile Views",
//     value: "12.5K",
//     iconBg: "#fce7f3",
//     iconColor: "#db2777",
//     icon: IconViews,
//   },
// ];

// // ─── Icons ────────────────────────────────────────────────────────────────────

// function IconProjects({ color }: { color: string }) {
//   return (
//     <svg
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={color}
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="2" y="3" width="20" height="14" rx="2" />
//       <path d="M8 21h8M12 17v4" />
//     </svg>
//   );
// }
// function IconArticles({ color }: { color: string }) {
//   return (
//     <svg
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={color}
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//       <polyline points="14 2 14 8 20 8" />
//       <line x1="16" y1="13" x2="8" y2="13" />
//       <line x1="16" y1="17" x2="8" y2="17" />
//       <polyline points="10 9 9 9 8 9" />
//     </svg>
//   );
// }
// function IconFollowers({ color }: { color: string }) {
//   return (
//     <svg
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={color}
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//       <circle cx="9" cy="7" r="4" />
//       <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
//     </svg>
//   );
// }
// function IconFollowing({ color }: { color: string }) {
//   return (
//     <svg
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={color}
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//       <circle cx="12" cy="7" r="4" />
//     </svg>
//   );
// }
// function IconViews({ color }: { color: string }) {
//   return (
//     <svg
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={color}
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//       <circle cx="12" cy="12" r="3" />
//     </svg>
//   );
// }
// function IconMail() {
//   return (
//     <svg
//       width="14"
//       height="14"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
//       <polyline points="22,6 12,13 2,6" />
//     </svg>
//   );
// }
// function IconPin() {
//   return (
//     <svg
//       width="14"
//       height="14"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
//       <circle cx="12" cy="10" r="3" />
//     </svg>
//   );
// }
// function IconCalendar() {
//   return (
//     <svg
//       width="14"
//       height="14"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
//       <line x1="16" y1="2" x2="16" y2="6" />
//       <line x1="8" y1="2" x2="8" y2="6" />
//       <line x1="3" y1="10" x2="21" y2="10" />
//     </svg>
//   );
// }
// function IconCheck() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c3aed">
//       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
//     </svg>
//   );
// }
// function IconShare() {
//   return (
//     <svg
//       width="18"
//       height="18"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <circle cx="18" cy="5" r="3" />
//       <circle cx="6" cy="12" r="3" />
//       <circle cx="18" cy="19" r="3" />
//       <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
//       <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
//     </svg>
//   );
// }
// function IconEdit() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//       <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//     </svg>
//   );
// }
// function IconGithub() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
//     </svg>
//   );
// }
// function IconLinkedIn() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
//     </svg>
//   );
// }
// function IconTwitter() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59l-.047-.02z" />
//     </svg>
//   );
// }
// function IconGlobe() {
//   return (
//     <svg
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <circle cx="12" cy="12" r="10" />
//       <line x1="2" y1="12" x2="22" y2="12" />
//       <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
//     </svg>
//   );
// }
// function IconShield() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//     </svg>
//   );
// }
// function IconApps() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="3" y="3" width="7" height="7" />
//       <rect x="14" y="3" width="7" height="7" />
//       <rect x="14" y="14" width="7" height="7" />
//       <rect x="3" y="14" width="7" height="7" />
//     </svg>
//   );
// }
// function IconDots() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
//       <circle cx="5" cy="12" r="2" />
//       <circle cx="12" cy="12" r="2" />
//       <circle cx="19" cy="12" r="2" />
//     </svg>
//   );
// }
// function IconPlus() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2.5"
//       strokeLinecap="round"
//     >
//       <line x1="12" y1="5" x2="12" y2="19" />
//       <line x1="5" y1="12" x2="19" y2="12" />
//     </svg>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function completionScore(user: Partial<ExtendedUser> | null) {
//   if (!user) return 0;
//   const done = COMPLETION_KEYS.filter((key) => Boolean(user[key])).length;
//   return Math.round((done / COMPLETION_KEYS.length) * 100);
// }

// function inputClass() {
//   return "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function Avatar({ name }: { name?: string }) {
//   const initials = name
//     ? name
//         .split(" ")
//         .map((p) => p[0])
//         .join("")
//         .slice(0, 2)
//         .toUpperCase()
//     : "U";
//   return (
//     <div className="relative">
//       <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c4b5fd,#7c3aed)] text-2xl font-black text-white ring-4 ring-white shadow-lg">
//         {initials}
//       </div>
//       {/* Online indicator */}
//       <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
//     </div>
//   );
// }

// function SocialButton({
//   children,
//   href,
// }: {
//   children: React.ReactNode;
//   href?: string;
// }) {
//   return (
//     <a
//       href={href ?? "#"}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-600 hover:shadow-md"
//     >
//       {children}
//     </a>
//   );
// }

// function StatCard({
//   label,
//   value,
//   iconBg,
//   iconColor,
//   icon: Icon,
// }: {
//   label: string;
//   value: string;
//   iconBg: string;
//   iconColor: string;
//   icon: React.ComponentType<{ color: string }>;
// }) {
//   return (
//     <div className="flex flex-1 items-center gap-3 border-r border-slate-100 px-6 py-5 last:border-r-0">
//       <div
//         className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
//         style={{ background: iconBg }}
//       >
//         <Icon color={iconColor} />
//       </div>
//       <div>
//         <p className="text-xl font-black text-slate-950">{value}</p>
//         <p className="text-xs text-slate-500">{label}</p>
//       </div>
//     </div>
//   );
// }

// function AppCard({ app }: { app: ConnectedApp }) {
//   return (
//     <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
//       <div className="flex items-start justify-between">
//         <div
//           className="flex h-12 w-12 items-center justify-center rounded-2xl text-white text-sm font-black shadow"
//           style={{ background: app.color }}
//         >
//           {app.icon}
//         </div>
//         <button
//           type="button"
//           className="text-slate-400 hover:text-slate-700 transition"
//         >
//           <IconDots />
//         </button>
//       </div>
//       <div>
//         <p className="font-bold text-slate-950">{app.name}</p>
//         <p className="text-xs text-slate-500 mt-0.5">
//           Connected on {app.connectedOn}
//         </p>
//       </div>
//       <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
//         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//         {app.status}
//       </span>
//     </div>
//   );
// }

// function SecurityRow({
//   title,
//   description,
//   action,
//   disabled,
//   onClick,
// }: {
//   title: string;
//   description: string;
//   action: string;
//   disabled?: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
//     >
//       <div>
//         <p className="text-sm font-semibold text-slate-950">{title}</p>
//         <p className="mt-0.5 text-xs text-slate-500">{description}</p>
//       </div>
//       <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
//         {action}
//       </span>
//     </button>
//   );
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────

// export default function ProfilePage() {
//   const { user: rawUser, updateUser } = useAuth();
//   const user = rawUser as ExtendedUser | null;
//   const { showToast } = useToast();

//   const [section, setSection] = useState<SectionTab>("applications");
//   const [editing, setEditing] = useState(false);
//   const [form, setForm] = useState<Partial<ExtendedUser>>(user ?? {});
//   const [saving, setSaving] = useState(false);

//   const [passwordOpen, setPasswordOpen] = useState(false);
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordError, setPasswordError] = useState<string | null>(null);
//   const [passwordSaving, setPasswordSaving] = useState(false);
//   const [apps, setApps] = useState<Application[]>([]);
//   const [loadingApps, setLoadingApps] = useState(false);
//   useEffect(() => {
//     if (section !== "applications") return;

//     const fetchApps = async () => {
//       setLoadingApps(true);
//       try {
//         const res = await fetch("/api/applications?page=1&pageSize=8", {
//           credentials: "include",
//         });

//         const data = await res.json();

//         if (!res.ok) throw new Error();

//         setApps(data.items); // ✅ correct
//       } catch {
//         setApps([]);
//       } finally {
//         setLoadingApps(false);
//       }
//     };

//     fetchApps();
//   }, [section]);

//   useEffect(() => {
//     if (user) setForm(user);
//   }, [user]);

//   const memberSince = user?.createdAt
//     ? new Date(user.createdAt).toLocaleDateString("en-GB", {
//         month: "short",
//         year: "numeric",
//       })
//     : "Jan 2023";

//   const onFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const saveProfile = async () => {
//     const next: Partial<ExtendedUser> = {
//       ...form,
//       name: form.name?.trim(),
//       email: form.email?.trim().toLowerCase(),
//       phone: form.phone?.trim(),
//       nationality: form.nationality?.trim(),
//       gender: form.gender?.trim(),
//       country: form.country?.trim(),
//       address: form.address?.trim(),
//     };
//     if (!next.name || !next.email) {
//       showToast("Name and email are required.", "error");
//       return;
//     }
//     setSaving(true);
//     try {
//       await updateUser(next);
//       setEditing(false);
//       showToast("Profile updated successfully.", "success");
//     } catch {
//       showToast("Unable to update profile.", "error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updatePassword = async () => {
//     setPasswordError(null);
//     if (!currentPassword || !newPassword || !confirmPassword) {
//       setPasswordError("All password fields are required.");
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       setPasswordError("Passwords do not match.");
//       return;
//     }
//     if (newPassword.length < 6) {
//       setPasswordError("Password must be at least 6 characters.");
//       return;
//     }
//     setPasswordSaving(true);
//     try {
//       const response = await fetch("/api/user/password", {
//         method: "PATCH",
//         credentials: "include",
//         headers: { "Content-Type": "application/json", ...csrfHeaders() },
//         body: JSON.stringify({ currentPassword, newPassword }),
//       });
//       const payload = await response.json();
//       if (!response.ok)
//         throw new Error(payload.error ?? "Failed to update password.");
//       setPasswordOpen(false);
//       setCurrentPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//       showToast("Password updated.", "success");
//     } catch (error) {
//       setPasswordError(
//         error instanceof Error ? error.message : "Failed to update password.",
//       );
//     } finally {
//       setPasswordSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-5">
//       {/* ── Profile hero card ── */}
//       <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
//         {/* Top section */}
//         <div className="px-8 pt-8 pb-6 border-b border-slate-100">
//           <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
//             {/* Left: avatar + info */}
//             <div className="flex gap-5">
//               <Avatar name={user?.name} />
//               <div className="flex flex-col justify-center gap-1">
//                 <div className="flex items-center gap-2">
//                   <h1 className="text-2xl font-black tracking-tight text-slate-950">
//                     {user?.name ?? "Your Name"}
//                   </h1>
//                   <IconCheck />
//                 </div>
//                 <p className="text-sm font-semibold text-violet-600">
//                   {user?.role ?? "Full Stack Developer"}
//                 </p>
//                 <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
//                   <span className="flex items-center gap-1">
//                     <IconMail /> {user?.email ?? "—"}
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <IconPin /> {user?.country ?? "—"}
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <IconCalendar /> Joined {memberSince}
//                   </span>
//                 </div>
//                 <p className="mt-2 max-w-md text-sm text-slate-600 leading-relaxed">
//                   {user?.bio ??
//                     "Building scalable web applications with clean code and great user experience."}
//                 </p>
//                 {/* Social links */}
//                 <div className="mt-3 flex gap-2">
//                   <SocialButton href={user?.githubUrl}>
//                     <IconGithub />
//                   </SocialButton>
//                   <SocialButton href={user?.linkedinUrl}>
//                     <IconLinkedIn />
//                   </SocialButton>
//                   <SocialButton href={user?.twitterUrl}>
//                     <IconTwitter />
//                   </SocialButton>
//                   <SocialButton href={user?.websiteUrl}>
//                     <IconGlobe />
//                   </SocialButton>
//                 </div>
//               </div>
//             </div>

//             {/* Right: action buttons */}
//             <div className="flex shrink-0 gap-2">
//               <button
//                 type="button"
//                 onClick={() => setEditing(true)}
//                 className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
//               >
//                 <IconEdit /> Edit Profile
//               </button>
//               <button
//                 type="button"
//                 className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300"
//               >
//                 <IconShare />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats row */}
//         <div className="flex flex-wrap divide-x divide-slate-100 overflow-x-auto">
//           {STATS.map((s) => (
//             <StatCard key={s.label} {...s} />
//           ))}
//         </div>
//       </div>

//       {/* ── Tabs ── */}
//       <div className="flex gap-1 border-b border-slate-200">
//         {(["applications", "security"] as const).map((tab) => (
//           <button
//             key={tab}
//             type="button"
//             onClick={() => setSection(tab)}
//             className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
//               section === tab
//                 ? "border-violet-600 text-violet-700"
//                 : "border-transparent text-slate-500 hover:text-slate-800"
//             }`}
//           >
//             {tab === "applications" ? (
//               <>
//                 <IconApps /> Applications
//               </>
//             ) : (
//               <>
//                 <IconShield /> Security
//               </>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* ── Applications panel ── */}
//       {/* ── Applications panel ── */}
//       {section === "applications" && (
//         <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
//           <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
//             <div>
//               <h2 className="text-lg font-bold text-slate-950">
//                 Connected Applications
//               </h2>
//               <p className="mt-1 text-sm text-slate-500">
//                 Manage and monitor applications connected to your account.
//               </p>
//             </div>
//             <button
//               type="button"
//               className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
//             >
//               <IconPlus /> Connect New App
//             </button>
//           </div>

//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             {loadingApps ? (
//               <p className="text-sm text-slate-500">Loading...</p>
//             ) : apps.length === 0 ? (
//               <p className="text-sm text-slate-500">No applications found.</p>
//             ) : (
//               apps.map((app) => (
//                 <AppCard
//                   key={app.id}
//                   app={{
//                     id: app.id,
//                     name: app.visaName,
//                     connectedOn: new Date(app.createdAt).toLocaleDateString(
//                       "en-GB",
//                       {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                       },
//                     ),
//                     status:
//                       app.status === "approved" || app.status === "processing"
//                         ? "Active"
//                         : "Inactive",
//                     icon: app.countryName?.slice(0, 2).toUpperCase() || "AP",
//                     color: "#7c3aed",
//                   }}
//                 />
//               ))
//             )}
//           </div>
//         </div>
//       )}

//       {/* ── Security panel ── */}
//       {section === "security" && (
//         <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
//           <h2 className="text-lg font-bold text-slate-950">
//             Protect your account
//           </h2>
//           <p className="mt-1 mb-5 text-sm text-slate-500">
//             Manage password and keep your account safe.
//           </p>
//           <div className="space-y-3">
//             <SecurityRow
//               title="Password"
//               description="Change your password regularly and use a strong, unique combination."
//               action="Change"
//               onClick={() => {
//                 setPasswordError(null);
//                 setCurrentPassword("");
//                 setNewPassword("");
//                 setConfirmPassword("");
//                 setPasswordOpen(true);
//               }}
//             />
//             <SecurityRow
//               title="Two-factor authentication"
//               description="An additional verification layer will be available in a future release."
//               action="Coming soon"
//               disabled
//               onClick={() => {}}
//             />
//             <SecurityRow
//               title="Session management"
//               description="Review active device sessions once session controls are enabled."
//               action="Coming soon"
//               disabled
//               onClick={() => {}}
//             />
//           </div>
//         </div>
//       )}

//       {/* ── Edit profile modal ── */}
//       {editing && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div
//             className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
//             onClick={() => setEditing(false)}
//           />
//           <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)]">
//             <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
//               <div>
//                 <h3 className="text-lg font-bold text-slate-950">
//                   Edit Profile
//                 </h3>
//                 <p className="mt-0.5 text-sm text-slate-500">
//                   Update your personal information.
//                 </p>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setForm(user ?? {});
//                     setEditing(false);
//                   }}
//                   className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={saveProfile}
//                   disabled={saving}
//                   className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
//                 >
//                   {saving ? "Saving…" : "Save changes"}
//                 </button>
//               </div>
//             </div>
//             <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
//               {PROFILE_FIELDS.map((field) => (
//                 <div
//                   key={field.key}
//                   className={`bg-white px-6 py-5 ${field.full ? "sm:col-span-2" : ""}`}
//                 >
//                   <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                     {field.label}
//                   </label>
//                   <input
//                     name={field.key as string}
//                     type={field.type ?? "text"}
//                     placeholder={field.placeholder}
//                     value={(form[field.key] as string | undefined) ?? ""}
//                     onChange={onFieldChange}
//                     className={inputClass()}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Change password modal ── */}
//       {passwordOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div
//             className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
//             onClick={() => setPasswordOpen(false)}
//           />
//           <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)]">
//             <div className="border-b border-slate-200 px-6 py-5">
//               <h3 className="text-lg font-bold text-slate-950">
//                 Change Password
//               </h3>
//               <p className="mt-0.5 text-sm text-slate-500">
//                 Use a strong password you don&apos;t reuse elsewhere.
//               </p>
//             </div>
//             <div className="space-y-4 px-6 py-5">
//               {passwordError && (
//                 <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
//                   {passwordError}
//                 </div>
//               )}
//               {[
//                 {
//                   label: "Current Password",
//                   value: currentPassword,
//                   set: setCurrentPassword,
//                 },
//                 {
//                   label: "New Password",
//                   value: newPassword,
//                   set: setNewPassword,
//                 },
//                 {
//                   label: "Confirm Password",
//                   value: confirmPassword,
//                   set: setConfirmPassword,
//                 },
//               ].map((f) => (
//                 <div key={f.label}>
//                   <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                     {f.label}
//                   </label>
//                   <input
//                     type="password"
//                     value={f.value}
//                     onChange={(e) => f.set(e.target.value)}
//                     className={inputClass()}
//                   />
//                 </div>
//               ))}
//             </div>
//             <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
//               <button
//                 type="button"
//                 onClick={() => setPasswordOpen(false)}
//                 className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={updatePassword}
//                 disabled={passwordSaving}
//                 className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
//               >
//                 {passwordSaving ? "Updating…" : "Update password"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// "use client";

// import { ChangeEvent, useEffect, useState } from "react";
// import { useAuth, type User } from "@/providers/auth-provider";
// import { useToast } from "@/components/dashboard/toast";
// import { csrfHeaders } from "@/lib/csrf";
// import { Application } from "@prisma/client";

// // ─── Types ────────────────────────────────────────────────────────────────────

// type SectionTab = "applications" | "security";

// type ExtendedUser = User & {
//   role?: string;
//   bio?: string;
//   githubUrl?: string;
//   linkedinUrl?: string;
//   twitterUrl?: string;
//   websiteUrl?: string;
// };

// interface ConnectedApp {
//   id: string;
//   name: string;
//   connectedOn: string;
//   status: "Active" | "Inactive";
//   icon: string;
//   color: string;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const PROFILE_FIELDS: Array<{
//   key: keyof ExtendedUser;
//   label: string;
//   type?: string;
//   placeholder: string;
//   full?: boolean;
// }> = [
//   { key: "name", label: "Full Name", placeholder: "Arjun Patel", full: true },
//   {
//     key: "email",
//     label: "Email Address",
//     type: "email",
//     placeholder: "arjun@example.com",
//     full: true,
//   },
//   {
//     key: "phone",
//     label: "Phone Number",
//     type: "tel",
//     placeholder: "+91 98765 43210",
//   },
//   { key: "dob", label: "Date of Birth", type: "date", placeholder: "" },
//   { key: "nationality", label: "Nationality", placeholder: "Indian" },
//   { key: "gender", label: "Gender", placeholder: "Male" },
//   { key: "country", label: "Country of Residence", placeholder: "India" },
//   {
//     key: "address",
//     label: "Home Address",
//     placeholder: "Bengaluru, Karnataka",
//     full: true,
//   },
// ];

// const COMPLETION_KEYS: Array<keyof ExtendedUser> = [
//   "name",
//   "email",
//   "phone",
//   "dob",
//   "nationality",
//   "gender",
//   "country",
//   "address",
// ];

// // ─── Icons ────────────────────────────────────────────────────────────────────

// function IconMail() {
//   return (
//     <svg
//       width="14"
//       height="14"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
//       <polyline points="22,6 12,13 2,6" />
//     </svg>
//   );
// }
// function IconPin() {
//   return (
//     <svg
//       width="14"
//       height="14"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
//       <circle cx="12" cy="10" r="3" />
//     </svg>
//   );
// }
// function IconCalendar() {
//   return (
//     <svg
//       width="14"
//       height="14"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
//       <line x1="16" y1="2" x2="16" y2="6" />
//       <line x1="8" y1="2" x2="8" y2="6" />
//       <line x1="3" y1="10" x2="21" y2="10" />
//     </svg>
//   );
// }
// function IconCheck() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c3aed">
//       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
//     </svg>
//   );
// }
// function IconShare() {
//   return (
//     <svg
//       width="18"
//       height="18"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <circle cx="18" cy="5" r="3" />
//       <circle cx="6" cy="12" r="3" />
//       <circle cx="18" cy="19" r="3" />
//       <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
//       <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
//     </svg>
//   );
// }
// function IconEdit() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//       <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//     </svg>
//   );
// }
// function IconGithub() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
//     </svg>
//   );
// }
// function IconLinkedIn() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
//     </svg>
//   );
// }
// function IconTwitter() {
//   return (
//     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59l-.047-.02z" />
//     </svg>
//   );
// }
// function IconGlobe() {
//   return (
//     <svg
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <circle cx="12" cy="12" r="10" />
//       <line x1="2" y1="12" x2="22" y2="12" />
//       <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
//     </svg>
//   );
// }
// function IconShield() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//     </svg>
//   );
// }
// function IconApps() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect x="3" y="3" width="7" height="7" />
//       <rect x="14" y="3" width="7" height="7" />
//       <rect x="14" y="14" width="7" height="7" />
//       <rect x="3" y="14" width="7" height="7" />
//     </svg>
//   );
// }
// function IconDots() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
//       <circle cx="5" cy="12" r="2" />
//       <circle cx="12" cy="12" r="2" />
//       <circle cx="19" cy="12" r="2" />
//     </svg>
//   );
// }
// function IconPlus() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2.5"
//       strokeLinecap="round"
//     >
//       <line x1="12" y1="5" x2="12" y2="19" />
//       <line x1="5" y1="12" x2="19" y2="12" />
//     </svg>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function inputClass() {
//   return "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function Avatar({ name }: { name?: string }) {
//   const initials = name
//     ? name
//         .split(" ")
//         .map((p) => p[0])
//         .join("")
//         .slice(0, 2)
//         .toUpperCase()
//     : "U";
//   return (
//     <div className="relative">
//       <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c4b5fd,#7c3aed)] text-2xl font-black text-white ring-4 ring-white shadow-lg">
//         {initials}
//       </div>
//       <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
//     </div>
//   );
// }

// function SocialButton({
//   children,
//   href,
// }: {
//   children: React.ReactNode;
//   href?: string;
// }) {
//   return (
//     <a
//       href={href ?? "#"}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-600 hover:shadow-md"
//     >
//       {children}
//     </a>
//   );
// }

// function AppCard({ app }: { app: ConnectedApp }) {
//   return (
//     <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
//       <div className="flex items-start justify-between">
//         <div
//           className="flex h-12 w-12 items-center justify-center rounded-2xl text-white text-sm font-black shadow"
//           style={{ background: app.color }}
//         >
//           {app.icon}
//         </div>
//         <button
//           type="button"
//           className="text-slate-400 hover:text-slate-700 transition"
//         >
//           <IconDots />
//         </button>
//       </div>
//       <div>
//         <p className="font-bold text-slate-950">{app.name}</p>
//         <p className="text-xs text-slate-500 mt-0.5">
//           Connected on {app.connectedOn}
//         </p>
//       </div>
//       <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
//         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//         {app.status}
//       </span>
//     </div>
//   );
// }

// function SecurityRow({
//   title,
//   description,
//   action,
//   disabled,
//   onClick,
// }: {
//   title: string;
//   description: string;
//   action: string;
//   disabled?: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
//     >
//       <div>
//         <p className="text-sm font-semibold text-slate-950">{title}</p>
//         <p className="mt-0.5 text-xs text-slate-500">{description}</p>
//       </div>
//       <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
//         {action}
//       </span>
//     </button>
//   );
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────

// export default function ProfilePage() {
//   const { user: rawUser, updateUser } = useAuth();
//   const user = rawUser as ExtendedUser | null;
//   const { showToast } = useToast();

//   const [section, setSection] = useState<SectionTab>("applications");
//   const [editing, setEditing] = useState(false);
//   const [form, setForm] = useState<Partial<ExtendedUser>>(user ?? {});
//   const [saving, setSaving] = useState(false);

//   const [passwordOpen, setPasswordOpen] = useState(false);
//   const [currentPassword, setCurrentPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordError, setPasswordError] = useState<string | null>(null);
//   const [passwordSaving, setPasswordSaving] = useState(false);

//   const [apps, setApps] = useState<Application[]>([]);
//   const [loadingApps, setLoadingApps] = useState(false);

//   useEffect(() => {
//     if (section !== "applications") return;

//     const fetchApps = async () => {
//       setLoadingApps(true);
//       try {
//         const res = await fetch("/api/applications?page=1&pageSize=8", {
//           credentials: "include",
//         });
//         const data = await res.json();
//         if (!res.ok) throw new Error();
//         setApps(Array.isArray(data.items) ? data.items : []);
//       } catch {
//         setApps([]);
//       } finally {
//         setLoadingApps(false);
//       }
//     };

//     fetchApps();
//   }, [section]);

//   useEffect(() => {
//     if (user) setForm(user);
//   }, [user]);

//   const memberSince = user?.createdAt
//     ? new Date(user.createdAt).toLocaleDateString("en-GB", {
//         month: "short",
//         year: "numeric",
//       })
//     : null;

//   const onFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const saveProfile = async () => {
//     const next: Partial<ExtendedUser> = {
//       ...form,
//       name: form.name?.trim(),
//       email: form.email?.trim().toLowerCase(),
//       phone: form.phone?.trim(),
//       nationality: form.nationality?.trim(),
//       gender: form.gender?.trim(),
//       country: form.country?.trim(),
//       address: form.address?.trim(),
//     };
//     if (!next.name || !next.email) {
//       showToast("Name and email are required.", "error");
//       return;
//     }
//     setSaving(true);
//     try {
//       await updateUser(next);
//       setEditing(false);
//       showToast("Profile updated successfully.", "success");
//     } catch {
//       showToast("Unable to update profile.", "error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updatePassword = async () => {
//     setPasswordError(null);
//     if (!currentPassword || !newPassword || !confirmPassword) {
//       setPasswordError("All password fields are required.");
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       setPasswordError("Passwords do not match.");
//       return;
//     }
//     if (newPassword.length < 6) {
//       setPasswordError("Password must be at least 6 characters.");
//       return;
//     }
//     setPasswordSaving(true);
//     try {
//       const response = await fetch("/api/user/password", {
//         method: "PATCH",
//         credentials: "include",
//         headers: { "Content-Type": "application/json", ...csrfHeaders() },
//         body: JSON.stringify({ currentPassword, newPassword }),
//       });
//       const payload = await response.json();
//       if (!response.ok)
//         throw new Error(payload.error ?? "Failed to update password.");
//       setPasswordOpen(false);
//       setCurrentPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//       showToast("Password updated.", "success");
//     } catch (error) {
//       setPasswordError(
//         error instanceof Error ? error.message : "Failed to update password.",
//       );
//     } finally {
//       setPasswordSaving(false);
//     }
//   };

//   return (
//     <div className="space-y-5">
//       {/* ── Profile hero card ── */}
//       <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
//         <div className="px-8 pt-8 pb-6">
//           <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
//             {/* Left: avatar + info */}
//             <div className="flex gap-5">
//               <Avatar name={user?.name} />
//               <div className="flex flex-col justify-center gap-1">
//                 <div className="flex items-center gap-2">
//                   <h1 className="text-2xl font-black tracking-tight text-slate-950">
//                     {user?.name ?? "—"}
//                   </h1>
//                   <IconCheck />
//                 </div>
//                 {user?.role && (
//                   <p className="text-sm font-semibold text-violet-600">
//                     {user.role}
//                   </p>
//                 )}
//                 <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
//                   {user?.email && (
//                     <span className="flex items-center gap-1">
//                       <IconMail /> {user.email}
//                     </span>
//                   )}
//                   {user?.country && (
//                     <span className="flex items-center gap-1">
//                       <IconPin /> {user.country}
//                     </span>
//                   )}
//                   {memberSince && (
//                     <span className="flex items-center gap-1">
//                       <IconCalendar /> Joined {memberSince}
//                     </span>
//                   )}
//                 </div>
//                 {user?.bio && (
//                   <p className="mt-2 max-w-md text-sm text-slate-600 leading-relaxed">
//                     {user.bio}
//                   </p>
//                 )}
//                 {/* Social links — only render if at least one URL exists */}
//                 {(user?.githubUrl ||
//                   user?.linkedinUrl ||
//                   user?.twitterUrl ||
//                   user?.websiteUrl) && (
//                   <div className="mt-3 flex gap-2">
//                     {user.githubUrl && (
//                       <SocialButton href={user.githubUrl}>
//                         <IconGithub />
//                       </SocialButton>
//                     )}
//                     {user.linkedinUrl && (
//                       <SocialButton href={user.linkedinUrl}>
//                         <IconLinkedIn />
//                       </SocialButton>
//                     )}
//                     {user.twitterUrl && (
//                       <SocialButton href={user.twitterUrl}>
//                         <IconTwitter />
//                       </SocialButton>
//                     )}
//                     {user.websiteUrl && (
//                       <SocialButton href={user.websiteUrl}>
//                         <IconGlobe />
//                       </SocialButton>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Right: action buttons */}
//             <div className="flex shrink-0 gap-2">
//               <button
//                 type="button"
//                 onClick={() => setEditing(true)}
//                 className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
//               >
//                 <IconEdit /> Edit Profile
//               </button>
//               <button
//                 type="button"
//                 className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300"
//               >
//                 <IconShare />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Tabs ── */}
//       <div className="flex gap-1 border-b border-slate-200">
//         {(["applications", "security"] as const).map((tab) => (
//           <button
//             key={tab}
//             type="button"
//             onClick={() => setSection(tab)}
//             className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
//               section === tab
//                 ? "border-violet-600 text-violet-700"
//                 : "border-transparent text-slate-500 hover:text-slate-800"
//             }`}
//           >
//             {tab === "applications" ? (
//               <>
//                 <IconApps /> Applications
//               </>
//             ) : (
//               <>
//                 <IconShield /> Security
//               </>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* ── Applications panel ── */}
//       {section === "applications" && (
//         <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
//           <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
//             <div>
//               <h2 className="text-lg font-bold text-slate-950">
//                 Connected Applications
//               </h2>
//               <p className="mt-1 text-sm text-slate-500">
//                 Manage and monitor applications connected to your account.
//               </p>
//             </div>
//             <button
//               type="button"
//               className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
//             >
//               <IconPlus /> Connect New App
//             </button>
//           </div>

//           <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             {loadingApps ? (
//               <p className="text-sm text-slate-500">Loading…</p>
//             ) : apps.length === 0 ? (
//               <p className="text-sm text-slate-500">No applications found.</p>
//             ) : (
//               apps.map((app) => (
//                 <AppCard
//                   key={app.id}
//                   app={{
//                     id: app.id,
//                     name: app.visaName,
//                     connectedOn: new Date(app.createdAt).toLocaleDateString(
//                       "en-GB",
//                       { day: "2-digit", month: "short", year: "numeric" },
//                     ),
//                     status:
//                       app.status === "approved" || app.status === "processing"
//                         ? "Active"
//                         : "Inactive",
//                     icon: app.countryName?.slice(0, 2).toUpperCase() || "AP",
//                     color: "#7c3aed",
//                   }}
//                 />
//               ))
//             )}
//           </div>
//         </div>
//       )}

//       {/* ── Security panel ── */}
//       {section === "security" && (
//         <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
//           <h2 className="text-lg font-bold text-slate-950">
//             Protect your account
//           </h2>
//           <p className="mt-1 mb-5 text-sm text-slate-500">
//             Manage password and keep your account safe.
//           </p>
//           <div className="space-y-3">
//             <SecurityRow
//               title="Password"
//               description="Change your password regularly and use a strong, unique combination."
//               action="Change"
//               onClick={() => {
//                 setPasswordError(null);
//                 setCurrentPassword("");
//                 setNewPassword("");
//                 setConfirmPassword("");
//                 setPasswordOpen(true);
//               }}
//             />
//             <SecurityRow
//               title="Two-factor authentication"
//               description="An additional verification layer will be available in a future release."
//               action="Coming soon"
//               disabled
//               onClick={() => {}}
//             />
//             <SecurityRow
//               title="Session management"
//               description="Review active device sessions once session controls are enabled."
//               action="Coming soon"
//               disabled
//               onClick={() => {}}
//             />
//           </div>
//         </div>
//       )}

//       {/* ── Edit profile modal ── */}
//       {editing && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div
//             className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
//             onClick={() => setEditing(false)}
//           />
//           <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)]">
//             <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
//               <div>
//                 <h3 className="text-lg font-bold text-slate-950">
//                   Edit Profile
//                 </h3>
//                 <p className="mt-0.5 text-sm text-slate-500">
//                   Update your personal information.
//                 </p>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setForm(user ?? {});
//                     setEditing(false);
//                   }}
//                   className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={saveProfile}
//                   disabled={saving}
//                   className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
//                 >
//                   {saving ? "Saving…" : "Save changes"}
//                 </button>
//               </div>
//             </div>
//             <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
//               {PROFILE_FIELDS.map((field) => (
//                 <div
//                   key={field.key}
//                   className={`bg-white px-6 py-5 ${field.full ? "sm:col-span-2" : ""}`}
//                 >
//                   <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                     {field.label}
//                   </label>
//                   <input
//                     name={field.key as string}
//                     type={field.type ?? "text"}
//                     placeholder={field.placeholder}
//                     value={(form[field.key] as string | undefined) ?? ""}
//                     onChange={onFieldChange}
//                     className={inputClass()}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Change password modal ── */}
//       {passwordOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div
//             className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
//             onClick={() => setPasswordOpen(false)}
//           />
//           <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)]">
//             <div className="border-b border-slate-200 px-6 py-5">
//               <h3 className="text-lg font-bold text-slate-950">
//                 Change Password
//               </h3>
//               <p className="mt-0.5 text-sm text-slate-500">
//                 Use a strong password you don&apos;t reuse elsewhere.
//               </p>
//             </div>
//             <div className="space-y-4 px-6 py-5">
//               {passwordError && (
//                 <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
//                   {passwordError}
//                 </div>
//               )}
//               {[
//                 {
//                   label: "Current Password",
//                   value: currentPassword,
//                   set: setCurrentPassword,
//                 },
//                 {
//                   label: "New Password",
//                   value: newPassword,
//                   set: setNewPassword,
//                 },
//                 {
//                   label: "Confirm Password",
//                   value: confirmPassword,
//                   set: setConfirmPassword,
//                 },
//               ].map((f) => (
//                 <div key={f.label}>
//                   <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
//                     {f.label}
//                   </label>
//                   <input
//                     type="password"
//                     value={f.value}
//                     onChange={(e) => f.set(e.target.value)}
//                     className={inputClass()}
//                   />
//                 </div>
//               ))}
//             </div>
//             <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
//               <button
//                 type="button"
//                 onClick={() => setPasswordOpen(false)}
//                 className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="button"
//                 onClick={updatePassword}
//                 disabled={passwordSaving}
//                 className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
//               >
//                 {passwordSaving ? "Updating…" : "Update password"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useAuth, type User } from "@/providers/auth-provider";
import { useToast } from "@/components/dashboard/toast";
import { csrfHeaders } from "@/lib/csrf";
import { Application } from "@prisma/client";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionTab = "applications" | "security";

type ExtendedUser = User & {
  role?: string;
  avatar?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string | Date | null;
  // not in schema — dummy display only
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
};

interface ConnectedApp {
  id: string;
  name: string;
  connectedOn: string;
  status: "Active" | "Inactive" | "Approved";
  icon: string;
  color: string;
  rawStatus?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROFILE_FIELDS: Array<{
  key: keyof ExtendedUser;
  label: string;
  type?: string;
  placeholder: string;
  full?: boolean;
}> = [
  { key: "name", label: "Full Name", placeholder: "Arjun Patel", full: true },
  {
    key: "email",
    label: "Email Address",
    type: "email",
    placeholder: "arjun@example.com",
    full: true,
  },
  {
    key: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+91 98765 43210",
  },
  { key: "dob", label: "Date of Birth", type: "date", placeholder: "" },
  { key: "nationality", label: "Nationality", placeholder: "Indian" },
  { key: "gender", label: "Gender", placeholder: "Male" },
  { key: "country", label: "Country of Residence", placeholder: "India" },
  {
    key: "address",
    label: "Home Address",
    placeholder: "Bengaluru, Karnataka",
    full: true,
  },
];

const COMPLETION_KEYS: Array<keyof ExtendedUser> = [
  "name",
  "email",
  "phone",
  "dob",
  "nationality",
  "gender",
  "country",
  "address",
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconMail() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#7c3aed">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
    </svg>
  );
}
function IconShare() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IconGithub() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function IconTwitter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59l-.047-.02z" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconApps() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconDots() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputClass() {
  return "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  name,
  avatar,
  isActive,
}: {
  name?: string;
  avatar?: string;
  isActive?: boolean;
}) {
  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
  const dotColor = isActive === false ? "bg-slate-400" : "bg-emerald-400";
  return (
    <div className="relative">
      {avatar ? (
        <img
          src={avatar}
          alt={name ?? "avatar"}
          className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c4b5fd,#7c3aed)] text-2xl font-black text-white ring-4 ring-white shadow-lg">
          {initials}
        </div>
      )}
      <span
        className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white ${dotColor}`}
      />
    </div>
  );
}

function SocialButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-600 hover:shadow-md"
    >
      {children}
    </a>
  );
}

function AppRow({ app }: { app: ConnectedApp }) {
  const statusMap: Record<string, { badge: string; label: string; dot: string }> = {
    approved:   { badge: "bg-emerald-50 text-emerald-700 border border-emerald-200", label: "Approved",   dot: "bg-emerald-500" },
    submitted:  { badge: "bg-blue-50 text-blue-700 border border-blue-200",         label: "Submitted",  dot: "bg-blue-500" },
    processing: { badge: "bg-amber-50 text-amber-700 border border-amber-200",       label: "Processing", dot: "bg-amber-500" },
    rejected:   { badge: "bg-red-50 text-red-700 border border-red-200",             label: "Rejected",   dot: "bg-red-400" },
    cancelled:  { badge: "bg-slate-100 text-slate-500 border border-slate-200",      label: "Cancelled",  dot: "bg-slate-400" },
    draft:      { badge: "bg-slate-100 text-slate-500 border border-slate-200",      label: "Draft",      dot: "bg-slate-400" },
  };
  const raw = (app.rawStatus ?? "").toLowerCase();
  const s = statusMap[raw] ?? { badge: "bg-slate-100 text-slate-500 border border-slate-200", label: app.rawStatus ?? app.status, dot: "bg-slate-400" };

  return (
    <a
      href={`/user/applications/${app.id}`}
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-violet-300 hover:bg-violet-50/40 hover:shadow-sm"
    >
      {/* Country icon */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-xs font-black shadow-sm"
        style={{ background: app.color }}
      >
        {app.icon}
      </div>

      {/* Visa name */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-violet-700 transition-colors">
          {app.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Applied {app.connectedOn}</p>
      </div>

      {/* Status badge */}
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.badge}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </span>

      {/* Chevron */}
      <svg className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-violet-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

function SecurityRow({
  title,
  description,
  action,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  action: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div>
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
        {action}
      </span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user: rawUser, updateUser } = useAuth();
  const user = rawUser as ExtendedUser | null;
  const { showToast } = useToast();

  const [section, setSection] = useState<SectionTab>("applications");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<ExtendedUser>>(user ?? {});
  const [saving, setSaving] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [apps, setApps] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    if (section !== "applications") return;

    const fetchApps = async () => {
      setLoadingApps(true);
      try {
        const res = await fetch("/api/applications?page=1&pageSize=50", {
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to load applications");
        // API response shape: { ok: true, data: { items: Application[], meta: {...} } }
        const items = json?.data?.items;
        setApps(Array.isArray(items) ? items : []);
      } catch (e) {
        console.error("[ProfilePage] fetchApps:", e);
        setApps([]);
      } finally {
        setLoadingApps(false);
      }
    };

    fetchApps();
  }, [section]);

  useEffect(() => {
    if (user) setForm(user);
  }, [user]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : null;

  const onFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    const next: Partial<ExtendedUser> = {
      ...form,
      name: form.name?.trim(),
      email: form.email?.trim().toLowerCase(),
      phone: form.phone?.trim(),
      nationality: form.nationality?.trim(),
      gender: form.gender?.trim(),
      country: form.country?.trim(),
      address: form.address?.trim(),
    };
    if (!next.name || !next.email) {
      showToast("Name and email are required.", "error");
      return;
    }
    setSaving(true);
    try {
      await updateUser(next);
      setEditing(false);
      showToast("Profile updated successfully.", "success");
    } catch {
      showToast("Unable to update profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    setPasswordError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    setPasswordSaving(true);
    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error ?? "Failed to update password.");
      setPasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated.", "success");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to update password.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Profile hero card ── */}
      <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: avatar + info */}
            <div className="flex gap-5">
              <Avatar
                name={user?.name}
                avatar={user?.avatar}
                isActive={user?.isActive}
              />
              <div className="flex flex-col justify-center gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">
                    {user?.name ?? "—"}
                  </h1>
                  <IconCheck />
                </div>
                {user?.role && (
                  <p className="text-sm font-semibold text-violet-600">
                    {user.role}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {user?.email && (
                    <span className="flex items-center gap-1">
                      <IconMail /> {user.email}
                    </span>
                  )}
                  {user?.country && (
                    <span className="flex items-center gap-1">
                      <IconPin /> {user.country}
                    </span>
                  )}
                  {memberSince && (
                    <span className="flex items-center gap-1">
                      <IconCalendar /> Joined {memberSince}
                    </span>
                  )}
                  {user?.lastLoginAt && (
                    <span className="flex items-center gap-1">
                      Last login{" "}
                      {new Date(user.lastLoginAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                {/* Badges: emailVerified + isActive */}
                <div className="mt-1 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      user?.emailVerified
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {user?.emailVerified
                      ? "✓ Email verified"
                      : "⚠ Email unverified"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      user?.isActive !== false
                        ? "bg-violet-50 text-violet-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {user?.isActive !== false
                      ? "Active account"
                      : "Inactive account"}
                  </span>
                </div>
                <p className="mt-2 max-w-md text-sm text-slate-600 leading-relaxed">
                  {user?.bio ??
                    "Building scalable web applications with clean code and great user experience."}
                </p>
                {/* Social links — dummy # when URL not set */}
                <div className="mt-3 flex gap-2">
                  <SocialButton href={user?.githubUrl ?? "#"}>
                    <IconGithub />
                  </SocialButton>
                  <SocialButton href={user?.linkedinUrl ?? "#"}>
                    <IconLinkedIn />
                  </SocialButton>
                  <SocialButton href={user?.twitterUrl ?? "#"}>
                    <IconTwitter />
                  </SocialButton>
                  <SocialButton href={user?.websiteUrl ?? "#"}>
                    <IconGlobe />
                  </SocialButton>
                </div>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                <IconEdit /> Edit Profile
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300"
              >
                <IconShare />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-slate-200">
        {(["applications", "security"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSection(tab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
              section === tab
                ? "border-violet-600 text-violet-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "applications" ? (
              <>
                <IconApps /> Applications
              </>
            ) : (
              <>
                <IconShield /> Security
              </>
            )}
          </button>
        ))}
      </div>

      {/* ── Applications panel ── */}
      {section === "applications" && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                My Applications
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Track and manage your visa applications.
              </p>
            </div>
            <Link
              href="/countries"
              type="button"
              className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              <IconPlus /> Create New Application
            </Link>
          </div>

          {loadingApps ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl border border-slate-100 bg-slate-50" />
              ))}
            </div>
          ) : apps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <IconApps />
              </div>
              <p className="text-sm font-semibold text-slate-700">No applications yet</p>
              <p className="mt-1 text-xs text-slate-400">Start by applying for a visa below.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-1">
              {apps.map((app) => (
                <AppRow
                  key={app.id}
                  app={{
                    id: app.id,
                    name: app.visaName,
                    connectedOn: new Date(app.createdAt).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" },
                    ),
                    status:
                      app.status === "approved"
                        ? "Approved"
                        : app.status === "processing" || app.status === "submitted"
                          ? "Active"
                          : "Inactive",
                    rawStatus: app.status,
                    icon: app.countryName?.slice(0, 2).toUpperCase() || "AP",
                    color: "#7c3aed",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Security panel ── */}
      {section === "security" && (
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            Protect your account
          </h2>
          <p className="mt-1 mb-5 text-sm text-slate-500">
            Manage password and keep your account safe.
          </p>
          <div className="space-y-3">
            <SecurityRow
              title="Password"
              description="Change your password regularly and use a strong, unique combination."
              action="Change"
              onClick={() => {
                setPasswordError(null);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setPasswordOpen(true);
              }}
            />
            <SecurityRow
              title="Two-factor authentication"
              description="An additional verification layer will be available in a future release."
              action="Coming soon"
              disabled
              onClick={() => {}}
            />
            <SecurityRow
              title="Session management"
              description="Review active device sessions once session controls are enabled."
              action="Coming soon"
              disabled
              onClick={() => {}}
            />
          </div>
        </div>
      )}

      {/* ── Edit profile modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setEditing(false)}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Edit Profile
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Update your personal information.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(user ?? {});
                    setEditing(false);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
            <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
              {PROFILE_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className={`bg-white px-6 py-5 ${field.full ? "sm:col-span-2" : ""}`}
                >
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {field.label}
                  </label>
                  <input
                    name={field.key as string}
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    value={(form[field.key] as string | undefined) ?? ""}
                    onChange={onFieldChange}
                    className={inputClass()}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Change password modal ── */}
      {passwordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setPasswordOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)]">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="text-lg font-bold text-slate-950">
                Change Password
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">
                Use a strong password you don&apos;t reuse elsewhere.
              </p>
            </div>
            <div className="space-y-4 px-6 py-5">
              {passwordError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {passwordError}
                </div>
              )}
              {[
                {
                  label: "Current Password",
                  value: currentPassword,
                  set: setCurrentPassword,
                },
                {
                  label: "New Password",
                  value: newPassword,
                  set: setNewPassword,
                },
                {
                  label: "Confirm Password",
                  value: confirmPassword,
                  set: setConfirmPassword,
                },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {f.label}
                  </label>
                  <input
                    type="password"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className={inputClass()}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setPasswordOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updatePassword}
                disabled={passwordSaving}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {passwordSaving ? "Updating…" : "Update password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
