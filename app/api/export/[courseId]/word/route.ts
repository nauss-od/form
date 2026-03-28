import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.courseId }, include: { submissions: true } });
  if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });

  const body = [
    'منصة تأمين المشاركين للدورات الخارجية',
    `اسم النشاط: ${course.activityName || '—'}`,
    `مقر الانعقاد: ${course.venue || '—'}`,
    '',
    'الاستجابات:'
  ].concat(course.submissions.map((item, index) => `${index + 1}. ${item.fullNamePassport} | ${item.passportNumber} | ${item.mobile} | ${item.iban}`)).join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="course-${params.courseId}.docx"`
    }
  });
}
