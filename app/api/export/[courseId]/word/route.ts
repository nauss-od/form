import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function fetchAsBase64(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get('content-type') || 'image/png';
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    return '';
  }
}

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
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

  await logAudit({ userId: session.userId, action: 'EXPORT_WORD', entityType: 'Course', entityId: params.courseId });

  const base = process.env.APP_URL || 'https://forms-tan-xi.vercel.app';

  // Embed logo as base64
  const logoData = await fetchAsBase64(`${base}/images/nauss-logo-gold.png`);
  const logoSrc = logoData || `${base}/images/nauss-logo-gold.png`;

  const infoRows = [
    ['اسم النشاط', esc(course.activityName || '—')],
    ['مقر الانعقاد', esc(course.venue || '—')],
    ['تاريخ البداية', esc(formatDate(course.startDate))],
    ['تاريخ النهاية', esc(formatDate(course.endDate))],
    ['عدد المشاركين', String(course.submissions.length)],
    ['إعداد', esc(course.createdBy?.name || '—')],
  ];

  const tableRows = course.submissions.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(s.fullNamePassport)}</td>
      <td>${esc(s.passportNumber)}</td>
      <td>${esc(formatDate(s.passportExpiry))}</td>
      <td>${esc(s.nationalId)}</td>
      <td>${esc(s.mobile)}</td>
      <td>${esc(formatDate(s.birthDate))}</td>
      <td dir="ltr">${esc(s.iban)}</td>
    </tr>
  `).join('');

  // Build participant pages with inline images
  const participantPages: string[] = [];

  for (const s of course.submissions) {
    const passportFile = s.files.find(f => f.fileType === 'PASSPORT');
    const nationalIdFile = s.files.find(f => f.fileType === 'NATIONAL_ID');

    let passportImg = '';
    if (passportFile?.fileData) {
      const b64 = Buffer.from(passportFile.fileData).toString('base64');
      passportImg = `<img src="data:${passportFile.mimeType || 'image/jpeg'};base64,${b64}" class="part-img" />`;
    } else if (passportFile) {
      passportImg = `<img src="${esc(base + passportFile.fileUrl)}" class="part-img" />`;
    } else {
      passportImg = '<div class="no-img">لا توجد صورة</div>';
    }

    let nationalIdImg = '';
    if (nationalIdFile?.fileData) {
      const b64 = Buffer.from(nationalIdFile.fileData).toString('base64');
      nationalIdImg = `<img src="data:${nationalIdFile.mimeType || 'image/jpeg'};base64,${b64}" class="part-img" />`;
    } else if (nationalIdFile) {
      nationalIdImg = `<img src="${esc(base + nationalIdFile.fileUrl)}" class="part-img" />`;
    } else {
      nationalIdImg = '<div class="no-img">لا توجد صورة</div>';
    }

    participantPages.push(`
    <div class="page-break"></div>
    <div class="part-page">
      <div class="part-header">المشارك ${esc(s.fullNamePassport)}</div>
      <table class="part-table" cellspacing="0" cellpadding="0">
        <tr><td class="pl">رقم الجواز</td><td class="pv">${esc(s.passportNumber)}</td><td class="pl">رقم الهوية</td><td class="pv">${esc(s.nationalId)}</td></tr>
        <tr><td class="pl">الجوال</td><td class="pv">${esc(s.mobile)}</td><td class="pl">IBAN</td><td class="pv" dir="ltr">${esc(s.iban)}</td></tr>
      </table>
      <table class="img-table" cellspacing="10" cellpadding="0">
        <tr>
          <td class="img-cell">
            <div class="img-label">صورة جواز السفر</div>
            ${passportImg}
          </td>
          <td class="img-cell">
            <div class="img-label">صورة الهوية الوطنية</div>
            ${nationalIdImg}
          </td>
        </tr>
      </table>
    </div>`);
  }

  const html = `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>بيانات المشاركين - ${esc(course.activityName || '')}</title>
