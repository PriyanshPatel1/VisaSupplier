import { ok, err } from "@/lib/api-response";
import { getSiteContent } from "@/lib/site-content";

export async function GET() {
  try {
    const content = await getSiteContent();
    return ok({ content });
  } catch (error) {
    console.error("[GET /api/content/site]", error);
    return err("Failed to load site content", 500);
  }
}
