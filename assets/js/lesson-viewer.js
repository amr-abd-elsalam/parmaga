/* ==========================================================================
   Parmaga — Lesson Viewer (Progressive Enhancement)
   --------------------------------------------------------------------------
   العقد الحاكم:
   - الصفحة كاملة ومفيدة دون هذا الملف. لا يُخفى محتوى أساسي إلا بعد نجاح
     التهيئة، وأي فشل يعيد العرض الساكن كاملًا.
   - جرد الصفحات يُقرأ من DOM وحده. لا manifest وقت التشغيل، ولا جرد ثانٍ هنا.
   - نسخة SVG inline واحدة كحد أقصى في أي لحظة: معرّفات defs مكررة بين الملفات.
   - لا تعديل لأي ملف أصل. كل تغيير يقع على نسخة الذاكرة وحدها.
   - لا dependencies، ولا build step، ولا eval، ولا تنفيذ نصوص من الأصول.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- ثوابت ---------- */

  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* قائمة سماح مغلقة مبنية على جرد الأصول الفعلي. أي عنصر خارجها يُحذف. */
  var ALLOWED_ELEMENTS = {
    svg: 1, g: 1, defs: 1, title: 1, desc: 1, metadata: 1,
    path: 1, rect: 1, circle: 1, ellipse: 1, line: 1, polygon: 1, polyline: 1,
    text: 1, tspan: 1,
    linearGradient: 1, radialGradient: 1, stop: 1,
    filter: 1, feDropShadow: 1, feGaussianBlur: 1, feOffset: 1,
    feBlend: 1, feColorMatrix: 1, feComposite: 1, feFlood: 1, feMerge: 1, feMergeNode: 1
  };

  /* سمات مسموحة. لا href، ولا xlink:href، ولا on*، ولا أي شيء خارج القائمة. */
  var ALLOWED_ATTRS = {
    id: 1, class: 1, transform: 1, viewBox: 1, width: 1, height: 1,
    x: 1, y: 1, x1: 1, y1: 1, x2: 1, y2: 1, cx: 1, cy: 1, r: 1, rx: 1, ry: 1,
    d: 1, points: 1, dx: 1, dy: 1, offset: 1,
    fill: 1, 'fill-opacity': 1, 'fill-rule': 1,
    stroke: 1, 'stroke-width': 1, 'stroke-opacity': 1, 'stroke-linecap': 1,
    'stroke-linejoin': 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1,
    'stroke-miterlimit': 1,
    opacity: 1, visibility: 1, display: 1,
    'font-family': 1, 'font-size': 1, 'font-weight': 1, 'font-style': 1,
    'letter-spacing': 1, 'word-spacing': 1, 'text-anchor': 1,
    'dominant-baseline': 1, 'alignment-baseline': 1,
    direction: 1, 'unicode-bidi': 1, 'writing-mode': 1,
    'marker-start': 1, 'marker-mid': 1, 'marker-end': 1,
    'stop-color': 1, 'stop-opacity': 1,
    gradientUnits: 1, gradientTransform: 1, spreadMethod: 1,
    filterUnits: 1, primitiveUnits: 1, result: 1, in: 1, in2: 1, mode: 1,
    stdDeviation: 1, 'flood-color': 1, 'flood-opacity': 1,
    preserveAspectRatio: 1, 'xml:space': 1, 'xml:lang': 1, lang: 1,
    'shape-rendering': 1, 'text-rendering': 1, 'vector-effect': 1,
    'paint-order': 1, 'clip-rule': 1, 'color-interpolation-filters': 1
  };

  /* سمة style مسموحة على الجذر وحدها، وبخصائص تخطيطية محددة لا غير. */
  var ALLOWED_ROOT_STYLE_PROPS = {
    width: 1, height: 1, 'max-width': 1, 'max-height': 1,
    'min-width': 1, 'min-height': 1, display: 1, margin: 1,
    'margin-top': 1, 'margin-bottom': 1, 'margin-left': 1, 'margin-right': 1
  };

  var SHAPE_TAGS = {
    path: 1, rect: 1, line: 1, circle: 1, ellipse: 1, polygon: 1, polyline: 1
  };

  /* ADR-0012 §10: قائمة سرعات مغلقة مرتبة، لا مدى مستمر ولا أداة سحب.
     البداية عند 1× وهي العنصر رقم 3 في القائمة. */
  var SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
  var SPEED_START_INDEX = 3;

  /* ADR-0013 §6: مهلة الخمول الوحيدة. تطوي اللوحة المفتوحة وحدها، ويُعلّق
     عدّها أثناء INTERACTIVE_RUNNING فلا يُحتسب زمن مشاهدة الحركة منها. */
  var PANEL_IDLE_MS = 5000;

  /* ADR-0013 §2 (يستبدل ADR-0012 §11): قلم واحد واقعي بدل ثلاثة أشكال رمزية.
     الهندسة محلية بالكامل — أضلاع ومستطيلات مكتوبة هنا، لا dependency ولا
     CDN ولا أصل مجلوب ولا خط أيقونات ولا صورة. القلم معرّف حول سنّه: السنّ
     في نقطة الأصل والجسم يمتد إلى -y بطول اسمي معلوم، فيكفي translate
     واحد للسنّ وrotate واحد لاتجاه الكتابة وscale واحد للطول. */
  var PEN_PARTS = [
    { tag: 'polygon', cls: 'nib', attrs: { points: '0,0 -3.1,-13 3.1,-13' } },
    { tag: 'polygon', cls: 'tip', attrs: { points: '-3.1,-13 3.1,-13 4.2,-21 -4.2,-21' } },
    { tag: 'rect', cls: 'collar', attrs: { x: '-4.6', y: '-25', width: '9.2', height: '4.4' } },
    { tag: 'polygon', cls: 'body', attrs: { points: '-4.6,-25 4.6,-25 5.4,-92 -5.4,-92' } },
    { tag: 'rect', cls: 'grip', attrs: { x: '-4.8', y: '-40', width: '9.6', height: '11', rx: '1.5' } },
    { tag: 'rect', cls: 'gloss', attrs: { x: '-2.6', y: '-88', width: '2.3', height: '58' } },
    { tag: 'rect', cls: 'cap', attrs: { x: '-5.4', y: '-101', width: '10.8', height: '9.6', rx: '3' } }
  ];
  var PEN_NOMINAL_LEN = 101;     /* طول الهندسة الاسمية بوحدات القلم */
  var PEN_TILT_DEG = 36;         /* ميل القلم عن العمود كما تحمله يد بشرية */
  /* الهندسة ممتدة إلى -y أي إلى أعلى، والجسم يجب أن يمتد إلى أسفل السطر
     الجاري: ما فوقه مكتوب ومقروء فلا يُحجب، وما تحته لم يُكشف بعد فلا يضيع
     شيء بحجبه. و180 − الميل تقلب الامتداد رأسيًا وتُبقي الانحناء نحو جهة
     السير كما هو: نحو اليسار في العربية ونحو اليمين في الإنجليزية. */
  var PEN_ANGLE_BASE = 180 - PEN_TILT_DEG;
  var PEN_TILT_WOBBLE = 1.6;     /* تمايل طبيعي صغير حول الميل، بالدرجات */
  var PEN_LEN_PER_LINE = 4.2;    /* الطول نسبة إلى ارتفاع السطر المكتوب */
  var PEN_LEN_MIN_RATIO = 0.055; /* حدّ أدنى نسبة إلى ارتفاع viewBox */
  var PEN_LEN_MAX_RATIO = 0.150; /* حدّ أعلى نسبة إلى ارتفاع viewBox */
  var PEN_BASELINE_RATIO = 0.80; /* موضع السنّ من ارتفاع صندوق السطر */

  /* توقيتات أساسية بالمللي ثانية عند سرعة 1 */
  var BASE_CHAR_MS = 26;
  var BASE_SPACE_MS = 34;
  var BASE_PUNCT_MS = 150;
  var BASE_LINE_MS = 190;
  var BASE_BLOCK_MS = 320;
  var BASE_SHAPE_MS = 420;
  var BASE_JITTER_MS = 14;

  /* حدود التصنيف المحافظ، نسبية إلى viewBox لا مطلقة */
  var LARGE_AREA_RATIO = 0.14;   /* أكبر من هذا = خلفية أو إطار: يبقى ثابتًا */
  var LONG_THIN_RATIO = 0.55;    /* أطول من هذا مع سمك ضئيل = تسطير: يبقى ثابتًا */
  var THIN_SIZE_RATIO = 0.012;   /* سمك ضئيل نسبة إلى البعد الأصغر */
  var FAINT_OPACITY = 0.35;      /* أبهت من هذا = لا يُحرَّك */
  var LINK_DISTANCE_RATIO = 0.10; /* أقصى مسافة ربط شكل بسطر */

  /* ---------- حالة الوحدة ---------- */

  var state = {
    generation: 0,
    timers: [],
    controller: null,
    pages: [],
    current: 1,
    speedIndex: SPEED_START_INDEX,
    speed: SPEEDS[SPEED_START_INDEX],
    /* إظهار القلم اختيار جلسة واحدة في ذاكرة الصفحة: لا Storage ولا URL. */
    penVisible: true,
    reduced: false,
    ready: false,
    running: false,
    paused: false,
    resume: null,
    /* ADR-0012 §12: مصدر الحقيقة الوحيد للوضع هو phase بحالاته الخمس.
       وmode مشتق منه لا مستقل عنه: 'static' في FULL و'interactive' فيما
       سواه، ولا يُكتب إلا في setPhase. فلا مصدر حالة ثانٍ ولا مزامنة. */
    phase: 'FULL',
    mode: 'static',
    mounted: false,
    alignOnFirstMount: false,
    openPanel: null,
    lastFocus: null,
    stage: null,
    pen: null,
    hashLock: false
  };

  var el = {};

  /* ---------- أدوات الإلغاء ومنع السباقات ---------- */

  /* ADR-0013 §4 و§8: طلب بدء عابر لا حالة موازية. startRequested راية لحظة
     الإيماءة وحدها، تُستهلك في أول سطر من loadPage فلا تتسرب إلى نداء آخر.
     وpendingStart رقم جيل التحميل الذي طُلب بدؤه، فأي جيل أحدث أو إبطال أو
     فشل أو teardown يجعله غير مطابق فيسقط الطلب صامتًا. */
  var startRequested = false;
  var pendingStart = null;

  function bumpGeneration() {
    state.generation += 1;
    return state.generation;
  }

  function isStale(gen) {
    return gen !== state.generation;
  }

  function schedule(gen, fn, delay) {
    var id = window.setTimeout(function () {
      var at = state.timers.indexOf(id);
      if (at !== -1) { state.timers.splice(at, 1); }
      if (isStale(gen)) { return; }
      if (state.paused) { return; }
      try { fn(); } catch (err) { reportSoft(err); }
    }, delay);
    state.timers.push(id);
    return id;
  }

  /* نقطة الاستئناف تُسجَّل عند كل جدولة. الإيقاف المؤقت إلغاءٌ للمؤقت وحده
     مع بقاء الاستمرارية وجيلها، فيستأنف العرض من موضعه لا من بدايته.
     الجيل يبقى السلطة النهائية: أي استمرارية قديمة تُرفض عند الاستئناف. */
  function later(gen, fn, delay) {
    if (isStale(gen)) { return -1; }
    state.resume = { gen: gen, fn: fn, delay: delay };
    if (state.paused) { return -1; }
    return schedule(gen, fn, delay);
  }

  function clearAllTimers() {
    for (var i = 0; i < state.timers.length; i += 1) {
      window.clearTimeout(state.timers[i]);
    }
    state.timers = [];
  }

  function abortFetch() {
    if (state.controller) {
      try { state.controller.abort(); } catch (err) { /* تجاهل */ }
      state.controller = null;
    }
  }

  function cancelEverything() {
    abortFetch();
    clearAllTimers();
    state.running = false;
    state.paused = false;
    state.resume = null;
    pendingStart = null;
    return bumpGeneration();
  }

  function reportSoft(err) {
    if (window.console && window.console.warn) {
      window.console.warn('[lesson-viewer]', err && err.message ? err.message : err);
    }
  }

  /* ---------- قراءة الجرد من DOM ---------- */

  function readPagesFromDom(list) {
    var items = list.querySelectorAll('li.lesson-page');
    var out = [];
    for (var i = 0; i < items.length; i += 1) {
      var li = items[i];
      var img = li.querySelector('[data-page-image]');
      if (!img) { continue; }
      var src = img.getAttribute('src');
      if (!src) { continue; }
      var idxAttr = parseInt(li.getAttribute('data-page-index'), 10);
      out.push({
        index: isNaN(idxAttr) ? out.length + 1 : idxAttr,
        li: li,
        img: img,
        src: src,
        id: li.id
      });
    }
    return out;
  }

  /* ---------- التعقيم وفق قائمة السماح ---------- */

  function sanitizeRootStyle(value) {
    var parts = String(value).split(';');
    var kept = [];
    for (var i = 0; i < parts.length; i += 1) {
      var piece = parts[i];
      if (!piece || piece.indexOf(':') === -1) { continue; }
      var at = piece.indexOf(':');
      var prop = piece.slice(0, at).trim().toLowerCase();
      var val = piece.slice(at + 1).trim();
      if (!ALLOWED_ROOT_STYLE_PROPS[prop]) { continue; }
      var lowered = val.toLowerCase();
      if (lowered.indexOf('url(') !== -1) { continue; }
      if (lowered.indexOf('@import') !== -1) { continue; }
      if (lowered.indexOf('expression') !== -1) { continue; }
      kept.push(prop + ':' + val);
    }
    return kept.join(';');
  }

  function sanitizeElement(node, isRoot) {
    var tag = node.localName;
    if (!ALLOWED_ELEMENTS[tag]) {
      if (node.parentNode) { node.parentNode.removeChild(node); }
      return false;
    }

    var attrs = node.attributes;
    for (var i = attrs.length - 1; i >= 0; i -= 1) {
      var attr = attrs[i];
      var name = attr.name;
      var lower = name.toLowerCase();

      if (lower === 'style') {
        if (!isRoot) { node.removeAttribute(name); continue; }
        var cleaned = sanitizeRootStyle(attr.value);
        if (cleaned) { node.setAttribute('style', cleaned); }
        else { node.removeAttribute(name); }
        continue;
      }

      if (lower.indexOf('on') === 0) { node.removeAttribute(name); continue; }
      if (lower === 'href' || lower === 'xlink:href' || lower.indexOf('xlink:') === 0) {
        node.removeAttribute(name);
        continue;
      }
      if (lower.indexOf('xmlns') === 0) { continue; }
      if (!ALLOWED_ATTRS[name]) { node.removeAttribute(name); continue; }

      var v = String(attr.value).toLowerCase();
      if (v.indexOf('javascript:') !== -1 || v.indexOf('data:text/html') !== -1) {
        node.removeAttribute(name);
      }
    }

    var child = node.firstChild;
    while (child) {
      var nextChild = child.nextSibling;
      if (child.nodeType === 1) {
        sanitizeElement(child, false);
      } else if (child.nodeType === 8) {
        node.removeChild(child);
      }
      child = nextChild;
    }
    return true;
  }

  /* ---------- جلب وتحليل SVG ---------- */

  function fetchSvg(url, signal) {
    return window.fetch(url, {
      credentials: 'same-origin',
      signal: signal
    }).then(function (res) {
      if (!res.ok) { throw new Error('HTTP ' + res.status); }
      return res.text();
    }).then(function (text) {
      var parser = new window.DOMParser();
      var doc = parser.parseFromString(text, 'image/svg+xml');
      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('parsererror');
      }
      var root = doc.documentElement;
      if (!root || root.namespaceURI !== SVG_NS || root.localName !== 'svg') {
        throw new Error('root is not svg');
      }
      if (!sanitizeElement(root, true)) { throw new Error('root rejected'); }
      return root;
    });
  }

  /* ---------- تقسيم النص إلى graphemes ---------- */

  var segmenter = null;
  if (typeof window.Intl !== 'undefined' && typeof window.Intl.Segmenter === 'function') {
    try {
      segmenter = new window.Intl.Segmenter('ar', { granularity: 'grapheme' });
    } catch (err) { segmenter = null; }
  }

  /* نطاقات التشكيل والعلامات الملتصقة: لا تُفصل عن حرفها في مسار الاحتياط. */
  function isCombining(code) {
    return (code >= 0x0300 && code <= 0x036F) ||
           (code >= 0x0610 && code <= 0x061A) ||
           (code >= 0x064B && code <= 0x065F) ||
           (code === 0x0670) ||
           (code >= 0x06D6 && code <= 0x06DC) ||
           (code >= 0x06DF && code <= 0x06E8) ||
           (code >= 0x06EA && code <= 0x06ED) ||
           (code >= 0x0730 && code <= 0x074A) ||
           (code >= 0x200C && code <= 0x200F) ||
           (code >= 0xFE00 && code <= 0xFE0F) ||
           (code >= 0xFE20 && code <= 0xFE2F);
  }

  function splitGraphemes(text) {
    if (!text) { return []; }
    if (segmenter) {
      var out = [];
      var it = segmenter.segment(text)[Symbol.iterator]();
      var step = it.next();
      while (!step.done) {
        out.push(step.value.segment);
        step = it.next();
      }
      return out;
    }
    var clusters = [];
    var chars = Array.from ? Array.from(text) : text.split('');
    for (var i = 0; i < chars.length; i += 1) {
      var ch = chars[i];
      var code = ch.codePointAt(0);
      if (clusters.length > 0 && isCombining(code)) {
        clusters[clusters.length - 1] += ch;
      } else {
        clusters.push(ch);
      }
    }
    return clusters;
  }

  function pauseFor(ch) {
    if (ch === ' ' || ch === '\u00A0') { return BASE_SPACE_MS; }
    if ('،؛.؟!:…,;?'.indexOf(ch) !== -1) { return BASE_PUNCT_MS; }
    return BASE_CHAR_MS;
  }

  function jitter() {
    return Math.round((Math.random() - 0.5) * 2 * BASE_JITTER_MS);
  }

  function scaled(ms) {
    var v = ms / state.speed;
    return v < 8 ? 8 : v;
  }

  /* ---------- تحليل بنية الصفحة ---------- */

  function collectTextUnits(root) {
    var units = [];
    var texts = root.getElementsByTagName('text');
    for (var i = 0; i < texts.length; i += 1) {
      var t = texts[i];
      var kids = [];
      var child = t.firstChild;
      var hasElementChild = false;
      while (child) {
        if (child.nodeType === 1 && child.localName === 'tspan') { hasElementChild = true; }
        child = child.nextSibling;
      }

      if (!hasElementChild) {
        var direct = t.textContent;
        if (direct && direct.replace(/\s+/g, '') !== '') {
          kids.push({ node: t, original: direct });
        }
      } else {
        var spans = t.getElementsByTagName('tspan');
        for (var j = 0; j < spans.length; j += 1) {
          var sp = spans[j];
          var inner = sp.getElementsByTagName('tspan');
          if (inner.length > 0) { continue; }
          var val = sp.textContent;
          if (val && val.replace(/\s+/g, '') !== '') {
            kids.push({ node: sp, original: val });
          }
        }
        var leading = t.firstChild;
        if (leading && leading.nodeType === 3 && leading.nodeValue &&
            leading.nodeValue.replace(/\s+/g, '') !== '') {
          kids.unshift({ node: leading, original: leading.nodeValue, isTextNode: true });
        }
      }

      if (kids.length > 0) {
        units.push({ text: t, lines: kids });
      }
    }
    return units;
  }

  function safeBBox(node) {
    try {
      if (typeof node.getBBox !== 'function') { return null; }
      var b = node.getBBox();
      if (!b) { return null; }
      if (!isFinite(b.x) || !isFinite(b.y) || !isFinite(b.width) || !isFinite(b.height)) {
        return null;
      }
      return b;
    } catch (err) {
      return null;
    }
  }

  function isInsideDefs(node) {
    var p = node.parentNode;
    while (p && p.nodeType === 1) {
      if (p.localName === 'defs') { return true; }
      p = p.parentNode;
    }
    return false;
  }

  function numericAttr(node, name) {
    var raw = node.getAttribute(name);
    if (raw === null || raw === '') { return null; }
    var n = parseFloat(raw);
    return isNaN(n) ? null : n;
  }

  function effectiveOpacity(node) {
    var o = numericAttr(node, 'opacity');
    var fo = numericAttr(node, 'fill-opacity');
    var so = numericAttr(node, 'stroke-opacity');
    var lowest = 1;
    if (o !== null && o < lowest) { lowest = o; }
    if (fo !== null && so !== null) {
      var m = Math.max(fo, so);
      if (m < lowest) { lowest = m; }
    }
    return lowest;
  }

  function hasVisibleFill(node) {
    var f = node.getAttribute('fill');
    if (f === null) { return node.localName !== 'line' && node.localName !== 'polyline'; }
    var lower = f.trim().toLowerCase();
    return lower !== 'none' && lower !== 'transparent';
  }

  function hasStroke(node) {
    var s = node.getAttribute('stroke');
    if (s === null) { return false; }
    var lower = s.trim().toLowerCase();
    return lower !== 'none' && lower !== 'transparent';
  }

  /* التصنيف المحافظ: يعيد true فقط إذا كان الشكل آمنًا للحركة بثقة واضحة. */
  function isAnimatableShape(node, view) {
    if (!SHAPE_TAGS[node.localName]) { return false; }
    if (isInsideDefs(node)) { return false; }
    if (effectiveOpacity(node) < FAINT_OPACITY) { return false; }

    var box = safeBBox(node);
    if (!box) { return false; }
    if (box.width <= 0 && box.height <= 0) { return false; }

    var totalArea = view.width * view.height;
    if (totalArea <= 0) { return false; }

    var area = box.width * box.height;
    if (area / totalArea > LARGE_AREA_RATIO) { return false; }

    var minDim = Math.min(view.width, view.height);
    var thin = Math.min(box.width, box.height) <= minDim * THIN_SIZE_RATIO;
    var longSide = Math.max(box.width, box.height);
    if (thin && longSide >= view.width * LONG_THIN_RATIO) { return false; }

    if (!hasStroke(node) && !hasVisibleFill(node)) { return false; }
    return true;
  }

  function nearestUnitFor(box, unitBoxes, view) {
    var best = -1;
    var bestScore = Infinity;
    var limit = view.height * LINK_DISTANCE_RATIO;
    var cx = box.x + box.width / 2;
    var cy = box.y + box.height / 2;

    for (var i = 0; i < unitBoxes.length; i += 1) {
      var ub = unitBoxes[i];
      if (!ub) { continue; }
      var contains = box.x >= ub.x - 2 && box.y >= ub.y - 2 &&
                     box.x + box.width <= ub.x + ub.width + 2 &&
                     box.y + box.height <= ub.y + ub.height + 2;
      var ucx = ub.x + ub.width / 2;
      var ucy = ub.y + ub.height / 2;
      var dy = Math.abs(cy - ucy);
      var dx = Math.abs(cx - ucx);
      var score = contains ? 0 : dy + dx * 0.25;
      if (!contains && dy > limit) { continue; }
      if (score < bestScore) { bestScore = score; best = i; }
    }
    return best;
  }

  /* ---------- بناء خطة العرض ---------- */

  function buildPlan(root) {
    var vb = root.getAttribute('viewBox');
    var view = { x: 0, y: 0, width: 1080, height: 1350 };
    if (vb) {
      var nums = vb.split(/[\s,]+/);
      if (nums.length === 4) {
        var vx = parseFloat(nums[0]);
        var vy = parseFloat(nums[1]);
        var vw = parseFloat(nums[2]);
        var vh = parseFloat(nums[3]);
        if (!isNaN(vw) && !isNaN(vh) && vw > 0 && vh > 0) {
          view = { x: vx || 0, y: vy || 0, width: vw, height: vh };
        }
      }
    }

    var units = collectTextUnits(root);
    var unitBoxes = [];
    for (var i = 0; i < units.length; i += 1) {
      unitBoxes.push(safeBBox(units[i].text));
      units[i].shapes = [];
    }

    var loose = [];
    var all = root.getElementsByTagName('*');
    for (var k = 0; k < all.length; k += 1) {
      var node = all[k];
      if (!SHAPE_TAGS[node.localName]) { continue; }
      if (!isAnimatableShape(node, view)) { continue; }
      var box = safeBBox(node);
      if (!box) { continue; }
      var owner = nearestUnitFor(box, unitBoxes, view);
      if (owner === -1) { loose.push(node); continue; }
      units[owner].shapes.push(node);
    }

    return { view: view, units: units, loose: loose };
  }

  /* ---------- إخفاء وإظهار مع حفظ الحالة الأصلية ---------- */

  function hideForAnimation(plan) {
    var saved = [];
    for (var i = 0; i < plan.units.length; i += 1) {
      var unit = plan.units[i];
      for (var j = 0; j < unit.lines.length; j += 1) {
        var line = unit.lines[j];
        if (line.isTextNode) {
          saved.push({ kind: 'textnode', node: line.node, value: line.node.nodeValue });
          line.node.nodeValue = '';
        } else {
          saved.push({ kind: 'text', node: line.node, value: line.node.textContent });
          line.node.textContent = '';
        }
      }
      for (var s = 0; s < unit.shapes.length; s += 1) {
        var shape = unit.shapes[s];
        saved.push({
          kind: 'shape',
          node: shape,
          visibility: shape.getAttribute('visibility'),
          hadVisibility: shape.hasAttribute('visibility'),
          markerStart: shape.getAttribute('marker-start'),
          markerMid: shape.getAttribute('marker-mid'),
          markerEnd: shape.getAttribute('marker-end')
        });
        shape.setAttribute('visibility', 'hidden');
      }
    }
    return saved;
  }

  function restoreAll(saved) {
    for (var i = 0; i < saved.length; i += 1) {
      var rec = saved[i];
      try {
        if (rec.kind === 'textnode') {
          rec.node.nodeValue = rec.value;
        } else if (rec.kind === 'text') {
          rec.node.textContent = rec.value;
        } else if (rec.kind === 'shape') {
          if (rec.hadVisibility) { rec.node.setAttribute('visibility', rec.visibility); }
          else { rec.node.removeAttribute('visibility'); }
          if (rec.markerStart !== null) { rec.node.setAttribute('marker-start', rec.markerStart); }
          if (rec.markerMid !== null) { rec.node.setAttribute('marker-mid', rec.markerMid); }
          if (rec.markerEnd !== null) { rec.node.setAttribute('marker-end', rec.markerEnd); }
        }
      } catch (err) { reportSoft(err); }
    }
  }

  /* ---------- مؤشر القلم ---------- */

  /* ADR-0012 §11: لا يُنشأ القلم قبل تشغيل صريح — فلا وجود له في FULL ولا
     بعد الدخول التفاعلي وحده. وإن أخفاه المستخدم لا يُنشأ أصلًا. */
  function ensurePen(root) {
    if (!root || !state.penVisible) { return null; }
    if (state.pen && state.pen.ownerSVGElement === root) { return state.pen; }
    destroyPen();
    var g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'lesson-pen');
    g.setAttribute('aria-hidden', 'true');
    g.setAttribute('focusable', 'false');
    g.setAttribute('visibility', 'hidden');
    for (var i = 0; i < PEN_PARTS.length; i += 1) {
      var spec = PEN_PARTS[i];
      var part = document.createElementNS(SVG_NS, spec.tag);
      var names = Object.keys(spec.attrs);
      for (var j = 0; j < names.length; j += 1) {
        part.setAttribute(names[j], spec.attrs[names[j]]);
      }
      part.setAttribute('class', 'lesson-pen-' + spec.cls);
      g.appendChild(part);
    }
    root.appendChild(g);
    state.pen = g;
    return g;
  }

  /* اتجاه الكتابة يُقرأ من سمة direction إن وُجدت، وإلا من النص نفسه:
     محارف عربية ⇒ من اليمين إلى اليسار. فالعربية والإنجليزية سواء بلا
     إعداد ولا سمة إضافية في الأصل ولا اكتشاف لغة الواجهة. */
  function hasRtlChars(text) {
    if (!text) { return false; }
    for (var i = 0; i < text.length; i += 1) {
      var c = text.charCodeAt(i);
      if ((c >= 0x0590 && c <= 0x08FF) || (c >= 0xFB1D && c <= 0xFEFC)) {
        return true;
      }
    }
    return false;
  }

  function writesRtl(node) {
    var probe = node.nodeType === 3 ? node.parentNode : node;
    while (probe && probe.nodeType === 1) {
      var d = probe.getAttribute('direction');
      if (d) { return d === 'rtl'; }
      probe = probe.parentNode;
    }
    return hasRtlChars(node.textContent || node.nodeValue || '');
  }

  /* السنّ يلامس آخر حرف مكتوب، والجسم يميل نحو جهة السير فيبقى المكتوب
     مكشوفًا للقارئ دائمًا: يسارًا في العربية ويمينًا في الإنجليزية. والطول
     يتناسب مع ارتفاع السطر مقيّدًا بحدّي viewBox، ومع كل حرف تمايل صغير في
     الميل والموضع فتُقرأ الحركة كيد لا كآلة. لا مؤقت جديد هنا: الدالة
     مُستدعاة أصلًا عند كل عنقود. */
  function movePen(node) {
    if (!state.pen) { return; }
    var box = safeBBox(node);
    if (!box) { return; }
    var rtl = writesRtl(node);
    var dir = rtl ? -1 : 1;
    var view = (activePlan && activePlan.view) ? activePlan.view : null;
    var lineH = box.height > 0 ? box.height : (view ? view.height * 0.02 : 20);
    var want = lineH * PEN_LEN_PER_LINE;
    if (view) {
      var lo = view.height * PEN_LEN_MIN_RATIO;
      var hi = view.height * PEN_LEN_MAX_RATIO;
      if (want < lo) { want = lo; }
      if (want > hi) { want = hi; }
    }
    var k = want / PEN_NOMINAL_LEN;
    var tipX = (rtl ? box.x : box.x + box.width) + dir * lineH * 0.04;
    var tipY = box.y + box.height * PEN_BASELINE_RATIO;
    var angle = dir * PEN_ANGLE_BASE + (Math.random() - 0.5) * 2 * PEN_TILT_WOBBLE;
    tipX += (Math.random() - 0.5) * lineH * 0.03;
    tipY += (Math.random() - 0.5) * lineH * 0.03;
    state.pen.setAttribute('transform',
      'translate(' + tipX.toFixed(2) + ',' + tipY.toFixed(2) + ') ' +
      'rotate(' + angle.toFixed(2) + ') ' +
      'scale(' + k.toFixed(4) + ')');
    state.pen.setAttribute('visibility', 'visible');
  }

  function hidePen() {
    if (state.pen) { state.pen.setAttribute('visibility', 'hidden'); }
  }

  function destroyPen() {
    if (state.pen && state.pen.parentNode) {
      state.pen.parentNode.removeChild(state.pen);
    }
    state.pen = null;
  }

  /* ---------- تشغيل خطة العرض ---------- */

  function runPlan(gen, root, plan, saved, onDone) {
    var queue = [];

    for (var i = 0; i < plan.units.length; i += 1) {
      var unit = plan.units[i];
      for (var s = 0; s < unit.shapes.length; s += 1) {
        queue.push({ type: 'shape', node: unit.shapes[s] });
      }
      for (var j = 0; j < unit.lines.length; j += 1) {
        queue.push({ type: 'line', line: unit.lines[j] });
      }
      queue.push({ type: 'block' });
    }

    var at = 0;

    function finish() {
      hidePen();
      state.running = false;
      state.paused = false;
      state.resume = null;
      if (typeof onDone === 'function') { onDone(); }
    }

    function step() {
      if (isStale(gen)) { return; }
      if (at >= queue.length) { finish(); return; }
      var item = queue[at];
      at += 1;

      if (item.type === 'block') {
        later(gen, step, scaled(BASE_BLOCK_MS));
        return;
      }

      if (item.type === 'shape') {
        hidePen();
        try { item.node.setAttribute('visibility', 'visible'); }
        catch (err) { reportSoft(err); }
        later(gen, step, scaled(BASE_SHAPE_MS));
        return;
      }

      typeLine(gen, item.line, function () {
        later(gen, step, scaled(BASE_LINE_MS));
      });
    }

    function typeLine(g, line, done) {
      var clusters;
      try {
        clusters = splitGraphemes(line.original);
      } catch (err) {
        reportSoft(err);
        clusters = null;
      }

      if (!clusters || clusters.length === 0) {
        try {
          if (line.isTextNode) { line.node.nodeValue = line.original; }
          else { line.node.textContent = line.original; }
        } catch (err2) { reportSoft(err2); }
        done();
        return;
      }

      var idx = 0;
      var buffer = '';

      function tick() {
        if (isStale(g)) { return; }
        if (idx >= clusters.length) {
          movePen(line.isTextNode ? line.node.parentNode : line.node);
          done();
          return;
        }
        buffer += clusters[idx];
        try {
          if (line.isTextNode) { line.node.nodeValue = buffer; }
          else { line.node.textContent = buffer; }
        } catch (err) {
          reportSoft(err);
          try {
            if (line.isTextNode) { line.node.nodeValue = line.original; }
            else { line.node.textContent = line.original; }
          } catch (err2) { reportSoft(err2); }
          done();
          return;
        }
        movePen(line.isTextNode ? line.node.parentNode : line.node);
        var wait = scaled(pauseFor(clusters[idx])) + jitter();
        idx += 1;
        later(g, tick, wait < 8 ? 8 : wait);
      }

      tick();
    }

    state.running = true;
    state.paused = false;
    state.resume = null;
    step();
  }

  /* ---------- تركيب الصفحة النشطة ---------- */

  var activeSaved = null;
  var activeRoot = null;
  var activePlan = null;

  function teardownStage() {
    destroyPen();
    activeSaved = null;
    activeRoot = null;
    activePlan = null;
    if (el.stage) {
      while (el.stage.firstChild) { el.stage.removeChild(el.stage.firstChild); }
    }
  }

  function showStaticFallback(message) {
    /* لا تُترك عقدة مركَّزة داخل محتوى صار hidden: يُنقل التركيز إلى لافتة
       الفشل نفسها، وهي أقرب مكافئ منطقي، لا إلى body ولا إلى بداية الصفحة. */
    var inside = !!(el.controls && document.activeElement &&
                    el.controls.contains(document.activeElement));
    teardownStage();
    state.mounted = false;
    setPhase('FULL');
    state.openPanel = null;
    if (el.stage) { el.stage.hidden = true; }
    if (el.list) { el.list.removeAttribute('data-viewer-active'); }
    if (el.notice && message) {
      el.notice.textContent = message;
      el.notice.hidden = false;
      if (inside) { try { el.notice.focus(); } catch (err) { reportSoft(err); } }
    }
    if (el.controls) { el.controls.hidden = true; }
  }

  function setStatus(text) {
    if (el.status) { el.status.textContent = text; }
  }

  /* نمطا العرض. الطيّ البصري للقائمة الساكنة لا يُفعَّل إلا بعد أول تركيب
     تفاعلي ناجح، ويُرفع فورًا عند أي فشل أو عند طلب الدرس الكامل. */
  function applyViewMode() {
    var interactive = (state.mode === 'interactive') && state.mounted;
    if (el.list) {
      if (interactive) { el.list.setAttribute('data-viewer-active', 'true'); }
      else { el.list.removeAttribute('data-viewer-active'); }
    }
    if (el.stage) { el.stage.hidden = !interactive; }
  }

  /* ---------- طبقة التحكم: زرا disclosure ولوحتان ---------- */

  function panelFor(key) {
    if (key === 'nav') { return el.panelNav; }
    if (key === 'motion') { return el.panelMotion; }
    return null;
  }

  function buttonFor(key) {
    if (key === 'nav') { return el.fabNav; }
    if (key === 'motion') { return el.fabMotion; }
    return null;
  }

  function activeOrLast() {
    var node = document.activeElement;
    if (!node || node === document.body) { return state.lastFocus; }
    return node;
  }

  function focusedKey() {
    var node = activeOrLast();
    if (!node) { return null; }
    if (el.panelNav && el.panelNav.contains(node)) { return 'nav'; }
    if (el.panelMotion && el.panelMotion.contains(node)) { return 'motion'; }
    return null;
  }

  /* المصدر الوحيد لحالة الإظهار: مفتاح واحد بثلاث قيم — null ≡ NONE
     و'nav' ≡ PAGES و'motion' ≡ WRITING بمصطلحات ADR-0012 §12 — فقاعدة
     اللوحة الواحدة مفروضة بنيويًا لا بالاتفاق. لا نقل تلقائي للتركيز عند
     الفتح، ولا مصيدة تركيز. والنموذج عائم على كل المقاسات بنص §4، فلا فرع
     تدفق ولا عتبة عرض تبدّل معنى أداة ولا مستمعها ولا مصدر حقيقتها. */

  /* ADR-0012 §8: مؤقت خمول واحد في كل الصفحة. مرجع وحيد على مستوى الوحدة،
     خارج state.timers كي لا تمسّه مؤقتات الحركة ولا يمسّها. */
  var panelTimer = null;

  function clearPanelTimer() {
    if (panelTimer !== null) {
      window.clearTimeout(panelTimer);
      panelTimer = null;
    }
  }

  /* كل استدعاء يلغي القائم قبل جدولة بديله، ولا يجدول شيئًا إن لم تكن لوحة
     مفتوحة. فلا مؤقت ثانٍ ولا مؤقت لكل لوحة.
     وADR-0013 §6: أثناء INTERACTIVE_RUNNING عدّ الخمول معلّق — لا يُجدول
     مؤقت جديد، وأي callback بائت سبق التشغيل لا يطوي اللوحة ما دامت الحالة
     INTERACTIVE_RUNNING. والإغلاق اليدوي والنقر الخارجي وEscape تبقى عاملة. */
  function armPanelTimer() {
    clearPanelTimer();
    if (!state.openPanel) { return; }
    if (state.phase === 'INTERACTIVE_RUNNING') { return; }
    panelTimer = window.setTimeout(function () {
      panelTimer = null;
      if (!state.openPanel) { return; }
      if (state.phase === 'INTERACTIVE_RUNNING') { return; }
      /* الطيّ وحده: لا يوقف محاكاة، ولا يغيّر صفحة، ولا يغيّر وضعًا، ولا
         يمسّ السرعة ولا شكل القلم. */
      setOpenPanel(null);
    }, PANEL_IDLE_MS);
  }

  /* ADR-0012 §5: في FULL يظهر زر «صفحات» وحده. وزر «كتابة» hidden بمعناه
     الدلالي الكامل: لا يبلغه Tab ولا يقع فيه تركيز برمجي. و§9: إن كان
     التركيز عليه أو داخل لوحته عند الانتقال، يُنقل إلى زر «صفحات» قبل
     الإخفاء، فلا يضيع إلى body. */
  function applyButtonVisibility() {
    var full = (state.phase === 'FULL');
    if (full && el.fabMotion) {
      var node = activeOrLast();
      var onWriting = (node === el.fabMotion) ||
        !!(el.panelMotion && node && el.panelMotion.contains(node));
      if (onWriting && el.fabNav) {
        try { el.fabNav.focus(); } catch (err) { reportSoft(err); }
      }
    }
    if (el.fabMotion) { el.fabMotion.hidden = full; }
  }

  function applyDisclosure() {
    var keys = ['nav', 'motion'];
    for (var i = 0; i < keys.length; i += 1) {
      var panel = panelFor(keys[i]);
      var btn = buttonFor(keys[i]);
      var open = (state.openPanel === keys[i]);
      if (panel) { panel.hidden = !open; }
      if (btn) { btn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
    }
    /* خطاف تنسيقي مشتق من مصدر الحالة نفسه، لا حالة ثانية ولا مزامنة. */
    if (el.controls) {
      if (state.openPanel) {
        el.controls.setAttribute('data-panel-open', state.openPanel);
      } else {
        el.controls.removeAttribute('data-panel-open');
      }
    }
  }

  /* المسار الوحيد لفتح لوحة وإغلاقها بنص §7. وإغلاق لوحة يعيد التركيز إلى
     زر disclosure الذي فتحها إذا كان التركيز داخل اللوحة التي ستُخفى. */
  function setOpenPanel(key) {
    if (key !== 'nav' && key !== 'motion') { key = null; }
    /* §12: FULL يسمح بحالة لوحة NONE أو PAGES فقط. */
    if (key === 'motion' && state.phase === 'FULL') { key = null; }
    if (state.openPanel === key) { armPanelTimer(); return; }
    var leaving = state.openPanel;
    var rescue = (leaving && focusedKey() === leaving) ? buttonFor(leaving) : null;
    state.openPanel = key;
    applyDisclosure();
    if (rescue && !rescue.hidden) {
      try { rescue.focus(); } catch (err) { reportSoft(err); }
    }
    armPanelTimer();
  }

  function onDisclosureClick(key) {
    setOpenPanel(state.openPanel === key ? null : key);
  }

  /* ADR-0013 §3: النقر خارج الطبقة العائمة يطوي اللوحة المفتوحة، فلا يبقى
     الطيّ رهنًا بالضغط على الزر نفسه ثانيةً ولا بانتظار مهلة الخمول. الطيّ
     وحده: لا يفتح لوحة، ولا يوقف محاكاة، ولا يغيّر صفحة ولا وضعًا ولا سرعة.
     والنقر داخل الأدوات يُهمَل هنا فلا يزاحم مبدّلات disclosure ولا يلغي
     أثرها. وإن كان التركيز داخل اللوحة المنطوية أعاده setOpenPanel إلى
     زرها فلا يضيع إلى body. */
  function onDocumentClick(evt) {
    if (!state.openPanel) { return; }
    if (el.controls && el.controls.contains(evt.target)) { return; }
    setOpenPanel(null);
  }

  /* §9: Escape يغلق اللوحة المفتوحة ويعيد التركيز إلى زرها. */
  function onControlsKeydown(evt) {
    if (evt.key !== 'Escape' && evt.key !== 'Esc') { return; }
    if (!state.openPanel) { return; }
    var key = state.openPanel;
    setOpenPanel(null);
    var btn = buttonFor(key);
    if (btn && !btn.hidden) {
      try { btn.focus(); } catch (err) { reportSoft(err); }
    }
  }

  function alignFirstMount() {
    if (!state.alignOnFirstMount) { return; }
    state.alignOnFirstMount = false;
    if (state.mode !== 'interactive' || !el.stage || el.stage.hidden) { return; }
    try { el.stage.scrollIntoView(); } catch (err) { reportSoft(err); }
  }

  function statusLine(extra) {
    var base = 'الصفحة ' + state.current + ' من ' + state.pages.length;
    if (state.reduced) { base += ' — وضع تقليل الحركة: الحركة متاحة بالطلب'; }
    if (state.mode === 'static') { base += ' — الدرس الكامل'; }
    return extra ? base + ' — ' + extra : base;
  }

  function updateButtons() {
    var interactive = (state.mode === 'interactive');
    var loading = (state.phase === 'INTERACTIVE_LOADING');
    if (el.prev) { el.prev.disabled = state.current <= 1; }
    if (el.next) { el.next.disabled = state.current >= state.pages.length; }
    if (el.jump) { el.jump.value = String(state.current); }
    var canAnimate = interactive && state.mounted && !!activePlan && !loading;
    /* ADR-0012 §10: التعطيل عند طرفي القائمة المغلقة بحالة معلنة. */
    if (el.slower) { el.slower.disabled = state.speedIndex <= 0; }
    if (el.faster) { el.faster.disabled = state.speedIndex >= SPEEDS.length - 1; }
    if (el.speed) { el.speed.textContent = SPEEDS[state.speedIndex] + '×'; }
    if (el.play) {
      /* اسم الفعل التالي لا وصف الحالة الحالية. */
      el.play.textContent = state.paused
        ? 'متابعة العرض'
        : (state.running ? 'إيقاف مؤقت' : 'تشغيل العرض');
      el.play.disabled = !canAnimate;
    }
    if (el.replay) { el.replay.disabled = !canAnimate; }
    if (el.skip) { el.skip.disabled = !canAnimate; }
    /* زر القلم: مصدر الحقيقة state.penVisible، والاسم مشتق منه — اسم الفعل
       التالي لا وصف الحالة القائمة، كزر التشغيل في اللوحة نفسها. ولا
       aria-pressed مع اسم متغيّر: الحالة تُعلن مرة واحدة لا مرتين. */
    if (el.penToggle) {
      el.penToggle.textContent = state.penVisible ? 'إخفاء القلم' : 'إظهار القلم';
      el.penToggle.disabled = !interactive;
    }
    /* ADR-0013 §4 و§5: الاسم في FULL يصدق في وعده — إيماءة واحدة تطلب الدخول
       والتشغيل معًا. وفي الحالات التفاعلية يحمل معنى العودة إلى العرض الكامل
       وحده، فلا يعيد الحركة من البداية. */
    if (el.mode) {
      el.mode.textContent = interactive
        ? 'عرض الدرس كاملًا'
        : 'تشغيل العرض التفاعلي لهذه الصفحة';
      el.mode.disabled = loading;
    }
  }

  function markActive() {
    for (var i = 0; i < state.pages.length; i += 1) {
      var p = state.pages[i];
      if (p.index === state.current) { p.li.setAttribute('data-current', 'true'); }
      else { p.li.removeAttribute('data-current'); }
    }
  }

  function pageByIndex(n) {
    for (var i = 0; i < state.pages.length; i += 1) {
      if (state.pages[i].index === n) { return state.pages[i]; }
    }
    return null;
  }

  /* ADR-0012 §3: يُحمَّل عرض الصفحة الحالية وحدها. لا معامل autoplay في
     التوقيع، ولا مسار يبدأ حركة إلا بطلب صريح سابق من إيماءة المستخدم.
     وADR-0013 §4: الطلب العابر يُقرأ هنا مرة واحدة ويُربط بجيل هذا التحميل
     وحده، فتغيير الصفحة والقفز وHistory وإعادة التحميل تبقى بلا autoplay. */
  function loadPage(n) {
    var wanted = startRequested;
    startRequested = false;

    var page = pageByIndex(n);
    if (!page) { return; }

    var gen = cancelEverything();
    pendingStart = wanted ? gen : null;
    teardownStage();

    state.current = n;
    state.mounted = false;
    setPhase('INTERACTIVE_LOADING');
    markActive();
    applyViewMode();
    updateButtons();
    if (el.notice) { el.notice.hidden = true; }
    setStatus(statusLine('جارٍ التحميل'));

    state.controller = ('AbortController' in window) ? new window.AbortController() : null;
    var signal = state.controller ? state.controller.signal : undefined;

    fetchSvg(page.src, signal).then(function (root) {
      if (isStale(gen)) { return; }

      /* ADR-0013 §8: الطلب يُستهلك مرة واحدة ولا يُعاد استخدامه. جيل بائت
         لا يصل هنا أصلًا بحكم isStale، وطلب من جيل آخر لا يطابق فيسقط. */
      var wantStart = (pendingStart === gen);
      pendingStart = null;

      root.setAttribute('class', 'lesson-stage-svg');
      root.setAttribute('aria-hidden', 'true');
      root.setAttribute('focusable', 'false');

      el.stage.appendChild(root);
      activeRoot = root;
      state.mounted = true;
      setPhase('INTERACTIVE_IDLE');
      applyViewMode();
      alignFirstMount();

      var plan;
      try {
        plan = buildPlan(root);
      } catch (err) {
        reportSoft(err);
        setStatus(statusLine('عرض ثابت'));
        updateButtons();
        return;
      }

      activePlan = plan;
      /* ADR-0013 §4: نجاح التحميل مع طلب صالح يُكمل الإيماءة نفسها في دورة
         واحدة: تُفتح لوحة «كتابة» بمسار اللوحة الواحد، ثم تبدأ الحركة على
         النسخة inline المركّبة، ثم ينتقل التركيز إلى زر «إيقاف مؤقت» — واسمه
         صار كذلك لأن startAnimation ضبطت الجريان وحدّثت الأزرار تزامنيًا.
         ولا طلب ولا فشل ولا جيل بائت يبدأ حركة، فيبقى العرض الثابت وحده. */
      if (wantStart) {
        setOpenPanel('motion');
        startAnimation();
        if (el.play && !el.play.disabled) {
          try { el.play.focus(); } catch (err2) { reportSoft(err2); }
        }
      } else {
        setStatus(statusLine('جاهزة — اضغط تشغيل العرض'));
        updateButtons();
      }
    }).catch(function (err) {
      if (err && err.name === 'AbortError') { return; }
      if (isStale(gen)) { return; }
      reportSoft(err);
      /* §12: أي فشل نهائي يعود بالوضع إلى FULL مع تنظيف كامل. */
      returnToFull('تعذّر تحميل العرض التفاعلي لهذه الصفحة. المحتوى الكامل معروض أدناه.');
    });
  }

  /* ---------- المعالجات ---------- */

  /* fragment حقيقي فقط: #page-N. لا Router، ولا Query Parameters، ولا مسار
     وهمي. pushState وreplaceState لا يسببان تمريرًا أصليًا إلى القائمة. */
  function setFragment(n, replace) {
    var target = '#page-' + n;
    var canHistory = !!(window.history && window.history.pushState &&
                        window.history.replaceState);
    state.hashLock = true;
    try {
      if (!canHistory) { window.location.hash = 'page-' + n; }
      else if (replace) { window.history.replaceState(null, '', target); }
      else if ((window.location.hash || '') !== target) {
        window.history.pushState(null, '', target);
      }
    } catch (err) { reportSoft(err); }
    window.setTimeout(function () { state.hashLock = false; }, 0);
  }

  /* ADR-0012 §2: في FULL يحدّث اختيار الصفحة الـfragment ويحرّك القراءة إلى
     الصفحة المقصودة، ويبقى الوضع FULL بلا انتقال وبلا أي fetch. وفي الوضع
     التفاعلي يحمّل الصفحة وينتهي إلى INTERACTIVE_IDLE بلا autoplay. */
  function goTo(n, fromHistory) {
    if (n < 1 || n > state.pages.length) { return; }
    if (!fromHistory) { setFragment(n, false); }
    if (state.phase === 'FULL') {
      state.current = n;
      markActive();
      updateButtons();
      setStatus(statusLine(''));
      var page = pageByIndex(n);
      if (page && page.li) {
        try { page.li.scrollIntoView(); } catch (err) { reportSoft(err); }
      }
      return;
    }
    loadPage(n);
  }

  /* ADR-0012 §12: انتقالات الوضع كلها من هذا المسار الواحد، وmode مشتق من
     phase هنا وحده فلا يُكتب في أي موضع آخر.
     وADR-0013 §6 و§7: اقتران الحالة بمهلة اللوحة يقع هنا وحده، لا في كل
     مسار خروج على حِدة. الدخول إلى INTERACTIVE_RUNNING يلغي أي timeout
     قائم، والخروج منه إلى PAUSED أو IDLE يبدأ عدًّا كاملًا جديدًا إن بقيت
     لوحة مفتوحة. */
  function setPhase(next) {
    var prev = state.phase;
    state.phase = next;
    state.mode = (next === 'FULL') ? 'static' : 'interactive';
    if (next === 'FULL') { clearPanelTimer(); }
    else if (next === 'INTERACTIVE_RUNNING') { clearPanelTimer(); }
    else if (prev === 'INTERACTIVE_RUNNING') { armPanelTimer(); }
    applyButtonVisibility();
  }

  function pauseAnimation() {
    if (!state.running || state.paused) { return; }
    state.paused = true;
    clearAllTimers();
    hidePen();
    setPhase('INTERACTIVE_PAUSED');
    updateButtons();
    setStatus(statusLine('موقوف مؤقتًا'));
  }

  function resumeAnimation() {
    if (!state.paused) { return; }
    state.paused = false;
    var r = state.resume;
    if (r && !isStale(r.gen)) {
      schedule(r.gen, r.fn, 0);
      setPhase('INTERACTIVE_RUNNING');
      setStatus(statusLine('جارٍ العرض'));
    } else {
      state.running = false;
      state.resume = null;
      setPhase('INTERACTIVE_IDLE');
      setStatus(statusLine('اكتمل العرض'));
    }
    updateButtons();
  }

  /* تشغيل العرض يبدأ الحركة من الحالة الجاهزة على النسخة inline المركّبة
     نفسها: لا جلب جديد، ولا نسخة ثانية، ولا مسار autoplay إضافي. وهو
     الموضع الوحيد الذي يُنشأ فيه القلم بنص §11. */
  function startAnimation() {
    if (state.mode !== 'interactive' || !state.mounted) { return; }
    if (!activeRoot || !activePlan) { return; }
    var gen = cancelEverything();
    if (activeSaved) {
      restoreAll(activeSaved);
      activeSaved = null;
    }
    destroyPen();
    if (state.penVisible) { ensurePen(activeRoot); }
    activeSaved = hideForAnimation(activePlan);
    setPhase('INTERACTIVE_RUNNING');
    setStatus(statusLine('جارٍ العرض'));
    runPlan(gen, activeRoot, activePlan, activeSaved, function () {
      if (isStale(gen)) { return; }
      setPhase('INTERACTIVE_IDLE');
      setStatus(statusLine('اكتمل العرض'));
      updateButtons();
    });
    updateButtons();
  }

  function onPlayPause() {
    if (state.paused) { resumeAnimation(); return; }
    if (state.running) { pauseAnimation(); return; }
    startAnimation();
  }

  /* ADR-0012 §3: الدخول التفاعلي بفعل مستخدم صريح ومقصود من زر مخصص داخل
     لوحة «صفحات». ولا يستدعيه تحميل صفحة ولا fragment ولا تنقل بالتاريخ
     ولا اختيار صفحة.
     وADR-0013 §4: الإيماءة نفسها تطلب الدخول والتشغيل معًا، فتُطوى لوحة
     «صفحات» بمسار اللوحة الواحد، ويُسجَّل طلب بدء واحد، ثم يبدأ التحميل.
     و§12 المعدَّل: لا تبدأ الحركة قبل نجاح التحميل وبناء الخطة، فطور
     INTERACTIVE_LOADING باقٍ ولا يُتجاوز فشل الشبكة أو التحليل. */
  function enterInteractive() {
    if (state.phase !== 'FULL') { return; }
    setOpenPanel(null);
    state.alignOnFirstMount = true;
    startRequested = true;
    loadPage(state.current);
  }

  /* ADR-0012 §13: العودة إلى FULL — بطلب المستخدم أو بفشل — تنفّذ التنظيف
     الكامل الإلزامي بترتيبه. وهي idempotent: تُستدعى أكثر من مرة بلا خطأ
     وبلا أثر جانبي مختلف، وبلا اعتماد على وجود عقدة أو مؤقت أو طلب. */
  function returnToFull(message) {
    bumpGeneration();                          /* 1  إبطال الجيل */
    abortFetch();                              /* 2  AbortController.abort */
    clearAllTimers();                          /* 3  مؤقتات الحركة كلها */
    clearPanelTimer();                         /* 4  مؤقت اللوحة */
    startRequested = false;                    /* ADR-0013 §8: إلغاء الطلب */
    pendingStart = null;
    state.running = false;
    state.paused = false;
    state.resume = null;                       /* 5  حذف نقطة الاستئناف */
    if (activeSaved) {
      restoreAll(activeSaved);
      activeSaved = null;
    }
    destroyPen();                              /* 6  إزالة القلم */
    teardownStage();                           /* 7  إزالة SVG المضمَّن inline */
    if (el.stage) { el.stage.hidden = true; }  /* 8  تفريغ المسرح وإخفاؤه */
    state.mounted = false;                     /* 9  إزالة حالة viewer النشطة */
    setPhase('FULL');
    if (el.list) { el.list.removeAttribute('data-viewer-active'); } /* 10 إظهار الـ22 */
    state.openPanel = null;                    /* 11 إغلاق اللوحات */
    applyDisclosure();
    /* 12 منع callbacks القديمة من أي أثر: عدّاد الأجيال في الخطوة 1 يُبطلها
       صامتًا، فكل callback يتحقق من جيله قبل أي أثر. */
    if (el.notice) {
      if (message) {
        el.notice.textContent = message;
        el.notice.hidden = false;
      } else {
        el.notice.hidden = true;
      }
    }
    applyViewMode();
    updateButtons();
    setStatus(statusLine(message ? 'المحتوى الساكن معروض كاملًا' : ''));
  }

  function onToggleMode() {
    if (state.phase === 'FULL') { enterInteractive(); return; }
    returnToFull(null);
  }

  function onJump() {
    if (!el.jump) { return; }
    var n = parseInt(el.jump.value, 10);
    if (isNaN(n) || n === state.current) { return; }
    if (state.openPanel === 'nav') { setOpenPanel(null); }
    goTo(n, false);
  }

  function onSkip() {
    var gen = cancelEverything();
    destroyPen();
    if (activeSaved) {
      restoreAll(activeSaved);
      activeSaved = null;
    }
    state.generation = gen;
    setPhase('INTERACTIVE_IDLE');
    updateButtons();
    setStatus(statusLine('عُرضت الصفحة كاملة'));
  }

  /* إعادة التشغيل فعل صريح من المستخدم، فتعمل في تقليل الحركة أيضًا.
     ترفع الجيل وتلغي العمل السابق عبر startAnimation، ولا تعيد الجلب إلا
     إذا لم تكن هناك نسخة مركّبة صالحة — وحينها تنتهي إلى IDLE بلا حركة. */
  function onReplay() {
    if (state.mode !== 'interactive') { return; }
    if (state.mounted && activeRoot && activePlan) { startAnimation(); return; }
    if (activeSaved) {
      restoreAll(activeSaved);
      activeSaved = null;
    }
    loadPage(state.current);
  }

  /* ADR-0012 §10: خطوة واحدة بين عناصر القائمة المغلقة، ولا تجاوز للطرفين.
     وتغيير السرعة لا يعيد الحركة من أولها ولا يبدأها إن كانت متوقفة. */
  function stepSpeed(dir) {
    var next = state.speedIndex + dir;
    if (next < 0 || next >= SPEEDS.length) { return; }
    state.speedIndex = next;
    state.speed = SPEEDS[next];
    updateButtons();
  }

  /* ADR-0012 §11: الاختيار للجلسة الحالية فقط في ذاكرة الصفحة. لا Storage
     ولا Cookie ولا persistence في الـURL، فإعادة التحميل تعيد الافتراضي.
     الإخفاء يزيل القلم من DOM ولا يوقف عرضًا ولا يغيّر صفحة ولا وضعًا ولا
     سرعة، والإظهار أثناء الجريان يعيد إنشاءه فيلحق بالحرف التالي وحده. */
  function setPenVisibility(on) {
    var next = !!on;
    if (state.penVisible === next) { return; }
    state.penVisible = next;
    if (!next) { destroyPen(); }
    else if (state.phase === 'INTERACTIVE_RUNNING' && activeRoot) {
      ensurePen(activeRoot);
    }
    updateButtons();
  }

  function onPenToggle() {
    setPenVisibility(!state.penVisible);
  }

  function onHistoryNav() {
    if (state.hashLock) { return; }
    var m = /^#page-(\d+)$/.exec(window.location.hash || '');
    if (!m) { return; }
    var n = parseInt(m[1], 10);
    if (isNaN(n) || n < 1 || n > state.pages.length) { return; }
    if (n === state.current) { return; }
    goTo(n, true);
  }

  function applyReduced(isReduced) {
    state.reduced = !!isReduced;
    if (state.reduced) {
      cancelEverything();
      destroyPen();
      if (activeSaved) {
        restoreAll(activeSaved);
        activeSaved = null;
      }
      if (state.phase === 'INTERACTIVE_RUNNING' ||
          state.phase === 'INTERACTIVE_PAUSED') {
        setPhase('INTERACTIVE_IDLE');
      }
    }
    updateButtons();
    setStatus(statusLine(state.reduced
      ? 'أُلغيت الحركة والمحتوى كامل'
      : 'الحركة متاحة — اضغط تشغيل العرض'));
  }

  /* ---------- التهيئة ---------- */

  function init() {
    try {
      if (!('fetch' in window) || !('DOMParser' in window) ||
          !document.createElementNS || !window.Promise) {
        return;
      }

      var list = document.querySelector('[data-lesson-pages]');
      var controls = document.querySelector('[data-viewer-controls]');
      if (!list || !controls) { return; }

      var pages = readPagesFromDom(list);
      if (pages.length === 0) { return; }

      el.list = list;
      el.controls = controls;
      el.status = controls.querySelector('[data-viewer-status]');
      el.prev = controls.querySelector('[data-viewer-prev]');
      el.next = controls.querySelector('[data-viewer-next]');
      el.jump = controls.querySelector('[data-viewer-jump]');
      el.play = controls.querySelector('[data-viewer-play]');
      el.mode = controls.querySelector('[data-viewer-mode]');
      el.replay = controls.querySelector('[data-viewer-replay]');
      el.skip = controls.querySelector('[data-viewer-skip]');
      el.slower = controls.querySelector('[data-viewer-slower]');
      el.faster = controls.querySelector('[data-viewer-faster]');
      el.speed = controls.querySelector('[data-viewer-speed]');
      el.penToggle = controls.querySelector('[data-viewer-pen]');
      el.panelNav = controls.querySelector('[data-viewer-panel="nav"]');
      el.panelMotion = controls.querySelector('[data-viewer-panel="motion"]');
      el.fabNav = controls.querySelector('[data-viewer-disclosure="nav"]');
      el.fabMotion = controls.querySelector('[data-viewer-disclosure="motion"]');

      if (!el.status || !el.prev || !el.next || !el.jump || !el.play ||
          !el.mode || !el.replay || !el.skip || !el.slower || !el.faster ||
          !el.speed || !el.penToggle ||
          !el.panelNav || !el.panelMotion ||
          !el.fabNav || !el.fabMotion) {
        return;
      }

      state.pages = pages;

      var stage = document.createElement('div');
      stage.className = 'lesson-stage';
      stage.hidden = true;
      controls.parentNode.insertBefore(stage, controls.nextSibling);
      el.stage = stage;

      var notice = document.createElement('p');
      notice.className = 'lesson-notice';
      notice.hidden = true;
      notice.tabIndex = -1;
      controls.parentNode.insertBefore(notice, stage);
      el.notice = notice;

      var mq = null;
      if (window.matchMedia) {
        mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        state.reduced = !!mq.matches;
      }

      /* خيارات القفز تُبنى من القائمة الساكنة نفسها، فمصدر الحقيقة واحد،
         ولا يُقرأ manifest وقت التشغيل، ولا يُنشأ 22 زرًا مرئيًا. */
      var frag = document.createDocumentFragment();
      for (var oi = 0; oi < pages.length; oi += 1) {
        var opt = document.createElement('option');
        opt.value = String(pages[oi].index);
        opt.textContent = pages[oi].index + ' / ' + pages.length;
        frag.appendChild(opt);
      }
      el.jump.appendChild(frag);

      el.prev.addEventListener('click', function () { goTo(state.current - 1, false); });
      el.next.addEventListener('click', function () { goTo(state.current + 1, false); });
      el.jump.addEventListener('change', onJump);
      el.play.addEventListener('click', onPlayPause);
      el.mode.addEventListener('click', onToggleMode);
      el.replay.addEventListener('click', onReplay);
      el.skip.addEventListener('click', onSkip);
      el.slower.addEventListener('click', function () { stepSpeed(-1); });
      el.faster.addEventListener('click', function () { stepSpeed(1); });
      el.penToggle.addEventListener('click', onPenToggle);
      el.fabNav.addEventListener('click', function () { onDisclosureClick('nav'); });
      el.fabMotion.addEventListener('click', function () { onDisclosureClick('motion'); });
      controls.addEventListener('keydown', onControlsKeydown);
      controls.addEventListener('focusin', function (evt) { state.lastFocus = evt.target; });
      /* ADR-0012 §8: مصادر إعادة الضبط محصورة في click وتنشيط زر وkeydown
         وchange وfocusin داخل أدوات التحكم. ولا mousemove ولا scroll ولا
         callbacks الحركة. مستمع واحد لكل نوع على الحاملة الواحدة. */
      controls.addEventListener('click', armPanelTimer);
      controls.addEventListener('keydown', armPanelTimer);
      controls.addEventListener('change', armPanelTimer);
      controls.addEventListener('focusin', armPanelTimer);
      document.addEventListener('click', onDocumentClick);
      window.addEventListener('popstate', onHistoryNav);
      window.addEventListener('hashchange', onHistoryNav);

      if (mq) {
        var onMq = function (evt) { applyReduced(evt.matches); };
        if (typeof mq.addEventListener === 'function') { mq.addEventListener('change', onMq); }
        else if (typeof mq.addListener === 'function') { mq.addListener(onMq); }
      }

      /* ADR-0012 §4: نموذج تفاعل واحد على كل المقاسات، فلا استعلام لعرض
         الشاشة هنا، ولا اكتشاف لنظام تشغيل ولا user-agent ولا نوع جهاز ولا
         خصائص لمس. وresponsive محصور في CSS بالحجم والموضع وحدهما. */

      /* ADR-0012 §2: البداية دائمًا في العرض الكامل، بلا استثناء ولا شرط
         ولا تفضيل محفوظ. والـfragment يحدد الصفحة الحالية للأدوات ولا يدخل
         الوضع التفاعلي ولا يسبب أي جلب. و§14: fragment غير صالح يُهمَل
         ويبقى العرض الكامل سليمًا. */
      var start = 1;
      var m = /^#page-(\d+)$/.exec(window.location.hash || '');
      if (m) {
        var n = parseInt(m[1], 10);
        if (!isNaN(n) && n >= 1 && n <= pages.length) { start = n; }
      }

      state.ready = true;
      controls.hidden = false;
      state.current = start;
      state.alignOnFirstMount = false;
      setPhase('FULL');
      applyDisclosure();
      applyViewMode();
      updateButtons();
      markActive();
      setStatus(statusLine(''));
    } catch (err) {
      reportSoft(err);
      showStaticFallback('العرض التفاعلي غير متاح. المحتوى الكامل معروض أدناه.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
