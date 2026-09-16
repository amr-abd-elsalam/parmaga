/* ==========================================================================
   PARMAGA — Install Promotion UI — تنفيذ ADR-0019 (D1، D3، D4، D7، §1-§11)
   نهايات الأسطر: CRLF، مطابقة لعرف المستودع المقيس عبر git ls-files --eol
   (i/crlf w/crlf لـassets/js/lesson-viewer.js ولملفي tests/test_*.py)،
   ولا قاعدة text في .gitattributes تتدخل (فيه *.svg -text وحدها).

   حدود ملزمة: صفر Service Worker، صفر Cache API، صفر localStorage،
   صفر IndexedDB، صفر cookies، صفر طلب شبكة، صفر dependency، صفر innerHTML،
   صفر inline handler، صفر userAgent sniffing، صفر MutationObserver،
   صفر polling، وصفر قراءة أو كتابة لـdata-panel-open: عقد الشقيق العام
   في CSS وحده (ADR-0019 §11.4).

   التخزين الوحيد: راية جلسة واحدة في sessionStorage بعد dismissed،
   محصورة في هذا الملف، بقراءة وكتابة محميتين باستثناء (§3).
   مرجع الحدث في ذاكرة السكربت وحدها، ويُمسح فور استهلاكه.
   prompt() لا يُستدعى إلا من click صريح على زر الترويج.
   accepted يخفي الواجهة ولا يُعد بديلًا عن appinstalled.
   ========================================================================== */
