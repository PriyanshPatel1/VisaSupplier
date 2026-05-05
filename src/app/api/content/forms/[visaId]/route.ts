import { ok, err } from "@/lib/api-response";
import { getPublishedFormConfig } from "@/lib/content-catalog";

type Params = { params: Promise<{ visaId: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { visaId } = await params;
    const config = await getPublishedFormConfig(visaId);

    return ok({
      visaId,
      config,
      hasConfig: Boolean(config),
    });
  } catch (error) {
    console.error("[GET /api/content/forms/[visaId]]", error);
    return err("Failed to load form config", 500);
  }
}
