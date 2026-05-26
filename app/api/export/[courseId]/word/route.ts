import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import sharp from 'sharp';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, AlignmentType, WidthType, BorderStyle, PageOrientation,
  TableLayoutType, ImageRun,
} from 'docx';

const IMG_WIDTH = 350;
const IMG_HEIGHT = 263;

const MUTED = '666666';
const DARK = '014f4d';
const LINE = 'cccccc';
const BORDER = { style: BorderStyle.SINGLE as any, size: 6, color: LINE };
const NO_BORDER = { style: BorderStyle.NONE as any, size: 0, color: 'ffffff' };

function cmToEmu(cm: number) { return Math.round(cm * 360000); }
function cmToTwip(cm: number) { return Math.round(cm * 1440 / 2.54); }

function txt(text: string, opts: { bold?: boolean; size?: number; color?: string } = {}): TextRun {
  return new TextRun({ text, font: 'Arial', size: opts.size ?? 22, bold: opts.bold, color: opts.color });
}

function para(children: any[], opts: { align?: string; spaceBefore?: number; spaceAfter?: number } = {}): Paragraph {
  return new Paragraph({
    children,
    alignment: opts.align as any || AlignmentType.RIGHT,
    spacing: { before: opts.spaceBefore ?? 0, after: opts.spaceAfter ?? 0 },
  });
}

