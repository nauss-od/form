import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import { generateParticipantsListBuffer } from '@/lib/generate-participants-list';

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
  try {
    const session = getCurrentSession();
    if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        submissions: {
          select: { id: true, fullNamePassport: true, passportNumber: true, birthDate: true },
          orderBy: { createdAt: 'asc' },
        },
        createdBy: { select: { name: true } },
      },
    });

    if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });
    if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
    }

    const participants = course.submissions.map((s, i) => ({
      index: i + 1,
      fullNamePassport: s.fullNamePassport,
      passportNumber: s.passportNumber,
      birthDate: s.birthDate,
    }));

    const pdfBuffer = await generateParticipantsListBuffer(
      {
        activityName: course.activityName,
        venue: course.venue,
        startDate: course.startDate,
        endDate: course.endDate,
        createdByName: course.createdBy?.name || '—',
      },
      participants,
    );

    const rawName = (course.activityName || 'course').replace(/[<>:"/\\|?*\n\r]/g, ' ').trim() || 'course';
    const filename = `participants-list-${rawName}.pdf`;
    const asciiFilename = filename.replace(/[^\x20-\x7E]/g, '');
    const encodedFilename = encodeURIComponent(filename);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (err: any) {
    console.error('Participants list PDF error:', err?.message);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
