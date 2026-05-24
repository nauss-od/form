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

function fileToBase64(file: { fileData: unknown; mimeType: string | null }): string | null {
  if (!file.fileData) return null;
  try {
    const buf = file.fileData instanceof Buffer
      ? file.fileData
      : Buffer.from(file.fileData as Uint8Array);
    const mime = file.mimeType || 'image/jpeg';
    const b64 = buf.toString('base64');
    return `data:${mime};base64,${b64}`;
  } catch {
    return null;
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

  // Course info rows
  const infoRows = [
    ['اسم النشاط', esc(course.activityName || '—')],
    ['مقر الانعقاد', esc(course.venue || '—')],
    ['تاريخ البداية', esc(formatDate(course.startDate))],
    ['تاريخ النهاية', esc(formatDate(course.endDate))],
    ['عدد المشاركين', String(course.submissions.length)],
    ['إعداد', esc(course.createdBy?.name || '—')],
  ];

  // Full participant table (compact)
  const tableRows = course.submissions.map((s, i) => `
    <tr>
      <td style="padding:2px 4px;text-align:center;">${i + 1}</td>
      <td style="padding:2px 4px;">${esc(s.fullNamePassport)}</td>
      <td style="padding:2px 4px;text-align:center;">${esc(s.passportNumber)}</td>
      <td style="padding:2px 4px;text-align:center;">${esc(formatDate(s.passportExpiry))}</td>
      <td style="padding:2px 4px;text-align:center;">${esc(s.nationalId)}</td>
      <td style="padding:2px 4px;text-align:center;direction:ltr;">${esc(s.mobile)}</td>
      <td style="padding:2px 4px;text-align:center;">${esc(formatDate(s.birthDate))}</td>
      <td style="padding:2px 4px;text-align:center;direction:ltr;font-size:7pt;">${esc(s.iban)}</td>
    </tr>
  `).join('');

  // Build participant pages
  const partPages: string[] = [];

  for (const s of course.submissions) {
    const passportFile = s.files.find(f => f.fileType === 'PASSPORT');
    const nationalIdFile = s.files.find(f => f.fileType === 'NATIONAL_ID');

    const pImg = passportFile ? fileToBase64(passportFile) : null;
    const nImg = nationalIdFile ? fileToBase64(nationalIdFile) : null;

    const pSrc = pImg || (passportFile ? `${base}${passportFile.fileUrl}` : null);
    const nSrc = nImg || (nationalIdFile ? `${base}${nationalIdFile.fileUrl}` : null);

    partPages.push(`
    <div class="page-break"></div>
    <div class="part-wrap">
      <div class="part-name">${esc(s.fullNamePassport)}</div>
      <div class="part-num">رقم الجواز: ${esc(s.passportNumber)}</div>
      <table class="part-imgs" cellspacing="0" cellpadding="0">
        <tr>
          <td class="part-img-cell">
            <div class="part-img-label">صورة جواز السفر</div>
            ${pSrc ? `<img src="${esc(pSrc)}" class="part-img" />` : '<div class="no-img">لا توجد صورة</div>'}
          </td>
          <td class="part-img-cell">
            <div class="part-img-label">صورة بطاقة الهوية</div>
            ${nSrc ? `<img src="${esc(nSrc)}" class="part-img" />` : '<div class="no-img">لا توجد صورة</div>'}
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
  @page { size: A4; margin: 1.5cm 1.8cm; }
  body { font-family: 'Traditional Arabic', 'Arial', sans-serif; margin: 0; padding: 0; color: #222; font-size: 10pt; }

  /* ===== Cover ===== */
  .cover { text-align: center; padding: 10px 0; }
  .cover img { width: 100px; height: auto; }
  .cover h1 { font-size: 16pt; font-weight: bold; color: #014f4d; margin: 10px 0 2px; }
  .cover h2 { font-size: 13pt; font-weight: bold; color: #014f4d; margin: 18px 0 10px; border-bottom: 1.5px solid #014f4d; padding-bottom: 6px; }
  .cover p { font-size: 9pt; color: #555; margin: 0 0 16px; }

  /* ===== Info table ===== */
  .info { width: 100%; border-collapse: collapse; margin: 12px 0; }
  .info td { padding: 4px 8px; border: 1px solid #aaa; font-size: 9pt; }
  .info td:first-child { font-weight: bold; background: #f0f4f4; width: 110px; }

  /* ===== Data table (compact) ===== */
  .data { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 7.5pt; }
  .data th { background: #014f4d; color: #fff; padding: 4px 3px; text-align: center; font-weight: bold; font-size: 7.5pt; }
  .data td { border: 1px solid #aaa; padding: 2px 4px; }
  .data tr:nth-child(even) { background: #f8fafa; }

  /* ===== Participant page ===== */
  .page-break { page-break-after: always; border: none; height: 0; margin: 0; }
  .part-wrap { padding: 8px 0; text-align: center; }
  .part-name { font-size: 14pt; font-weight: bold; color: #014f4d; margin-bottom: 4px; }
  .part-num { font-size: 9pt; color: #555; margin-bottom: 14px; }
  .part-imgs { width: 100%; border-collapse: collapse; }
  .part-img-cell { width: 50%; text-align: center; vertical-align: top; padding: 8px; }
  .part-img-label { font-size: 9pt; font-weight: bold; margin-bottom: 6px; color: #333; }
  .part-img { max-width: 100%; max-height: 400px; border: 1px solid #ccc; }
  .no-img { background: #f5f5f5; border: 1px dashed #bbb; padding: 24px; color: #999; font-size: 8pt; }

  /* ===== Footer ===== */
  .footer { text-align: center; color: #999; font-size: 7pt; margin-top: 16px; padding-top: 6px; border-top: 1px solid #ddd; }
</style>
</head>
<body>

<div class="cover">
  <img src="${logoData || esc(`${base}/images/nauss-logo-gold.png`)}" alt="NAUSS" />
  <h1>جامعة نايف العربية للعلوم الأمنية</h1>
  <p>وكالة التدريب — إدارة عمليات التدريب</p>
  <h2>بيانات المشاركين في الدورة الخارجية</h2>

  <table class="info" cellspacing="0" cellpadding="0">
    ${infoRows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
  </table>

  <table class="data" cellspacing="0" cellpadding="0">
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

${partPages.join('')}

<div class="footer" style="margin-top:20px;">تم التصدير من منصة تأمين المشاركين للدورات الخارجية — ${new Date().toLocaleDateString('ar-SA')}</div>

</body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'application/msword',
      'Content-Disposition': `attachment; filename="${(course.activityName || 'course').replace(/[^a-zA-Z0-9\-_ ]/g, '')}-participants.doc`
    }
  });
}
