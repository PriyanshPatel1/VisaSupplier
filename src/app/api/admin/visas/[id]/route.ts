import { getAdminSession } from "@/lib/get-session";
import { ok, err, notFound, unauthorized } from "@/lib/api-response";
import { deleteAdminVisa, getAdminVisaById, updateAdminVisa } from "@/lib/content-catalog";
import { writeAudit, auditMeta } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const visa = await getAdminVisaById(id);
    if (!visa) return notFound("Visa not found");
    return ok(visa);
  } catch (e) {
    console.error("[GET /api/admin/visas/[id]]", e);
    return err("Failed to fetch visa", 500);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateAdminVisa(id, body);
    if (!updated) return notFound("Visa not found");
    return ok(updated);
  } catch (e) {
    console.error("[PATCH /api/admin/visas/[id]]", e);
    const message = e instanceof Error ? e.message : "Failed to update visa";
    return err(message, 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const deleted = await deleteAdminVisa(id);
    if (!deleted) return notFound("Visa not found");
    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/admin/visas/[id]]", e);
    const message = e instanceof Error ? e.message : "Failed to delete visa";
    return err(message, message.includes("Cannot delete") ? 400 : 500);
  }
}
