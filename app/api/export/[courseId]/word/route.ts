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

const PRIMARY = '016564';
const PRIMARY_LIGHT = 'e0f0f0';
const MUTED = '666666';
const LINE = 'cccccc';
const CREDIT = '999999';
const BORDER = { style: BorderStyle.SINGLE as any, size: 6, color: LINE };
const NO_BORDER = { style: BorderStyle.NONE as any, size: 0, color: 'ffffff' };

const MAX_IMAGE_BYTES = 250_000;
const IMG_CM_W = 10;
const IMG_CM_H = 7.5;

function cmToEmu(cm: number) { return Math.round(cm * 360000); }
function cmToTwip(cm: number) { return Math.round(cm * 1440 / 2.54); }
function dxa(cm: number) { return Math.round(cm * 567); }

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

function makeInfoCell(label: string, value: string, widthDxa: number, shaded: boolean): TableCell {
  return new TableCell({
    children: [
      para([txt(label, { bold: true, size: 17, color: PRIMARY })], { align: 'right' }),
      para([txt(value, { size: 17 })], { align: 'right', spaceAfter: 60 }),
    ],
    width: { size: widthDxa, type: WidthType.DXA },
    shading: shaded ? { fill: PRIMARY_LIGHT, type: 'clear' as any } : undefined,
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function tableHeaderCell(text: string, widthDxa: number): TableCell {
  return new TableCell({
    children: [para([txt(text, { bold: true, size: 16, color: 'ffffff' })], { align: 'center' })],
    width: { size: widthDxa, type: WidthType.DXA },
    shading: { fill: PRIMARY, type: 'clear' as any },
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function tableDataCell(text: string, widthDxa: number, shaded: boolean): TableCell {
  return new TableCell({
    children: [para([txt(text, { size: 16 })], { align: 'center' })],
    width: { size: widthDxa, type: WidthType.DXA },
    shading: shaded ? { fill: PRIMARY_LIGHT, type: 'clear' as any } : undefined,
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function imageCell(data: Buffer | null | undefined, mimeType: string | null | undefined, fallback: string): TableCell {
  if (data && data.length > 0 && data.length <= MAX_IMAGE_BYTES) {
    const ext = mimeType?.includes('png') ? 'png' : mimeType?.includes('gif') ? 'gif' : 'jpg';
    try {
      const run = new ImageRun({
        type: ext as 'jpg' | 'png' | 'gif',
        data,
        transformation: { width: cmToEmu(IMG_CM_W), height: cmToEmu(IMG_CM_H) },
      });
      return new TableCell({
        children: [
          new Paragraph({ children: [run], alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
        ],
        width: { size: dxa(IMG_CM_W + 1), type: WidthType.DXA },
        verticalAlign: 'center' as any,
        borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
      });
    } catch {
      // Image embedding failed; fall through to fallback
    }
  }
  return new TableCell({
    children: [para([txt(fallback, { size: 16, color: MUTED })], { align: 'center' })],
    width: { size: dxa(IMG_CM_W + 1), type: WidthType.DXA },
    verticalAlign: 'center' as any,
    borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
  });
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

    // ── Title ──
    children.push(para(
      [txt('بيانات المشاركين في الدورة الخارجية', { size: 34, bold: true, color: PRIMARY })],
      { align: 'center', spaceAfter: 40 },
    ));
    children.push(para(
      [txt('جامعة نايف العربية للعلوم الأمنية — كلية التدريب', { size: 20, color: MUTED })],
      { align: 'center', spaceAfter: 300 },
    ));

    // ── Course info table (4-col: label/value pairs) ──
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
          makeInfoCell(lLab, lVal, dxa(3), i % 4 === 0),
          makeInfoCell(rLab, rVal, dxa(3), i % 4 === 0),
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

    children.push(para([], { spaceAfter: 300 }));

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

    children.push(para(
      [txt(`تم التصدير من منصة تأمين المشاركين — ${new Date().toLocaleDateString('ar-SA')}`, { size: 14, color: MUTED })],
      { align: 'center', spaceBefore: 300 },
    ));
    children.push(para(
      [txt('طُوِّر بواسطة نايف الشهراني', { size: 12, color: CREDIT })],
      { align: 'center' },
    ));

    // ── Per-participant detail pages ──
    for (const s of course.submissions) {
      children.push(new Paragraph({ children: [new PageBreak()] }));

      children.push(para(
        [txt(s.fullNamePassport, { size: 36, bold: true, color: PRIMARY })],
        { align: 'center', spaceAfter: 200 },
      ));

      // Detail info table (6 columns: headers row + values row)
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

      children.push(para([], { spaceAfter: 300 }));

      // Images side by side
      const pf = s.files.find(f => f.fileType === 'PASSPORT');
      const nf = s.files.find(f => f.fileType === 'NATIONAL_ID');

      children.push(new Table({
        rows: [new TableRow({
          children: [
            new TableCell({
              children: [
                para([txt('صورة جواز السفر', { size: 18, bold: true, color: PRIMARY })], { align: 'center', spaceAfter: 80 }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
              verticalAlign: 'center' as any,
              borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            }),
            new TableCell({
              children: [
                para([txt('صورة بطاقة الهوية', { size: 18, bold: true, color: PRIMARY })], { align: 'center', spaceAfter: 80 }),
              ],
              width: { size: 50, type: WidthType.PERCENTAGE },
              verticalAlign: 'center' as any,
              borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
            }),
          ],
        }), new TableRow({
          children: [
            imageCell(pf?.fileData, pf?.mimeType, 'لا توجد صورة جواز السفر'),
            imageCell(nf?.fileData, nf?.mimeType, 'لا توجد صورة بطاقة الهوية'),
          ],
        })],
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [dxa(13.35), dxa(13.35)],
        layout: TableLayoutType.FIXED,
        visuallyRightToLeft: true,
      }));

      children.push(para(
        [txt('منصة تأمين المشاركين للدورات الخارجية', { size: 14, color: MUTED })],
        { align: 'center', spaceBefore: 400 },
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

    // Build filename: activityName-venue.docx
    const rawName = (course.activityName || 'course').replace(/[<>:"/\\|?*\n\r]/g, ' ').trim() || 'course';
    const rawVenue = course.venue ? '-' + course.venue.replace(/[<>:"/\\|?*\n\r]/g, ' ').trim() : '';
    const rawFilename = `${rawName}${rawVenue}-insurance.docx`;

    // HTTP headers must be ASCII. Use filename (ASCII fallback) + filename* (RFC 5987 UTF-8).
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
