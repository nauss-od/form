import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const course = await prisma.course.findUnique({ where: { publicToken: params.token } });
  if (!course) return NextResponse.json({ message: 'الرابط غير صالح أو منتهي' }, { status: 404 });

  const formData = await request.formData();

  const fullNamePassport = String(formData.get('fullNamePassport') || '').trim();
  const passportNumber = String(formData.get('passportNumber') || '').trim();
  const passportExpiry = String(formData.get('passportExpiry') || '').trim();
  const nationalId = String(formData.get('nationalId') || '').trim();
  const mobile = String(formData.get('mobile') || '').trim();
  const birthDate = String(formData.get('birthDate') || '').trim();
  const iban = String(formData.get('iban') || '').trim().toUpperCase();

  const errors: string[] = [];

  // Name: English only
  if (!/^[A-Za-z\s.\-']+$/.test(fullNamePassport))
    errors.push('الاسم يجب أن يكون باللغة الإنجليزية فقط');

  // Passport: 1-3 letters followed by digits, max 7
  if (!/^[A-Za-z]{1,3}\d{1,6}$/.test(passportNumber))
    errors.push('رقم الجواز: حروف إنجليزية ثم أرقام (حد أقصى 7 خانات)');
  else if (passportNumber.length > 7)
    errors.push('رقم الجواز لا يتجاوز 7 خانات');

  // National ID: exactly 10 digits
  if (!/^\d{10}$/.test(nationalId))
    errors.push('رقم الهوية يجب أن يكون 10 أرقام');

  // Mobile: +966 + 9 digits
  if (!/^\+966\d{9}$/.test(mobile))
    errors.push('رقم الجوال يجب أن يبدأ بـ +966 متبوعاً بـ 9 أرقام');

  // IBAN: SA + 22 digits
  if (!/^SA\d{22}$/.test(iban))
    errors.push('رقم الآيبان يجب أن يبدأ بـ SA متبوعاً بـ 22 رقماً');

  // Passport expiry: must be valid date, not in past
  const expiryDate = new Date(passportExpiry);
  if (isNaN(expiryDate.getTime()))
    errors.push('تاريخ انتهاء الجواز غير صحيح');
  else if (expiryDate < new Date(new Date().toDateString()))
    errors.push('تاريخ انتهاء الجواز لا يمكن أن يكون في الماضي');

  // Birth date: must be valid date, at least 15 years ago
  const birth = new Date(birthDate);
  const minBirth = new Date();
  minBirth.setFullYear(minBirth.getFullYear() - 15);
  if (isNaN(birth.getTime()))
    errors.push('تاريخ الميلاد غير صحيح');
  else if (birth > minBirth)
    errors.push('يجب أن لا يقل العمر عن 15 سنة');

  if (errors.length > 0) {
    return NextResponse.json({ message: errors.join(' | ') }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: {
      courseId: course.id,
      fullNamePassport,
      passportNumber,
      passportExpiry: expiryDate,
      nationalId,
      mobile,
      birthDate: birth,
      iban
    }
  });

  const passportFile = formData.get('passportFile') as File | null;
  const nationalIdFile = formData.get('nationalIdFile') as File | null;

  if (passportFile && passportFile.size > 0) {
    const buf = Buffer.from(await passportFile.arrayBuffer());
    const file = await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        fileType: 'PASSPORT',
        fileUrl: '',
        fileName: passportFile.name,
        fileSize: passportFile.size,
        fileData: buf,
        mimeType: passportFile.type || 'image/jpeg'
      }
    });
    await prisma.submissionFile.update({
      where: { id: file.id },
      data: { fileUrl: `/api/files/${file.id}` }
    });
  }

  if (nationalIdFile && nationalIdFile.size > 0) {
    const buf = Buffer.from(await nationalIdFile.arrayBuffer());
    const file = await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        fileType: 'NATIONAL_ID',
        fileUrl: '',
        fileName: nationalIdFile.name,
        fileSize: nationalIdFile.size,
        fileData: buf,
        mimeType: nationalIdFile.type || 'image/jpeg'
      }
    });
    await prisma.submissionFile.update({
      where: { id: file.id },
      data: { fileUrl: `/api/files/${file.id}` }
    });
  }

  return NextResponse.json({ success: true, message: 'تم إرسال بياناتك بنجاح' });
}
