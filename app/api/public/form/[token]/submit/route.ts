import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  fullNameAr: z.string().min(2),
  fullNameEn: z.string().optional(),
  passportNumber: z.string().min(2),
  nationalId: z.string().optional(),
  nationality: z.string().min(2),
  dateOfBirth: z.string(),
  gender: z.string().default('male'),
  mobile: z.string().min(3),
  email: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  organization: z.string().optional(),
  phone: z.string().optional(),
  travelDate: z.string().optional(),
  returnDate: z.string().optional(),
  passportExpiry: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const form = await prisma.insuranceForm.findFirst({ where: { publicLinkToken: params.token, status: 'PUBLISHED' } });
  if (!form) return NextResponse.json({ message: 'الرابط غير صالح' }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ message: 'بيانات غير صالحة' }, { status: 422 });

  const duplicate = await prisma.participant.findFirst({
    where: {
      formId: form.id,
      OR: [
        { passportNumber: parsed.data.passportNumber },
        parsed.data.nationalId ? { nationalId: parsed.data.nationalId } : undefined,
      ].filter(Boolean) as any,
    },
  });

  const status = duplicate ? 'DUPLICATE' : 'COMPLETE';

  await prisma.participant.create({
    data: {
      formId: form.id,
      fullNameAr: parsed.data.fullNameAr,
      fullNameEn: parsed.data.fullNameEn,
      passportNumber: parsed.data.passportNumber,
      nationalId: parsed.data.nationalId,
      nationality: parsed.data.nationality,
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      gender: parsed.data.gender,
      mobile: parsed.data.mobile,
      email: parsed.data.email,
      jobTitle: parsed.data.jobTitle,
      department: parsed.data.department,
      organization: parsed.data.organization,
      phone: parsed.data.phone,
      travelDate: parsed.data.travelDate ? new Date(parsed.data.travelDate) : undefined,
      returnDate: parsed.data.returnDate ? new Date(parsed.data.returnDate) : undefined,
      passportExpiry: parsed.data.passportExpiry,
      status,
      isDuplicate: Boolean(duplicate),
      duplicateOfId: duplicate?.id,
    },
  });

  const [actualParticipants, completedRegistrations, duplicateRegistrations] = await Promise.all([
    prisma.participant.count({ where: { formId: form.id } }),
    prisma.participant.count({ where: { formId: form.id, status: 'COMPLETE' } }),
    prisma.participant.count({ where: { formId: form.id, isDuplicate: true } }),
  ]);

  await prisma.insuranceForm.update({
    where: { id: form.id },
    data: {
      actualParticipants,
      completedRegistrations,
      duplicateRegistrations,
      incompleteRegistrations: 0,
    },
  });

  return NextResponse.json({
    success: true,
    message: duplicate ? 'تم استلام البيانات، مع وجود سجل سابق مشابه' : 'تم تسجيل البيانات بنجاح',
    is_duplicate: Boolean(duplicate),
  });
}
