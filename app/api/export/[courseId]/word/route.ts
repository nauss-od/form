import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle,
  TableLayoutType, ExternalHyperlink,
} from 'docx';

const TEAL = '016564';
const TEAL_DARK = '014948';
const GOLD = 'd0b284';
const GOLD_DARK = 'b8975c';
const WHITE = 'ffffff';
const MUTED = '667777';
const LINE = 'c9d7d7';
const CREDIT = '99aaaa';
const BORDER = { style: BorderStyle.SINGLE as any, size: 6, color: LINE };
const FONT = 'BoutrosJazirahTextLight';

function cmToTwip(cm: number) { return Math.round(cm * 1440 / 2.54); }
function dxa(cm: number) { return Math.round(cm * 567); }

function trun(text: string, opts: { bold?: boolean; size?: number; color?: string } = {}): TextRun {
  return new TextRun({ text, font: FONT, size: opts.size ?? 28, bold: opts.bold, color: opts.color });
}

function para(children: any[], opts: { align?: string; spaceBefore?: number; spaceAfter?: number } = {}): Paragraph {
  return new Paragraph({
    children,
    alignment: opts.align as any || AlignmentType.RIGHT,
    spacing: { before: opts.spaceBefore ?? 0, after: opts.spaceAfter ?? 0 },
  });
}

function tableHeaderCell(text: string, widthDxa: number): TableCell {
  return new TableCell({
    children: [para([trun(text, { bold: true, size: 28, color: WHITE })], { align: 'center' })],
    width: { size: widthDxa, type: WidthType.DXA },
    shading: { fill: TEAL, type: 'clear' as any },
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function tableDataCell(text: string, widthDxa: number, alt: boolean): TableCell {
  return new TableCell({
    children: [para([trun(text, { size: 28, color: TEAL_DARK })], { align: 'center' })],
    width: { size: widthDxa, type: WidthType.DXA },
    shading: alt ? { fill: 'f0f6f6', type: 'clear' as any } : undefined,
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
  });
}

function tableLinkCell(url: string, widthDxa: number, alt: boolean): TableCell {
  return new TableCell({
    children: [para([
      new ExternalHyperlink({
        children: [trun('لمعلومات المشارك كاملة', { size: 28, color: '0563C1' })],
        link: url,
      }),
    ], { align: 'center' })],
    width: { size: widthDxa, type: WidthType.DXA },
    shading: alt ? { fill: 'f0f6f6', type: 'clear' as any } : undefined,
    verticalAlign: 'center' as any,
    borders: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
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

    const baseUrl = new URL(request.url).origin;
    const children: (Paragraph | Table)[] = [];
    const subs = course.submissions;

    // Title
    children.push(para([], { spaceAfter: 200 }));
    children.push(para(
      [trun('بيانات المشاركين في الدورة الخارجية', { size: 36, bold: true, color: TEAL })],
      { align: 'center', spaceAfter: 40 },
    ));
    children.push(para(
      [trun('جامعة نايف العربية للعلوم الأمنية — كلية التدريب', { size: 20, color: GOLD_DARK })],
      { align: 'center', spaceAfter: 300 },
    ));

    // Course info table
    const infoCols = [
      { label: 'النشاط', w: dxa(2.5) },
      { label: 'المكان', w: dxa(2.5) },
      { label: 'تاريخ البداية', w: dxa(2.3) },
      { label: 'تاريخ النهاية', w: dxa(2.3) },
      { label: 'عدد المشاركين', w: dxa(1.8) },
      { label: 'إعداد', w: dxa(2.2) },
    ];
    const infoVals = [
      course.activityName || '—',
      course.venue || '—',
      formatDate(course.startDate),
      formatDate(course.endDate),
      String(subs.length),
      course.createdBy?.name || '—',
    ];

    children.push(new Table({
      rows: [
        new TableRow({
          children: infoCols.map(c => tableHeaderCell(c.label, c.w)),
          cantSplit: true,
        }),
        new TableRow({
          children: infoVals.map((v, i) => tableDataCell(v, infoCols[i].w, false)),
          cantSplit: true,
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: infoCols.map(c => c.w),
      layout: TableLayoutType.FIXED,
      visuallyRightToLeft: true,
    }));

    children.push(para([], { spaceAfter: 400 }));

    // Participant table: index + name + link to attachments
    const partCols = [
      { label: 'م', w: dxa(0.8) },
      { label: 'الاسم', w: dxa(5.5) },
      { label: 'رابط المرفقات', w: dxa(13) },
    ];

    children.push(para(
      [trun('قائمة المشاركين', { size: 22, bold: true, color: TEAL })],
      { align: 'right', spaceAfter: 150 },
    ));

    children.push(new Table({
      rows: [
        new TableRow({ children: partCols.map(c => tableHeaderCell(c.label, c.w)), tableHeader: true }),
        ...subs.map((s, i) => new TableRow({
          children: [
            tableDataCell(String(i + 1), partCols[0].w, i % 2 === 1),
            tableDataCell(s.fullNamePassport, partCols[1].w, i % 2 === 1),
            tableLinkCell(`${baseUrl}/participant/${s.id}`, partCols[2].w, i % 2 === 1),
          ],
          cantSplit: true,
        })),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: partCols.map(c => c.w),
      layout: TableLayoutType.FIXED,
      visuallyRightToLeft: true,
    }));

    children.push(para([], { spaceAfter: 200 }));
    children.push(para(
      [trun(`تم التصدير من منصة تأمين المشاركين — ${new Date().toLocaleDateString('ar-SA')}`, { size: 14, color: MUTED })],
      { align: 'center', spaceBefore: 200 },
    ));
    children.push(para(
      [trun('طُوِّر بواسطة نايف الشهراني', { size: 12, color: CREDIT })],
      { align: 'center' },
    ));

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: FONT, size: 28 },
            paragraph: { alignment: AlignmentType.RIGHT },
          },
        },
      },
      sections: [{
        properties: {
          page: {
            margin: { top: cmToTwip(1.5), bottom: cmToTwip(1.5), right: cmToTwip(1.5), left: cmToTwip(1.5) },
            size: { width: 11906, height: 16838 },
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
