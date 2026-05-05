import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type UploadedDocumentValue = {
  url: string;
  publicId?: string;
  name?: string;
  size?: number;
  mimeType?: string;
};

type ParsedDocumentEntry = {
  label: string;
  type: string;
  fileUrl: string;
  publicId?: string;
  name?: string;
  mimeType?: string;
  sizeBytes?: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function humanizeLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function inferMimeType(fileUrl: string) {
  const normalized = fileUrl.toLowerCase();
  if (normalized.endsWith(".pdf")) return "application/pdf";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function parseUploadedDocument(rawValue: unknown): UploadedDocumentValue | null {
  if (typeof rawValue !== "string") return null;
  const value = rawValue.trim();
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as UploadedDocumentValue;
    if (parsed && typeof parsed.url === "string" && parsed.url.trim()) {
      return {
        url: parsed.url.trim(),
        publicId: typeof parsed.publicId === "string" ? parsed.publicId : undefined,
        name: typeof parsed.name === "string" ? parsed.name : undefined,
        size: typeof parsed.size === "number" ? parsed.size : undefined,
        mimeType: typeof parsed.mimeType === "string" ? parsed.mimeType : undefined,
      };
    }
  } catch {
    if (/^https?:\/\//i.test(value)) {
      return { url: value };
    }
  }

  return null;
}

export function extractApplicationDocumentEntries(value: unknown) {
  const entries = Object.entries(asRecord(value))
    .map(([type, rawValue]) => {
      const uploaded = parseUploadedDocument(rawValue);
      if (!uploaded) return null;

      const label = humanizeLabel(type);
      return {
        label,
        type,
        fileUrl: uploaded.url,
        publicId: uploaded.publicId,
        name: uploaded.name ?? label,
        mimeType: uploaded.mimeType ?? inferMimeType(uploaded.url),
        sizeBytes: uploaded.size ?? 0,
      } satisfies ParsedDocumentEntry;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return Array.from(new Map(entries.map((entry) => [entry.fileUrl, entry])).values());
}

export async function attachApplicationDocuments(
  applicationId: string,
  userId: string,
  value: unknown,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const entries = extractApplicationDocumentEntries(value);
  if (entries.length === 0) return;

  await Promise.all(
    entries.map(async (entry) => {
      const document = await db.document.create({
        data: {
          userId,
          name: entry.name ?? entry.label,
          type: entry.type,
          mimeType: entry.mimeType ?? inferMimeType(entry.fileUrl),
          sizeBytes: entry.sizeBytes ?? 0,
          fileUrl: entry.fileUrl,
          publicId: entry.publicId,
          status: "pending",
        },
      });

      await db.applicationDocument.create({
        data: {
          applicationId,
          documentId: document.id,
          label: entry.label,
        },
      });
    }),
  );
}

type ApplicationDocumentLink = {
  label?: string | null;
  document?: {
    fileUrl?: string | null;
    type?: string | null;
    name?: string | null;
    publicId?: string | null;
    mimeType?: string | null;
    sizeBytes?: number | null;
  } | null;
};

export function toLegacyApplicationDocuments(documents: ApplicationDocumentLink[] | null | undefined) {
  const legacyDocuments: Record<string, string> = {};

  for (const link of documents ?? []) {
    const fileUrl = link.document?.fileUrl?.trim();
    if (!fileUrl) continue;

    const key = link.document?.type?.trim() || link.label?.trim() || link.document?.name?.trim() || "document";
    legacyDocuments[key] = fileUrl;
  }

  return legacyDocuments;
}
