import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";

const SETTINGS_KEY = "admin_site_settings";

const DEFAULTS = {
  siteName: "VisaHub",
  siteEmail: "support@visahub.com",
  supportPhone: "+1 (800) 123-4567",
  currency: "USD",
  timezone: "UTC",
  defaultSupplier: "",
  requirePhotoUpload: "true",
  maintenanceMode: "false",
  welcomeMessage: "Welcome to VisaHub - your trusted visa application platform.",
};

const ALLOWED_SETTINGS_KEYS = [
  "siteName",
  "siteEmail",
  "supportPhone",
  "currency",
  "timezone",
  "defaultSupplier",
  "requirePhotoUpload",
  "maintenanceMode",
  "welcomeMessage",
] as const;

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const record = await prisma.adminConfig.findUnique({ where: { key: SETTINGS_KEY } });
    const stored = record ? (record.value as Record<string, string>) : {};
    return ok({ ...DEFAULTS, ...stored });
  } catch (e) {
    console.error("[GET /api/admin/settings]", e);
    return err("Failed to fetch settings", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const sanitized = Object.fromEntries(
      Object.entries(body ?? {}).filter(([key]) =>
        ALLOWED_SETTINGS_KEYS.includes(key as (typeof ALLOWED_SETTINGS_KEYS)[number]),
      ),
    );

    const record = await prisma.adminConfig.findUnique({ where: { key: SETTINGS_KEY } });
    const current = record ? (record.value as Record<string, string>) : {};
    const updated = { ...DEFAULTS, ...current, ...sanitized };

    await prisma.adminConfig.upsert({
      where: { key: SETTINGS_KEY },
      create: { key: SETTINGS_KEY, value: updated },
      update: { value: updated },
    });

    return ok(updated);
  } catch (e) {
    console.error("[PATCH /api/admin/settings]", e);
    return err("Failed to save settings", 500);
  }
}
