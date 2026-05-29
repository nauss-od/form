import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      submissions: {
        orderBy: { createdAt: 'asc' },
        include: {
          files: { select: { id: true, fileType: true } },
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });
  }
  if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
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

  return NextResponse.json({
    course: {
      id: course.id,
      activityName: course.activityName,
      venue: course.venue,
      startDate: course.startDate,
      endDate: course.endDate,
      createdByUserId: course.createdByUserId,
    },
    participants,
  });
}
