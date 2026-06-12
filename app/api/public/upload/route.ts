import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';
import type { SubmissionFileType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    let submissionId: string;
    let fileType: string;
    let file: File | null = null;

    try {
      const formData = await request.formData();
      submissionId = String(formData.get('submissionId') || '');
      fileType = String(formData.get('fileType') || '');
      file = formData.get('file') as File | null;
    } catch {
      return NextResponse.json({ message: 'بيانات غير صالحة' }, { status: 400 });
    }

    if (!submissionId || !fileType || !file || file.size === 0) {
      return NextResponse.json({ message: 'بيانات ناقصة' }, { status: 400 });
    }

    if (!['PASSPORT', 'NATIONAL_ID'].includes(fileType)) {
      return NextResponse.json({ message: 'نوع الملف غير صالح' }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (!submission) {
      return NextResponse.json({ message: 'البيانات غير موجودة' }, { status: 404 });
    }

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'حجم الملف كبير جداً (الحد الأقصى 50 ميجابايت)' }, { status: 413 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'يرجى رفع صورة فقط' }, { status: 400 });
    }

    const rawBuf = Buffer.from(await file.arrayBuffer());
    // auto-rotate based on EXIF orientation then output as JPEG
    const buf = await sharp(rawBuf).rotate().jpeg({ quality: 88 }).toBuffer();
    const record = await prisma.submissionFile.create({
      data: {
        submissionId,
        fileType: fileType as SubmissionFileType,
        fileUrl: '',
        fileName: file.name.replace(/\.[^.]+$/i, '.jpg'),
        fileSize: buf.length,
        fileData: buf,
        mimeType: 'image/jpeg',
      }
    });

    await prisma.submissionFile.update({
      where: { id: record.id },
      data: { fileUrl: `/api/files/${record.id}` }
    });

    return NextResponse.json({ success: true, fileId: record.id, fileUrl: `/api/files/${record.id}` });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ message: 'حدث خطأ في رفع الملف' }, { status: 500 });
  }
}
