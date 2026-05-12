import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function validateField(field: string, value: string, pattern: RegExp, message: string): string | null {
  if (!pattern.test(value)) return message;
  return null;
}

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

  if (!/^[A-Za-z\s.\-']+$/.test(fullNamePassport))
    errors.push('الاسم يجب أن يكون باللغة الإنجليزية فقط');
  if (passportNumber.length < 4 || passportNumber.length > 30)
    errors.push('رقم الجواز غير صحيح');
  if (!/^\d{10}$/.test(nationalId))
    errors.push('رقم الهوية يجب أن يكون 10 أرقام');
  if (!/^\+966\d{9}$/.test(mobile))
    errors.push('رقم الجوال يجب أن يبدأ بـ +966 متبوعاً بـ 9 أرقام');
  if (!/^SA\d{22}$/.test(iban))
    errors.push('رقم الآيبان يجب أن يبدأ بـ SA متبوعاً بـ 22 رقماً');
  if (isNaN(Date.parse(passportExpiry)))
    errors.push('تاريخ انتهاء الجواز غير صحيح');
  if (isNaN(Date.parse(birthDate)))
    errors.push('تاريخ الميلاد غير صحيح');

  if (errors.length > 0) {
    return NextResponse.json({ message: errors.join(' | ') }, { status: 400 });
  }

  const submission = await prisma.submission.create({
    data: {
      courseId: course.id,
      fullNamePassport,
      passportNumber,
      passportExpiry: new Date(passportExpiry),
      nationalId,
      mobile,
      birthDate: new Date(birthDate),
      iban
    }
  });

  const passportFile = formData.get('passportFile') as File | null;
  const nationalIdFile = formData.get('nationalIdFile') as File | null;

  if (passportFile && passportFile.size > 0) {
    const filename = `${crypto.randomUUID()}-${passportFile.name}`;
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        fileType: 'PASSPORT',
        fileUrl: `/uploads/${filename}`,
        fileName: passportFile.name,
        fileSize: passportFile.size
      }
    });
  }

  if (nationalIdFile && nationalIdFile.size > 0) {
    const filename = `${crypto.randomUUID()}-${nationalIdFile.name}`;
    await prisma.submissionFile.create({
      data: {
        submissionId: submission.id,
        fileType: 'NATIONAL_ID',
        fileUrl: `/uploads/${filename}`,
        fileName: nationalIdFile.name,
        fileSize: nationalIdFile.size
      }
    });
  }

  return NextResponse.json({ success: true, message: 'تم إرسال بياناتك بنجاح' });
}
