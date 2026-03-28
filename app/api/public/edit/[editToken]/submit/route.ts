import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

async function uploadPlaceholder(file: File | null) {
  if (!file || file.size === 0) return null;
  return {
    fileUrl: `/uploads/${randomUUID()}-${file.name}`,
    fileName: file.name,
    fileSize: file.size
  };
}

export async function POST(request: NextRequest, { params }: { params: { editToken: string } }) {
  const submission = await prisma.submission.findUnique({ where: { editToken: params.editToken }, include: { files: true } });
  if (!submission) return NextResponse.json({ message: 'رابط التعديل غير صالح' }, { status: 404 });

  const formData = await request.formData();

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      fullNamePassport: String(formData.get('fullNamePassport') || ''),
      passportNumber: String(formData.get('passportNumber') || ''),
      passportExpiry: new Date(String(formData.get('passportExpiry'))),
      nationalId: String(formData.get('nationalId') || ''),
      mobile: String(formData.get('mobile') || ''),
      birthDate: new Date(String(formData.get('birthDate'))),
      iban: String(formData.get('iban') || '')
    }
  });

  const passport = await uploadPlaceholder(formData.get('passportFile') as File | null);
  const national = await uploadPlaceholder(formData.get('nationalIdFile') as File | null);

  if (passport) {
    await prisma.submissionFile.create({ data: { submissionId: submission.id, fileType: 'PASSPORT', ...passport } });
  }
  if (national) {
    await prisma.submissionFile.create({ data: { submissionId: submission.id, fileType: 'NATIONAL_ID', ...national } });
  }

  return NextResponse.json({ success: true });
}
