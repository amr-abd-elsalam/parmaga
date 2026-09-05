# Parmaga

Parmaga منصة تعليمية تستهدف السوق المصري وطلاب البكالوريا، وتركز على مادة البرمجة والذكاء الاصطناعي.

## الحالة الحالية

الموقع في مرحلته الثابتة الأولى، ويعرض صفحة هبوط تحتوي على معلومات المدرس، وأماكن التواجد، ووسائل التواصل والحجز.

تبدأ الدراسة الفعلية في 1 سبتمبر 2026، وتُنشر الدروس تدريجيًا بعد كل Session أوفلاين.

نُشرت أول حزمة أصول درس داخل المستودع وتحقق منها Gate A آليًا، ثم نُشرت صفحة الدرس الأولى على مسارها الدائم. الصفحة ثابتة وكاملة دون JavaScript، وفوقها عارض تفاعلي اختياري يعمل بالتحسين المتدرج وفق `ADR-0007`.

## Tech Stack

- HTML ثابت.
- ملف CSS خارجي واحد مبني على Design Tokens.
- صفر Dependencies.
- صفر Build Step.
- ملف JavaScript خارجي واحد لصفحة الدرس وحدها، اختياري وقابل للتعطل بأمان. وما عدا ذلك صفر JavaScript.

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
│   ├── js/
│   │   └── lesson-viewer.js
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
        ├── ADR-0006-asset-publication-and-verification.md
        ├── ADR-0007-lesson-page-and-progressive-viewer.md
        ├── ADR-0008-mobile-lesson-viewer-ux-ui.md
        ├── ADR-0009-floating-viewer-controls-and-user-initiated-motion.md
        ├── ADR-0010-canonical-lesson-ui-and-back-to-top.md
        ├── ADR-0011-lesson-print-contract.md
        ├── ADR-0012-full-view-default-and-unified-floating-controls.md
        ├── ADR-0013-viewer-conformance-and-single-gesture-motion.md
        └── ADR-0014-viewer-control-affordance.md
├── courses/
│   └── programming-ai-baccalaureate-2/
│       └── term-1/
│           └── chapter-01/
│               └── lesson-01/
│                   └── index.html
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

- فهارس Course وTerm وChapter، وفهرس `/courses/` نفسه. المنشور حاليًا صفحة الدرس الأولى وحدها، وبقية المستويات تعيد `404`.
- `sitemap.xml` أو Structured Data.
- تنقل بين الدروس، أو حفظ تقدم الطالب، أو بحث.
- Routing أو Build Step أو Dependencies.

جُرِد أول درس مرجعي وفُحص وسُجّل في `docs/content/`، ثم نُشرت أصوله داخل المستودع: 22 ملف SVG تحت `assets/lessons/`، بحالة `published` في manifest الدرس، ومع تثبيت لقطة العهدة وفق `ADR-0006`. الأصول الأصلية تبقى محفوظة خارج هذا المستودع وفق `ADR-0005`.

ثم أُنشئت صفحة الدرس على مسارها الدائم، فصار الرابط `‏/courses/programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01/` يعيد `200`. الصفحة تعرض الصفحات الـ22 عبر `<img>` بأبعاد صريحة وتحميل مؤجل، ولكل صفحة مرساة ثابتة من `#page-1` إلى `#page-22` ونص كامل بالعربية والإنجليزية متاح دون JavaScript. ويضيف `assets/js/lesson-viewer.js` عرضًا تفاعليًا اختياريًا لصفحة واحدة نشطة، فإذا تعطّل أو حُجب بقي الدرس كاملًا ساكنًا. ولم تُعدّل ملفات SVG الأصلية. وتبقى مستويات Course وTerm وChapter بلا فهارس، فتعيد `404` حتى تُنشأ بقرار مستقل.

توجد أداة تحقق واختبارات وworkflow للتحقق: `tools/verify_lesson.py` و`tests/test_verify_lesson.py` و`.github/workflows/verify-lessons.yml`. ويبقى المشروع صفر Dependencies وصفر Build Step، ويبقى GitHub Pages على وضع `Deploy from a branch`، ولا يشارك GitHub Actions في تقديم الموقع.

## القرارات المعمارية

توجد سجلات القرارات المعمارية في `docs/decisions/`:

