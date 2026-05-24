import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, AlignmentType, WidthType, BorderStyle,
} from 'docx';

const MUTED = '666666';
const DARK = '014f4d';
const LINE = 'aaaaaa';

function cmToEmu(cm: number) { return Math.round(cm * 360000); }

function txt(text: string, opts: { bold?: boolean; size?: number; color?: string; font?: string } = {}): TextRun {
  return new TextRun({ text, font: opts.font || 'Traditional Arabic', size: opts.size ?? 22, bold: opts.bold, color: opts.color });
}

function para(children: TextRun[], opts: { align?: string; spacing?: number; spaceBefore?: number; spaceAfter?: number } = {}): Paragraph {
  return new Paragraph({
    children,
    alignment: opts.align as any || AlignmentType.RIGHT,
    spacing: { before: opts.spaceBefore ?? 0, after: opts.spaceAfter ?? 0, line: opts.spacing },
  });
}

function cell(children: Paragraph[], opts: { width?: number; span?: number; shade?: string; border?: boolean } = {}): TableCell {
  return new TableCell({
    children,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    columnSpan: opts.span,
    shading: opts.shade ? { fill: opts.shade, type: 'clear' as any } : undefined,
    borders: opts.border === false ? undefined : {
      top: { style: BorderStyle.SINGLE, size: 1, color: LINE },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: LINE },
      left: { style: BorderStyle.SINGLE, size: 1, color: LINE },
      right: { style: BorderStyle.SINGLE, size: 1, color: LINE },
    },
  });
}

function row(cells: TableCell[], isHeader = false): TableRow {
  return new TableRow({ children: cells, tableHeader: isHeader });
}

