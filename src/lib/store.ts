// ─── VisaHub shared types ─────────────────────────────────────────────────
// All data now stored in MongoDB via Prisma API routes.
// localStorage is NOT used for data storage — only for ephemeral form drafts.

export const STORAGE_KEYS = {
  /**
   * Admin form builder draft persistence. Auth is cookie/JWT — not localStorage.
   * ADMIN_SESSION and VISA_EDITS removed (legacy, never used).
   */
  ADMIN_FORMS: "visahub_admin_forms",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────

export interface StoredApplication {
  id: string;
  visaId: string;
  visaName: string;
  countryCode: string;
  countryName: string;
  supplierId: string;
  supplierName: string;
  supplierType?: string;
  totalPaid: number;
  status: "submitted" | "processing" | "approved" | "rejected";
  submittedAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  personal: Record<string, string>;
  passport: Record<string, string>;
  travel: Record<string, string>;
  other?: Record<string, unknown>;
  documents: Record<string, string>;
  supplierNotes?: string;
  referenceNumber?: string;
  supplierStatus?: string;
  estimatedDecision?: string;
  supplierUpdatedAt?: string;
  tracking?: ApplicationTrackingSummary;
  timeline?: ApplicationTrackingEvent[];
  canCancel?: boolean;
}

export interface ApplicationTrackingSummary {
  status: "submitted" | "processing" | "approved" | "rejected";
  label: string;
  progress: number;
  tone: "info" | "active" | "success" | "warning";
  actionRequired: boolean;
  lastEventAt: string;
}

export interface ApplicationTrackingEvent {
  id: string;
  title: string;
  detail: string;
  at: string;
  tone: "info" | "active" | "success" | "warning";
  actor: "system" | "supplier";
}

export interface ApplicationsListMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  q: string;
  status: "all" | "submitted" | "processing" | "approved" | "rejected";
  sortBy: "submittedAt" | "updatedAt";
  sortDir: "asc" | "desc";
  statusCounts: {
    all: number;
    submitted: number;
    processing: number;
    approved: number;
    rejected: number;
  };
}

export interface ApplicationsListResponse {
  items: StoredApplication[];
  meta: ApplicationsListMeta;
}

export interface StoredNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface StoredDocument {
  id: string;
  userId: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  status: "verified" | "pending" | "rejected";
  fileUrl?: string;
}

export interface SupplierSession {
  supplierId: string;
  supplierName: string;
  email: string;
}
