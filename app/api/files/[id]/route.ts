import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  // Auth required — sensitive biometric/passport images must never be public
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const file = await prisma.submissionFile.findUnique({
    where: { id: params.id },
    include: { submission: { select: { courseId: true } } },
  });
  if (!file || !file.fileData)
    return NextResponse.json({ message: 'الملف غير موجود' }, { status: 404 });

  // Verify the requesting user owns the course or is a manager
  if (session.role !== 'MANAGER') {
    const course = await prisma.course.findUnique({
      where: { id: file.submission.courseId },
      select: { createdByUserId: true },
    });
    if (!course || course.createdByUserId !== session.userId) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 403 });
    }
  }

  return new NextResponse(file.fileData, {
    headers: {
      'Content-Type': file.mimeType || 'image/jpeg',
      'Content-Disposition': `inline; filename="${file.fileName}"`,
      // Must NOT be public or cached — sensitive biometric data
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
