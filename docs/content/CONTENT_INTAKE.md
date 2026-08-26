# إجراء إدخال المحتوى وحراسة أصول الدروس

يتبع مالك المشروع هذا الإجراء بعد كل Session أوفلاين وقبل نشر أي درس.

> **تحذير:** جميع أوامر الفحص في هذه الوثيقة للقراءة فقط. يُمنع تشغيل أمر يكتب أو يعدل أو يعيد حفظ أصلًا، ويُمنع استخدام `rm` أو `mv` أو `sed -i` أو أي أداة تحسين أو تنظيف. تتم عمليات النسخ وإعادة التسمية خارج قسم الأوامر، مع بقاء الأصل وخصائصه محفوظين.

## 1. تجهيز الأصول

1. اجمع سلسلة الطالب النهائية فقط.
2. استبعد مجموعة «شرح المدرس».
3. أكد العدد المتوقع وترتيب الصفحات.
4. لا تفتح الملفات في أداة قد تعيد حفظها تلقائيًا.
5. احتفظ بنسخة المصدر دون تغيير.

## 2. النسخ إلى مسار الحراسة القانوني

انسخ الأصول، مع الحفاظ على الخصائص، إلى نسخة العمل الخاصة داخل `parmaga-content` تحت مسار يعكس مسار النشر:

```text
assets/lessons/<course>/<term>/<chapter>/<lesson>/
```

يجب أن يبقى المصدر الأصلي في مكانه، وأن توجد نسخة أوفلاين مستقلة.

لا تنسخ الأصول إلى مستودع `parmaga` العام في مرحلة الجرد.

## 3. إعادة التسمية

أعد تسمية نسخة الحراسة فقط وفق:

```text
page-001.svg
page-002.svg
page-003.svg
```

لا تعتمد على الترتيب المعجمي للأسماء القديمة. ثبّت أولًا خريطة الاسم المصدر إلى ترتيب الصفحة المعتمد.

لا تعدّل المحتوى الداخلي للملف أثناء إعادة التسمية.

## 4. تحديد مجلد الفحص

```bash
SVG_DIR='/absolute/path/to/private/custody/lesson'
printf 'SVG_DIR=%s\n' "$SVG_DIR"
```

## 5. قائمة الملفات والعدد

```bash
find "$SVG_DIR" -maxdepth 1 -type f -iname '*.svg' -printf '%f\n' \
  | LC_ALL=C sort

printf 'SVG_COUNT='
find "$SVG_DIR" -maxdepth 1 -type f -iname '*.svg' -printf '.' | wc -c
```

تحقق من عدم وجود فجوة أو تكرار ومن تطابق العدد مع العدد المعلن.

## 6. حساب البصمات

```bash
find "$SVG_DIR" -maxdepth 1 -type f -iname '*.svg' -print0 \
  | LC_ALL=C sort -z \
  | xargs -0 -r sha256sum
```

أعد تشغيل الأمر بصورة مستقلة قبل اعتماد Manifest وقارن الناتجين حرفيًا.

## 7. قراءة الأحجام بالبايت

```bash
find "$SVG_DIR" -maxdepth 1 -type f -iname '*.svg' -print0 \
  | LC_ALL=C sort -z \
  | xargs -0 -r stat --printf='%n\t%s\n'
```

## 8. الأبعاد وXML والنص والخطوط والفحص الأمني

الأمر التالي يقرأ الملفات ويطبع Metadata فقط:

