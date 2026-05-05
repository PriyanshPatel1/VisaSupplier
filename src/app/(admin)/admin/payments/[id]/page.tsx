"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api-client";
import { getFlag } from "@/lib/flags";

interface PaymentDetail {
  id: string;
  visaName: string;
  countryName: string;
  countryCode: string;
  totalPaid: number;
  status: string;
  submittedAt: string;
  updatedAt: string;
  referenceNumber?: string;
  supplierNotes?: string;
  estimatedDecision?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  supplierName: string;
  supplierType: string;
  supplierEmail: string;
  userId?: string;
}

const STATUS_CFG: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  submitted:  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   ring: "ring-blue-300"   },
  processing: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  ring: "ring-amber-300"  },
  approved:   { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  ring: "ring-green-300"  },
  rejected:   { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    ring: "ring-red-300"    },
};

function ReceiptRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-gray-100 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={["break-words text-sm sm:text-right", bold ? "font-black text-gray-900" : "font-semibold text-gray-700"].join(" ")}>{value}</span>
    </div>
  );
}

export default function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("submitted");
  const [editAmount, setEditAmount] = useState("");
  const [editRef, setEditRef] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editEta, setEditEta] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(() => {
    adminApi.getPayment(id)
      .then((d) => {
        const p = d as PaymentDetail;
        setData(p);
        setEditStatus(p.status);
        setEditAmount(String(p.totalPaid));
        setEditRef(p.referenceNumber ?? "");
        setEditNotes(p.supplierNotes ?? "");
        setEditEta(p.estimatedDecision ?? "");
      })
      .catch(() => router.push("/admin/payments"))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!data) return;
    setEditError(null); setSaving(true);
    try {
      await adminApi.updatePayment(id, {
        status: editStatus,
        totalPaid: Number(editAmount),
        referenceNumber: editRef || null,
        supplierNotes: editNotes || null,
        estimatedDecision: editEta || null,
      });
      setEditOpen(false); load(); showToast("✅ Payment updated");
    } catch (e: unknown) { setEditError(e instanceof Error ? e.message : "Failed to update"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminApi.deletePayment(id);
      router.push("/admin/payments");
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "Failed to delete"); setDeleteOpen(false); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <svg className="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );

  if (!data) return null;

  const txId      = `TXN-${data.id.slice(0, 8).toUpperCase()}`;
  const receiptNo = `RCP-${new Date(data.submittedAt).getFullYear()}-${data.id.slice(-6).toUpperCase()}`;
  const scfg      = STATUS_CFG[data.status] ?? STATUS_CFG.submitted;

  const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtDt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold">{toast}</div>}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href="/admin/payments" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-gray-900">Payment Receipt</h1>
          <p className="text-gray-400 text-sm font-mono mt-0.5">{receiptNo}</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:flex">
          <button onClick={() => { setEditOpen(true); setEditError(null); }}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors sm:px-4">
            ✏️ Edit
          </button>
          <button onClick={() => window.print()}
            className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors sm:px-4">
            🖨️ Print
          </button>
          <button onClick={() => setDeleteOpen(true)}
            className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors sm:px-4">
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Receipt Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-5 py-6 text-white sm:px-8 sm:py-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg font-black">V</div>
                <div>
                  <p className="font-bold text-white text-lg leading-none">VisaHub</p>
                  <p className="text-white/60 text-xs">Payment Platform</p>
                </div>
              </div>
              <p className="text-4xl font-black mb-1">${data.totalPaid.toLocaleString()}</p>
              <p className="text-white/70 text-sm">Total Amount Paid</p>
            </div>
            <div className="sm:text-right">
              <span className={["inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border", scfg.bg, scfg.text, scfg.border].join(" ")}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </span>
              <p className="text-white/60 text-xs mt-2">{fmt(data.submittedAt)}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6 sm:p-8">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Transaction Details</h3>
            <ReceiptRow label="Receipt Number"  value={receiptNo} />
            <ReceiptRow label="Transaction ID"  value={txId} />
            <ReceiptRow label="Date & Time"     value={fmtDt(data.submittedAt)} />
            <ReceiptRow label="Last Updated"    value={fmtDt(data.updatedAt)} />
            <ReceiptRow label="Processing Via"  value={`${data.supplierName} (${data.supplierType})`} />
            {data.referenceNumber && <ReceiptRow label="Reference No." value={data.referenceNumber} />}
            {data.estimatedDecision && <ReceiptRow label="Est. Decision" value={data.estimatedDecision} />}
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Application Details</h3>
            <ReceiptRow label="Visa Type"       value={data.visaName} />
            <ReceiptRow label="Destination"     value={`${getFlag(data.countryCode)} ${data.countryName}`} />
            <ReceiptRow label="Application ID"  value={data.id} />
            <ReceiptRow label="Status"          value={data.status.charAt(0).toUpperCase() + data.status.slice(1)} />
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Applicant</h3>
            <ReceiptRow label="Full Name" value={data.userName} />
            <ReceiptRow label="Email"     value={data.userEmail} />
            {data.userPhone && <ReceiptRow label="Phone" value={data.userPhone} />}
          </div>

          {data.supplierNotes && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Supplier Notes</h3>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">{data.supplierNotes}</div>
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Amount Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Visa Application Fee</span><span className="font-semibold text-gray-700">${Math.round(data.totalPaid * 0.82)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Service Charge</span><span className="font-semibold text-gray-700">${Math.round(data.totalPaid * 0.15)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Platform Fee</span><span className="font-semibold text-gray-700">${Math.round(data.totalPaid * 0.03)}</span></div>
              <div className="flex justify-between text-base font-black border-t border-gray-200 pt-3 mt-3">
                <span className="text-gray-900">Total Paid</span>
                <span className="text-indigo-700">${data.totalPaid.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center border-t border-gray-100 pt-6">
            Official payment receipt · VisaHub · support@visahub.com
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={`/admin/applications/${data.id}`}
          className="flex-1 py-3 text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors">
          View Application →
        </Link>
        {data.userId && (
          <Link href={`/admin/users/${data.userId}`}
            className="flex-1 py-3 text-center bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            👤 User Profile
          </Link>
        )}
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900">Edit Payment</h2>
              <button onClick={() => setEditOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {editError && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{editError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Application Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CFG).map(([s, c]) => (
                    <button key={s} onClick={() => setEditStatus(s)}
                      className={["py-2.5 px-3 rounded-xl text-xs font-bold border-2 capitalize transition-all",
                        editStatus === s ? `${c.bg} ${c.text} ${c.border} ring-2 ${c.ring} ring-offset-1` : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"].join(" ")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { id: "editAmount", label: "Total Paid (USD)", val: editAmount, set: setEditAmount, type: "number", placeholder: "185" },
                { id: "editRef",    label: "Reference Number", val: editRef,    set: setEditRef,    type: "text",   placeholder: "VH-2025-00123" },
                { id: "editEta",    label: "Est. Decision",    val: editEta,    set: setEditEta,    type: "text",   placeholder: "2-3 weeks" },
              ].map((f) => (
                <div key={f.id}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Supplier Notes</label>
                <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" />
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 mt-5 sm:flex-row">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditOpen(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <h2 className="font-black text-gray-900 mb-1">Delete Payment Record?</h2>
            <p className="text-sm text-gray-500 mb-1">{data.visaName} — {data.userName}</p>
            <p className="text-xs text-gray-400 mb-6">This permanently removes this payment record. Cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setDeleteOpen(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
