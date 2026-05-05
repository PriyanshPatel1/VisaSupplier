"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supplierApi } from "@/lib/api-client";

interface Profile {
  id: string;
  name: string;
  email: string;
  type: string;
  priceMultiplier: number;
  rating: number;
  createdAt: string;
  totalApplications: number;
}

export default function SupplierProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Name edit
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    supplierApi.getProfile()
      .then((data) => {
        const p = data as Profile;
        setProfile(p);
        setName(p.name);
      })
      .catch(() => router.push("/supplier/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSaveName = async () => {
    if (!name.trim() || name === profile?.name) return;
    setSavingName(true);
    try {
      const updated = await supplierApi.updateProfile({ name: name.trim() }) as Profile;
      setProfile((p) => p ? { ...p, name: updated.name } : p);
      setNameSaved(true);
      showToast("✅ Name updated");
      setTimeout(() => setNameSaved(false), 3000);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update name");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError(null);
    if (!currentPw || !newPw || !confirmPw) { setPwError("All fields required."); return; }
    if (newPw !== confirmPw) { setPwError("New passwords do not match."); return; }
    if (newPw.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    setSavingPw(true);
    try {
      await supplierApi.updateProfile({ currentPassword: currentPw, newPassword: newPw });
      setPwSaved(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showToast("✅ Password changed");
      setTimeout(() => setPwSaved(false), 3000);
    } catch (e: unknown) {
      setPwError(e instanceof Error ? e.message : "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <svg className="w-8 h-8 animate-spin text-[#0f2d5a]" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">{toast}</div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account information</p>
      </div>

      {/* Profile card */}
      <div className="bg-[#0f2d5a] rounded-2xl p-6 text-white flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-black flex-shrink-0">
          {profile.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{profile.name}</h2>
          <p className="text-white/60 text-sm truncate">{profile.email}</p>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs font-semibold bg-white/15 px-2.5 py-1 rounded-full capitalize">{profile.type}</span>
            <span className="text-xs text-amber-300">⭐ {profile.rating}</span>
            <span className="text-xs text-white/50">{profile.totalApplications} applications</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Member Since", value: new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) },
          { label: "Rating",       value: `${profile.rating} / 5.0` },
          { label: "Applications", value: String(profile.totalApplications) },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
            <p className="text-lg font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Edit name */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Display Name</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30"
          />
          <button
            onClick={handleSaveName}
            disabled={savingName || !name.trim() || name === profile.name}
            className="px-5 py-2.5 bg-[#0f2d5a] hover:bg-[#0b2347] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {savingName ? "Saving…" : nameSaved ? "✅ Saved" : "Save"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Email: <span className="font-mono">{profile.email}</span> (contact admin to change)</p>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
        {pwError && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{pwError}</div>
        )}
        <div className="space-y-3">
          {[
            { id: "currentPw",  label: "Current Password",  val: currentPw,  set: setCurrentPw },
            { id: "newPw",      label: "New Password",       val: newPw,      set: setNewPw },
            { id: "confirmPw",  label: "Confirm New Password", val: confirmPw, set: setConfirmPw },
          ].map((f) => (
            <div key={f.id}>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">{f.label}</label>
              <input
                type="password"
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2d5a]/30"
              />
            </div>
          ))}
          <button
            onClick={handleChangePassword}
            disabled={savingPw || !currentPw || !newPw || !confirmPw}
            className="w-full py-2.5 bg-[#0f2d5a] hover:bg-[#0b2347] text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 mt-1"
          >
            {savingPw ? "Updating…" : pwSaved ? "✅ Password Changed" : "Change Password"}
          </button>
        </div>
      </div>

      {/* Read-only info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Account Details</h3>
        <div className="space-y-3">
          {[
            { label: "Supplier ID",       value: profile.id },
            { label: "Type",              value: profile.type },
            { label: "Price Multiplier",  value: `${profile.priceMultiplier}x` },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{row.label}</span>
              <span className="text-sm font-semibold text-gray-800 font-mono">{row.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">To change supplier type or price multiplier, contact the platform administrator.</p>
      </div>
    </div>
  );
}
