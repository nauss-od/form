import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fileToBase64(f: { fileData: unknown; mimeType: string | null }): string | null {
  if (!f.fileData) return null;
  try {
    const buf = f.fileData instanceof Buffer ? f.fileData : Buffer.from(f.fileData as Uint8Array);
    return `data:${f.mimeType || 'image/jpeg'};base64,${buf.toString('base64')}`;
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

  // Compact info: multi‑column table (6 fields → 3 cols × 2 rows)
  const infoCells = [
    ['النشاط', esc(course.activityName || '—')],
    ['المكان', esc(course.venue || '—')],
    ['من', esc(formatDate(course.startDate))],
    ['إلى', esc(formatDate(course.endDate))],
    ['المشاركون', String(course.submissions.length)],
    ['إعداد', esc(course.createdBy?.name || '—')],
  ];

  const infoRows: string[] = [];
  for (let r = 0; r < 2; r++) {
    const cols = [];
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      if (idx < infoCells.length) {
        cols.push(`<td class="il">${infoCells[idx][0]}</td><td class="iv">${infoCells[idx][1]}</td>`);
      }
    }
    infoRows.push(`<tr>${cols.join('')}</tr>`);
  }

  // Full participant table (compact)
  const tableRows = course.submissions.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(s.fullNamePassport)}</td>
      <td>${esc(s.passportNumber)}</td>
      <td>${esc(formatDate(s.passportExpiry))}</td>
      <td>${esc(s.nationalId)}</td>
      <td dir="ltr">${esc(s.mobile)}</td>
      <td>${esc(formatDate(s.birthDate))}</td>
      <td dir="ltr" style="font-size:6.5pt;">${esc(s.iban)}</td>
    </tr>
  `).join('');

  // Participant pages — images stacked vertically
  const partPages: string[] = [];

  for (const s of course.submissions) {
    const pf = s.files.find(f => f.fileType === 'PASSPORT');
    const nf = s.files.find(f => f.fileType === 'NATIONAL_ID');

    const pSrc = pf ? (fileToBase64(pf) || `${base}${pf.fileUrl}`) : null;
    const nSrc = nf ? (fileToBase64(nf) || `${base}${nf.fileUrl}`) : null;

    partPages.push(`
    <div class="pb"></div>
    <div class="pp">
      <div class="pp-name">${esc(s.fullNamePassport)}</div>
      <div class="pp-num">رقم الجواز: ${esc(s.passportNumber)}</div>
      ${pSrc ? `<div class="pp-img"><div class="pp-lbl">صورة جواز السفر</div><img src="${esc(pSrc)}" class="pi" /></div>` : ''}
      ${nSrc ? `<div class="pp-img"><div class="pp-lbl">صورة بطاقة الهوية</div><img src="${esc(nSrc)}" class="pi" /></div>` : ''}
      ${!pSrc && !nSrc ? '<div class="pp-empty">لا توجد صور مرفقة</div>' : ''}
    </div>`);
  }

  const html = `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>بيانات المشاركين - ${esc(course.activityName || '')}</title>
<style>
  @page { size: A4; margin: 1.5cm 1.5cm; }
  body { font-family: 'Traditional Arabic', 'Arial', sans-serif; margin: 0; padding: 0; color: #222; font-size: 10pt; line-height: 1.5; }

  /* ===== Cover ===== */
  .dt { font-size: 15pt; font-weight: bold; color: #014f4d; text-align: center; margin: 0 0 12px; }
  .sub { font-size: 9pt; color: #666; text-align: center; margin: 0 0 16px; }

  /* Info table — 3 columns */
  .it { width: 100%; border-collapse: collapse; margin: 0 0 14px; }
  .it td { padding: 3px 6px; border: 1px solid #aaa; font-size: 8.5pt; }
  .il { font-weight: bold; background: #f0f4f4; width: 50px; white-space: nowrap; }
  .iv { }

  /* Participant table */
  .dtbl { width: 100%; border-collapse: collapse; margin: 0 0 6px; font-size: 7pt; }
  .dtbl th { background: #014f4d; color: #fff; padding: 3px 2px; text-align: center; font-weight: bold; font-size: 7pt; }
  .dtbl td { border: 1px solid #aaa; padding: 1px 3px; text-align: center; }
  .dtbl tr:nth-child(even) { background: #f8fafa; }

  /* ===== Participant pages ===== */
  .pb { page-break-after: always; border: none; height: 0; margin: 0; }
  .pp { padding: 10px 0; text-align: center; }
  .pp-name { font-size: 14pt; font-weight: bold; color: #014f4d; margin-bottom: 2px; }
  .pp-num { font-size: 9pt; color: #555; margin-bottom: 14px; }
  .pp-img { margin: 0 auto 12px; text-align: center; }
  .pp-lbl { font-size: 9pt; font-weight: bold; color: #333; margin-bottom: 4px; }
  .pi { max-width: 100%; max-height: 420px; border: 1px solid #bbb; }
  .pp-empty { padding: 30px; color: #999; font-size: 9pt; border: 1px dashed #bbb; }

  /* Footer */
  .ft { text-align: center; color: #999; font-size: 6.5pt; margin-top: 12px; padding-top: 4px; border-top: 1px solid #ddd; }
</style>
</head>
<body>

<div class="dt">بيانات المشاركين في الدورة الخارجية</div>
<div class="sub">جامعة نايف العربية للعلوم الأمنية — وكالة التدريب</div>

<table class="it" cellspacing="0" cellpadding="0">
  ${infoRows.join('')}
</table>

<table class="dtbl" cellspacing="0" cellpadding="0">
  <thead>
    <tr>
      <th>م</th><th>الاسم</th><th>رقم الجواز</th><th>انتهاء الجواز</th>
      <th>الهوية</th><th>الجوال</th><th>الميلاد</th><th>IBAN</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>

<div class="ft">تم التصدير من منصة تأمين المشاركين — ${new Date().toLocaleDateString('ar-SA')}</div>

${partPages.join('')}

<div class="ft" style="margin-top:20px;">تم التصدير من منصة تأمين المشاركين للدورات الخارجية — ${new Date().toLocaleDateString('ar-SA')}</div>

</body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'application/msword',
      'Content-Disposition': `attachment; filename="${(course.activityName || 'course').replace(/[^a-zA-Z0-9\-_ ]/g, '')}-participants.doc`
    }
  });
}