<style>
  @page { size: A4; margin: 1.8cm 2cm; }
  body { font-family: 'Traditional Arabic', 'Arial', sans-serif; margin: 0; padding: 0; color: #222; font-size: 11pt; line-height: 1.6; }
  .page-break { page-break-after: always; border: none; height: 0; margin: 0; }

  /* ===== Cover page ===== */
  .cover { padding: 20px 0; }
  .logo-wrap { text-align: center; margin-bottom: 18px; }
  .logo-wrap img { width: 160px; height: auto; }
  .org-name { font-size: 20pt; font-weight: bold; color: #014f4d; text-align: center; margin: 0 0 4px; }
  .org-sub { font-size: 11pt; color: #555; text-align: center; margin: 0 0 24px; }
  .doc-title { font-size: 16pt; font-weight: bold; color: #014f4d; text-align: center; margin: 20px 0; padding-bottom: 12px; border-bottom: 2px solid #014f4d; }

  /* ===== Info table ===== */
  .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  .info-table td { padding: 7px 12px; border: 1px solid #bbb; font-size: 10pt; }
  .info-table td:first-child { font-weight: bold; background: #f0f4f4; width: 130px; }

  /* ===== Data table ===== */
  .data-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 8.5pt; }
  .data-table th { background: #014f4d; color: #fff; padding: 6px 4px; text-align: center; font-weight: bold; }
  .data-table td { border: 1px solid #bbb; padding: 5px 4px; text-align: center; }
  .data-table tr:nth-child(even) { background: #f8fafa; }

  /* ===== Participant pages ===== */
  .part-page { padding: 10px 0; }
  .part-header { font-size: 14pt; font-weight: bold; color: #014f4d; margin-bottom: 12px; padding: 8px 14px; background: #f0f7f7; border-right: 4px solid #014f4d; }
  .part-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .part-table td { padding: 8px 12px; border: 1px solid #bbb; font-size: 10pt; }
  .pl { font-weight: bold; background: #f5f7f7; width: 90px; }
  .pv { width: 150px; }
  .img-table { width: 100%; border-collapse: collapse; }
  .img-cell { width: 50%; text-align: center; vertical-align: top; border: 1px solid #ddd; padding: 12px; border-radius: 4px; }
  .img-label { font-size: 10pt; font-weight: bold; margin-bottom: 8px; color: #333; }
  .part-img { max-width: 100%; max-height: 380px; border: 1px solid #ccc; border-radius: 4px; }
  .no-img { background: #f5f5f5; border: 1px dashed #bbb; padding: 32px; color: #999; text-align: center; font-size: 9pt; border-radius: 4px; }

  /* ===== Footer ===== */
  .footer { text-align: center; color: #999; font-size: 7.5pt; margin-top: 24px; padding-top: 10px; border-top: 1px solid #ddd; }
</style>
</head>
<body>

<div class="cover">
  <div class="logo-wrap">
    <img src="${esc(logoSrc)}" alt="NAUSS" />
  </div>
  <div class="org-name">جامعة نايف العربية للعلوم الأمنية</div>
  <div class="org-sub">وكالة التدريب — إدارة عمليات التدريب</div>

  <div class="doc-title">بيانات المشاركين في الدورة الخارجية</div>

  <table class="info-table" cellspacing="0" cellpadding="0">
    ${infoRows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
  </table>

  <h3 style="font-size:12pt;color:#014f4d;margin:18px 0 8px;">قائمة المشاركين</h3>
  <table class="data-table" cellspacing="0" cellpadding="0">
    <thead>
      <tr>
        <th>م</th><th>الاسم</th><th>رقم الجواز</th><th>انتهاء الجواز</th>
        <th>الهوية</th><th>الجوال</th><th>تاريخ الميلاد</th><th>IBAN</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="footer">تم التصدير من منصة تأمين المشاركين — ${new Date().toLocaleDateString('ar-SA')}</div>
</div>

${participantPages.join('')}

<div class="footer" style="margin-top:30px;">تم التصدير من منصة تأمين المشاركين للدورات الخارجية — ${new Date().toLocaleDateString('ar-SA')}</div>

</body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'application/msword',
      'Content-Disposition': `attachment; filename="${(course.activityName || 'course').replace(/[^a-zA-Z0-9\-_ ]/g, '')}-participants.doc`
    }
  });
}
