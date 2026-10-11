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
    linearGradient: 1, radialGradient: 1, stop: 1, pattern: 1,
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
    gradientUnits: 1, gradientTransform: 1, spreadMethod: 1, patternUnits: 1,
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
    queue: [],
    at: 0,
    saved: null,
    inProg: null,
    prop: null,
    penState: 'idle',
    penBefore: null,
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

  /* markLog: no-op in the viewer (no log panel) */
  function markLog() { }

  /* ===== Parmaga V-2: engine transplanted from lab (2026-10-11) ===== */

  /* ---------- constants from lab ---------- */

  var TRACKED = ['visibility', 'stroke-dasharray', 'stroke-dashoffset', 'fill-opacity'];
  var ID = [1, 0, 0, 1, 0, 0];
  var SKIP_SUBTREE = { defs: 1, title: 1, desc: 1, metadata: 1, linearGradient: 1,
                       radialGradient: 1, pattern: 1, filter: 1 };
  var PUNCT = '\u060C\u061B.\u061F!:\u2026,;?';
  var Script = (function () {
    var AR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    var LAT = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F]/; /* letters only */
    var RTL = /[\u0590-\u08FF\uFB1D-\uFEFC]/;
    /* 'ar' | 'en' for a letter; neutral characters (space, digit, punctuation) return fallback or null */
    function of(ch, fallback) { return AR.test(ch) ? 'ar' : (LAT.test(ch) ? 'en' : (fallback || null)); }
    /* Script runs of a line; spaces, digits and punctuation stay with the current run */
    function runs(text, rtl) {
      var out = [], cur = null;
      for (var i = 0; i < text.length; i += 1) {
        var sc = of(text.charAt(i));
        if (!cur || (sc && cur.sc && sc !== cur.sc)) { cur = { sc: sc, start: i, text: '' }; out.push(cur); }
        if (sc && !cur.sc) { cur.sc = sc; }
        cur.text += text.charAt(i);
      }
      out.forEach(function (r) { if (!r.sc) { r.sc = rtl ? 'ar' : 'en'; } });
      return out;
    }
    /* true if the text contains any right-to-left letter */
    function isRtl(text) { return RTL.test(text || ''); }
    return { AR: AR, LAT: LAT, of: of, runs: runs, isRtl: isRtl };
  }());
  var RUN_MAX_MS = 6000; /* max ms of one run of drawings at 1x */
  var DRAW_GAP_MS = 200;

  var PEN = { IDLE: 'idle', WRITING: 'writing', LIFT: 'lift', TRANSITION: 'transition',
              DRAWING: 'drawing', PAUSED: 'paused', FINISHED: 'finished' };

  /* ---------- Sound (from lab; Web Speech stripped) ---------- */

  var Sound = (function () {
    var DUCK_BIRDS = 0.35, DUCK_PEN = 0.7;
    var AC = window.AudioContext || window.webkitAudioContext || null;
    /* Tuning, by ear */
    var WRITE_LEVEL = 0.5, DRAW_LEVEL = 0.4, TAP_LEVEL = 0.35;
    var PEN_FLOOR = 0.09;   /* what remains of the friction inside a word (0 = pure touches) */
    var PEN_DECAY = 0.03;  /* how fast a nib touch fades to that whisper (s) */
    var F1_MAKEUP = 3.2, F2_MAKEUP = 2.6, D_FREQ = 4800;
    var WATCHDOG_S = 0.25; /* a voice falls silent by itself if no new event arrives */
    var SCRIPTS = {
      ar: { pen: 1850, q: 0.85, damp: 5000, legato: 0.9, form: 0.9, tap: 2300, tapAmt: 0.75, tail: 0.84, release: 0.05 },
      en: { pen: 2900, q: 1.25, damp: 7600, legato: 0.55, form: 0.5, tap: 3700, tapAmt: 0.9, tail: 1, release: 0.025 }
    };
    /* Arabic letter groups, written as escapes to keep this file ASCII-only */
    var AR = {
      dot1: '\u0628\u062C\u062E\u0630\u0632\u0636\u0638\u063A\u0641\u0646',
      dot2: '\u062A\u0642\u064A\u0629',
      dot3: '\u062B\u0634\u067E\u0686\u0698',
      hamza: '\u0621\u0623\u0625\u0624\u0626',
      nonJoin: '\u0627\u0623\u0625\u0622\u062F\u0630\u0631\u0632\u0648\u0624\u0629\u0621\u0698',
      alif: '\u0627\u0623\u0625\u0622\u0649',
      waw: '\u0648\u0624',
      ya: '\u064A\u0626\u06CC',
      throat: '\u0621\u0647\u0639\u062D\u063A\u062E',
      hiss: '\u0633\u0635\u0632\u0634\u062B\u0630\u0638\u0636',
      heavy: '\u0635\u0636\u0637\u0638\u0642\u063A\u062E',
      tall: '\u0627\u0623\u0625\u0622\u0644\u0643\u0637\u0638',
      tail: '\u0646\u064A\u0649\u0642\u0633\u0634\u0635\u0636\u0639\u063A\u062C\u062D\u062E\u0645\u0648\u0631\u0632'
    };
    var EN_VOWEL = { a: [750, 1250], e: [520, 1900], i: [330, 2350], o: [520, 920], u: [360, 1000], y: [340, 2200] };
    var EN_HISS = 'sczx', EN_FRIC = 'fv', EN_SOFT = 'mnlrw', EN_DOT = 'ij', EN_CROSS = 'tf', EN_TWO = 'xk';
    var ARABIC_RE = Script.AR, LATIN_RE = Script.LAT;
    var HARAKA_RE = /[\u064B-\u0652]/g;

    var E = { ctx: null, n: null, enabled: true, hidden: false, volume: 0.7, voice: 0.45,
              speed: 1, rate: 1, bright: 1, dBase: D_FREQ, tapGap: 0.07,
              status: AC ? 'locked' : 'unavailable', want: false, sleepTimer: null,
              recorded: false, listener: null,
              script: '', inWord: false, wordTilt: 0, wordGain: 1, wordPos: 0,
              pending: [], lastTap: 0, tapN: 0, pan: 0, bend: 0,
              birds: 0.7, mood: 'off', birdTimer: null,
              chorus: 0.2, answerAt: 0, answerFrom: null, quietUntil: 0, hush: 0, writeRun: 0, flBusy: 0 };

    function notify() {
      if (E.listener) { try { E.listener(); } catch (err) { reportSoft(err); } }
    }
    function settle(p) {
      if (p && typeof p.then === 'function') {
        p.then(notify, function (err) { reportSoft(err); notify(); });
      }
    }
    function live() { return !!E.ctx && !!E.n && E.enabled && !E.hidden && E.status === 'ready'; }
    function guarded(fn) {
      return function () {
        if (!live()) { return; }
        try { fn.apply(null, arguments); } catch (err) { reportSoft(err); }
      };
    }
    function withCtx(fn) {
      return function () {
        if (!E.ctx || !E.n) { return; }
        try { fn.apply(null, arguments); } catch (err) { reportSoft(err); }
      };
    }
    /* Freeze a param at its value: no click, no piled-up automation */
    function hold(p, t) {
      if (typeof p.cancelAndHoldAtTime === 'function') {
        try { p.cancelAndHoldAtTime(t); return; } catch (err) { /* fall back below */ }
      }
      var v = p.value;
      p.cancelScheduledValues(t);
      p.setValueAtTime(v, t);
    }
    function glide(p, v, t, tc) { p.setTargetAtTime(v, t, tc > 0.002 ? tc : 0.002); }
    function steer(p, v, t, tc) { hold(p, t); glide(p, v, t, tc); }
    function release(voice, t, tc) { hold(voice.env.gain, t); glide(voice.env.gain, 0, t, tc); }
    function allVoices(fn) { fn(E.n.w); fn(E.n.d); fn(E.n.t); }
    function masterLevel() { return (E.enabled && !E.hidden) ? E.volume * E.volume : 0; }

    /* Run the context only while sound is expected; one sleep timer at most */
    function wantRun(on, delayMs) {
      E.want = on;
      if (E.sleepTimer !== null) { window.clearTimeout(E.sleepTimer); E.sleepTimer = null; }
      if (!E.ctx) { return; }
      if (on) {
        if (E.ctx.state !== 'running' && E.ctx.state !== 'closed') {
          try { settle(E.ctx.resume()); } catch (err) { reportSoft(err); }
        }
        return;
      }
      E.sleepTimer = window.setTimeout(function () {
        E.sleepTimer = null;
        if (!E.want && E.ctx && E.ctx.state === 'running') {
          try { settle(E.ctx.suspend()); } catch (err) { reportSoft(err); }
        }
      }, delayMs || 300);
    }

    /* Paper: pink noise, rare soft fibres, crossfaded loop, soft limiter */
    function makeTexture(ctx, seconds, o) {
      var sr = ctx.sampleRate, len = Math.max(4, Math.floor(sr * seconds));
      var fade = Math.min(Math.floor(sr * 0.08), Math.floor(len / 4));
      var buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
      var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, tick = 0, tickLp = 0, sum = 0, i, wn, pink;
      for (i = 0; i < len; i += 1) {
        wn = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + wn * 0.0555179; b1 = 0.99332 * b1 + wn * 0.0750759;
        b2 = 0.96900 * b2 + wn * 0.1538520; b3 = 0.86650 * b3 + wn * 0.3104856;
        b4 = 0.55000 * b4 + wn * 0.5329522; b5 = -0.7616 * b5 - wn * 0.0168980;
        pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + wn * 0.5362) * 0.11;
        b6 = wn * 0.115926;
        if (Math.random() < o.tickRate / sr) { tick = o.tickAmt * (0.5 + Math.random() * 0.5); }
        tickLp += (tick * (Math.random() * 2 - 1) - tickLp) * 0.35;
        tick *= 0.985;
        d[i] = pink * (1 - o.white) + wn * o.white * 0.3 + tickLp;
      }
      for (i = 0; i < fade; i += 1) {
        var a = (i / fade) * Math.PI / 2;
        d[i] = d[i] * Math.sin(a) + d[len - fade + i] * Math.cos(a);
      }
      var end = len - fade;
      for (i = 0; i < end; i += 1) { sum += d[i] * d[i]; }
      var k = 0.2 / (Math.sqrt(sum / end) || 1);
      for (i = 0; i < end; i += 1) { d[i] = Math.tanh(d[i] * k * 1.2) / 1.2; }
      return { buf: buf, loopEnd: end / sr };
    }
    function loopSource(ctx, tex, rate) {
      var s = ctx.createBufferSource();
      s.buffer = tex.buf;
      s.loop = true;
      s.loopStart = 0;
      s.loopEnd = tex.loopEnd;
      s.playbackRate.value = rate;
      return s;
    }
    function build(ctx) {
      var n = {};
      function bp(f, q) { var b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; return b; }
      function filt(type, f) { var b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = 0.5; return b; }
      function gain(v) { var g = ctx.createGain(); g.gain.value = v; return g; }
      n.master = gain(masterLevel());
      n.comp = ctx.createDynamicsCompressor();
      n.comp.threshold.value = -20;
      n.comp.knee.value = 12;
      n.comp.ratio.value = 3;
      n.comp.attack.value = 0.012;
      n.comp.release.value = 0.25;
      n.bus = gain(1);
      /* Duck stages: speech lowers pen and birds here, the user mix levels are never touched */
      n.duckPen = gain(1); n.duckPen.connect(n.master);
      n.duckBirds = gain(1); n.duckBirds.connect(n.master);
      n.pan = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;
      if (n.pan) { n.bus.connect(n.pan); n.pan.connect(n.duckPen); } else { n.bus.connect(n.duckPen); }
      n.master.connect(n.comp);
      n.comp.connect(ctx.destination);
      var wTex = makeTexture(ctx, 4.2, { tickRate: 6, tickAmt: 0.5, white: 0.15 });
      var dTex = makeTexture(ctx, 3.7, { tickRate: 2, tickAmt: 0.25, white: 0.35 });
      /* Writing voice: pen band + two letter formants, summed, damped, enveloped */
      var w = {};
      w.src = loopSource(ctx, wTex, E.rate);
      w.hp = filt('highpass', 220);
      w.pen = bp(SCRIPTS.en.pen, SCRIPTS.en.q); w.gPen = gain(1);
      w.f1 = bp(500, 4); w.gF1 = gain(0);
      w.f2 = bp(1500, 5); w.gF2 = gain(0);
      w.damp = filt('lowpass', SCRIPTS.en.damp);
      w.env = gain(0);
      w.src.connect(w.hp);
      w.hp.connect(w.pen); w.pen.connect(w.gPen); w.gPen.connect(w.damp);
      w.hp.connect(w.f1); w.f1.connect(w.gF1); w.gF1.connect(w.damp);
      w.hp.connect(w.f2); w.f2.connect(w.gF2); w.gF2.connect(w.damp);
      w.damp.connect(w.env); w.env.connect(n.bus);
      w.src.start();
      n.w = w;
      /* Drawing voice: lighter, airy tracing */
      var d = {};
      d.src = loopSource(ctx, dTex, E.rate);
      d.hp = filt('highpass', 1100); d.bp = bp(E.dBase, 0.6); d.lp = filt('lowpass', 9000); d.env = gain(0);
      d.src.connect(d.hp); d.hp.connect(d.bp); d.bp.connect(d.lp); d.lp.connect(d.env); d.env.connect(n.bus);
      d.src.start();
      n.d = d;
      /* Tap voice: dots, hamza, harakat, punctuation */
      var tv = {};
      tv.src = loopSource(ctx, dTex, 1.3);
      tv.bp = bp(3000, 1.4); tv.lp = filt('lowpass', 6500); tv.env = gain(0);
      tv.src.connect(tv.bp); tv.bp.connect(tv.lp); tv.lp.connect(tv.env); tv.env.connect(n.bus);
      tv.src.start();
      n.t = tv;
      n.b = buildBirds(ctx, n);
      return n;
    }

    /* ---- Birds: a procedural garden. They take turns, answer, sing in pen silences; a curious bird lands
       close after long writing and a new drawing startles it. Four sine voices, flutter, breeze, reverb,
       one scheduler timer; no node per note or flight. */
    var BIRD_LEVEL = 0.60;     /* birds sit clearly above the pen */
    var BIRD_DUCK = 0.85;      /* share kept while the pen writes (birds barely step back) */
    var BIRD_TICK_MS = 150;    /* the only bird timer */
    var FLUTTER_LEVEL = 0.45;  /* wing flaps when a bird changes perch */
    var BREEZE_LEVEL = 0.05;   /* leaves in the wind, very low */
    var CURIOUS_AFTER_S = 7;   /* seconds of writing before a bird comes close to watch */
    var CHORUS_JOIN_S = 6;     /* how long the garden takes to fully wake up */
    function rnd(a, b) { return a + Math.random() * (b - a); }
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    var SPECIES = [
      { name: 'sparrow', pan: -0.55, near: 0.6, rate: 0.35, call: 3800, alarm: 4800, song: function () {
        var notes = [], at = 0, n = 3 + Math.floor(Math.random() * 4), base = rnd(3600, 4400);
        for (var i = 0; i < n; i += 1) {
          var dur = rnd(0.045, 0.07);
          notes.push({ at: at, dur: dur, f0: base * 1.25, f1: base * 0.8, amp: rnd(0.7, 1) });
          at += dur + rnd(0.05, 0.09);
        }
        return notes;
      } },
      { name: 'two-note', pan: 0.45, near: 0.45, rate: 0.25, call: 5000, alarm: 5600, song: function () {
        var notes = [], at = 0, reps = 2 + Math.floor(Math.random() * 3), hi = rnd(5200, 6000), lo = hi * rnd(0.62, 0.7);
        for (var i = 0; i < reps; i += 1) {
          notes.push({ at: at, dur: 0.11, f0: hi, f1: hi * 0.97, amp: 0.9 });
          notes.push({ at: at + 0.16, dur: 0.13, f0: lo * 1.03, f1: lo, amp: 0.8 });
          at += 0.36;
        }
        return notes;
      } },
      { name: 'trill', pan: 0.1, near: 0.3, rate: 0.12, call: 4800, alarm: 5200, song: function () {
        var notes = [], at = 0, n = 10 + Math.floor(Math.random() * 10), f = rnd(4600, 5600), step = rnd(0.028, 0.036);
        for (var i = 0; i < n; i += 1) {
          notes.push({ at: at, dur: step * 0.6, f0: f * 1.06, f1: f * 0.94, amp: 0.55 + 0.45 * Math.sin(Math.PI * i / n) });
          at += step;
        }
        return notes;
      } },
      { name: 'warbler', pan: -0.2, near: 0.5, rate: 0.2, call: 3000, alarm: 4400, song: function () {
        var notes = [], at = 0, n = 5 + Math.floor(Math.random() * 6), f = rnd(2600, 3400);
        for (var i = 0; i < n; i += 1) {
          var g = Math.min(5600, Math.max(1800, f * Math.pow(2, rnd(-0.4, 0.5)))), dur = rnd(0.06, 0.14);
          notes.push({ at: at, dur: dur, f0: f, f1: g, amp: rnd(0.6, 1) });
          f = g; at += dur + rnd(0.015, 0.05);
        }
        return notes;
      } }
    ];
    /* Short contact call (landing) and sharp alarm chips (startled) */
    function callSong(base) {
      var notes = [{ at: 0, dur: 0.06, f0: base * 0.9, f1: base * 1.15, amp: 0.8 }];
      if (Math.random() < 0.6) { notes.push({ at: 0.12, dur: 0.05, f0: base * 1.05, f1: base * 0.95, amp: 0.6 }); }
      return notes;
    }
    function alarmSong(base) {
      var notes = [], at = 0, n = 3 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i += 1) {
        notes.push({ at: at, dur: 0.028, f0: base * 1.15, f1: base * 0.85, amp: 1 });
        at += rnd(0.09, 0.13);
      }
      return notes;
    }
    /* Small open-air space: decaying stereo noise used as a reverb impulse */
    function makeSpace(ctx, seconds) {
      var sr = ctx.sampleRate, len = Math.max(4, Math.floor(sr * seconds)), buf = ctx.createBuffer(2, len, sr);
      for (var c = 0; c < 2; c += 1) {
        var d = buf.getChannelData(c);
        for (var i = 0; i < len; i += 1) { d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3) * 0.5; }
      }
      return buf;
    }
    /* Distance: a near bird is louder, brighter and drier; a far one is softer and wetter */
    function distLevel(near) { return 0.22 + 0.78 * Math.pow(near, 1.4); }
    function distSend(near) { return 0.12 + 0.55 * (1 - near); }
    function distTone(near) { return 2600 + 9400 * near; }
    function placeVoice(v, near, pos, t, tc) {
      v.near = near; v.pos = pos;
      if (t === null) {
        v.vol.gain.value = distLevel(near); v.send.gain.value = distSend(near); v.lp.frequency.value = distTone(near);
        if (v.pan) { v.pan.pan.value = clamp(pos, -1, 1); }
        return;
      }
      steer(v.vol.gain, distLevel(near), t, tc);
      steer(v.send.gain, distSend(near), t, tc);
      steer(v.lp.frequency, distTone(near), t, tc);
      if (v.pan) { steer(v.pan.pan, clamp(pos, -1, 1), t, tc); }
    }
    function buildBirds(ctx, n) {
      var b = { sources: [] }, hasPan = typeof ctx.createStereoPanner === 'function';
      function panner(v) { if (!hasPan) { return null; } var p = ctx.createStereoPanner(); p.pan.value = v; return p; }
      function filt(type, f, q) { var x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; }
      function gain(v) { var g = ctx.createGain(); g.gain.value = v; return g; }
      b.amb = gain(0);
      b.amb.connect(n.duckBirds);
      b.verb = ctx.createConvolver(); b.verb.buffer = makeSpace(ctx, 1.8);
      b.wet = gain(0.6);
      b.verb.connect(b.wet); b.wet.connect(b.amb);
      b.voices = SPECIES.map(function (sp) {
        var v = { sp: sp, busy: 0, near: sp.near, pos: sp.pan, away: 0, curious: 0 };
        v.osc = ctx.createOscillator(); v.osc.type = 'sine'; v.osc.frequency.value = 4000;
        v.lfo = ctx.createOscillator(); v.lfo.type = 'sine'; v.lfo.frequency.value = rnd(26, 44);
        v.depth = gain(rnd(40, 120));
        v.lp = filt('lowpass', 8e3, 0.5);
        v.env = gain(0); v.vol = gain(1); v.send = gain(0.3);
        v.lfo.connect(v.depth); v.depth.connect(v.osc.frequency);
        v.osc.connect(v.lp); v.lp.connect(v.env); v.env.connect(v.vol);
        v.pan = panner(sp.pan);
        if (v.pan) { v.vol.connect(v.pan); v.pan.connect(b.amb); } else { v.vol.connect(b.amb); }
        v.env.connect(v.send); v.send.connect(b.verb);
        placeVoice(v, sp.near, sp.pan, null);
        v.osc.start(); v.lfo.start();
        b.sources.push(v.osc, v.lfo);
        return v;
      });
      var noise = makeTexture(ctx, 2.3, { tickRate: 0, tickAmt: 0, white: 0.6 });
      b.fl = { src: loopSource(ctx, noise, 1.6), bp: filt('bandpass', 1400, 0.9), env: gain(0), pan: panner(0) };
      b.fl.src.connect(b.fl.bp); b.fl.bp.connect(b.fl.env);
      if (b.fl.pan) { b.fl.env.connect(b.fl.pan); b.fl.pan.connect(b.amb); } else { b.fl.env.connect(b.amb); }
      b.br = { src: loopSource(ctx, noise, 0.5), lp: filt('lowpass', 650, 0.5), g: gain(BREEZE_LEVEL * 0.3) };
      b.br.src.connect(b.br.lp); b.br.lp.connect(b.br.g); b.br.g.connect(b.amb);
      b.fl.src.start(); b.br.src.start();
      b.sources.push(b.fl.src, b.br.src);
      b.stop = function () {
        b.sources.forEach(function (s) { try { s.stop(); } catch (e) { /* already stopped */ } });
      };
      return b;
    }
    /* One phrase = automation on the voice's persistent oscillator and gain, nothing created */
    function singNotes(v, notes, t0) {
      var f = v.osc.frequency, g = v.env.gain, end = t0;
      f.cancelScheduledValues(t0); g.cancelScheduledValues(t0);
      g.setValueAtTime(0, t0);
      notes.forEach(function (nt) {
        var s = t0 + nt.at, d = Math.max(0.012, nt.dur), a = Math.min(0.008, d * 0.25);
        f.setValueAtTime(Math.max(50, nt.f0), s);
        f.exponentialRampToValueAtTime(Math.max(50, nt.f1), s + d);
        g.setValueAtTime(0, s);
        g.linearRampToValueAtTime(nt.amp, s + a);
        g.linearRampToValueAtTime(nt.amp * 0.7, s + d * 0.7);
        g.linearRampToValueAtTime(0, s + d);
        end = s + d;
      });
      v.busy = end;
      return end;
    }
    function cutSong(v, t) {
      hold(v.env.gain, t);
      glide(v.env.gain, 0, t, 0.008);
      hold(v.osc.frequency, t);
      v.busy = t + 0.03;
    }
    /* A flight: wing beats panned from the old perch to the new one, while the voice moves */
    function flyTo(v, near, pos, t) {
      var fl = E.n.b.fl;
      if (E.flBusy > t) { placeVoice(v, near, pos, t, 0.6); return; }
      var dur = rnd(0.45, 0.85), hz = rnd(14, 20), beats = Math.max(4, Math.round(dur * hz));
      var loud = FLUTTER_LEVEL * (0.25 + 0.75 * Math.max(v.near, near)), g = fl.env.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(0, t);
      for (var k = 0; k < beats; k += 1) {
        var s = t + k / hz, shape = Math.sin(Math.PI * (k + 0.5) / beats);
        g.setValueAtTime(0, s);
        g.linearRampToValueAtTime(loud * (0.55 + 0.45 * shape) * rnd(0.8, 1), s + 0.01);
        g.linearRampToValueAtTime(0, s + 0.04);
      }
      if (fl.pan) {
        fl.pan.pan.cancelScheduledValues(t);
        fl.pan.pan.setValueAtTime(clamp(v.pos, -1, 1), t);
        fl.pan.pan.linearRampToValueAtTime(clamp(pos, -1, 1), t + dur);
      }
      fl.bp.frequency.setValueAtTime(rnd(1100, 1800), t);
      E.flBusy = t + dur + 0.1;
      placeVoice(v, near, pos, t, dur / 3);
    }
    function gust(t) {
      var br = E.n.b.br, g = br.g.gain;
      hold(g, t);
      glide(g, BREEZE_LEVEL * rnd(0.6, 1), t, rnd(0.6, 1.2));
      glide(g, BREEZE_LEVEL * 0.25, t + rnd(2, 4), 1.5);
      steer(br.lp.frequency, rnd(500, 900), t, 1);
    }
    function startle(now) {
      var vs = E.n.b.voices, close = null;
      vs.forEach(function (v) { if (v.away < now && v.near > 0.7 && (!close || v.near > close.near)) { close = v; } });
      if (!close) {
        if (Math.random() < 0.35) { E.hush = now + rnd(0.6, 1.2); } /* nobody close: a brief held breath */
        return;
      }
      vs.forEach(function (o) { if (o !== close && o.busy > now && Math.random() < 0.6) { cutSong(o, now + rnd(0.05, 0.2)); } });
      cutSong(close, now);
      var end = singNotes(close, alarmSong(close.sp.alarm), now + 0.04);
      E.flBusy = 0; /* an escape is always heard */
      flyTo(close, 0.1, (close.pos >= 0 ? 1 : -1) * rnd(0.8, 0.95), now + 0.08);
      close.curious = 0;
      close.away = Math.max(end, now) + rnd(5, 10);
      E.hush = now + rnd(1.4, 2.4);
      E.answerAt = E.hush + rnd(0.2, 0.6); E.answerFrom = close;
      E.writeRun = 0;
    }
    /* Pen events reach the garden here */
    function garden(type, ms) {
      if (!E.n.b || E.mood === 'off' || E.birds <= 0) { return; }
      var now = E.ctx.currentTime, sec = Math.max(0, ms || 0) / 1000;
      if (type === 'write') { E.writeRun += sec; }
      else if (type === 'lift') { E.writeRun += sec; E.quietUntil = Math.max(E.quietUntil, now + 0.4); }
      else if (type === 'tap') {
        E.quietUntil = Math.max(E.quietUntil, now + 0.8);
        if (Math.random() < 0.5) { E.answerAt = now + rnd(0.25, 0.6); E.answerFrom = null; }
      }
      else if (type === 'line') { E.quietUntil = Math.max(E.quietUntil, now + 1.2); }
      else if (type === 'block') { E.quietUntil = now + 2.2; E.writeRun *= 0.5; }
      else if (type === 'draw') { startle(now); }
      armBirds();
    }
    function birdLevel() {
      if (E.birds <= 0 || E.mood === 'off') { return 0; }
      return BIRD_LEVEL * E.birds * (E.mood === 'duck' ? BIRD_DUCK : 1);
    }
    function birdsWanted() { return E.birds > 0 && E.mood !== 'off' && live() && !!E.n.b; }
    function othersEnd(v) {
      var end = 0;
      E.n.b.voices.forEach(function (o) { if (o !== v && o.busy > end) { end = o.busy; } });
      return end;
    }
    function gardenStep(now, dt) {
      var vs = E.n.b.voices, act = E.mood === 'duck' ? 0.75 : (E.mood === 'tail' ? 0.9 : 1);
      E.chorus = Math.min(1, E.chorus + dt / CHORUS_JOIN_S);
      if (Math.random() < 0.05 * dt) { gust(now); }
      /* A bird that watched long enough leaves calmly */
      vs.forEach(function (v) {
        if (v.curious && now > v.curious && v.busy < now) {
          v.curious = 0;
          flyTo(v, rnd(0.2, 0.45), clamp(v.sp.pan + rnd(-0.3, 0.3), -0.9, 0.9), now + 0.05);
        }
      });
      /* Curiosity: after a long stretch of writing, one bird lands close to watch */
      if (E.mood === 'duck' && E.writeRun > CURIOUS_AFTER_S && E.flBusy < now) {
        var free = vs.filter(function (v) { return !v.curious && v.away < now && v.busy < now; });
        if (free.length) {
          var c = free[Math.floor(Math.random() * free.length)];
          flyTo(c, rnd(0.85, 1), rnd(-0.35, 0.35), now + 0.05);
          c.curious = now + rnd(14, 24);
          singNotes(c, callSong(c.sp.call), E.flBusy + 0.1);
          E.writeRun = 0;
        }
      }
      if (E.hush > now) { return; }
      /* Wandering: now and then a bird hops to another perch */
      vs.forEach(function (v) {
        if (v.curious || v.away > now || v.busy > now || E.flBusy > now) { return; }
        if (Math.random() < 0.025 * dt) {
          flyTo(v, rnd(0.15, 0.75), clamp(v.sp.pan + rnd(-0.4, 0.4), -0.95, 0.95), now + 0.05);
        }
      });
      /* Songs: take turns, answer each other, fill the pen's silences */
      var first = Math.floor(Math.random() * vs.length);
      for (var j = 0; j < vs.length; j += 1) {
        var i = (first + j) % vs.length, v = vs[i];
        if (v.away > now || v.busy > now + 0.4 || E.chorus < i * 0.25) { continue; }
        var p = v.sp.rate * act * dt * (v.curious ? 1.8 : 1);
        if (E.quietUntil > now) { p *= 2.5; }
        var answering = E.answerAt > 0 && v !== E.answerFrom && now >= E.answerAt - 0.3 && now <= E.answerAt + 0.8;
        if (answering) { p = Math.max(p, 0.45); }
        var oe = othersEnd(v), at = Math.max(now + 0.05, v.busy + rnd(0.25, 0.9));
        if (oe > now) {
          p *= v.sp.name === 'trill' ? 0.5 : 0.2;
          at = Math.max(at, oe + rnd(0.1, 0.35));
        }
        if (at > now + 1.2 || Math.random() >= p) { continue; }
        var end = singNotes(v, v.sp.song(), at);
        if (answering) { E.answerAt = 0; }
        if (Math.random() < 0.55) { E.answerAt = end + rnd(0.15, 0.6); E.answerFrom = v; }
      }
    }
    function birdTick() {
      E.birdTimer = null;
      try {
        if (!birdsWanted()) { return; }
        if (E.ctx.state === 'running') { gardenStep(E.ctx.currentTime, BIRD_TICK_MS / 1000); }
        else if (!E.want) { return; }
      } catch (err) { reportSoft(err); return; }
      E.birdTimer = window.setTimeout(birdTick, BIRD_TICK_MS);
    }
    function armBirds() {
      if (E.birdTimer === null && birdsWanted()) { E.birdTimer = window.setTimeout(birdTick, 60); }
    }
    function silenceBirds(t, tc) {
      if (E.birdTimer !== null) { window.clearTimeout(E.birdTimer); E.birdTimer = null; }
      if (!E.n || !E.n.b) { return; }
      var k = Math.max(0.01, tc || 0.03);
      E.n.b.voices.forEach(function (v) {
        hold(v.env.gain, t);
        glide(v.env.gain, 0, t, k);
        v.busy = 0; v.away = 0; v.curious = 0;
      });
      hold(E.n.b.fl.env.gain, t);
      glide(E.n.b.fl.env.gain, 0, t, k);
      E.flBusy = 0; E.answerAt = 0; E.hush = 0; E.quietUntil = 0; E.writeRun = 0;
    }
    /* mood: 'open' (between paragraphs) | 'duck' (pen on paper) | 'tail' (page ended) | 'off' */
    function setMood(m, tc, force) {
      if (E.mood === m && !force) { armBirds(); return; }
      var wake = E.mood === 'off' && m !== 'off';
      E.mood = m;
      if (!E.ctx || !E.n || !E.n.b) { return; }
      var t = E.ctx.currentTime;
      if (wake) {
        E.chorus = 0.2;
        E.n.b.voices.forEach(function (v) { placeVoice(v, v.sp.near, v.sp.pan, t, 0.2); });
      }
      steer(E.n.b.amb.gain, live() ? birdLevel() : 0, t, tc || 0.4);
      if (m === 'off' || E.birds <= 0) { silenceBirds(t, tc); }
      armBirds();
    }


    /* ---- Letters ---- */
    var profiles = new Map();
    function hashOf(c) { return Math.imul(c, 2654435761) >>> 0; }
    function scriptOf(ch, rtl) { return Script.of(ch, rtl ? 'ar' : 'en'); }
    function profile(ch, sc) {
      var key = sc + ch;
      if (profiles.has(key)) { return profiles.get(key); }
      var base = Array.from(ch)[0] || ' ', h = hashOf(base.codePointAt(0));
      var p = { f1: 450 + (h % 6) * 70, f2: 1200 + ((h >>> 3) % 8) * 160, weight: 0.9 + ((h >>> 7) % 5) * 0.03,
                dots: 0, marks: 0, nonJoin: false, lift: false, cross: false, two: false,
                tall: false, tail: false, hiss: false };
      if (sc === 'ar') {
        var has = function (set) { return set.indexOf(base) !== -1; };
        if (has(AR.dot1)) { p.dots = 1; } else if (has(AR.dot2)) { p.dots = 2; } else if (has(AR.dot3)) { p.dots = 3; }
        if (has(AR.hamza)) { p.marks += 1; }
        p.marks += (ch.match(HARAKA_RE) || []).length;
        p.nonJoin = has(AR.nonJoin); p.tall = has(AR.tall); p.tail = has(AR.tail);
        if (has(AR.alif)) { p.f1 = 800; p.f2 = 1300; }
        else if (has(AR.waw)) { p.f1 = 450; p.f2 = 900; }
        else if (has(AR.ya)) { p.f1 = 330; p.f2 = 2300; }
        else if (has(AR.throat)) { p.f1 = 620; p.f2 = 1150; p.weight = 0.85; }
        else if (has(AR.hiss)) { p.f1 = 2600; p.f2 = 5000; p.hiss = true; }
        if (has(AR.heavy)) { p.f2 *= 0.8; }
      } else {
        var low = base.toLowerCase();
        if (EN_VOWEL[low]) { p.f1 = EN_VOWEL[low][0]; p.f2 = EN_VOWEL[low][1]; }
        else if (EN_HISS.indexOf(low) !== -1) { p.f1 = 3000; p.f2 = 5600; p.hiss = true; }
        else if (EN_FRIC.indexOf(low) !== -1) { p.f1 = 1700; p.f2 = 3800; }
        else if (low === 'h') { p.f1 = 700; p.f2 = 1250; p.weight = 0.82; }
        else if (EN_SOFT.indexOf(low) !== -1) { p.f1 = 380; p.f2 = 1300; p.weight = 0.88; }
        else if (/[0-9]/.test(base)) { p.f1 = 600; p.f2 = 2000; }
        if (EN_DOT.indexOf(low) !== -1) { p.dots = 1; }
        p.cross = EN_CROSS.indexOf(low) !== -1;
        p.two = EN_TWO.indexOf(low) !== -1;
        p.lift = base !== low;
        if (p.lift) { p.weight *= 1.12; }
      }
      if (profiles.size > 600) { profiles.clear(); }
      profiles.set(key, p);
      return p;
    }

    /* ---- Shared moves ---- */
    function voiceMix() { return E.voice * Math.min(1, Math.max(0.35, 1.25 - 0.25 * E.speed)); }
    function applyVoice() {
      if (!E.ctx || !E.n) { return; }
      var t = E.ctx.currentTime, m = voiceMix(), w = E.n.w;
      steer(w.gPen.gain, 1 - 0.55 * m, t, 0.08);
      steer(w.gF1.gain, m * F1_MAKEUP, t, 0.08);
      steer(w.gF2.gain, m * F2_MAKEUP, t, 0.08);
    }
    function penHz(sc) { return SCRIPTS[sc].pen * E.bright * (1 + E.wordTilt * 0.07); }
    function applyScript(sc, t) {
      if (E.script === sc) { return; }
      E.script = sc;
      var cfg = SCRIPTS[sc], w = E.n.w;
      steer(w.pen.Q, cfg.q, t, 0.05);
      steer(w.damp.frequency, cfg.damp * E.bright, t, 0.06);
      steer(w.pen.frequency, penHz(sc), t, 0.05);
      steer(E.n.t.bp.frequency, cfg.tap, t, 0.02);
    }
    function panTo(x01, t, tc) {
      if (!E.n.pan) { return; }
      var v = Math.max(-1, Math.min(1, (x01 * 2 - 1) * 0.55));
      if (Math.abs(v - E.pan) < 0.01) { return; }
      E.pan = v;
      steer(E.n.pan.pan, v, t, tc);
    }
    /* One tap = short soft transient; spaced at least tapGap apart so taps never crackle */
    function tapAt(when, amt, hz) {
      var tv = E.n.t, g = tv.env.gain, now = E.ctx.currentTime;
      if (when < now) { when = now; }
      if (when < E.lastTap + E.tapGap) { when = E.lastTap + E.tapGap; }
      if (when > now + 0.3) { return; }
      E.lastTap = when;
      E.tapN = (E.tapN + 1) % 7;
      g.cancelScheduledValues(when);
      g.setValueAtTime(0, when);
      g.linearRampToValueAtTime(TAP_LEVEL * amt, when + 0.0025);
      g.setTargetAtTime(0, when + 0.0025, 0.011);
      tv.bp.frequency.setValueAtTime(hz * (0.94 + 0.02 * E.tapN), when);
    }
    function flushMarks(t0) {
      var cfg = SCRIPTS[E.script || 'ar'], list = E.pending;
      E.pending = [];
      for (var i = 0; i < list.length && i < 5; i += 1) {
        tapAt(t0 + i * E.tapGap, list[i] * cfg.tapAmt, cfg.tap * (list[i] < 0.7 ? 1.15 : 1));
      }
    }
    function punctMarks(ch, t, d, cfg) {
      var g = E.n.w.env.gain;
      var count = ch === '\u2026' ? 3 : (ch === ':' || ch === ';' || ch === '\u061B') ? 2 : 1;
      var stroke = '!?,;\u061F\u060C\u061B'.indexOf(ch) !== -1, lead = 0.004;
      if (stroke) {
        glide(g, WRITE_LEVEL * 0.7, t, 0.006);
        glide(g, WRITE_LEVEL * 0.04, t + Math.min(0.05, d * 0.35), 0.01);
        lead = Math.min(0.06, d * 0.45);
      }
      for (var i = 0; i < count; i += 1) { tapAt(t + lead + i * E.tapGap, cfg.tapAmt, cfg.tap); }
    }

    /* Must be called from a user gesture (Play / Replay / Step / Sound checkbox) */
    function unlock() {
      if (!AC || !E.enabled) { return false; }
      if (!E.ctx) {
        var ctx = null;
        try {
          ctx = new AC();
          E.n = build(ctx);
          E.ctx = ctx;
          E.status = 'ready';
          E.script = ''; E.lastTap = 0; E.pan = 0; E.pending = []; E.inWord = false;
          ctx.onstatechange = notify;
          applyVoice();
        } catch (err) {
          reportSoft(err);
          E.n = null; E.ctx = null; E.status = 'error';
          if (ctx && typeof ctx.close === 'function') { try { settle(ctx.close()); } catch (e2) { reportSoft(e2); } }
          notify();
          return false;
        }
      }
      if (E.ctx.state !== 'running') {
        try { settle(E.ctx.resume()); } catch (err) { reportSoft(err); }
      }
      notify();
      return true;
    }

    return {
      supported: !!AC,
      setListener: function (fn) { E.listener = fn; },
      unlock: unlock,

      /* Lifecycle */
      resume: guarded(function () { wantRun(true); setMood('open', 0.5); }),
      pause: withCtx(function () {
        var t = E.ctx.currentTime;
        allVoices(function (v) { release(v, t, 0.025); });
        setMood('off', 0.12);
        wantRun(false, 300);
      }),
      stop: withCtx(function () {
        var t = E.ctx.currentTime;
        E.pending = []; E.inWord = false;
        allVoices(function (v) { release(v, t, 0.006); });
        setMood('off', 0.03);
        wantRun(false, 150);
      }),
      fadeOut: withCtx(function () {
        var t = E.ctx.currentTime;
        E.pending = []; E.inWord = false;
        allVoices(function (v) { release(v, t, 0.08); });
        var tail = E.birds > 0 && !!E.n.b && live();
        if (tail) {
          E.mood = 'tail';
          E.quietUntil = t + 3;
          var a = E.n.b.amb.gain;
          hold(a, t);
          glide(a, birdLevel(), t, 0.3);
          glide(a, 0, t + 2.5, 0.7);
          armBirds();
        } else { setMood('off', 0.1); }
        wantRun(false, tail ? 4800 : 800);
      }),
      destroy: function () {
        if (E.sleepTimer !== null) { window.clearTimeout(E.sleepTimer); E.sleepTimer = null; }
        if (E.birdTimer !== null) { window.clearTimeout(E.birdTimer); E.birdTimer = null; }
        E.mood = 'off';
        var ctx = E.ctx, n = E.n;
        E.ctx = null; E.n = null; E.want = false; E.recorded = false; E.script = '';
        E.pending = []; E.inWord = false;
        E.status = AC ? 'locked' : 'unavailable';
        if (!ctx) { return; }
        if (n) {
          ['w', 'd', 't'].forEach(function (k) { try { n[k].src.stop(); } catch (e) { /* already stopped */ } });
          if (n.b) { n.b.stop(); }
          try { n.master.disconnect(); } catch (e) { /* ignore */ }
        }
        try { ctx.onstatechange = null; settle(ctx.close()); } catch (err) { reportSoft(err); }
        notify();
      },

      /* Writing: one call per grapheme. info = { kind, ms, ch, prev, next, rtl } */
      startWriting: guarded(function () {
        var t = E.ctx.currentTime;
        wantRun(true);
        E.inWord = false;
        release(E.n.d, t, 0.012);
      }),
      updateWriting: guarded(function (info) {
        info = info || {};
        var w = E.n.w, g = w.env.gain, t = E.ctx.currentTime, i;
        var d = Math.max(info.ms || 0, 8) / 1000, kind = info.kind || 'char', ch = info.ch || '';
        var sc = scriptOf(ch, info.rtl), cfg = SCRIPTS[sc];
        wantRun(true);
        applyScript(sc, t);
        hold(g, t);
        if (kind === 'space' || kind === 'blank') {
          if (E.pending.length) { flushMarks(t); }
          glide(g, WRITE_LEVEL * 0.03, t, Math.min(0.02, Math.max(0.006, d * 0.35)));
          E.inWord = false;
        } else if (kind === 'punct') {
          if (E.pending.length) { flushMarks(t); }
          glide(g, WRITE_LEVEL * 0.04, t, 0.008);
          punctMarks(ch, t, d, cfg);
          E.inWord = false;
        } else {
          var pr = profile(ch, sc), onset = !E.inWord;
          if (onset) {
            E.wordTilt = E.wordTilt * 0.55 + (Math.random() * 2 - 1) * 0.45;
            E.wordGain = 0.88 + Math.random() * 0.17;
            E.wordPos = 0;
          }
          var P = WRITE_LEVEL * pr.weight * E.wordGain;
          var decl = sc === 'ar' ? Math.max(0.86, 1 - 0.025 * E.wordPos) : 1;
          var prevPr = (info.prev && graphemeKind(info.prev) === 'char') ? profile(info.prev, scriptOf(info.prev, info.rtl)) : null;
          /* Touch: nib heard on landing and accents, then a whisper */
          var floor = P * PEN_FLOOR;
          var touch = function (at, peak) {
            glide(g, peak, at, 0.003);
            glide(g, floor, at + 0.01, PEN_DECAY);
          };
          if (onset) {
            touch(t, P);
          } else if (pr.lift) {
            glide(g, 0, t, 0.004);
            touch(t + Math.min(0.012, d * 0.4), P * 0.85);
          } else if (sc === 'ar' && prevPr && prevPr.nonJoin) {
            glide(g, 0, t, 0.004);
            touch(t + Math.min(0.01, d * 0.4), P * 0.6);
          } else {
            glide(g, floor, t, PEN_DECAY);
          }
          if (pr.tall && d >= 0.014) { touch(t + d * 0.15, P * 0.45); }
          if ((pr.cross || pr.two) && d >= 0.014) { touch(t + d * 0.6, P * 0.55); }
          /* Letter colour: formants slide from letter to letter (coarticulation), never jump */
          var ftc = Math.max(0.006, d * cfg.form);
          steer(w.f1.frequency, pr.f1 * decl, t, ftc);
          steer(w.f2.frequency, pr.f2 * decl, t, ftc);
          var hz = penHz(sc) * decl * (pr.hiss ? 1.12 : 1);
          steer(w.pen.frequency, hz, t, Math.max(0.01, d * cfg.legato));
          if (pr.cross && d >= 0.014) {
            glide(w.pen.frequency, hz * 1.25, t + d * 0.6, 0.006);
            glide(w.pen.frequency, hz, t + d * 0.9, 0.02);
          }
          var end = !info.next || graphemeKind(info.next) !== 'char';
          if (sc === 'ar') {
            for (i = 0; i < pr.dots; i += 1) { E.pending.push(1); }
            for (i = 0; i < pr.marks; i += 1) { E.pending.push(0.55); }
            if (E.pending.length > 6) { E.pending.length = 6; }
            if (end) {
              glide(w.pen.frequency, hz * (pr.tail ? cfg.tail : 0.93), t + d * 0.3, 0.05);
              if (pr.tail) { touch(t + d * 0.25, P * 0.4); }
              flushMarks(t + d * 0.85);
            }
          } else if (pr.dots) {
            tapAt(t + d * 0.7, cfg.tapAmt * 0.8, cfg.tap * 1.1);
          }
          if (end) { glide(g, 0, t + d * 0.7, 0.025); }
          E.inWord = !end;
          E.wordPos += 1;
        }
        glide(g, 0, t + d + WATCHDOG_S, 0.05);
      }),
      stopWriting: withCtx(function () {
        var t = E.ctx.currentTime, cfg = SCRIPTS[E.script || 'en'];
        if (E.pending.length && live()) { flushMarks(t); }
        E.inWord = false;
        release(E.n.w, t, cfg.release);
      }),

      /* Drawing: starts with the first traced frame, follows the path's bends, ends with the last frame */
      startDrawing: guarded(function (info) {
        info = info || {};
        var n = E.n, t = E.ctx.currentTime, g = n.d.env.gain;
        wantRun(true);
        E.bend = 0;
        release(n.w, t, 0.015);
        if (typeof info.x === 'number' && isFinite(info.x)) { panTo(info.x, t, 0.08); }
        hold(g, t);
        glide(g, DRAW_LEVEL * 0.8, t, 0.015);
        steer(n.d.bp.frequency, E.dBase, t, 0.03);
        glide(g, 0, t + WATCHDOG_S, 0.05);
      }),
      updateDrawing: guarded(function (info) {
        info = info || {};
        var n = E.n, t = E.ctx.currentTime, g = n.d.env.gain, p = info.p || 0;
        wantRun(true);
        E.bend = E.bend * 0.6 + (info.bend || 0) * 0.4;
        if (typeof info.x === 'number' && isFinite(info.x)) { panTo(info.x, t, 0.06); }
        hold(g, t);
        glide(g, DRAW_LEVEL * (0.72 + 0.28 * Math.sin(Math.PI * p)) * (0.9 + 0.25 * E.bend), t, 0.05);
        steer(n.d.bp.frequency, E.dBase * (0.85 + 0.45 * E.bend), t, 0.06);
        glide(g, 0, t + WATCHDOG_S, 0.05);
      }),
      stopDrawing: withCtx(function () { release(E.n.d, E.ctx.currentTime, 0.02); }),
      /* A shape that appears at once (no tracing) gets one short soft dab */
      drawCue: guarded(function () {
        var n = E.n, t = E.ctx.currentTime, g = n.d.env.gain;
        wantRun(true);
        release(n.w, t, 0.012);
        hold(g, t);
        glide(g, DRAW_LEVEL * 0.55, t, 0.008);
        glide(g, 0, t + 0.04, 0.03);
      }),
      /* Step mode: one short sound for the item that was just completed */
      cue: guarded(function (kind, sc) {
        if (kind !== 'write' && kind !== 'draw') { return; }
        var n = E.n, t = E.ctx.currentTime, v = kind === 'draw' ? n.d : n.w, g = v.env.gain;
        var lvl = kind === 'draw' ? DRAW_LEVEL : WRITE_LEVEL;
        wantRun(true);
        allVoices(function (x) { release(x, t, 0.005); });
        if (kind === 'write') { applyScript(sc === 'ar' ? 'ar' : 'en', t); }
        hold(g, t);
        glide(g, lvl * 0.7, t, 0.01);
        glide(g, 0, t + 0.09, 0.03);
        wantRun(false, 500);
      }),

      /* Settings */
      setPan: guarded(function (x01) {
        if (typeof x01 === 'number' && isFinite(x01)) { panTo(x01, E.ctx.currentTime, 0.05); }
      }),
      setSpeed: function (sp) {
        E.speed = sp > 0 ? sp : 1;
        E.rate = Math.min(1.5, Math.max(0.85, 0.85 + 0.15 * E.speed));
        E.bright = 0.9 + 0.1 * Math.sqrt(E.speed);
        E.dBase = D_FREQ * (0.9 + 0.1 * Math.sqrt(E.speed));
        E.tapGap = Math.max(0.045, 0.07 / Math.sqrt(E.speed));
        if (!E.ctx || !E.n) { return; }
        try {
          var t = E.ctx.currentTime, cfg = SCRIPTS[E.script || 'en'];
          steer(E.n.w.src.playbackRate, E.rate, t, 0.2);
          steer(E.n.d.src.playbackRate, E.rate, t, 0.2);
          steer(E.n.w.damp.frequency, cfg.damp * E.bright, t, 0.1);
          applyVoice();
        } catch (err) { reportSoft(err); }
      },
      /* Speech ducking: pen stays audible (tactile cue), birds step back */
      duck: withCtx(function (on) {
        var t = E.ctx.currentTime;
        steer(E.n.duckBirds.gain, on ? DUCK_BIRDS : 1, t, on ? 0.08 : 0.4);
        steer(E.n.duckPen.gain, on ? DUCK_PEN : 1, t, on ? 0.08 : 0.4);
      }),
      birdEvent: guarded(function (type, ms) { garden(type, ms); }),
      ambience: function (m) {
        try { setMood(m, m === 'duck' ? 0.6 : (m === 'open' ? 0.25 : 0.1)); } catch (err) { reportSoft(err); }
      },
      setBirds: function (v) {
        E.birds = Math.min(1, Math.max(0, +v || 0));
        try { setMood(E.mood, 0.15, true); } catch (err) { reportSoft(err); }
      },
      setVoice: function (v) {
        E.voice = Math.min(1, Math.max(0, +v || 0));
        try { applyVoice(); } catch (err) { reportSoft(err); }
      },
      setVolume: function (v) {
        E.volume = Math.min(1, Math.max(0, +v || 0));
        if (!E.ctx || !E.n) { return; }
        try { steer(E.n.master.gain, masterLevel(), E.ctx.currentTime, 0.03); } catch (err) { reportSoft(err); }
      },
      setEnabled: function (on) {
        E.enabled = !!on;
        if (E.ctx && E.n) {
          try {
            var t = E.ctx.currentTime;
            steer(E.n.master.gain, masterLevel(), t, 0.02);
            if (!E.enabled) { allVoices(function (v) { release(v, t, 0.01); }); setMood('off', 0.05); wantRun(false, 150); }
          } catch (err) { reportSoft(err); }
        }
        notify();
      },
      setHidden: function (h) {
        E.hidden = !!h;
        if (E.ctx && E.n) {
          try {
            var t = E.ctx.currentTime;
            steer(E.n.master.gain, masterLevel(), t, 0.02);
            if (E.hidden) { allVoices(function (v) { release(v, t, 0.01); }); setMood('off', 0.05); wantRun(false, 200); }
          } catch (err) { reportSoft(err); }
        }
        notify();
      },
      /* Optional hybrid: a recorded pen loop replaces the procedural writing source only */
      useRecording: function (data, done) {
        done = done || function () {};
        if (!E.ctx || !E.n) { done(false); return; }
        var ok = function (buf) {
          try {
            var n = E.n;
            if (!n || !E.ctx || !buf) { done(false); return; }
            var s = E.ctx.createBufferSource(), old = n.w.src;
            s.buffer = buf; s.loop = true; s.playbackRate.value = E.rate;
            s.connect(n.w.hp); s.start();
            n.w.src = s;
            try { old.stop(); } catch (e) { /* already stopped */ }
            old.disconnect();
            E.recorded = true;
            notify();
            done(true);
          } catch (err) { reportSoft(err); done(false); }
        };
        var bad = function (err) { if (err) { reportSoft(err); } done(false); };
        try {
          var p = E.ctx.decodeAudioData(data, ok, bad);
          if (p && typeof p.catch === 'function') { p.catch(function () { /* handled by bad() */ }); }
        } catch (err) { bad(err); }
      },
      describe: function () {
        if (!AC) { return 'unavailable (visual only)'; }
        if (E.status === 'error') { return 'error (visual only)'; }
        if (!E.enabled) { return 'off'; }
        if (!E.ctx) { return 'starts on Play'; }
        if (E.hidden) { return 'muted (tab hidden)'; }
        if (E.ctx.state === 'running') { return 'on' + (E.recorded ? ' (pen sample)' : ''); }
        if (E.want) { return 'waiting for browser'; }
        return 'idle';
      }
    };
  }());

  /* ---------- graphemes & timing helpers ---------- */

  function hasInk(s) { return !!s && s.replace(/\s+/g, '') !== ''; }
  function graphemeKind(ch) {
    if (ch === ' ' || ch === '\u00A0') { return 'space'; }
    if (PUNCT.indexOf(ch) !== -1) { return 'punct'; }
    if (/^\s+$/.test(ch)) { return 'blank'; }
    return 'char';
  }

  /* ---------- text units & classification helpers ---------- */

  function collectTextUnits(root) {
    var units = [], texts = root.getElementsByTagName('text');
    for (var i = 0; i < texts.length; i += 1) {
      var t = texts[i], kids = [], child = t.firstChild, hasEl = false;
      if (t.closest && t.closest('[data-lab]')) { continue; }
      while (child) {
        if (child.nodeType === 1 && child.localName === 'tspan') { hasEl = true; }
        child = child.nextSibling;
      }
      if (!hasEl) {
        if (hasInk(t.textContent)) { kids.push({ node: t, original: t.textContent }); }
      } else {
        var spans = t.getElementsByTagName('tspan');
        for (var j = 0; j < spans.length; j += 1) {
          var sp = spans[j];
          if (sp.parentNode && sp.parentNode.localName === 'tspan') { continue; }
          if (sp.getElementsByTagName('tspan').length > 0) {
            var part = sp.firstChild;
            while (part) {
              if (part.nodeType === 3) {
                if (hasInk(part.nodeValue)) { kids.push({ node: part, original: part.nodeValue, isTextNode: true }); }
              } else if (part.nodeType === 1 && part.localName === 'tspan') {
                if (hasInk(part.textContent)) { kids.push({ node: part, original: part.textContent }); }
              }
              part = part.nextSibling;
            }
            continue;
          }
          if (hasInk(sp.textContent)) { kids.push({ node: sp, original: sp.textContent }); }
        }
        var lead = t.firstChild;
        if (lead && lead.nodeType === 3 && hasInk(lead.nodeValue)) {
          kids.unshift({ node: lead, original: lead.nodeValue, isTextNode: true });
        }
      }
      if (kids.length > 0) { units.push({ text: t, lines: kids }); }
    }
    return units;
  }
  /* ===== Classification helpers (verbatim) ===== */
  function safeBBox(node) {
    try {
      if (typeof node.getBBox !== 'function') { return null; }
      var b = node.getBBox();
      if (!b || !isFinite(b.x) || !isFinite(b.y) || !isFinite(b.width) || !isFinite(b.height)) { return null; }
      return { x: b.x, y: b.y, width: b.width, height: b.height };
    } catch (err) { return null; }
  }
  function isInsideDefs(node) {
    var p = node.parentNode;
    while (p && p.nodeType === 1) { if (p.localName === 'defs') { return true; } p = p.parentNode; }
    return false;
  }
  function numericAttr(node, name) {
    var raw = node.getAttribute(name);
    if (raw === null || raw === '') { return null; }
    var n = parseFloat(raw);
    return isNaN(n) ? null : n;
  }
  function effectiveOpacity(node) {
    var o = numericAttr(node, 'opacity'), fo = numericAttr(node, 'fill-opacity'),
        so = numericAttr(node, 'stroke-opacity'), lowest = 1;
    if (o !== null && o < lowest) { lowest = o; }
    if (fo !== null && so !== null) { var m = Math.max(fo, so); if (m < lowest) { lowest = m; } }
    return lowest;
  }
  function hasVisibleFill(node) {
    var f = node.getAttribute('fill');
    if (f === null) { return node.localName !== 'line' && node.localName !== 'polyline'; }
    var l = f.trim().toLowerCase();
    return l !== 'none' && l !== 'transparent';
  }
  function hasStroke(node) {
    var s = node.getAttribute('stroke');
    if (s === null) { return false; }
    var l = s.trim().toLowerCase();
    return l !== 'none' && l !== 'transparent';
  }
  function isBackground(box, view) {
    if (box.width * box.height / (view.width * view.height) > LARGE_AREA_RATIO) { return true; }
    var minDim = Math.min(view.width, view.height);
    var thin = Math.min(box.width, box.height) <= minDim * THIN_SIZE_RATIO;
    return thin && Math.max(box.width, box.height) >= view.width * LONG_THIN_RATIO;
  }
  function isAnimatableShape(node, view) {
    if (!SHAPE_TAGS[node.localName] || isInsideDefs(node)) { return false; }
    if (effectiveOpacity(node) < FAINT_OPACITY) { return false; }
    var box = safeBBox(node);
    if (!box || (box.width <= 0 && box.height <= 0)) { return false; }
    if (view.width * view.height <= 0 || isBackground(box, view)) { return false; }
    if (!hasStroke(node) && !hasVisibleFill(node)) { return false; }
    return true;
  }
  function nearestUnitFor(box, unitBoxes, view) {
    var best = -1, bestScore = Infinity, limit = view.height * LINK_DISTANCE_RATIO;
    var cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    for (var i = 0; i < unitBoxes.length; i += 1) {
      var ub = unitBoxes[i];
      if (!ub) { continue; }
      var contains = box.x >= ub.x - 2 && box.y >= ub.y - 2 &&
        box.x + box.width <= ub.x + ub.width + 2 && box.y + box.height <= ub.y + ub.height + 2;
      var dy = Math.abs(cy - (ub.y + ub.height / 2));
      var dx = Math.abs(cx - (ub.x + ub.width / 2));
      var score = contains ? 0 : dy + dx * 0.25;
      if (!contains && dy > limit) { continue; }
      if (score < bestScore) { bestScore = score; best = i; }
    }
    return best;
  }
  function readView(root) {
    var view = { x: 0, y: 0, width: 1080, height: 1350 }, vb = root.getAttribute('viewBox');
    if (vb) {
      var n = vb.split(/[\s,]+/).map(parseFloat);
      if (n.length === 4 && n[2] > 0 && n[3] > 0) {
        view = { x: n[0] || 0, y: n[1] || 0, width: n[2], height: n[3] };
      }
    }
    return view;
  }

  function hasComputedStroke(n) {
    try {
      var cs = window.getComputedStyle(n);
      return !!cs.stroke && cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0;
    } catch (err) { return hasStroke(n); }
  }
  function computedVisible(n) {
    if (hasComputedStroke(n)) { return true; }
    if (n.localName === 'line') { return false; }
    try { var f = window.getComputedStyle(n).fill; return !!f && f !== 'none'; }
    catch (err) { return hasVisibleFill(n); }
  }
  function union(a, b) {
    if (!a) { return b; }
    var x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
    return { x: x, y: y, width: Math.max(a.x + a.width, b.x + b.width) - x,
             height: Math.max(a.y + a.height, b.y + b.height) - y };
  }
  function center(b) { return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }

  /* ---------- rootBox family ---------- */

  function mul(A, B) {
    return [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1],
            A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
            A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
  }
  /* Reads transform.baseVal without consolidate(), so the DOM attribute is untouched */
  function localMatrix(n) {
    var list = n.transform && n.transform.baseVal, m = ID;
    if (!list) { return m; }
    for (var i = 0; i < list.numberOfItems; i += 1) {
      var t = list.getItem(i).matrix;
      m = mul(m, [t.a, t.b, t.c, t.d, t.e, t.f]);
    }
    return m;
  }
  var ctmCache = new Map();
  function ctmToRoot(n, root) {
    if (!n || n === root || n.nodeType !== 1) { return ID; }
    if (ctmCache.has(n)) { return ctmCache.get(n); }
    var m = mul(ctmToRoot(n.parentNode, root), localMatrix(n));
    ctmCache.set(n, m);
    return m;
  }
  function rootBox(n, root) {
    var b = safeBBox(n);
    if (!b) { return null; }
    var m = ctmToRoot(n, root), xs = [], ys = [];
    var pts = [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]];
    for (var i = 0; i < 4; i += 1) {
      xs.push(m[0] * pts[i][0] + m[2] * pts[i][1] + m[4]);
      ys.push(m[1] * pts[i][0] + m[3] * pts[i][1] + m[5]);
    }
    var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
    return { x: x0, y: y0, width: Math.max.apply(null, xs) - x0, height: Math.max.apply(null, ys) - y0 };
  }

  /* ---------- collectDrawings ---------- */

  function collectDrawings(root) {
    var out = [];
    (function walk(node) {
      for (var c = node.firstElementChild; c; c = c.nextElementSibling) {
        var tag = c.localName;
        if (SKIP_SUBTREE[tag] || c.hasAttribute('data-lab') || tag === 'text') { continue; }
        if (tag === 'g' || tag === 'svg') {
          if (c.getElementsByTagName('text').length) { walk(c); continue; }
          var shapes = [], all = c.getElementsByTagName('*');
          for (var i = 0; i < all.length; i += 1) {
            if (SHAPE_TAGS[all[i].localName] && !isInsideDefs(all[i])) { shapes.push(all[i]); }
          }
          if (shapes.length) { out.push({ top: c, shapes: shapes }); }
        } else if (SHAPE_TAGS[tag]) {
          out.push({ top: c, shapes: [c] });
        }
      }
    }(root));
    return out;
  }

  /* ---------- constants for buildProposed ---------- */

  var PUNCT_ONLY = PUNCT + '\u00AB\u00BB()[]"\'-\u2013\u2014';
  function punctOnly(u) {
    return u.lines.every(function (ln) {
      var cl = splitGraphemes(ln.original.replace(/\s+/g, ''));
      return cl.length > 0 && cl.every(function (ch) { return PUNCT_ONLY.indexOf(ch) !== -1; });
    });
  }
  var PAGE_BG_RATIO = 0.6;
  var MARK_SIZE = 2.5;
  var MARK_GAP = 3;
  var CLOSED_TAGS = { rect: 1, circle: 1, ellipse: 1, polygon: 1 };
  var RULING_MIN = 3;
  var FRAME_COVER = 0.9;
  function isRuling(box, view) {
    var minDim = Math.min(view.width, view.height);
    var thin = Math.min(box.width, box.height) <= minDim * THIN_SIZE_RATIO;
    return thin && Math.max(box.width, box.height) >= view.width * LONG_THIN_RATIO;
  }
  function isPageBackground(box, view, rulingStatic) {
    if (box.width * box.height / (view.width * view.height) > PAGE_BG_RATIO) { return true; }
    return rulingStatic !== false && isRuling(box, view);
  }
  function isClosedShape(s) {
    if (CLOSED_TAGS[s.localName]) { return true; }
    return s.localName === 'path' && /[zZ]/.test(s.getAttribute('d') || '');
  }
  function coverRatio(outer, inner) {
    var w = Math.min(outer.x + outer.width, inner.x + inner.width) - Math.max(outer.x, inner.x);
    var h = Math.min(outer.y + outer.height, inner.y + inner.height) - Math.max(outer.y, inner.y);
    var a = inner.width * inner.height;
    return (w > 0 && h > 0 && a > 0) ? (w * h) / a : 0;
  }

  /* ---------- buildProposed ---------- */

  function buildProposed(root, raw, lineLevel) {
    var view = readView(root), units = collectTextUnits(root), unitBoxes = [], i;
    for (i = 0; i < units.length; i += 1) {
      unitBoxes.push(rootBox(units[i].text, root));
      units[i].lineBoxes = units[i].lines.map(function (ln) {
        return rootBox(ln.isTextNode ? ln.node.parentNode : ln.node, root);
      });
    }
    var po = units.map(punctOnly);
    for (i = 0; i < units.length; i += 1) {
      units[i].host = -1;
      if (!po[i] || !unitBoxes[i]) { continue; }
      var pc = center(unitBoxes[i]), bd = Infinity;
      for (var h = 0; h < units.length; h += 1) {
        var hb = unitBoxes[h];
        if (h === i || po[h] || !hb) { continue; }
        var ex = Math.max(hb.x - pc.x, 0, pc.x - hb.x - hb.width);
        var ey = Math.max(hb.y - pc.y, 0, pc.y - hb.y - hb.height);
        if (ex * ex + ey * ey < bd) { bd = ex * ex + ey * ey; units[i].host = h; }
      }
    }
    var drawings = [], loose = [], mixed = 0, faintLone = 0, faintNodes = [], faintJoined = 0, marks = 0;
    var rulingCount = 0, rulingJoined = 0;
    raw.forEach(function (d) {
      d.shapes.forEach(function (s) { var rb = rootBox(s, root); if (rb && isRuling(rb, view)) { rulingCount += 1; } });
    });
    var rulingStatic = rulingCount >= RULING_MIN;
    raw.forEach(function (d) {
      /* A lone shape keeps the original faint rule, so background curves stay static (constraint 5) */
      var single = (d.shapes.length === 1 && d.top === d.shapes[0]);
      var members = [], statics = 0, box = null;
      d.shapes.forEach(function (s) {
        var b = rootBox(s, root);
        var isStatic = !b || (b.width <= 0 && b.height <= 0) || isPageBackground(b, view, rulingStatic) ||
                       !computedVisible(s) || (single && effectiveOpacity(s) < FAINT_OPACITY && !CLOSED_TAGS[s.localName]);
        if (isStatic) {
          statics += 1;
          if (single && b && !isPageBackground(b, view, rulingStatic) && computedVisible(s)) {
            faintLone += 1;
            if (/^(rect|circle|ellipse)$/.test(s.localName)) { faintNodes.push({ n: s, b: b }); }
          }
          return;
        }
        members.push(s);
        box = union(box, b);
      });
      if (!members.length) { return; }
      if (statics) { mixed += 1; }
      var dr = { top: d.top, nodes: members, box: box, unit: -1, rel: 'after', lineIdx: -1,
                 ruling: single && isRuling(box, view) };
      var closedBoxes = members.filter(isClosedShape).map(function (s) { return rootBox(s, root); }).filter(Boolean);
      var c = center(box), k;
      /* Frame: the drawing contains a text's center, so it is drawn before that text */
      for (k = 0; k < unitBoxes.length; k += 1) {
        var ub = unitBoxes[k];
        if (!ub) { continue; }
        var uc = center(ub);
        if (uc.x >= box.x && uc.x <= box.x + box.width && uc.y >= box.y && uc.y <= box.y + box.height &&
            closedBoxes.some(function (cb) { return coverRatio(cb, ub) >= FRAME_COVER; })) {
          dr.unit = k; dr.rel = 'before'; break;
        }
      }
      /* Marker: a small drawing beside a line (bullet, dot, icon) is drawn just before that line */
      if (dr.unit === -1) {
        var gapBest = Infinity;
        for (k = 0; k < units.length; k += 1) {
          if (units[k].host >= 0) { continue; }
          units[k].lineBoxes.forEach(function (lb, j) {
            if (!lb || !(lb.height > 0)) { return; }
            var hgt = lb.height;
            if (box.width > hgt * MARK_SIZE || box.height > hgt * MARK_SIZE) { return; }
            if (c.y < lb.y - hgt * 0.3 || c.y > lb.y + hgt * 1.3) { return; }
            var gap = Math.max(lb.x - (box.x + box.width), 0, box.x - (lb.x + lb.width));
            if (gap > hgt * MARK_GAP || gap >= gapBest) { return; }
            gapBest = gap; dr.unit = k; dr.rel = 'mark'; dr.lineIdx = j;
          });
        }
        if (dr.rel === 'mark') { marks += 1; }
      }
      /* Otherwise: nearest text above it (reading order), no distance limit */
      if (dr.unit === -1) {
        var best = -1, bestScore = Infinity, anyBest = -1, anyScore = Infinity, lastAbove = -1;
        for (k = 0; k < unitBoxes.length; k += 1) {
          var u = unitBoxes[k];
          if (!u) { continue; }
          var ucc = center(u), dx = Math.abs(c.x - ucc.x) * 0.25, dy = c.y - ucc.y;
          if (Math.abs(dy) + dx < anyScore) { anyScore = Math.abs(dy) + dx; anyBest = k; }
          if (u.y < c.y && Math.abs(dy) + dx < bestScore) { bestScore = Math.abs(dy) + dx; best = k; }
          if (units[k].host === -1 && ucc.y < c.y && u.x < box.x + box.width && u.x + u.width > box.x) { lastAbove = k; }
        }
        if (lastAbove !== -1) { dr.unit = lastAbove; dr.rel = 'after'; }
        else if (best !== -1) { dr.unit = best; dr.rel = 'after'; }
        else if (anyBest !== -1) { dr.unit = anyBest; dr.rel = 'before'; }
      }
      if (dr.unit === -1) { loose.push(dr); return; }
      if (lineLevel && dr.rel === 'after') {
        var lbs = units[dr.unit].lineBoxes, pick = lbs.length - 1, low = -Infinity;
        for (k = 0; k < lbs.length; k += 1) {
          if (lbs[k] && center(lbs[k]).y < c.y && lbs[k].y + lbs[k].height > low) {
            low = lbs[k].y + lbs[k].height; pick = k;
          }
        }
        dr.lineIdx = pick;
      }
      drawings.push(dr);
    });
    for (i = drawings.length - 1; i >= 0; i -= 1) {
      var rl = drawings[i], tgt = null, td = Infinity;
      if (!rl.ruling) { continue; }
      drawings.forEach(function (o) {
        if (o === rl || o.ruling) { return; }
        if (o.box.x > rl.box.x + rl.box.width || o.box.x + o.box.width < rl.box.x) { return; }
        var gy = Math.max(o.box.y - (rl.box.y + rl.box.height), 0, rl.box.y - (o.box.y + o.box.height));
        if (gy <= view.height * 0.03 && gy < td) { td = gy; tgt = o; }
      });
      if (tgt) { tgt.nodes = tgt.nodes.concat(rl.nodes); tgt.box = union(tgt.box, rl.box); drawings.splice(i, 1); rulingJoined += 1; }
    }
    faintNodes.forEach(function (f) {
      var host = null, rank = Infinity;
      drawings.forEach(function (dr) {
        var dc = center(dr.box);
        if (dc.x < f.b.x || dc.x > f.b.x + f.b.width || dc.y < f.b.y || dc.y > f.b.y + f.b.height) { return; }
        var r = dr.unit * 2 + (dr.rel === 'before' ? 0 : 1);
        if (r < rank) { rank = r; host = dr; }
      });
      if (host) { host.nodes.unshift(f.n); faintLone -= 1; faintJoined += 1; }
    });
    loose.sort(function (a, b) { return a.box.y - b.box.y; });
    return { view: view, units: units, unitBoxes: unitBoxes, drawings: drawings, loose: loose, mixed: mixed, faintLone: faintLone, faintJoined: faintJoined, marks: marks,
             rulingCount: rulingCount, rulingStatic: rulingStatic, rulingJoined: rulingJoined };
  }

  /* ---------- labels & insideBox ---------- */

  function lineLabel(i, ln) { return 'T' + (i + 1) + ' line: ' + ln.original.trim().slice(0, 32); }
  function drawLabel(d) { return 'draw <' + d.top.localName + '> (' + d.nodes.length + ' shapes)'; }
  function insideBox(pt, b) { return pt.x >= b.x && pt.x <= b.x + b.width && pt.y >= b.y && pt.y <= b.y + b.height; }

  /* ---------- ordering (playOrder / enforceReadingOrder / queueProposed) ---------- */

  function playOrder(q) {
    var i, k, n, m, f;
    function area(b) { return b.width * b.height; }
    for (i = 1; i < q.length; i += 1) {
      var it = q[i];
      if (it.type !== 'draw') { continue; }
      for (k = i + 1; k < q.length && q[k].type === 'draw'; k += 1) { }
      var nx = q[k];
      if (!nx || nx.type !== 'line' || !(nx.j > 0)) { continue; }
      for (f = i - 1; f >= 0 && q[f].type !== 'line'; f -= 1) { }
      if (f < 0 || q[f].u !== nx.u) { continue; }
      while (f > 0 && !(q[f].type === 'line' && q[f].u === nx.u && q[f].j === 0)) { f -= 1; }
      if (q[f].u !== nx.u || q[f].j !== 0) { continue; }
      q.splice(i, 1); q.splice(f, 0, it);
    }
    function hasT(b) { return q.some(function (x) { return x.type === 'line' && x.box && insideBox(center(x.box), b); }); }
    for (i = 0; i < q.length; i += 1) { /* frame over 2+ text units: a picture (art >= 1/4 of it) draws all its art first, a card only thin parts and text frames */
      if (q[i].type !== 'draw' || q[i].rel !== 'before' || (i && q[i - 1].type === 'draw')) { continue; }
      var fr = null, us = {}, nu = 0;
      for (k = i; k < q.length && q[k].type === 'draw'; k += 1) { if (q[k].box && (!fr || area(q[k].box) > area(fr))) { fr = q[k].box; } }
      for (n = k; fr && n < q.length && (q[n].type !== 'line' || (q[n].box && insideBox(center(q[n].box), fr))); n += 1) {
        if (q[n].type === 'line' && !us[q[n].u]) { us[q[n].u] = 1; nu += 1; }
      }
      var ar = 0, pic;
      for (m = k; nu > 1 && m < n; m += 1) { var c = q[m].box; if (q[m].type === 'draw' && c && insideBox(center(c), fr) && !hasT(c)) { ar += area(c); } }
      pic = ar >= 0.25 * area(fr);
      for (m = k; nu > 1 && m < n; m += 1) {
        var b = q[m].box;
        if (q[m].type !== 'draw' || !b || !insideBox(center(b), fr)) { continue; }
        if (pic || hasT(b) || Math.min(b.width, b.height) <= 10) { q.splice(k, 0, q.splice(m, 1)[0]); k += 1; } else { q[m].card = 1; }
      }
      i = k - 1;
    }
    /* each drawing goes after the last text unit that starts above its bottom (before-drawings only earlier) */
    var L = q.filter(function (x) { return x.type === 'line'; }), mv = [], prev = -1, cnt = {};
    var F = L.length && L.every(function (x) { return x.box; }) ? q.filter(function (d) {
      return d.type === 'draw' && d.box && L.some(function (x) { return insideBox(center(x.box), d.box); });
    }) : null;
    for (i = 0; F && i < q.length; i += 1) {
      var d = q[i];
      if (d.type === 'line') { prev = L.indexOf(d); continue; }
      if (d.type !== 'draw' || !d.box || d.rel === 'mark' || F.indexOf(d) >= 0 ||
          (!d.card && F.some(function (x) { return insideBox(center(d.box), x.box); }))) { continue; }
      var a = -1, bt = d.box.y + d.box.height;
      L.forEach(function (x, j) { if (x.box.y < bt) { a = j; } });
      while (a >= 0 && a + 1 < L.length && L[a + 1].u === L[a].u) { a += 1; }
      if (a === prev || (d.rel === 'before' && a > prev)) { continue; }
      mv.push([d, a]); q.splice(i, 1); i -= 1;
    }
    mv.forEach(function (p) {
      var c = cnt[p[1]] || 0; cnt[p[1]] = c + 1;
      q.splice(p[1] < 0 ? q.indexOf(L[0]) : q.indexOf(L[p[1]]) + 1 + c, 0, p[0]);
    });
    function holds(o, e) { return e.x >= o.x - 1 && e.y >= o.y - 1 && e.x + e.width <= o.x + o.width + 1 && e.y + e.height <= o.y + o.height + 1; }
    for (i = 0; i < q.length; i += 1) { /* in a run of drawings, a container comes before what it holds */
      if (q[i].type !== 'draw') { continue; }
      for (k = i; k < q.length && q[k].type === 'draw'; k += 1) { }
      for (n = i + 1; n < k; n += 1) {
        var o = q[n].box;
        for (m = i; o && m < n; m += 1) { var e = q[m].box; if (e && area(e) < area(o) && holds(o, e)) { q.splice(m, 0, q.splice(n, 1)[0]); break; } }
      }
      i = k - 1;
    }
    for (i = 0; i < q.length; i += 1) {
      if (q[i].type !== 'draw' || (i && q[i - 1].type === 'draw')) { continue; }
      for (k = i; k < q.length && q[k].type === 'draw'; k += 1) { }
      var big = null;
      for (n = i; n < k; n += 1) { if (q[n].box && (!big || area(q[n].box) > area(big))) { big = q[n].box; } }
      for (n = 0; big && n < i; n += 1) {
        var d = q[n], b = d.box;
        if (d.type !== 'draw' || d.rel !== 'after' || !b || area(b) >= area(big) || !insideBox(center(b), big)) { continue; }
        q.splice(n, 1); n -= 1; i -= 1; k -= 1;
        var at = k;
        for (m = i; m < k; m += 1) {
          var c = q[m].box;
          if (c && Math.round(c.width) === Math.round(b.width) && Math.round(c.height) === Math.round(b.height)) { at = m + 1; }
        }
        q.splice(at, 0, d); k += 1;
      }
      for (n = i; n < k - 1; n += 1) { q[n].run = Math.min(BASE_SHAPE_MS * 0.8, RUN_MAX_MS / (k - i)); }
      i = k - 1;
    }
    return q;
  }

  function enforceReadingOrder(q) {
    var moved = 0, blocked = 0, guard = 0, again = true;
    function lineAt(u, j) {
      for (var n = 0; n < q.length; n += 1) {
        if (q[n].type === 'line' && q[n].u === u && q[n].j === j) { return n; }
      }
      return -1;
    }
    while (again && guard < 2000) {
      again = false; guard += 1;
      for (var i = 0; i < q.length && !again; i += 1) {
        var it = q[i];
        if (it.type !== 'draw' || !it.box || it.blocked) { continue; }
        var last = -1;
        for (var k = i + 1; k < q.length; k += 1) {
          var L = q[k];
          if (L.type === 'line' && L.box && L.box.y + L.box.height / 2 <= it.box.y &&
              L.box.x < it.box.x + it.box.width && L.box.x + L.box.width > it.box.x) { last = k; }
          if (L.type === 'draw' && L.rel === 'before' && L.box && L !== it &&
              L.box.width * L.box.height > it.box.width * it.box.height && insideBox(center(it.box), L.box)) { last = k; }
        }
        if (last === -1) { continue; }
        if (it.rel === 'before' || it.rel === 'mark') {
          var a = lineAt(it.au, it.aj);
          if (a !== -1 && a <= last) { it.blocked = true; blocked += 1; continue; }
        }
        var target = q[last];
        q.splice(i, 1);
        var pos = q.indexOf(target) + 1;
        while (pos < q.length && q[pos].movedAfter === target) { pos += 1; }
        it.movedAfter = target;
        q.splice(pos, 0, it);
        if (it.label.indexOf('[moved') === -1) { it.label += ' [moved: reading order]'; }
        moved += 1; again = true;
      }
    }
    q.reordered = moved; q.blocked = blocked;
    return q;
  }

  function queueProposed(p, lineLevel) {
    var q = [];
    function push(d, tag) {
      q.push({ type: 'draw', nodes: d.nodes, trace: true, label: drawLabel(d) + tag, box: d.box,
               rel: d.rel, au: d.unit, aj: d.rel === 'mark' ? d.lineIdx : 0 });
    }
    function emit(u, i) {
      var mine = p.drawings.filter(function (d) { return d.unit === i; });
      mine.filter(function (d) { return d.rel === 'before'; }).forEach(function (d) { push(d, ' [frame]'); });
      u.lines.forEach(function (ln, j) {
        mine.filter(function (d) { return d.rel === 'mark' && d.lineIdx === j; })
            .forEach(function (d) { push(d, ' [marker]'); });
        q.push({ type: 'line', line: ln, label: lineLabel(i, ln), u: i, j: j, box: u.lineBoxes[j] });
        if (lineLevel) {
          mine.filter(function (d) { return d.rel === 'after' && d.lineIdx === j; })
              .forEach(function (d) { push(d, ''); });
        }
      });
      p.units.forEach(function (w, k) { if (w.host === i) { emit(w, k); } });
      mine.filter(function (d) { return d.rel === 'after' && (!lineLevel || d.lineIdx === -1); })
          .forEach(function (d) { push(d, ''); });
    }
    p.units.forEach(function (u, i) {
      if (u.host >= 0) { return; }
      emit(u, i);
      q.push({ type: 'block', label: '-- end T' + (i + 1) });
    });
    p.loose.forEach(function (d) { push(d, ' [loose]'); });
    enforceReadingOrder(q);
    return q;
  }

  /* ---------- penTo / penRestore (Sound bridge) ---------- */

  /* audioAllowed: sound is off under reduced-motion, on otherwise */
  function audioAllowed() { return true; }
  /* showPenState: no-op in viewer (no status panel); kept for penTo */
  function showPenState() { }

  function penTo(penState, info) {
    var prev = state.penState;
    info = info || {};
    state.penState = penState;
    if (prev !== penState) { showPenState(); }
    if (!audioAllowed()) { return; }
    switch (penState) {
      case PEN.WRITING:
      case PEN.LIFT:
        if (prev !== PEN.WRITING && prev !== PEN.LIFT) { Sound.startWriting(); }
        Sound.ambience('duck');
        Sound.updateWriting(info);
        Sound.birdEvent(info.kind === 'char' ? 'write' : (info.kind === 'punct' ? 'tap' : 'lift'), info.ms);
        break;
      case PEN.DRAWING:
        Sound.ambience('duck');
        if (info.start) { Sound.startDrawing(info); Sound.birdEvent('draw'); } else { Sound.updateDrawing(info); }
        break;
      case PEN.TRANSITION:
        if (prev === PEN.WRITING || prev === PEN.LIFT) { Sound.stopWriting(); }
        if (prev === PEN.DRAWING) { Sound.stopDrawing(); }
        if (info.dab) { Sound.drawCue(); }
        if (info.block) { Sound.ambience('open'); Sound.birdEvent('block'); }
        else if (prev === PEN.WRITING || prev === PEN.LIFT) { Sound.birdEvent('line'); }
        break;
      case PEN.PAUSED: Sound.pause(); break;
      case PEN.FINISHED: Sound.fadeOut(); break;
      default: Sound.stop();
    }
  }
  /* Silent state change used after resume: the next real event brings the sound back */
  function penRestore(penState) {
    state.penState = penState || PEN.IDLE;
    showPenState();
  }

  /* ---------- save / restore / prepare ---------- */

  function saveRec(n) {
    return { node: n, a: TRACKED.map(function (name) { return [n.hasAttribute(name), n.getAttribute(name)]; }) };
  }
  function restoreRec(r) {
    TRACKED.forEach(function (name, i) {
      if (r.a[i][0]) { r.node.setAttribute(name, r.a[i][1]); } else { r.node.removeAttribute(name); }
    });
  }
  function setLine(ln, v) { if (ln.isTextNode) { ln.node.nodeValue = v; } else { ln.node.textContent = v; } }
  function prepare() {
    restoreAll();
    state.saved = { lines: [], draws: [] };
    state.queue.forEach(function (it) {
      if (it.type === 'line') { state.saved.lines.push(it.line); setLine(it.line, ''); }
      else if (it.type === 'draw') {
        it.recs = it.nodes.map(saveRec);
        it.recs.forEach(function (r) { r.node.setAttribute('visibility', 'hidden'); });
        state.saved.draws.push(it);
      }
    });
  }
  function restoreAll() {
    if (!state.saved) { return; }
    state.saved.lines.forEach(function (ln) { try { setLine(ln, ln.original); } catch (e) { reportSoft(e); } });
    state.saved.draws.forEach(function (it) { it.recs.forEach(restoreRec); });
    state.saved = null;
  }

  /* ===== Pen (copy of ensurePen/movePen, inline colors) ===== */

  /* ---------- queue runner ---------- */

  function next(g) {
    if (isStale(g)) { return; }
    if (state.at >= state.queue.length) { finish(); return; }
    var item = state.queue[state.at];
    state.at += 1; state.inProg = item; markLog();
    if (item.type === 'block') {
      state.inProg = null;
      penTo(PEN.TRANSITION, { ms: scaled(BASE_BLOCK_MS), block: true });
      later(g, function () { next(g); }, scaled(BASE_BLOCK_MS));
      return;
    }
    if (item.type === 'line') {
      typeLine(g, item.line, function () {
        state.inProg = null;
        later(g, function () { next(g); }, scaled(BASE_LINE_MS));
      });
      return;
    }
    hidePen();
    if (item.trace) {
      traceDraw(g, item, function () {
        state.inProg = null;
        later(g, function () { next(g); }, item.run ? 0 : scaled(DRAW_GAP_MS));
      });
      return;
    }
    item.recs.forEach(restoreRec);
    penTo(PEN.TRANSITION, { dab: true });
    state.inProg = null;
    later(g, function () { next(g); }, scaled(BASE_SHAPE_MS));
  }

  function typeLine(g, ln, done) {
    var cl = splitGraphemes(ln.original), idx = 0, buf = '';
    var target = ln.isTextNode ? ln.node.parentNode : ln.node;
    var rtl = writesRtl(target) || Script.isRtl(ln.original);
    if (!cl.length) { setLine(ln, ln.original); done(); return; }
    (function tick() {
      if (isStale(g)) { return; }
      if (idx >= cl.length) {
        movePen(target);
        penTo(PEN.TRANSITION, { ms: scaled(BASE_LINE_MS) });
        done();
        return;
      }
      buf += cl[idx];
      setLine(ln, buf);
      movePen(target);
      var w = scaled(pauseFor(cl[idx])) + jitter();
      if (w < 8) { w = 8; }
      var kind = graphemeKind(cl[idx]);
      penTo(kind === 'char' ? PEN.WRITING : PEN.LIFT, {
        kind: kind, ms: w, ch: cl[idx], rtl: rtl,
        prev: idx > 0 ? cl[idx - 1] : '',
        next: idx + 1 < cl.length ? cl[idx + 1] : ''
      });
      idx += 1;
      later(g, tick, w);
    }());
  }

  function traceDraw(g, item, done) {
    var strokes = [];
    item.recs.forEach(function (r) {
      var n = r.node, len = 0;
      if (r.a[1][0] || !hasComputedStroke(n) || typeof n.getTotalLength !== 'function') { return; }
      try { len = n.getTotalLength(); } catch (e) { len = 0; }
      if (!(len > 0)) { return; }
      n.setAttribute('stroke-dasharray', len + ' ' + len);
      n.setAttribute('stroke-dashoffset', String(len));
      n.setAttribute('fill-opacity', '0');
      n.setAttribute('visibility', 'visible');
      strokes.push({ n: n, len: len });
    });
    if (!strokes.length) {
      item.recs.forEach(restoreRec);
      penTo(PEN.TRANSITION, { dab: true });
      later(g, done, scaled(item.run || BASE_SHAPE_MS));
      return;
    }
    var N = Math.max(item.run ? 1 : 3, Math.round(scaled(item.run || BASE_SHAPE_MS * 1.6) / 33)), k = 0;
    var lead = strokes[0], lastPt = null, lastAng = null, view = readView(activeRoot);
    var leadBox = safeBBox(lead.n);
    penTo(PEN.DRAWING, { start: true, x: leadBox ? (leadBox.x + leadBox.width / 2 - view.x) / view.width : 0.5 });
    (function tick() {
      if (isStale(g)) { return; }
      k += 1;
      strokes.forEach(function (s) { s.n.setAttribute('stroke-dashoffset', String(s.len * (1 - k / N))); });
      if (k >= N) {
        item.recs.forEach(restoreRec);
        penTo(PEN.TRANSITION);
        done();
        return;
      }
      var bend = 0, px = null;
      try {
        var pt = lead.n.getPointAtLength(lead.len * k / N);
        if (lastPt && Math.abs(pt.x - lastPt.x) + Math.abs(pt.y - lastPt.y) > 0.5) {
          var ang = Math.atan2(pt.y - lastPt.y, pt.x - lastPt.x);
          if (lastAng !== null) {
            var da = Math.abs(ang - lastAng);
            if (da > Math.PI) { da = 2 * Math.PI - da; }
            bend = Math.min(1, da / 1.2);
          }
          lastAng = ang;
        }
        lastPt = pt;
        px = (pt.x - view.x) / view.width;
      } catch (e) { bend = 0; }
      penTo(PEN.DRAWING, { p: k / N, bend: bend, x: px });
      later(g, tick, 33);
    }());
  }

  function completeItem(item) {
    if (item.type === 'line') {
      setLine(item.line, item.line.original);
      movePen(item.line.isTextNode ? item.line.node.parentNode : item.line.node);
    } else if (item.type === 'draw') {
      hidePen();
      item.recs.forEach(restoreRec);
    }
  }

  function finish() {
    hidePen();
    state.running = false; state.paused = false; state.resume = null; state.inProg = null;
    penTo(PEN.FINISHED);
    setPhase('INTERACTIVE_IDLE');
    setStatus(statusLine('اكتمل العرض')); updateButtons();
  }

  /* buildPlan: used by loadPage to prepare the plan for this page */
  function buildPlan(root) {
    var raw = collectDrawings(root);
    return buildProposed(root, raw, true);
  }

  /* ---------- pen & RTL helpers (from viewer original) ---------- */

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
    var p = node.nodeType === 3 ? node.parentNode : node;
    while (p && p.nodeType === 1) {
      var d = p.getAttribute('direction');
      if (d) { return d === 'rtl'; }
      p = p.parentNode;
    }
    return hasRtlChars(node.textContent || '');
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

  function movePen(node) {
    if (!activeRoot) { return; }
    var box = safeBBox(node);
    if (!box) { return; }
    var rtl = writesRtl(node);
    var dir = rtl ? -1 : 1;
    var view = readView(activeRoot);
    try { Sound.setPan(((rtl ? box.x : box.x + box.width) - view.x) / view.width); } catch (err) { reportSoft(err); }
    if (!state.pen) { return; }
    var lineH = box.height > 0 ? box.height : view.height * 0.02;
    var want = Math.min(Math.max(lineH * PEN_LEN_PER_LINE, view.height * PEN_LEN_MIN_RATIO), view.height * PEN_LEN_MAX_RATIO);
    var tipX = (rtl ? box.x : box.x + box.width) + dir * lineH * 0.04 + (Math.random() - 0.5) * lineH * 0.03;
    var tipY = box.y + box.height * PEN_BASELINE_RATIO + (Math.random() - 0.5) * lineH * 0.03;
    var angle = dir * PEN_ANGLE_BASE + (Math.random() - 0.5) * 2 * PEN_TILT_WOBBLE;
    state.pen.setAttribute('transform', 'translate(' + tipX.toFixed(2) + ',' + tipY.toFixed(2) + ') rotate(' +
      angle.toFixed(2) + ') scale(' + (want / PEN_NOMINAL_LEN).toFixed(4) + ')');
    state.pen.setAttribute('visibility', 'visible');
  }

  /* ---------- تركيب الصفحة النشطة ---------- */

  var activeSaved = null;
  var activeRoot = null;
  var activePlan = null;

  function teardownStage() {
    try { Sound.stop(); } catch (err) { reportSoft(err); }
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
    state.penBefore = state.penState;
    penTo(PEN.PAUSED);
    setPhase('INTERACTIVE_PAUSED');
    updateButtons();
    setStatus(statusLine('موقوف مؤقتًا'));
  }

  function resumeAnimation() {
    if (!state.paused) { return; }
    state.paused = false;
    var r = state.resume;
    if (r && !isStale(r.gen)) {
      Sound.resume();
      penRestore(state.penBefore === PEN.DRAWING || state.penBefore === PEN.WRITING || state.penBefore === PEN.LIFT ?
        state.penBefore : PEN.TRANSITION);
      state.penBefore = null;
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
  /* runPlan: the only entry to the animation engine (called from startAnimation). */
  function runPlan(gen, root, plan, saved, onDone) {
    state.prop = plan;
    state.queue = playOrder(queueProposed(plan, true));
    state.at = 0;
    prepare();
    if (state.penVisible) { ensurePen(activeRoot); }
    try { Sound.unlock(); } catch (err) { reportSoft(err); }
    Sound.resume();
    if (window.console && window.console.info) {
      try { window.console.info('[lesson-viewer] sound =', Sound.describe()); } catch (err) {}
    }
    state.running = true;
    setPhase('INTERACTIVE_RUNNING');
    setStatus(statusLine('جارٍ العرض'));
    updateButtons();
    next(gen);
  }

  function startAnimation() {
    if (!activeRoot || !activePlan) { return; }
    if (state.mode !== 'interactive' || !state.mounted) { return; }
    var gen = cancelEverything();
    try { Sound.stop(); } catch (err) { reportSoft(err); }
    if (activeSaved) { restoreAll(); activeSaved = null; }
    destroyPen();
    state.inProg = null; state.at = 0;
    runPlan(gen, activeRoot, activePlan, null, function () {
      if (isStale(gen)) { return; }
      setPhase('INTERACTIVE_IDLE');
      setStatus(statusLine('اكتمل العرض'));
      updateButtons();
    });
  }

  function onPlayPause() {
    try { Sound.unlock(); } catch (err) { reportSoft(err); }
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
    /* Unlock AudioContext synchronously from the user gesture (Chrome requirement). */
    try { Sound.unlock(); } catch (err) { reportSoft(err); }
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
