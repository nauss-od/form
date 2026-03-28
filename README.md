# منصة إدارة طلبات التأمين الطبي - NAUSS

نسخة Next.js + Prisma + PostgreSQL جاهزة للرفع على GitHub والنشر على Vercel.

## متطلبات النشر
- قاعدة بيانات PostgreSQL سحابية
- متغيرات البيئة في Vercel:
  - DATABASE_URL
  - JWT_SECRET

## أوامر أساسية
```bash
npm install
npx prisma db push
npm run build
```

## إنشاء المستخدم الإداري
بعد ضبط قاعدة البيانات شغّل:
```bash
npx prisma db push
node prisma/seed.js
```
