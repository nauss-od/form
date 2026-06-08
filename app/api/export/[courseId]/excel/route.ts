import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import ExcelJS from 'exceljs';

export async function GET(_request: Request, { params }: { params: { courseId: string } }) {
  try {
    const session = getCurrentSession();
    if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        submissions: { include: { files: { select: { id: true, fileType: true, fileName: true } } }, orderBy: { createdAt: 'asc' } },
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

  const infoRows = [
    { label: 'النشاط', value: course.activityName || '—' },
    { label: 'المكان', value: course.venue || '—' },
    { label: 'تاريخ البداية', value: formatDate(course.startDate) },
    { label: 'تاريخ النهاية', value: formatDate(course.endDate) },
    { label: 'عدد المشاركين', value: String(course.submissions.length) },
    { label: 'إعداد', value: course.createdBy?.name || '—' },
    { label: 'تاريخ التصدير', value: new Date().toLocaleDateString('en-GB') },
  ];

  infoRows.forEach(r => infoSheet.addRow(r));

  infoSheet.getColumn('label').eachCell(c => {
    c.font = { bold: true, size: 12 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4F4' } };
  });

  // --- Sheet 2: Participants ---
  const partSheet = wb.addWorksheet('المشاركون', { views: [{ rightToLeft: true }] });
  const headers = ['م', 'الاسم', 'رقم الجواز', 'انتهاء الجواز', 'رقم الهوية', 'الجوال', 'تاريخ الميلاد', 'IBAN', 'المرفقات'];
  const headerRow = partSheet.addRow(headers);

  headerRow.eachCell(c => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF016564' } };
    c.alignment = { horizontal: 'center', vertical: 'middle' };
    c.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };
  });

  course.submissions.forEach((s, i) => {
    const pf = s.files.find(f => f.fileType === 'PASSPORT');
    const nf = s.files.find(f => f.fileType === 'NATIONAL_ID');

    const attachText = [pf ? '📷 جواز السفر' : '', nf ? '🆔 بطاقة الهوية' : ''].filter(Boolean).join(' + ');

    const row = partSheet.addRow([
      i + 1,
      s.fullNamePassport,
      s.passportNumber,
      formatDate(s.passportExpiry),
      s.nationalId,
      s.mobile,
      formatDate(s.birthDate),
      s.iban,
      attachText,
    ]);

    row.eachCell(c => {
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' },
      };
    });
  });

  partSheet.columns = [
    { width: 5 }, { width: 32 }, { width: 18 }, { width: 16 },
    { width: 16 }, { width: 18 }, { width: 16 }, { width: 32 }, { width: 30 },
  ];

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${(course.activityName || 'course').replace(/[^a-zA-Z0-9\-_ ]/g, '')}-participants.xlsx"`,
    },
  });
  } catch (err) {
    console.error('Excel export error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
