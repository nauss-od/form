import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import sharp from 'sharp';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const course = await prisma.course.findUnique({ where: { publicToken: params.token } });
    if (!course) return NextResponse.json({ message: 'الرابط غير صالح أو منتهي' }, { status: 404 });
    if (course.status !== 'PUBLISHED') {
      return NextResponse.json({ message: 'تم إغلاق النموذج ولم يعد متاحاً للتعبئة' }, { status: 403 });
    }
    if (course.endDate && new Date() > course.endDate)
      return NextResponse.json({ message: 'انتهت صلاحية النموذج — لم يعد متاحًا لتعبئة البيانات' }, { status: 403 });

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ message: 'المرفقات مطلوبة، يرجى إرسال النموذج من جديد' }, { status: 400 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ message: 'البيانات المرسلة غير صالحة' }, { status: 400 });
    }

    const fullNamePassport = getText(formData, 'fullNamePassport');
    const passportNumber = getText(formData, 'passportNumber').toUpperCase();
    const passportExpiry = getText(formData, 'passportExpiry');
    const nationalId = getText(formData, 'nationalId');
    const mobile = getText(formData, 'mobile');
    const birthDate = getText(formData, 'birthDate');
    const iban = getText(formData, 'iban').toUpperCase();

    const errors: string[] = [];
    const passportFile = getRequiredImage(formData, 'passportFile', 'صورة جواز السفر', errors);
    const nationalIdFile = getRequiredImage(formData, 'nationalIdFile', 'صورة الهوية الوطنية', errors);

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

    const submission = await prisma.$transaction(async tx => {
      const created = await tx.submission.create({
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

      const passportBuf = await sharp(Buffer.from(await passportFile.arrayBuffer())).rotate().jpeg({ quality: 88 }).toBuffer();
      const nationalIdBuf = await sharp(Buffer.from(await nationalIdFile.arrayBuffer())).rotate().jpeg({ quality: 88 }).toBuffer();

      const passportRecord = await tx.submissionFile.create({
        data: {
          submissionId: created.id,
          fileType: 'PASSPORT',
          fileUrl: '',
          fileName: passportFile.name.replace(/\.[^.]+$/i, '.jpg'),
          fileSize: passportBuf.length,
          fileData: passportBuf,
          mimeType: 'image/jpeg',
        },
      });

      const nationalIdRecord = await tx.submissionFile.create({
        data: {
          submissionId: created.id,
          fileType: 'NATIONAL_ID',
          fileUrl: '',
          fileName: nationalIdFile.name.replace(/\.[^.]+$/i, '.jpg'),
          fileSize: nationalIdBuf.length,
          fileData: nationalIdBuf,
          mimeType: 'image/jpeg',
        },
      });

      await tx.submissionFile.update({ where: { id: passportRecord.id }, data: { fileUrl: `/api/files/${passportRecord.id}` } });
      await tx.submissionFile.update({ where: { id: nationalIdRecord.id }, data: { fileUrl: `/api/files/${nationalIdRecord.id}` } });

      return created;
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

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function getRequiredImage(formData: FormData, key: string, label: string, errors: string[]) {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) {
    errors.push(`${label} مطلوبة`);
    return new File([], 'missing.jpg', { type: 'image/jpeg' });
  }
  if (!value.type.startsWith('image/')) {
    errors.push(`${label}: يرجى رفع صورة فقط`);
  }
  if (value.size > MAX_FILE_SIZE) {
    errors.push(`${label}: حجم الملف كبير جداً (الحد الأقصى 50 ميجابايت)`);
  }
  return value;
}
