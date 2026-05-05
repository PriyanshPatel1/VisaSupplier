import { NextRequest } from "next/server";
import { getUserSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { ok, err, notFound, forbidden, unauthorized } from "@/lib/api-response";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { serializeDocument } from "@/lib/document-serializer";
import { parseRequestBody, updateDocumentSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });

  if (!doc) return notFound("Document not found");
  if (doc.userId !== session.sub) return forbidden();

  return ok(serializeDocument(doc));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) return notFound("Document not found");
    if (doc.userId !== session.sub) return forbidden();

    const parsed = await parseRequestBody(req, updateDocumentSchema);
    if (!parsed.success) return err(parsed.error);
    const { name, fileUrl } = parsed.data;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (fileUrl !== undefined) data.fileUrl = fileUrl;

    const updated = await prisma.document.update({ where: { id }, data });
    return ok(serializeDocument(updated));
  } catch (e) {
    console.error("[PATCH /api/documents/[id]]", e);
    return err("Failed to update document", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getUserSession();
  if (!session) return unauthorized();

  try {
    const { id } = await params;
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc) return notFound("Document not found");
    if (doc.userId !== session.sub) return forbidden();

    if (doc.publicId) {
      await deleteFromCloudinary(doc.publicId);
    }

    await prisma.document.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e) {
    console.error("[DELETE /api/documents/[id]]", e);
    return err("Failed to delete document", 500);
  }
}
