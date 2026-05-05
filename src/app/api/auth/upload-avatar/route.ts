// import { NextRequest } from "next/server";
// import { ok, err, unauthorized } from "@/lib/api-response";
// import { uploadToCloudinary } from "@/lib/cloudinary";
// import { scanFile } from "@/lib/virustotal";
// import { getUserSession, getAdminSession, getSupplierSession } from "@/lib/get-session";

// const MAX_SIZE = 5 * 1024 * 1024;
// const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// export async function POST(req: NextRequest) {
//   // BUG FIX: route had NO auth check — anyone could upload to Cloudinary for free
//   const session =
//     (await getUserSession()) ??
//     (await getAdminSession()) ??
//     (await getSupplierSession());
//   if (!session) return unauthorized();

//   try {
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!(file instanceof File)) {
//       return err("No avatar file provided");
//     }

//     if (!ALLOWED_TYPES.includes(file.type)) {
//       return err("Avatar must be a JPEG, PNG, or WebP image.");
//     }

//     if (file.size > MAX_SIZE) {
//       return err("Avatar is too large. Maximum size is 5MB.");
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());
//     const scan = await scanFile(buffer, file.name);

//     if (!scan.clean) {
//       return err(
//         `Avatar rejected: threat detected (${scan.threatName ?? "unknown"}).`,
//         422
//       );
//     }

//     const result = await uploadToCloudinary(buffer, {
//       folder: "visahub/avatars",
//       resource_type: "image",
//       allowUnsignedFallback: true,
//       transformation: [
//         { width: 1024, height: 1024, crop: "limit", quality: "auto:good" },
//       ],
//     });

//     return ok(
//       {
//         url: result.url,
//         publicId: result.publicId,
//         format: result.format,
//         bytes: result.bytes,
//         name: file.name,
//         type: file.type,
//       },
//       201
//     );
//   } catch (error) {
//     if (
//       error instanceof Error &&
//       (
//         error.message.toLowerCase().includes("cloudinary") ||
//         error.message.toLowerCase().includes("preset")
//       )
//     ) {
//       console.warn("[POST /api/auth/upload-avatar] avatar upload unavailable", {
//         reason: error.message,
//       });
//       return ok(
//         {
//           url: null,
//           unavailable: true,
//           message:
//             "Avatar uploads are temporarily unavailable. You can continue without a profile photo.",
//         },
//         200
//       );
//     }
//     console.error("[POST /api/auth/upload-avatar]", error);
//     return err("Avatar upload failed. Please try again.", 500);
//   }
// }

import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-response";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { scanFile } from "@/lib/virustotal";
import { getUserSession, getAdminSession, getSupplierSession } from "@/lib/get-session";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Simple in-memory rate limiter for unauthenticated uploads.
// Limits: 5 uploads per IP per 10 minutes.
const anonUploadLog = new Map<string, number[]>();
const ANON_LIMIT = 5;
const ANON_WINDOW_MS = 10 * 60 * 1000;

function isAnonRateLimited(ip: string): boolean {
  const now = Date.now();
  const times = (anonUploadLog.get(ip) ?? []).filter((t) => now - t < ANON_WINDOW_MS);
  if (times.length >= ANON_LIMIT) return true;
  times.push(now);
  anonUploadLog.set(ip, times);
  return false;
}

export async function POST(req: NextRequest) {
  // Avatar uploads are allowed without a session because this endpoint is used
  // during registration (before the user account exists / session is set).
  // If the caller IS authenticated we skip the rate-limit check.
  const session =
    (await getUserSession()) ??
    (await getAdminSession()) ??
    (await getSupplierSession());

  if (!session) {
    // Unauthenticated path — apply IP rate limiting to prevent abuse.
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    if (isAnonRateLimited(ip)) {
      return err("Too many upload attempts. Please try again later.", 429);
    }
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return err("No avatar file provided");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return err("Avatar must be a JPEG, PNG, or WebP image.");
    }

    if (file.size > MAX_SIZE) {
      return err("Avatar is too large. Maximum size is 5MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const scan = await scanFile(buffer, file.name);

    if (!scan.clean) {
      return err(
        `Avatar rejected: threat detected (${scan.threatName ?? "unknown"}).`,
        422
      );
    }

    const result = await uploadToCloudinary(buffer, {
      folder: "visahub/avatars",
      resource_type: "image",
      allowUnsignedFallback: true,
      transformation: [
        { width: 1024, height: 1024, crop: "limit", quality: "auto:good" },
      ],
    });

    return ok(
      {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        bytes: result.bytes,
        name: file.name,
        type: file.type,
      },
      201
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message.toLowerCase().includes("cloudinary") ||
        error.message.toLowerCase().includes("preset")
      )
    ) {
      console.warn("[POST /api/auth/upload-avatar] avatar upload unavailable", {
        reason: error.message,
      });
      return ok(
        {
          url: null,
          unavailable: true,
          message:
            "Avatar uploads are temporarily unavailable. You can continue without a profile photo.",
        },
        200
      );
    }
    console.error("[POST /api/auth/upload-avatar]", error);
    return err("Avatar upload failed. Please try again.", 500);
  }
}