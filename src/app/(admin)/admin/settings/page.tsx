"use client";

import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api-client";
import { useSuppliers } from "@/hooks/useSuppliers";

interface Settings {
  siteName: string;
  siteEmail: string;
  supportPhone: string;
  currency: string;
  timezone: string;
  defaultSupplier: string;
  requirePhotoUpload: string;
  maintenanceMode: string;
  welcomeMessage: string;
}

const DEFAULTS: Settings = {
  siteName: "VisaHub",
  siteEmail: "support@visahub.com",
  supportPhone: "+1 (800) 123-4567",
  currency: "USD",
  timezone: "UTC",
  defaultSupplier: "",
  requirePhotoUpload: "true",
  maintenanceMode: "false",
  welcomeMessage: "Welcome to VisaHub — your trusted visa application platform.",
};

function InputField({ label, value, onChange, type = "text", hint }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <button type="button" onClick={() => onChange(value === "true" ? "false" : "true")}
        className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${value === "true" ? "bg-indigo-600" : "bg-gray-300"}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value === "true" ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );
}

const TABS = [
  { id: "general",       label: "General",       icon: "⚙️" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "security",      label: "Security",      icon: "🔒" },
  { id: "appearance",    label: "Appearance",    icon: "🎨" },
] as const;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading]   = useState(true);
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "notifications" | "security" | "appearance">("general");
  const { suppliers, loading: suppliersLoading, error: suppliersError } = useSuppliers();

  useEffect(() => {
    adminApi
      .getSettings()
      .then((data) => { setSettings({ ...DEFAULTS, ...(data as Settings) }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (k: keyof Settings, v: string) => setSettings((s) => ({ ...s, [k]: v }));

  const effectiveDefaultSupplier =
    settings.defaultSupplier && suppliers.some((s) => s.id === settings.defaultSupplier)
      ? settings.defaultSupplier
      : (suppliers[0]?.id ?? "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings, defaultSupplier: effectiveDefaultSupplier };
      await adminApi.updateSettings(payload);
      setSettings(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your VisaHub configuration</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="w-full px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70 sm:w-auto">
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save Settings"}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {activeTab === "general" && (
          <div className="space-y-5">
            <p className="font-bold text-gray-900 mb-4">General Settings</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Site Name" value={settings.siteName} onChange={(v) => update("siteName", v)} />
              <InputField label="Support Email" value={settings.siteEmail} onChange={(v) => update("siteEmail", v)} type="email" />
              <InputField label="Support Phone" value={settings.supportPhone} onChange={(v) => update("supportPhone", v)} type="tel" />
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Currency</label>
                <select value={settings.currency} onChange={(e) => update("currency", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                  {["USD", "EUR", "GBP", "INR", "AED", "CAD"].map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Timezone</label>
                <select value={settings.timezone} onChange={(e) => update("timezone", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                  {["UTC", "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Dubai", "Asia/Tokyo"].map((tz) => (<option key={tz} value={tz}>{tz}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Default Supplier</label>
                <select value={effectiveDefaultSupplier} onChange={(e) => update("defaultSupplier", e.target.value)}
                  disabled={suppliersLoading || suppliers.length === 0}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                  {suppliersLoading && <option value="">Loading suppliers...</option>}
                  {!suppliersLoading && suppliers.length === 0 && <option value="">No suppliers available</option>}
                  {!suppliersLoading && suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
                {suppliersError && <p className="text-xs text-red-600 mt-1">Failed to load suppliers: {suppliersError}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Welcome Message</label>
              <textarea value={settings.welcomeMessage} onChange={(e) => update("welcomeMessage", e.target.value)}
                rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" />
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-5">
            <p className="font-bold text-gray-900 mb-4">Notification Settings</p>
            <div className="space-y-4">
              <Toggle label="Email notifications on new application" hint="Send email to admin when a user submits an application" value="true" onChange={() => {}} />
              <Toggle label="SMS alerts for high-priority tickets" hint="Requires SMS provider configuration" value="false" onChange={() => {}} />
              <Toggle label="Daily summary report" hint="Receive daily stats digest at 8AM" value="true" onChange={() => {}} />
              <Toggle label="Supplier notifications" hint="Notify suppliers when applications are assigned to them" value="true" onChange={() => {}} />
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              Notification providers are not configured in this demo. These settings are saved but email/SMS will not actually be sent.
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-5">
            <p className="font-bold text-gray-900 mb-4">Security Settings</p>
            <div className="space-y-4">
              <Toggle label="Maintenance Mode" hint="Show maintenance page to all users. Admin can still access the panel."
                value={settings.maintenanceMode} onChange={(v) => update("maintenanceMode", v)} />
              <Toggle label="Require photo upload" hint="Users must upload a passport photo to complete their application"
                value={settings.requirePhotoUpload} onChange={(v) => update("requirePhotoUpload", v)} />
              <Toggle label="Two-factor authentication for admin" hint="Require 2FA on admin login" value="false" onChange={() => {}} />
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm font-bold text-gray-700 mb-1">Admin Credentials</p>
              <p className="text-xs text-gray-500">Email: <span className="font-mono">admin@visahub.com</span> | Password: <span className="font-mono">admin123</span></p>
              <p className="text-xs text-gray-400 mt-1">These credentials are seeded into the database. Change them by updating the admin user record instead of editing local source files.</p>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-5">
            <p className="font-bold text-gray-900 mb-4">Appearance Settings</p>
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700">
              Appearance customisation (colors, fonts, logos) will be available when connected to a real backend. For now, the theme is defined in Tailwind CSS.
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Indigo (Default)", primary: "#4f46e5", active: true },
                { label: "Blue", primary: "#2563eb", active: false },
                { label: "Emerald", primary: "#059669", active: false },
              ].map((theme) => (
                <div key={theme.label}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${theme.active ? "border-indigo-500" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="w-full h-8 rounded-lg mb-2" style={{ backgroundColor: theme.primary }} />
                  <p className="text-xs font-semibold text-center text-gray-700">{theme.label}</p>
                  {theme.active && <p className="text-xs text-center text-indigo-600 font-bold">Active</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
