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
Current approved phase: Phase 5 — Closeout Reconciliation (توثيق فقط، بلا تغيير إنتاجي)
Current phase status: Closed — COMPLETE WITH KNOWN LIMITATIONS
Next phase: لا يوجد — لا تُفتح مرحلة تالية إلا باعتماد مالك مستقل
```

حالة الشجرة عند اعتماد المرحلة أُثبتت بالأمر `git status --short --branch`، ومخرجه سطر الفرع وحده دون أي سطر حالة.

حالة الشجرة قبل الـstaging أُثبتت بالأمر `git status --short`، ومخرجه ثلاثة مسارات فقط لا رابع لها. أثر الـcommit وأدلة ما بعده مقيَّدة في §8.

SHA الخاص بـcommit الإغلاق لا يُكتب هنا مسبقًا؛ يُقيَّد في §8 بعد تنفيذه فعليًا.

### عرف نهايات الأسطر وأمر الفحص المعتمد

هذا المستودع CRLF بالكامل. قيس بالأمر `grep -c $'\r$'` مقابل `grep -c ""` على خمسة ملفات فكانت النسبة 100% في كلٍّ منها. و`core.autocrlf` و`core.whitespace` غير مضبوطين.

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

---

## 6. قواعد الانتقال بين المراحل

- الترتيب `0 → 1 → 2 → 3 → 4` إلزامي، ولا يجوز تخطي مرحلة ولا دمج مرحلتين.
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

نُفِّذت أوامر §M من برومبت المرحلة وطابقت مخرجاتها معايير القبول، فحُوِّل صف الحزمة إلى `Confirmed` وأُضيف صف القياس المقابل له.

### مصالحة إغلاق المرحلة 3 — 2026-08-29

سبقت هذه المصالحةَ فجوةٌ بين الواقع والتوثيق: نُفِّذت المرحلتان 2 و3 ودُمجتا، بينما بقي الدفتر يصف المرحلة 2 بأنها لم تبدأ والمرحلة 3 بأنها محجوبة، وبقي README ينفي وجود أي ملف SVG أو مجلد `assets/lessons/`. صحّحت هذه المرحلة الوصف دون المساس بأي أصل أو manifest أو أداة تحقق أو workflow أو إعداد استضافة، ودون حذف النص التاريخي: ما بطل يُوسم `Superseded` ويبقى مقروءًا.

### مصالحة إغلاق المرحلة 5 — 2026-08-30

سبقت هذه المصالحةَ فجوةٌ بين الواقع والتوثيق: نُفِّذت المرحلة 5 ودُمجت في cf41d264 ونجحت Gate A مرتين وصار الرابط الدائم حيًّا، بينما بقي الدفتر يصف المرحلة 5 بأنها `In Progress`، ويثبّت عقد التسليم عند 8324aa0، ويقرر في §9 أنه «لم يُدمج شيء ولم يتغير HEAD وما زال الرابط يعيد 404». صحّحت هذه المصالحة الوصف وحده: لم يُمَس HTML ولا JavaScript ولا CSS ولا SVG ولا manifest ولا أداة التحقق ولا الاختبارات ولا workflow ولا CNAME ولا .gitattributes ولا إعدادات Pages ولا Ruleset، ولم يُنشأ ADR ولم يُعدَّل ADR-0007. ولم يُحذف نص تاريخي: ما بطل يُوسم `Superseded` ويبقى مقروءًا.

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

النسخة النشطة الآن:

```text
دفتر التسليم
المرحلة الحالية: 5 — صفحة الدرس الثابتة والعارض التفاعلي المتدرج — Closeout Reconciliation
الحالة: Closed — COMPLETE WITH KNOWN LIMITATIONS — 2026-08-30
HEAD: cf41d264 عند بدء المصالحة | الفرع: فرع مصالحة مخصص | الشجرة: clean — main = origin/main، ولا ملفات غير متعقَّبة
الملفات المعدلة/المضافة: docs/ai/ARCHITECT_EVIDENCE_LEDGER.md وحده — لا ملف ثانٍ، ولا ADR جديد، ولا تعديل على ADR-0007
الأدلة الجديدة: صفوف §8 المؤرخة 2026-08-30 — baseline وأبوا الدمج والتنفيذ ونطاق الملفات الستة والاختبارات والفاحص وPR #6 وGate A مرتين والتحقق الحي والدين المصدري
القرارات المعتمدة حرفيًا: §3 دون إعادة صياغة — ADR-0007 قائم بحالته ولم يُمَس
الأسئلة المفتوحة: §9 — حُسم سؤال صفحة عرض الدرس تنفيذًا، ويبقى سؤال الفهارس والتنقل بين الدروس مفتوحًا
الانحرافات: تصنيفان لم يبلغا Confirmed — معالجة الازدواج المرئي وسلوك Reduced Motion — قُيِّدا Needs Verification بدل Confirmed لأن المصدر لم يُقرأ
حالة التحقق: تحقق محلي منفَّذ — 61 اختبارًا OK وverify_lesson.py RESULT: PASS. وتحقق حي منفَّذ — الرابط الدائم HTTP 200
ديون معلنة: ست ديون UX في §8 مسجَّلة ولم يُنفَّذ منها شيء؛ وست حالات Unknown لم تُقَس
المرحلة التالية الوحيدة: لا يوجد — Mobile Lesson Viewer UX/UI مقترح للمراجعة المستقلة وغير مفتوح
شرط بدء المرحلة التالية: اعتماد مالك مستقل قبل أي ADR أو تعديل واجهة
الخطوة التالية الوحيدة: لا شيء — انتظار قرار المالك
```
