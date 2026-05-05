import { getAdminSession } from "@/lib/get-session";
import { ok, err, unauthorized, notFound } from "@/lib/api-response";
import {
  getPublishedFormConfig,
  getPublishedFormConfigs,
  resetFormOverride,
  saveFormOverride,
} from "@/lib/content-catalog";
import { validateFormBuilderConfig } from "@/lib/form-builder-validation";
import type { WizardConfig } from "@/components/form/GenericWizard";

type Params = { params: Promise<{ visaId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { visaId } = await params;
    const config = await getPublishedFormConfig(visaId);
    if (!config) return notFound("Form not found");

    const allForms = await getPublishedFormConfigs();
    const current = allForms.find((form) => form.visaId === visaId);

    return ok({
      config,
      hasOverride: Boolean(current?.hasOverride),
    });
  } catch (error) {
    console.error("[GET /api/admin/forms/[visaId]]", error);
    return err("Failed to fetch form", 500);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { visaId } = await params;
    const payload = await req.json();

    const configToSave: WizardConfig = {
      ...payload,
      visaId,
    };
    const validation = validateFormBuilderConfig(configToSave);
    if (!validation.valid) {
      return err(validation.issues[0] ?? "Invalid form config payload");
    }

    const saved = await saveFormOverride(configToSave);
    return ok(saved);
  } catch (error) {
    console.error("[PATCH /api/admin/forms/[visaId]]", error);
    return err("Failed to update form", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { visaId } = await params;
    await resetFormOverride(visaId);
    return ok({ reset: true });
  } catch (error) {
    console.error("[DELETE /api/admin/forms/[visaId]]", error);
    return err("Failed to reset form", 500);
  }
}