```bash
python3 - "$SVG_DIR" <<'PY'
import hashlib, json, re, sys
from pathlib import Path
import xml.etree.ElementTree as ET

directory = Path(sys.argv[1])
http_re = re.compile(r"https?://", re.I)
event_re = re.compile(r"^on[a-z0-9_-]+$", re.I)
known_namespaces = {
    "http://www.w3.org/2000/svg",
    "http://www.w3.org/1999/xlink",
    "http://www.w3.org/XML/1998/namespace",
    "http://www.w3.org/2001/xml-events",
}

def local(value):
    return str(value).rsplit("}", 1)[-1].lower()

def font_list(value):
    return [
        item.strip().strip("\"'")
        for item in value.split(",")
        if item.strip().strip("\"'")
    ]

result = []

for path in sorted(directory.glob("*.svg"), key=lambda item: item.name):
    data = path.read_bytes()
    bom = data.startswith(b"\xef\xbb\xbf")
    text = data.decode("utf-8-sig")
    root = ET.fromstring(data)

    fonts = set()
    text_count = 0
    flags = {
        "hasScript": False,
        "hasForeignObject": False,
        "hasEventHandlers": False,
        "hasJavascriptUri": False,
        "hasExternalHttpRef": False,
        "hasDataUri": False,
        "hasExternalUse": False,
        "hasEmbeddedImage": False,
        "hasActiveContainer": False,
        "hasStyleImport": False,
    }
    findings = []

    root_attrs = {local(k): str(v) for k, v in root.attrib.items()}

    for element in root.iter():
        tag = local(element.tag)
        attrs = {local(k): str(v) for k, v in element.attrib.items()}

        flags["hasScript"] |= tag == "script"
        flags["hasForeignObject"] |= tag == "foreignobject"
        flags["hasEmbeddedImage"] |= tag == "image"
        flags["hasActiveContainer"] |= tag in {"iframe", "embed", "object"}
        flags["hasEventHandlers"] |= any(event_re.match(k) for k in attrs)

        if tag == "text":
            text_count += 1

        for key, value in attrs.items():
            lower = value.lower()
            flags["hasJavascriptUri"] |= "javascript:" in lower
            flags["hasDataUri"] |= "data:" in lower

            if http_re.search(value) and value not in known_namespaces:
                flags["hasExternalHttpRef"] = True

            if key == "font-family":
                fonts.update(font_list(value))

            if key == "style":
                match = re.findall(
                    r"font-family\s*:\s*([^;}{]+)", value, re.I
                )
                for family in match:
                    fonts.update(font_list(family))

        if tag == "use":
            hrefs = [
                value for key, value in attrs.items()
                if key in {"href", "src"}
            ]
            flags["hasExternalUse"] |= any(
                value and not value.startswith("#") for value in hrefs
            )

        if tag == "style":
            style_text = "".join(element.itertext())
            flags["hasStyleImport"] |= bool(
                re.search(r"@import\b", style_text, re.I)
            )
            for family in re.findall(
                r"font-family\s*:\s*([^;}{]+)", style_text, re.I
            ):
                fonts.update(font_list(family))

    for name, detected in flags.items():
        if detected:
            findings.append(name)

    result.append({
        "sourceFileName": path.name,
        "sha256": hashlib.sha256(data).hexdigest(),
        "bytes": len(data),
        "utf8Valid": True,
        "hasUtf8Bom": bom,
        "width": root_attrs.get("width"),
        "height": root_attrs.get("height"),
        "viewBox": root_attrs.get("viewbox"),
        "xmlWellFormed": True,
        "textElementCount": text_count,
        "fontsReferenced": sorted(fonts, key=str.casefold),
        "security": flags,
        "findings": findings,
    })

print(json.dumps(result, ensure_ascii=False, indent=2))
PY
```

إذا فشل فك UTF-8 أو تحليل XML، توقف وسجل الفشل. لا تعِد حفظ الملف لمعالجته.

## 9. قياس المقاس والمنطقة المحجوزة

تحقق بأداة عرض أو تصميم لا تحفظ الملف تلقائيًا من:

```text
canvas: 1080×1350
blank reserved area: y=1188..1350
```

سجل `PASS` أو `FAIL` أو `UNKNOWN` مع السبب. لا تعتبر برومبت التوليد إثباتًا للقياس.

## 10. تعبئة Manifest