function imageParagraph(buffer: Buffer | null, label: string): Paragraph[] | null {
  if (!buffer || buffer.length < 100) return null;

  let type: 'jpg' | 'png' | 'gif' | 'bmp' = 'jpg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50) type = 'png';
  else if (buffer[0] === 0xff && buffer[1] === 0xd8) type = 'jpg';
  else if (buffer[0] === 0x47 && buffer[1] === 0x49) type = 'gif';
  else if (buffer[0] === 0x42 && buffer[1] === 0x4d) type = 'bmp';

  try {
    const img = new ImageRun({
      type,
      data: buffer,
      transformation: { width: cmToEmu(13), height: cmToEmu(9) },
    });
    return [
      para([txt(label, { size: 18, bold: true, color: MUTED })], { align: 'center', spaceAfter: 40 }),
      para([img], { align: 'center', spaceAfter: 80 }),
    ];
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

  // ========== Build document sections ==========
  const children: (Paragraph | Table)[] = [];

  // --- Title ---
  children.push(para([txt('بيانات المشاركين في الدورة الخارجية', { size: 32, bold: true, color: DARK })], { align: 'center', spaceAfter: 40 }));
  children.push(para([txt('جامعة نايف العربية للعلوم الأمنية — وكالة التدريب', { size: 20, color: MUTED })], { align: 'center', spaceAfter: 200 }));

  // --- Course info table (3 cols × 2 rows) ---
  const infoData = [
    ['النشاط', course.activityName || '—'],
    ['المكان', course.venue || '—'],
    ['من', formatDate(course.startDate)],
    ['إلى', formatDate(course.endDate)],
    ['المشاركون', String(course.submissions.length)],
    ['إعداد', course.createdBy?.name || '—'],
  ];

  const infoCells = infoData.map(([l, v]) => [
    cell([para([txt(l, { bold: true, size: 18 })], { align: 'right' })], { shade: 'f0f4f4', width: 800 }),
    cell([para([txt(v, { size: 18 })], { align: 'right' })], { width: 2000 }),
  ]);

  const infoRows: TableRow[] = [];
  for (let r = 0; r < 2; r++) {
    const cells: TableCell[] = [];
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      if (idx < infoCells.length) cells.push(...infoCells[idx]);
    }
    infoRows.push(row(cells));
  }

  children.push(new Table({
    rows: infoRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    visuallyRightToLeft: true,
  }));

  children.push(para([], { spaceAfter: 100 }));

  // --- Participant table (compact) ---
  const headers = ['م', 'الاسم', 'رقم الجواز', 'انتهاء الجواز', 'الهوية', 'الجوال', 'الميلاد', 'IBAN'];
  const headerRow = row(headers.map(h => cell([para([txt(h, { bold: true, size: 14, color: 'ffffff' })], { align: 'center' })], { shade: DARK, border: false })), true);

  const dataRows = course.submissions.map((s, i) => row([
    cell([para([txt(String(i + 1), { size: 14 })], { align: 'center' })]),
    cell([para([txt(s.fullNamePassport, { size: 14 })], { align: 'center' })]),
    cell([para([txt(s.passportNumber, { size: 14 })], { align: 'center' })]),
    cell([para([txt(formatDate(s.passportExpiry), { size: 14 })], { align: 'center' })]),
    cell([para([txt(s.nationalId, { size: 14 })], { align: 'center' })]),
    cell([para([txt(s.mobile, { size: 14 })], { align: 'center' })]),
    cell([para([txt(formatDate(s.birthDate), { size: 14 })], { align: 'center' })]),
    cell([para([txt(s.iban, { size: 11 })], { align: 'center' })]),
  ]));

  children.push(new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    visuallyRightToLeft: true,
  }));

  children.push(para([txt(`تم التصدير من منصة تأمين المشاركين — ${new Date().toLocaleDateString('ar-SA')}`, { size: 14, color: MUTED })], { align: 'center', spaceBefore: 200 }));

  // --- Participant pages ---
  for (const s of course.submissions) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(para([txt(s.fullNamePassport, { size: 32, bold: true, color: DARK })], { align: 'center', spaceAfter: 40 }));
    children.push(para([txt(`رقم الجواز: ${s.passportNumber}`, { size: 20, color: MUTED })], { align: 'center', spaceAfter: 200 }));

    const pf = s.files.find(f => f.fileType === 'PASSPORT');
    const nf = s.files.find(f => f.fileType === 'NATIONAL_ID');

    const pBuf = pf?.fileData ? (pf.fileData instanceof Buffer ? pf.fileData : Buffer.from(pf.fileData as Uint8Array)) : null;
    const nBuf = nf?.fileData ? (nf.fileData instanceof Buffer ? nf.fileData : Buffer.from(nf.fileData as Uint8Array)) : null;
    const pImg = pBuf ? imageParagraph(pBuf, 'صورة جواز السفر') : null;
    const nImg = nBuf ? imageParagraph(nBuf, 'صورة بطاقة الهوية') : null;

    if (pImg) { children.push(...pImg); }
    else { children.push(para([txt('لا توجد صورة جواز السفر', { size: 18, color: MUTED })], { align: 'center', spaceAfter: 80 })); }

    if (nImg) { children.push(...nImg); }
    else { children.push(para([txt('لا توجد صورة بطاقة الهوية', { size: 18, color: MUTED })], { align: 'center', spaceAfter: 80 })); }

    children.push(para([txt(`تم التصدير من منصة تأمين المشاركين للدورات الخارجية — ${new Date().toLocaleDateString('ar-SA')}`, { size: 14, color: MUTED })], { align: 'center', spaceBefore: 200 }));
  }

  // --- Build document ---
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Traditional Arabic', size: 22 },
          paragraph: { alignment: AlignmentType.RIGHT },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: cmToEmu(1.5), bottom: cmToEmu(1.5), right: cmToEmu(1.5), left: cmToEmu(1.5) },
          size: { width: cmToEmu(21), height: cmToEmu(29.7) },
        },
      },
      children,
    }],
  });

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await Packer.toBuffer(doc));
  } catch {
    // Fallback: return minimal doc with just text
    const fallbackDoc = new Document({
      sections: [{
        properties: {
          page: {
            margin: { top: cmToEmu(1.5), bottom: cmToEmu(1.5), right: cmToEmu(1.5), left: cmToEmu(1.5) },
            size: { width: cmToEmu(21), height: cmToEmu(29.7) },
          },
        },
        children: [
          para([txt('بيانات المشاركين', { size: 32, bold: true, color: DARK })], { align: 'center', spaceAfter: 200 }),
          ...course.submissions.map((s) =>
            para([txt(`${s.fullNamePassport} — ${s.passportNumber}`, { size: 22 })], { align: 'right', spaceAfter: 100 })
          ),
        ],
      }],
    });
    buffer = Buffer.from(await Packer.toBuffer(fallbackDoc));
  }

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${(course.activityName || 'course').replace(/[^a-zA-Z0-9\-_ ]/g, '')}-participants.docx`
    }
  });
}
