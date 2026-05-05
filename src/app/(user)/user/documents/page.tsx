"use client";

import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/dashboard/toast";
import { documentsApi } from "@/lib/api-client";
import type { StoredDocument } from "@/lib/store";
import { csrfHeaders } from "@/lib/csrf";

type DocStatus = StoredDocument["status"];

const STATUS_LABEL: Record<DocStatus, { label: string; tone: string }> = {
  verified: { label: "Verified", tone: "text-emerald-300 bg-emerald-500/16 border-emerald-400/25" },
  pending: { label: "Pending", tone: "text-amber-300 bg-amber-500/16 border-amber-400/25" },
  rejected: { label: "Rejected", tone: "text-rose-300 bg-rose-500/16 border-rose-400/25" },
};

function formatSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(size / 1024)} KB`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DocumentsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DocStatus>("all");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    documentsApi
      .list()
      .then((items) => setDocuments((items as StoredDocument[]) ?? []))
      .catch(() => setDocuments([]));
  }, [user?.id]);

  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !user?.id) return;
      setUploading(true);

      try {
        const fileList = Array.from(files);
        await Promise.all(
          fileList.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "visahub/documents");

            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              credentials: "include",
              headers: { ...csrfHeaders() },
              body: formData,
            });

            if (!uploadRes.ok) {
              throw new Error("Upload failed");
            }

            const payload = await uploadRes.json();
            const fileUrl = payload.data?.url;
            const publicId = payload.data?.publicId;

            await documentsApi.create({
              name: file.name,
              type: file.name.split(".").pop()?.toUpperCase() ?? "FILE",
              size: file.size,
              fileUrl,
              publicId,
              mimeType: file.type,
            });
          }),
        );

        const refreshed = await documentsApi.list();
        setDocuments((refreshed as StoredDocument[]) ?? []);
        showToast("Documents uploaded successfully.", "success");
      } catch {
        showToast("Upload failed. Please check your document files and retry.", "error");
      } finally {
        setUploading(false);
      }
    },
    [showToast, user?.id],
  );

  const removeDocument = async (id: string) => {
    try {
      await documentsApi.delete(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      showToast("Document removed.", "info");
    } catch {
      showToast("Unable to remove document.", "error");
    }
  };

  const filtered = documents.filter((doc) => {
    const query = search.trim().toLowerCase();
    const bySearch = query.length === 0 || doc.name.toLowerCase().includes(query) || doc.type.toLowerCase().includes(query);
    const byStatus = statusFilter === "all" || doc.status === statusFilter;
    return bySearch && byStatus;
  });

  const counts = {
    all: documents.length,
    verified: documents.filter((doc) => doc.status === "verified").length,
    pending: documents.filter((doc) => doc.status === "pending").length,
    rejected: documents.filter((doc) => doc.status === "rejected").length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Documents
          </h1>
          <p className="text-sm text-indigo-100/60">Upload and manage your visa application documents.</p>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} className="user-cta px-4 py-2 text-sm">
          Upload Document
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(event: ChangeEvent<HTMLInputElement>) => uploadFiles(event.target.files)}
        />
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {([
          ["Total", counts.all],
          ["Verified", counts.verified],
          ["Pending", counts.pending],
          ["Rejected", counts.rejected],
        ] as const).map(([label, value]) => (
          <article key={label} className="user-panel rounded-2xl p-4">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-indigo-100/65">{label}</p>
          </article>
        ))}
      </section>

      <section
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-indigo-300/55 bg-indigo-500/12"
            : "border-indigo-300/24 bg-[#0c1432]/55 hover:border-indigo-300/40"
        }`}
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDragOver(false);
          uploadFiles(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-300/40 border-t-indigo-300" />
            <p className="text-sm font-semibold text-white">Uploading files...</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-white">Drag files here or click to browse</p>
            <p className="mt-1 text-xs text-indigo-100/60">Accepted: PDF, JPG, PNG, WebP. Max 10MB per file.</p>
          </>
        )}
      </section>

      <section className="user-panel rounded-2xl p-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["all", "verified", "pending", "rejected"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                  statusFilter === status
                    ? "border-indigo-300/65 bg-indigo-500/24 text-white"
                    : "border-indigo-300/24 text-indigo-100/72"
                }`}
              >
                {status} · {counts[status]}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents"
              className="user-input pl-9"
            />
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-100/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5-5m2-4a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-indigo-300/18 bg-[#0b1430] p-8 text-center">
            <p className="text-base font-semibold text-white">No documents found</p>
            <p className="mt-1 text-sm text-indigo-100/58">Upload a document or adjust your filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((doc) => {
              const meta = STATUS_LABEL[doc.status];
              return (
                <article key={doc.id} className="rounded-xl border border-indigo-300/20 bg-[#0a1330] px-4 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{doc.name}</p>
                      <p className="mt-1 text-xs text-indigo-100/58">
                        {doc.type} · {formatSize(doc.size)} · Uploaded {formatDate(doc.uploadDate)}
                      </p>
                    </div>

                    <span className={`user-badge border ${meta.tone}`}>{meta.label}</span>

                    <div className="flex items-center gap-1">
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="user-outline-btn px-2 py-1 text-xs"
                        >
                          Open
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => showToast("This document is still processing. Please try again shortly.", "info")}
                          className="user-outline-btn px-2 py-1 text-xs"
                        >
                          Open
                        </button>
                      )}
                      <button type="button" onClick={() => removeDocument(doc.id)} className="user-outline-btn px-2 py-1 text-xs">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