1. استخدم ملف JSON واحدًا للدرس.
2. استخدم UTF-8 بلا BOM ونهايات LF.
3. أدخل القيم من نتائج الأوامر فقط.
4. اجعل القيمة غير المتاحة `null`.
5. اكتب سبب كل قيمة ناقصة.
6. سجل كل finding وقراره.
7. لا تقدّر حجمًا أو بُعدًا أو بصمة.
8. تحقق من أن عدد عناصر `pages` يطابق `declaredPageCount`.

## 11. توليد Context Packet

أنشئ Context Packet لا يتجاوز 8 KB ويحتوي:

- هوية الدرس ومساره.
- العدد والحالة.
- سطرًا لكل صفحة.
- الأبعاد والحجم ونتيجة الفحص والوصف.
- الخطوط والقيود.
- ما هو محسوم وما هو غير محسوم.
- تعليمات تمنع طلب ملفات SVG.

لا تنسخ داخله أي SVG markup أو محتوى كامل من ملفات المصدر.

## 12. الإيداع في المستودع الخاص

أودع في `parmaga-content`:

- الأصول الأصلية.
- خريطة الترتيب إن وجدت.
- برومبتات التوليد.
- ملفات Markdown المجمعة.
- دليل نتائج الجرد.
- النسخة الخاصة من معلومات التسليم عند الحاجة.

لا تفعّل Pages على المستودع الخاص.

## قائمة التحقق

- [ ] سلسلة الطالب فقط موجودة.
- [ ] مجموعة «شرح المدرس» مستبعدة.
- [ ] المصدر الأصلي لم يُعدّل.
- [ ] توجد نسخة محلية.
- [ ] توجد نسخة أوفلاين مستقلة.
- [ ] توجد نسخة في `parmaga-content`.
- [ ] الأسماء تتبع `page-<NNN>.svg`.
- [ ] لا توجد فجوة أو قيمة مكررة.
- [ ] العدد يطابق العدد المعلن.
- [ ] حُسبت SHA-256 مرتين وتطابقت.
- [ ] الأحجام بالبايت مسجلة.
- [ ] الأبعاد و`viewBox` مسجلة.
- [ ] XML سليم أو الفشل موثق.
- [ ] UTF-8 وBOM مفحوصان.
- [ ] عدد عناصر `text` مسجل.
- [ ] الخطوط مسجلة.
- [ ] الفحص الأمني مكتمل.
- [ ] لكل finding قرار مكتوب.
- [ ] المقاس والمنطقة المحجوزة مقاسان.
- [ ] Manifest صالح.
- [ ] Context Packet لا يتجاوز 8 KB.
- [ ] Context Packet لا يحتوي SVG markup.
- [ ] لا يوجد SVG في المستودع العام قبل commit النشر.

## ماذا تفعل عند اكتشاف مشكلة؟

### فجوة ترقيم

أوقف الجرد. راجع خريطة الترتيب ومصدر الصفحات. لا تغلق الفجوة بنقل رقم صفحة منشورة، ولا تخمن الصفحة المفقودة.

### عدد غير مطابق

أوقف الاعتماد. قارن سلسلة الطالب بالمصدر وبالعدد المعلن. لا تعدل `declaredPageCount` لمجرد مطابقة الملفات الموجودة دون قرار من مالك المشروع.

### بصمة مكررة

تحقق هل التكرار مقصود أم أن الصفحة نُسخت خطأ. سجل القرار. لا تحذف نسخة أو تعدلها تلقائيًا.

### ملف لا يُحلل

سجل `xmlWellFormed: false` وسبب الخطأ، وأوقف نشره. لا تفتحه ثم تحفظه لإصلاحه. ارجع إلى مصدر التوليد لإنتاج أصل جديد إذا لزم.

### اكتشاف أمني

سجل الاكتشاف وحدد موضعه ونوعه دون نشر محتوى الأصل. اتخذ قرارًا مكتوبًا بالقبول المعلل أو رفض الأصل أو إعادة إنتاجه. لا تعالج الاكتشاف بتعديل الملف المفحوص.
