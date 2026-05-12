import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      submissions: { include: { files: true }, orderBy: { createdAt: 'asc' } },
      createdBy: true
    }
  });
  if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });

  const to = process.env.HR_EMAIL || 'travel@nauss.edu.sa';
  const cc = process.env.MANAGER_CC_EMAIL || '';

  const participantsList = course.submissions.map((s, i) =>
    `${i + 1}. ${s.fullNamePassport} | جواز: ${s.passportNumber} | هوية: ${s.nationalId} | جوال: ${s.mobile} | IBAN: ${s.iban}`
  ).join('\n');

  const body = `السلام عليكم ورحمة الله وبركاتة

نرفق لكم طلب إصدار تأمين طبي للمشاركين في الدورة الخارجية أدناه:

اسم النشاط: ${course.activityName || '—'}
مقر الانعقاد: ${course.venue || '—'}
تاريخ البداية: ${formatDate(course.startDate)}
تاريخ النهاية: ${formatDate(course.endDate)}
عدد المشاركين: ${course.submissions.length}

بيانات المشاركين:
${participantsList}

نأمل منكم التكرم بإصدار التأمين الطبي للمشاركين المذكورين أعلاه، وإفادتنا بما يلزم.

وتفضلوا بقبول فائق الشكر والتقدير،

${course.createdBy.name}
إدارة عمليات التدريب
وكالة التدريب
جامعة نايف العربية للعلوم الأمنية`;

  const subject = `طلب إصدار تأمين طبي للمشاركين - ${course.activityName || 'دورة خارجية'}`;

  const eml = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    `To: ${to}`,
    cc ? `CC: ${cc}` : '',
    `Subject: ${subject}`,
    'X-Mailer: NAUSS Forms Platform',
    '',
    body
  ].filter(Boolean).join('\n');

  return new NextResponse(eml, {
    headers: {
      'Content-Type': 'message/rfc822',
      'Content-Disposition': `attachment; filename="${course.activityName || 'course'}-insurance-request.eml"`
    }
  });
}
