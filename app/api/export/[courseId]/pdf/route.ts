import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { generatePdfBuffer } from '@/lib/generate-pdf';

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const session = getCurrentSession();
    if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        submissions: { include: { files: true }, orderBy: { createdAt: 'asc' } },
        createdBy: true,
      },
    });
    if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });
    if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
    }

    await logAudit({ userId: session.userId, action: 'EXPORT_PDF', entityType: 'Course', entityId: params.courseId });

    const baseUrl = new URL(request.url).origin;

    const participants = course.submissions.map((s, i) => ({
      index: i + 1,
      fullNamePassport: s.fullNamePassport,
      passportNumber: s.passportNumber,
      passportExpiry: formatDate(s.passportExpiry),
      nationalId: s.nationalId,
      mobile: s.mobile,
      birthDate: formatDate(s.birthDate),
      iban: s.iban,
      id: s.id,
    }));

    const pdfBuffer = await generatePdfBuffer(
      {
        activityName: course.activityName,
        venue: course.venue,
        startDate: course.startDate,
        endDate: course.endDate,
        createdByName: course.createdBy?.name || '—',
      },
      participants,
      baseUrl,
    );

    const rawName = (course.activityName || 'course').replace(/[<>:"/\\|?*\n\r]/g, ' ').trim() || 'course';
    const rawVenue = course.venue ? '-' + course.venue.replace(/[<>:"/\\|?*\n\r]/g, ' ').trim() : '';
    const rawFilename = `${rawName}${rawVenue}-insurance.pdf`;

    const asciiFilename = rawFilename.replace(/[^\x20-\x7E]/g, '');
    const encodedFilename = encodeURIComponent(rawFilename);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (err: any) {
    console.error('=== PDF EXPORT ERROR ===');
    console.error('Name:', err?.name);
    console.error('Message:', err?.message);
    console.error('Stack:', err?.stack);
    console.error('========================');
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
