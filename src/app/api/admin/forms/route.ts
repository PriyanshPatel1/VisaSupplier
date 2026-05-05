import { getAdminSession } from "@/lib/get-session";
import { ok, err, unauthorized } from "@/lib/api-response";
import { getPublishedFormConfigs, saveFormOverride } from "@/lib/content-catalog";
import { validateFormBuilderConfig } from "@/lib/form-builder-validation";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const forms = await getPublishedFormConfigs();
    return ok({ forms, total: forms.length });
  } catch (error) {
    console.error("[GET /api/admin/forms]", error);
    return err("Failed to fetch forms", 500);
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const payload = await req.json();
    const validation = validateFormBuilderConfig(payload);
    if (!validation.valid) {
      return err(validation.issues[0] ?? "Invalid form config payload");
    }

    const saved = await saveFormOverride(payload);
    return ok(saved, 201);
  } catch (error) {
    console.error("[POST /api/admin/forms]", error);
    return err("Failed to save form", 500);
  }
}
