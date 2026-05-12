import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

export async function GET() {
  const session = getCurrentSession();
  if (!session || session.role !== 'MANAGER') {
    return NextResponse.json({ message: 'غير مصرح' }, { status: 401 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE', isActive: true },
    select: {
      id: true, name: true, email: true, createdAt: true, lastLoginAt: true,
      _count: { select: { courses: true } }
    }
  });

  const enriched = await Promise.all(employees.map(async (emp) => {
    const courses = await prisma.course.findMany({
      where: { createdByUserId: emp.id },
      select: {
        id: true, activityName: true, createdAt: true, status: true,
        _count: { select: { submissions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    const totalSubmissions = courses.reduce((s, c) => s + c._count.submissions, 0);
    const activeCourses = courses.filter(c => c.status === 'PUBLISHED').length;
    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      createdAt: emp.createdAt.toISOString(),
      lastLoginAt: emp.lastLoginAt?.toISOString() || null,
      totalCourses: emp._count.courses,
      totalSubmissions,
      activeCourses,
      courses: courses.map(c => ({
        activityName: c.activityName,
        status: c.status,
        submissions: c._count.submissions,
        createdAt: c.createdAt.toISOString()
      }))
    };
  }));

  if (!openai.apiKey) {
    return NextResponse.json({
      analysis: 'مفتاح API للذكاء الاصطناعي غير مضبط. يرجى إضافة OPENAI_API_KEY إلى متغيرات البيئة.',
      rawData: enriched
    });
  }

  const prompt = `حلل أداء الموظفين في منصة الدورات الخارجية بناءً على البيانات التالية بصيغة JSON وقم بالتوصيات بالعربية:

${JSON.stringify(enriched, null, 2)}

قدم التحليل بهذا التنسيق:
1. ملخص عام
2. تقييم كل موظف (نشاط، إنتاجية، ملاحظات)
3. ترتيب الموظفين حسب الأداء
4. توصيات لتحسين الأداء
5. مؤشرات خطر (إن وجدت)`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2000,
    });

    return NextResponse.json({
      analysis: response.choices[0]?.message?.content || 'تعذر الحصول على التحليل',
      rawData: enriched,
      model: response.model,
      usage: response.usage
    });
  } catch (err) {
    return NextResponse.json({
      analysis: 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي',
      error: String(err),
      rawData: enriched
    });
  }
}
