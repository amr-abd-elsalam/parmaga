# Parmaga — دفتر الأدلة المعماري

## 1. الغرض والسلطة

هذا الدفتر عقد الاستئناف بين النماذج، ومصدر الحالة التشغيلية الحالية للمشروع.

- هو المرجع الأول الذي يُقرأ قبل أي ملف آخر في بداية أي جلسة معمارية أو تنفيذية.
- لا يحل محل `PROJECT_VISION.md` ولا محل ADRs، ولا يغيّر قرارًا معماريًا معتمدًا.
- يمنع إعادة إثبات الحقائق المسجَّلة فيه ما لم يوجد دليل على تغيّر الـbaseline.
- يجب تحديثه عند إغلاق كل مرحلة، وفي أي handoff معماري.
- عند تعارضه مع ADR أو `PROJECT_VISION.md`، يسود مصدر الحقيقة الأعلى، ثم يُصحَّح الدفتر.

الدفتر وثيقة تشغيلية دائمة، لا سجل ملاحظات حر. لا يُكتب فيه إلا ما تحقق بأمر فعلي أو ورد نصًا من مالك المشروع.

---

## 2. Baseline الحالي

```text
Repository: /mnt/i/parmaga
Branch: main
HEAD at phase approval: fb5e09034b1a852d9cc6e3eaeb0d17fc8efa6cc2
Expected initial tree state: clean
HEAD at Phase 0 content commit: acfc10ef51476640cfd3a17d54f7e7d04e9d0d0d
HEAD at Phase 0 closing commit: e808ec155ced11e08dd21cf1eaf740cbce189416
HEAD at Phase 1 approval: e808ec155ced11e08dd21cf1eaf740cbce189416
HEAD at Phase 1 closing commit: f2734b551cecf31c8431bfbcc1d6038e343103ae
HEAD at Phase 2 implementation commit: 0de5f31127bff85fa6fab1fdecda10b7f0c15382
HEAD at Phase 2 merge commit (PR #1): 6783a8373b4fafe59d8b1706bede3c5c5e9990b3
HEAD at Phase 3 implementation commit: c03fa8e8b893da1d711b01bb64517d96e0c0e503
HEAD at Phase 3 merge commit (PR #2): 48ecb877d16252eeb2b864ed396b7270d49aca5b
Phase 3 merge parents: 6783a8373b4fafe59d8b1706bede3c5c5e9990b3 + c03fa8e8b893da1d711b01bb64517d96e0c0e503
Baseline HEAD at Phase 3 Closeout approval: 48ecb877d16252eeb2b864ed396b7270d49aca5b
Baseline tree state: clean — main = origin/main
HEAD at Phase 3 Closeout implementation commit: 99b0d2a85ea30c3a781d8bf7134d5d6ab76f0cfa
HEAD at Phase 3 Closeout merge commit (PR #3): d40d3b842143e607a06c71bd8c6dbd25677ab74b
Baseline HEAD at Phase 4 approval: c29a6b1ab2559d36438e1be96e200c56182e066c
Baseline tree state at Phase 4 approval: clean — main = origin/main، والفرع المحلي الوحيد main
Previous phase: Phase 3 — Closeout Reconciliation (Closed — 2026-08-29، مدموجة في d40d3b8)
HEAD at Phase 4 implementation commit: dd32b51828f521984cc6be98d918a15240afe7ef
HEAD at Phase 4 merge commit (PR #4): 1fdbfa791de9df2f18480c12fadb573a2d2400be
Phase 4 merge parents: c29a6b1ab2559d36438e1be96e200c56182e066c + dd32b51828f521984cc6be98d918a15240afe7ef
Phase 4 status: Closed — 2026-08-29 (مدموجة في 1fdbfa7)
Baseline HEAD at Phase 5 approval: 8324aa083993294095e69f7662713e42a5f85e8e
HEAD at Phase 5 implementation commit: f7e1f4672541a7d060ef7a377191ec8e063ca730
HEAD at Phase 5 merge commit (PR #6): cf41d264216cc952c0ee41770274757a284a0ccc
Phase 5 merge parents: 8324aa083993294095e69f7662713e42a5f85e8e + f7e1f4672541a7d060ef7a377191ec8e063ca730
Baseline HEAD at Phase 5 Closeout approval: cf41d264216cc952c0ee41770274757a284a0ccc
Baseline tree state at Phase 5 Closeout approval: clean — main = origin/main، ولا ملفات غير متعقَّبة
Baseline HEAD at Phase 6 approval: 6ebe8f52116860ed85eec1818184d0a59d7493b9
HEAD at Phase 6 merge commit (PR #8): 398485d579fc024e737be2376ce65b2125e84616
Baseline HEAD at Phase 6.1 approval: 398485d579fc024e737be2376ce65b2125e84616
HEAD at Phase 6.1 fix merge commit (PR #10): 61a72c3
HEAD at Phase 6.1 ADR-0009 merge commit (PR #9): c7fb02e0d77930c3e9ae9bbeb762a52a4e9defcf
Current approved phase: Phase 6.1 — إصلاح امتثال بعد مراجعة UX/UI
Current phase status: Closed — الإصلاح مدموج وADR-0009 معتمد، وبنود الفحص اليدوي مفتوحة
HEAD at Phase 6.2 merge commit (PR #13): efade0c38f682134aa3b2a1810eeba401c5cb127
Phase 6.2 merge parents: 2a2b79d2610d4d30a6ed7099cae7763196648fd2 + 9e385232a06a73bd6176bc90c86a913d8065fb53
Phase 6.2 status: Closed — 2026-09-01 (مدموجة في efade0c)
Baseline HEAD at Phase 7 approval: efade0c38f682134aa3b2a1810eeba401c5cb127
Baseline tree state at Phase 7 approval: dirty — تعديل parmaga.css وملف ADR-0011 غير متعقَّب، طُبِّقا على main ثم نُقلا إلى فرع قبل أي التزام
HEAD at Phase 7 implementation commit: b845baede67f2c3b101972698942bba3c3372840
HEAD at Phase 7 merge commit (PR #14): 1ca43c1348341deb67c0a9c78e587a35038d2508
Phase 7 merge parents: efade0c38f682134aa3b2a1810eeba401c5cb127 + b845baede67f2c3b101972698942bba3c3372840
Phase 7 merged baseline: 1ca43c1348341deb67c0a9c78e587a35038d2508
Phase 7 Gate A run on PR #14 head b845bae: 33467915910 — event pull_request، conclusion success
Phase 7 Gate A run on main 1ca43c1: 33467942178 — event push، conclusion success
Phase 7 status: Closed — 2026-09-02 (مدموجة في 1ca43c1)
Current approved phase: Phase 7 — عقد الطباعة (ADR-0011) — Closed
Next phase: لا مرحلة تالية محجوزة — المرحلة 8 (الهوية والمشاركة والسيو) لا تُفتح إلا باعتماد مالك مستقل، ولا يُحجز لها رقم ADR
Baseline HEAD at Phase 7.1 ADR approval: f1ca028e141b57684cce45c326a810f529072ac6
Baseline tree state at Phase 7.1 ADR approval: clean — main = origin/main، ومخرج git status --porcelain فارغ
Current approved phase: Phase 7.1 — ADR-0012 (قرار فقط، بلا إذن تنفيذ)
Phase 7.1 ADR: ADR-0012-full-view-default-and-unified-floating-controls.md — Accepted 2026-09-02، وأعلى رقم قبله ADR-0011
Baseline HEAD at Phase 7 Closeout reconciliation: 1ca43c1348341deb67c0a9c78e587a35038d2508
Baseline tree state at Phase 7 Closeout reconciliation: clean — main = origin/main، ومخرج git status --porcelain فارغ
HEAD at Phase 7.1 ADR merge commit (PR #16): fe9f9cfe25e91f82964d0059147d53f6beca5b87
HEAD at Phase 7.1 implementation commit: e640f1ae03f5493c22df91013ab3b7dfbacd8dd8
HEAD at Phase 7.1 merge commit (PR #17): f9df9df4697bf407f1c3028c792cdf9e9d7994b8
Phase 7.1 merge parents: fe9f9cfe25e91f82964d0059147d53f6beca5b87 + e640f1ae03f5493c22df91013ab3b7dfbacd8dd8
Phase 7.1 merged baseline: f9df9df4697bf407f1c3028c792cdf9e9d7994b8
Phase 7.1 Gate A run on PR #17 head e640f1a: 33613351199 — event pull_request، conclusion success
Phase 7.1 Gate A run on main f9df9df: 33613399178 — event push، conclusion success
Phase 7.1 status: Closed — 2026-09-03 (مدموجة في f9df9df)
Baseline HEAD at Phase 7.1 Closeout reconciliation: f9df9df4697bf407f1c3028c792cdf9e9d7994b8
Baseline tree state at Phase 7.1 Closeout reconciliation: clean — main = origin/main، ومخرج git status --porcelain فارغ
Current approved phase: Phase 7.1 — تنفيذ ADR-0012 — Closed
HEAD at Phase 7.1 Closeout merge commit (PR #18): 34e65716fb4ad9ba0a063efc480e8539895196cf
Phase 7.1 Closeout merge parents: f9df9df4697bf407f1c3028c792cdf9e9d7994b8 + 5617088ef3ab428635e52a0242f8593ad679e13e
Baseline HEAD at Phase 7.2 approval: 34e65716fb4ad9ba0a063efc480e8539895196cf
Baseline tree state at Phase 7.2 approval: clean — main = origin/main، ومخرج git status --porcelain فارغ بعد تحديث stat cache
Current approved phase: Phase 7.2 — امتثال عقد العارض وبدء الحركة بإيماءة واحدة وتعليق مهلة الخمول
Current phase status: In Progress — ADR-0013 Accepted، وتسليم القرار وحده مأذون؛ التنفيذ غير مأذون
Phase 7.2 ADR: ADR-0013-viewer-conformance-and-single-gesture-motion.md — Accepted 2026-09-03، وأعلى رقم قبله ADR-0012
Phase 7.2 implementation commit: 01f3d6ad39dcb6cadcad8caff353dac7b8ca4f1c
Phase 7.2 ledger commit: 70f345303ff10c1bc086767a9de3f35ecbdcad4c
Phase 7.2 merge parents: 4f7e8c361874960b0934ab4f30f09f050e1e7fad + 70f345303ff10c1bc086767a9de3f35ecbdcad4c
Phase 7.2 merged baseline: 0f6cb3cde89e5ddbec5673d6016932460ae081f1
Phase 7.2 Gate A run on PR #20 head 70f3453: 33897875834 — event pull_request، conclusion success
Phase 7.2 Gate A run on main 0f6cb3c: 33897910289 — event push، conclusion success
Phase 7.2 status: Closed — 2026-09-04 (مدموجة في 0f6cb3c)
Current approved phase: Phase 7.2 — تنفيذ ADR-0013 — Closed
Current phase status: Closed — 2026-09-04، ولا مرحلة تالية مفتوحة ولا رقم ADR محجوز
Baseline HEAD at Phase 7.2 Closeout reconciliation: 0f6cb3cde89e5ddbec5673d6016932460ae081f1
Baseline tree state at Phase 7.2 Closeout reconciliation: clean — main = origin/main
```

حالة الشجرة عند اعتماد المرحلة أُثبتت بالأمر `git status --short --branch`، ومخرجه سطر الفرع وحده دون أي سطر حالة.

حالة الشجرة قبل الـstaging أُثبتت بالأمر `git status --short`، ومخرجه ثلاثة مسارات فقط لا رابع لها. أثر الـcommit وأدلة ما بعده مقيَّدة في §8.

SHA الخاص بـcommit الإغلاق لا يُكتب هنا مسبقًا؛ يُقيَّد في §8 بعد تنفيذه فعليًا.

### عرف نهايات الأسطر وأمر الفحص المعتمد

كان توصيف المستودع عند القياس الأول أنه CRLF بالكامل، بناءً على خمسة ملفات كانت النسبة فيها 100%. القياس عند baseline المرحلة 7.2 أثبت أن التوصيف لا يصلح تعميمًا راهنًا: README والدفتر وADR-0012 ملفات CRLF، بينما خمسة ملفات أخرى مقيسة — منها `.gitattributes` وADR-0010 — ملتزمة بصيغة LF. فالمستودع مختلط النهايات، ويُحفظ عرف كل ملف كما هو بلا تطبيع شامل. و`core.autocrlf` و`core.eol` و`core.whitespace` غير مضبوطة في البيئة المقيسة.

يترتب على ذلك أن `git diff --check` بالإعداد الافتراضي يبلّغ `trailing whitespace` عن **كل** سطر مضاف، لأنه يعدّ CR في نهاية السطر مسافة زائدة. هذا إنذار كاذب بنيوي، لا عيب في المحتوى.

أمر الفحص المعتمد في هذا المستودع، وهو وحده الذي يصلح معيار قبول:

```text
git -c core.whitespace=cr-at-eol diff --check <base> <head>
```

لا يجوز علاج هذا الإنذار بتحويل الملفات إلى LF ولا بإضافة `* text=auto`، فذلك ما رفضه `ADR-0005` في بديله التاسع صراحةً.

---

## 3. القرارات المعتمدة حرفيًا

هذه نصوص مالك المشروع كما وردت. لا تُعاد صياغتها ولا تُحوَّل إلى افتراضات.

> الأصول ستُنسخ إلى parmaga للنشر.

> مستودع العهدة يبقى مصدر الأصل والإثبات، لا مسار تقديم.

> لا وصول من CI إلى مستودع العهدة الخاص.

> دور مستودع العهدة بعد النشر — مصدر يستمر التزامن معه.

> النشر الأول يقتصر على هذا الدرس.

> ابدأ بالنسخ اليدوي لهذا الدرس الواحد مع تحقق آلي صارم.

> الأتمتة تُصمَّم بعد مشاهدة الخطوة كاملة مرة واحدة على الأقل.

> GitHub Pages يبقى على Deploy from a branch.

> البوابة لا تُفعّل قبل أن تثبت صلاحيتها، والنشر لا ينتظر اكتمال البوابة.

> موافق على المرحلة 0 مع توثيق المراحل التالية كمراحل يجب أن تتابع هذه المرحلة وهكذا.

> (ج): og:image صورة موقع واحدة ثابتة.

> أعطيت الإذن: الإغلاق التوثيقي، وتصحيح نص §6، وفتح المرحلة 7

> **أوافق تماما على ماتم تنفيذه و هو الوضع الحالى قلم واحد يظهر ويختفى - هذا حقا كافى جدا** ولابد أن نغلق هذه النقطة تماما

> **تم تأكيدى لذلك ويعمل ذلك فى كل الحالات حتى أنظمة ios** ولابد أن نغلق هذه النقطة تماما

> **الـ Favicon ثابت على كامل الموقع حيث هذه هى الهوية الموحدة لكل مشاريعى وليس المشروع الحالي فقط - فاللتزام بالـ asset الموجودة ليس مجالا للمناقشة لاحقا**