async function resizeImage(buffer: Buffer, maxWidth: number): Promise<Buffer | null> {
  try {
    return await sharp(buffer).rotate().resize(maxWidth, undefined, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
  } catch { return null; }
}

function imgParagraph(data: Buffer, label: string, width: number, height: number): Paragraph[] {
  const run = new ImageRun({ type: 'image' as any, data, transformation: { width, height } });
  return [
    new Paragraph({ children: [run], alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
    new Paragraph({ children: [txt(label, { size: 16, color: MUTED })], alignment: AlignmentType.CENTER }),
  ];
}

function cell(children: Paragraph[], opts: { width?: number; shade?: string } = {}): TableCell {
  return new TableCell({
    children,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.shade ? { fill: opts.shade, type: 'clear' as any } : undefined,
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [para([txt(text, { bold: true, size: 16, color: 'ffffff' })], { align: 'center' })],
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: { fill: DARK, type: 'clear' as any },
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function dataCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [para([txt(text, { size: 16 })], { align: 'center' })],
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
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

  const children: (Paragraph | Table)[] = [];

  // --- Title ---
  children.push(para([txt('بيانات المشاركين في الدورة الخارجية', { size: 32, bold: true, color: DARK })], { align: 'center', spaceAfter: 40 }));
  children.push(para([txt('جامعة نايف العربية للعلوم الأمنية — وكالة التدريب', { size: 20, color: MUTED })], { align: 'center', spaceAfter: 300 }));

  // --- Course info table ---
  const infoRows: TableRow[] = [];
  const infoItems = [
    ['النشاط', course.activityName || '—'],
    ['المكان', course.venue || '—'],
    ['تاريخ البداية', formatDate(course.startDate)],
    ['تاريخ النهاية', formatDate(course.endDate)],
    ['عدد المشاركين', String(course.submissions.length)],
    ['إعداد', course.createdBy?.name || '—'],
  ];

  for (let i = 0; i < infoItems.length; i += 2) {
    const left = infoItems[i];
    const right = infoItems[i + 1];
    infoRows.push(new TableRow({
      children: [
        cell([para([txt(left[0], { bold: true, size: 18 })], { align: 'right' })], { shade: 'f0f4f4', width: 2200 }),
        cell([para([txt(left[1], { size: 18 })], { align: 'right' })], { width: 3800 }),
        cell([para([txt(right[0], { bold: true, size: 18 })], { align: 'right' })], { shade: 'f0f4f4', width: 2200 }),
        cell([para([txt(right[1], { size: 18 })], { align: 'right' })], { width: 3800 }),
      ],
    }));
  }

  children.push(new Table({
    rows: infoRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [2200, 3800, 2200, 3800],
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
  }));

  children.push(para([], { spaceAfter: 200 }));

  // --- Participant table ---
  const hdrs = ['م', 'الاسم', 'رقم الجواز', 'انتهاء الجواز', 'الهوية', 'الجوال', 'الميلاد', 'IBAN'];
  const colWidths = [600, 2800, 1800, 1600, 1800, 1800, 1600, 3000];

  const partRows: TableRow[] = [
    new TableRow({
      children: hdrs.map((h, i) => headerCell(h, colWidths[i])),
      tableHeader: true,
    }),
    ...course.submissions.map((s, i) => new TableRow({
      children: [
        dataCell(String(i + 1), colWidths[0]),
        dataCell(s.fullNamePassport, colWidths[1]),
        dataCell(s.passportNumber, colWidths[2]),
        dataCell(formatDate(s.passportExpiry), colWidths[3]),
        dataCell(s.nationalId, colWidths[4]),
        dataCell(s.mobile, colWidths[5]),
        dataCell(formatDate(s.birthDate), colWidths[6]),
        dataCell(s.iban, colWidths[7]),
      ],
      cantSplit: true,
    })),
  ];

  children.push(new Table({
    rows: partRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: colWidths,
    layout: TableLayoutType.FIXED,
    visuallyRightToLeft: true,
  }));

  children.push(para([txt(`تم التصدير من منصة تأمين المشاركين — ${new Date().toLocaleDateString('ar-SA')}`, { size: 14, color: MUTED })], { align: 'center', spaceBefore: 300 }));

  // --- Per-participant pages ---
  for (const s of course.submissions) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(para([txt(s.fullNamePassport, { size: 36, bold: true, color: DARK })], { align: 'center', spaceAfter: 40 }));
    children.push(para([
      txt(`رقم الهوية: ${s.nationalId}`, { size: 20, color: MUTED }),
      txt(`  —  `, { size: 20, color: MUTED }),
      txt(`الجوال: ${s.mobile}`, { size: 20, color: MUTED }),
    ], { align: 'center', spaceAfter: 300 }));

    const pf = s.files.find(f => f.fileType === 'PASSPORT');
    const nf = s.files.find(f => f.fileType === 'NATIONAL_ID');

    const pfBuf = pf?.fileData ? await resizeImage(pf.fileData, IMG_WIDTH * 2) : null;
    const nfBuf = nf?.fileData ? await resizeImage(nf.fileData, IMG_WIDTH * 2) : null;

    // RTL: first cell = right (passport), second cell = left (national ID)
    const rightCellPars: Paragraph[] = pfBuf
      ? imgParagraph(pfBuf, 'صورة جواز السفر', IMG_WIDTH, IMG_HEIGHT)
      : [para([txt('لا توجد صورة جواز السفر', { size: 16, color: MUTED })], { align: 'center' })];
    const leftCellPars: Paragraph[] = nfBuf
      ? imgParagraph(nfBuf, 'صورة بطاقة الهوية', IMG_WIDTH, IMG_HEIGHT)
      : [para([txt('لا توجد صورة بطاقة الهوية', { size: 16, color: MUTED })], { align: 'center' })];

    children.push(new Table({
      rows: [new TableRow({
        children: [
          new TableCell({
            children: rightCellPars,
            width: { size: 50, type: WidthType.PERCENTAGE },
            verticalAlign: 'center' as any,
            borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
          }),
          new TableCell({
            children: leftCellPars,
            width: { size: 50, type: WidthType.PERCENTAGE },
            verticalAlign: 'center' as any,
            borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
          }),
        ],
      })],
      width: { size: 80, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      visuallyRightToLeft: true,
    }));

    children.push(para([txt('منصة تأمين المشاركين للدورات الخارجية', { size: 14, color: MUTED })], { align: 'center', spaceBefore: 400 }));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 22 },
          paragraph: { alignment: AlignmentType.RIGHT },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: cmToTwip(1.5), bottom: cmToTwip(1.5), right: cmToTwip(1.5), left: cmToTwip(1.5) },
          size: { width: cmToEmu(29.7), height: cmToEmu(21), orientation: PageOrientation.LANDSCAPE },
          pageNumbers: { start: 1 },
        },
      },
      children,
    }],
  });

  const buffer = Buffer.from(await Packer.toBuffer(doc));

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${(course.activityName || 'course').replace(/[^a-zA-Z0-9\-_ ]/g, '')}-participants.docx"`,
    },
  });
}
