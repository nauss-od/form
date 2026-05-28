import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const subs = await p.submission.findMany({ include: { files: true }, orderBy: { createdAt: 'asc' } });
let tp = 0, tn = 0, pd = 0, nd = 0;
for (const s of subs) {
  console.log(s.fullNamePassport);
  for (const f of s.files) {
    const h = f.fileData ? 'YES (' + f.fileData.length + ' bytes)' : 'NO DATA';
    console.log('  ' + f.fileType + ' | ' + f.mimeType + ' | ' + f.fileSize + ' | data: ' + h);
    if (f.fileType === 'PASSPORT') { tp++; if (f.fileData) pd++; }
    if (f.fileType === 'NATIONAL_ID') { tn++; if (f.fileData) nd++; }
  }
  if (s.files.length === 0) console.log('  NO FILES');
}
console.log('---');
console.log('PASSPORT: ' + tp + ' files, ' + pd + ' with data');
console.log('NATIONAL_ID: ' + tn + ' files, ' + nd + ' with data');
await p.$disconnect();
