import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Registration is manager-only. Public self-registration is disabled.
export async function POST(request: NextRequest) {
  try {
    const session = getCurrentSession();
    if (!session || session.role !== 'MANAGER') {
      return NextResponse.json({ message: 'إنشاء الحسابات متاح للمدير فقط' }, { status: 403 });
    }

    const { name, email, password, mobile, extension } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'الاسم والبريد وكلمة المرور مطلوبة' }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ message: 'كلمة المرور 8 أحرف على الأقل' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ message: 'صيغة البريد الإلكتروني غير صحيحة' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ message: 'البريد مستخدم مسبقاً' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash: await hashPassword(String(password)),
        mobile: mobile ? String(mobile).trim() : null,
        extension: extension ? String(extension).trim() : null,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ message: 'حدث خطأ أثناء إنشاء الحساب' }, { status: 500 });
  }
}
