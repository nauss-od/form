import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      submissions: {
        orderBy: { createdAt: 'asc' },
        include: {
          files: { select: { id: true, fileType: true, fileName: true, mimeType: true } },
        },
      },
      createdBy: { select: { name: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });
  }

  const issued = await prisma.auditLog.findFirst({
    where: { action: 'INSURANCE_ISSUED', entityType: 'Course', entityId: course.id },
  });
  if (issued) {
    return NextResponse.json({ message: 'تم تصدير التأمين وحذف بيانات المشاركين نهائياً' }, { status: 410 });
  }

  const participants = course.submissions.map(s => ({
    id: s.id,
    fullNamePassport: s.fullNamePassport,
    passportNumber: s.passportNumber,
    passportExpiry: s.passportExpiry,
    nationalId: s.nationalId,
    mobile: s.mobile,
    birthDate: s.birthDate,
    iban: s.iban,
    files: s.files,
  }));

  logAudit({
    action: 'VIEW_INSURANCE',
    entityType: 'Course',
    entityId: course.id,
    meta: { participantCount: participants.length },
  });

  return NextResponse.json({
    course: {
      id: course.id,
      activityName: course.activityName,
      venue: course.venue,
      startDate: course.startDate,
      endDate: course.endDate,
      createdByName: course.createdBy?.name || '—',
    },
    participants,
  });
}
