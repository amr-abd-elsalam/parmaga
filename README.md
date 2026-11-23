# Parmaga

Parmaga منصة تعليمية تستهدف السوق المصري وطلاب البكالوريا، وتركز على مادة البرمجة والذكاء الاصطناعي.

## الحالة الحالية

الموقع ثابت، وتعرض الرئيسة معلومات المدرس والإعلان ووسائل التواصل والحجز والمنهج. دروس الترم الأول الأربعة عشر منشورة وتظهر ببطاقات معاينة وأسئلة، ودروس الترم الثاني التسعة لم تُنشر وتبقى نصوصًا بلا روابط. قسم «أماكن التواجد» محفوظ داخل HTML لكنه مخفي بالسمة `hidden` وفق التغيير المدمج في #105.

تُنشر الدروس تدريجيًا بعد كل Session أوفلاين.

اكتمل نشر دروس الترم الأول الأربعة عشر، وآخرها 4-4 بطلب الدمج #104. تتوزع أصولها على 673 ملف SVG في أربع وحدات، ولكل درس صفحة دائمة وconfig وManifest وملف سياق. صفحات الدروس ثابتة وكاملة دون JavaScript، وفوقها عارض تفاعلي اختياري يعمل بالتحسين المتدرج وفق `ADR-0007` وتعديلاته. يحتوي `sitemap.xml` حاليًا على 15 مدخلًا محليًا؛ وعدّ XML وحده لا يثبت استجابة العناوين على الإنترنت.

وأُضيفت فوق ذلك طبقتان اختياريتان. الأولى طبقة بورد شفافة للكتابة فوق الدرس وفق `ADR-0021` و`ADR-0022`، وهي Canvas بأوامر جلسة في الذاكرة وحدها: بلا تخزين دائم وبلا أي طلب شبكة، فتنتهي بانتهاء الجلسة أو بإعادة تحميل الصفحة. والثانية واجهة ترويج تثبيت التطبيق وفق `ADR-0019` و`ADR-0020`، تظهر في الصفحات العامة ولا تُعرض داخل صفحة الدرس، ولا تطلب التثبيت إلا بنقر صريح من المستخدم. والموقع قابل للتثبيت عبر `manifest.webmanifest`، ولا يوجد Service Worker، فلا عمل دون اتصال ولا تخزين مؤقت.

## Tech Stack

- HTML ثابت.
- ملف CSS خارجي واحد مبني على Design Tokens.
- صفر Dependencies.
- صفر Build Step.
- ثلاثة ملفات JavaScript خارجية، كلها مؤجَّلة بـ`defer` واختيارية وقابلة للتعطل بأمان: `assets/js/lesson-viewer.js` و`assets/js/lesson-board.js` في صفحة الدرس وحدها، و`assets/js/pwa-install.js` لترويج التثبيت في الصفحات العامة. الرئيسة تحمّله دون سكربت جديد للبطاقات. ولا JavaScript مضمَّن في أي صفحة: صفر inline script وصفر معالج `on*`.

## شجرة الملفات الحالية — مختصرة داخل مجلدات الدروس

