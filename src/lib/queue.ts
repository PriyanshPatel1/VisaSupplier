/**
 * BullMQ job queue.
 *
 * Requires Redis: set REDIS_URL in env (e.g. redis://localhost:6379).
 * Falls back to direct execution (no queuing) when REDIS_URL is absent.
 *
 * Queues:
 *  - email        sends transactional emails
 *  - notification creates DB notifications
 *  - audit        writes audit log entries
 */

import { AuditAction, Prisma, Role } from "@prisma/client";
import { Job, Queue, Worker } from "bullmq";
import { sendEmail, EmailOptions } from "./email";
import { prisma } from "./prisma";
import { logger } from "./logger";

function getRedisConnection() {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    password: parsed.password || undefined,
    tls: parsed.protocol === "rediss:" ? {} : undefined,
  };
}

const connection = getRedisConnection();

export interface EmailJob extends EmailOptions {
  type: "email";
}

export interface NotificationJob {
  type: "notification";
  userId: string;
  title: string;
  message: string;
  notifType: "info" | "success" | "warning" | "error";
  actionUrl?: string;
}

export interface AuditJob {
  type: "audit";
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  actorUserId?: string;
  actorSupplierId?: string;
  actorRole?: Role;
}

export type JobPayload = EmailJob | NotificationJob | AuditJob;

function createQueue(name: string) {
  if (!connection) {
    logger.warn({ queue: name }, "Redis not configured; queue disabled, jobs run inline");
    return null;
  }

  return new Queue(name, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    },
  });
}

export const emailQueue = createQueue("email");
export const notificationQueue = createQueue("notification");
export const auditQueue = createQueue("audit");

export async function dispatchEmail(payload: Omit<EmailJob, "type">) {
  if (emailQueue) {
    await emailQueue.add("send-email", { type: "email", ...payload });
  } else {
    await sendEmail(payload).catch((error) => logger.error({ err: error }, "Inline email failed"));
  }
}

export async function dispatchNotification(payload: Omit<NotificationJob, "type">) {
  if (notificationQueue) {
    await notificationQueue.add("create-notification", { type: "notification", ...payload });
  } else {
    await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.notifType,
        actionUrl: payload.actionUrl,
      },
    }).catch((error) => logger.error({ err: error }, "Inline notification failed"));
  }
}

export async function dispatchAudit(payload: Omit<AuditJob, "type">) {
  if (auditQueue) {
    await auditQueue.add("write-audit", { type: "audit", ...payload });
  }
}

export function startWorkers() {
  if (!connection) {
    logger.warn("No Redis; workers not started");
    return;
  }

  new Worker(
    "email",
    async (job: Job<EmailJob>) => {
      const emailOpts: EmailOptions = job.data;
      await sendEmail(emailOpts);
      logger.info({ jobId: job.id, to: emailOpts.to }, "Email sent");
    },
    { connection, concurrency: 5 },
  );

  new Worker(
    "notification",
    async (job: Job<NotificationJob>) => {
      await prisma.notification.create({
        data: {
          userId: job.data.userId,
          title: job.data.title,
          message: job.data.message,
          type: job.data.notifType,
          actionUrl: job.data.actionUrl,
        },
      });
    },
    { connection, concurrency: 10 },
  );

  new Worker(
    "audit",
    async (job: Job<AuditJob>) => {
      await prisma.auditLog.create({
        data: {
          action: job.data.action,
          entityType: job.data.entityType,
          entityId: job.data.entityId ?? null,
          description: job.data.description ?? null,
          before: (job.data.before ?? null) as Prisma.InputJsonValue | null,
          after: (job.data.after ?? null) as Prisma.InputJsonValue | null,
          ipAddress: job.data.ipAddress ?? null,
          userAgent: job.data.userAgent ?? null,
          actorUserId: job.data.actorUserId ?? null,
          actorSupplierId: job.data.actorSupplierId ?? null,
          actorRole: job.data.actorRole ?? null,
        },
      });
    },
    { connection, concurrency: 20 },
  );

  logger.info("BullMQ workers started");
}
