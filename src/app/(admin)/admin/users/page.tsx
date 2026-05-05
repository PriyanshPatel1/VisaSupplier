"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count: { applications: number };
}

interface NewUserForm {
  name: string; email: string; password: string;
  phone: string; country: string; nationality: string;
}

const EMPTY_FORM: NewUserForm = { name: "", email: "", password: "", phone: "", country: "", nationality: "" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  // Create user modal
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<NewUserForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchUsers = () => {
    adminApi.getUsers()
      .then((data) => {
        const payload = data as User[] | { users?: User[] };
        setUsers(Array.isArray(payload) ? payload : (payload.users ?? []));
        setMounted(true);
      })
      .catch(() => setMounted(true));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async () => {
    setFormError(null);
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError("Name, email, and password are required."); return;
    }
    if (form.password.length < 6) { setFormError("Password min 6 characters."); return; }
    setSaving(true);
    try {
      await adminApi.createUser({
        name: form.name.trim(), email: form.email.trim(), password: form.password,
        phone: form.phone || null, country: form.country || null, nationality: form.nationality || null,
      });
      setAddOpen(false); setForm(EMPTY_FORM); fetchUsers(); showToast("✅ User created");
    } catch (e: unknown) { setFormError(e instanceof Error ? e.message : "Failed to create user"); }
    finally { setSaving(false); }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
    );
  }, [users, search]);

  if (!mounted) return <SkeletonTable rows={6} />;

  const totalApps = users.reduce((a, u) => a + u._count.applications, 0);

  return (
    <div className="space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">{toast}</div>}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => { setAddOpen(true); setFormError(null); setForm(EMPTY_FORM); }}
          className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors sm:w-auto">
          + Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Users",   value: users.length,  icon: "👥", grad: "from-indigo-500 to-violet-600" },
          { label: "Total Apps",    value: totalApps,     icon: "📋", grad: "from-emerald-500 to-teal-600" },
          { label: "Avg Apps/User", value: users.length > 0 ? (totalApps / users.length).toFixed(1) : "0", icon: "📊", grad: "from-amber-400 to-orange-500" },
        ].map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.grad} rounded-2xl p-5 text-white`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-3xl font-black mt-2">{s.value}</p>
            <p className="text-xs text-white/70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search by name, email, or ID…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_80px_130px_100px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
          <span>User</span><span>Email</span><span>Apps</span><span>Joined</span><span>Action</span>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon="👥" title="No users found" description="Users appear here once they register, or create one manually." />
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((u) => (
              <div key={u.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_80px_130px_100px] gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-indigo-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {u.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-[10px] font-mono text-gray-400 truncate">{u.id.slice(0, 12)}…</p>
                  </div>
                </div>
                <div className="flex items-center"><p className="text-sm text-gray-600 truncate">{u.email}</p></div>
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg">{u._count.applications}</span>
                </div>
                <div className="flex items-center">
                  <p className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="flex items-center">
                  <Link href={`/admin/users/${u.id}`} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors">View →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAddOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900">Create User</h2>
              <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {formError && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{formError}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "name",        label: "Full Name *",  type: "text",     placeholder: "John Doe" },
                { id: "email",       label: "Email *",      type: "email",    placeholder: "john@example.com" },
                { id: "password",    label: "Password *",   type: "password", placeholder: "Min 6 characters" },
                { id: "phone",       label: "Phone",        type: "tel",      placeholder: "+91 98765 43210" },
                { id: "country",     label: "Country",      type: "text",     placeholder: "India" },
                { id: "nationality", label: "Nationality",  type: "text",     placeholder: "Indian" },
              ].map((f) => (
                <div key={f.id} className={f.id === "email" || f.id === "password" ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={form[f.id as keyof NewUserForm]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.id]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
              ))}
            </div>
            <div className="flex flex-col-reverse gap-3 mt-5 sm:flex-row">
              <button onClick={handleAdd} disabled={saving} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
                {saving ? "Creating…" : "Create User"}
              </button>
              <button onClick={() => setAddOpen(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
