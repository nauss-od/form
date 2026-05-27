import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { getCurrentSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, AlignmentType, WidthType, BorderStyle,
  TableLayoutType, ImageRun,
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

const MAX_IMAGE_BYTES = 1_000_000;
const MAX_DOC_BYTES = 3_500_000;
const IMG_CM_W = 17.5;
const IMG_CM_H = 8.5;

function cmToEmu(cm: number) { return Math.round(cm * 360000); }
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

    children.push(para([], { spaceAfter: 200 }));
    children.push(para(
      [trun('بيانات المشاركين في الدورة الخارجية', { size: 36, bold: true, color: TEAL })],
      { align: 'center', spaceAfter: 40 },
    ));
    children.push(para([trun('—', { size: 6, color: GOLD })], { align: 'center', spaceAfter: 20 }));
    children.push(para(
      [trun('جامعة نايف العربية للعلوم الأمنية — كلية التدريب', { size: 20, color: GOLD_DARK })],
      { align: 'center', spaceAfter: 300 },
    ));

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
      String(course.submissions.length),
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
      [trun(`تم التصدير من منصة تأمين المشاركين — ${new Date().toLocaleDateString('ar-SA')}`, { size: 14, color: MUTED })],
      { align: 'center', spaceBefore: 200 },
    ));
    children.push(para(
      [trun('طُوِّر بواسطة نايف الشهراني', { size: 12, color: CREDIT })],
      { align: 'center' },
    ));

    for (const s of course.submissions) {
      children.push(new Paragraph({ children: [new PageBreak()] }));

      children.push(para([], { spaceAfter: 100 }));
      children.push(para(
        [trun(s.fullNamePassport, { size: 34, bold: true, color: TEAL })],
        { align: 'center', spaceAfter: 20 },
      ));
      children.push(para([trun('—', { size: 6, color: GOLD })], { align: 'center', spaceAfter: 20 }));

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

      const pf = s.files.find(f => f.fileType === 'PASSPORT');
      const nf = s.files.find(f => f.fileType === 'NATIONAL_ID');

      function addImage(label: string, data: Buffer | null | undefined, fallback: string) {
        children.push(para([trun(label, { size: 17, bold: true, color: TEAL })], { align: 'center', spaceAfter: 80 }));
        if (data && data.byteLength > 0 && data.byteLength <= MAX_IMAGE_BYTES && (docSize.value + data.byteLength) <= MAX_DOC_BYTES) {
          let ext = 'png';
          if (data[0] === 0xFF && data[1] === 0xD8) ext = 'jpg';
          else if (data[0] === 0x47 && data[1] === 0x49) ext = 'gif';
          try {
            children.push(new Paragraph({
              children: [new ImageRun({ type: ext as 'jpg' | 'png' | 'gif', data: Buffer.from(data), transformation: { width: cmToEmu(IMG_CM_W), height: cmToEmu(IMG_CM_H) } })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 0 },
            }));
            docSize.value += data.byteLength;
            return true;
          } catch { }
        }
        children.push(para([trun(fallback, { size: 16, color: MUTED })], { align: 'center', spaceAfter: 80 }));
        return false;
      }

      addImage('صورة جواز السفر', pf?.fileData, 'لا توجد صورة جواز السفر');
      children.push(para([], { spaceAfter: 170 }));
      addImage('صورة بطاقة الهوية', nf?.fileData, 'لا توجد صورة بطاقة الهوية');

      if (docSize.value >= MAX_DOC_BYTES) {
        children.push(para([], { spaceAfter: 200 }));
        children.push(para(
          [trun('⚠️ تم تخطي عدد من الصور بسبب حدود حجم الملف', { size: 16, color: MUTED })],
          { align: 'center' },
        ));
        break;
      }

      children.push(para([], { spaceAfter: 300 }));
      children.push(para(
        [trun('منصة تأمين المشاركين للدورات الخارجية', { size: 14, color: MUTED })],
        { align: 'center' },
      ));
      children.push(para(
        [trun('طُوِّر بواسطة نايف الشهراني', { size: 12, color: CREDIT })],
        { align: 'center' },
      ));
    }

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