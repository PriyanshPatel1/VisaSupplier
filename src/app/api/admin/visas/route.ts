import { getAdminSession } from "@/lib/get-session";
import { ok, err, unauthorized } from "@/lib/api-response";
import { createAdminVisa, listAdminVisas } from "@/lib/content-catalog";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const data = await listAdminVisas({
      search: searchParams.get("q"),
      category: searchParams.get("category"),
      country: searchParams.get("country"),
    });
    return ok(data);
  } catch (e) {
    console.error("[GET /api/admin/visas]", e);
    return err("Failed to fetch visas", 500);
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const visa = await createAdminVisa(body);
    return ok(visa, 201);
  } catch (e) {
    console.error("[POST /api/admin/visas]", e);
    const message = e instanceof Error ? e.message : "Failed to create visa";
    return err(message, message.includes("exists") || message.includes("required") ? 400 : 500);
  }
}
