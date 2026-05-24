import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import ExcelJS from 'exceljs';

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

  await logAudit({ userId: session.userId, action: 'EXPORT_EXCEL', entityType: 'Course', entityId: params.courseId });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'منصة تأمين المشاركين';
  wb.created = new Date();

  // --- Sheet 1: Course Info ---
  const infoSheet = wb.addWorksheet('معلومات الدورة', { views: [{ rightToLeft: true }] });
  infoSheet.columns = [
    { header: '', key: 'label', width: 22 },
    { header: '', key: 'value', width: 50 },
  ];

  const infoData = [
    ['النشاط', course.activityName || '—'],
    ['المكان', course.venue || '—'],
    ['تاريخ البداية', formatDate(course.startDate)],
    ['تاريخ النهاية', formatDate(course.endDate)],
    ['عدد المشاركين', String(course.submissions.length)],
    ['إعداد', course.createdBy?.name || '—'],
    ['تاريخ التصدير', new Date().toLocaleDateString('ar-SA')],
  ];

  infoData.forEach(([label, value]) => {
    const row = infoSheet.addRow([label, value]);
    row.getCell(1).font = { bold: true, size: 12 };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4F4' } };
    row.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    row.getCell(2).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });

  // --- Sheet 2: Participants ---
  const partSheet = wb.addWorksheet('المشاركون', { views: [{ rightToLeft: true }] });
  const headers = ['م', 'الاسم', 'رقم الجواز', 'انتهاء الجواز', 'رقم الهوية', 'الجوال', 'تاريخ الميلاد', 'IBAN', 'المرفقات'];
  const headerRow = partSheet.addRow(headers);

  const GREEN = 'FF016564';
  const WHITE = 'FFFFFFFF';
  const ALT_ROW = 'FFF8FBFB';

  headerRow.eachCell(c => {
    c.font = { bold: true, color: { argb: WHITE }, size: 11, name: 'Arial' };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  });

  course.submissions.forEach((s, i) => {
    const pf = s.files.find(f => f.fileType === 'PASSPORT');
    const nf = s.files.find(f => f.fileType === 'NATIONAL_ID');

    const attachments: string[] = [];
    if (pf) attachments.push(`📷 جواز: /api/files/${pf.id}`);
    if (nf) attachments.push(`🆔 هوية: /api/files/${nf.id}`);

    const row = partSheet.addRow([
      i + 1,
      s.fullNamePassport,
      s.passportNumber,
      formatDate(s.passportExpiry),
      s.nationalId,
      s.mobile,
      formatDate(s.birthDate),
      s.iban,
      attachments.join('\n'),
    ]);

    const bgColor = i % 2 === 1 ? ALT_ROW : null;
    row.eachCell((c, colIdx) => {
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: colIdx === 9 };
      c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      if (bgColor) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    });

    // Hyperlinks in attachments column
    const attachCell = row.getCell(9);
    if (pf) (attachCell as any).hyperlink = `/api/files/${pf.id}`;
  });

  partSheet.columns = [
    { width: 5 }, { width: 32 }, { width: 18 }, { width: 16 },
    { width: 16 }, { width: 18 }, { width: 16 }, { width: 32 }, { width: 40 },
  ];

  // Auto-filter
  partSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: course.submissions.length + 1, column: 9 },
  };

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${(course.activityName || 'course').replace(/[^a-zA-Z0-9\-_ ]/g, '')}-participants.xlsx"`,
    },
  });
}