> **وافقت قديما على مدة الـ ثمان ثواني ظنا منى أن النموذج المنفذ يفترض ذلك (أنها مدة من اخر تفاعل مع المستخدم للزر وهذه مدة كبيرة على ظهور أزرار كان ممكن تلخيصها لخمس ثوانى و المدة الباقية للمعالجة الداخلية - وهذا مااكتشفت عدم تواجده أثناء تعاملى مع الدرس فعليا**

> **أؤكد أن تغييرات نهايات الأسطر الخمسة غير مقصودة، وأعتمد استعادتها حرفيًا من HEAD. وأعتمد فتح المرحلة 7.2 وإصدار ADR-0013 مستقل يعدّل ADR-0012 وفق البنود الأربعة في عقد التسليم.**

> **هيا بنا تعنى الإذن يا هندسه**

> **محتاج أمر الرفع و التايتل و الوصف للـ pr**

---

## 4. سلسلة الثقة

```text
محليًا: manifest ≡ العهدة عند اللقطة المثبتة.
في CI: المنشور ≡ manifest.
بالتعدي: المنشور ≡ العهدة المثبتة.
```

القيود الملزمة:

- CI لا يصل إلى مستودع العهدة الخاص بأي حال.
- قابلية وصول لقطة العهدة تُثبت محليًا قبل تثبيتها في manifest.
- manifest لا يجوز أن يشير إلى لقطة ميتة.
- اللقطة المعتمدة حاليًا من التكليف: `6bd7b72303be65404915c85ef8e2239b6e0a7e4c`.
- المرجع الميت السابق `7f0daba…` ممنوع استخدامه في أي manifest أو وثيقة أو أمر.

---

## 5. خارطة المراحل الملزمة

خارطة المراحل توثيق لترتيب العمل، وليست إذنًا بتنفيذ أي مرحلة لم تُعتمد صراحةً.

### المرحلة 0 — إغلاق فقدان السياق

- إنشاء دفتر الأدلة.
- تعديل بروتوكولي المعماري والمنفذ.
- جعل القراءة الموجهة وعقد التسليم إلزاميين.
- لا تحتاج ADR.
- لا تنفذ أي عمل نشر أو تحقق من المحتوى.

### المرحلة 1 — ADR-0006

يقرر فقط:

- مسار نشر الأصول داخل `parmaga`.
- أداة التحقق الرسمية.
- تثبيت مستودع العهدة ولقطته داخل manifest.
- حدود النسخ من ADR-0005.
- ما يبقى من ADR-0005 دون تغيير.
- منع وصول CI إلى العهدة.
- الحفاظ على Pages بوضع Deploy from a branch.

لا يبدأ قبل إغلاق المرحلة 0 واعتماد الانتقال.

### المرحلة 2 — أداة التحقق وGate A

- تنفيذ واحد ببايثون والمكتبة القياسية فقط.
- الاستدعاء المحلي وGitHub Actions متطابق.
- لا يتكرر منطق التحقق في YAML أو heredoc.
- إزالة منطق الجرد التنفيذي المكرر من `CONTENT_INTAKE.md`.
- إنشاء workflow للتحقق فقط.
- workflow لا ينشر Pages ولا يصل إلى العهدة.
- Gate A في هذه المرحلة إشارة تحقق، وليست حماية دمج إلزامية بعد.

شرط البدء: قبول ADR-0006 — استوفي.

الحالة: أُغلقت. implementation commit هو 0de5f31، وmerge commit هو 6783a83 عبر PR #1.

### المرحلة 3 — النشر الأول

- درس واحد فقط.
- نسخ يدوي لـ22 ملف SVG.
- التحقق من `.gitattributes` وتطبيع الأسطر قبل النسخ.
- تثبيت لقطة العهدة في manifest.
- تشغيل أداة التحقق محليًا.
- فتح PR حقيقي.
- نجاح Gate A.
- الدمج والنشر من الفرع.
- لا أتمتة لنسخ الأصول في هذه المرحلة.

شرط البدء: نجاح المرحلة 2 — استوفي.

الحالة: أُغلقت. implementation commit هو c03fa8e، وmerge commit هو 48ecb87 عبر PR #2، وأبواه 6783a83 و c03fa8e.

نُفِّذ النطاق الأضيق المقرر في §9: نشر أصول الدرس والتحقق منها بأداة التحقق وGate A، دون إنشاء صفحة HTML للدرس ودون viewer. ولذلك بقي الرابط الدائم للدرس على 404، وهو سلوك متوقع في نطاق المرحلة 3 لا إخفاق.

قيد نطاق زمني — 2026-08-30: عبارة بقاء الرابط على 404 صحيحة لنطاق المرحلة 3 وحده، وهي الآن `Superseded` بوصفها حالة راهنة. أنشأت المرحلة 5 صفحة الدرس ودُمجت في cf41d264، وصار الرابط الدائم يعيد HTTP 200. الدليل مقيَّد في §8.

### المرحلة 4 — Gate B

- ينفذه المالك من واجهة GitHub.
- لا يُفعّل إلا بعد نجاح Gate A مرة واحدة على الأقل على PR حقيقي.
- يجعل check المطلوب إلزاميًا على `main`.
- لا يغيّر GitHub Pages عن Deploy from a branch.

لا تبدأ قبل إتمام النشر الأول وإثبات نجاح Gate A.

### المرحلة 7.2 — امتثال عقد العارض وبدء الحركة بإيماءة واحدة

- إصدار ADR-0013 مستقل يعدّل ADR-0012.
- إقرار القلم الواحد القائم وإغلاق انحراف §11.
- إقرار النقر الخارجي امتثالًا لمسار اللوحة الواحد.
- جعل الدخول والتشغيل طلبًا صريحًا واحدًا.
- خفض مهلة اللوحة إلى 5000ms وتعليقها أثناء التشغيل.
- اقتران بدء الحركة وتعليق المهلة إلزامي.
- تسليم القرار منفصل عن التنفيذ.
- لا HTML ولا CSS في التنفيذ المقترح.
- عقد الطباعة مجمد.
- المرحلة 8 خارج النطاق ولا تُفتح بهذا القرار.

شرط البدء: اعتماد المالك الصريح الصادر في 2026-09-03، واستعادة baseline نظيف عند 34e6571 — استوفي.

---

## 6. قواعد الانتقال بين المراحل

- الترتيب الرقمي التصاعدي للمراحل إلزامي، ولا يجوز تخطي مرحلة ولا دمج مرحلتين. وتُرقَّم المراحل الفرعية بكسر عشري تحت مرحلتها الأم فتأخذ موضعها في الترتيب نفسه. والصيغة `0 → 1 → 2 → 3 → 4` كانت خارطة زمنها لا حصرًا للمراحل، وقد تجاوزها التنفيذ إلى المرحلة 6.2 ثم المرحلة 7.
- لا توجد مرحلتان نشطتان في الوقت نفسه.
- لا يبدأ نموذج المرحلة التالية من تلقاء نفسه.
- إغلاق المرحلة لا يساوي اعتماد المرحلة التالية تلقائيًا.
- يجب أن يحدد تقرير الإغلاق: المرحلة المغلقة، وحالة القبول، والانحرافات، وHEAD الجديد، وحالة الشجرة، والمرحلة التالية الوحيدة، والاعتماد المطلوب قبل بدئها.
- إذا فشلت معايير القبول، تبقى المرحلة الحالية هي المرحلة الوحيدة المسموحة.
- الملاحظات خارج النطاق تُسجَّل تحت Deferred Observations ولا تُنفَّذ.

---

## 7. حالة المراحل

| المرحلة | الحالة | شرط البدء | شرط الإغلاق |
|---|---|---|---|
| 0 | Closed | موافقة المالك موجودة | تحقق — الملفات الثلاثة ملتزمة في acfc10e، وcommit الإغلاق e808ec1 |
| 1 | Closed | الانتقال معتمد من المالك؛ خطة المرحلة معتمدة | تحقق — ADR-0006 صادر بحالة Accepted وملتزم في f2734b5، وفهرسته في README تمت |
| 2 | Closed | قبول ADR-0006 واعتماد الانتقال — مستوفى في 2026-08-27 | تحقق — الأداة والاختبارات وworkflow التحقق ملتزمة في 0de5f31 ومدموجة في 6783a83 |
| 3 | Closed | إغلاق المرحلة 2 واعتماد الانتقال | تحقق — أصول الدرس منشورة في c03fa8e ومدموجة في 48ecb87، وGate A ناجحة على PR #2 |
| 3-Closeout | Closed | اعتماد المالك لخطة مصالحة الإغلاق | تحقق — implementation 99b0d2a، merge d40d3b8 عبر PR #3، وGate A ناجحة في run 33237283840 |
| 4 | Closed | نجاح Gate A على PR حقيقي وإغلاق المرحلة 3 — مستوفى، واعتماد المالك ببدء المرحلة صدر في 2026-08-29 | تحقق — ruleset 21795074 مفعّلة، وGate A إلزامية بوسم Required على PR #4، وnجحت في run 33246791746، وimplementation dd32b51 مدموج في 1fdbfa7 عبر PR #4، وPages بلا تغيير |
| 5 | Closed — COMPLETE WITH KNOWN LIMITATIONS | إغلاق المرحلة 4 — مستوفى، واعتماد المالك ببدء المرحلة 5 صدر في 2026-08-29 | تحقق — الملفات الستة مدموجة في cf41d264 عبر PR #6 من implementation f7e1f467، وGate A نجحت على الـPR في run 33278871310 وبعد الدمج على main في run 33278902692، والرابط الدائم يعيد HTTP 200 حيًّا، والاختبارات الـ61 وverify_lesson.py يمران على baseline الدمج. العقد البنيوي مغلق، وتبقى ديون UX معلنة في §8 لا تمنع الإغلاق ولا تُنفَّذ هنا |
| 6 | Closed | اعتماد المالك ببدء المرحلة 6 وإصدار ADR-0008 صدر في 2026-08-30 نصًّا: «أعتمد فتح المرحلة 6 — Mobile Lesson Viewer UX/UI — وإصدار ADR-0008، بتاريخ 30 أغسطس 2026» | لم يُستوفَ بعد — يشترط الإغلاق: diff محصور في الملفات الستة، وثبات بصمة الأصول الـ22 وmanifest، ونجاح الاختبارات وverify_lesson.py بعد التطبيق، ونجاح Gate A على PR وعلى push إلى main، وتحققًا يدويًا لمعايير القبول 1–37 مع تصنيف كل ما لم يُقَس `Unknown` — استوفيت الشروط ودُمجت في 398485d عبر PR #8 |
| 6.1 | Closed | رصد مخالفة جسيمة بعد دمج المرحلة 6 واعتماد المالك للإصلاح | تحقق — الإصلاح مدموج في 61a72c3 عبر PR #10 وADR-0009 في c7fb02e عبر PR #9، وGate A نجحت على main في run 33303393733، وعرض الصورة 304 من 320 مقاسًا حيًّا. وبنود الفحص اليدوي تبقى `Unknown` ولا تمنع الإغلاق |
| 6.2 / 6.2R | Closed | اعتماد المالك بتنفيذ ADR-0009 وفق عقد ADR-0010 | تحقق — الحزمة مدموجة في efade0c عبر PR #13 من رأس الفرع 9e38523 بأربعة commits هي f990782 و5e31200 وcd44530 و9e38523، وأبوا الدمج 2a2b79d و9e38523، وGate A ناجحة. V2 لم يُنفَّذ ولم يُؤذن به. وبنود Unknown تبقى مفتوحة ولا تمنع الإغلاق |
| 7 | Closed | إذن المالك الصادر في 2026-09-01 نصًّا: «أعطيت الإذن: الإغلاق التوثيقي، وتصحيح نص §6، وفتح المرحلة 7» | لم يُستوفَ بعد — يشترط الإغلاق: diff محصور في الملفات الأربعة، وصفر مساس بـSVG وmanifest وtools وtests و.github، ونجاح الاختبارات وverify_lesson.py، وdiff --check نظيفًا بـcr-at-eol، و22 ورقة بالضبط على A5 وA4 وLetter مقيسة بعدّ PDF، ونجاح Gate A على PR وعلى main — استوفي جزئيًا مع تنازل مالك صريح في 2026-09-02: تحقق — diff محصور في أربعة ملفات هي README.md وassets/css/parmaga.css والدفتر وADR-0011، وصفر مساس بـSVG وmanifest وtools وtests و.github، وdiff --check صفر بـcr-at-eol، و61 اختبارًا OK وverify_lesson.py يعطي RESULT: PASS (0 errors)، والتنفيذ b845bae مدموج في 1ca43c1 عبر PR #14 بmerge commit حقيقي بأبوين، وبصمة شجرة الدمج مطابقة لبصمة شجرة التنفيذ، وGate A ناجحة على رأس الـPR في run 33467915910 وعلى main في run 33467942178. ولم يُستوفَ شرط «22 ورقة بالضبط على A5 وA4 وLetter مقيسة بعدّ PDF»: تنازل المالك عنه صريحًا وقبل الإغلاق على أساس مشاهدة بصرية بلا إنشاء PDF، والأعداد مصنَّفة Reported / owner-accepted — not Confirmed by retained PDF measurement. ونص الشرط الأصلي يبقى مقروءًا في هذا الصف ولا يُحذف |
| 7.1 | Closed | إذن المالك الصادر في 2026-09-02 بإصدار ADR للمرحلة 7.1 بعد دمج مصالحة المرحلة 7 ونجاح Gate A على main عند f1ca028، وقراره نصًّا في مسألة الترقيم: «يأخذ Phase 7.1 الرقم 0012، ويُصحَّح سطر §2 ليزيل الحجز البائت دون أن يحجز رقمًا بديلًا للمرحلة 8» | لم يُستوفَ بعد — يشترط إغلاق تسليم القرار: diff محصور في ADR-0012 وREADME.md والدفتر، وصفر Production Code، وصفر مساس بـindex.html وassets وtools وtests و.github وADR-0011 و@media print، ونجاح الاختبارات وverify_lesson.py، وdiff --check نظيفًا بـcr-at-eol، ونجاح Gate A على PR وعلى main. ويشترط إغلاق المرحلة كلها تنفيذًا لاحقًا بإذن مالك مستقل بعد دمج القرار — استوفي الشرطان في 2026-09-03: تحقق — تسليم القرار دُمج في fe9f9cf عبر PR #16 بثلاثة ملفات، وأُذن بالتنفيذ فنُفِّذ في e640f1a مقصورًا على خمسة ملفات بإحصاء 957 إضافة و192 حذفًا، ودُمج في f9df9df عبر PR #17 بmerge commit حقيقي بأبوين، وبصمة شجرة الدمج مطابقة لبصمة شجرة التنفيذ عند 1388fe1c، وصفر مساس بـassets/lessons و.github وtools وdocs/decisions، وبصمة كتلة الطباعة ثابتة على f8bf32aa بـ98 سطرًا، وCRLF 100% في الملفات الخمسة، وdiff --check صفر بـcr-at-eol، و124 اختبارًا OK وverify_lesson.py يعطي RESULT: PASS (0 errors)، وGate A ناجحة على رأس الـPR في run 33613351199 وعلى main في run 33613399178. وانحرافا ADR-0012 §11 والنقر الخارجي قائمان بلا تسوية ولا يمنعان الإغلاق، وبنود Unknown تبقى مفتوحة. ونص الشرط الأصلي يبقى مقروءًا في هذا الصف ولا يُحذف |
| 7.2 | Closed | اعتماد المالك الصادر في 2026-09-03 نصًّا: «أعتمد فتح المرحلة 7.2 وإصدار ADR-0013 مستقل يعدّل ADR-0012 وفق البنود الأربعة في عقد التسليم»، وbaseline نظيف عند 34e6571 | يشترط إغلاق تسليم القرار: diff محصور في ADR-0013 وREADME.md والدفتر، وصفر Production Code وصفر مساس بـindex.html وassets وtools وtests و.github وADR-0011 و@media print و@page، ونجاح 124 اختبارًا وverify_lesson.py، وdiff --check نظيفًا بـcr-at-eol، وثبات بصمة الطباعة، ونجاح Gate A على PR وعلى main. ولا يبدأ التنفيذ إلا بإذن مالك مستقل بعد دمج القرار وإعطاء baseline جديد — استوفي الشرطان في 2026-09-04: تحقق — تسليم القرار دُمج في 4f7e8c3 عبر PR #19 بثلاثة ملفات، ثم صدر إذن مالك مستقل بالتنفيذ وbaseline عند 4f7e8c3، فنُفِّذ في 01f3d6a للكود والاختبارات و70f3453 للدفتر، ودُمجا في 0f6cb3c عبر PR #20 بmerge commit حقيقي بأبوين 4f7e8c3 و70f3453، بثلاثة ملفات لا رابع لها بإحصاء 228 إضافة و19 حذفًا، وصفر مساس بـindex.html وCSS وSVG وmanifest وtools و.github وdocs/decisions، وبصمة كتلة الطباعة ثابتة على f8bf32aa بـ98 سطرًا، وw/crlf محفوظ، وdiff --check صفر بـcr-at-eol، و139 اختبارًا OK وverify_lesson.py يعطي RESULT: PASS (0 errors) على baseline الدمج، وGate A ناجحة على رأس الـPR في run 33897875834 وعلى main في run 33897910289. وانحرافا ADR-0012 D3 وD4 أُغلقا نصًّا بترقية المرجع إلى ADR-0013 §2 و§3. وبنود V2 المتصفحية تبقى Unknown ولا تمنع الإغلاق. ونص الشرط الأصلي يبقى مقروءًا في هذا الصف ولا يُحذف |

أُغلقت المرحلة 1 بـcommit فعلي هو f2734b5، وقُيِّد SHA في §2 و§8.

الفقرة التي كانت هنا قبل 2026-08-29 نصّت على أن المرحلة 2 لم تبدأ ولم يُنشأ لها شيء. كانت صحيحة في تاريخها، وهي الآن `Superseded`: نُفِّذت المرحلة 2 ودُمجت، ثم نُفِّذت المرحلة 3 ودُمجت. لا يُحذف النص التاريخي، بل يُقيَّد إبطاله هنا وفي §8.

الفقرة التي كانت هنا قبل 2026-08-29 نصّت على أن المرحلة 4 لم تبدأ وأن Gate B غير مفعّلة لغياب أي Ruleset. كانت صحيحة في تاريخها، وهي الآن `Superseded`: صدر اعتماد المالك ببدء المرحلة 4، وأُنشئت Branch Ruleset واحدة هي 21795074 باسم «Gate B - Main lesson verification» بحالة Active تستهدف refs/heads/main وحده، وفحصها المطلوب الوحيد «Gate A - Lesson verification». لا يُحذف النص التاريخي، بل يُقيَّد إبطاله هنا وفي §8.

اكتمل شرط الإغلاق المذكور أعلاه فعليًا: فُتح PR #4 من الفرع phase-4-gate-b إلى main حاملًا تعديل الدفتر وحده، وظهر فحص «Gate A - Lesson verification» فيه موسومًا Required بفعل ruleset 21795074، ثم نجح في run 33246791746، ثم صار الـPR Ready to merge ودُمج بmerge commit حقيقي هو 1fdbfa7 بأبويه c29a6b1 وdd32b51. فحالة المرحلة 4 هي `Closed`. وتبقى حماية الفرع التقليدية غائبة عمدًا، فلا حماية موازية.

قيد أمانة على دليل الحجب: ثبت بالمعاينة أن الـPR فُتح بحالة `Checks pending` وعدّاد Checks صفر، وثبت وسم Required على الفحص، وثبت من الـAPI أن الفحص بدأ 10:00:28Z وانتهى 10:00:37Z. ولم تُلتقط صورة لصندوق الدمج وهو محجوب بالنص الصريح، لقصر مدة الفحص. فالحجب أثناء pending `Inferred` من مجموع هذه القرائن لا `Confirmed` بمشاهدة مباشرة، ولم يُعطَّل أي workflow لصناعة الحالة.

اكتمل شرط إغلاق المرحلة 5 فعليًا: نُفِّذت الملفات الستة في f7e1f467 فوق 8324aa08، وفُتح PR #6 «feat(lesson): publish lesson-01 static page with progressive viewer (ADR-0007)»، ونجحت Gate A عليه في run 33278871310، ثم دُمج بmerge commit حقيقي cf41d264 بأبويه 8324aa08 وf7e1f467 — لا squash ولا rebase — ونجحت Gate A بعد الدمج على main في run 33278902692. فحالة المرحلة 5 هي `Closed` بالوصف `COMPLETE WITH KNOWN LIMITATIONS`.

قيد على معنى الإغلاق: الإغلاق يشهد لعقد المرحلة البنيوي وحده — صفحة درس ثابتة على المسار الدائم بمراسٍ ونص كامل بلا JavaScript، وعارض متدرج اختياري. ولا يشهد لجودة تجربة الاستخدام. ديون UX الست مقيَّدة في §8 بحالاتها الصحيحة، ولم يُنفَّذ منها شيء في هذه المصالحة، ولا تفتح أي منها مرحلة تلقائيًا.

---

## 8. سجل الأدلة

حالات الحقيقة: `Confirmed` أُثبتت بأمر فعلي في هذا المستودع، و`Needs Verification` وردت من مصدر لم يُتحقق منه بأمر، و`Superseded` أُبطلت بدليل أحدث.

| التاريخ UTC | المرحلة | HEAD | الشجرة | المصدر | السطور | الأمر المنفذ حرفيًا | الحقيقة | الحالة |
|---|---|---|---|---|---|---|---|---|
| 2026-08-26 | 0 | fb5e090 | clean | مستودع parmaga | — | `git status --short --branch` | الفرع main متزامن مع origin/main ولا توجد تغييرات غير ملتزمة | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | مستودع parmaga | — | `git rev-parse HEAD` | HEAD = fb5e09034b1a852d9cc6e3eaeb0d17fc8efa6cc2 | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | مستودع parmaga | — | `git branch --show-current` | الفرع الحالي main | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | AI_EXECUTOR_PROTOCOL.md | عدّ فقط | `git show HEAD:AI_EXECUTOR_PROTOCOL.md \| wc -l` | الملف 832 سطرًا، يتجاوز حد 120 فتلزمه القراءة بالنطاقات | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | AI_ARCHITECT_PROTOCOL.md | عدّ فقط | `git show HEAD:AI_ARCHITECT_PROTOCOL.md \| wc -l` | الملف 756 سطرًا، يتجاوز حد 120 فتلزمه القراءة بالنطاقات | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | AI_EXECUTOR_PROTOCOL.md | العناوين | `git show HEAD:AI_EXECUTOR_PROTOCOL.md \| grep -n '^#\|^##\|^###'` | 25 قسمًا مرقّمًا، آخرها «العبارة الحاكمة» عند السطر 830 | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | AI_ARCHITECT_PROTOCOL.md | العناوين | `git show HEAD:AI_ARCHITECT_PROTOCOL.md \| grep -n '^#\|^##\|^###'` | 19 قسمًا مرقّمًا، آخرها «عبارة الدور الحاكمة» عند السطر 754 | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | docs/ | — | `ls -a docs` | docs يحتوي content و decisions فقط، ولا وجود لـdocs/ai قبل هذه المرحلة | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | AI_EXECUTOR_PROTOCOL.md | 246–310 | `git show HEAD:AI_EXECUTOR_PROTOCOL.md \| awk 'NR>=246 && NR<=310'` | تعديل الملفات الموجودة يكون بـFIND/REPLACE حرفي وفريد، ويُرتَّب من الأعلى إلى الأسفل | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | AI_EXECUTOR_PROTOCOL.md | 311–339 | `git show HEAD:AI_EXECUTOR_PROTOCOL.md \| awk 'NR>=311 && NR<=339'` | الملفات الجديدة تُقدَّم بمحتوى كامل بلا اختصار أو `...` | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | AI_EXECUTOR_PROTOCOL.md | 810–832 | `git show HEAD:AI_EXECUTOR_PROTOCOL.md \| awk 'NR>=810 && NR<=832'` | القسم 25 هو خاتمة الملف، فيصلح مرساةً فريدة للإلحاق | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | AI_ARCHITECT_PROTOCOL.md | 735–756 | `git show HEAD:AI_ARCHITECT_PROTOCOL.md \| awk 'NR>=735 && NR<=756'` | القسم 19 هو خاتمة الملف، فيصلح مرساةً فريدة للإلحاق | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | AI_ARCHITECT_PROTOCOL.md | 80–116 | `git show HEAD:AI_ARCHITECT_PROTOCOL.md \| awk 'NR>=80 && NR<=116'` | القسم 4 يحدد ترتيب القراءة الأولى ولم يكن يذكر دفتر الأدلة | Confirmed |
| 2026-08-26 | 0 | fb5e090 | clean | ADR-0004 و ADR-0005 | نص كامل | لا أمر — نص ملصق في المحادثة | مسار manifest، وسلسلة الثقة الثلاثية، و22 أصل SVG بنهايات CRLF، وخصوصية parmaga-content | Needs Verification |
| 2026-08-26 | 0 | fb5e090 | dirty | مستودع parmaga | — | `git status --short` | ثلاثة مسارات فقط: تعديل البروتوكولين وإضافة docs/ai — لا ملف رابع | Confirmed |
| 2026-08-26 | 0 | acfc10e | clean | مستودع parmaga | — | `git commit -m "الحالية: 0 — إغلاق فقدان السياق"` | 3 files changed, 325 insertions(+), 1 deletion(-) — الحذف الوحيد سطر «ابدأ بمحاولة قراءة:» المستبدل في القسم 4 | Confirmed |
| 2026-08-26 | 0 | acfc10e | clean | origin/main | — | `git push origin main` | fb5e090..acfc10e main -> main — الدفع نجح دون force | Confirmed |
| 2026-08-26 | 0 | acfc10e | dirty | خمسة ملفات نصية | عدّ فقط | `grep -c ""` مقابل `grep -c $'\r$'` | المستودع CRLF بنسبة 100%: البروتوكولان 803 و873، والدفتر 236، وREADME 116، وADR-0005 336 | Confirmed |
| 2026-08-26 | 0 | acfc10e | dirty | إعداد git | — | `git config --get core.autocrlf` و `--get core.whitespace` | كلاهما unset على جهاز العمل | Confirmed |
| 2026-08-26 | 0 | acfc10e | dirty | فرق fb5e090..acfc10e | — | `git -c core.whitespace=cr-at-eol diff --check fb5e090 acfc10e \| wc -l` | صفر — لا مسافة زائدة حقيقية؛ الـ650 تحذيرًا الافتراضية كلها CR في نهاية السطر | Confirmed |
| 2026-08-26 | 0 | acfc10e | dirty | فرق fb5e090..acfc10e | — | `git diff --name-only fb5e090 acfc10e` | ثلاثة ملفات فقط لا رابع لها — النطاق محصور | Confirmed |
| 2026-08-26 | 0 | acfc10e | dirty | البروتوكولان | — | `git grep -c "ARCHITECT_EVIDENCE_LEDGER"` | إحالتان في المعماري وواحدة في التنفيذي | Confirmed |
| 2026-08-26 | 0 | acfc10e | dirty | docs/decisions و README.md | 57–61، 110–114 | `ls docs/decisions` و `grep -n "ADR-000" README.md` | نمط التسمية `ADR-000N-<slug>.md`، وREADME يفهرس القرارات في موضعين فيلزم تحديثه مع أي ADR جديد | Confirmed |
| 2026-08-26 | 0 | acfc10e | dirty | ADR-0005 | العناوين | `git show HEAD:docs/decisions/ADR-0005-content-intake-and-asset-custody.md \| grep -n '^## \|^### '` | موضعا الإحلال: السطر 100 مخطط الـmanifest الإصدار 1، والسطر 268 رفض السكريبت الملتزم | Confirmed |
| 2026-08-26 | 0 | acfc10e | dirty | ../parmaga-content | — | `git -C ../parmaga-content log -1 --format=%H` | 6bd7b72303be65404915c85ef8e2239b6e0a7e4c — اللقطة المعتمدة حيّة ومطابقة، فاستوفي شرط §4 | Confirmed |
| 2026-08-26 | 0 | acfc10e | dirty | مستودع parmaga | — | `git ls-files \| grep -E '\.(py\|yml\|yaml\|svg)$'` | none — لا أداة ولا workflow ولا أصل، أرضية المرحلة 2 نظيفة | Confirmed |
| 2026-08-27 | 0 — مُرحَّل | e808ec1 | clean | مستودع parmaga | — | `git rev-parse HEAD` | commit إغلاق المرحلة 0 هو e808ec155ced11e08dd21cf1eaf740cbce189416؛ الصف مُرحَّل لأن §2 قيّدت commit المحتوى acfc10e ولم تقيّد SHA الإغلاق | Confirmed |
| 2026-08-27 | 1 | e808ec1 | clean | مستودع parmaga | — | `git status --short --branch` | main متزامن مع origin/main بلا تغييرات غير ملتزمة — baseline المرحلة 1 مطابق للمتوقع | Confirmed |
| 2026-08-27 | 1 | e808ec1 | clean | مستودع parmaga | — | `git status --porcelain` | مخرج فارغ — الشجرة نظيفة قبل أي تعديل في هذه المرحلة | Confirmed |
| 2026-08-27 | 1 | e808ec1 | clean | docs/ai/ARCHITECT_EVIDENCE_LEDGER.md | 1–266 | `grep -n "" docs/ai/ARCHITECT_EVIDENCE_LEDGER.md` | الدفتر 266 سطرًا بعشرة أقسام؛ جدول §8 ينتهي عند صف 2026-08-26 الخاص بـls-files، و§10 نشط عند المرحلة 0 | Confirmed |
| 2026-08-27 | 1 | e808ec1 | clean | ثلاثة ملفات نصية | عدّ فقط | `grep -c ""` مقابل `grep -c $'\r$'` | CRLF 100%: الدفتر 266/266، وREADME 116/116، وADR-0005 336/336 — عرف §2 مؤكَّد مجددًا | Confirmed |
| 2026-08-27 | 1 | e808ec1 | clean | README.md | 50–70، 104–120 | `grep -n "" README.md \| sed -n '50,70p'` و `sed -n '104,120p'` | موضعا الفهرسة: شجرة تنتهي عند السطر 61 بمحرف `└──` قبل ADR-0005، وقائمة وصفية تنتهي عند السطر 114 | Confirmed |
| 2026-08-27 | 1 | e808ec1 | clean | ADR-0005 | 100–135 | `grep -n "" docs/decisions/ADR-0005-content-intake-and-asset-custody.md \| sed -n '92,145p'` | `Decision §7` يثبّت schemaVersion = 1 ويعدّد حقول الدرس والصفحة، فالإحلال يقتصر على رقم الإصدار وإضافة حقلين | Confirmed |
| 2026-08-27 | 1 | e808ec1 | clean | ADR-0005 | 268–270 | `grep -n "" docs/decisions/ADR-0005-content-intake-and-asset-custody.md \| sed -n '258,280p'` | `Alternatives §7` رفض السكريبت المُلتزَم بحجة صفر Dependencies وصفر Build Step وصفر CI، ونصّ على جواز إعادة النظر بقرار مستقل | Confirmed |
| 2026-08-27 | 1 | e808ec1 | clean | docs/decisions/ | — | `ls -1 docs/decisions/` | خمسة قرارات، آخرها ADR-0005؛ مسار ADR-0006-asset-publication-and-verification.md شاغر | Confirmed |
| 2026-08-27 | 1 | e808ec1 | dirty | حزمة المرحلة 1 | — | `git status --porcelain` و `git -c core.whitespace=cr-at-eol diff --check` | ثلاثة مسارات فقط: ADR-0006 الجديد وREADME.md والدفتر — لا ملف .py أو .yml أو .yaml أو .svg، ولا مسافة زائدة حقيقية | Confirmed |
| 2026-08-27 | 1 | e808ec1 | dirty | حزمة المرحلة 1 | عدّ فقط | `grep -c ""` مقابل `grep -c $'\r$'` و `grep -n "^### [1-7]\."` | ADR-0006 بـ212 سطرًا CRLF 100%، وحالته Accepted، وبنوده السبعة عند 25 و41 و70 و87 و96 و110 و118؛ وREADME 118/118، والدفتر 282/282 كما قيس قبل تحويل هذا الصف إلى Confirmed | Confirmed |
| 2026-08-27 | 1 | f2734b5 | clean | مستودع parmaga | — | `git -c core.whitespace=cr-at-eol diff --cached --check` و `git diff --cached --name-only` | لا مسافة زائدة حقيقية، وثلاثة مسارات لا رابع لها قبل الالتزام | Confirmed |
| 2026-08-27 | 1 | f2734b5 | clean | مستودع parmaga | — | `git commit -m "الحالية: 1 — ADR-0006"` | 3 files changed, 251 insertions(+), 20 deletions(-) — ADR-0006 بوضع create mode 100644، والحذوف كلها أسطر مستبدَلة في §2 و§7 و§8 و§10 | Confirmed |
| 2026-08-27 | 1 | f2734b5 | clean | مستودع parmaga | — | `git rev-parse HEAD` و `git status --short --branch` | commit إغلاق المرحلة 1 هو f2734b551cecf31c8431bfbcc1d6038e343103ae، والشجرة نظيفة والفرع ahead 1 قبل الدفع | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | مستودع parmaga | — | `git rev-parse HEAD` و `git rev-parse origin/main` | HEAD = origin/main = 48ecb877d16252eeb2b864ed396b7270d49aca5b — baseline المصالحة مطابق للمتوقع | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | مستودع parmaga | — | `git rev-list --parents -n 1 HEAD` | أبوا merge المرحلة 3 هما 6783a8373b4fafe59d8b1706bede3c5c5e9990b3 و c03fa8e8b893da1d711b01bb64517d96e0c0e503 | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | مستودع parmaga | — | `git status --porcelain=v1 --untracked-files=all` و `find . -path ./.git -prune -o \( -name '__pycache__' -o -name '*.pyc' \) -print` | مخرجان فارغان — الشجرة نظيفة تمامًا ولا توجد مخلفات بايثون قبل التنفيذ | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | مستودع parmaga | — | `git rev-parse 0de5f31` | implementation commit للمرحلة 2 هو 0de5f31127bff85fa6fab1fdecda10b7f0c15382، ومerge commit لها 6783a83 عبر PR #1 | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | dirty | tests/ | — | `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_*.py'` | Ran 61 tests — OK، ولم تُكتب أي bytecode في الشجرة | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | dirty | tools/verify_lesson.py | — | `PYTHONDONTWRITEBYTECODE=1 python3 tools/verify_lesson.py .` | Publication candidates: 1 — المرشح programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01 — RESULT: PASS (0 errors) | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | assets/lessons | — | `find assets/lessons -type f -name '*.svg' \| wc -l` و `find assets/lessons -type l \| wc -l` و `find … -printf '%s\n' \| awk` | جرد النشر: 22 ملف SVG، و0 symlinks، ومجموع 245304 بايت | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | manifest الدرس 01 | 1–20 | `grep -n -E '"(schemaVersion\|status\|declaredPageCount\|custodyRepository\|custodySnapshot)"'` | schemaVersion = 2، status = published، declaredPageCount = 22، custodyRepository = parmaga-content، custodySnapshot = 6bd7b72303be65404915c85ef8e2239b6e0a7e4c | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | GitHub Actions API | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs?head_sha=c03fa8e…` | Gate A على PR #2: run 33053914907، workflow «Verify lessons»، event pull_request، status completed، conclusion success | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | GitHub Actions API | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs/33053914907/jobs` | الوظيفة «Gate A - Lesson verification» success على ubuntu-24.04، وخطوة «Run the verification tool test suite» success، وخطوة «Verify published lessons» success | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | GitHub Actions API | — | `GET …/actions/runs?head_sha=48ecb877…` | run ما بعد الدمج 33054434898 على main، event push، conclusion success — التحقق ناجح على الفرع الرئيسي أيضًا | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | النشر الحي | — | `GET https://parmaga.com/assets/lessons/…/lesson-01/page-001.svg` مقابل `wc -c` و `gzip -c \| wc -c` و `sha256sum` | الأصل يُقدَّم حيًّا بنوع image/svg+xml وContent-Length 3931 وهو الجسم المضغوط؛ المحلي 15489 بايت خامًا و3883 بايت مضغوطًا وبصمته e0fc2dc9b44a042212137ef761181a0f236f92b3976091ed77e5caa5d51171f8 — الفارق ضغط نقل لا اختلاف محتوى | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | النشر الحي | — | `GET https://parmaga.com/courses/programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01/` | HTTP 404 مع صفحة 404 الرسمية للمشروع — `expected-404`: الأصول منشورة وصفحة الدرس غير منشأة عمدًا، فالسلوك صحيح لا إخفاق | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | clean | إعدادات GitHub | — | معاينة المالك لواجهة المستودع | لا توجد Rulesets ولا حماية فرع تقليدية على main، وGitHub Pages على Deploy from a branch من main و/(root) — فGate B غير مفعّلة | Reported |
| 2026-08-29 | 3-Closeout | 48ecb87 | dirty | الملفات الأربعة | عدّ فقط | `grep -c ""` مقابل `grep -c $'\r$'` | بعد التعديل: المعماري 854/854، والمنفّذ 917/917، وREADME 166/166، والدفتر 313/313 — CRLF 100% محفوظ وعرف §2 قائم | Confirmed |
| 2026-08-29 | 3-Closeout | 48ecb87 | — | صف 2026-08-26 الخاص بـ`git ls-files` | — | مقارنة بالحالة الراهنة | «none — لا أداة ولا workflow ولا أصل» كان صحيحًا في تاريخه، وأبطله تنفيذ المرحلتين 2 و3: الأداة والworkflow و22 أصلًا موجودة الآن | Superseded |
| 2026-08-29 | 4 | c29a6b1 | clean | مستودع parmaga | — | `git branch --show-current` و `git rev-parse HEAD` و `git rev-parse origin/main` و `git branch --list` و `git status --short --branch` | baseline المرحلة 4: الفرع main، وHEAD = c29a6b1ab2559d36438e1be96e200c56182e066c مطابق لـorigin/main، والفرع المحلي الوحيد main، والشجرة clean | Confirmed |
| 2026-08-29 | 4 | c29a6b1 | clean | GitHub API | — | `GET /repos/amr-abd-elsalam/parmaga/branches/main` قبل التفعيل | protected = false، وprotection.enabled = false، وrequired_status_checks.enforcement_level = "off" بقائمتي contexts وchecks فارغتين — لا classic protection. وorigin/main = c29a6b1ab2559d36438e1be96e200c56182e066c وأبوه d40d3b842143e607a06c71bd8c6dbd25677ab74b | Confirmed |
| 2026-08-29 | 4 | c29a6b1 | clean | إعدادات GitHub | — | معاينة المالك قبل التفعيل: Settings ← Rules ← Rulesets، وSettings ← Branches، وSettings ← Pages | «You haven't created any rulesets»، و«Classic branch protections have not been configured»، وPages على Deploy from a branch من main و/(root) بنطاق parmaga.com وEnforce HTTPS مفعّل | Reported |
| 2026-08-29 | 4 | c29a6b1 | clean | GitHub Rulesets API | — | `GET /repos/amr-abd-elsalam/parmaga/rulesets` | قاعدة واحدة لا غير: id 21795074، الاسم «Gate B - Main lesson verification»، target = branch، source_type = Repository، enforcement = active، created_at = 2026-08-29T09:41:01.637Z | Confirmed |
| 2026-08-29 | 4 | c29a6b1 | clean | GitHub Rulesets API | — | `GET /repos/amr-abd-elsalam/parmaga/rulesets/21795074` | conditions.ref_name.include = refs/heads/main وexclude فارغة؛ وقاعدة واحدة فقط من نوع required_status_checks؛ وstrict_required_status_checks_policy = false؛ وdo_not_enforce_on_create = false؛ والفحص المطلوب الوحيد context = «Gate A - Lesson verification» بـintegration_id 15368 أي GitHub Actions | Confirmed |
| 2026-08-29 | 4 | c29a6b1 | clean | GitHub Rulesets API ومعاينة المالك | — | فحص حقل bypass_actors في مخرج القاعدة، ومعاينة كتلة Bypass list قبل الحفظ وبعده | لا standing bypass: الحقل غائب من استجابة الـAPI، والواجهة تعرض «Bypass list is empty» بلا أي actor | Confirmed |
| 2026-08-29 | 4 | c29a6b1 | clean | إعدادات GitHub | — | معاينة المالك بعد الحفظ: Settings ← Rules ← Rulesets، وSettings ← Branches، وSettings ← Pages | القائمة تعرض «Gate B - Main lesson verification» وحدها بحالة Active و«1 branch rule • targeting 1 branch»؛ وBranches ما زالت «Classic branch protections have not been configured» فلا حماية موازية؛ وPages ما زالت Deploy from a branch من main و/(root) بلا أي تغيير | Reported |
| 2026-08-29 | 4 | c29a6b1 | clean | GitHub API | — | `GET /repos/amr-abd-elsalam/parmaga/branches/main/protection` | الاستجابة 401 Requires authentication بلا مصادقة — النداء لا يثبت شيئًا في أي اتجاه، وإثبات غياب الحماية التقليدية مصدره معاينة الواجهة وحدها | Confirmed |
| 2026-08-29 | 4 | c29a6b1 | clean | مستودع parmaga | — | `git branch --list` | عبارة Deferred Observations عن بقاء الفرع المحلي phase-2-verification-gate-a عند 0de5f31 لم تعد صحيحة: المخرج `* main` وحده، فالفرع لم يعد موجودًا محليًا | Superseded |
| 2026-08-29 | 4 | c29a6b1 | clean | صف 2026-08-29 المؤرَّخ بحالة Reported عن إعدادات GitHub | — | مقارنة بالحالة الراهنة | «لا توجد Rulesets ولا حماية فرع تقليدية على main فGate B غير مفعّلة» كان صحيحًا في تاريخه، وأبطله تفعيل ruleset 21795074: Gate B مفعّلة الآن، وتبقى حماية الفرع التقليدية غائبة وPages بلا تغيير | Superseded |
| 2026-08-29 | 4 | dd32b51 | dirty ثم clean | مستودع parmaga | — | `git checkout -b phase-4-gate-b` و `git status --short` و `git diff --name-only` | الملف المتغير الوحيد docs/ai/ARCHITECT_EVIDENCE_LEDGER.md، ولا مسار ثانٍ | Confirmed |
| 2026-08-29 | 4 | dd32b51 | clean | مستودع parmaga | — | `git commit` و `git show --stat --oneline HEAD` | implementation commit للمرحلة 4 هو dd32b51828f521984cc6be98d918a15240afe7ef بإحصاء 1 file changed, 30 insertions(+), 13 deletions(-) — لا commit فارغ | Confirmed |
| 2026-08-29 | 4 | dd32b51 | clean | docs/ai/ARCHITECT_EVIDENCE_LEDGER.md | عدّ فقط | `grep -c ""` مقابل `grep -c $'\r$'` | 360 مقابل 360 — CRLF 100% محفوظ بعد التعديل، وعرف §2 قائم | Confirmed |
| 2026-08-29 | 4 | dd32b51 | clean | فرق c29a6b1..dd32b51 | — | `git -c core.whitespace=cr-at-eol diff --check c29a6b1 dd32b51` | مخرج فارغ تمامًا — أمر الفحص المعتمد في §2 اجتاز بلا أي إنذار | Confirmed |
| 2026-08-29 | 4 | dd32b51 | clean | GitHub Actions API | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs?head_sha=dd32b51…` | Gate A على PR #4: run 33246791746، workflow «Verify lessons»، event pull_request، base main عند c29a6b1، status completed، conclusion success | Confirmed |
| 2026-08-29 | 4 | dd32b51 | clean | GitHub Actions API | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs/33246791746/jobs` | الوظيفة 99085544316 باسم «Gate A - Lesson verification» success على ubuntu-24.04، وخطوتا «Run the verification tool test suite» و«Verify published lessons» success، من 10:00:31Z إلى 10:00:37Z | Confirmed |
| 2026-08-29 | 4 | dd32b51 | clean | واجهة PR #4 | — | معاينة المالك لصندوق الدمج | الفحص «Verify lessons / Gate A - Lesson verification (pull_request)» يظهر موسومًا Required — الإلزام نافذ بفعل ruleset 21795074 لا بإعداد آخر | Reported |
| 2026-08-29 | 4 | dd32b51 | clean | واجهة PR #4 | — | معاينة المالك عند الفتح وبعد النجاح | عند الفتح: شارة «Checks pending» وعدّاد Checks صفر وزر الدمج غير مفعّل. وبعد النجاح: «All checks have passed — 1 successful check» و«No conflicts with base branch» وشارة «Ready to merge» وزر الدمج مفعّل | Reported |
| 2026-08-29 | 4 | dd32b51 | clean | واجهة PR #4 | — | محاولة التقاط صندوق الدمج أثناء pending | لم تُلتقط صورة للحجب بالنص الصريح لقصر مدة الفحص (‏6 ثوانٍ)؛ الحجب مستنتَج من شارة Checks pending ووسم Required لا مشاهَد مباشرة، ولم يُعطَّل أي workflow لصناعة الحالة | Inferred |
| 2026-08-29 | 4 | 1fdbfa7 | clean | GitHub API | — | `GET /repos/amr-abd-elsalam/parmaga/pulls/4` | PR #4 «docs: activate Gate B ruleset and record phase 4 evidence»: merged = true، merged_by = amr-abd-elsalam، commits = 1، changed_files = 1، additions = 30، deletions = 13 | Confirmed |
| 2026-08-29 | 4 | 1fdbfa7 | clean | مستودع parmaga | — | `git pull --ff-only origin main` و `git rev-parse HEAD` و `git rev-parse origin/main` و `git status --short --branch` | التحديث fast-forward من c29a6b1 إلى 1fdbfa7 بلا دمج محلي، وHEAD = 1fdbfa791de9df2f18480c12fadb573a2d2400be مطابق لـorigin/main، والشجرة clean | Confirmed |
| 2026-08-29 | 4 | 1fdbfa7 | clean | مستودع parmaga | — | `git rev-list --parents -n 1 HEAD` و `git log --oneline -3` و `git diff --stat c29a6b1 HEAD` | merge commit حقيقي 1fdbfa7 بأبوين c29a6b1ab2559d36438e1be96e200c56182e066c و dd32b51828f521984cc6be98d918a15240afe7ef — لا squash ولا rebase؛ والفرق عن baseline مسار واحد فقط هو دفتر الأدلة | Confirmed |
| 2026-08-29 | 4 | 1fdbfa7 | clean | GitHub Actions API | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs?head_sha=1fdbfa79…` | بعد الدمج على main: run 33248659193، workflow «Verify lessons»، event push، conclusion success — التحقق ناجح على الفرع الرئيسي أيضًا | Confirmed |
| 2026-08-29 | 4 | 1fdbfa7 | clean | GitHub Checks API ومعاينة المالك | — | `GET /repos/.../commits/1fdbfa79…/check-runs` ومعاينة Settings ← Pages بعد الدمج | Pages ثابتة: Deploy from a branch من main و/(root) والموقع حي على parmaga.com؛ وفحوص build وdeploy وreport-build-status نجحت في run 33248658930 ببيئة github-pages وdeployment 6154928824 — وهي ليست required فالنشر مستقل عن بوابة الدمج | Confirmed |
| 2026-08-29 | 4 | 1fdbfa7 | clean | إعدادات GitHub | — | معاينة المالك بعد الدمج | لا حماية فرع تقليدية، وruleset 21795074 وحدها Active، ولا bypass — الحالة النهائية مطابقة للتصميم المعتمد | Reported |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | مستودع parmaga | — | `git branch --show-current` و `git rev-parse HEAD` و `git rev-parse origin/main` و `git status --short --untracked-files=all` و `git ls-remote origin refs/heads/main` | baseline المصالحة: الفرع main، وHEAD = cf41d264216cc952c0ee41770274757a284a0ccc مطابق لـorigin/main محليًا وعلى الريموت، ومخرج الحالة فارغ تمامًا بما فيه الملفات غير المتعقَّبة | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | مستودع parmaga | — | `git rev-list --parents -n 1 HEAD` | merge commit حقيقي cf41d264 بأبوين 8324aa083993294095e69f7662713e42a5f85e8e و f7e1f4672541a7d060ef7a377191ec8e063ca730 — لا squash ولا rebase | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | مستودع parmaga | — | `git log -1 --format=%H%n%P%n%an%n%aI%n%s f7e1f467…` | implementation commit للمرحلة 5 هو f7e1f4672541a7d060ef7a377191ec8e063ca730، أبوه الأول 8324aa08 وهو نفسه الأب الأول للدمج، بتاريخ 2026-08-30T01:14:47+03:00 من amr-abd-elsalam | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | مستودع parmaga | — | `git diff --name-only 8324aa08 f7e1f467` و `git diff --stat 8324aa08 f7e1f467` | فرق المرحلة 5 محصور في ستة ملفات لا سابع لها: README.md و assets/css/parmaga.css و assets/js/lesson-viewer.js و courses/programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01/index.html و docs/ai/ARCHITECT_EVIDENCE_LEDGER.md و docs/decisions/ADR-0007-lesson-page-and-progressive-viewer.md، بإحصاء 2083 insertions(+) و 22 deletions(-) | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | GitHub API | — | `GET /repos/amr-abd-elsalam/parmaga/pulls/6` | PR #6 «feat(lesson): publish lesson-01 static page with progressive viewer (ADR-0007)»: state closed، merged = true، merged_by = amr-abd-elsalam، merged_at = 2026-08-29T22:33:58Z، merge_commit_sha = cf41d264216cc952c0ee41770274757a284a0ccc، commits = 1، changed_files = 6، additions = 2083، deletions = 22 — مطابق حرفيًا للإحصاء المحلي فتطابق مصدران مستقلان | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | GitHub Actions API | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs?head_sha=f7e1f467…` | Gate A على PR #6: run 33278871310، workflow «Verify lessons» بمسار .github/workflows/verify-lessons.yml، event pull_request، head_branch phase-5-lesson-viewer، status completed، conclusion success، من 22:33:15Z إلى 22:33:25Z؛ وعدد النتائج على هذا الـSHA واحد لا غير | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | GitHub Actions API | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs?head_sha=cf41d264…` | بعد الدمج على main: run 33278902692، workflow «Verify lessons»، event push، head_branch main، run_number 13، status completed، conclusion success، من 22:34:00Z إلى 22:34:07Z — التحقق ناجح على الفرع الرئيسي أيضًا | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | GitHub Actions API | — | `GET …/actions/runs?head_sha=cf41d264…` مع `GET /repos/amr-abd-elsalam/parmaga/actions/workflows` | الاستعلام يعيد total_count = 2 على merge SHA، والمستودع يملك workflowين فقط هما «Verify lessons» و«pages-build-deployment»، فالتشغيل الثاني يعود لworkflow النشر استنتاجًا لا قراءةً لسجله | Inferred |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | GitHub Actions API | — | لم يُقرأ سجل التشغيل الثاني على merge SHA | نتيجة تشغيل pages-build-deployment على cf41d264 غير معلومة، ولا تُوصف بنجاح ولا بفشل. وهي ليست فحصًا مطلوبًا، فلا أثر لها على بوابة الدمج | Unknown |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | مجموعة الاختبارات | — | `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_*.py'` | Ran 61 tests in 2.011s — OK، بلا إخفاق ولا خطأ، على baseline الدمج cf41d264 | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | أداة التحقق | — | `PYTHONDONTWRITEBYTECODE=1 python3 tools/verify_lesson.py .` | Publication candidates: 1 وهو programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01، والمخرج «All checks passed» و«RESULT: PASS (0 errors)» | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | مستودع parmaga | — | `git status --short --untracked-files=all` بعد تشغيل الاختبارات والفاحص | المخرج فارغ — لم تترك أدوات الاختبار أي مخلَّف ولا ملف غير متعقَّب | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | النشر الحي | — | `GET https://parmaga.com/courses/programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01/` | HTTP 200 بنوع text/html; charset=utf-8 وحجم 10909 bytes. والمستجاب يحمل canonical للمسار نفسه، ووصلة /assets/css/parmaga.css، وسكربت /assets/js/lesson-viewer.js بسمة defer، وقائمة صفحات بمراسٍ page-1 فصاعدًا، وصور svg بأبعاد صريحة 1080×1350 مع loading=lazy من الصفحة الثانية، وnص كامل بالعربية والإنجليزية داخل details لكل صفحة | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | — | صف 2026-08-29 المؤرَّخ بحالة `expected-404` على الرابط الدائم | — | إعادة الجلب أعلاه | «HTTP 404 مع صفحة 404 الرسمية — expected-404» كان صحيحًا في تاريخه على baseline المرحلة 3، وأبطله دمج المرحلة 5: الرابط الدائم يعيد الآن HTTP 200 بصفحة الدرس | Superseded |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | assets/js/lesson-viewer.js | 852 و 856 | `grep -n "location.hash\|function goTo\|goTo(" assets/js/lesson-viewer.js` | الدالة goTo(n, fromHash) معرَّفة عند 852، وتكتب window.location.hash = 'page-' + n عند 856 داخل try، وتُستدعى من مستمعي زرَّي السابق والتالي عند 976 و977. كتابة الـhash مثبتة من المصدر | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | lesson-viewer.js و index.html | عدّ وبحث | `grep -n -i "pause\|resume\|data-viewer-play"` على الملفين | لا يوجد زر تشغيل أو إيقاف مؤقت: لا أثر لـdata-viewer-play، والورود الوحيد في JavaScript هو الدالة pauseFor عند 321 وهي حساب تأخير محارف يُستدعى عند 714، والورود الوحيد في HTML هو نص الدرس «Pause and Think» عند 275 لا عنصر تحكم | Confirmed |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | assets/css/parmaga.css | 208–215 و 603–604 | `grep -n "outline" assets/css/parmaga.css` | توجد قاعدتا outline: مؤشر التركيز عند 214–215، وقاعدة عند 603–604 تضبط outline وoutline-offset بعرض حد قوي. ولم يُقرأ محدِّد القاعدة عند 603 ولا فُحص وجود قاعدة إخفاء للقائمة الساكنة، فلا يصح وصف معالجة الازدواج بأنها outline فقط | Needs Verification |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | parmaga.css و lesson-viewer.js | 607 و 972 | `grep -n -i "prefers-reduced-motion\|reducedMotion"` على الملفين | تفضيل تقليل الحركة مكتشَف في الطبقتين: استعلام وسائط عند parmaga.css:607، وmatchMedia عند lesson-viewer.js:972. أما ما يفعله هذا الاكتشاف بأزرار الإعادة والتخطي وبالقلم فلم يُقرأ في هذه المصالحة | Needs Verification |
| 2026-08-30 | 5-Closeout | cf41d26 | clean | index.html للدرس 01 | عدّ فقط | `grep -c "data-viewer-" courses/…/lesson-01/index.html` | تسعة ورودات لسمات data-viewer- في الصفحة، وهي عدد سمات لا عدد أزرار؛ فلا يُقيَّد منها عدد أزرار طبقة التحكم | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | مستودع parmaga | — | `git rev-parse --abbrev-ref HEAD` و `git rev-parse HEAD` و `git rev-parse origin/main` و `git rev-list --parents -n 1 HEAD` و `git status --porcelain=v1 --untracked-files=all` و `git ls-remote origin refs/heads/main` | baseline المرحلة 6: الفرع main، وHEAD = 6ebe8f52116860ed85eec1818184d0a59d7493b9 مطابق لـorigin/main محليًا وعلى الريموت، وأبواه cf41d264 و12ffb5a7، ومخرج الحالة فارغ تمامًا بما فيه غير المتعقَّب، ولا stash | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | docs/decisions/ | — | `git ls-files docs/decisions/` و `ls -la docs/decisions/` و `git log --all --oneline --name-only -- 'docs/decisions/*0008*'` | القرارات السبعة ADR-0001…ADR-0007 هي كل الموجود متعقَّبًا وعلى القرص؛ ولا أثر لأي ملف يحمل الرقم 0008 على القرص ولا في تاريخ أي مرجع من المراجع الأربعة ولا في الوسم pre-phase-01. فالرقم ADR-0008 حر، ونمط التسمية ADR-000N-<slug>.md مثبت | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | tools/verify_lesson.py و tests/test_verify_lesson.py | بحث نمطي | `grep -n "index.html\|\.html\|<img\|button\|select\|details\|data-viewer\|lesson-page\|page-index"` على الأداة، ونظيره على الاختبارات | صفر نتائج في الملفين. مجال الفاحص هو manifest والأصول والمعرّفات، ولا يقرأ بنية HTML للدرس ولا يفرض عليها عقدًا. فإدخال select وdetails وأزرار جديدة لا يمكن أن يُسقط Gate A، ولا حاجة لتعديل tools/ أو tests/ | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | .github/workflows/verify-lessons.yml | كامل الملف | `cat .github/workflows/verify-lessons.yml` | Gate A تستدعي أمرين لا غير: `python3 -m unittest discover -s tests -p 'test_*.py' -v` ثم `python3 tools/verify_lesson.py .`، بلا منطق تحقق مكرر داخل الـworkflow. فأوامر §M هي هذان الأمران بعينهما لا أوامر مخترعة | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | أصول الدرس وmanifest | عدّ وبصمة | `git ls-files -- '*.svg' \| wc -l` و `git ls-files -s -- '*.svg' \| sha256sum` و `git ls-files -s docs/content/manifests/…/lesson-01.json` | خط أساس السلامة قبل التطبيق: 22 ملف SVG تحت assets/lessons/… لا تحت courses/، وبصمة فهرس الأصول 0bf7782af37faf016a43ae53db4ba59dc9eec3bd79d498599ede25ff77c2fce6، وblob الـmanifest 06c96f83a96dc643a65575004143764ad859400f. أي اختلاف بعد التطبيق يُسقط المرحلة | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | assets/css/parmaga.css | 437 و 595–615 | `sed -n '595,615p'` و `grep -n "viewer\|stage\|controls\|data-"` | القاعدة الوحيدة تحت [data-viewer-active] هي عند 602–604 وتضيف outline وoutline-offset فقط. لا قاعدة إخفاء ولا طي للقائمة الساكنة. والتعليقان عند 437 و600–601 يَعِدان بطيّ الصفحات وإخفائها، وهو وعد بلا تنفيذ. فصف 2026-08-30 المصنَّف Needs Verification عن معالجة الازدواج يتحول إلى مؤكَّد: المعالجة outline فقط، والازدواج المرئي قائم | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | assets/js/lesson-viewer.js | 117–147 و 626–729 | `sed -n` على النطاقين و `grep -n "setTimeout\|later("` | محرك الحركة سلسلة مؤقتات ذات نقطة اختناق واحدة: كل جدولة تمر حصريًا عبر later(gen, fn, delay) عند 117، ومؤشرات التقدم at وidx وbuffer محفوظة في closures حية لا يدمرها إلغاء المؤقت. فالإيقاف الحقيقي والاستئناف من الموضع ممكنان بتسجيل الاستمرارية عند الجدولة، دون إعادة بناء المحرك ودون Pause زائف | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | assets/js/lesson-viewer.js | 852–861 و 900–908 | `grep -n "location.hash\|hashchange\|popstate\|pushState\|replaceState"` | لا وجود لـpushState ولا replaceState ولا popstate في الملف إطلاقًا. goTo تُسند window.location.hash مباشرة عند 856، وهو السبب الميكانيكي لقفزة التمرير إلى المرساة الساكنة التي بلّغ عنها المالك — فتتحول من Reported إلى مفسَّرة من المصدر | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | assets/js/lesson-viewer.js | 765–768 و 910–922 | `sed -n '740,779p'` و `sed -n '900,939p'` | Reduced Motion يُكتشف بـmatchMedia عند 972 ويُطبَّق بتعطيل الأزرار: replay وskip وpen تُضبط disabled = state.reduced وتبقى ظاهرة. وapplyReduced يلغي كل شيء ويدمر القلم ويستعيد المحتوى. فصف Needs Verification عن سلوك تقليل الحركة يتحول إلى مؤكَّد، ومخالفته لمعيار «لا أدوات ميتة» ثابتة من المصدر | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | assets/js/lesson-viewer.js | 741 مقابل 836–846 | مقارنة مسارَي التراجع | عيب كامن: showStaticFallback يرفع data-viewer-active عند 741، بينما مسار فشل الجلب لصفحة واحدة عند 836–846 يخفي المسرح ولا يرفع السمة. وهو غير ضار اليوم لأن القاعدة outline فقط، لكنه يصبح فقدان محتوى فور تطبيق الطي. فتصحيحه شرط لازم لمعيار القبول 26 لا تحسين اختياري | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | الملفات الأربعة التنفيذية | — | `file` على index.html و lesson-viewer.js و parmaga.css و README.md | الأربعة CRLF بنسبة كاملة، موافقةً لعرف §2. فالتطبيق يجب أن يحافظ على \r\n، وأي تحويل إلى LF يُظهر الملفات كاملة في الـdiff ويبطل معنى قاعدة الستة ملفات | Confirmed |
| 2026-08-30 | 6 | 6ebe8f5 | clean | حزمة المرحلة 6 | — | لم تُطبَّق بعد | نتائج الاختبارات وverify_lesson.py وGate A والنشر والتحقق اليدوي وCLS ومدة حركة الصفحات الـ22 وقارئ الشاشة والهاتف الحقيقي: لم يُقَس أي منها على الحزمة. لا يُكتب لها نجاح ولا إخفاق قبل التطبيق والقياس الفعلي | Unknown |
| 2026-08-30 | 6.1 | 398485d | clean | assets/css/parmaga.css | 486–570 مقابل 577–661 | `diff <(sed -n '486,570p') <(sed -n '577,661p')` | خرج فارغًا ثم IDENTICAL: كتلة أدوات العارض مكتوبة مرتين بتطابق حرفي كامل. الأثر البصري صفر بالبرهان لتطابق القواعد، والكلفة حجم زائد على شبكة بطيئة ودَين صيانة. حُذفت النسخة الثانية في 6d58236 وبقي `grep -c 'viewer-primary {'` يساوي 1 | Confirmed |
| 2026-08-30 | 6.1 | 398485d | clean | assets/css/parmaga.css و index.html | 115 و 444 و 12 | `sed -n '95,130p'` و `sed -n '435,456p'` و `grep -n '<body'` | لا نقطة كسر للجوال في الملف كله؛ النقطتان القائمتان min-width 800 و1100 تخدمان الصفحة الرئيسة. حشوة body ستةَ عشرَ وحشوة page-lesson main ستةَ عشرَ تقتطعان أربعة وستين بكسلًا من أصل 320، فيبقى للمسرح 256 ويهبط مقياس ملف 1080 إلى 23.7٪. وbody يحمل class page-lesson فعلًا فالمحدِّد نافذ | Confirmed |
| 2026-08-30 | 6.1 | a2d14b2 | clean | assets/css/parmaga.css | 699–713 | `git diff -U0 \| grep '^+'` | كتلة max-width 479px واحدة تصفّر padding-inline على page-lesson وتقلّصه إلى pg-space-1 أي ثمانية على page-lesson main. تقع بعد القاعدة الأساس عند 440 فتغلبها بترتيب المصدر، وقبل كتلة الطباعة فتبقى الطباعة آخر كلمة. المكسب المحسوب ثمانية وأربعون بكسلًا: 256 إلى 304 | Confirmed |
| 2026-08-30 | 6.1 | a2d14b2 | clean | العرض الحي عند 320px | — | مجسّ console يقرأ scrollWidth وinnerWidth وgetBoundingClientRect وgetComputedStyle | scrollWidth = innerWidth = 320 فلا فيض أفقي؛ وpadding-inline لـbody صفر ولـpage-lesson main ثمانية؛ وعرض lesson-page-image أربعة وثلاثمائة. فمكسب الثمانية والأربعين بكسلًا مُثبت تجريبيًا: 256 إلى 304 بزيادة 18.75٪. وقيمة stage = HIDDEN وضع ساكن افتراضي لا عطل | Confirmed |
| 2026-08-30 | 6.1 | a2d14b2 | clean | العارض على العرض الحي | — | مجسّ console يقرأ وجود lesson-stage وحالة lesson-viewer-controls وlesson-stage-svg | المسرح منشأ، وطبقة التحكم ظاهرة غير hidden، وSVG محمَّل. فالتهيئة نجحت ولا مسار فشل. والمجسّ الأول الذي قرأ data-viewer-active من documentElement كان خاطئًا: السمة تُرفع على ol.lesson-pages لا على html | Confirmed |
| 2026-08-30 | 6.1 | c7fb02e | clean | مستودع parmaga | — | `git log --oneline -6 origin/main` و `git branch -r --contains a2d14b2` و `git pull --ff-only` | حزمة 6.1 مدموجة: PR #10 بmerge commit 61a72c3، وPR #9 بmerge commit c7fb02e وهو رأس main. والتحديث المحلي fast-forward من 398485d بثلاثة ملفات: parmaga.css والدفتر وADR-0009 الجديد | Confirmed |
| 2026-08-30 | 6.1 | c7fb02e | clean | GitHub Actions API | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs` | Gate A بعد الدمج على main: run 33303393733، workflow «Verify lessons»، event push، head_sha c7fb02e، run_number 21، conclusion success | Confirmed |
| 2026-08-30 | 6.1 | c7fb02e | clean | النشر الحي | — | `GET https://parmaga.com/` و `GET https://parmaga.com/sitemap.xml` | صفحة الدرس يتيمة: الصفحة الرئيسة لا تحمل أي وصلة إليها، وsitemap.xml يعيد 404. فلا وصول إلا بلصق الرابط الكامل، ولا فهرسة. انحراف مفتوح مسجَّل للقرار لا منفَّذ هنا | Confirmed |
| 2026-08-30 | 6.1 | 398485d | clean | assets/css/parmaga.css | 681 | `grep -n 'aspect-ratio'` | lesson-stage يحمل aspect-ratio 1080/1350، فنسبة الأبعاد محجوزة قبل وصول الصفحة كما يلزم ADR-0008 §11. والصور الـ22 تحمل width وheight صريحين. فشرط CLS مؤمَّن بنيويًا، وإن بقي الرقم نفسه غير مقاس | Confirmed |
| 2026-08-30 | 6.1 | 398485d | clean | assets/css/parmaga.css | 211–215 | `grep -n 'focus-visible'` | مؤشر التركيز معرَّف بمحدِّد واحد يشمل a وbutton وsummary، لا بقاعدة منافسة، مطابقًا لـADR-0007 §12. وoutline مستبدَل لا ملغى | Confirmed |
| 2026-08-30 | 6.1 | 398485d | clean | assets/css/parmaga.css | 15–21 | حساب نسب التباين من القيم الفعلية | navy-700 على paper يعطي 8.51:1 وslate-600 يعطي 7.18:1، وكلاهما يتجاوز WCAG AA إلى AAA. الزر المعطَّل بعد opacity 0.55 ينزل إلى 2.55:1 وهو مستثنى صراحة لأن حالته معلنة بسمة disabled لا باللون. والحدّ pg-rule يعطي 1.31:1 فيكاد يختفي، وهو تجميلي مسجَّل ولم يُصلح | Confirmed |
| 2026-08-30 | 6.1 | 398485d | clean | assets/js/lesson-viewer.js | 659–666 و 821 | `sed -n '655,748p'` | finish يخفي القلم ويصفّر running وpaused ويمحو resume قبل استدعاء onDone، فيتحقق شرط التعطيل عند 821 لحظة إعلان اكتمل العرض. فبند اكتمال العرض مطابق لـADR-0008 §5، والاشتباه السابق بزر يبقى مفعَّلًا منتفٍ | Confirmed |
| 2026-08-30 | 6.1 | 398485d | clean | assets/js/lesson-viewer.js | كامل الملف | `grep -nE 'focus\(\)\|scrollIntoView'` | لا وجود لأي استدعاء focus في الملف إطلاقًا، فسرقة التركيز مستحيلة بنيويًا لا مستبعدة. وscrollIntoView في موضع يتيم عند 801 محكوم بعلم alignOnFirstMount الذي يُضبط من وجود fragment ويُطفأ قبل التنفيذ: محاذاة واحدة عند فتح page-N، ولا تمرير إطلاقًا بلا fragment | Confirmed |
| 2026-08-30 | 6.1 | 398485d | clean | مراجعة UX/UI للمرحلة 6 | — | لم يُنفَّذ | معاينة الطباعة وحجب الشبكة والرجوع والتقدم والرابط المباشر page-7 ورقم CLS المقاس ومخرجات الConsole في جلسة كاملة وقارئ الشاشة والهاتف الحقيقي: لم يُقَس أي منها. لا نجاح ولا إخفاق | Unknown |
| 2026-08-31 | 6.2 | 2a2b79d | clean | مستودع parmaga | — | `python3 -m unittest discover -s tests -p 'test_*.py' -v` و`python3 tools/verify_lesson.py .` قبل التعديل | خط أساس أخضر قبل أي تغيير: 61/61 OK وRESULT: PASS (0 errors). فأي إخفاق لاحق منسوب إلى تعديل V1 وحده | Confirmed |
| 2026-08-31 | 6.2 | 2a2b79d | clean | docs/ai/AI_ARCHITECT_PROTOCOL.md | — | `ls -1 docs/ai` و`grep -rn 'AI_ARCHITECT_PROTOCOL'` | المسار الوارد في برومبت التنفيذ خاطئ: الملف في جذر المستودع لا في docs/ai. لا فقدان ولا حذف | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | assets/js/lesson-viewer.js | 812–835 و1026–1042 قبل التعديل | `sed -n '540,1191p'` | ثلاث فجوات امتثال في المصدر قبل V1: نص «استئناف العرض» بدل «متابعة العرض» و«العودة إلى العارض» بدل «العودة إلى العارض التفاعلي»، وانعدام أي مسار لبدء الحركة بطلب صريح لأن زر التشغيل يُعطَّل عند الخمول، وإعلان تغيّر السرعة وحالة القلم في role=status خارج قائمة ADR-0010 §14 | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | assets/js/lesson-viewer.js | كامل الملف قبل التعديل | `grep -cE 'aria-expanded\|aria-controls'` | النتيجة صفر: لا إدارة إظهار ولا تركيز ولا Escape في المصدر السابق، فكل عقد ADR-0009 للتحكم عمل جديد لا تعديل قائم | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | مستودع parmaga | — | `git diff --check` ثم `git -c core.whitespace=cr-at-eol diff --check` ثم `git diff -U0 \| grep -cE '^\+[^+].*[ \t]$'` | كل ملفات الشجرة CRLF وكل ملف متسق داخليًا: CR يساوي عدد الأسطر تمامًا في الملفات الثلاثة. الإبلاغ كان عن CR وحده لا عن مسافة طرفية حقيقية بدليل صفر مطابقة في الفحص المستقل عن git. وضُبط core.whitespace=cr-at-eol محليًا وغير متعقَّب، فعاد diff --check نظيفًا. الشرط سابق لهذا العمل بدليل أن blob README عند 8da4917 يعطي 180 سطرًا كلها CRLF | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | مستودع parmaga | — | `git diff --check` و`unittest` و`verify_lesson.py` بعد V1 | البوابات الثلاث ناجحة بعد التعديل: 61/61 OK وPASS بصفر أخطاء وdiff نظيف | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | مستودع parmaga | — | `git diff --name-only -- '*.svg' 'manifest*' tools tests .github CNAME .gitattributes docs/decisions` | المخرج فارغ: صفر مساس بأي SVG أو manifest أو أداة أو اختبار أو سير عمل أو ADR. والفرق أربعة ملفات مسموحة: index.html وparmaga.css وlesson-viewer.js وREADME.md بمجموع 366 إضافة و84 حذفًا | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | صفحة الدرس والملفات الثلاثة | — | `grep -c` للأدوات و`grep -o 'id="[^"]*"' \| uniq -d` و`grep -c 'viewer-more\|data-viewer-motion'` | مصدر حقيقة واحد مثبت: عقدة واحدة لكل أداة، وصفر IDs مكررة، وصفر بقايا للبنية القديمة في الملفات الثلاثة، وaria-expanded مع aria-controls على زرين لا ثالث | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | assets/js/lesson-viewer.js | خمسة عشر موضعًا | `grep -n 'setStatus'` | محتوى role=status محصور في: تغيّر الصفحة والتحميل والتشغيل والإيقاف والاستئناف والاكتمال والتخطي وتقليل الحركة والفشل. صفر إعلان للسرعة أو القلم أو فتح اللوحات. مطابق لقائمة ADR-0010 §14 المسموحة | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | واجهة GitHub — فحوص الـPR | — | لم يُنفَّذ أمرًا؛ المصدر واجهة GitHub Checks | Gate A ناجحة على الـPR: فحص واحد مطلوب باسم Verify lessons / Gate A - Lesson verification (pull_request)، ناجح في 5 ثوانٍ، ولا فحص آخر | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | قياس حي في DevTools | — | سكربت قياس في Console عند 320 و360 و390 و768 و1280 في النمطين | انتفاء الفيض الأفقي مطلقًا: hOverflow صفر في العروض الخمسة وفي النمطين. وكل هدف ظاهر في كتلة التحكم لا يقل عن 44×44 في كل عرض. وعند 320 و360 و390 و768 زران عائمان فقط بقياس 44×44 وفاصل 8 وصندوق حاصر 96×44، أي داخل سقف 104×104 المقرر في ADR-0010 §13 | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | قياس حي في DevTools | — | القياس نفسه عند 1280 | التحكم داخل التدفق على الشاشات الواسعة: الزران بـdisplay:none، واللوحتان مفتوحتان بارتفاع 46 و45 بكسل أي صف واحد لكل لوحة بلا التفاف، مع صفر فيض أفقي وصفر هدف تحت 44. فشرط ADR-0010 §8 لظهور الأدوات الثانوية داخل التدفق متحقق قياسًا عند 1280، ويبقى تكبير 200% وحده غير مقيس | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | قياس حي في DevTools | — | القياس نفسه عند 768 مع لوحة التنقل مفتوحة | ارتفاع اللوحة المفتوحة 74 بكسل مقابل سقف 358 أي نصف viewport، فميزانية 50dvh متحققة عند 768. ولوحة واحدة مفتوحة والأخرى hidden في الوقت نفسه، فقاعدة اللوحة الواحدة متحققة في القياس لا في الكود وحده | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | قياس حي في DevTools | — | نسبة scrollHeight إلى innerHeight في النمطين | دليل يخص V2 لا V1: النسبة في النمط التفاعلي بين 1.56 و2.03، وفي نمط الدرس الكامل بين 22.97 و31.83. وشرط أهلية زر الأعلى في ADR-0010 §11 هو أربعة أمثال ارتفاع viewport، فالزر لن يصبح مؤهلًا في النمط التفاعلي على أي من العروض الخمسة، وسيظهر في نمط الدرس الكامل وحده. لا يخالف «يعمل في النمطين» لأن العمل مشروط بالأهلية، لكنه يحصر الأثر العملي في نمط واحد | Confirmed |
| 2026-08-31 | 6.2 | f990782 | clean | قياس حي في DevTools | — | لم يُنفَّذ | ميزانية §13 عند فتح لوحة على 320 تحديدًا: لم تُفتح أي لوحة في جولات 320، فارتفاع اللوحة وعدم حجب سطر الحالة وقابلية تمريرها عند أضيق عرض غير مقيسة | Unknown |
| 2026-08-31 | 6.2 | f990782 | clean | صفحة الدرس | — | لم يُنفَّذ | تكبير 200% عند 1280 و390، ومعاينة الطباعة، والهاتف الحقيقي في portrait وlandscape، وTab وEscape وعودة التركيز إلى زر disclosure، وTab للخروج من اللوحة بلا حصر، وتغيير viewport مع تركيز داخل التحكم، وسلوك Reduced Motion على متصفح حقيقي، ورقم CLS المقاس، وسجل Console في جلسة كاملة، وقارئ الشاشة: لم يُقَس أي منها. لا نجاح ولا إخفاق | Unknown |
| 2026-08-31 | 6.2 | f990782 | clean | AI_ARCHITECT_PROTOCOL.md | 807–845 | `sed -n '807,845p'` | §21 تفرض قراءة الملفات فوق 120 سطرًا بنطاقات لا تتجاوز 40 سطرًا ولا تمنح استثناءً. وطُلب في هذه المرحلة نطاق 175 سطرًا ثم 651 سطرًا من lesson-viewer.js. يُقيَّد انحرافًا معلنًا عن §21 لا امتثالًا، وتبريره بترابط طبقة التحكم لا يرفع القاعدة | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | مستودع parmaga | — | `git rev-parse HEAD` و `git status --porcelain` | HEAD = 1ca43c1348341deb67c0a9c78e587a35038d2508 والمخرج فارغ، فbaseline مصالحة الإغلاق مطابق للمتوقع والشجرة نظيفة قبل أي تعديل | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | مستودع parmaga | — | `git rev-list --parents -n 1 HEAD` | أبوا الدمج efade0c38f682134aa3b2a1810eeba401c5cb127 و b845baede67f2c3b101972698942bba3c3372840، فالدمج merge commit حقيقي بأبوين لا squash ولا rebase | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | مستودع parmaga | — | `git rev-parse b845bae^{tree} 1ca43c1^{tree}` | البصمتان متطابقتان عند 3ff8176e8e53636ddfdf20dbbe495b73ad641ab5، فالدمج لم يُدخل أي تغيير فوق commit التنفيذ ولم يُعدَّل شيء بعد الدمج | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | فرق efade0c..b845bae | — | `git diff --name-only efade0c b845bae` | أربعة ملفات لا خامس لها: README.md وassets/css/parmaga.css وdocs/ai/ARCHITECT_EVIDENCE_LEDGER.md وdocs/decisions/ADR-0011-lesson-print-contract.md — وصفر SVG وصفر manifest وصفر tools وصفر tests وصفر .github | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | فرق efade0c..b845bae | — | `git -c core.whitespace=cr-at-eol diff --check efade0c b845bae \| wc -l` | صفر — لا مسافة زائدة حقيقية في فرق المرحلة 7 | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | tests/ | — | `python3 -m unittest discover -s tests -p 'test_*.py'` | Ran 61 tests in 2.155s — OK، وهو الأمر نفسه المعرَّف في .github/workflows/verify-lessons.yml السطر 42 | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | tools/verify_lesson.py | — | `python3 tools/verify_lesson.py .` | Publication candidates: 1 — programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01، وAll checks passed، وRESULT: PASS (0 errors)، وهو الأمر نفسه المعرَّف في workflow السطر 45 | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | GitHub Actions REST العامة | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs/33467915910` | Gate A على رأس PR #14: run 33467915910، workflow «Verify lessons» بمسار .github/workflows/verify-lessons.yml، event pull_request، head_branch phase-7-print-contract، head_sha b845bae، run_number 31، status completed، conclusion success، من 03:54:47Z إلى 03:54:57Z | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | GitHub Actions REST العامة | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs/33467942178` | Gate A بعد الدمج على main: run 33467942178، نفس الـworkflow، event push، head_branch main، head_sha 1ca43c1، run_number 32، status completed، conclusion success، من 03:55:12Z إلى 03:55:22Z | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | GitHub REST العامة | — | `GET /repos/amr-abd-elsalam/parmaga/pulls/14` | PR #14 «fix(print): width-driven print contract, 22 sheets per lesson (ADR-0011)»: state closed، merged = true، merged_by = amr-abd-elsalam، merged_at = 2026-09-01T03:55:10Z، merge_commit_sha = 1ca43c1348341deb67c0a9c78e587a35038d2508، commits = 1، changed_files = 4، additions = 169، deletions = 4، author_association = OWNER — وعدد الملفات مطابق حرفيًا للإحصاء المحلي فتطابق مصدران مستقلان | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | مستودع parmaga | — | `git ls-files -s assets/lessons \| wc -l` و `git rev-parse HEAD:<path>` | بصمات ما يجب ألا يتحرك في مصالحة الإغلاق: assets/lessons = 22 ملفًا بشجرة 19e1bc0b6d0e76d43a74f6dedf68811ff0d15725، وassets/css/parmaga.css = 0b9bb4b33a81af9aaa1e7e11acd18461c3730644، وassets/js/lesson-viewer.js = ede7bf9edabe463918539f89e8c1d21273400299، وADR-0011 = e1e901cddd780f6f7ff8deed3fb53f4d4a8a620e | Confirmed |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | قرار المالك في جلسة 2026-09-02 — إعادة صياغة المنفِّذ لا نص حرفي | — | لم يُنفَّذ أمرًا؛ المصدر تصريح المالك | المالك قرر ألا يُنشأ ملف PDF، وصرّح بأنه شاهد النتيجة بصريًا وقبل إغلاق المرحلة 7 على هذا الأساس. ولا يوجد PDF في هذا المستودع ولا خارجه ضمن هذه المصالحة، ولا يوجد مخرج أداة لعدّ الصفحات، ولا يُدَّعى وجود أيهما | Reported |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | معاينة طباعة المالك البصرية | — | لم يُنفَّذ أمرًا؛ ولا مخرج عدّ صفحات محفوظًا | أعداد الأوراق للأحجام الثلاثة: A5 = 22، وA4 = 22، وLetter = 22 — Reported / owner-accepted — not Confirmed by retained PDF measurement. وسابقة §10 سجّلت A5 وLetter من معاينة متصفح لا من عدّ PDF، وA4 لا سابقة تسجيل له وهذا أول تقييد له بتصريح المالك | Reported |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | تقييم مخاطر مصالحة الإغلاق | — | لم يُنفَّذ | مخاطرة مقبولة معلنة: لا يوجد artifact PDF ولا قياس محفوظ قابل لإعادة التشغيل عبر محركات الطباعة. فأعداد الأوراق غير قابلة للتحقق المستقل من هذا المستودع، وأي انحراف في محرك طباعة أو إعداد هامش لن يُكتشف إلا بمعاينة بشرية جديدة. المالك قبل هذه المخاطرة صراحة وأغلق المرحلة عليها | Reported |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | قرار المالك في جلسة 2026-09-02 — إعادة صياغة المنفِّذ | — | لم يُنفَّذ أمرًا؛ المصدر تصريح المالك | عقد الطباعة الحالي مجمد: ADR-0011 وكتلة @media print وقواعد @page لا يُعاد فتحها ولا تُعدَّل، ولا يُنشأ لها قرار معدِّل، إلا بطلب مستقل صريح من المالك. والتجميد يشمل المراحل اللاحقة فلا يمسّ أي منها الطباعة تلقائيًا | Reported |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | §10 عقد التسليم النشط قبل هذه المصالحة | 494–508 | `sed -n '476,508p'` | بلوك دفتر التسليم كان عالقًا على المرحلة 6.2 بحالة «In Progress — الدمج موقوف … وPR #13 مفتوح غير مدموج». كان صحيحًا في تاريخه، وأبطله الواقع: دُمج PR #13 في efade0c كما يقيّده §2، ثم دُمجت المرحلة 7 في 1ca43c1. لا يُحذف النص التاريخي، ويُقيَّد إبطاله في §10 نفسه | Superseded |
| 2026-09-02 | 7-Closeout | 1ca43c1 | clean | docs/decisions/ و§2 | 63 | `grep -rn 'ADR-0012' --include='*.md' .` و `git ls-files 'docs/decisions/ADR-*.md' \| sort -V` | تصادم ترقيم مرصود لا محسوم: ADR-0012 مذكور في موضع واحد فقط هو سطر Next phase في §2 بوصفه رقمًا محجوزًا للمرحلة 8، ولا ملف قرار بهذا الرقم موجود، وأعلى قرار موجود فعليًا هو ADR-0011. فالرقم المتاح التالي لأي قرار جديد هو 0012 نفسه. لم يُحجز رقم ولم يُحسم التصادم في هذه المصالحة، وحسمه قرار مالك مستقل | Confirmed |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | مستودع parmaga | — | `git pull --ff-only origin main` و `git rev-parse HEAD` و `git status --porcelain` | baseline التسليم B مطابق للمتوقع: HEAD = f1ca028e141b57684cce45c326a810f529072ac6 بعد fast-forward من 1ca43c1 بملف واحد هو الدفتر (+53 −2)، والمخرج فارغ بعد إزالة tests/__pycache__ وtools/__pycache__ غير المتعقَّبين | Confirmed |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | GitHub REST العامة | — | `GET /repos/amr-abd-elsalam/parmaga/pulls?state=closed` | PR #15 «docs(ledger): close Phase 7 in the evidence ledger — reconciliation only»: state closed، merged_at = 2026-09-02T04:15:00Z، merge_commit_sha = f1ca028e141b57684cce45c326a810f529072ac6، رأس الفرع 6e9b7a9b22db60a5a4bdc193162ed30a5a60c6c3 | Confirmed |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | GitHub Actions REST العامة | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs?branch=main` | Gate A بعد دمج مصالحة المرحلة 7: run 33590087701، workflow «Verify lessons»، event push، head_branch main، head_sha f1ca028، run_number 34، status completed، conclusion success، من 04:15:02Z إلى 04:15:13Z | Confirmed |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | docs/decisions/ | — | `git ls-files 'docs/decisions/ADR-*.md' \| sort -V` | أحد عشر قرارًا، وأعلى رقم موجود فعليًا هو ADR-0011، فالرقم المتاح التالي 0012. ولم يظهر أي ADR أحدث، ولم يُفترَض الرقم بل قيس | Confirmed |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | صف 2026-09-02 الخاص بتصادم ترقيم ADR-0012 | — | قرار المالك الصادر في 2026-09-02 | التصادم المرصود صار محسومًا: ADR-0012 لـلمرحلة 7.1، وسطر Next phase في §2 يُصحَّح فتُزال إشارة الحجز دون حجز رقم بديل للمرحلة 8. فوصف «مرصود لا محسوم» بطل | Superseded |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | القرارات الأحد عشر | 3–5 | `grep -n -A2 '^## Status' docs/decisions/ADR-00*.md` | المفردة المعتمدة للحالة في المستودع هي Accepted في القرارات الأحد عشر كلها، والأحدثان ADR-0009 وADR-0010 بصيغة «Accepted — 2026-08-30.»، ويقرن ADR-0010 الحالة بجملة أن القرار توثيقي للاعتماد ولا يمنح إذن تنفيذ | Confirmed |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | AI_ARCHITECT_PROTOCOL.md | 263–300 | `sed -n '263,300p'` و `grep -n 'ADR'` | لا قاعدة في البروتوكول المعماري تمنع إصدار قرار بحالة Accepted مباشرة ولا تفرض حالة وسيطة. القسم 9 يمنع كتابة ملف Production أو Patch في مرحلة التصميم ولا يقيّد وسم الحالة، وإحالة ADR الوحيدة في البروتوكول تخص حل التعارض لصالح مصادر الحقيقة الأعلى. فحالة Accepted بإذن المالك موافقة للبروتوكول وللعرف | Confirmed |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | ADR-0010 | 168–223 | `sed -n '168,196p'` و `sed -n '196,223p'` | §7 يفرض مصدر حقيقة واحدًا وعقدة ومستمعًا واحدًا لكل أداة ويمنع نسخ responsive، وADR-0012 يبنى عليه ولا ينقضه. و§8 يشترط ظهور أدوات بعينها داخل التدفق على الشاشات الواسعة بشروط قياس، ولا يحمل نصًّا يقول «لوحتان مفتوحتان دائمًا». فالاستبدال الجزئي في ADR-0012 §1 مصوغ على نموذج العرض داخل التدفق وعلى التنفيذ المشتق منه المقيس عند 1280 في صف 2026-08-31، لا على نص لا يحمله القرار | Confirmed |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | ADR-0010 | 128–168 | لم يُقرأ | §5 «سياسة autoplay» و§4 «معاني حالات الحركة» لم يُقرأ نصهما في هذا التسليم. فصيغ ADR-0012 §1 قاعدة أسبقية محصورة بمجال نقطة البداية وautoplay ونموذج عرض الأدوات بدل استشهاد مسمّى، ويبقى تحويلها إلى استشهاد مسمّى معلّقًا على قراءة النطاق | Unknown |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | README.md | 72–82، 172–182 | `grep -n 'ADR-00' README.md` | فهرس القرارات قائم في موضعين: شجرة تنتهي عند ADR-0011 بمحرف `└──` عند السطر 82، وقائمة وصفية تنتهي عند السطر 182. فالفهرسة تقتضي تعديل الموضعين، وهو أقل تعديل وثائقي لازم | Confirmed |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | نطاق تسليم القرار | — | لم يُنفَّذ | حدود معلنة لهذا التسليم: صفر Production Code، وصفر ملف اختبار، وصفر مساس بـindex.html وassets/** و.github/** وtools/** وtests/** وADR-0011 و@media print و@page، ولا حجز رقم ADR لأي مرحلة تالية، ولا بدء للمرحلة 8. وADR-0012 لا يمنح إذن تنفيذ بنصه | Reported |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | ADR-0009 وADR-0012 | — | مقارنة نصية | توسعة نطاق معلنة لا استبدال مضمون: نموذج الزرين العائمين في ADR-0009 كان مقررًا للشاشات الصغيرة، ويصير في ADR-0012 النموذج الوحيد لكل المقاسات. وهذه التوسعة لم تُذكر في توجيه المالك الذي حصر الاستبدال الجزئي في ADR-0010، وهي لازم منطقي لبند «الأدوات عائمة على جميع أحجام الشاشة»، ومقيَّدة هنا لعلم المالك لا لتمريرها صامتة | Reported |
| 2026-09-02 | 7.1-ADR | f1ca028 | clean | Deferred Observations | — | `git status --porcelain` | ملاحظة مؤجلة: تشغيل Gate A محليًا يولّد tests/__pycache__ وtools/__pycache__ غير متعقَّبين فيتّسخ مخرج status. لا .gitignore يغطيهما. إضافة .gitignore خارج نطاق هذا التسليم ولم تُنفَّذ، وهي مسجَّلة لقرار مستقل | Reported |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | مستودع parmaga | — | `git checkout main && git pull --ff-only origin main` و `git rev-parse HEAD HEAD^{tree}` و `git status --porcelain=v1 --untracked-files=all \| wc -l` و `git rev-list --count main..origin/main` | baseline المصالحة مطابق للمتوقع: fast-forward من fe9f9cf إلى f9df9df بلا دمج، وHEAD = f9df9df4697bf407f1c3028c792cdf9e9d7994b8، وشجرته 1388fe1c862b3a546869c2cbef9ab046665ef1b4، ومخرج الحالة صفر سطر بما فيه غير المتعقَّب، وصفر فارق مع origin/main | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | مستودع parmaga | — | `git rev-list --parents -n 1 f9df9df` | أبوا الدمج fe9f9cfe25e91f82964d0059147d53f6beca5b87 و e640f1ae03f5493c22df91013ab3b7dfbacd8dd8 — merge commit حقيقي بأبوين لا squash ولا rebase، على عرف PR #13 حتى #17 | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | مستودع parmaga | — | `git log -1 --format=%P e640f1a` | commit التنفيذ له أب واحد هو fe9f9cfe25e91f82964d0059147d53f6beca5b87، فهو ليس دمجًا وهو جالس مباشرة فوق دمج القرار PR #16، والأب الأول للدمج مطابق له | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | مستودع parmaga | — | `git rev-parse e640f1a^{tree} f9df9df^{tree}` | البصمتان متطابقتان عند 1388fe1c862b3a546869c2cbef9ab046665ef1b4، فالدمج لم يُدخل أي تغيير فوق commit التنفيذ ولم يُعدَّل شيء بعد الدمج | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | فرق fe9f9cf..e640f1a | — | `git diff --name-only fe9f9cf e640f1a` و `git diff --shortstat fe9f9cf e640f1a` | خمسة ملفات لا سادس لها: assets/css/parmaga.css وassets/js/lesson-viewer.js وcourses/programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01/index.html وdocs/ai/ARCHITECT_EVIDENCE_LEDGER.md وtests/test_lesson_ui_contract.py مُنشأً، بإحصاء 957 insertions(+) و 192 deletions(-) | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | فرق fe9f9cf..e640f1a | — | `git diff --name-only fe9f9cf e640f1a -- assets/lessons .github tools docs/decisions \| wc -l` و `git rev-parse f9df9df:assets/lessons f9df9df:docs/decisions/ADR-0011-lesson-print-contract.md` | G1 مستوفاة: صفر مسار في المجالات الأربعة، وشجرة assets/lessons = 19e1bc0b6d0e76d43a74f6dedf68811ff0d15725 وبصمة ADR-0011 = e1e901cddd780f6f7ff8deed3fb53f4d4a8a620e — مطابقتان حرفيًا لما قُيِّد في صف 2026-09-02 الخاص بمصالحة المرحلة 7 | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | assets/css/parmaga.css | 880 إلى نهاية الملف | `tail -n +880 assets/css/parmaga.css \| sha1sum` و `tail -n +880 assets/css/parmaga.css \| wc -l` و `sed -n '30,33p' tests/test_lesson_ui_contract.py` | G4 مستوفاة: البصمة f8bf32aa9b06dd8d72704d6abab9a37a987a14c3 و98 سطرًا، مطابقتان لثابتَي PRINT_BLOCK_SHA1 وPRINT_BLOCK_LINES في الاختبار. وكتلة @media print تبدأ عند السطر 880 والملف 977 سطرًا | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | tests/test_lesson_ui_contract.py | 454–466 | `sed -n '445,470p' tests/test_lesson_ui_contract.py` | حارس G4 مؤتمت لا تقريري: الاختبار يقرأ الملف بايتات، ويجد الموضع `\r\n@media print {`، ويهش من هناك إلى نهاية الملف بلا حد أدنى، ويؤكد عدد الأسطر والبصمة. فالكتلة مفتوحة من الأسفل، ويلزم أن تسبق أي قاعدة CSS جديدة السطر 880 وإلا كسرت البصمة بلا أي مساس بالطباعة. وتطبيع نهايات الأسطر قبل الهاش ينتج قيمة أخرى بنص وثيقة الاختبار | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | فرق fe9f9cf..e640f1a | — | `git -c core.whitespace=cr-at-eol diff --check fe9f9cf e640f1a \| wc -l` | G6 مستوفاة: صفر — لا مسافة زائدة حقيقية في فرق المرحلة 7.1، بالأمر المعتمد في §2 لا بالإعداد الافتراضي | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | الملفات الخمسة | عدّ فقط | `grep -c $'\r$' <file>` مقابل `grep -c "" <file>` | G5 مستوفاة: CRLF 100% في كلٍّ منها — parmaga.css 977/977، وlesson-viewer.js 1544/1544، وindex.html للدرس 575/575، وtest_lesson_ui_contract.py 505/505، والدفتر 611/611 | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | tests/ | — | `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_*.py'` | G7a مستوفاة: Ran 124 tests in 2.461s — OK على baseline الدمج، وهو الأمر نفسه المعرَّف في .github/workflows/verify-lessons.yml. وارتفاع العدد من 61 إلى 124 مصدره ملف الاختبار المُنشأ في المرحلة 7.1 | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | tools/verify_lesson.py | — | `PYTHONDONTWRITEBYTECODE=1 python3 tools/verify_lesson.py .` | G7b مستوفاة: All checks passed for 1 publication candidate، وRESULT: PASS (0 errors) | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | GitHub Actions REST العامة | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs?head_sha=e640f1ae…` | Gate A على رأس PR #17: run 33613351199، workflow «Verify lessons» بمسار .github/workflows/verify-lessons.yml، event pull_request، head_branch feat/adr-0012-viewer-implementation، run_number 37، status completed، conclusion success، من 09:18:06Z إلى 09:18:14Z، وعدد النتائج على هذا الـSHA واحد لا غير | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | GitHub Actions REST العامة | — | `GET /repos/amr-abd-elsalam/parmaga/actions/runs?head_sha=f9df9df4…` | Gate A بعد الدمج على main: run 33613399178، نفس الـworkflow، event push، head_branch main، run_number 38، status completed، conclusion success، من 09:18:38Z إلى 09:18:46Z — التحقق ناجح على الفرع الرئيسي أيضًا | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | GitHub Actions REST العامة | — | الاستعلام أعلاه يعيد total_count = 2 على merge SHA، ولم يُقرأ سجل التشغيل الثاني | المستودع يملك workflowين فقط هما «Verify lessons» و«pages-build-deployment»، فالتشغيل الثاني يعود لworkflow النشر استنتاجًا لا قراءةً لسجله، ونتيجته غير مقروءة فلا تُوصف بنجاح ولا بفشل. وهو ليس فحصًا مطلوبًا فلا أثر له على بوابة الدمج — على سابقة صفَّي 2026-08-30 المقابلين | Inferred |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | GitHub REST العامة | — | `GET /repos/amr-abd-elsalam/parmaga/pulls/17` | PR #17 «feat(viewer): full-view default, unified floating controls, realistic pen (ADR-0012)»: state closed، merged = true، merge_commit_sha = f9df9df4697bf407f1c3028c792cdf9e9d7994b8، merged_at = 2026-09-02T09:18:36Z، commits = 1، changed_files = 5، additions = 957، deletions = 192، author_association = OWNER — والإحصاء مطابق حرفيًا للإحصاء المحلي فتطابق مصدران مستقلان | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | GitHub REST العامة | — | `GET /repos/amr-abd-elsalam/parmaga/pulls/16` | PR #16 «docs(adr): issue ADR-0012 — full-view default, explicit interactive session, unified floating controls»: state closed، merge_commit_sha = fe9f9cfe25e91f82964d0059147d53f6beca5b87 على base f1ca028، رأس الفرع 0d25310a911cc7f8e615d1468aa14a2ea41196e5، commits = 1، changed_files = 3، additions = 429، deletions = 2 — فتسليم القرار وتسليم التنفيذ منفصلان بـPRين لا واحد | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | §10 عقد التسليم النشط قبل هذه المصالحة | 583 و 599 | `sed -n '556,594p'` و `sed -n '595,611p'` | بلوكان في §10 بطلا معًا: بلوك تسليم القرار عند 583 يقول «In Progress — صدر ADR-0012 بحالة Accepted، ولم يُؤذن بالتنفيذ ولم يبدأ»، وبلوك التنفيذ عند 599 يقول «In Progress — التنفيذ مكتمل محليًا، والدمج موقوف على PR وGate A». كانا صحيحين في تاريخهما، وأبطلهما الواقع: أُذن بالتنفيذ ونُفِّذ في e640f1a ودُمج في f9df9df عبر PR #17 ونجحت Gate A على الرأس وعلى main. ولم يكن لبلوك 583 فقرة إبطال قبل خَلَفه بخلاف سابقتَي 560 و579، فأُضيفت هنا. ولا يُحذف نص تاريخي | Superseded |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | §10 بلوك التنفيذ | 600 و 602 | `sed -n '595,611p'` و `grep -c "7.1-Impl"` | البلوك النشط كان قالبًا نصف مُعبَّأ لا سجلًا مكتملًا: حقل HEAD بقي `<sha>` غير مُملأ، وحقل الأدلة يحيل إلى «صفوف §8 بوسم 7.1-Impl المؤرَّخة `<التاريخ>`»، والورود الوحيد للوسم 7.1-Impl في الملف كله هو هذا السطر نفسه — فلا صف واحد بهذا الوسم في §8. وصفر ورود لـe640f1a وf9df9df وأرقام الـruns في الدفتر قبل هذه المصالحة. فأدلة التنفيذ تُقيَّد هنا بوسم 7.1-Closeout | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | §7 جدول حالة المراحل | 247 | `grep -n "^\| 7.1 "` | صف المرحلة 7.1 كان `In Progress` وشرطه المكتوب هو إغلاق تسليم القرار وحده، ونصّه يشترط «إغلاق المرحلة كلها تنفيذًا لاحقًا بإذن مالك مستقل بعد دمج القرار». وقد استُوفي الشرطان: تسليم القرار دُمج في fe9f9cf عبر PR #16، والتنفيذ دُمج في f9df9df عبر PR #17. ونص الشرط الأصلي يبقى مقروءًا ولا يُحذف | Superseded |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | ADR-0012 | 146–158 | `sed -n '146,160p'` | انحراف مثبت بالنص لا بالنقل: §11 يقول حرفيًا «أشكال القلم ثلاثة: رصاص وهو الافتراضي، وحبر، وتحديد»، والمنفَّذ قلم واحد من سبعة أجزاء محلية بزر إظهار وإخفاء. ويتبع §11 فقرات مرتبطة بالأشكال الثلاثة — «التمييز بين الأشكال بالشكل مع اللون» و«إعادة التحميل تعيد الرصاص» — فأي تسوية رسمية تمسّها. والاختبارات الـ124 تمرّ كلها، أي أن العقد الاختباري النافذ يقنّن القلم الواحد بينما نص القرار يقنّن ثلاثة. لا تسوية في هذه المصالحة: لا Amendment ولا قرار مُبطِل ولا حجز رقم، وحسمها إذن مالك مستقل | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | ADR-0012 | 100–120 و 122–130 و 160–202 | `sed -n '100,122p'` و `sed -n '122,132p'` و `sed -n '160,203p'` | تصحيح توصيف سابق: لا مقطع في ADR-0012 مما قُرئ يعدّ «ثلاثة مسارات طيّ» عدًّا صريحًا. §7 موضوعه سقف اللوحة الواحدة ومسار الفتح الواحد واشتقاق aria-expanded وhidden من مصدر واحد. و§8 يعدّ أربعة مصادر لإعادة ضبط المؤقت هي click وتنشيط زر أو keydown فعّال وchange وfocusin، لا مسارات طيّ. و§9 يحمل مسار Escape. و§12 جدول انتقالات وضع لا انتقالات لوحة. فدعوى «§7 و§8 يعدّان ثلاثة مسارات» ساقطة الإسناد كما صيغت، ولا يُبنى تعديل رسمي على مقطع لا يحمل النص المدَّعى | Confirmed |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | ADR-0012 §7 و§8 مقابل التنفيذ | — | لم يُقرأ الكود ولا §13 ولا §16 ولا V1 | هل النقر خارج الطبقة انحراف عن ADR-0012 أصلًا: غير محسوم. §8 يحصر إعادة الضبط بالتفاعل «داخل أدوات التحكم» والنقر الخارجي خارجها، فامتناعه عن إعادة الضبط موافق للنص لا مخالف له. والقيد المرشَّح للاصطدام وحده هو «ولا تُفتح لوحة ولا تُغلق بمسار موازٍ» في §7، وهو يحرّم مسارًا موازيًا للإغلاق لا مُطلِقًا إضافيًا يستدعي المسار الواحد. فإن مرّ النقر الخارجي عبر دالة الإغلاق نفسها فهو امتثال، واحتمال أن يكون الانحراف المعلن في §10 مُبالغًا في إعلانه قائم. لا يُحسم في مصالحة إغلاق، ويلزمه قراءة الكود و§13 و§16 وV1 | Unknown |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | نطاق مصالحة الإغلاق | — | لم يُنفَّذ | حدود معلنة: الملف المتغيّر واحد هو دفتر الأدلة، وصفر تعديل runtime، وصفر مساس بـindex.html وassets/** وtools/** وtests/** و.github/** وADR-0011 و@media print و@page وأي ADR. ولا Amendment على ADR-0012، ولا حجز رقم قرار، ولا فتح للمرحلة 8، ولا تنفيذ لأي بند من بنود Unknown، ولا حذف فرع من الأحد عشر فرعًا القائمة | Reported |
| 2026-09-03 | 7.1-Closeout | f9df9df | clean | Deferred Observations | — | `git status --porcelain` بعد تشغيل الاختبارات | ملاحظة مؤجلة قائمة كما سُجِّلت في 2026-09-02: تشغيل Gate A محليًا يولّد tests/__pycache__ وtools/__pycache__ غير متعقَّبين ولا .gitignore يغطيهما، ويُتَّقى بـPYTHONDONTWRITEBYTECODE=1. وتضاف إليها ملاحظة نظافة الفروع: أحد عشر فرعًا محليًا وبعيدًا عشرة منها مدموجة ومنتهية، وحذفها يحتاج إذن مالك صريح لأنها مراجع تاريخية في الدفتر | Reported |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | مستودع parmaga | — | `git rev-parse HEAD` و `git rev-parse origin/main` و `git status --porcelain=v1 --untracked-files=all \| wc -l` | baseline المرحلة 7.2: HEAD = origin/main = 34e65716fb4ad9ba0a063efc480e8539895196cf، وحالة الشجرة صفر سطر بعد تحديث stat cache | Confirmed |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | مستودع parmaga | — | `git branch -a` | المرجعان الوحيدان هما main وremotes/origin/main؛ الفروع المنتهية حُذفت قبل هذه المرحلة | Confirmed |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | assets/css/parmaga.css | 880 إلى النهاية | `tail -n +880 assets/css/parmaga.css \| sha1sum` | بصمة عقد الطباعة f8bf32aa9b06dd8d72704d6abab9a37a987a14c3، ولم تتغير عن إغلاق 7.1 | Confirmed |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | docs/decisions | — | `grep -rn "Amendment\|Amends\|Supersede" docs/decisions/` و `git ls-files 'docs/decisions/ADR-*.md' \| sort -V \| tail -3` | لا ملف Amendment مستقل؛ السابقة هي ADR مستقل يحمل Amends في ADR-0011، وأعلى رقم مستخدم ADR-0012، فالرقم ADR-0013 شاغر | Confirmed |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | ADR-0012 | 100–202 | قراءة §7 و§8 و§11 و§12 بنطاقات موجّهة | §7 يفرض مسار لوحة واحدًا، و§8 يفرض 8000ms ومصادر إعادة الضبط الأربعة، و§11 يفرض ثلاثة أشكال قلم، و§12 يمنع انتهاء مسار الدخول إلى التشغيل بلا تشغيل مستقل | Confirmed |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | assets/js/lesson-viewer.js | 935–1017 | قراءة `armPanelTimer` و`setOpenPanel` و`onDocumentClick` | مؤقت اللوحة يحرس بـstate.openPanel وحده بلا phase؛ والنقر الخارجي يستدعي setOpenPanel(null) نفسه ولا يكتب حالة اللوحة مباشرة ولا يعيد ضبط المهلة | Confirmed |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | assets/js/lesson-viewer.js | 1042–1310 | قراءة `updateButtons` ونجاح `loadPage` و`startAnimation` و`onToggleMode` | اسم الدخول القائم «العرض التفاعلي لهذه الصفحة»، ونجاح التحميل ينتهي إلى INTERACTIVE_IDLE، وبدء الحركة فعل ثانٍ، وزر الوضع أثناء التشغيل يعود إلى FULL ولا يعيد الحركة | Confirmed |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | tests/test_lesson_ui_contract.py | 145–365 | قراءة اختبارات المهلة والنقر الخارجي والقلم | الاختبار يفرض 8000 حرفيًا ووروده مرة واحدة؛ ويقنّن النقر الخارجي؛ ويقنّن قلمًا واحدًا واقعيًا بزر إظهار وإخفاء مع بقاء تسميتي الانحراف D3 وD4 في الوصف | Confirmed |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | خمسة ملفات ظهرت معدلة ثم استعيدت | — | مقارنة blob و`git hash-object` و`cmp` ثم `git update-index --refresh` | الملفات الخمسة مطابقة بايتيًا لـHEAD؛ ظهورها المعدل كان stat cache بائتًا على /mnt/i بعد تحويل EOL غير مقصود. انتهت المعالجة بشجرة نظيفة، وصفر staged وصفر untracked | Confirmed |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | عرف نهايات الأسطر | — | `git ls-files --eol` وعداد CRLF للملفات الثلاثة المستهدفة | المستودع مختلط: الملفات الخمسة المقيسة في معالجة baseline هي LF، بينما README والدفتر وADR-0012 هي CRLF 100%. يُحفظ عرف كل ملف ولا يُطبَّع المستودع | Confirmed |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | قرار المالك | — | نص المالك في جلسة 2026-09-03 | فُتحت المرحلة 7.2 واعتمد إصدار ADR-0013 مستقل يعدّل ADR-0012 وفق البنود الأربعة، مع اعتماد استعادة تغييرات EOL غير المقصودة | Reported |
| 2026-09-03 | 7.2-ADR | 34e6571 | clean | نطاق PR القرار | — | لم يُنفَّذ بعد | ثلاثة ملفات فقط: ADR-0013 وREADME والدفتر؛ صفر HTML وCSS وJavaScript واختبارات وworkflow وSVG وmanifest، والتنفيذ غير مأذون | Reported |
| 2026-09-04 | 7.2-Impl | 01f3d6a | clean | assets/js/lesson-viewer.js وtests/test_lesson_ui_contract.py | كامل الملفين | `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_*.py'` | Ran 139 tests OK — 124 قائمة و15 جديدًا لعقد ADR-0013 | Confirmed |
| 2026-09-04 | 7.2-Impl | 01f3d6a | clean | tools/verify_lesson.py | — | `python3 tools/verify_lesson.py .` | RESULT: PASS (0 errors) لمرشح نشر واحد | Confirmed |
| 2026-09-04 | 7.2-Impl | 01f3d6a | clean | assets/css/parmaga.css | 880 إلى النهاية | `tail -n +880 assets/css/parmaga.css \| sha1sum` و `tail -n +880 assets/css/parmaga.css \| wc -l` | f8bf32aa9b06dd8d72704d6abab9a37a987a14c3 و98 سطرًا، مطابقتان لثابتَي الاختبار؛ وعقد الطباعة لم يُمَس | Confirmed |
| 2026-09-04 | 7.2-Impl | 01f3d6a | clean | assets/js/lesson-viewer.js وtests/test_lesson_ui_contract.py | 74 و1018 و187 و298 | `grep -rc -e "D3" -e "D4" -e "الانحراف" assets/js/lesson-viewer.js tests/test_lesson_ui_contract.py` | صفر مطابقة بعد ترقية المرجع إلى ADR-0013 §2 و§3؛ البندان 14 و15 من V1 مستوفيان، ولا assert كان معلقًا على التسميتين | Confirmed |
| 2026-09-04 | 7.2-Impl | 01f3d6a | clean | نطاق الفرق عن origin/main | — | `git diff --name-only 4f7e8c3..HEAD` و `git ls-files --eol` | ملفان اثنان فقط وw/crlf محفوظ فيهما — صفر CSS وHTML وSVG وmanifest وADR وtools و.github | Confirmed |
| 2026-09-04 | 7.2-Impl | 01f3d6a | clean | حدود التنفيذ في ADR-0013 | 398–436 | `git status -sb` و `git log --oneline origin/main -1` | الفرع feat/phase-7.2-adr-0013-implementation محلي بلا upstream، وorigin/main عند 4f7e8c3 وهو والد 01f3d6a؛ ولم تُشغَّل Gate A على هذا الالتزام | Confirmed |
| 2026-09-04 | 7.2-Closeout | 0f6cb3c | clean | مستودع parmaga | — | `git rev-parse HEAD` و `git show --stat HEAD` و `git status -sb` | merge commit حقيقي بأبوين 4f7e8c3 و70f3453، وثلاثة ملفات بإحصاء 228 إضافة و19 حذفًا، وmain = origin/main بشجرة نظيفة | Confirmed |
| 2026-09-04 | 7.2-Closeout | 0f6cb3c | clean | GitHub Actions | — | `curl -s .../actions/runs?per_page=12` | Gate A «Verify lessons» ناجحة على رأس الـPR 70f3453 في run 33897875834، وعلى main 0f6cb3c في run 33897910289؛ وpages build and deployment ناجح في 33897909049 | Confirmed |
| 2026-09-04 | 7.2-Closeout | 0f6cb3c | clean | GitHub REST — PR #20 | — | `curl -s .../pulls/20` و `curl -s .../pulls/20/files` | merged: True في 2026-09-04T16:56:40Z، وmerge_commit_sha = 0f6cb3c، وchanged_files = 3: lesson-viewer.js (68/14) والدفتر (25/0) وtest_lesson_ui_contract.py (135/5) | Confirmed |
| 2026-09-04 | 7.2-Closeout | 0f6cb3c | clean | حراس ما بعد الدمج على main | — | `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -p 'test_*.py'` و `python3 tools/verify_lesson.py .` | Ran 139 tests OK، وRESULT: PASS (0 errors) | Confirmed |
| 2026-09-04 | 7.2-Closeout | 0f6cb3c | clean | assets/css/parmaga.css | 880 إلى النهاية | `tail -n +880 assets/css/parmaga.css \| sha1sum` و `tail -n +880 assets/css/parmaga.css \| wc -l` | f8bf32aa9b06dd8d72704d6abab9a37a987a14c3 و98 سطرًا على baseline الدمج — عقد الطباعة لم يُمَس | Confirmed |
| 2026-09-04 | 7.2-Closeout | 0f6cb3c | clean | قرار المالك | — | نص المالك في جلسة 2026-09-04 | صدر إذن مستقل بتنفيذ ADR-0013 وbaseline عند 4f7e8c3 قبل الدفع؛ ونصّه الحرفي مقيَّد في §3، وتفسيره بوصفه إذنًا هو إعادة صياغة المنفِّذ لا نص المالك | Reported |
| 2026-09-04 | 7.2-Closeout | 0f6cb3c | clean | تسلسل الإذن الزمني | — | مراجعة تسلسل الجلسة مقابل ADR-0013 السطور 398–436 | التنفيذ المحلي سبق صدور الإذن، والإذن صدر قبل أي دفع أو PR؛ فالانحراف إجرائي في التوقيت لا في النطاق، ولم يصل أثر غير مأذون إلى origin | Confirmed |
| 2026-09-04 | 7.2-Closeout | 0f6cb3c | clean | §10 — بلوك تسليم 7.2-Impl | — | مقارنة حقل HEAD ببلوكات 6.2 و7 و7.1 | حقل HEAD في بلوك التنفيذ حمل 01f3d6a أي التزام الكود، بينما عرف البلوكات السابقة أن يحمل baseline العمل 4f7e8c3؛ والتصحيح مقيَّد هنا ولا يُحذف النص | Confirmed |
| 2026-09-04 | 7.2-Closeout | 0f6cb3c | clean | V2 — التحقق المتصفحي | ADR-0013 §V2 | لم يُشغَّل | بنوده كلها تبقى Unknown: بدء الحركة بإيماءة واحدة، ونقل التركيز إلى «إيقاف مؤقت»، وبقاء لوحة «كتابة»، وسلوك مهلة 5000ms بعد الإيقاف أو الاكتمال، وEscape، وreduced motion، والفشل الشبكي | Needs Verification |

نُفِّذت أوامر §M من برومبت المرحلة وطابقت مخرجاتها معايير القبول، فحُوِّل صف الحزمة إلى `Confirmed` وأُضيف صف القياس المقابل له.

### مصالحة إغلاق المرحلة 3 — 2026-08-29

سبقت هذه المصالحةَ فجوةٌ بين الواقع والتوثيق: نُفِّذت المرحلتان 2 و3 ودُمجتا، بينما بقي الدفتر يصف المرحلة 2 بأنها لم تبدأ والمرحلة 3 بأنها محجوبة، وبقي README ينفي وجود أي ملف SVG أو مجلد `assets/lessons/`. صحّحت هذه المرحلة الوصف دون المساس بأي أصل أو manifest أو أداة تحقق أو workflow أو إعداد استضافة، ودون حذف النص التاريخي: ما بطل يُوسم `Superseded` ويبقى مقروءًا.

### مصالحة إغلاق المرحلة 5 — 2026-08-30

سبقت هذه المصالحةَ فجوةٌ بين الواقع والتوثيق: نُفِّذت المرحلة 5 ودُمجت في cf41d264 ونجحت Gate A مرتين وصار الرابط الدائم حيًّا، بينما بقي الدفتر يصف المرحلة 5 بأنها `In Progress`، ويثبّت عقد التسليم عند 8324aa0، ويقرر في §9 أنه «لم يُدمج شيء ولم يتغير HEAD وما زال الرابط يعيد 404». صحّحت هذه المصالحة الوصف وحده: لم يُمَس HTML ولا JavaScript ولا CSS ولا SVG ولا manifest ولا أداة التحقق ولا الاختبارات ولا workflow ولا CNAME ولا .gitattributes ولا إعدادات Pages ولا Ruleset، ولم يُنشأ ADR ولم يُعدَّل ADR-0007. ولم يُحذف نص تاريخي: ما بطل يُوسم `Superseded` ويبقى مقروءًا.

### مصالحة إغلاق المرحلة 7 — 2026-09-02

سبقت هذه المصالحةَ فجوةٌ بين الواقع والتوثيق: نُفِّذت المرحلة 7 في b845bae ودُمجت في 1ca43c1 عبر PR #14، ونجحت Gate A على رأس الـPR وعلى main، بينما بقي §7 يصف المرحلة 7 بأنها `In Progress`، وبقي §2 خاليًا من commit التنفيذ وbaseline الدمج وأرقام الـruns، وبقي §10 عالقًا على المرحلة 6.2 يقرر أن PR #13 مفتوح غير مدموج. صحّحت هذه المصالحة الوصف وحده: لم يُمَس HTML ولا CSS ولا JavaScript ولا SVG ولا manifest ولا أداة التحقق ولا الاختبارات ولا workflow ولا ADR-0011، والملف المتغير واحد هو دفتر الأدلة. ولم يُحذف نص تاريخي: ما بطل يُوسم `Superseded` ويبقى مقروءًا، وشرط الإغلاق الأصلي في §7 يبقى منصوصًا كما كُتب.

وحدّ هذا الإغلاق معلن: يشهد لعقد الطباعة البنيوي كما نصّ عليه ADR-0011، ولا يشهد لقياس محفوظ لأعداد الأوراق. شرط «22 ورقة بالضبط على A5 وA4 وLetter مقيسة بعدّ PDF» لم يُستوفَ، وتنازل المالك عنه صريحًا وقبل الإغلاق على أساس مشاهدة بصرية بلا إنشاء PDF. فالأعداد الثلاثة مقيَّدة `Reported / owner-accepted — not Confirmed by retained PDF measurement`، والمخاطرة المقبولة أنه لا يوجد artifact PDF ولا قياس محفوظ قابل لإعادة التشغيل عبر محركات الطباعة. وعقد الطباعة مجمد بعد هذا الإغلاق، فلا يُعاد فتحه إلا بطلب مستقل من المالك. ولا يفتح هذا الإغلاق أي مرحلة تالية، ولا يحجز رقم قرار، ولا يُنفَّذ منه أي بند من بنود `Unknown` القائمة.

### مصالحة إغلاق المرحلة 7.1 — 2026-09-03

سبقت هذه المصالحةَ فجوةٌ بين الواقع والتوثيق: صدر ADR-0012 ودُمج في fe9f9cf عبر PR #16، ثم نُفِّذت المرحلة 7.1 في e640f1a ودُمجت في f9df9df عبر PR #17، ونجحت Gate A على رأس الـPR وعلى main. بينما بقي §7 يصف المرحلة 7.1 بأنها `In Progress` بشرط إغلاق تسليم القرار وحده، وبقي §2 خاليًا من commit التنفيذ وbaseline الدمج وأرقام الـruns وسطرَي PR #16 وPR #17، وبقي §10 يحمل بلوكين بحالة `In Progress` أحدهما بلا فقرة إبطال قبل خَلَفه، وأحدثهما قالب نصف مُعبَّأ بحقل HEAD غير مُملأ وإحالة إلى صفوف §8 بوسم `7.1-Impl` لا وجود لها. صحّحت هذه المصالحة الوصف وحده: لم يُمَس HTML ولا CSS ولا JavaScript ولا الاختبارات ولا SVG ولا manifest ولا أداة التحقق ولا workflow ولا ADR-0011 ولا ADR-0012، والملف المتغير واحد هو دفتر الأدلة. ولم يُحذف نص تاريخي: ما بطل يُوسم `Superseded` ويبقى مقروءًا، وشرط الإغلاق الأصلي في §7 يبقى منصوصًا كما كُتب.

وحدّ هذا الإغلاق معلن: يشهد لما قِيس بأمر مُشغَّل — الحراسات السبع وGate A بمصدرين مستقلين — ولا يشهد لسلوك متصفحي. فبنود الفحص اليدوي تبقى `Unknown` كما هي، ولا يفتحها هذا الإغلاق. ويشهد لوجود انحرافين عن ADR-0012 لا لتسويتهما: نص §11 على ثلاثة أشكال قلم مقابل قلم واحد منفَّذ، وامتثال مسار الطيّ بالنقر خارج الطبقة غير المحسوم. ولم يُصَغ لهما Amendment ولا قرار مُبطِل، ولم يُحجز رقم قرار. وصُحِّح في هذه المصالحة توصيفٌ سابق كان يُنسب إلى §7 و§8 عدَّ ثلاثة مسارات طيّ، ولا يحمله نصّهما. ولا يفتح هذا الإغلاق أي مرحلة تالية، ولا يحذف فرعًا من الأحد عشر فرعًا القائمة.

### مصالحة إغلاق المرحلة 7.2 — 2026-09-04

أُغلقت المرحلة 7.2 على مرحلتين متمايزتين: تسليم قرار ADR-0013 دُمج في 4f7e8c3 عبر PR #19 بثلاثة ملفات هي القرار وREADME والدفتر، ثم صدر إذن مالك مستقل بالتنفيذ وbaseline عند 4f7e8c3، فنُفِّذ التنفيذ في التزامين على فرع feat/phase-7.2-adr-0013-implementation: 01f3d6a للكود والاختبارات، و70f3453 لقيد الأدلة، ودُمجا في 0f6cb3c عبر PR #20 بmerge commit حقيقي بأبوين. وانحصر الفرق في المسارات الثلاثة المنصوص عليها في حدود التنفيذ: lesson-viewer.js وtest_lesson_ui_contract.py والدفتر — صفر HTML وصفر CSS وصفر SVG وصفر manifest وصفر tools وصفر .github وصفر ADR.

وأُغلق بهذا التنفيذ انحرافا ADR-0012 اللذان بقيا معلقين منذ إغلاق 7.1: نصّ §11 على ثلاثة أشكال قلم مقابل قلم واحد منفَّذ، وامتثال مسار الطيّ بالنقر خارج الطبقة. أُغلقا نصًّا بترقية المرجع في التعليقات وdocstrings من تسميتي D3 وD4 إلى ADR-0013 §2 و§3، تنفيذًا للبندين 14 و15 من V1، ودون تغيير سلوكي — فلا assert كان معلقًا على التسميتين، وعدد الاختبارات ارتفع من 124 إلى 139 بخمسة عشر اختبارًا جديدًا لعقد الإيماءة الواحدة ومهلة 5000ms المعلَّقة أثناء التشغيل.

وحدّ هذا الإغلاق معلن: يشهد لما قِيس بأمر مُشغَّل — 139 اختبارًا وverify_lesson.py وبصمة الطباعة ونطاق الفرق وأرقام Gate A الثلاثة — ولا يشهد لسلوك متصفحي. فبنود V2 كلها تبقى Unknown كما نصّ عليها القرار، ولا يفتحها هذا الإغلاق ولا يُنفَّذ منها شيء.

ويقيَّد في هذه المصالحة انحراف إجرائي صريح: بدأ التنفيذ محليًا قبل استيفاء شرطَي «إعطاء baseline جديد» و«إذن مالك مستقل» المنصوص عليهما في قسم PR التنفيذ اللاحق من ADR-0013. وصدر الإذن والـbaseline من المالك قبل الدفع، فلم يصل أثر غير مأذون إلى origin، والانحراف في التوقيت لا في النطاق. ويقيَّد كذلك تصحيح اصطلاحي: حقل HEAD في بلوك تسليم 7.2-Impl حمل التزام الكود 01f3d6a بدل baseline العمل 4f7e8c3 الذي جرى عليه عرف البلوكات السابقة. لا يُحذف النص التاريخي في الحالين، ويُقرأ التصحيح هنا وفي §8.

ولا يفتح هذا الإغلاق أي مرحلة تالية: لا المرحلة 8 تبدأ، ولا رقم ADR يُحجز، ولا favicon ولا Open Graph ولا SEO ولا sitemap ولا فهارس الدروس، ولا يُعاد فتح قرار og:image، ولا يُحذف فرع من الفروع القائمة. وعقد الطباعة يبقى مجمدًا: ADR-0011 و@media print و@page لا تُفتح إلا بطلب مالك مستقل.


### Known Limitations للمرحلة 5 — مسجَّلة لا منفَّذة

هذه ديون معلنة، أُقرَّت مع الإغلاق ولم تُعالَج فيه. لا يجوز اشتقاق تعديل واجهة من وجودها هنا، ولا يفتح أي منها مرحلة.

- **دين 1 — Bug عالي: ازدواج مرئي.** ظهور المنصة التفاعلية والقائمة الساكنة معًا بعد نجاح التهيئة. الازدواج نفسه `Reported` من المالك ولم يُقَس هنا. والادعاء بأن المعالجة الحالية تضيف outline فقط `Needs Verification`: القاعدة عند parmaga.css:603–604 تضبط outline وoutline-offset، لكن محدِّدها لم يُقرأ ولم يُفحص وجود قاعدة إخفاء.
- **دين 2 — Bug عالي: كتابة الـhash.** goTo تكتب window.location.hash عند lesson-viewer.js:856 — `Confirmed` من المصدر. وارتباط ذلك بقفزة تمرير نحو المرساة الساكنة `Reported` من المالك، إذ لم تُقَس القفزة في هذه المصالحة.
- **دين 3 — Debt عالي: لا Pause/Resume.** المتاح إعادة وتخطٍّ لا إيقاف مؤقت واستئناف — `Confirmed` من HTML وJavaScript معًا.
- **دين 4 — Debt متوسط/عالي في تجربة الاستخدام والوصولية: Reduced Motion.** اكتشاف التفضيل `Confirmed` عند parmaga.css:607 وlesson-viewer.js:972. أما كونه يعطّل الإعادة والتخطي والقلم بدل تقديم واجهة ثابتة مبسطة بلا عناصر تحكم ميتة، فـ`Needs Verification` لأن السلوك لم يُقرأ.
- **دين 5 — Debt متوسط: لا وصول سريع لصفحة.** لا توجد وسيلة انتقال مباشر إلى صفحة بعينها، فالوصول الخطي إلى صفحة بعيدة يتطلب ضغطات متعددة — `Reported`.
- **دين 6 — Debt متوسط: حمل معرفي على الهاتف.** تعدد الأزرار في طبقة تحكم واحدة — `Reported`. وعدد الأزرار تحديدًا غير مقيَّد: القياس المتاح تسعة ورودات لسمات data-viewer- وهي ليست عدد أزرار.

حالات `Unknown` صراحةً — لم تُقَس ولا يجوز وصفها بنجاح ولا بإخفاق: السلوك على هاتف حقيقي، وإعداد تقليل الحركة على Windows، وإزاحة التخطيط التراكمية CLS، وتجربة قارئ الشاشة، والتكبير، والشبكة البطيئة.

### مجال المراجعة المعمارية المستقلة المقترح

Recommended area for independent architectural review: Mobile Lesson Viewer UX/UI

Status: Awaiting Independent Owner Approval — Not Opened

لا رقم مرحلة مخصَّص لهذا المجال، ولا ADR له. ولا وجود لـADR-0008 ولا اعتماد له. ولا يبدأ تنفيذ أي بند من الديون الستة من هذا الإغلاق.

### Deferred Observations

هذه ملاحظات مسجَّلة لا تُنفَّذ في هذه المرحلة، ولا تُحوَّل إلى تعديلات إلا بقرار مستقل:

- **Node.js 20 deprecation:** تصدر GitHub Actions تحذير إهمال لبيئة تشغيل Node.js 20 المستخدمة في الإجراءات المثبَّتة داخل workflow التحقق. التحذير لا يُفشل Gate A ولم يؤثر في أي run. الحالة `Reported`، والمعالجة مؤجلة إلى مرحلة صيانة مستقلة تراجع تثبيت إصدارات الإجراءات.
- **الفرع المحلي `phase-2-verification-gate-a`:** ما زال موجودًا محليًا عند 0de5f31 وupstream له محذوف. تنظيفه خارج نطاق هذه المرحلة ولم يُمَس.
- **صفحة عرض الدرس:** كانت غير موجودة عمدًا، وهذه الملاحظة الآن `Superseded` — 2026-08-30: أنشأتها المرحلة 5 ودُمجت في cf41d264، والرابط الدائم يعيد HTTP 200.
- **ترتيب المراحل في §6:** نص القاعدة يذكر `0 → 1 → 2 → 3 → 4` ولم يُحدَّث بعد تنفيذ المرحلة 5. تصحيح الصياغة خارج نطاق هذه المصالحة ولم يُمَس، وهو مسجَّل هنا لقرار مستقل.

قاعدة إنهاء التسلسل: SHA إغلاق أي مرحلة يُقيَّد في commit تدوين لاحق، ولا يُقيَّد SHA لـcommit التدوين نفسه، منعًا لتسلسل لا نهائي. commit التدوين ليس مرحلة ولا يفتح واحدة.

تعديل مسار التدوين بعد تفعيل Gate B — 2026-08-29: طُبِّقت هذه القاعدة قبل اليوم بدفعة مباشرة إلى main، وهو مسار صارت Gate B تمنعه. تبقى القاعدة نفسها بلا تغيير في مضمونها، ويتغير مسارها وحده: commit التدوين يمر عبر فرع وPR وGate A ناجحة مثل أي تغيير آخر. ولا يجوز لتنفيذه bypass ولا direct push ولا commit فارغ. ويبقى merge SHA لـPR التدوين نفسه غير مقيَّد نصًا، وهو موضع توقف التسلسل، ويُثبت خارجيًا عند الحاجة من تاريخ المستودع.

مدخل `ADR-0004 و ADR-0005` المؤرَّخ 2026-08-26 مصدره لصق نصي من مالك المشروع لا أمر `git show`، فيبقى `Needs Verification` حتى يُقرأ من الشجرة بأمر موجّه عند الحاجة إليه.

---

## 9. الأسئلة المفتوحة

وعاء تسوية ADR-0012 — `Resolved by owner decision` في 2026-09-03:

> اختار المالك ADR-0013 مستقلًا يعدّل ADR-0012 وفق البنود الأربعة في عقد التسليم، وفتح المرحلة 7.2 صراحةً. فلا يُنشأ ملف Amendment بلا رقم، ولا يُستخدم الرقم 0013 للمرحلة 8.

وتبقى المرحلة 8 — الهوية والمشاركة والسيو — غير مفتوحة. ويظل التعارض بين بطاقة مشاركة خاصة بكل درس وقرار §3 الحرفي «(ج): og:image صورة موقع واحدة ثابتة» محتاجًا قرار مالك مستقل قبل أي تنفيذ. والـfavicon يستخدم أصول الهوية القائمة وحدها إن فُتحت المرحلة، ولا يُقترح أصل بديل.

سؤال المرحلة 3 — `Resolved by execution` في 2026-08-29:

> هل اكتمال المرحلة 3 يعني نشر ملفات SVG فقط، مع بقاء permalink الدرس على 404، أم يجب أن يصبح permalink الدرس نفسه تجربة قابلة للزيارة؟

نُفِّذت المرحلة 3 بالنطاق الأضيق فعليًا: نُشرت الأصول وتُحقق منها، ولم تُنشأ صفحة درس. فكان الشق الأول هو الواقع المقيَّد آنذاك، وبقي الرابط الدائم على 404 بوصفه `expected-404` طوال المرحلتين 3 و4.

قيد نطاق زمني — 2026-08-30: وصف `expected-404` الآن `Superseded` بوصفه حالة راهنة. أنشأت المرحلة 5 صفحة الدرس ودُمجت، والرابط الدائم يعيد HTTP 200 بدليل مقيَّد في §8. ويبقى `expected-404` صحيحًا لمستويات الفهارس وحدها.

السؤال الذي كان مفتوحًا:

> متى تُنشأ صفحة عرض الدرس على المسار الدائم، وبأي شكل، ومن يعتمد ذلك؟

**حالته الآن: `Resolved by execution` في 2026-08-30 — القرار معتمد وتنفيذه مدموج ومتحقَّق منه.** يبقى التمييز بين المستويين مسجَّلًا لأنه كان جوهر الفجوة التي عالجتها مصالحة الإغلاق:

> **قرار معتمد:** صدر اعتماد المالك ببدء المرحلة 5، وصدر `ADR-0007` بحالة `Accepted` فحسم الشكل: صفحة ثابتة على مستوى الدرس وحده، تعرض الصفحات الـ22 عبر `<img>` بأبعاد صريحة وتحميل مؤجل، بمراسي `#page-1 … #page-22` وفق `ADR-0004 §14` بلا تصفير، ولكل صفحة نص كامل ثابت متاح دون JavaScript. وفوق ذلك عارض تفاعلي اختياري بملف JavaScript خارجي واحد، يجلب نسخة inline واحدة كحد أقصى للصفحة النشطة، ويعيد المحتوى الساكن كاملًا عند أي فشل. و`ADR-0007` هو القرار المستقل الذي تشترطه قائمة تحقق `ADR-0004` لأي تضمين inline، وهو يستجيب لنقاط `ADR-0004 §24` التسع، ويعدّل من `ADR-0003` بنود تأجيل JavaScript والحركة وسياسة التحميل وحدها دون بقيته ودون `ADR-0001`.

> **ما لم يكن قد تحقق عند تدوين القرار — `Superseded` في 2026-08-30:** نصّت هذه الفقرة على أنه «لا يوجد تحقق حي، ولم يُدمج شيء، ولم يتغير HEAD، وما زال الرابط الدائم يعيد 404». كانت صحيحة في تاريخها عند 8324aa0، وأبطلها التنفيذ: دُمجت المرحلة 5 في cf41d264 عبر PR #6 من implementation f7e1f467، ونجحت Gate A على الـPR وبعد الدمج، وأعاد الرابط الدائم HTTP 200 عند إعادة الجلب. والأدلة مقيَّدة في `§8` بعد الدمج والقياس الفعلي لا قبلهما، فالقاعدة نفسها لم تُخرق. ويبقى قيدها الأصلي ساريًا لكل تنفيذ لاحق.

الجزء الذي يبقى مفتوحًا ولا يحسمه `ADR-0007`:

> متى تُنشأ فهارس Course وTerm وChapter وفهرس `/courses/`، وما شكل التنقل بين الدروس؟ يبقى سلوك 404 على هذه المستويات صحيحًا ومقصودًا حتى قرار مالك مستقل ومرحلة مستقلة.

---

## 10. عقد التسليم النشط

يُملأ هذا القالب في نهاية كل رد عملي، ولا يتجاوز 25 سطرًا عند تعبئته.

```text
دفتر التسليم
المرحلة الحالية: <رقم واسم>
الحالة: <In Progress | Closed | Blocked | Awaiting Approval>
HEAD: <sha> | الفرع: <name> | الشجرة: <clean | dirty + الوصف>
الملفات المعدلة/المضافة: <قائمة قصيرة>
الأدلة الجديدة: <إشارة إلى صفوف §8 المضافة>
القرارات المعتمدة حرفيًا: <إشارة إلى §3 دون إعادة صياغة>
الأسئلة المفتوحة: <إشارة إلى §9>
الانحرافات: <لا يوجد | الوصف>
المرحلة التالية الوحيدة: <رقم واسم>
شرط بدء المرحلة التالية: <الاعتماد المطلوب>
الخطوة التالية الوحيدة: <أمر أو إجراء واحد>
```

دفتر التسليم
المرحلة الحالية: 6.2 — تنفيذ ADR-0009 (V1) وفق عقد ADR-0010، ومعالجة 6.2R لعقد الطباعة
الحالة: In Progress — الدمج موقوف على مراجعة أدلة 6.2R وبنود Unknown، وPR #13 مفتوح غير مدموج
HEAD: cd44530 (إصلاح CSS) ثم التزام استكمال الأدلة على الفرع نفسه | الفرع: feat/adr-0009-0010-lesson-viewer | الشجرة: clean
الملفات المعدلة في 6.2: index.html وparmaga.css وlesson-viewer.js وREADME.md والدفتر — خمسة لا سادس لها؛ و6.2R حصر تعديله في parmaga.css والدفتر
الأدلة الجديدة: صفوف §8 بوسم 6.2R — رصد All = 45 صفحة، والسبب المقاس، وBaseline Finding، ونتيجة 22 ورقة بعد الإصلاح
القرارات المعتمدة حرفيًا: ADR-0009 §1–§5 وADR-0010 §2–§10 و§13–§15، وقرار نطاق 6.2R في §3، وV2 لم يُنفَّذ
الأسئلة المفتوحة: §9 كما هي، بلا طيّ ولا إضافة
الانحرافات: الثلاثة المعلنة سابقًا كما هي، ويضاف رابع طباعي: استبعاد lesson-head وlesson-foot من الطباعة وحدها لأن 45 = 1 + 44 تُثبت أنهما يستهلكان ورقة، والعنوان محفوظ داخل page-001.svg
حالة التحقق: 61/61 OK وRESULT: PASS (0 errors) وdiff --check نظيف بـcr-at-eol، وصفر SVG وmanifest وADR وtools وtests و.github في الفرق، وGate A success على cd44530 — Gate A - Lesson verification
بنود Unknown الباقية: كما هي، وقد أُغلق منها بند معاينة الطباعة للمسار المصور على Chromium وحده
المرحلة التالية الوحيدة: مراجعة أدلة 6.2R واتخاذ قرار الدمج
شرط بدء المرحلة التالية: إذن مالك صريح، وV2 لا يبدأ قبله
الخطوة التالية الوحيدة: تسليم تقرير 6.2R إلى المالك
ورق الطباعة المعتمد: A5 — المعاينة 22 صفحة، والفسحة الرأسية 61px بعد قياس h2 = 40px؛ وLetter قيست 22 أيضًا بفضل max-height: 8.4in؛ وانحراف طباعي معلن: إعداد L المرجعي Letter والمالك اعتمد A5

قيد إبطال — 2026-09-02: بلوك «دفتر التسليم» أعلاه يصف المرحلة 6.2 بحالة `In Progress` وPR #13 مفتوحًا غير مدموج. كان صحيحًا في تاريخه، وهو الآن `Superseded`: دُمج PR #13 في efade0c، ثم نُفِّذت المرحلة 7 ودُمجت في 1ca43c1 عبر PR #14. لا يُحذف النص التاريخي، ويُقرأ البلوك التالي وحده بوصفه عقد التسليم النشط.

دفتر التسليم
المرحلة الحالية: 7 — عقد الطباعة (ADR-0011)
الحالة: Closed — 2026-09-02، مدموجة في 1ca43c1 عبر PR #14، والإغلاق توثيقي بلا أي تعديل runtime
HEAD: 1ca43c1348341deb67c0a9c78e587a35038d2508 | الفرع: main | الشجرة: clean
الملفات المعدلة/المضافة: docs/ai/ARCHITECT_EVIDENCE_LEDGER.md وحده في مصالحة الإغلاق — لا HTML ولا CSS ولا JavaScript ولا SVG ولا manifest ولا ADR
الأدلة الجديدة: صفوف §8 بوسم 7-Closeout المؤرَّخة 2026-09-02، وسرد مصالحة إغلاق المرحلة 7
القرارات المعتمدة حرفيًا: §3 بلا إضافة — قرار المالك في هذه المصالحة مقيَّد في §8 بإعادة صياغة المنفِّذ لا كنص حرفي
الأسئلة المفتوحة: §9 كما هي بلا طيّ ولا إضافة
الانحرافات: شرط «22 ورقة مقيسة بعدّ PDF» غير مستوفى وتنازل المالك عنه صريحًا؛ والأعداد Reported / owner-accepted — not Confirmed by retained PDF measurement؛ ولا PDF ولا مخرج عدّ صفحات
حالة التحقق: 61/61 OK وRESULT: PASS (0 errors) وdiff --check صفر بـcr-at-eol، وGate A success في 33467915910 و33467942178
المخاطرة المقبولة: لا artifact PDF ولا قياس محفوظ قابل لإعادة التشغيل عبر محركات الطباعة
عقد الطباعة: مجمد — ADR-0011 و@media print و@page لا يُعاد فتحها إلا بطلب مالك مستقل
بنود Unknown الباقية: كما هي، ولا يفتحها هذا الإغلاق ولا يُنفَّذ منها شيء
المرحلة التالية الوحيدة: لا شيء مفتوح — لا 7.1 ولا 8 يبدأ قبل اعتماد مالك مستقل، ولا رقم ADR محجوز
شرط بدء المرحلة التالية: دمج مصالحة الإغلاق، ونجاح Gate A على main، وإعطاء baseline جديد من المالك
الخطوة التالية الوحيدة: فتح PR مصالحة الإغلاق وانتظار Gate A

قيد إبطال — 2026-09-02: بلوك المرحلة 7 أعلاه اكتمل تنفيذه: دُمجت المصالحة في f1ca028 عبر PR #15 ونجحت Gate A على main في run 33590087701. فخطوته التالية مستوفاة، وهو الآن سجل تاريخي، ويُقرأ البلوك التالي وحده بوصفه عقد التسليم النشط.

دفتر التسليم
المرحلة الحالية: 7.1 — العرض الكامل الافتراضي والجلسة التفاعلية الصريحة وأدوات التحكم العائمة الموحدة
الحالة: In Progress — صدر ADR-0012 بحالة Accepted، ولم يُؤذن بالتنفيذ ولم يبدأ
HEAD: f1ca028e141b57684cce45c326a810f529072ac6 | الفرع: main | الشجرة: clean
الملفات المعدلة/المضافة: ADR-0012-full-view-default-and-unified-floating-controls.md وREADME.md والدفتر — ثلاثة لا رابع لها، وصفر Production Code وصفر ملف اختبار
الأدلة الجديدة: صفوف §8 بوسم 7.1-ADR المؤرَّخة 2026-09-02
القرارات المعتمدة حرفيًا: §3 يضم قرار المالك في الترقيم؛ وما سواه من قراراته في هذا التسليم مقيَّد في §8 بإعادة صياغة المنفِّذ
الأسئلة المفتوحة: §9 كما هي بلا طيّ ولا إضافة
الانحرافات: ثلاثة معلنة — الاستبدال الجزئي مصوغ على نص ADR-0010 §8 المقروء وعلى التنفيذ المقيس لا على نص «لوحتان مفتوحتان دائمًا» غير الموجود؛ وتوسعة نطاق ADR-0009 من الشاشات الصغيرة إلى كل المقاسات مقيَّدة لعلم المالك؛ وADR-0010 §5 و§4 لم يُقرأ نصهما فصيغت قاعدة أسبقية محصورة بالمجال بدل استشهاد مسمّى
حالة التحقق: تُقيَّد نتائج Gate A المحلي وGate A على PR بعد التشغيل الفعلي لا قبله
عقد الطباعة: مجمد — ADR-0011 و@media print و@page خارج النطاق بنص ADR-0012 §1
بنود Unknown الباقية: كما هي، ويضاف إليها نص ADR-0010 §4 و§5 غير المقروء
المرحلة التالية الوحيدة: تنفيذ المرحلة 7.1 وفق ADR-0012 — ولا يبدأ قبل إذن مالك مستقل، ولا تُفتح المرحلة 8، ولا يُحجز رقم ADR
شرط بدء المرحلة التالية: دمج ADR-0012، ونجاح Gate A على main، وإعطاء baseline جديد من المالك، وتأكيد رقم القرار الفعلي
الخطوة التالية الوحيدة: فتح PR القرار وانتظار Gate A

قيد إبطال — 2026-09-03: بلوك تسليم القرار أعلاه يصف المرحلة 7.1 بحالة `In Progress` وأنه «لم يُؤذن بالتنفيذ ولم يبدأ». كان صحيحًا في تاريخه، وهو الآن `Superseded`: دُمج ADR-0012 في fe9f9cf عبر PR #16، ثم أُذن بالتنفيذ ونُفِّذ في e640f1a. لا يُحذف النص التاريخي، ويُقرأ البلوك التالي بوصفه خَلَفه. ولم تكن له فقرة إبطال قبل هذه المصالحة، بخلاف سابقتَي 6.2 و7، وهذه الفقرة تسدّ ذلك.

دفتر التسليم
المرحلة الحالية: 7.1 — تنفيذ ADR-0012
الحالة: In Progress — التنفيذ مكتمل محليًا، والدمج موقوف على PR وGate A
HEAD: <sha> | الفرع: <name> | الشجرة: dirty — الملفات الخمسة أدناه، وpycache غير متعقَّب
الملفات المعدلة/المضافة: index.html وparmaga.css وlesson-viewer.js وtests/test_lesson_ui_contract.py والدفتر — خمسة لا سادس لها
الأدلة الجديدة: صفوف §8 بوسم 7.1-Impl المؤرَّخة <التاريخ>
القرارات المعتمدة حرفيًا: §3 بلا إضافة — إذن التنفيذ مقيَّد في §8 بإعادة صياغة المنفِّذ
الأسئلة المفتوحة: §9 كما هي بلا طيّ ولا إضافة
الانحرافات: اثنان جديدان عن ADR-0012 — §11 ينص على ثلاثة أشكال قلم والمنفَّذ قلم واحد من سبعة أجزاء محلية مع زر إظهار وإخفاء، لأن الأشكال الثلاثة قُرئت علامات موضع لا أقلامًا فأخلّت الوسيلةُ بغاية الوضوح؛ و§7 و§8 يعدّان مسارات الطيّ الثلاثة والمنفَّذ يضيف رابعًا هو النقر خارج الطبقة، يطوي ولا يفتح ولا يعيد ضبط المهلة فتبقى مصادر §8 الأربعة كما هي. وانحرافات تسليم القرار الثلاثة قائمة كما سُجِّلت
حالة التحقق: 124/124 OK وRESULT: PASS (0 errors) وdiff --check صفر بـcr-at-eol، وكتلة الطباعة ثابتة على f8bf32aa بـ98 سطرًا
عقد الطباعة: مجمد — لم تُمَس @media print ولا @page ولا ADR-0011
بنود Unknown الباقية: كما هي، ويضاف إليها الفحص اليدوي في المتصفح وسلوك النقر الخارجي على iOS
المرحلة التالية الوحيدة: لا شيء مفتوح — لا 8 تبدأ ولا رقم ADR يُحجز
شرط بدء المرحلة التالية: دمج التنفيذ، ونجاح Gate A على main، وإعطاء baseline جديد من المالك
الخطوة التالية الوحيدة: فتح فرع وPR وانتظار Gate A

قيد إبطال — 2026-09-03: بلوك المرحلة 7.1 أعلاه اكتمل تنفيذه: دُمج التنفيذ في f9df9df عبر PR #17 ونجحت Gate A على رأس الـPR في run 33613351199 وعلى main في run 33613399178. فخطوته التالية مستوفاة، وحقلا HEAD والأدلة فيه بقيا غير مُملأين، وهو الآن سجل تاريخي. ويُقرأ البلوك التالي وحده بوصفه عقد التسليم النشط.

دفتر التسليم
المرحلة الحالية: 7.1 — تنفيذ ADR-0012
الحالة: Closed — 2026-09-03، مدموجة في f9df9df عبر PR #17، والإغلاق توثيقي بلا أي تعديل runtime
HEAD: f9df9df4697bf407f1c3028c792cdf9e9d7994b8 | الفرع: main | الشجرة: clean
الملفات المعدلة/المضافة: docs/ai/ARCHITECT_EVIDENCE_LEDGER.md وحده في مصالحة الإغلاق — لا HTML ولا CSS ولا JavaScript ولا اختبارات ولا SVG ولا manifest ولا ADR
الأدلة الجديدة: صفوف §8 بوسم 7.1-Closeout المؤرَّخة 2026-09-03، وسرد مصالحة إغلاق المرحلة 7.1
القرارات المعتمدة حرفيًا: §3 بلا إضافة — ولا تعديل على ADR-0012 في هذه المصالحة
الأسئلة المفتوحة: §9 كما هي بلا طيّ ولا إضافة
الانحرافات: انحرافان عن ADR-0012 قائمان بلا تسوية — §11 ينص على ثلاثة أشكال قلم والمنفَّذ قلم واحد بزر إظهار وإخفاء، وهو مثبت بنص §11؛ ومسار الطيّ بالنقر خارج الطبقة غير محسوم امتثاله لأن §8 يحصر إعادة ضبط المؤقت بالتفاعل داخل أدوات التحكم. وتوصيف «§7 و§8 يعدّان ثلاثة مسارات طيّ» صُحِّح في §8: لا مقطع مقروء يعدّها عدًّا صريحًا
حالة التحقق: G1 صفر أثر، وG4 بصمة f8bf32aa بـ98 سطرًا، وG5 CRLF 100% في الخمسة، وG6 صفر بـcr-at-eol، وG7a 124/124 OK، وG7b RESULT: PASS (0 errors)، وGate A success في 33613351199 و33613399178
عقد الطباعة: مجمد — لم تُمَس @media print ولا @page ولا ADR-0011، وبصمة ADR-0011 e1e901cd ثابتة. وقيد نافذ مقيَّد في §8: كتلة الطباعة مفتوحة من الأسفل بحكم حارس G4، فأي CSS جديد يسبق السطر 880
بنود Unknown الباقية: الفحص اليدوي في المتصفح — امتداد القلم أسفل السطر عربيًا وإنجليزيًا، وتبدّل نص الزر، والنقر الخارجي على iOS واحتمال لزوم pointerdown بدل click، وEscape، ومهلة 8000ms؛ ونص ADR-0010 §4 و§5 غير المقروء؛ وامتثال النقر الخارجي لـ§7. لا يفتحها هذا الإغلاق ولا يُنفَّذ منها شيء
المرحلة التالية الوحيدة: لا شيء مفتوح — لا المرحلة 8 تبدأ، ولا رقم ADR يُحجز، ولا تسوية لانحرافَي ADR-0012 تُصاغ، ولا فرع يُحذف
شرط بدء المرحلة التالية: دمج مصالحة الإغلاق، ونجاح Gate A على main، وإعطاء baseline جديد من المالك، وتحديد نطاق صريح بين تسوية الانحرافات ونشر دروس جديدة
الخطوة التالية الوحيدة: فتح PR مصالحة الإغلاق وانتظار Gate A


قيد إبطال — 2026-09-03: بلوك إغلاق المرحلة 7.1 أعلاه كان العقد النشط عند baseline f9df9df، وأُبطلت خطوته التالية بدمج مصالحة الإغلاق في 34e6571 عبر PR #18، ثم باعتماد المالك فتح المرحلة 7.2 وإصدار ADR-0013. لا يُحذف البلوك التاريخي، ويُقرأ البلوك التالي وحده بوصفه عقد التسليم النشط.

دفتر التسليم
المرحلة الحالية: 7.2 — امتثال عقد العارض وبدء الحركة بإيماءة واحدة وتعليق مهلة الخمول
الحالة: In Progress — ADR-0013 Accepted، وتسليم القرار وحده مأذون؛ لا إذن تنفيذ
HEAD: 34e65716fb4ad9ba0a063efc480e8539895196cf | الفرع: main | الشجرة: clean
الملفات المعدلة/المضافة المأذونة: docs/decisions/ADR-0013-viewer-conformance-and-single-gesture-motion.md وREADME.md وdocs/ai/ARCHITECT_EVIDENCE_LEDGER.md — ثلاثة لا رابع لها
الأدلة الجديدة: صفوف §8 بوسم 7.2-ADR المؤرَّخة 2026-09-03
القرارات المعتمدة حرفيًا: أضيفت إلى §3 نصوص المالك الأربعة من جلسة المعاينة ونص اعتماد استعادة EOL وفتح 7.2 وإصدار ADR-0013
الأسئلة المفتوحة: وعاء التسوية حُسم بـADR-0013؛ والمرحلة 8 وتعارض og:image باقيان خارج النطاق
الانحرافات: انحراف القلم يُغلق بقرار القلم الواحد؛ والنقر الخارجي يُغلق امتثالًا لمسار setOpenPanel الواحد؛ ويُفتح التزامان مقترنان هما الدخول والتشغيل بإيماءة واحدة وتعليق مهلة اللوحة أثناء التشغيل مع خفضها إلى 5000ms
حالة التحقق قبل تعديل القرار: baseline نظيف عند 34e6571، وHEAD = origin/main، وبصمة الطباعة f8bf32aa بـ98 سطرًا؛ لم تُشغَّل الاختبارات أو verify_lesson.py بعد إنشاء حزمة القرار
عقد الطباعة: مجمد — صفر CSS، وصفر مساس بـ@media print أو @page أو ADR-0011
بنود Unknown الباقية: الفحص المتصفحي لبدء الحركة بإيماءة واحدة، ونقل التركيز، وبقاء لوحة كتابة أثناء التشغيل، ومهلة 5000ms بعد الإيقاف أو الاكتمال، وEscape وreduced motion والفشل الشبكي. ويسقط بند pointerdown على iOS بتأكيد المالك. ونص ADR-0010 §4 و§5 صار مقروءًا ومؤكدًا
المرحلة التالية الوحيدة: تسليم قرار المرحلة 7.2 عبر PR مستقل؛ لا يبدأ التنفيذ ولا المرحلة 8
شرط إغلاق تسليم القرار: diff محصور في الملفات الثلاثة، وCRLF محفوظ، وdiff --check صفر بـcr-at-eol، و124 اختبارًا OK، وverify_lesson.py PASS، وبصمة الطباعة ثابتة، وGate A ناجحة على PR وعلى main
شرط بدء التنفيذ اللاحق: دمج ADR-0013 ونجاح Gate A على main وإعطاء baseline جديد وإذن مالك مستقل
الخطوة التالية الوحيدة: تطبيق حزمة القرار على فرع جديد ثم تشغيل حراس القرار قبل أي commit

قيد إبطال — 2026-09-04: بلوك تسليم قرار المرحلة 7.2 أعلاه كان العقد النشط عند baseline 34e6571، وخطوته التالية استُوفيت: طُبِّقت حزمة القرار ودُمجت في 4f7e8c3 عبر PR #19. لا يُحذف النص التاريخي، ويُقرأ البلوك التالي وحده بوصفه عقد التسليم النشط.

دفتر التسليم
المرحلة الحالية: 7.2 — تنفيذ ADR-0013
الحالة: In Progress — التنفيذ مكتمل محليًا على فرع غير مدفوع، ولا دفع ولا PR قبل استيفاء شرطَي baseline والإذن المستقل
HEAD: 01f3d6ad39dcb6cadcad8caff353dac7b8ca4f1c | الفرع: feat/phase-7.2-adr-0013-implementation | الشجرة: clean
الملفات المعدلة/المضافة: assets/js/lesson-viewer.js وtests/test_lesson_ui_contract.py وdocs/ai/ARCHITECT_EVIDENCE_LEDGER.md — ثلاثة لا رابع لها، وهي عين المسارات الثلاثة المنصوص عليها في حدود ADR-0013
الأدلة الجديدة: صفوف §8 بوسم 7.2-Impl المؤرَّخة 2026-09-04
القرارات المعتمدة حرفيًا: §3 بلا إضافة — لا نص مالك جديد في هذا التسليم
الأسئلة المفتوحة: §9 كما هي بلا طيّ ولا إضافة
الانحرافات: انحراف إجرائي واحد معلن — بدأ التنفيذ قبل استيفاء شرطَي «baseline جديد من المالك» و«إذن مالك مستقل» في قسم PR التنفيذ اللاحق؛ والالتزام محلي غير مدفوع فالأثر قابل للتصحيح كليًا. وانحرافا ADR-0012 D3 وD4 أُغلقا نصًّا بترقية المرجع إلى ADR-0013 §2 و§3 تنفيذًا للبندين 14 و15 من V1
حالة التحقق: 139/139 OK وRESULT: PASS (0 errors) وdiff --check صفر بـcr-at-eol وw/crlf محفوظ، وبصمة الطباعة f8bf32aa بـ98 سطرًا؛ ولم تُشغَّل Gate A على هذا الالتزام لأنه غير مدفوع
تغطية V1: البنود 1–18 مستوفاة محليًا بأوامر مُشغَّلة؛ وV2 المتصفحي كله غير منفَّذ
عقد الطباعة: مجمد — صفر CSS، ولم تُمَس @media print ولا @page ولا ADR-0011
بنود Unknown الباقية: بنود V2 المتصفحية كما نصّ عليها ADR-0013 — بدء الحركة بإيماءة واحدة، ونقل التركيز إلى «إيقاف مؤقت»، وبقاء لوحة «كتابة»، وسلوك مهلة 5000ms بعد الإيقاف أو الاكتمال، وEscape، وreduced motion، والفشل الشبكي
المرحلة التالية الوحيدة: لا شيء مفتوح — لا المرحلة 8 تبدأ، ولا رقم ADR يُحجز، ولا favicon ولا Open Graph ولا sitemap
شرط بدء المرحلة التالية: إعطاء baseline جديد من المالك عند 4f7e8c3، وإذن مالك مستقل بتنفيذ ADR-0013
الخطوة التالية الوحيدة: عرض هذا الدفتر على المالك وانتظار الإذن — لا دفع ولا PR

قيد إبطال — 2026-09-04: بلوك تنفيذ المرحلة 7.2 أعلاه كان العقد النشط عند الالتزام المحلي 01f3d6a، وخطوته التالية استُوفيت: عُرض الدفتر على المالك فصدر الإذن المستقل وbaseline عند 4f7e8c3، ثم دُفع الفرع ودُمج في 0f6cb3c عبر PR #20 بعد نجاح Gate A على رأس الـPR. لا يُحذف النص التاريخي، ويُقرأ البلوك التالي وحده بوصفه عقد التسليم النشط.

دفتر التسليم
المرحلة الحالية: 7.2 — تنفيذ ADR-0013
الحالة: Closed — 2026-09-04، مدموجة في 0f6cb3c عبر PR #20، والإغلاق توثيقي بلا أي تعديل runtime
HEAD: 0f6cb3cde89e5ddbec5673d6016932460ae081f1 | الفرع: main | الشجرة: clean
الملفات المعدلة/المضافة: docs/ai/ARCHITECT_EVIDENCE_LEDGER.md وحده في مصالحة الإغلاق — لا HTML ولا CSS ولا JavaScript ولا اختبارات ولا SVG ولا manifest ولا ADR
الأدلة الجديدة: صفوف §8 بوسم 7.2-Closeout المؤرَّخة 2026-09-04، وسرد مصالحة إغلاق المرحلة 7.2
القرارات المعتمدة حرفيًا: أضيف إلى §3 نصّ إذن المالك بالتنفيذ الصادر في 2026-09-04
الأسئلة المفتوحة: §9 كما هي بلا طيّ ولا إضافة
الانحرافات: انحراف إجرائي واحد مقيَّد — سبق التنفيذُ المحلي صدورَ الإذن، وصدر الإذن قبل الدفع فلم يصل أثر غير مأذون إلى origin؛ وتصحيح اصطلاحي لحقل HEAD في بلوك 7.2-Impl. وانحرافا ADR-0012 D3 وD4 أُغلقا نصًّا بترقية المرجع إلى ADR-0013 §2 و§3
حالة التحقق: 139/139 OK وRESULT: PASS (0 errors) على baseline الدمج، وبصمة الطباعة f8bf32aa بـ98 سطرًا، وw/crlf محفوظ، وdiff --check صفر بـcr-at-eol، وGate A success في 33897875834 و33897910289
تغطية V1: البنود 1–18 مستوفاة بأوامر مُشغَّلة؛ وV2 المتصفحي كله غير منفَّذ ويبقى Unknown
عقد الطباعة: مجمد — لم تُمَس @media print ولا @page ولا ADR-0011، والبصمة ثابتة عبر 7.1-Closeout و7.2-ADR و7.2-Impl و7.2-Closeout
بنود Unknown الباقية: بنود V2 المتصفحية السبعة كما نصّ عليها ADR-0013؛ ولا يفتحها هذا الإغلاق
المرحلة التالية الوحيدة: لا شيء مفتوح — لا المرحلة 8 تبدأ، ولا رقم ADR يُحجز، ولا فرع يُحذف
شرط بدء المرحلة التالية: دمج مصالحة الإغلاق، ونجاح Gate A على main، وإعطاء baseline جديد من المالك، وتحديد نطاق صريح بين تنفيذ V2 المتصفحي ونشر دروس جديدة
الخطوة التالية الوحيدة: فتح PR مصالحة الإغلاق وانتظار Gate A
