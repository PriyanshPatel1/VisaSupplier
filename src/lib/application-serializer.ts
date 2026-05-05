import { Prisma } from "@prisma/client";
import { toLegacyApplicationDocuments } from "@/lib/application-documents";
import { toIsoOrNull } from "@/lib/route-helpers";

type SerializableUser = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type SerializableSupplier = {
  id?: string | null;
  name?: string | null;
  type?: string | null;
};

type SerializableApplication = {
  id?: string | null;
  visaId?: string | null;
  visaSlug?: string | null;
  submittedAt?: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  supplierUpdatedAt?: Date | string | null;
  estimatedDecision?: Date | string | null;
  userId?: string | null;
  supplierId?: string | null;
  user?: SerializableUser | null;
  supplier?: SerializableSupplier | null;
  documents?: Array<{
    label?: string | null;
    document?: {
      fileUrl?: string | null;
      type?: string | null;
      name?: string | null;
    } | null;
  }> | null;
  [key: string]: unknown;
};

export const applicationResponseInclude = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  supplier: { select: { id: true, name: true, type: true, email: true } },
  documents: {
    include: {
      document: {
        select: {
          id: true,
          name: true,
          type: true,
          fileUrl: true,
          status: true,
        },
      },
    },
  },
} satisfies Prisma.ApplicationInclude;

export function serializeApplication<T extends SerializableApplication>(app: T) {
  return {
    ...app,
    visaId: app.visaSlug ?? app.visaId ?? "",
    submittedAt:
      toIsoOrNull(app.submittedAt) ??
      toIsoOrNull(app.createdAt) ??
      toIsoOrNull(app.updatedAt) ??
      new Date().toISOString(),
    updatedAt: toIsoOrNull(app.updatedAt) ?? new Date().toISOString(),
    supplierUpdatedAt: toIsoOrNull(app.supplierUpdatedAt),
    estimatedDecision: toIsoOrNull(app.estimatedDecision),
    userId: app.userId ?? app.user?.id ?? "",
    userName: app.user?.name ?? "",
    userEmail: app.user?.email ?? "",
    userPhone: app.user?.phone ?? "",
    supplierId: app.supplierId ?? app.supplier?.id ?? "",
    supplierName: app.supplier?.name ?? "",
    supplierType: app.supplier?.type ?? "",
    documents: toLegacyApplicationDocuments(app.documents),
  };
}
