# Parmaga

Parmaga منصة تعليمية تستهدف السوق المصري وطلاب البكالوريا، وتركز على مادة البرمجة والذكاء الاصطناعي.

## الحالة الحالية

الموقع في مرحلته الثابتة الأولى، ويعرض صفحة هبوط تحتوي على معلومات المدرس، وأماكن التواجد، ووسائل التواصل والحجز.

تبدأ الدراسة الفعلية في 1 سبتمبر 2026، وتُنشر الدروس تدريجيًا بعد كل Session أوفلاين.

نُشرت أول حزمة أصول درس داخل المستودع وتحقق منها Gate A آليًا. نشر الأصول خطوة مستقلة عن إنشاء صفحة عرض للدرس، وصفحة الدرس لم تُنشأ بعد.

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
├── .github/
│   └── workflows/
│       └── verify-lessons.yml
├── assets/
│   ├── css/
│   │   └── parmaga.css
│   ├── images/
│   │   ├── amr-abdelsalam-ad-1536.webp
│   │   ├── amr-abdelsalam-ad-768.webp
│   │   ├── amr-abdelsalam-ad.png
│   │   ├── fav16.png
│   │   ├── fav16D.png
│   │   ├── fav180.png
│   │   ├── fav32.png
│   │   └── fav32D.png
│   └── lessons/
│       └── programming-ai-baccalaureate-2/
│           └── term-1/
│               └── chapter-01/
│                   └── lesson-01/
│                       └── page-001.svg .. page-022.svg   (22 published SVG files)
├── docs/
    ├── ai/
    │   └── ARCHITECT_EVIDENCE_LEDGER.md
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
        ├── ADR-0005-content-intake-and-asset-custody.md
        └── ADR-0006-asset-publication-and-verification.md
├── tests/
│   └── test_verify_lesson.py
└── tools/
    └── verify_lesson.py
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

## التحقق من الدروس

أداة التحقق الرسمية والوحيدة هي `tools/verify_lesson.py`، وهي بايثون 3.12 والمكتبة القياسية وحدها، بلا أي dependency وبلا build step.

للتحقق من الدروس المنشورة، من جذر المشروع:

```bash
python3 tools/verify_lesson.py .
```

ولتشغيل اختبارات الأداة:

```bash
python3 -m unittest discover -s tests -p 'test_*.py' -v
```

حالات الخروج: `0` نجاح كامل، و`1` إخفاق تحقق، و`2` خطأ استعمال أو بيئة. وحين لا يوجد أي درس منشور، تنجح الأداة صراحةً وتذكر أن عدد المرشحين صفر.

يشغّل GitHub Actions الأمرين نفسيهما على كل Pull Request موجّه إلى `main` وعلى كل push إلى `main`، عبر job اسمه:

```text
Gate A - Lesson verification
```

الاستدعاء المحلي واستدعاء CI متطابقان حرفيًا، ولا يوجد منطق تحقق مكرر داخل YAML.

Gate A في هذه المرحلة **إشارة تحقق فقط وليست حماية دمج إلزامية**. جعل الـcheck إلزاميًا على `main` قرار مستقل ينفّذه مالك المشروع في المرحلة 4 وفق `ADR-0006` البند 6. والـworkflow لا ينشر ولا يدفع ولا يعدّل محتوى ولا يصل إلى مستودع العهدة.

## الاستضافة

- الاستضافة الحالية على GitHub Pages بصورة مؤقتة.
- النطاق مرتبط عبر ملف `CNAME`.
- Cloudflare موجود أمام الموقع.
- ملف `robots.txt` مُدار من Cloudflare خارج هذا الـRepository.

## الملفات الحاكمة

- `PROJECT_VISION.md`: المرجع الأعلى لرؤية المشروع ومبادئ المنتج والهندسة.
- `AI_ARCHITECT_PROTOCOL.md`: يحدد طريقة تحليل المراحل وإعداد القرارات والتسليم المعماري.
- `AI_EXECUTOR_PROTOCOL.md`: يحدد طريقة تنفيذ مرحلة معتمدة وفحصها والتحقق منها دون توسيع نطاقها.
- `docs/ai/ARCHITECT_EVIDENCE_LEDGER.md`: دفتر الأدلة المعماري ومرجع الحالة التشغيلية وخارطة المراحل.

## ما ليس موجودًا بعد

لا يحتوي المشروع حاليًا على:

- صفحة درس معروضة. لا يوجد `courses/` ولا أي صفحة درس أو فهرس.
- `sitemap.xml` أو Structured Data.
- Lesson Viewer.
- Routing أو Build Step أو Dependencies أو JavaScript خاص بالمشروع.

جُرِد أول درس مرجعي وفُحص وسُجّل في `docs/content/`، ثم نُشرت أصوله داخل المستودع: 22 ملف SVG تحت `assets/lessons/`، بحالة `published` في manifest الدرس، ومع تثبيت لقطة العهدة وفق `ADR-0006`. الأصول الأصلية تبقى محفوظة خارج هذا المستودع وفق `ADR-0005`.

يلزم التمييز بين أمرين: نشر أصول الدرس تمّ وتحقق منه Gate A، وإنشاء صفحة HTML للدرس لم يتم. ولأن صفحة الدرس غير موجودة، فإن الرابط الدائم للدرس يعيد صفحة `404` حاليًا، وهذه هي النتيجة المتوقعة في هذه المرحلة وليست خللًا. يُحسم إنشاء صفحة العرض في مرحلة مستقلة تحتاج اعتمادًا مستقلًا.

توجد أداة تحقق واختبارات وworkflow للتحقق: `tools/verify_lesson.py` و`tests/test_verify_lesson.py` و`.github/workflows/verify-lessons.yml`. ويبقى المشروع صفر Dependencies وصفر Build Step، ويبقى GitHub Pages على وضع `Deploy from a branch`، ولا يشارك GitHub Actions في تقديم الموقع.

## القرارات المعمارية

توجد سجلات القرارات المعمارية في `docs/decisions/`:

- `ADR-0001-hosting-and-routing.md`: الاستضافة والتوجيه وسلوك صفحة 404.
- `ADR-0002-design-tokens-and-styling-strategy.md`: Design Tokens واستراتيجية CSS.
- `ADR-0003-lessons-architecture.md`: معمارية نشر الدروس والروابط الدائمة.
- `ADR-0004-identifiers-and-permanent-paths.md`: المعرّفات التقنية والمسارات الدائمة للمحتوى التعليمي.
- `ADR-0005-content-intake-and-asset-custody.md`: إدخال المحتوى وحراسة الأصول وجرد الدروس.
- `ADR-0006-asset-publication-and-verification.md`: نشر الأصول والتحقق الآلي وتثبيت لقطة العهدة.

وتوجد بيانات جرد المحتوى وملفات التسليم والإجراء التشغيلي في `docs/content/`.
