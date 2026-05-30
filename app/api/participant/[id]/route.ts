import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getCurrentSession();
    if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: { course: { select: { id: true, createdByUserId: true, activityName: true } } },
    });
    if (!submission) return NextResponse.json({ message: 'المشارك غير موجود' }, { status: 404 });

    if (session.role !== 'MANAGER' && submission.course.createdByUserId !== session.userId) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
    }

    const name = submission.fullNamePassport;

    await prisma.submission.delete({ where: { id: params.id } });

    await logAudit({
      userId: session.userId,
      action: 'DELETE_SUBMISSION',
      entityType: 'Submission',
      entityId: params.id,
      meta: { fullName: name, courseId: submission.course.id, courseName: submission.course.activityName },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete participant error:', err);
    return NextResponse.json({ message: 'حدث خطأ' }, { status: 500 });
  }
}
