import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: 'حجم الملف كبير جداً (الحد الأقصى 15 ميجابايت)' }, { status: 413 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const record = await prisma.submissionFile.create({
      data: {
        submissionId,
        fileType: fileType as SubmissionFileType,
        fileUrl: '',
        fileName: file.name,
        fileSize: file.size,
        fileData: buf,
        mimeType: file.type || 'image/jpeg'
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
