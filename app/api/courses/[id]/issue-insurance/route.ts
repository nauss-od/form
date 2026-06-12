import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generatePublicToken } from '@/lib/utils';
import type { Prisma } from '@prisma/client';

function checkAuth(session: Awaited<ReturnType<typeof getCurrentSession>>, course: { createdByUserId: string }) {
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }
  return null;
}

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });

  const authErr = checkAuth(session, course);
  if (authErr) return authErr;

  const existing = await prisma.auditLog.findFirst({
    where: { action: 'INSURANCE_ISSUED', entityType: 'Course', entityId: course.id },
  });
  if (existing) return NextResponse.json({ message: 'تم تصدير التأمين مسبقاً' }, { status: 409 });

  const summary = await prisma.$transaction(async tx => {
    const [insuredCount, fileCount] = await Promise.all([
      tx.submission.count({ where: { courseId: course.id } }),
      tx.submissionFile.count({ where: { submission: { courseId: course.id } } }),
    ]);
    const issuedAt = new Date().toISOString();

    await tx.submission.deleteMany({ where: { courseId: course.id } });
    await tx.course.update({
      where: { id: course.id },
      data: {
        status: 'CLOSED',
        publicToken: generatePublicToken(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.userId,
        action: 'INSURANCE_ISSUED',
        entityType: 'Course',
        entityId: course.id,
        metaJson: {
          activityName: course.activityName,
          venue: course.venue,
          startDate: course.startDate?.toISOString() || null,
          endDate: course.endDate?.toISOString() || null,
          participantTarget: course.participantCount,
          insuredCount,
          deletedFileCount: fileCount,
          linksRevoked: true,
          issuedAt,
        } as Prisma.InputJsonValue,
      },
    });

    return { insuredCount, fileCount };
  });

  return NextResponse.json({ success: true, insuredCount: summary.insuredCount });
}
