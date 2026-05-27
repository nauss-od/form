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

// ── NAUSS Brand Palette ──
const TEAL = '016564';
const TEAL_DARK = '014948';
const TEAL_DEEP = '022f2f';
const GOLD = 'd0b284';
const GOLD_DARK = 'b8975c';
const WHITE = 'ffffff';
const MUTED = '667777';
const LINE = 'c9d7d7';
const CREDIT = '99aaaa';

const BORDER = { style: BorderStyle.SINGLE as any, size: 6, color: LINE };
const NO_BORDER = { style: BorderStyle.NONE as any, size: 0, color: WHITE };

const MAX_IMAGE_BYTES = 0;
const MAX_DOC_BYTES = 3_800_000;
const IMG_CM_W = 5.5;
const IMG_CM_H = 4;

function cmToEmu(cm: number) { return Math.round(cm * 360000); }
function cmToTwip(cm: number) { return Math.round(cm * 1440 / 2.54); }
function dxa(cm: number) { return Math.round(cm * 567); }

function txt(text: string, opts: { bold?: boolean; size?: number; color?: string; font?: string } = {}): TextRun {
  return new TextRun({ text, font: opts.font ?? 'Arial', size: opts.size ?? 22, bold: opts.bold, color: opts.color });
}

function para(children: any[], opts: { align?: string; spaceBefore?: number; spaceAfter?: number } = {}): Paragraph {
  return new Paragraph({
    children,
    alignment: opts.align as any || AlignmentType.RIGHT,
    spacing: { before: opts.spaceBefore ?? 0, after: opts.spaceAfter ?? 0 },
  });
}

