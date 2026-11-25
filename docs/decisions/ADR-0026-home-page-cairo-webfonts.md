# ADR-0026 — استثناء Cairo المستضاف محليًا للصفحة الرئيسية

## Status

مقبول بقرار المالك لإعادة تصميم الصفحة الرئيسية.

## Context

يمنع ADR-0003 وADR-0004 خطوط الويب، ولم يرفع ADR-0015 ذلك المنع. وتُبقي استراتيجية ADR-0002 ملف CSS خارجيًا واحدًا.

## Decision

يُستثنى Cairo للصفحة الرئيسية فقط: وزنان ثابتان 400 و700 بصيغة WOFF2، مستضافان محليًا في `assets/fonts/`. تُعرّف قاعدتا `@font-face` في `assets/css/parmaga.css` بمسارين نسبيين `../fonts/` ووزنين صريحين، ويُختار الخط من خلال `.page-home`.

يبقى `parmaga.css` ملف CSS الخارجي الوحيد. لا CDN ولا مدير حزم ولا خطوة بناء داخل المستودع أو CI. لا تتغير خطوط صفحات الدروس أو بايتات أغلفة SVG الأصلية.

يستثني `test_no_external_pen_asset` قاعدتَي Cairo المعروفتين فقط: يجب أن تظهر كل قاعدة مرة واحدة بالحرف، ثم تُطبّق المحظورات الأصلية على باقي CSS. لا تغيير في اختبار ملف CSS الواحد أو في فحوص هندسة القلم.

أيقونات التواصل تكون SVG مضمّنًا في HTML، من غير إضافة `url()` لها في CSS.

## Source and license

المصدر المثبّت: [google/fonts — ofl/cairo](https://github.com/google/fonts/tree/d2528f6d1f43e7d9d0d2e1794afe2ad6fd7d56ba/ofl/cairo)، إصدار Cairo 3.130.

- ملف المصدر: [Cairo[slnt,wght].ttf](https://raw.githubusercontent.com/google/fonts/d2528f6d1f43e7d9d0d2e1794afe2ad6fd7d56ba/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf).
- الترخيص: [OFL.txt](https://raw.githubusercontent.com/google/fonts/d2528f6d1f43e7d9d0d2e1794afe2ad6fd7d56ba/ofl/cairo/OFL.txt)، بترخيص SIL Open Font License 1.1. تُشحن نسخته الأصلية بجوار الخطين في `assets/fonts/OFL.txt`.
- SHA الكامل لالتزام المصدر: `d2528f6d1f43e7d9d0d2e1794afe2ad6fd7d56ba`.

## Reproducible preparation

- تجهيز مرة واحدة في بيئة معزولة خارج المستودع: Python `3.12.3` و`fonttools 4.61.1` و`Brotli 1.2.0`.
- تثبيت المحورين باستخدام `fontTools.varLib.instancer.instantiateVariableFont`: ‏`wght=400` أو `wght=700`، و`slnt=0` في الحالتين.
- استخدام `fontTools.subset` مع `layout_features=["*"]`، وحفظ WOFF2 من دون إعادة حساب الطابع الزمني للخط.
- نطاقات المحارف: `U+0020-007E,U+00A0-00BF,U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+2010-2027,U+200C-200F,U+060C,U+061B,U+061F,U+0640,U+064B-0652`.

## SHA-256

| الملف | SHA-256 |
|---|---|
| `Cairo[slnt,wght].ttf` | `667c987182391c91f4e57a2f455b1794fb5e3ee6ca4ef3383e86bb690fa9c964` |
| `Cairo-400.woff2` | `e98c009f87b3cd6bda43561add10b01ee09814857592b21783da7726d1a5d5ed` |
| `Cairo-700.woff2` | `e49a8a987a1b96fa6da2c4171e088f679e20e51da652bea14ea9ad320c62771c` |
| `OFL.txt` | `a4554e1799d42e1405924b61eb0e0722ae1623b1f1f07f995348f96c496362a9` |

## Verification and limitations

فُكّ ترميز الملفين بنجاح. وسوم ميزات GSUB وGPOS في الملفين مطابقة لوسوم المصدر، على مستوى أسماء الوسوم. وسم `liga` غير موجود في المصدر نفسه.

في فحص محارف النص المعتمد، كان `U+2190` ‏(`←`) المحرف الوحيد غير الموجود في الملفين؛ ويُعرض بخط بديل من النظام.

جدول الأسماء في `Cairo-700.woff2` يعرض اسم الفئة `Regular`، لكن الملف ثابت و`OS/2.usWeightClass` يساوي `700`. لذلك يصرّح CSS بـ`font-weight: 700` له وبـ`font-weight: 400` للملف الآخر.

فحص عرض النص العربي وتشكيله في المتصفح مؤجّل إلى التحقق النهائي للصفحة.

## Rollback

عند إلغاء الاستثناء، تُزال قاعدتا الخط وملفات الخط والترخيص المضافة، ويُستعاد مكدس الخط السابق للرئيسية وفحص CSS المشترك من دون استثناء Cairo.
