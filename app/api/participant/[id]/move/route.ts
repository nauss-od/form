import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

async function insuranceIssued(courseId: string): Promise<boolean> {
  const log = await prisma.auditLog.findFirst({
    where: { action: 'INSURANCE_ISSUED', entityType: 'Course', entityId: courseId },
    select: { id: true },
  });
  return Boolean(log);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = getCurrentSession();
    if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

    const body = await req.json().catch(() => null);
    const targetCourseId = body?.targetCourseId;
    if (!targetCourseId) return NextResponse.json({ message: 'targetCourseId مطلوب' }, { status: 400 });

    // Load submission with its current course
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: { course: { select: { id: true, createdByUserId: true, activityName: true } } },
    });
    if (!submission) return NextResponse.json({ message: 'المشارك غير موجود' }, { status: 404 });

    // Auth: manager or owner of current course
    if (session.role !== 'MANAGER' && submission.course.createdByUserId !== session.userId) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
    }

    // Cannot move from a course that already had insurance issued
    if (await insuranceIssued(submission.courseId)) {
      return NextResponse.json({ message: 'لا يمكن النقل من دورة صدر تأمينها' }, { status: 409 });
    }

    if (targetCourseId === submission.courseId) {
      return NextResponse.json({ message: 'المشارك في هذه الدورة بالفعل' }, { status: 409 });
    }

    // Load target course
    const target = await prisma.course.findUnique({
      where: { id: targetCourseId },
      select: { id: true, activityName: true, status: true, createdByUserId: true },
    });
    if (!target) return NextResponse.json({ message: 'الدورة المستهدفة غير موجودة' }, { status: 404 });
    if (target.status !== 'PUBLISHED') return NextResponse.json({ message: 'الدورة المستهدفة مغلقة' }, { status: 409 });
    if (await insuranceIssued(targetCourseId)) {
      return NextResponse.json({ message: 'لا يمكن النقل إلى دورة صدر تأمينها' }, { status: 409 });
    }

    // Auth: manager or owner of target course
    if (session.role !== 'MANAGER' && target.createdByUserId !== session.userId) {
      return NextResponse.json({ message: 'غير مصرح للنقل إلى هذه الدورة' }, { status: 403 });
    }

    await prisma.submission.update({
      where: { id: params.id },
      data: { courseId: targetCourseId },
    });

    await logAudit({
      userId: session.userId,
      action: 'MOVE_SUBMISSION',
      entityType: 'Submission',
      entityId: params.id,
      meta: {
        fullName: submission.fullNamePassport,
        fromCourseId: submission.courseId,
        fromCourseName: submission.course.activityName,
        toCourseId: target.id,
        toCourseName: target.activityName,
      },
    });

    return NextResponse.json({ success: true, toCourseName: target.activityName });
  } catch (err) {
    console.error('Move participant error:', err);
    return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
  }
}
