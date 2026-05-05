import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { err, ok, unauthorized } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) return unauthorized();

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        country: true,
        nationality: true,
        dob: true,
        gender: true,
        address: true,
      },
    });

    if (!user) return unauthorized("User not found");
    return ok(user);
  } catch (e) {
    console.error("[GET /api/auth/me]", e);
    return err("Failed to fetch user", 500);
  }
}
