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
Current approved phase: Phase 3 — Closeout Reconciliation
Current phase status: In Progress — SHA الإغلاق: Pending — to be recorded after merge
Next phase: Phase 4 — Gate B (Awaiting Approval — لم يصدر اعتماد بدء)
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

نُفِّذ النطاق الأضيق المقرر في §9: نشر أصول الدرس والتحقق منها بأداة التحقق وGate A، دون إنشاء صفحة HTML للدرس ودون viewer. ولذلك يبقى الرابط الدائم للدرس على 404، وهو سلوك متوقع في هذه الحالة لا إخفاق.

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
| 3-Closeout | In Progress | اعتماد المالك لخطة مصالحة الإغلاق | مطابقة الدفتر وREADME للواقع، وتثبيت سياسة الفحص المحلي أولًا |
| 4 | Awaiting Approval | نجاح Gate A على PR حقيقي وإغلاق المرحلة 3 — مستوفى | تفعيل Ruleset والتحقق منه |

أُغلقت المرحلة 1 بـcommit فعلي هو f2734b5، وقُيِّد SHA في §2 و§8.

الفقرة التي كانت هنا قبل 2026-08-29 نصّت على أن المرحلة 2 لم تبدأ ولم يُنشأ لها شيء. كانت صحيحة في تاريخها، وهي الآن `Superseded`: نُفِّذت المرحلة 2 ودُمجت، ثم نُفِّذت المرحلة 3 ودُمجت. لا يُحذف النص التاريخي، بل يُقيَّد إبطاله هنا وفي §8.

المرحلة 4 استوفت شرط بدئها بنجاح Gate A على PR حقيقي وإغلاق المرحلة 3، ومع ذلك لم تبدأ ولم يصدر اعتماد ببدئها. حالتها `Awaiting Approval` لا `Started` ولا `Complete`. ولا يجوز اعتبار Gate B مفعّلة: لا توجد Rulesets ولا حماية فرع تقليدية على هذا المستودع حتى تاريخه.

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

نُفِّذت أوامر §M من برومبت المرحلة وطابقت مخرجاتها معايير القبول، فحُوِّل صف الحزمة إلى `Confirmed` وأُضيف صف القياس المقابل له.

### مصالحة إغلاق المرحلة 3 — 2026-08-29

سبقت هذه المصالحةَ فجوةٌ بين الواقع والتوثيق: نُفِّذت المرحلتان 2 و3 ودُمجتا، بينما بقي الدفتر يصف المرحلة 2 بأنها لم تبدأ والمرحلة 3 بأنها محجوبة، وبقي README ينفي وجود أي ملف SVG أو مجلد `assets/lessons/`. صحّحت هذه المرحلة الوصف دون المساس بأي أصل أو manifest أو أداة تحقق أو workflow أو إعداد استضافة، ودون حذف النص التاريخي: ما بطل يُوسم `Superseded` ويبقى مقروءًا.

### Deferred Observations

هذه ملاحظات مسجَّلة لا تُنفَّذ في هذه المرحلة، ولا تُحوَّل إلى تعديلات إلا بقرار مستقل:

- **Node.js 20 deprecation:** تصدر GitHub Actions تحذير إهمال لبيئة تشغيل Node.js 20 المستخدمة في الإجراءات المثبَّتة داخل workflow التحقق. التحذير لا يُفشل Gate A ولم يؤثر في أي run. الحالة `Reported`، والمعالجة مؤجلة إلى مرحلة صيانة مستقلة تراجع تثبيت إصدارات الإجراءات.
- **الفرع المحلي `phase-2-verification-gate-a`:** ما زال موجودًا محليًا عند 0de5f31 وupstream له محذوف. تنظيفه خارج نطاق هذه المرحلة ولم يُمَس.
- **صفحة عرض الدرس:** غير موجودة عمدًا، والسؤال المتعلق بها مسجَّل في §9 وينتظر قرار مالك مستقلًا.

قاعدة إنهاء التسلسل: SHA إغلاق أي مرحلة يُقيَّد في commit تدوين لاحق، ولا يُقيَّد SHA لـcommit التدوين نفسه، منعًا لتسلسل لا نهائي. commit التدوين ليس مرحلة ولا يفتح واحدة.

مدخل `ADR-0004 و ADR-0005` المؤرَّخ 2026-08-26 مصدره لصق نصي من مالك المشروع لا أمر `git show`، فيبقى `Needs Verification` حتى يُقرأ من الشجرة بأمر موجّه عند الحاجة إليه.

---

## 9. الأسئلة المفتوحة

سؤال المرحلة 3 — `Resolved by execution` في 2026-08-29:

> هل اكتمال المرحلة 3 يعني نشر ملفات SVG فقط، مع بقاء permalink الدرس على 404، أم يجب أن يصبح permalink الدرس نفسه تجربة قابلة للزيارة؟

نُفِّذت المرحلة 3 بالنطاق الأضيق فعليًا: نُشرت الأصول وتُحقق منها، ولم تُنشأ صفحة درس. فصار الشق الأول هو الواقع المقيَّد، ويبقى الرابط الدائم على 404 بوصفه `expected-404`.

السؤال المفتوح المتبقي، ولا يجوز حسمه ضمنًا أثناء التنفيذ:

> متى تُنشأ صفحة عرض الدرس على المسار الدائم، وبأي شكل، ومن يعتمد ذلك؟

الوضع الحالي — **حالة مقيَّدة لا قرار نهائي**:

> لا تُنشأ صفحة درس ولا viewer ولا فهرس `/courses/` إلا بقرار مالك مستقل ومرحلة مستقلة. وحتى ذلك الحين يبقى سلوك 404 على الرابط الدائم صحيحًا ومقصودًا.

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
المرحلة الحالية: 3 — Closeout Reconciliation
الحالة: In Progress — SHA الإغلاق Pending حتى الدمج
HEAD: 48ecb87 | الفرع: phase-3-closeout-reconciliation | الشجرة: dirty — أربعة ملفات توثيقية فقط
الملفات المعدلة/المضافة: docs/ai/ARCHITECT_EVIDENCE_LEDGER.md، README.md، AI_ARCHITECT_PROTOCOL.md، AI_EXECUTOR_PROTOCOL.md
الأدلة الجديدة: صفوف مصالحة الإغلاق في §8 — baseline والمرحلتان 2 و3 وGate A والجرد وmanifest والنشر الحي وexpected-404
القرارات المعتمدة حرفيًا: §3 — دون إعادة صياغة
الأسئلة المفتوحة: §9 — سؤال المرحلة 3 محسوم بالتنفيذ، ويبقى سؤال صفحة عرض الدرس
الانحرافات: لا يوجد
المرحلة التالية الوحيدة: 4 — Gate B (Awaiting Approval)
شرط بدء المرحلة التالية: اعتماد مالك مستقل — لم يصدر
الخطوة التالية الوحيدة: انتظار اعتماد المالك لبدء المرحلة 4
```
