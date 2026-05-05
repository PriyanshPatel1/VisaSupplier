import { NextRequest } from "next/server";
import { getUserSession, getSupplierSession, getAdminSession } from "@/lib/get-session";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ok, err, unauthorized } from "@/lib/api-response";
import { scanFile } from "@/lib/virustotal";

import { logger } from "@/lib/logger";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const ALLOWED_FOLDERS = [
  "visahub/documents",
  "visahub/avatars",
  "visahub/logos",
  "visahub/applications",
] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

function sanitizeFolder(value: FormDataEntryValue | null): AllowedFolder {
  const folder = typeof value === "string" ? value : "";
  return ALLOWED_FOLDERS.includes(folder as AllowedFolder)
    ? (folder as AllowedFolder)
    : "visahub/documents";
}

const uploadLogger = logger.child({ route: "POST /api/upload" });

export async function POST(req: NextRequest) {
  // Auth
  const session =
    (await getUserSession()) ??
    (await getAdminSession()) ??
    (await getSupplierSession());
  if (!session) return unauthorized();


  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = sanitizeFolder(formData.get("folder"));

    if (!file) return err("No file provided");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return err(`File type '${file.type}' not allowed. Use JPEG, PNG, WebP, or PDF.`);
    }
    if (file.size > MAX_SIZE) return err("File too large. Maximum size is 10MB.");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // VirusTotal scan
    const scan = await scanFile(buffer, file.name);
    if (!scan.clean) {
      uploadLogger.warn({ userId: session.sub, filename: file.name, threat: scan.threatName }, "Malicious file blocked");
      return err(`File rejected: threat detected (${scan.threatName ?? "unknown"}).`, 422);
    }

    const resourceType = file.type === "application/pdf" ? "raw" : "image";

    const result = await uploadToCloudinary(buffer, {
      folder,
      resource_type: resourceType,
      transformation:
        resourceType === "image"
          ? [{ width: 2000, height: 2000, crop: "limit", quality: "auto:good" }]
          : undefined,
    });

    uploadLogger.info({ userId: session.sub, folder, bytes: result.bytes }, "Upload success");

    return ok({ url: result.url, publicId: result.publicId, format: result.format, bytes: result.bytes, name: file.name, type: file.type }, 201);
  } catch (e) {
    uploadLogger.error({ err: e, userId: session?.sub }, "Upload failed");
    return err("Upload failed. Please try again.", 500);
  }
}
