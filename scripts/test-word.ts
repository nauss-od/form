import * as fs from 'fs';
import * as path from 'path';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, AlignmentType, WidthType, BorderStyle, PageOrientation,
  TableLayoutType, ImageRun,
} from 'docx';

const NO_BORDER = { style: BorderStyle.NONE as any, size: 0, color: 'ffffff' };

async function main() {
  const outDir = path.join(__dirname, '..', 'tmp-test');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Minimal valid 2x2 PNG
  const png = Buffer.from([
    0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,
    0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,
    0x00,0x00,0x00,0x02,0x00,0x00,0x00,0x02,
    0x08,0x02,0x00,0x00,0x00,0xFD,0xD4,0x9A,
    0x73,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,
    0x44,0xAE,0x42,0x60,0x82,
  ]);

  console.log('Test 1: Simple doc...');
  try {
    const d = new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun('Hello')] })] }] });
    fs.writeFileSync(path.join(outDir, '01-simple.docx'), Buffer.from(await Packer.toBuffer(d)));
    console.log('  OK');
  } catch (e) { console.error('  FAIL', e); }

  console.log('Test 2: RTL landscape table...');
  try {
    const d = new Document({
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 1000, bottom: 1000, right: 1000, left: 1000 } } },
        children: [
          new Paragraph({ children: [new TextRun('عنوان')], alignment: AlignmentType.CENTER }),
          new Table({
            rows: [new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun('خلية 1')] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun('خلية 2')] })] }),
            ] })],
            width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [5000, 5000],
            layout: TableLayoutType.FIXED, visuallyRightToLeft: true,
          }),
        ],
      }],
    });
    fs.writeFileSync(path.join(outDir, '02-rtl-table.docx'), Buffer.from(await Packer.toBuffer(d)));
    console.log('  OK');
  } catch (e) { console.error('  FAIL', e); }

  console.log('Test 3: Empty paragraph cell...');
  try {
    const d = new Document({
      sections: [{
        children: [
          new Table({
            rows: [new TableRow({ children: [
              new TableCell({ children: [new Paragraph({ children: [] })], width: { size: 50, type: WidthType.PERCENTAGE }, borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER } }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun('محتوى')] })], width: { size: 50, type: WidthType.PERCENTAGE } }),
            ] })],
            width: { size: 100, type: WidthType.PERCENTAGE }, visuallyRightToLeft: true,
          }),
        ],
      }],
    });
    fs.writeFileSync(path.join(outDir, '03-empty-cell.docx'), Buffer.from(await Packer.toBuffer(d)));
    console.log('  OK');
  } catch (e) { console.error('  FAIL', e); }

  console.log('Test 4: Image with type=png...');
  try {
    const run = new ImageRun({ type: 'png', data: png, transformation: { width: 200, height: 200 } });
    const d = new Document({ sections: [{ children: [new Paragraph({ children: [run], alignment: AlignmentType.CENTER })] }] });
    fs.writeFileSync(path.join(outDir, '04-image-png.docx'), Buffer.from(await Packer.toBuffer(d)));
    console.log('  OK');
  } catch (e) { console.error('  FAIL', e); }

  console.log('Test 5: Image with type=jpg...');
  try {
    const run = new ImageRun({ type: 'jpg', data: png, transformation: { width: 200, height: 200 } });
    const d = new Document({ sections: [{ children: [new Paragraph({ children: [run], alignment: AlignmentType.CENTER })] }] });
    fs.writeFileSync(path.join(outDir, '05-image-jpg.docx'), Buffer.from(await Packer.toBuffer(d)));
    console.log('  OK');
  } catch (e) { console.error('  FAIL', e); }

  console.log('Test 6: Image in RTL 4-col table...');
  try {
    const run = new ImageRun({ type: 'png', data: png, transformation: { width: 100, height: 100 } });
    const spacer = new TableCell({
      children: [new Paragraph({ children: [] })],
      width: { size: 5, type: WidthType.PERCENTAGE },
      borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
    });
    const cell1 = new TableCell({
      children: [new Paragraph({ children: [run], alignment: AlignmentType.CENTER })],
      width: { size: 45, type: WidthType.PERCENTAGE },
    });
    const cell2 = new TableCell({
      children: [new Paragraph({ children: [run], alignment: AlignmentType.CENTER })],
      width: { size: 45, type: WidthType.PERCENTAGE },
    });
    const d = new Document({
      sections: [{
        children: [
          new Table({
            rows: [new TableRow({ children: [spacer, cell1, cell2, spacer] })],
            width: { size: 100, type: WidthType.PERCENTAGE },
            visuallyRightToLeft: true,
          }),
        ],
      }],
    });
    fs.writeFileSync(path.join(outDir, '06-4col-table.docx'), Buffer.from(await Packer.toBuffer(d)));
    console.log('  OK');
  } catch (e) { console.error('  FAIL', e); }

  console.log('Test 7: Full multi-page RTL landscape...');
  try {
    const run = new ImageRun({ type: 'png', data: png, transformation: { width: 100, height: 100 } });
    const spacer = new TableCell({
      children: [new Paragraph({ children: [] })],
      width: { size: 5, type: WidthType.PERCENTAGE },
      borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER },
    });
    const left = new TableCell({
      children: [new Paragraph({ children: [run], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun('صورة 1')], alignment: AlignmentType.CENTER })],
      width: { size: 45, type: WidthType.PERCENTAGE },
    });
    const right = new TableCell({
      children: [new Paragraph({ children: [run], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun('صورة 2')], alignment: AlignmentType.CENTER })],
      width: { size: 45, type: WidthType.PERCENTAGE },
    });

    const d = new Document({
      styles: { default: { document: { run: { font: 'Arial', size: 22 }, paragraph: { alignment: AlignmentType.RIGHT } } } },
      sections: [{
        properties: {
          page: { size: { width: 10692000, height: 7560000, orientation: PageOrientation.LANDSCAPE }, margin: { top: 851, bottom: 851, right: 851, left: 851 } },
        },
        children: [
          new Paragraph({ children: [new TextRun({ text: 'بيانات المشاركين', size: 32, bold: true })], alignment: AlignmentType.CENTER }),
          new Paragraph({ children: [new TextRun({ text: 'جامعة نايف', size: 20 })], alignment: AlignmentType.CENTER }),
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({ children: [new TextRun({ text: 'اسم المشارك', size: 36, bold: true })], alignment: AlignmentType.CENTER }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('البيان')] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun('القيمة')] })] }),
                ],
              }),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [7500, 7500],
            layout: TableLayoutType.FIXED,
            visuallyRightToLeft: true,
          }),
          new Paragraph({ children: [] }),
          new Table({
            rows: [new TableRow({ children: [spacer, left, right, spacer] })],
            width: { size: 100, type: WidthType.PERCENTAGE },
            visuallyRightToLeft: true,
          }),
          new Paragraph({ children: [new TextRun('تطوير نايف')], alignment: AlignmentType.CENTER }),
        ],
      }],
    });
    fs.writeFileSync(path.join(outDir, '07-full.docx'), Buffer.from(await Packer.toBuffer(d)));
    console.log('  OK');
  } catch (e) { console.error('  FAIL', e); }

  console.log('Done! Check:', outDir);
}

main().catch(console.error);
