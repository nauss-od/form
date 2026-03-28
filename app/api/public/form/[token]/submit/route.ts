import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { courseEditUrl } from '@/lib/utils';

async function uploadPlaceholder(file: File | null) {
  if (!file || file.size === 0) return null;
  return {
    fileUrl: `/uploads/${randomUUID()}-${file.name}`,
    fileName: file.name,
    fileSize: file.size
  };
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const course = await prisma.course.findUnique({ where: { publicToken: params.token } });
  if (!course) return NextResponse.json({ message: 'الرابط غير صالح' }, { status: 404 });

  const formData = await request.formData();
  const editToken = randomUUID();

  const submission = await prisma.submission.create({
    data: {
      courseId: course.id,
      fullNamePassport: String(formData.get('fullNamePassport') || ''),
      passportNumber: String(formData.get('passportNumber') || ''),
      passportExpiry: new Date(String(formData.get('passportExpiry'))),
      nationalId: String(formData.get('nationalId') || ''),
      mobile: String(formData.get('mobile') || ''),
      birthDate: new Date(String(formData.get('birthDate'))),
      iban: String(formData.get('iban') || ''),
      editToken
    }
  });

  const passport = await uploadPlaceholder(formData.get('passportFile') as File | null);
  const nationalId = await uploadPlaceholder(formData.get('nationalIdFile') as File | null);

  if (passport) {
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        fileType: 'PASSPORT',
        ...passport
      }
    });
  }

  if (nationalId) {
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        fileType: 'NATIONAL_ID',
        ...nationalId
      }
    });
  }

  return NextResponse.json({ success: true, editUrl: courseEditUrl(editToken) });
}
