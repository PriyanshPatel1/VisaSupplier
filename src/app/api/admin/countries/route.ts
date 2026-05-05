import { getAdminSession } from "@/lib/get-session";
import { ok, err, unauthorized } from "@/lib/api-response";
import { createAdminCountry, listAdminCountries } from "@/lib/content-catalog";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const countries = await listAdminCountries();
    return ok({ countries, total: countries.length });
  } catch (e) {
    console.error("[GET /api/admin/countries]", e);
    return err("Failed to fetch countries", 500);
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();

  try {
    const { name, code, flag, description, continent } = await req.json();
    const country = await createAdminCountry({ name, code, flag, description, continent });
    return ok(country, 201);
  } catch (e) {
    console.error("[POST /api/admin/countries]", e);
    const message = e instanceof Error ? e.message : "Failed to create country";
    return err(message, message.includes("exists") || message.includes("required") ? 400 : 500);
  }
}