function infoCell(label: string, value: string, widthDxa: number, goldAccent: boolean): TableCell {
  return new TableCell({
    children: [
      para([txt(label, { bold: true, size: 16, color: goldAccent ? GOLD : TEAL, font: 'Arial' })], { align: 'right', spaceAfter: 20 }),
      para([txt(value, { size: 17, color: TEAL_DARK })], { align: 'right', spaceAfter: 40 }),
    ],
    width: { size: widthDxa, type: WidthType.DXA },
    shading: { fill: 'f6fafa', type: 'clear' as any },
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function tableHeaderCell(text: string, widthDxa: number): TableCell {
  return new TableCell({
    children: [para([txt(text, { bold: true, size: 16, color: WHITE })], { align: 'center' })],
    width: { size: widthDxa, type: WidthType.DXA },
    shading: { fill: TEAL, type: 'clear' as any },
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function tableDataCell(text: string, widthDxa: number, alt: boolean): TableCell {
  return new TableCell({
    children: [para([txt(text, { size: 16, color: TEAL_DARK })], { align: 'center' })],
    width: { size: widthDxa, type: WidthType.DXA },
    shading: alt ? { fill: 'f0f6f6', type: 'clear' as any } : undefined,
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function imageCell(data: Buffer | null | undefined, mimeType: string | null | undefined, fileSize: number | null | undefined, fallback: string, docSize: { value: number }): TableCell {
  const placeholder = 'صورة المرفق';

  // Try embedding with JPEG to avoid format guessing issues
  if (data && data.length > 0 && data.length <= MAX_IMAGE_BYTES && (docSize.value + data.length) <= MAX_DOC_BYTES) {
    // Detect actual format from magic bytes
    let ext = 'jpeg';
    if (data[0] === 0x89 && data[1] === 0x50) ext = 'png';
    else if (data[0] === 0xFF && data[1] === 0xD8) ext = 'jpeg';
    else if (data[0] === 0x47 && data[1] === 0x49) ext = 'gif';
    else if (data[0] === 0x42 && data[1] === 0x4D) ext = 'png';
    try {
      const run = new ImageRun({
        type: ext as 'jpg' | 'png' | 'gif',
        data,
        transformation: { width: cmToEmu(IMG_CM_W), height: cmToEmu(IMG_CM_H) },
      });
      docSize.value += data.length;
      return new TableCell({
        children: [
          new Paragraph({ children: [run], alignment: AlignmentType.CENTER, spacing: { after: 20 } }),
        ],
        width: { size: dxa(IMG_CM_W + 0.8), type: WidthType.DXA },
        verticalAlign: 'center' as any,
        borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
      });
    } catch {
      console.error('ImageRun failed for', fallback, 'size:', data.length);
    }
  }
  return new TableCell({
    children: [para([txt(placeholder, { size: 16, color: MUTED, font: 'Arial' })], { align: 'center' })],
    width: { size: dxa(IMG_CM_W + 0.8), type: WidthType.DXA },
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function goldBar(): Paragraph {
  return para([txt('—', { size: 6, color: GOLD })], { align: 'center', spaceAfter: 20 });
}

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        submissions: { include: { files: true }, orderBy: { createdAt: 'asc' } },
        createdBy: true,
      },
    });
    if (!course) {
      return NextResponse.json({ message: 'الدورة غير موجودة' }, { status: 404 });
    }
    if (session.role !== 'MANAGER' && course.createdByUserId !== session.userId) {
      return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
    }

    await logAudit({
      userId: session.userId,
      action: 'EXPORT_WORD',
      entityType: 'Course',
      entityId: params.courseId,
    });

    const children: (Paragraph | Table)[] = [];
    const docSize = { value: 0 };

    // ── Cover / Title ──
    children.push(para([], { spaceAfter: 200 }));
    children.push(para(
      [txt('بيانات المشاركين في الدورة الخارجية', { size: 36, bold: true, color: TEAL })],
      { align: 'center', spaceAfter: 40 },
    ));
    children.push(goldBar());
    children.push(para(
      [txt('جامعة نايف العربية للعلوم الأمنية — كلية التدريب', { size: 20, color: GOLD_DARK })],
      { align: 'center', spaceAfter: 300 },
    ));

    // ── Course info table ──
    const infoPairs: [string, string][] = [
      ['النشاط', course.activityName || '—'],
      ['المكان', course.venue || '—'],
      ['تاريخ البداية', formatDate(course.startDate)],
      ['تاريخ النهاية', formatDate(course.endDate)],
      ['عدد المشاركين', String(course.submissions.length)],
      ['إعداد', course.createdBy?.name || '—'],
    ];

    const infoRows: TableRow[] = [];
    for (let i = 0; i < infoPairs.length; i += 2) {
      const [lLab, lVal] = infoPairs[i];
      const [rLab, rVal] = infoPairs[i + 1] || ['', ''];
      infoRows.push(new TableRow({
        children: [
          infoCell(lLab, lVal, dxa(3), i % 4 === 0),
          infoCell(rLab, rVal, dxa(3), i % 4 === 0),
        ],
        cantSplit: true,
      }));
    }

    children.push(new Table({
      rows: infoRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [dxa(13.35), dxa(13.35)],
      layout: TableLayoutType.FIXED,
      visuallyRightToLeft: true,
    }));

    children.push(para([], { spaceAfter: 400 }));

    // ── Participants summary table ──
    const partCols = [
      { label: 'م', w: dxa(0.7) },
      { label: 'الاسم', w: dxa(5.5) },
      { label: 'رقم الجواز', w: dxa(3.2) },
      { label: 'انتهاء الجواز', w: dxa(2.8) },
      { label: 'رقم الهوية', w: dxa(3.2) },
      { label: 'الجوال', w: dxa(3.2) },
      { label: 'تاريخ الميلاد', w: dxa(2.8) },
      { label: 'IBAN', w: dxa(5) },
    ];

    const partRows: TableRow[] = [
      new TableRow({
        children: partCols.map(c => tableHeaderCell(c.label, c.w)),
        tableHeader: true,
      }),
      ...course.submissions.map((s, i) => new TableRow({
        children: [
          tableDataCell(String(i + 1), partCols[0].w, i % 2 === 1),
          tableDataCell(s.fullNamePassport, partCols[1].w, i % 2 === 1),
          tableDataCell(s.passportNumber, partCols[2].w, i % 2 === 1),
          tableDataCell(formatDate(s.passportExpiry), partCols[3].w, i % 2 === 1),
          tableDataCell(s.nationalId, partCols[4].w, i % 2 === 1),
          tableDataCell(s.mobile, partCols[5].w, i % 2 === 1),
          tableDataCell(formatDate(s.birthDate), partCols[6].w, i % 2 === 1),
          tableDataCell(s.iban, partCols[7].w, i % 2 === 1),
        ],
        cantSplit: true,
      })),
    ];

    children.push(new Table({
      rows: partRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: partCols.map(c => c.w),
      layout: TableLayoutType.FIXED,
      visuallyRightToLeft: true,
    }));

    children.push(para([], { spaceAfter: 200 }));
    children.push(para(
      [txt(`تم التصدير من منصة تأمين المشاركين — ${new Date().toLocaleDateString('ar-SA')}`, { size: 14, color: MUTED })],
      { align: 'center', spaceBefore: 200 },
    ));
    children.push(para(
      [txt('طُوِّر بواسطة نايف الشهراني', { size: 12, color: CREDIT })],
      { align: 'center' },
    ));

    // ── Per-participant detail pages ──
    for (const s of course.submissions) {
      children.push(new Paragraph({ children: [new PageBreak()] }));

      children.push(para([], { spaceAfter: 100 }));
      children.push(para(
        [txt(s.fullNamePassport, { size: 34, bold: true, color: TEAL })],
        { align: 'center', spaceAfter: 20 },
      ));
      children.push(goldBar());

      // Detail info table (6-col headers + values)
      const detailCols = [
        { label: 'رقم الجواز', w: dxa(3.5) },
        { label: 'انتهاء الجواز', w: dxa(3) },
        { label: 'رقم الهوية', w: dxa(4) },
        { label: 'الجوال', w: dxa(4) },
        { label: 'تاريخ الميلاد', w: dxa(3.5) },
        { label: 'IBAN', w: dxa(5.7) },
      ];
      const detailValues = [
        s.passportNumber,
        formatDate(s.passportExpiry),
        s.nationalId,
        s.mobile,
        formatDate(s.birthDate),
        s.iban,
      ];

      children.push(new Table({
        rows: [
          new TableRow({
            children: detailCols.map(c => tableHeaderCell(c.label, c.w)),
            cantSplit: true,
          }),
          new TableRow({
            children: detailValues.map((v, i) => tableDataCell(v, detailCols[i].w, false)),
            cantSplit: true,
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: detailCols.map(c => c.w),
        layout: TableLayoutType.FIXED,
        visuallyRightToLeft: true,
      }));

      children.push(para([], { spaceAfter: 250 }));

      // Images side by side
      const pf = s.files.find(f => f.fileType === 'PASSPORT');
      const nf = s.files.find(f => f.fileType === 'NATIONAL_ID');

      const imageLabelStyle = { size: 17, bold: true, color: TEAL } as const;

      children.push(new Table({
        rows: [new TableRow({
          children: [
            new TableCell({
              children: [
                para([txt('صورة جواز السفر', imageLabelStyle)], { align: 'center', spaceAfter: 60 }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
              verticalAlign: 'center' as any,
              borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            }),
            new TableCell({
              children: [
                para([txt('صورة بطاقة الهوية', imageLabelStyle)], { align: 'center', spaceAfter: 60 }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
              verticalAlign: 'center' as any,
              borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            }),
          ],
        }), new TableRow({
          children: [
            imageCell(pf?.fileData, pf?.mimeType, pf?.fileSize, 'لا توجد صورة جواز السفر', docSize),
            imageCell(nf?.fileData, nf?.mimeType, nf?.fileSize, 'لا توجد صورة بطاقة الهوية', docSize),
          ],
        })],
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [dxa(IMG_CM_W + 1), dxa(IMG_CM_W + 1)],
        layout: TableLayoutType.FIXED,
        visuallyRightToLeft: true,
      }));

      if (docSize.value >= MAX_DOC_BYTES) {
        children.push(para([], { spaceAfter: 200 }));
        children.push(para(
          [txt('⚠️ تم تخطي عدد من الصور بسبب حدود حجم الملف', { size: 16, color: MUTED })],
          { align: 'center' },
        ));
        break;
      }

      children.push(para([], { spaceAfter: 300 }));
      children.push(para(
        [txt('منصة تأمين المشاركين للدورات الخارجية', { size: 14, color: MUTED })],
        { align: 'center' },
      ));
      children.push(para(
        [txt('طُوِّر بواسطة نايف الشهراني', { size: 12, color: CREDIT })],
        { align: 'center' },
      ));
    }

    // ── Build document ──
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
            margin: {
              top: cmToTwip(1.5),
              bottom: cmToTwip(1.5),
              right: cmToTwip(1.5),
              left: cmToTwip(1.5),
            },
            size: {
              width: cmToEmu(29.7),
              height: cmToEmu(21),
              orientation: PageOrientation.LANDSCAPE,
            },
          },
        },
        children,
      }],
    });

    const buffer = Buffer.from(await Packer.toBuffer(doc));

    const rawName = (course.activityName || 'course').replace(/[<>:"/\\|?*\n\r]/g, ' ').trim() || 'course';
    const rawVenue = course.venue ? '-' + course.venue.replace(/[<>:"/\\|?*\n\r]/g, ' ').trim() : '';
    const rawFilename = `${rawName}${rawVenue}-insurance.docx`;

    const asciiFilename = rawFilename.replace(/[^\x20-\x7E]/g, '');
    const encodedFilename = encodeURIComponent(rawFilename);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (err) {
    console.error('Word export error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}