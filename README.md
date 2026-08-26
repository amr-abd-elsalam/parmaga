# Parmaga

Parmaga منصة تعليمية تستهدف السوق المصري وطلاب البكالوريا، وتركز على مادة البرمجة والذكاء الاصطناعي.

## الحالة الحالية

الموقع في مرحلته الثابتة الأولى، ويعرض صفحة هبوط تحتوي على معلومات المدرس، وأماكن التواجد، ووسائل التواصل والحجز.

تبدأ الدراسة الفعلية في 1 سبتمبر 2026، وتُنشر الدروس تدريجيًا بعد كل Session أوفلاين.

## Tech Stack

- HTML ثابت.
- ملف CSS خارجي واحد مبني على Design Tokens.
- صفر Dependencies.
- صفر Build Step.
- صفر JavaScript خاص بالمشروع.

## شجرة الملفات

```text
.
├── .gitattributes
├── 404.html
├── AI_ARCHITECT_PROTOCOL.md
├── AI_EXECUTOR_PROTOCOL.md
├── CNAME
├── PROJECT_VISION.md
├── README.md
├── index.html
├── assets/
│   ├── css/
│   │   └── parmaga.css
│   └── images/
│       ├── amr-abdelsalam-ad-1536.webp
│       ├── amr-abdelsalam-ad-768.webp
│       ├── amr-abdelsalam-ad.png
│       ├── fav16.png
│       ├── fav16D.png
│       ├── fav180.png
│       ├── fav32.png
│       └── fav32D.png
└── docs/
    ├── content/
    │   ├── CONTENT_INTAKE.md
    │   ├── context/
    │   │   └── programming-ai-baccalaureate-2/
    │   │       └── term-1/
    │   │           └── chapter-01/
    │   │               └── lesson-01.md
    │   └── manifests/
    │       └── programming-ai-baccalaureate-2/
    │           └── term-1/
    │               └── chapter-01/
    │                   └── lesson-01.json
    └── decisions/
        ├── ADR-0001-hosting-and-routing.md
        ├── ADR-0002-design-tokens-and-styling-strategy.md
        ├── ADR-0003-lessons-architecture.md
        ├── ADR-0004-identifiers-and-permanent-paths.md
        └── ADR-0005-content-intake-and-asset-custody.md
```

## التشغيل محليًا

يمكن فتح `index.html` مباشرة في المتصفح.

ولتشغيل خادم محلي من جذر المشروع:

```bash
python3 -m http.server
```

ثم افتح:

```text
http://localhost:8000
```

## الاستضافة

- الاستضافة الحالية على GitHub Pages بصورة مؤقتة.
- النطاق مرتبط عبر ملف `CNAME`.
- Cloudflare موجود أمام الموقع.
- ملف `robots.txt` مُدار من Cloudflare خارج هذا الـRepository.

## الملفات الحاكمة

- `PROJECT_VISION.md`: المرجع الأعلى لرؤية المشروع ومبادئ المنتج والهندسة.
- `AI_ARCHITECT_PROTOCOL.md`: يحدد طريقة تحليل المراحل وإعداد القرارات والتسليم المعماري.
- `AI_EXECUTOR_PROTOCOL.md`: يحدد طريقة تنفيذ مرحلة معتمدة وفحصها والتحقق منها دون توسيع نطاقها.

## ما ليس موجودًا بعد

لا يحتوي المشروع حاليًا على:

- محتوى دروس منشورًا.
- ملفات SVG داخل المستودع العام.
- Lesson Viewer.
- Routing.
- اختبارات.
- CI.

توجد وثائق جرد وتسليم للدرس المرجعي الأول، لكنها لا تنشر الدرس أو أصوله.

## القرارات المعمارية

توجد سجلات القرارات المعمارية في:

```text
docs/decisions/
```

- `ADR-0001`: الاستضافة والتوجيه وسلوك صفحة 404.
- `ADR-0002`: Design Tokens واستراتيجية التنسيق.
- `ADR-0003`: معمارية نشر الدروس والروابط الدائمة.
- `ADR-0004`: المعرّفات التقنية والمسارات الدائمة للمحتوى التعليمي.
- `ADR-0005`: إدخال المحتوى وحراسة الأصول وجرد الدروس.
