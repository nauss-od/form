import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';
import sharp from 'sharp';

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = getCurrentSession();
    if (!session) return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });

    const file = await prisma.submissionFile.findUnique({ where: { id: params.id } });
    if (!file || !file.fileData) {
      return NextResponse.json({ message: 'الملف غير موجود' }, { status: 404 });
    }
    if (!file.mimeType?.startsWith('image/')) {
      return NextResponse.json({ message: 'يتم دعم الصور فقط' }, { status: 400 });
    }

    const rotated = await sharp(file.fileData).rotate(-90).toBuffer();

    await prisma.submissionFile.update({
      where: { id: params.id },
      data: { fileData: Buffer.from(rotated) },
    });

    return NextResponse.json({ success: true, fileUrl: `/api/files/${params.id}` });
  } catch (err) {
    console.error('Rotate error:', err);
    return NextResponse.json({ message: 'فشل تدوير الصورة' }, { status: 500 });
  }
}
