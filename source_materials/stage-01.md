# المرحلة الأولى: البنية الأساسية ونظام المصادقة

سأبدأ الآن بتجهيز المشروع الكامل. سأستخدم **Laravel + Blade + Tailwind CSS + Alpine.js** كـ Stack تقني مناسب للأنظمة الإدارية المؤسسية.

## 📁 هيكل المشروع الكامل

```
nauss-insurance-platform/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php
│   │   │   │   ├── LogoutController.php
│   │   │   │   └── PasswordResetController.php
│   │   │   ├── Controller.php
│   │   │   ├── DashboardController.php
│   │   │   └── UserController.php
│   │   ├── Middleware/
│   │   │   ├── CheckRole.php
│   │   │   └── SetLocale.php
│   │   └── Requests/
│   │       ├── LoginRequest.php
│   │       └── UserRequest.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── InsuranceRequest.php
│   │   └── Participant.php
│   └── Providers/
│       └── AppServiceProvider.php
├── bootstrap/
├── config/
│   ├── app.php
│   ├── auth.php
│   └── nauss.php
├── database/
│   ├── migrations/
│   │   ├── create_users_table.php
│   │   ├── create_roles_table.php
│   │   └── create_role_user_table.php
│   └── seeders/
│       └── AdminSeeder.php
├── public/
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   └── app.js
│   └── images/
│       └── nauss-logo.svg
├── resources/
│   ├── css/
│   │   └── app.css
│   ├── js/
│   │   └── app.js
│   └── views/
│       ├── layouts/
│       │   ├── app.blade.php
│       │   ├── auth.blade.php
│       │   └── partials/
│       │       ├── header.blade.php
│       │       ├── sidebar.blade.php
│       │       └── footer.blade.php
│       ├── auth/
│       │   ├── login.blade.php
│       │   └── forgot-password.blade.php
│       ├── dashboard/
│       │   └── index.blade.php
│       ├── users/
│       │   ├── index.blade.php
│       │   ├── create.blade.php
│       │   └── edit.blade.php
│       └── components/
│           ├── card.blade.php
│           ├── button.blade.php
│           └── input.blade.php
├── routes/
│   ├── web.php
│   └── api.php
├── tests/
├── composer.json
├── package.json
├── tailwind.config.js
├── vite.config.js
└── .env.example
```

تم استلام محتوى المرحلة الأولى بالكامل كما ورد في المحادثة، بما يشمل الأكواد والملفات المفصلة.
