import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const file = await prisma.submissionFile.findUnique({ where: { id: params.id } });
  if (!file || !file.fileData)
    return NextResponse.json({ message: 'الملف غير موجود' }, { status: 404 });

  return new NextResponse(file.fileData, {
    headers: {
      'Content-Type': file.mimeType || 'image/jpeg',
      'Content-Disposition': `inline; filename="${file.fileName}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
