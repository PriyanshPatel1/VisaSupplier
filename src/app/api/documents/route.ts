import { NextRequest } from "next/server";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, unauthorized } from "@/lib/api-response";
import { serializeDocument } from "@/lib/document-serializer";
import { createDocumentSchema, parseRequestBody } from "@/lib/validators";

export async function GET() {
  const session = await getUserSession();
  if (!session) return unauthorized();

  const docs = await prisma.document.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  return ok(docs.map((doc) => serializeDocument(doc)));
}

export async function POST(req: NextRequest) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const parsed = await parseRequestBody(req, createDocumentSchema);
    if (!parsed.success) return err(parsed.error);
    const { name, type, size: sizeBytes, fileUrl, publicId, mimeType } = parsed.data;

    const doc = await prisma.document.create({
      data: {
        userId: session.sub,
        name,
        type,
        sizeBytes,
        fileUrl,
        publicId: typeof publicId === "string" && publicId.trim() !== "" ? publicId : null,
        mimeType: typeof mimeType === "string" && mimeType.trim() !== "" ? mimeType : undefined,
        status: "pending",
      },
    });

    return ok(serializeDocument(doc), 201);
  } catch (e) {
    console.error("[POST /api/documents]", e);
    return err("Failed to upload document", 500);
  }
}
