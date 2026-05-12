import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      submissions: { include: { files: true }, orderBy: { createdAt: 'asc' } },
      createdBy: true,
    },
  });
  if (!course) return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });

  const base = process.env.APP_URL || 'https://forms-od.vercel.app';
  const logoUrl = `${base}/images/nauss-logo-gold.png`;

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
      <td>${esc(s.iban)}</td>
    </tr>
  `).join('');

  const participantPages = course.submissions.map((s, i) => {
    const passportFile = s.files.find(f => f.fileType === 'PASSPORT');
    const nationalIdFile = s.files.find(f => f.fileType === 'NATIONAL_ID');
    return `
    <div class="page-break"></div>
    <div class="part-page">
      <div class="part-header">المشارك ${i + 1}: ${esc(s.fullNamePassport)}</div>
      <table class="part-table">
        <tr><td class="label">رقم الجواز</td><td>${esc(s.passportNumber)}</td><td class="label">رقم الهوية</td><td>${esc(s.nationalId)}</td></tr>
        <tr><td class="label">الجوال</td><td>${esc(s.mobile)}</td><td class="label">IBAN</td><td dir="ltr">${esc(s.iban)}</td></tr>
      </table>
      <div class="images-row">
        <div class="img-box">
          <div class="img-label">صورة جواز السفر</div>
          ${passportFile ? `<img src="${esc(passportFile.fileUrl)}" class="part-img" />` : '<div class="no-img">لا توجد صورة</div>'}
        </div>
        <div class="img-box">
          <div class="img-label">صورة الهوية الوطنية</div>
          ${nationalIdFile ? `<img src="${esc(nationalIdFile.fileUrl)}" class="part-img" />` : '<div class="no-img">لا توجد صورة</div>'}
        </div>
      </div>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8" />
<title>بيانات المشاركين - ${esc(course.activityName || '')}</title>
<style>
  @page { size: A4; margin: 2cm; }
  body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; }
  .page { padding: 40px; }
  .page-break { page-break-after: always; border: none; height: 0; }
  .header { text-align: center; margin-bottom: 24px; }
  .header img { height: 80px; max-width: 100%; }
  .header h1 { color: #014f4d; font-size: 18pt; margin: 12px 0 4px; }
  .header p { color: #666; font-size: 10pt; margin: 0; }
  .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10pt; }
  .info-table td { padding: 6px 10px; border: 1px solid #ddd; }
  .info-table td:first-child { font-weight: bold; background: #f5f5f5; width: 140px; }
  .data-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 8.5pt; }
  .data-table th { background: #014f4d; color: white; padding: 6px 4px; text-align: center; }
  .data-table td { border: 1px solid #ccc; padding: 4px; text-align: center; }
  .data-table tr:nth-child(even) { background: #f9f9f9; }
  .part-page { padding: 20px 0; }
  .part-header { font-size: 14pt; font-weight: bold; color: #014f4d; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #014f4d; }
  .part-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10pt; }
  .part-table td { padding: 8px 12px; border: 1px solid #ddd; }
  .part-table td.label { font-weight: bold; background: #f5f5f5; width: 100px; }
  .images-row { display: flex; gap: 20px; }
  .img-box { flex: 1; text-align: center; }
  .img-label { font-size: 10pt; font-weight: bold; margin-bottom: 8px; color: #333; }
  .part-img { max-width: 100%; max-height: 400px; border: 1px solid #ccc; border-radius: 4px; }
  .no-img { background: #f5f5f5; border: 1px dashed #ccc; border-radius: 4px; padding: 40px; color: #999; }
  .footer { text-align: center; color: #999; font-size: 8pt; margin-top: 30px; border-top: 1px solid #eee; padding-top: 12px; }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <img src="${esc(logoUrl)}" alt="NAUSS" />
      <h1>جامعة نايف العربية للعلوم الأمنية</h1>
      <p>وكالة التدريب — إدارة عمليات التدريب</p>
    </div>

    <h2 style="font-size:14pt;color:#014f4d;text-align:center;margin:16px 0;">بيانات المشاركين في الدورة الخارجية</h2>

    <table class="info-table">
      ${infoRows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
    </table>

    <h3 style="font-size:12pt;color:#014f4d;margin-top:20px;">قائمة المشاركين</h3>
    <table class="data-table">
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

  ${participantPages}

  <div class="footer" style="margin-top:40px;">تم التصدير من منصة تأمين المشاركين للدورات الخارجية — ${new Date().toLocaleDateString('ar-SA')}</div>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'application/msword',
      'Content-Disposition': `attachment; filename="${course.activityName || 'course'}-participants.doc`
    }
  });
}
