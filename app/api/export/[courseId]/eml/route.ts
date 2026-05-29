import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { generatePdfBuffer } from '@/lib/generate-pdf';

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function fmt(date: Date): string {
  return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function wrapBase64(s: string): string {
  return s.match(/.{1,76}/g)?.join('\r\n') || s;
}

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  try {
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

    const baseUrl = new URL(request.url).origin;

    const participants = course.submissions.map((s, i) => ({
      index: i + 1,
      fullNamePassport: s.fullNamePassport,
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

    const pdfBase64 = pdfBuffer.toString('base64');

    const insuranceStart = course.startDate ? addDays(course.startDate, -1) : null;
    const insuranceEnd = course.endDate ? addDays(course.endDate, 3) : null;

    const fromName = (course.createdBy?.name || 'موظف التدريب').replace(/[<>()\[\]\\,;:\"\n\r]/g, '').trim();
    const fromEmail = course.createdBy?.email || 'training@nauss.edu.sa';
    const subject = `طلب إصدار تأمين طبي — ${course.activityName || 'دورة خارجية'}`;
    const dateStr = new Date().toUTCString();
    const boundary = `----=_NAUSS_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const msgId = `<nauss-${Date.now()}-${Math.random().toString(36).slice(2, 14)}@nauss.edu.sa>`;

    const insurancePublicUrl = `${baseUrl}/public/insurance/${params.courseId}`;

    const bodyText = `السلام عليكم ورحمة الله وبركاته،

أتمنى أن تكونوا بأفضل حال،

نرفق لكم ملف PDF يتضمن بيانات المشاركين في الدورة التدريبية أدناه، ونأمل منكم التكرم بإصدار التأمين الطبي لهم.

بيانات الدورة:
- اسم النشاط: ${course.activityName || '—'}
- مقر الانعقاد: ${course.venue || '—'}
- تاريخ البداية: ${formatDate(course.startDate)}
- تاريخ النهاية: ${formatDate(course.endDate)}
- عدد المشاركين: ${course.submissions.length}
- إعداد: ${course.createdBy?.name || '—'}

بيانات التأمين المقترحة:
- تاريخ بداية التأمين: ${insuranceStart ? fmt(insuranceStart) : '—'}
- تاريخ نهاية التأمين: ${insuranceEnd ? fmt(insuranceEnd) : '—'}

(بداية التأمين قبل الدورة بيوم، ونهايته بعد الدورة بثلاثة أيام)

للاطلاع على قائمة المشاركين مع معاينة المرفقات، يمكنكم فتح الرابط التالي:
${insurancePublicUrl}

أو يمكنكم الدخول إلى صفحة التأمين عبر الرابط المباشر أعلاه.

نشكركم جزيل الشكر على تعاونكم الدائم، ونقدر لكم جهودكم.

وتفضلوا بقبول فائق الاحترام،

${course.createdBy?.name || 'موظف التدريب'}
إدارة عمليات التدريب — وكالة التدريب
جامعة نايف العربية للعلوم الأمنية`;

    const safeName = (course.activityName || 'course').replace(/[<>:"/\\|?*\n\r]/g, ' ').trim().replace(/\s+/g, ' ') || 'course';
    const pdfFilename = `${safeName}-insurance.pdf`;

    const eml = [
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      `To: HR@nauss.edu.sa, AAbouelatta@nauss.edu.sa`,
      `CC: OD@nauss.edu.sa`,
      `From: ${fromName} <${fromEmail}>`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      `Date: ${dateStr}`,
      `Message-ID: ${msgId}`,
      'X-Mailer: NAUSS Training Platform v1.0',
      'X-Priority: Normal (3)',
      'X-MSMail-Priority: Normal',
      'Importance: Normal',
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="utf-8"',
      'Content-Transfer-Encoding: base64',
      '',
      wrapBase64(Buffer.from(bodyText, 'utf-8').toString('base64')),
      '',
      `--${boundary}`,
      `Content-Type: application/pdf; name="${pdfFilename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${pdfFilename}"`,
      '',
      wrapBase64(pdfBase64),
      '',
      `--${boundary}--`,
      '',
    ].join('\r\n');

    const emlFilename = `${safeName}-insurance-request.eml`;

    return new NextResponse(eml, {
      headers: {
        'Content-Type': 'message/rfc822',
        'Content-Disposition': `attachment; filename="${emlFilename.replace(/[^\x20-\x7E]/g, '')}"`,
      },
    });
  } catch (err) {
    console.error('EML export error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
