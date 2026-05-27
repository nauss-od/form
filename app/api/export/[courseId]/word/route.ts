import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, AlignmentType, WidthType, BorderStyle, PageOrientation,
  TableLayoutType, ImageRun,
} from 'docx';

const MAX_IMG_KB = 200;
const MUTED = '666666';
const DARK = '014f4d';
const LINE = 'cccccc';
const CREDIT = '999999';
const BORDER = { style: BorderStyle.SINGLE as any, size: 6, color: LINE };
const IMG_BORDER = { style: BorderStyle.SINGLE as any, size: 4, color: 'dddddd' };

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

type ImgInfo = { buf: Buffer; type: 'jpg' | 'png'; width: number; height: number };

function detectImage(buf: Buffer | null | undefined): ImgInfo | null {
  if (!buf || buf.length < 24) return null;
  if (buf.length > MAX_IMG_KB * 1024) return null;
  try {
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
      let pos = 2;
      while (pos < buf.length - 1) {
        if (buf[pos] !== 0xFF) break;
        const marker = buf[pos + 1];
        if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
          return { buf, type: 'jpg', width: buf[pos + 7] * 256 + buf[pos + 8], height: buf[pos + 5] * 256 + buf[pos + 6] };
        }
        pos += 2;
        if (marker === 0xD9 || marker === 0xDA) break;
        if (marker >= 0xD0 && marker <= 0xD7) continue;
        if (pos + 1 >= buf.length) break;
        const len = buf[pos] * 256 + buf[pos + 1];
        if (len < 2) break;
        pos += len;
      }
      return { buf, type: 'jpg', width: 200, height: 150 };
    }
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
      return { buf, type: 'png', width: buf[16] * 256 + buf[17], height: buf[20] * 256 + buf[21] };
    }
  } catch { }
  return null;
}

function imgParagraph(img: ImgInfo, label: string): Paragraph[] {
  const maxDisp = 360;
  const scale = Math.min(maxDisp / img.width, maxDisp / img.height, 1);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const run = new ImageRun({ type: img.type, data: img.buf, transformation: { width: w, height: h } });
  return [
    new Paragraph({ children: [run], alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
    new Paragraph({ children: [txt(label, { size: 16, color: MUTED })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
  ];
}

function imgCell(data: Buffer | null | undefined, label: string, fallback: string): TableCell {
  const img = detectImage(data);
  const children: Paragraph[] = img ? imgParagraph(img, label) : [para([txt(fallback, { size: 16, color: MUTED })], { align: 'center' })];
  return new TableCell({
    children,
    width: { size: 6000, type: WidthType.DXA },
    verticalAlign: 'center' as any,
    borders: { top: IMG_BORDER, bottom: IMG_BORDER, left: IMG_BORDER, right: IMG_BORDER },
  });
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
  try {
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
  children.push(para([txt('طُوِّر بواسطة نايف الشهراني', { size: 12, color: CREDIT })], { align: 'center' }));

  // --- Per-participant pages ---
  for (const s of course.submissions) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(para([txt(s.fullNamePassport, { size: 36, bold: true, color: DARK })], { align: 'center', spaceAfter: 160 }));

    // 2-row info table: headers + values, fills page for centering
    const infoHeaders = ['رقم الجواز', 'انتهاء الجواز', 'رقم الهوية', 'الجوال', 'تاريخ الميلاد', 'IBAN'];
    const infoValues = [s.passportNumber, formatDate(s.passportExpiry), s.nationalId, s.mobile, formatDate(s.birthDate), s.iban];
    const infoColWidths = [1800, 1400, 1800, 1400, 1400, 1800];

    children.push(new Table({
      rows: [
        new TableRow({
          children: infoHeaders.map((h, i) => headerCell(h, infoColWidths[i])),
          cantSplit: true,
        }),
        new TableRow({
          children: infoValues.map((v, i) => dataCell(v, infoColWidths[i])),
          cantSplit: true,
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: infoColWidths,
      layout: TableLayoutType.FIXED,
      visuallyRightToLeft: true,
    }));

    children.push(para([], { spaceAfter: 250 }));

    // Images side by side
    children.push(new Table({
      rows: [new TableRow({
        children: [
          imgCell(s.files.find(f => f.fileType === 'PASSPORT')?.fileData, 'صورة جواز السفر', 'لا توجد صورة جواز السفر'),
          imgCell(s.files.find(f => f.fileType === 'NATIONAL_ID')?.fileData, 'صورة بطاقة الهوية', 'لا توجد صورة بطاقة الهوية'),
        ],
      })],
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [6000, 6000],
      layout: TableLayoutType.FIXED,
      visuallyRightToLeft: true,
    }));

    children.push(para([txt('منصة تأمين المشاركين للدورات الخارجية', { size: 14, color: MUTED })], { align: 'center', spaceBefore: 400 }));
    children.push(para([txt('طُوِّر بواسطة نايف الشهراني', { size: 12, color: CREDIT })], { align: 'center' }));
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
        },
      },
      children,
    }],
  });

  const buffer = Buffer.from(await Packer.toBuffer(doc));

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${(course.activityName || 'course').replace(/[<>:"/\\|?*]/g, '')}${course.venue ? '-' + course.venue.replace(/[<>:"/\\|?*]/g, '') : ''}-insurance.docx"`,
    },
  });
  } catch (err) {
    console.error('Word export error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
