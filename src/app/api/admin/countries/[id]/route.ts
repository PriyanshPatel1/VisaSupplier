import { getAdminSession } from "@/lib/get-session";
import { ok, err, notFound, unauthorized } from "@/lib/api-response";
import {
  deleteAdminCountry,
  getAdminCountryById,
  updateAdminCountry,
} from "@/lib/content-catalog";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const country = await getAdminCountryById(id);
    if (!country) return notFound("Country not found");
    return ok(country);
  } catch (e) {
    console.error("[GET /api/admin/countries/[id]]", e);
    return err("Failed to fetch country", 500);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateAdminCountry(id, body);
    if (!updated) return notFound("Country not found");
    return ok(updated);
  } catch (e) {
    console.error("[PATCH /api/admin/countries/[id]]", e);
    const message = e instanceof Error ? e.message : "Failed to update country";
    return err(message, 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const deleted = await deleteAdminCountry(id);
    if (!deleted) return notFound("Country not found");
    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/admin/countries/[id]]", e);
    const message = e instanceof Error ? e.message : "Failed to delete country";
    return err(message, message.includes("Cannot delete") ? 400 : 500);
  }
}
