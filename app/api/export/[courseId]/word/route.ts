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

  const rows = course.submissions.map((s, i) => {
    const passportFile = s.files.find(f => f.fileType === 'PASSPORT');
    const nationalIdFile = s.files.find(f => f.fileType === 'NATIONAL_ID');
    return `<tr>
      <td>${i + 1}</td>
      <td>${s.fullNamePassport}</td>
      <td>${s.passportNumber}</td>
      <td>${formatDate(s.passportExpiry)}</td>
      <td>${s.nationalId}</td>
      <td>${s.mobile}</td>
      <td>${formatDate(s.birthDate)}</td>
      <td>${s.iban}</td>
    </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html dir="rtl">
<head><meta charset="utf-8"><title>بيانات المشاركين</title>
<style>
  body { font-family: 'Arial', sans-serif; margin: 40px; }
  h1 { color: #014f4d; font-size: 18pt; margin-bottom: 5px; }
  h2 { color: #333; font-size: 14pt; margin-bottom: 15px; }
  .info { margin-bottom: 20px; line-height: 1.8; }
  .info strong { display: inline-block; min-width: 120px; }
  table { width: 100%; border-collapse: collapse; margin-top: 15px; }
  th { background: #014f4d; color: white; padding: 8px; text-align: center; }
  td { border: 1px solid #ccc; padding: 6px; text-align: center; }
  .footer { margin-top: 30px; font-size: 10pt; color: #666; }
</style></head>
<body>
  <h1>جامعة نايف العربية للعلوم الأمنية</h1>
  <h2>بيانات المشاركين في الدورة الخارجية</h2>
  <div class="info">
    <strong>اسم النشاط:</strong> ${course.activityName || '—'}<br>
    <strong>مقر الانعقاد:</strong> ${course.venue || '—'}<br>
    <strong>تاريخ البداية:</strong> ${formatDate(course.startDate)}<br>
    <strong>تاريخ النهاية:</strong> ${formatDate(course.endDate)}<br>
    <strong>عدد المشاركين:</strong> ${course.submissions.length} / ${course.participantCount || '—'}<br>
    <strong>إعداد:</strong> ${course.createdBy.name}
  </div>
  <table>
    <tr>
      <th>م</th><th>الاسم حسب الجواز</th><th>رقم الجواز</th><th>تاريخ انتهاء الجواز</th>
      <th>رقم الهوية</th><th>رقم الجوال</th><th>تاريخ الميلاد</th><th>رقم الآيبان</th>
    </tr>
    ${rows}
  </table>
  <div class="footer">تم التصدير من منصة تأمين المشاركين للدورات الخارجية — ${new Date().toLocaleDateString('ar-SA')}</div>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${course.activityName || 'course'}-participants.docx"`
    }
  });
}
