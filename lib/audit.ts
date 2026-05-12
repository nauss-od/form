import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export async function logAudit(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metaJson: (params.meta || undefined) as Prisma.InputJsonValue | undefined,
      }
    });
  } catch (e) {
    console.error('Audit log error:', e);
  }
}
