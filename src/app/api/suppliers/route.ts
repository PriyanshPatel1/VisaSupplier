import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-response";

function toUiType(type: string): "embassy" | "agent" {
  if (type.toLowerCase() === "embassy") return "embassy";
  return "agent";
}

function processingTimeFor(type: "embassy" | "agent", multiplier: number): string {
  if (type === "embassy") return "Standard processing";
  if (multiplier >= 1.2) return "Priority processing (25% faster)";
  return "Express processing available";
}

function descriptionFor(type: "embassy" | "agent"): string {
  if (type === "embassy") {
    return "Apply through the official embassy channel with government fee pricing.";
  }
  return "Professional visa agent support with guided review and faster handling.";
}

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        type: true,
        priceMultiplier: true,
        rating: true,
      },
      orderBy: [{ priceMultiplier: "asc" }, { rating: "desc" }],
    });

    const data = suppliers.map((s) => {
      const uiType = toUiType(s.type);
      return {
        id: s.id,
        name: s.name,
        type: uiType,
        priceMultiplier: s.priceMultiplier,
        rating: s.rating,
        processingTime: processingTimeFor(uiType, s.priceMultiplier),
        description: descriptionFor(uiType),
      };
    });

    return ok(data);
  } catch (e) {
    console.error("[GET /api/suppliers]", e);
    return err("Failed to fetch suppliers", 500);
  }
}
