import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.courseId } });
  if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });

  const to = process.env.HR_EMAIL || 'hr@nauss.edu.sa';
  const cc = process.env.MANAGER_CC_EMAIL || 'manager@nauss.edu.sa';
  const subject = `مسودة تأمين المشاركين - ${course.activityName || 'دورة خارجية'}`;
  const body = `To: ${to}\nCC: ${cc}\nSubject: ${subject}\n\nالسادة/ إدارة الموارد البشرية\n\nنرفق لكم ملف بيانات المشاركين وموافقة المعالي الخاصة بالدورة الخارجية.\n\nوتفضلوا بقبول فائق التحية.\n`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'message/rfc822',
      'Content-Disposition': `attachment; filename="course-${params.courseId}.eml"`
    }
  });
}
