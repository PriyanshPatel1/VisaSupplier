import { NextRequest } from "next/server";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";
import { parseOptionalDateTime } from "@/lib/route-helpers";
import { parseRequestBody, updateProfileSchema } from "@/lib/validators";

export async function GET() {
  const session = await getUserSession();
  if (!session) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true, name: true, email: true, avatar: true,
      phone: true, country: true, nationality: true,
      dob: true, gender: true, address: true,
    },
  });

  if (!user) return unauthorized();
  return ok(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const parsed = await parseRequestBody(req, updateProfileSchema);
    if (!parsed.success) return err(parsed.error);
    const body = parsed.data;
    const { name, phone, country, nationality, dob, gender, address, avatar } = body;

    let parsedDob: Date | null | undefined;
    try {
      parsedDob = parseOptionalDateTime(dob, "dob");
    } catch {
      return err("Invalid dob");
    }

    const updated = await prisma.user.update({
      where: { id: session.sub },
      data: {
        name,
        phone,
        country,
        nationality,
        dob: parsedDob,
        gender,
        address,
        avatar,
      },
      select: {
        id: true, name: true, email: true, avatar: true,
        phone: true, country: true, nationality: true,
        dob: true, gender: true, address: true,
      },
    });

    return ok(updated);
  } catch (e) {
    console.error("[PATCH /api/user/profile]", e);
    return err("Failed to update profile", 500);
  }
}
