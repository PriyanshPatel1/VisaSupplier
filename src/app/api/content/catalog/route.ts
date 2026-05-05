import { ok, err } from "@/lib/api-response";
import { getPublishedCatalog } from "@/lib/content-catalog";

export async function GET() {
  try {
    const { countries, visas } = await getPublishedCatalog();
    const continents = Array.from(
      new Set(countries.map((country) => country.continent).filter(Boolean)),
    );
    const categories = Array.from(new Set(visas.map((visa) => visa.category).filter(Boolean)));

    return ok({
      countries,
      visas,
      continents,
      categories,
      totals: {
        countries: countries.length,
        visas: visas.length,
      },
    });
  } catch (error) {
    console.error("[GET /api/content/catalog]", error);
    return err("Failed to load catalog", 500);
  }
}
