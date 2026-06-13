import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ message: 'خدمة مسح الجواز غير مفعّلة' }, { status: 503 });
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) return NextResponse.json({ message: 'بيانات غير صالحة' }, { status: 400 });

    const file = formData.get('image') as File | null;
    if (!file || file.size === 0) return NextResponse.json({ message: 'الصورة مطلوبة' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ message: 'يرجى رفع صورة' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ message: 'الصورة كبيرة جداً (10MB كحد أقصى)' }, { status: 413 });

    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = imageBuffer.toString('base64');
    const mediaType = (file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif') || 'image/jpeg';

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            {
              type: 'text',
              text: `This is a passport image. Extract the following fields and return ONLY a JSON object with no extra text:
{
  "fullNamePassport": "surname given-names as shown on passport (English, ALL CAPS)",
  "passportNumber": "passport number (letters+digits, no spaces)",
  "birthDate": "YYYY-MM-DD",
  "passportExpiry": "YYYY-MM-DD",
  "nationality": "3-letter country code e.g. SAU"
}
If a field is not visible or unclear, use null. Return only the JSON, nothing else.`,
            },
          ],
        },
      ],
    });

    const raw = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';
    // Strip markdown code fences if present
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    let parsed: Record<string, string | null>;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ message: 'تعذّر قراءة بيانات الجواز، حاول مرة أخرى' }, { status: 422 });
    }

    return NextResponse.json({
      success: true,
      data: {
        fullNamePassport: parsed.fullNamePassport || null,
        passportNumber: parsed.passportNumber || null,
        birthDate: parsed.birthDate || null,
        passportExpiry: parsed.passportExpiry || null,
        nationality: parsed.nationality || null,
      },
    });
  } catch (err) {
    console.error('Passport scan error:', err);
    return NextResponse.json({ message: 'حدث خطأ في معالجة الصورة' }, { status: 500 });
  }
}