(function () {
  'use strict';

  var ROOT_ID = 'pg-install-root';
  var TITLE_ID = 'pg-install-title';
  var LOCK_CLASS = 'pg-install-locked';
  var SESSION_KEY = 'pg-install-dismissed';
  var SESSION_VALUE = '1';
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var APP_MODES = ['standalone', 'minimal-ui', 'fullscreen'];
  var BANNER_ID = 'pg-install-banner';
  var CTA_ID = 'pg-install-cta';
  var ICON_SRC = '/assets/images/fav192.png';
  var WA_SELECTOR = '.hero a.button[href^="https://wa.me/"]';
  var DELAY_MS = 30000;

  var LABEL_REGION = 'ترويج تثبيت التطبيق';
  var LABEL_BANNER = 'Parmaga على شاشتك الرئيسية';
  var LABEL_ACTION_PROMPT = 'Install app';
  var LABEL_ACTION_IOS = 'طريقة الإضافة';
  var LABEL_CTA = 'أضف Parmaga إلى شاشتك الرئيسية';
  var LABEL_DISMISS = 'ليس الآن';
  var LABEL_TITLE = 'إضافة Parmaga إلى الشاشة الرئيسية';
  var LABEL_CLOSE = 'إغلاق';
  var STEPS = [
    'اضغط زر المشاركة في Safari.',
    'اختر “إضافة إلى الشاشة الرئيسية”.',
    'اضغط “إضافة” للتأكيد.'
  ];

  var promptEvent = null;
  var suppressed = false;
  var mode = '';
  var root = null;
  var banner = null;
  var bannerButton = null;
  var cta = null;
  var lastTrigger = null;
  var dialogNode = null;
  var panelNode = null;
  var savedScrollY = 0;
  var delayElapsed = false;
  var delayHandle = null;
  var delayRemaining = DELAY_MS;
  var delayStartedAt = 0;

  /* راية الجلسة الوحيدة: قراءة محمية */
  function readSuppressed() {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === SESSION_VALUE;
    } catch (readError) {
      return false;
    }
  }

  /* راية الجلسة الوحيدة: كتابة محمية، والمرآة في الذاكرة تكفي عند التعذر */
  function writeSuppressed() {
    suppressed = true;
    try {
      window.sessionStorage.setItem(SESSION_KEY, SESSION_VALUE);
    } catch (writeError) {
      return;
    }
  }

  /* ADR-0019 §2: minimal-ui يجعل standalone وحده غير كافٍ */
  function modeMatches(name) {
    try {
      var query = window.matchMedia('(display-mode: ' + name + ')');
      if (!query || query.media === 'not all') {
        return null;
      }
      return query.matches === true;
    } catch (mediaError) {
      return null;
    }
  }

  function isAppMode() {
    var installed = navigator.standalone === true;
    var index = 0;
    for (index = 0; index < APP_MODES.length; index += 1) {
      if (modeMatches(APP_MODES[index]) === true) {
        installed = true;
      }
    }
    if (modeMatches('browser') === true && navigator.standalone !== true) {
      installed = false;
    }
    return installed;
  }

  function watchDisplayModes() {
    var names = APP_MODES.concat(['browser']);
    var index = 0;
    var query = null;
    for (index = 0; index < names.length; index += 1) {
      try {
        query = window.matchMedia('(display-mode: ' + names[index] + ')');
        if (query && typeof query.addEventListener === 'function') {
          query.addEventListener('change', onDisplayModeChange);
        }
      } catch (watchError) {
        query = null;
      }
    }
  }

  /* ADR-0019 §4: إشارات منصة وmaxTouchPoints ووجود navigator.standalone.
     heuristic لا API، ولا تُستخدم للحكم على وصول beforeinstallprompt. */
  function isApplePlatform() {
    if (!('standalone' in navigator)) {
      return false;
    }
    var platform = typeof navigator.platform === 'string' ? navigator.platform : '';
    var touchPoints = typeof navigator.maxTouchPoints === 'number' ? navigator.maxTouchPoints : 0;
    if (platform === 'iPhone' || platform === 'iPad' || platform === 'iPod') {
      return true;
    }
    if (platform === 'MacIntel' && touchPoints > 1) {
      return true;
    }
    return false;
  }

  /* ADR-0019 D4: غياب HTMLDialogElement أو showModal يعني الصمت التام */
  function dialogSupported() {
    if (typeof window.HTMLDialogElement !== 'function') {
      return false;
    }
    var proto = window.HTMLDialogElement.prototype;
    return !!proto && typeof proto.showModal === 'function';
  }

  /* ADR-0019 §11.5: الكتلة الحاوية لعنصر fixed — فحص F1 وقت التشغيل */
  function breaksFixedContainingBlock(node) {
    var current = node;
    var styles = null;
    while (current && current.nodeType === 1) {
      try {
        styles = window.getComputedStyle(current);
      } catch (styleError) {
        return true;
      }
      if (!styles) {
        return true;
      }
      if (styles.transform && styles.transform !== 'none') {
        return true;
      }
      if (styles.filter && styles.filter !== 'none') {
        return true;
      }
      if (styles.perspective && styles.perspective !== 'none') {
        return true;
      }
      if (styles.contain && /paint|layout|strict|content/.test(styles.contain)) {
        return true;
      }
      if (styles.willChange && /transform|filter|perspective|contain/.test(styles.willChange)) {
        return true;
      }
      if (current === document.documentElement) {
        return false;
      }
      current = current.parentElement;
    }
    return false;
  }

  /* رمز SVG مضمّن، aria-hidden، بلا Emoji (ADR-0019 §5) */
  function buildIcon() {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'pg-install-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var arrow = document.createElementNS(SVG_NS, 'path');
    arrow.setAttribute('d', 'M12 3v11M8 7l4-4 4 4');
    var tray = document.createElementNS(SVG_NS, 'path');
    tray.setAttribute('d', 'M5 13v7h14v-7');
    svg.appendChild(arrow);
    svg.appendChild(tray);
    return svg;
  }

  /* ADR-0020 E4: لا ترويج على صفحة الدرس — تفعيل مسار F1 في §11.6 */
  function isLessonPage() {
    return !!document.body && document.body.classList.contains('page-lesson');
  }

  /* ADR-0020 E6: محور زمني مستقل. موضع setTimeout واحد في الملف كله،
     ومقبض واحد حيّ بحد أقصى، ولا setInterval ولا polling ولا unload. */
  function clearDelay() {
    if (delayHandle !== null) {
      window.clearTimeout(delayHandle);
      delayHandle = null;
    }
  }

  function onDelayElapsed() {
    delayHandle = null;
    delayRemaining = 0;
    delayElapsed = true;
    revealBanner();
  }

  function armDelay() {
    clearDelay();
    if (delayElapsed || suppressed) {
      return;
    }
    if (document.hidden === true) {
      return;
    }
    delayStartedAt = Date.now();
    delayHandle = window.setTimeout(onDelayElapsed, delayRemaining);
  }

  function pauseDelay() {
    if (delayHandle === null) {
      return;
    }
    clearDelay();
    var spent = Date.now() - delayStartedAt;
    if (spent < 0) {
      spent = 0;
    }
    delayRemaining = delayRemaining - spent;
    if (delayRemaining < 0) {
      delayRemaining = 0;
    }
  }

  function onVisibilityChange() {
    if (document.hidden === true) {
      pauseDelay();
      return;
    }
    armDelay();
  }

  /* الحاضن: غير مخفي حتى تبقى النافذة قابلة للرسم والترقية إلى top layer.
     فحص F1 يسبق الإدراج (§11.5)، فالشريط fixed والكتلة الحاوية هي إطار
     العرض ما لم يكسرها سلف. */
  function ensureRoot() {
    if (root && root.parentNode) {
      return true;
    }
    if (document.getElementById(ROOT_ID)) {
      return false;
    }
    if (!document.body) {
      return false;
    }
    if (breaksFixedContainingBlock(document.body)) {
      return false;
    }
    var node = document.createElement('div');
    node.id = ROOT_ID;
    node.className = 'pg-install';
    document.body.appendChild(node);
    root = node;
    return true;
  }

  function buildBanner() {
    var node = document.createElement('aside');
    node.id = BANNER_ID;
    node.className = 'pg-install-banner';
    node.setAttribute('aria-label', LABEL_REGION);
    node.hidden = true;
    var logo = document.createElement('img');
    logo.className = 'pg-install-logo';
    logo.src = ICON_SRC;
    logo.width = 32;
    logo.height = 32;
    logo.setAttribute('alt', '');
    logo.setAttribute('aria-hidden', 'true');
    var heading = document.createElement('p');
    heading.className = 'pg-install-heading';
    heading.appendChild(document.createTextNode(LABEL_BANNER));
    bannerButton = document.createElement('button');
    bannerButton.type = 'button';
    bannerButton.className = 'pg-install-button';
    if (mode === 'ios') {
      bannerButton.appendChild(document.createTextNode(LABEL_ACTION_IOS));
    } else {
      bannerButton.setAttribute('lang', 'en');
      bannerButton.appendChild(document.createTextNode(LABEL_ACTION_PROMPT));
    }
    bannerButton.addEventListener('click', onBannerClick);
    var dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'pg-install-dismiss';
    dismiss.setAttribute('aria-label', LABEL_DISMISS);
    dismiss.appendChild(document.createTextNode('\u00D7'));
    dismiss.addEventListener('click', onDismissClick);
    node.appendChild(logo);
    node.appendChild(heading);
    node.appendChild(bannerButton);
    node.appendChild(dismiss);
    return node;
  }

  function ensureBanner() {
    if (banner && banner.parentNode) {
      return true;
    }
    if (document.getElementById(BANNER_ID)) {
      return false;
    }
    if (!ensureRoot()) {
      return false;
    }
    var node = buildBanner();
    root.insertBefore(node, root.firstChild);
    if (node.parentElement !== root) {
      return false;
    }
    banner = node;
    return true;
  }

  /* ADR-0020 E10: زر حقيقي بفئتي button وpg-install-cta، يُدرج بعد رابط
     واتساب في الحاضن نفسه. لا نقل للرابط ولا تعديل ولا حاضن جديد. */
  function buildCta() {
    var node = document.createElement('button');
    node.type = 'button';
    node.id = CTA_ID;
    node.className = 'button pg-install-cta';
    node.hidden = true;
    node.appendChild(document.createTextNode(LABEL_CTA));
    node.addEventListener('click', onCtaClick);
    return node;
  }

  function ensureCta() {
    if (cta && cta.parentNode) {
      return true;
    }
    if (document.getElementById(CTA_ID)) {
      return false;
    }
    var anchor = document.querySelector(WA_SELECTOR);
    if (!anchor || !anchor.parentElement) {
      return false;
    }
    var host = anchor.parentElement;
    var node = buildCta();
    host.insertBefore(node, anchor.nextSibling);
    if (node.parentElement !== host || anchor.contains(node)) {
      host.removeChild(node);
      return false;
    }
    cta = node;
    return true;
  }

  /* بوابة الشريط: ستة شروط مجتمعة، ولا يكفي بعضها (E3) */
  function revealBanner() {
    if (delayElapsed !== true) {
      return;
    }
    if (mode !== 'prompt' && mode !== 'ios') {
      return;
    }
    if (isLessonPage()) {
      return;
    }
    if (suppressed || readSuppressed()) {
      suppressed = true;
      return;
    }
    if (isAppMode()) {
      return;
    }
    if (!ensureBanner()) {
      return;
    }
    banner.hidden = false;
  }

  /* بوابة CTA: لا يخضع للمهلة إطلاقًا (E3) */
  function revealCta() {
    if (mode !== 'prompt' && mode !== 'ios') {
      return;
    }
    if (isLessonPage()) {
      return;
    }
    if (suppressed || readSuppressed()) {
      suppressed = true;
      return;
    }
    if (isAppMode()) {
      return;
    }
    if (!ensureCta()) {
      return;
    }
    cta.hidden = false;
  }

  function hide() {
    if (banner) {
      banner.hidden = true;
    }
    if (cta) {
      cta.hidden = true;
    }
  }

  /* ADR-0020 E9: مفتاح كبت واحد يخدم «ليس الآن» وdismissed معًا */
  function suppress() {
    suppressed = true;
    writeSuppressed();
    clearDelay();
    hide();
  }

  function buildDialog() {
    if (!root || !dialogSupported()) {
      return false;
    }
    dialogNode = document.createElement('dialog');
    dialogNode.className = 'pg-install-dialog';
    dialogNode.setAttribute('aria-modal', 'true');
    dialogNode.setAttribute('aria-labelledby', TITLE_ID);
    panelNode = document.createElement('div');
    panelNode.className = 'pg-install-panel';
    var heading = document.createElement('h2');
    heading.className = 'pg-install-title';
    heading.id = TITLE_ID;
    heading.appendChild(buildIcon());
    heading.appendChild(document.createTextNode(LABEL_TITLE));
    var list = document.createElement('ol');
    list.className = 'pg-install-steps';
    var index = 0;
    var item = null;
    for (index = 0; index < STEPS.length; index += 1) {
      item = document.createElement('li');
      item.appendChild(document.createTextNode(STEPS[index]));
      list.appendChild(item);
    }
    var closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'pg-install-close';
    closeButton.appendChild(document.createTextNode(LABEL_CLOSE));
    closeButton.addEventListener('click', closeDialog);
    panelNode.appendChild(heading);
    panelNode.appendChild(list);
    panelNode.appendChild(closeButton);
    dialogNode.appendChild(panelNode);
    dialogNode.addEventListener('cancel', onDialogCancel);
    dialogNode.addEventListener('close', onDialogClose);
    dialogNode.addEventListener('click', onDialogClick);
    root.appendChild(dialogNode);
    return true;
  }

  function openDialog() {
    if (!root) {
      return;
    }
    if (!dialogNode && !buildDialog()) {
      return;
    }
    if (!dialogNode || typeof dialogNode.showModal !== 'function') {
      return;
    }
    lockScroll();
    try {
      dialogNode.showModal();
    } catch (openError) {
      unlockScroll();
    }
  }

  function closeDialog() {
    if (dialogNode && dialogNode.open) {
      try {
        dialogNode.close();
      } catch (closeFailure) {
        unlockScroll();
      }
      return;
    }
    unlockScroll();
  }

  /* Escape: الإغلاق الأصلي يتولاه، ولا يُمنع افتراضيًا، وحدث close يستعيد */
  function onDialogCancel() {
    return;
  }

  function onDialogClose() {
    unlockScroll();
    if (!lastTrigger || !lastTrigger.parentNode || lastTrigger.hidden === true) {
      return;
    }
    try {
      lastTrigger.focus();
    } catch (focusError) {
      return;
    }
  }

  /* ADR-0019 §5: wrapper داخلي مع اختبار حدود اللوحة، لا مقارنة الهدف وحدها */
  function onDialogClick(event) {
    if (!dialogNode || !panelNode || event.target !== dialogNode) {
      return;
    }
    if (event.clientX === 0 && event.clientY === 0) {
      return;
    }
    var box = panelNode.getBoundingClientRect();
    var inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) {
      closeDialog();
    }
  }

  /* ADR-0019 §5: قفل التمرير بclass على html، بحفظ الموضع واستعادته */
  function lockScroll() {
    savedScrollY = typeof window.scrollY === 'number' ? window.scrollY : 0;
    document.documentElement.classList.add(LOCK_CLASS);
  }

  function unlockScroll() {
    if (!document.documentElement.classList.contains(LOCK_CLASS)) {
      return;
    }
    document.documentElement.classList.remove(LOCK_CLASS);
    try {
      window.scrollTo(0, savedScrollY);
    } catch (scrollError) {
      return;
    }
  }

  /* مسار الإيماءة الصريحة الوحيد */
  function onBannerClick() {
    runInstallPath(bannerButton);
  }

  function onCtaClick() {
    runInstallPath(cta);
  }

  function onDismissClick() {
    suppress();
  }

  function runInstallPath(trigger) {
    lastTrigger = trigger || null;
    if (mode === 'ios') {
      openDialog();
      return;
    }
    var pending = promptEvent;
    promptEvent = null;
    mode = '';
    if (!pending || typeof pending.prompt !== 'function') {
      hide();
      return;
    }
    var returned = null;
    try {
      returned = pending.prompt();
    } catch (promptFailure) {
      hide();
      return;
    }
    hide();
    var choice = returned;
    if (pending.userChoice && typeof pending.userChoice.then === 'function') {
      choice = pending.userChoice;
    }
    if (!choice || typeof choice.then !== 'function') {
      return;
    }
    choice.then(function (settled) {
      var value = settled && settled.outcome ? settled.outcome : settled;
      if (value === 'dismissed') {
        suppress();
      }
      return;
    }, function () {
      return;
    });
  }

  function onBeforeInstallPrompt(event) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (suppressed || readSuppressed()) {
      suppressed = true;
      promptEvent = null;
      clearDelay();
      hide();
      return;
    }
    if (isAppMode()) {
      promptEvent = null;
      return;
    }
    promptEvent = event;
    mode = 'prompt';
    revealCta();
    revealBanner();
  }

  function onAppInstalled() {
    promptEvent = null;
    teardown();
  }

  function onDisplayModeChange() {
    if (!isAppMode()) {
      return;
    }
    promptEvent = null;
    clearDelay();
    closeDialog();
    hide();
  }

  function teardown() {
    promptEvent = null;
    clearDelay();
    closeDialog();
    unlockScroll();
    if (cta && cta.parentNode) {
      cta.parentNode.removeChild(cta);
    }
    if (root && root.parentNode) {
      root.parentNode.removeChild(root);
    }
    root = null;
    banner = null;
    bannerButton = null;
    cta = null;
    lastTrigger = null;
    dialogNode = null;
    panelNode = null;
    mode = '';
    try {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    } catch (removeError) {
      return;
    }
  }

  function init() {
    suppressed = readSuppressed();
    watchDisplayModes();
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    if (suppressed || isAppMode()) {
      return;
    }
    if (isLessonPage()) {
      return;
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    armDelay();
    if (!isApplePlatform() || !dialogSupported()) {
      return;
    }
    mode = 'ios';
    revealCta();
  }

  init();
})();
