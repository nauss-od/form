import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const course = await prisma.course.findUnique({ where: { publicToken: params.token } });
    if (!course) return NextResponse.json({ message: 'الرابط غير صالح أو منتهي' }, { status: 404 });
    if (course.endDate && new Date() > course.endDate)
      return NextResponse.json({ message: 'انتهت صلاحية النموذج — لم يعد متاحًا لتعبئة البيانات' }, { status: 403 });

    let body: Record<string, string>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'البيانات المرسلة غير صالحة' }, { status: 400 });
    }

    const fullNamePassport = (body.fullNamePassport || '').trim();
    const passportNumber = (body.passportNumber || '').trim().toUpperCase();
    const passportExpiry = (body.passportExpiry || '').trim();
    const nationalId = (body.nationalId || '').trim();
    const mobile = (body.mobile || '').trim();
    const birthDate = (body.birthDate || '').trim();
    const iban = (body.iban || '').trim().toUpperCase();

    const errors: string[] = [];

    if (!/^[A-Za-z\s.\-']+$/.test(fullNamePassport))
      errors.push('الاسم يجب أن يكون باللغة الإنجليزية فقط');

    if (!/^[A-Za-z]{1,3}\d{1,6}$/.test(passportNumber))
      errors.push('رقم الجواز: حروف إنجليزية ثم أرقام (حد أقصى 7 خانات)');
    else if (passportNumber.length > 7)
      errors.push('رقم الجواز لا يتجاوز 7 خانات');

    if (!/^\d{10}$/.test(nationalId))
      errors.push('رقم الهوية يجب أن يكون 10 أرقام');

    if (!/^\+966\d{9}$/.test(mobile))
      errors.push('رقم الجوال يجب أن يبدأ بـ +966 متبوعاً بـ 9 أرقام');

    if (!/^SA\d{22}$/.test(iban))
      errors.push('رقم الآيبان يجب أن يبدأ بـ SA متبوعاً بـ 22 رقماً');

    const expiryDate = new Date(passportExpiry);
    if (isNaN(expiryDate.getTime()))
      errors.push('تاريخ انتهاء الجواز غير صحيح');
    else if (expiryDate < new Date(new Date().toDateString()))
      errors.push('تاريخ انتهاء الجواز لا يمكن أن يكون في الماضي');

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

    logAudit({
      action: 'SUBMIT_FORM',
      entityType: 'Course',
      entityId: course.id,
      meta: { fullName: fullNamePassport, passportNumber, submissionId: submission.id },
    });

    return NextResponse.json({ success: true, submissionId: submission.id, message: 'تم إرسال البيانات بنجاح' });
  } catch (err) {
    console.error('Public submission error:', err);
    return NextResponse.json({ message: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