- `ADR-0001-hosting-and-routing.md`: الاستضافة والتوجيه وسلوك صفحة 404.
- `ADR-0002-design-tokens-and-styling-strategy.md`: Design Tokens واستراتيجية CSS.
- `ADR-0003-lessons-architecture.md`: معمارية نشر الدروس والروابط الدائمة.
- `ADR-0004-identifiers-and-permanent-paths.md`: المعرّفات التقنية والمسارات الدائمة للمحتوى التعليمي.
- `ADR-0005-content-intake-and-asset-custody.md`: إدخال المحتوى وحراسة الأصول وجرد الدروس.
- `ADR-0006-asset-publication-and-verification.md`: نشر الأصول والتحقق الآلي وتثبيت لقطة العهدة.
- `ADR-0007-lesson-page-and-progressive-viewer.md`: صفحة الدرس الأولى والعارض التفاعلي المتدرج وحدود التضمين inline.
- `ADR-0008-mobile-lesson-viewer-ux-ui.md`: نمطا العرض في صفحة الدرس، وهرمية التحكم Mobile-first، والإيقاف والاستئناف، والقفز إلى صفحة، وسياسة fragment وHistory API، وواجهة تقليل الحركة.
- `ADR-0009-floating-viewer-controls-and-user-initiated-motion.md`: يعدّل `ADR-0008` في موضعين حصرًا — هرمية التحكم على الشاشات الصغيرة فتصبح زرين عائمين بلوحتين، وسياسة أدوات الحركة في وضع تقليل الحركة فتبقى ظاهرة وعاملة بطلب المستخدم وحده.
- `ADR-0010-canonical-lesson-ui-and-back-to-top.md`: عقد واجهة الدرس المرجعية — الأسماء العربية للأدوات، ومعاني حالات التشغيل، ومصدر الحقيقة الواحد، وقواعد التركيز وEscape، وميزانية الطبقة العائمة، وزر العودة إلى أعلى الدرس.
- `ADR-0011-lesson-print-contract.md`: عقد الطباعة — العرض هو القاعدة الحاكمة لا الارتفاع، وميزانية الكروم الرأسي غير المصوَّر لا تتجاوز 32px لكل ورقة، وهامش الصفحة مثبَّت بـ`@page`، والشرط الثابت 22 ورقة بالضبط على A5 وA4 وLetter.
- `ADR-0012-full-view-default-and-unified-floating-controls.md`: العرض الكامل هو الوضع الافتراضي دائمًا بصفحاته الـ22 وبلا جلب أو حركة، والدخول التفاعلي بفعل صريح يعرض صفحة واحدة ثابتة والتشغيل فعل مستقل، وأدوات التحكم عائمة موحدة على جميع المقاسات بلوحة واحدة مفتوحة وبلا اكتشاف جهاز، وقائمة سرعة مغلقة بلا slider، وأشكال قلم محلية للجلسة بلا تخزين، وإلغاء كامل وteardown مُعاد الاستدعاء عند أي خروج أو فشل. يستبدل جزئيًا نموذج `ADR-0010 §8` على الشاشات الواسعة.
- `ADR-0013-viewer-conformance-and-single-gesture-motion.md`: يعدّل ADR-0012 فيقنّن القلم الواحد والنقر الخارجي عبر مسار اللوحة الواحد، ويجعل دخول العرض وتشغيله طلبًا صريحًا واحدًا، ويخفض مهلة اللوحة إلى 5000ms مع تعليقها أثناء التشغيل، دون تعديل HTML أو CSS أو عقد الطباعة.
- `ADR-0014-viewer-control-affordance.md`: يقنّن أزرار العارض العائمة بوصفها أزرارًا نصية Pill واضحة في السكون بظل قائم، وتحويم محروس للأجهزة الدقيقة، وضغط داخلي، وتركيب صحيح لحلقة التركيز مع الظل، بلا JavaScript أو HTML أو Pulse أو Animation أو Transform، مع بقاء عقد الطباعة مجمدًا.

للعارض التفاعلي نمطان صريحان وفق `ADR-0008`: نمط تفاعلي يعرض صفحة نشطة واحدة على مسرح واحد، ونمط الدرس الكامل الذي يعيد الصفحات الـ22 ظاهرة بترتيبها. النمط الساكن الكامل هو الحالة الافتراضية قبل نجاح أول تركيب تفاعلي، وهو ما يعود إليه العرض عند أي فشل، والتبديل بينهما بفعل واحد دون إعادة تحميل الصفحة.

وأدوات التحكم عقدة واحدة لكل أداة وفق `ADR-0010`، موزّعة على لوحتين: التنقل بين الصفحات، وأدوات محاكاة الكتابة. على الشاشات الواسعة تظهر اللوحتان داخل تدفق الصفحة، وعلى الشاشات الصغيرة تنطويان خلف زرين دائريين عائمين وفق `ADR-0009`، بلوحة واحدة مفتوحة كحد أقصى، ويغلقها Escape أو الضغط على زرها. ولا تُنشأ نسخة ثانية من أي أداة لأي مقاس شاشة. وفي وضع تقليل الحركة لا يبدأ شيء تلقائيًا وتظهر الصفحة كاملة فورًا، وتبقى أدوات الحركة عاملة فتشتغل المحاكاة بطلب صريح وحده. ودون JavaScript أو عند أي فشل تغيب كتلة التحكم كليًا ويبقى الدرس الكامل قابلًا للقراءة بمراسيه ونصوصه وصوره.

وتوجد بيانات جرد المحتوى وملفات التسليم والإجراء التشغيلي في `docs/content/`.
