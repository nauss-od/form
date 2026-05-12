import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
  const session = getCurrentSession();
  if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      submissions: { orderBy: { createdAt: 'asc' } },
      createdBy: true,
    },
  });
  if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });

  if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  await logAudit({ userId: session.userId, action: 'EXPORT_EML', entityType: 'Course', entityId: params.courseId });

  const to = process.env.HR_EMAIL || 'travel@nauss.edu.sa';
  const cc = process.env.MANAGER_CC_EMAIL || '';
  const subject = `طلب إصدار تأمين طبي للمشاركين في الدورة الخارجية — ${course.activityName || 'دورة خارجية'}`;

  const participantsList = course.submissions.map((s, i) =>
    `  ${i + 1}. ${s.fullNamePassport}
     - رقم الجواز: ${s.passportNumber} (ينتهي: ${formatDate(s.passportExpiry)})
     - رقم الهوية: ${s.nationalId}
     - رقم الجوال: ${s.mobile}
     - تاريخ الميلاد: ${formatDate(s.birthDate)}
     - رقم الآيبان: ${s.iban}`
  ).join('\n');

  const body = `السلام عليكم ورحمة الله وبركاته،

نرفق لكم طلب إصدار تأمين طبي للمشاركين في الدورة الخارجية أدناه:

━━━━━━━━━━━━━━━━━━━━━━━━━━
بيانات الدورة
━━━━━━━━━━━━━━━━━━━━━━━━━━

اسم النشاط: ${course.activityName || '—'}
مقر الانعقاد: ${course.venue || '—'}
تاريخ البداية: ${formatDate(course.startDate)}
تاريخ النهاية: ${formatDate(course.endDate)}
عدد المشاركين: ${course.submissions.length}
إعداد: ${course.createdBy?.name || '—'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
بيانات المشاركين
━━━━━━━━━━━━━━━━━━━━━━━━━━

${participantsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━

نأمل منكم التكرم بإصدار التأمين الطبي للمشاركين المذكورين أعلاه، وإفادتنا بما يلزم.

وتفضلوا بقبول فائق الشكر والتقدير،

${course.createdBy?.name || 'موظف التدريب'}
إدارة عمليات التدريب
وكالة التدريب
جامعة نايف العربية للعلوم الأمنية`;

  const safeName = (course.activityName || 'course').replace(/[^a-zA-Z0-9\-_ ]/g, '');
  const encodedSubject = '=?UTF-8?B?' + Buffer.from(subject).toString('base64') + '?=';

  const eml = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    `To: <${to}>`,
    cc ? `CC: <${cc}>` : '',
    `Subject: ${encodedSubject}`,
    'X-Mailer: NAUSS Forms Platform v1.0',
    'X-Priority: Normal',
    '',
    Buffer.from(body).toString('base64'),
  ].filter(Boolean).join('\n');

  return new NextResponse(eml, {
    headers: {
      'Content-Type': 'message/rfc822',
      'Content-Disposition': `attachment; filename="${safeName}-insurance-request.eml"`
    }
  });
}
