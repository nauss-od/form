import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
function checkAuth(session: Awaited<ReturnType<typeof getCurrentSession>>, course: { createdByUserId: string }) {
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }
  return null;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { name: true } },
      submissions: {
        include: { files: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });

  const authErr = checkAuth(session, course);
  if (authErr) return authErr;

  return NextResponse.json(course);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });

  const authErr = checkAuth(session, course);
  if (authErr) return authErr;

  const subCount = await prisma.submission.count({ where: { courseId: params.id } });

  await prisma.course.delete({ where: { id: params.id } });

  await logAudit({
    userId: session.userId,
    action: 'DELETE_COURSE',
    entityType: 'Course',
    entityId: params.id,
    meta: { activityName: course.activityName, submissionCount: subCount }
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });

  const authErr = checkAuth(session, course);
  if (authErr) return authErr;

  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.activityName !== undefined) data.activityName = String(body.activityName).trim() || null;
  if (body.venue !== undefined) data.venue = String(body.venue).trim() || null;
  if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
  if (body.participantCount !== undefined) data.participantCount = body.participantCount ? Number(body.participantCount) : null;

  const updated = await prisma.course.update({
    where: { id: params.id },
    data
  });

  await logAudit({
    userId: session.userId,
    action: 'UPDATE_COURSE',
    entityType: 'Course',
    entityId: params.id,
    meta: { activityName: updated.activityName }
  });

  return NextResponse.json({ success: true, course: updated });
}