```text
.
├── .gitattributes
├── 404.html
├── CNAME
├── PROJECT_VISION.md
├── README.md
├── favicon.ico
├── favicon.svg
├── index.html
├── manifest.webmanifest
├── sitemap.xml
├── .github/
│   └── workflows/
│       ├── browser-baseline.yml
│       └── verify-lessons.yml
├── assets/
│   ├── css/
│   │   └── parmaga.css
│   ├── js/
│   │   ├── lesson-board.js
│   │   ├── lesson-viewer.js
│   │   └── pwa-install.js
│   ├── images/
│   │   ├── amr-abdelsalam-ad-1536.webp
│   │   ├── amr-abdelsalam-ad-768.webp
│   │   ├── amr-abdelsalam-ad.png
│   │   ├── fav16.png
│   │   ├── fav16D.png
│   │   ├── fav180.png
│   │   ├── fav192.png
│   │   ├── fav32.png
│   │   ├── fav32D.png
│   │   ├── fav512-maskable.png
│   │   ├── fav512.png
│   │   ├── og-cover.png
│   │   └── parmaga-mark.svg
│   └── lessons/
│       └── programming-ai-baccalaureate-2/
│           └── term-1/
│               ├── chapter-01/   (4 lessons; SVG counts: 49, 45, 42, 50)
│               ├── chapter-02/   (3 lessons; SVG counts: 48, 41, 34)
│               ├── chapter-03/   (3 lessons; SVG counts: 36, 40, 39)
│               └── chapter-04/   (4 lessons; SVG counts: 25, 72, 69, 83)
├── docs/
│   ├── ai/
│   │   ├── AI_ARCHITECT_PROTOCOL.md
│   │   ├── AI_EXECUTOR_PROTOCOL.md
│   │   └── ARCHITECT_EVIDENCE_LEDGER.md
│   ├── content/
│   │   ├── CONTENT_INTAKE.md
│   │   ├── context/
│   │   │   └── programming-ai-baccalaureate-2/
│   │   │       └── term-1/
│   │   │           ├── chapter-01/   (lesson-01.md, lesson-02.md, lesson-03.md, lesson-04.md)
│   │   │           ├── chapter-02/   (lesson-01.md, lesson-02.md, lesson-03.md)
│   │   │           ├── chapter-03/   (lesson-01.md, lesson-02.md, lesson-03.md)
│   │   │           └── chapter-04/   (lesson-01.md, lesson-02.md, lesson-03.md, lesson-04.md)
│   │   └── manifests/
│   │       └── programming-ai-baccalaureate-2/
│   │           └── term-1/
│   │               ├── chapter-01/   (lesson-01.json, lesson-02.json, lesson-03.json, lesson-04.json)
│   │               ├── chapter-02/   (lesson-01.json, lesson-02.json, lesson-03.json)
│   │               ├── chapter-03/   (lesson-01.json, lesson-02.json, lesson-03.json)
│   │               └── chapter-04/   (lesson-01.json, lesson-02.json, lesson-03.json, lesson-04.json)
│   └── decisions/
│       ├── ADR-0001-hosting-and-routing.md
│       ├── ADR-0002-design-tokens-and-styling-strategy.md
│       ├── ADR-0003-lessons-architecture.md
│       ├── ADR-0004-identifiers-and-permanent-paths.md
│       ├── ADR-0005-content-intake-and-asset-custody.md
│       ├── ADR-0006-asset-publication-and-verification.md
│       ├── ADR-0007-lesson-page-and-progressive-viewer.md
│       ├── ADR-0008-mobile-lesson-viewer-ux-ui.md
│       ├── ADR-0009-floating-viewer-controls-and-user-initiated-motion.md
│       ├── ADR-0010-canonical-lesson-ui-and-back-to-top.md
│       ├── ADR-0011-lesson-print-contract.md
│       ├── ADR-0012-full-view-default-and-unified-floating-controls.md
│       ├── ADR-0013-viewer-conformance-and-single-gesture-motion.md
│       ├── ADR-0014-viewer-control-affordance.md
│       ├── ADR-0015-dependency-scope-and-ci-tooling.md
│       ├── ADR-0016-lesson-entry-and-sitemap.md
│       ├── ADR-0017-curriculum-structure-and-lesson-index.md
│       ├── ADR-0018-brand-icons-and-web-manifest.md
│       ├── ADR-0019-install-promotion-ui.md
│       ├── ADR-0020-smart-install-banner-and-hero-cta.md
│       ├── ADR-0021-lesson-board-overlay.md
│       ├── ADR-0022-transparent-lesson-ink-overlay.md
│       ├── ADR-0023-brand-image-refresh.md
│       ├── ADR-0024-lesson-publication-tool.md
│       └── ADR-0025-context-packet-cap.md
├── courses/
│   └── programming-ai-baccalaureate-2/
│       └── term-1/
│           ├── chapter-01/   (lesson-01/index.html, lesson-02/index.html, lesson-03/index.html, lesson-04/index.html)
│           ├── chapter-02/   (lesson-01/index.html, lesson-02/index.html, lesson-03/index.html)
│           ├── chapter-03/   (lesson-01/index.html, lesson-02/index.html, lesson-03/index.html)
│           └── chapter-04/   (lesson-01/index.html, lesson-02/index.html, lesson-03/index.html, lesson-04/index.html)
├── tests/
│   ├── test_browser_baseline_serve_scope.py
│   ├── test_install_promotion_contract.py
│   ├── test_lesson_board_contract.py
│   ├── test_lesson_ui_contract.py
│   ├── test_publish_lesson.py
│   ├── test_verify_lesson.py
│   └── test_workflow_checkout_contract.py
└── tools/
    ├── browser_baseline.py
    ├── publish_configs/
    │   └── programming-ai-baccalaureate-2/
    │       └── term-1/
    │           ├── chapter-01/   (lesson-01.json, lesson-02.json, lesson-03.json, lesson-04.json)
    │           ├── chapter-02/   (lesson-01.json, lesson-02.json, lesson-03.json)
    │           ├── chapter-03/   (lesson-01.json, lesson-02.json, lesson-03.json)
    │           └── chapter-04/   (lesson-01.json, lesson-02.json, lesson-03.json, lesson-04.json)
    ├── publish_lesson.py
    ├── templates/
    │   ├── context.md.tmpl
    │   └── lesson-page.html.tmpl
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

أداة التحقق الحاجبة الرسمية والوحيدة هي `tools/verify_lesson.py`، وهي بايثون 3.12 والمكتبة القياسية وحدها، بلا أي dependency وبلا build step. وتوجد إلى جانبها أداة قياس تشخيصية اختيارية لا تحجب شيئًا، موصوفة في آخر قسم «ما ليس موجودًا بعد».

للتحقق من الدروس المنشورة، من جذر المشروع:

```bash
python3 tools/verify_lesson.py .
```

ولتشغيل مجموعة الاختبارات كاملة، وهي 305 اختبارات في سبعة ملفات تحت `tests/`:

```bash
python3 -m unittest discover -s tests -p 'test_*.py' -v
```

حالات الخروج: `0` نجاح كامل، و`1` إخفاق تحقق، و`2` خطأ استعمال أو بيئة. وحين لا يوجد أي درس منشور، تنجح الأداة صراحةً وتذكر أن عدد المرشحين صفر.

يشغّل GitHub Actions الأمرين نفسيهما على كل Pull Request موجّه إلى `main` وعلى كل push إلى `main`، عبر job اسمه:

```text
Gate A - Lesson verification
```

الاستدعاء المحلي واستدعاء CI متطابقان حرفيًا، ولا يوجد منطق تحقق مكرر داخل YAML.

Gate A مسجَّل اليوم بوصفه **Required Status Check على `main`**، نُفِّذ في المرحلة 4 وفق `ADR-0006` البند 6. ومصدر هذه المعلومة تأكيد مالك المشروع وإعدادات المستودع، لا قياس من داخل الشجرة. وحدّ الأثر يُقرأ بدقة: قوة الحجب مصدرها قاعدة حماية الفرع في إعدادات المستودع لا ملف الـworkflow نفسه، فصلاحيته `contents: read` ولا يملك منع دمج ولا نشر. وGitHub Pages يخدم `main` مباشرة، فالتشغيل على مسار push يقع بعد النشر لا قبله. والـworkflow لا ينشر ولا يدفع ولا يعدّل محتوى ولا يصل إلى مستودع العهدة.

## نشر درس جديد

هذا هو الخط الذي نُشر به الدرس 1-2 بطلب الدمج #73 وفق `ADR-0024` D6، وهو نفسه لكل درس بعده. كل درس في طلب دمج واحد، وكل خطوة تُقاس قبل التي تليها. صفحة الدرس وملف سياقه والـManifest مخرجات مولَّدة، وتصحيحها يمر عبر الـconfig وإعادة التوليد وفق النطاق المعتمد. أما الرئيسة و`sitemap.xml` فتعدّلهما الأداة ترقيعًا، ولا تعيد توليدهما كاملين. تصميم بطاقات الرئيسة المدمج في #106 تعديل مستقل؛ فلا تُعامل إعادة `all` بوصفها إعادة بناء لذلك التصميم، ولا تخلط إصلاح عقد الناشر بنشر درس.

1. العهدة أولًا: تُنسخ أصول الدرس بلا أي تعديل إلى `parmaga-content` تحت `assets/lessons/<course>/<term>/<chapter>/<lesson>/` بأسماء `page-<NNN>.svg`، وتُودَع هناك في التزام واحد وفق `docs/content/CONTENT_INTAKE.md` §1–§3 و§9. وبصمة هذا الالتزام الكاملة هي قيمة `custodySnapshot` في الـconfig. ورسالة الالتزام تُبنى من رسالة التزام الدرس السابق كاملةً، عنوانًا ونصًّا، بتبديل رقم الدرس وعدد الصفحات ومجموع البايتات المقيس وحدها، ويُتحقق بعد الالتزام أن الرسالة المسجلة هي المبنية. وإن تغيّر الفصل يُبدَّل رقمه أيضًا، ويُكتب العنوان `admit chapter-NN/lesson-NN assets` كما في التزام الدرس 2-1 `1d9a5f2`، لأن `lesson-NN` وحده يلتبس بعهدة الفصل الأول، ويُسمّى الفرع `publish/chapter-NN-lesson-NN`.
2. على فرع جديد من `main` في هذا المستودع تُنسخ الأصول نفسها إلى المسار نفسه تحت `assets/lessons/`. وقاعدة `*.svg -text` في `.gitattributes` تحفظ بايتاتها ونهايات أسطرها كما هي.
3. يُكتب `tools/publish_configs/<course>/<term>/<chapter>/<lesson>.json` على مثال config الدرس السابق. ويجب عند نشر درس له نص بديل أن يطابق `displayNumber` و`displayTitleAr` حرفًا بحرف سطر الدرس المحجوز في `index.html`؛ وهذه قاعدة ترقيع النص البديل وليست إثباتًا لمطابقة جميع العناوين المخفية في البطاقات الحالية مع الإعدادات، إذ صُححت «الويب» في الرئيسة وحدها ضمن #106. سطر النص البديل، وصيغته `<p>1-3 — عنوان الدرس</p>`، وإلا وقف `patch` بحالة خروج 2 وطبع السطر الذي ينتظره، بلا كتابة. وملف السياق المولَّد من نصوص `contextSections` يجب أن يكون أقل من 16000 بايت وفق `ADR-0025`، ويحرس ذلك `ContextPacketTests` في `tests/test_publish_lesson.py` على كل config تحت `tools/publish_configs/`، فإن زاد يتوقف النشر ويُعرض القياس على المالك، ولا يُقصَّر نص الدرس ولا يُلمس الاختبار بغير قرار.
4. بنود نص كل صفحة (`transcript`) تُكتب وتُراجَع في الـconfig وحده وفق قاعدة D7: البند عنصر `<text>` واحد بترتيب المستند بعد ضم المسافات المتتالية في مسافة واحدة، ولغته `ar` واتجاهه `rtl` إن كان فيه حرف عربي وإلا `en` و`ltr`. ويُحذف البند إن كان رقم ترقيم وحده، وصيغته المقيسة `[(\[.]?\d{1,2}[)\].]?` مثل `(1` و`1.` و`.1`، ويبقى كل ما عداه ومنه `✓` و`✗`. وهذه الصيغة تعيد بنود الدرس 1-2 المنشورة في 45 صفحة من 45. أما أداة استخراج البنود فخارج المستودع وخارج خط النشر بقرار مسجَّل في `ADR-0024`. و`pivotQuestionAr` هو السؤال الذي يلي التسمية «السؤال الرئيسي: » في أي صفحة متى كانت إجابته في أواخر صفحات الدرس نفسه، بقاعدة المالك المسجلة في الدفتر، وهي تعيد النشر الأول للدرسين 2-1 و2-2. وإلا فهو البند الوحيد في page-002 الذي فيه `؟`، كما في نشر الدرس 1-2 الأول بطلب الدمج #73. فإن لم يكن فيها بند واحد كذلك، فلا قاعدة آلية له (جُرّبت قاعدة «أول سؤال في الدرس» فأعادت درسين من ثلاثة): يطبع أمر قراءة بنود الدرس التي فيها `؟` برقم الصفحة، ويقترح المنفّذ واحدًا منها حرفيًّا، ويُسجَّل رد المالك المكتوب بأيوه أو لا في الدفتر قبل تشغيل `all`. وإن نصّ المالك كتابةً على سؤال بعينه اعتُمد حرفيًّا، ويُسجَّل نصه في الدفتر، ويُقدَّم على ما سبق، كما في إعادة نشر الدروس 1-1 و1-3 و1-4 و2-1 و2-2، والنشر الأول للدروس 2-3 و3-1 و3-2 و3-3 و4-1 و4-2 و4-3 و4-4. و`descriptionAr` (نص alt الصورة، ويُكتب في جدول ملف السياق) لا يزيد على 60 حرفًا، وهو أول بند في الصفحة كما في النشر الأول للدرس 2-2، وفي 42 صفحة من 49 في 1-1، و39 صفحة من 45 في 1-2. أما في إعادة نشر الدروس 1-3 و1-4 و2-1 و2-2 والنشر الأول للدروس 2-3 و3-1 و3-2 و3-3 و4-1 و4-2 و4-3 و4-4 فبقاعدة المالك المكتوبة: الصفحة التي أول بند فيها عنوان رئيسي بخط 44 غامق وصفها ذلك العنوان، والافتتاحية أول بند فيها، وكل صفحة سواهما «تابع: » ثم آخر عنوان رئيسي قبلها حرفيًّا. فإن زاد أول بند على 60 حرفًا فالوصف «تابع: » ثم آخر عنوان رئيسي في الصفحات السابقة حرفيًّا، بتفضيل المالك في إعادة نشر الدرس 1-1، ويبقى النص الكامل في `transcript`. وإن سبقت السؤالَ المحوري تسميةٌ تنتهي بنقطتين مثل «السؤال الرئيسي: » حُذفت التسمية وبقي السؤال حرفيًّا. و`displayTitleEn` هو أول بند إنجليزي في page-001 لا يبدأ بـ`Lesson `، وهذه القاعدة تعيد الدروس الأربعة عشر الأولى.
5. `python3 tools/publish_lesson.py all --in-place <config>`: ينشئ الـManifest في مساره القانوني إن غاب، ثم صفحة الدرس وملف السياق ويرقّع الرئيسة و`sitemap.xml`، ثم يشغّل التحقق. دالة `_patch_root_html` تنشئ رابطًا نصيًا فقط، لا بطاقة بمعاينة وسؤال. وجود بداية الرابط الحرفية `<a class="action-link" href="مسار الدرس">` يعيد `already-patched` دون إعادة بناء محتواه؛ فلا تغيّر صياغة هذه البداية أو ترتيب سماتها دون مراجعة العقد واعتمادها. لم تُنفّذ في جلسة المزامنة إعادة `all --in-place` للأربعة عشر درسًا بعد #106، ولا يُدّعى إثبات idempotency شامل لتصميم الرئيسة الجديد.
6. الأدلة المطلوبة قبل التزام نشر جديد — وليست تقريرًا بتنفيذ إعادة النشر في مهمة المزامنة: `python3 tools/verify_lesson.py .` يعطي `RESULT: PASS (0 errors)`، ومجموعة الاختبارات كلها OK، وإعادة `all --in-place` تعطي `wrote=False` لكل مخرَج داخل المستودع (سطر `inventory` إلى المجلد المؤقت يطبع `wrote=True` دائمًا وهو خارج المستودع)، وبايتات الأصول في فهرس git مطابقة لبايتات القرص، و`git -c core.whitespace=cr-at-eol diff --check` نظيف. ثم بوابة المحتوى: يشغّل المالك الموقع محليًّا بأمر قسم «التشغيل محليًا» ويراجع صفحة الدرس الجديد صورةً ونصًّا صفحةً صفحة، ويُسجَّل رده بنصه في الدفتر، ولا التزام قبل ذلك.
7. التزام واحد بالمسارات الصريحة، ثم طلب دمج يُدمج بـ«Create a merge commit».

## الاستضافة

- الاستضافة الحالية على GitHub Pages بصورة مؤقتة.
- النطاق مرتبط عبر ملف `CNAME`.
- Cloudflare موجود أمام الموقع.
- ملف `robots.txt` مُدار من Cloudflare خارج هذا الـRepository.

## الملفات الحاكمة

- `PROJECT_VISION.md`: المرجع الأعلى لرؤية المشروع ومبادئ المنتج والهندسة، ويبقى في جذر المستودع لأنه أعلى من البروتوكولات في ترتيب مصادر الحقيقة.
- `docs/ai/AI_ARCHITECT_PROTOCOL.md`: يحدد طريقة تحليل المراحل وإعداد القرارات والتسليم المعماري.
- `docs/ai/AI_EXECUTOR_PROTOCOL.md`: يحدد طريقة تنفيذ مرحلة معتمدة وفحصها والتحقق منها دون توسيع نطاقها.
- `docs/ai/ARCHITECT_EVIDENCE_LEDGER.md`: دفتر الأدلة المعماري ومرجع الحالة التشغيلية وخارطة المراحل.

## ما ليس موجودًا بعد

لا يحتوي المشروع حاليًا على:

- فهارس Course وTerm وChapter، وفهرس `/courses/` نفسه. المنشور حاليًا صفحات الدروس الأربع عشرة، أما فهارس المستويات فليست موجودة في شجرة الملفات الحالية؛ ولا يُستنتج من الجرد وحده تحقق HTTP حي.
- Structured Data.
- Service Worker، أو تخزين مؤقت، أو أي عمل دون اتصال. يوجد `manifest.webmanifest` فيصير الموقع قابلًا للتثبيت، لكن لا يوجد ملف Service Worker في المستودع ولا تسجيل له في أي صفحة.
- حفظ تقدم الطالب، أو بحث.
- Routing أو Build Step أو Dependencies.

تتبع روابط التنقل في تذييل صفحات الدروس ترتيب الدروس المنشورة في `#lessons` بالصفحة الرئيسية: رابط الدرس السابق يمينًا، ورابط الرئيسية في الوسط، ورابط الدرس التالي يسارًا. لا يظهر رابط السابق في أول درس، ولا رابط التالي في آخر درس.

تحتوي شجرة النشر الحالية على 673 أصل SVG لدروس الترم الأول الأربعة عشر، ومعها 14 Manifest و14 ملف سياق و14 config و14 صفحة درس. تبقى أصول العهدة خارج هذا المستودع وفق `ADR-0005`؛ ولم يُفحص مستودع `parmaga-content` في مهمة المزامنة، فلا تُقدَّم حالته السابقة باعتبارها قياسًا محليًا جديدًا.

تتبع صفحات الدروس المسارات الدائمة تحت `/courses/programming-ai-baccalaureate-2/term-1/chapter-NN/lesson-NN/`، وتختلف أعداد صفحاتها بحسب الدرس كما في الخريطة أعلاه. يبقى العرض الكامل الساكن والنص المصاحب أساس التحسين المتدرج، ولا يتطلب عرض الصور تعديل أصول SVG. وفي الرئيسة تستخدم البطاقات معاينات الصفحة الأولى بأبعاد 1080×1350، مع السؤال ظاهرًا والعنوان مخفيًا بصريًا داخل الرابط، و`alt=""` للمعاينة. هذا وصف بنيوي لا إثبات لاختبار شامل بقارئ شاشة. اعتماد الخط وتصحيح «الويب» لا يعنيان حل محاذاة الحروف مع سطور الكراسة؛ المحاذاة غير محسومة، ويجب إبقاء السطور ممتدة في الفراغات أيضًا. لم تُوثَّق مراجعة شاملة لكل البطاقات والمقاسات والتكبير ولوحة المفاتيح والطباعة ونسخة الإنتاج.

توجد ثلاث أدوات تحت `tools/` وسبعة ملفات اختبار وworkflowان. الأولى أداة التحقق الحاجبة `tools/verify_lesson.py` مع `.github/workflows/verify-lessons.yml`. والثانية أداة قياس تشخيصية اختيارية هي `tools/browser_baseline.py` مع `.github/workflows/browser-baseline.yml`، تعمل على Pull Request وبالتشغيل اليدوي فقط ولا تعمل على `main`، ولا تحجب شيئًا، ولا يثبّت الـworkflow متصفحًا فهي معتمدة كليًا على صورة الـrunner، وأدلتها مرفوعة بمدة احتفاظ 14 يومًا فليست مرجعًا دائمًا. والثالثة أداة النشر `tools/publish_lesson.py` وفق `ADR-0024`، تولّد Manifest الدرس وصفحته وملف سياقه ورابطه في الرئيسة ومدخله في `sitemap.xml` من ملف config في `tools/publish_configs/`، ويغطي `tests/test_publish_lesson.py` تهريبها لـHTML، وفحوص إعادة التوليد التي يعرّفها ملف الاختبار، وسقف ملف السياق، وقائمة أدوات Python في `tools/` التي تُبقي أداة استخراج النصوص خارج المستودع وفق `ADR-0024`، وأمر `all` لدرس جديد بلا Manifest وفق K1. والاختبارات هي `tests/test_verify_lesson.py` و`tests/test_lesson_ui_contract.py` و`tests/test_install_promotion_contract.py` و`tests/test_lesson_board_contract.py` و`tests/test_browser_baseline_serve_scope.py` و`tests/test_workflow_checkout_contract.py` و`tests/test_publish_lesson.py`. ويبقى المشروع صفر Dependencies وصفر Build Step، ويبقى GitHub Pages على وضع `Deploy from a branch`، ولا يشارك GitHub Actions في تقديم الموقع.

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
- `ADR-0011-lesson-print-contract.md`: عقد الطباعة — العرض هو القاعدة الحاكمة لا الارتفاع، وميزانية الكروم الرأسي غير المصوَّر لا تتجاوز 32px لكل ورقة، وهامش الصفحة مثبَّت بـ`@page`، والشرط المرجعي وقت القرار 22 ورقة بالضبط على A5 وA4 وLetter؛ هذا عدد المثال التاريخي وليس عدد صفحات كل درس منشور.
- `ADR-0012-full-view-default-and-unified-floating-controls.md`: العرض الكامل هو الوضع الافتراضي دائمًا وبلا جلب أو حركة، وذِكر 22 صفحة يخص الدرس المرجعي وقت القرار، والدخول التفاعلي بفعل صريح يعرض صفحة واحدة ثابتة والتشغيل فعل مستقل، وأدوات التحكم عائمة موحدة على جميع المقاسات بلوحة واحدة مفتوحة وبلا اكتشاف جهاز، وقائمة سرعة مغلقة بلا slider، وأشكال قلم محلية للجلسة بلا تخزين، وإلغاء كامل وteardown مُعاد الاستدعاء عند أي خروج أو فشل. يستبدل جزئيًا نموذج `ADR-0010 §8` على الشاشات الواسعة.
- `ADR-0013-viewer-conformance-and-single-gesture-motion.md`: يعدّل ADR-0012 فيقنّن القلم الواحد والنقر الخارجي عبر مسار اللوحة الواحد، ويجعل دخول العرض وتشغيله طلبًا صريحًا واحدًا، ويخفض مهلة اللوحة إلى 5000ms مع تعليقها أثناء التشغيل، دون تعديل HTML أو CSS أو عقد الطباعة.
- `ADR-0014-viewer-control-affordance.md`: يقنّن أزرار العارض العائمة بوصفها أزرارًا نصية Pill واضحة في السكون بظل قائم، وتحويم محروس للأجهزة الدقيقة، وضغط داخلي، وتركيب صحيح لحلقة التركيز مع الظل، بلا JavaScript أو HTML أو Pulse أو Animation أو Transform، مع بقاء عقد الطباعة مجمدًا.
- `ADR-0015-dependency-scope-and-ci-tooling.md`: يعرّف ما يُعدّ Dependency ويصنّف أدوات CI، ويحصر نطاق الأدوات المسموحة: بلا package manifest، وبلا npm أو pip install، وبلا CDN، وبلا Playwright أو Selenium، وبلا WebSocket أو DevTools Protocol يدويًا، وبلا شبكة خارجية في CI. يعلو على البنود المذكورة في قسم «البنود المعدَّلة» حصرًا، ولا يُعلن أي ADR قائمًا Superseded.
- `ADR-0016-lesson-entry-and-sitemap.md`: نقطة دخول الدرس المنشور وتنفيذ `sitemap.xml` المستحق — الروابط بصيغة مجلد وشرطة نهائية بلا `index.html`، وقيم `loc` منسوخة حرفيًا من `canonical` الصفحة نفسها، وحذف `lastmod` واستبعاد ما لم يُنشر ومنه `/courses/`، ووصلة دخول مؤقتة واحدة من الرئيسة، و`robots.txt` يبقى مُدارًا من Cloudflare، وصفر CSS جديد.
- `ADR-0017-curriculum-structure-and-lesson-index.md`: يستوعب بنية منهج البكالوريا 2 — ترمان وسبع وحدات وثلاثة وعشرون درسًا بعناوينها بالعربية والإنجليزية — بوصف هذا الملف السجل الواحد للحقيقة بلا ملف بيانات ولا generator، ويثبّت `chapter-NN` برقم الوحدة متصلًا عبر الترمين و`lesson-NN` بترتيبه داخلها، ويعرض المنهج كاملًا في الرئيسة برابط للمنشور ونصّ بلا رابط لما لم يُنشر، بصفر CSS جديد وبلا مساس بـ`sitemap.xml`.
- `ADR-0018-brand-icons-and-web-manifest.md`: يوحّد كتلة الهوية في رأس كل صفحة، ويعتمد `--pg-navy-700` حبرًا للعلامة، ويضيف `manifest.webmanifest` بـ`minimal-ui`، ويؤجّل Service Worker بقرار بلا إذن تنفيذ.
- `ADR-0019-install-promotion-ui.md`: يحدّد نطاق مرحلة Install Promotion UI وحدودها.
- `ADR-0020-smart-install-banner-and-hero-cta.md`: بانر تثبيت ذكي وCTA في الصفحة الرئيسة، ببوابتين مستقلتين وظهور محكوم بالجلسة وبفعل المستخدم.
- `ADR-0021-lesson-board-overlay.md`: طبقة بورد الدرس العائمة — Canvas ونموذج strokes وأوامر جلسة في الذاكرة، بلا تخزين دائم وبلا شبكة وبلا build step.
- `ADR-0022-transparent-lesson-ink-overlay.md`: طبقة الحبر الشفافة فوق الدرس، يبقى معها محتوى الدرس مقروءًا خلف الحبر، وتنتهي أوامر الجلسة بانتهائها.
- `ADR-0023-brand-image-refresh.md`: تحديث صورة الإعلان بمقاساتها القديمة وشفافية كاملة، ويعلن انقضاء قيد `ADR-0018` بند 9 في عائلة `amr-abdelsalam-ad.*` وحدها، ويجرّد حاويتها من الخلفية والظل.
- `ADR-0024-lesson-publication-tool.md`: أداة نشر الدروس `tools/publish_lesson.py` — أوامرها ومدخلاتها ومخرجاتها ونهايات أسطرها، وبرهان إعادة التوليد بـ`wrote=False`، والتزام النشر الواحد بحالة `published`، وثمانية قيود معروفة مقيسة لكل منها سطر «الحالة»، عولج منها K1 (`all` لدرس جديد) وK2 (تهريب HTML) وK4 (سقف ملف السياق).
- `ADR-0025-context-packet-cap.md`: يرفع سقف ملف السياق لكل درس إلى ستة عشر كيلوبايت (أقل من 16000 بايت) معدِّلًا `ADR-0005` §10، بلا تقصير لنص أي درس، ويبقى منع وسم SVG واختبار الكفاية بنموذج مستقل كما هما.

للعارض التفاعلي نمطان صريحان وفق `ADR-0008`: نمط تفاعلي يعرض صفحة نشطة واحدة على مسرح واحد، ونمط الدرس الكامل الذي يعيد جميع صفحات الدرس ظاهرة بترتيبها. النمط الساكن الكامل هو الحالة الافتراضية قبل نجاح أول تركيب تفاعلي، وهو ما يعود إليه العرض عند أي فشل، والتبديل بينهما بفعل واحد دون إعادة تحميل الصفحة.

تُقرأ مواصفات التحكم وفق `ADR-0010` مع تعديلاته اللاحقة، خصوصًا `ADR-0012` و`ADR-0013`؛ فلا يُقدَّم وصف `ADR-0009` الأقدم وحده باعتباره الحالة الحالية. يثبت ملخص `ADR-0012` توحيد التحكم العائم على المقاسات، ويقنّن `ADR-0013` مسار اللوحة وبدء الحركة بطلب صريح. ولا تُنشأ نسخة ثانية من أي أداة لأي مقاس شاشة. وفي وضع تقليل الحركة لا يبدأ شيء تلقائيًا وتظهر الصفحة كاملة فورًا، وتبقى أدوات الحركة عاملة فتشتغل المحاكاة بطلب صريح وحده. ودون JavaScript أو عند أي فشل تغيب كتلة التحكم كليًا ويبقى الدرس الكامل قابلًا للقراءة بمراسيه ونصوصه وصوره.

وتوجد بيانات جرد المحتوى وملفات التسليم والإجراء التشغيلي في `docs/content/`.
