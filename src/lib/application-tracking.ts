export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "processing"
  | "approved"
  | "rejected"
  | "cancelled";
export type TrackingTone = "info" | "active" | "success" | "warning";

export type TrackingSummary = {
  status: ApplicationStatus;
  label: string;
  progress: number;
  tone: TrackingTone;
  actionRequired: boolean;
  lastEventAt: string;
};

export type TrackingEvent = {
  id: string;
  title: string;
  detail: string;
  at: string;
  tone: TrackingTone;
  actor: "system" | "supplier";
};

const STATUS_META: Record<ApplicationStatus, Omit<TrackingSummary, "status" | "lastEventAt">> = {
  draft: {
    label: "Draft",
    progress: 10,
    tone: "info",
    actionRequired: true,
  },
  submitted: {
    label: "Submitted",
    progress: 25,
    tone: "info",
    actionRequired: false,
  },
  processing: {
    label: "Processing",
    progress: 70,
    tone: "active",
    actionRequired: false,
  },
  approved: {
    label: "Approved",
    progress: 100,
    tone: "success",
    actionRequired: false,
  },
  rejected: {
    label: "Action Required",
    progress: 60,
    tone: "warning",
    actionRequired: true,
  },
  cancelled: {
    label: "Cancelled",
    progress: 0,
    tone: "warning",
    actionRequired: false,
  },
};

type TrackableApplication = {
  id: string;
  status: string;
  submittedAt: Date | string | null;
  updatedAt: Date | string;
  supplierUpdatedAt?: Date | string | null;
  referenceNumber?: string | null;
  estimatedDecision?: Date | string | null;
  supplierName?: string | null;
};

type TrackableNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: Date | string;
};

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toStatus(status: string): ApplicationStatus {
  if (
    status === "draft" ||
    status === "processing" ||
    status === "approved" ||
    status === "rejected" ||
    status === "cancelled"
  ) {
    return status;
  }

  return "submitted";
}

function toneFromNotification(type: string): TrackingTone {
  if (type === "success") return "success";
  if (type === "warning" || type === "error") return "warning";
  if (type === "info") return "active";
  return "info";
}

export function summarizeTracking(app: TrackableApplication): TrackingSummary {
  const status = toStatus(app.status);
  const meta = STATUS_META[status];
  const lastEventAt =
    toIso(app.supplierUpdatedAt) ??
    toIso(app.updatedAt) ??
    toIso(app.submittedAt) ??
    new Date().toISOString();

  return {
    status,
    label: meta.label,
    progress: meta.progress,
    tone: meta.tone,
    actionRequired: meta.actionRequired,
    lastEventAt,
  };
}

export function buildTrackingTimeline(
  app: TrackableApplication,
  notifications: TrackableNotification[] = [],
): TrackingEvent[] {
  const status = toStatus(app.status);
  const submittedAt = toIso(app.submittedAt) ?? new Date().toISOString();
  const statusAt = toIso(app.supplierUpdatedAt) ?? toIso(app.updatedAt) ?? submittedAt;
  const events: TrackingEvent[] = [
    ...(status === "draft"
      ? [
          {
            id: `${app.id}-draft`,
            title: "Draft Saved",
            detail: "Your application has been saved as a draft.",
            at: submittedAt,
            tone: "info" as const,
            actor: "system" as const,
          },
        ]
      : [
          {
            id: `${app.id}-submitted`,
            title: "Application Submitted",
            detail: "Your application was submitted and queued for review.",
            at: submittedAt,
            tone: "info" as const,
            actor: "system" as const,
          },
        ]),
  ];

  if (app.referenceNumber) {
    events.push({
      id: `${app.id}-reference`,
      title: "Reference Assigned",
      detail: `Tracking reference: ${app.referenceNumber}.`,
      at: statusAt,
      tone: "active",
      actor: "supplier",
    });
  }

  if (status === "processing") {
    events.push({
      id: `${app.id}-processing`,
      title: "Application Under Review",
      detail: "Supplier is reviewing your documents and eligibility details.",
      at: statusAt,
      tone: "active",
      actor: "supplier",
    });
  }

  if (status === "approved") {
    events.push({
      id: `${app.id}-approved`,
      title: "Application Approved",
      detail: "Your application has been approved.",
      at: statusAt,
      tone: "success",
      actor: "supplier",
    });
  }

  if (status === "rejected") {
    events.push({
      id: `${app.id}-rejected`,
      title: "Action Required",
      detail: "Additional documents or corrections are required to continue.",
      at: statusAt,
      tone: "warning",
      actor: "supplier",
    });
  }

  if (status === "cancelled") {
    events.push({
      id: `${app.id}-cancelled`,
      title: "Application Cancelled",
      detail: "This application was cancelled before a final decision was made.",
      at: statusAt,
      tone: "warning",
      actor: "system",
    });
  }

  if (app.estimatedDecision) {
    events.push({
      id: `${app.id}-eta`,
      title: "Estimated Decision Updated",
      detail: `Estimated decision: ${app.estimatedDecision}.`,
      at: statusAt,
      tone: "active",
      actor: "supplier",
    });
  }

  const notificationEvents: TrackingEvent[] = notifications.flatMap((note) => {
    const at = toIso(note.createdAt);
    if (!at) return [];

    return [
      {
        id: note.id,
        title: note.title,
        detail: note.message,
        at,
        tone: toneFromNotification(note.type),
        actor: "system" as const,
      },
    ];
  });

  const merged = [...events, ...notificationEvents];
  const dedup = new Map<string, TrackingEvent>();
  for (const event of merged) {
    const key = `${event.title}|${event.at}`;
    if (!dedup.has(key)) dedup.set(key, event);
  }

  return Array.from(dedup.values()).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}
