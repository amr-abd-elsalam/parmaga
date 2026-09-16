"""
PARMAGA — عقد Install Promotion UI — ADR-0019 + ملحقه ADR-0020.

تحليل ثابت على بايتات المستودع: لا شبكة، ولا متصفح، ولا تبعية خارجية،
ولا pytest. نهايات الأسطر CRLF مطابقة لعرف المستودع المقيس.

ما يثبته هذا الملف: البصمة الرباعية في E2، وآلة الحالة بمحوريها
المستقلين في E3، وهندسة الشريط والحجز الدائم في E4، والنصوص المعتمدة
والمرفوضة في E5، والمهلة أحادية الاستدعاء وأهلية bfcache في E6 وE14،
وصفر إزاحة بالخانة المحجوزة في E7، وسياسة العناوين في E8، ووحدة مفتاح
الكبت في E9، وتطبيع CTA وحذف قاعدتي التركيز في E10، وسلامة الملفات
المحمية وكتلة الطباعة المجمدة.
"""

import hashlib
import pathlib
import re
import unittest

COMMENT_RE = re.compile(r'/\*.*?\*/', re.DOTALL)


def code_only(text):
    """يُسقط تعليقات CSS/JS فلا يصطدم الفحص السلبي بتوثيق المحظور.

    المقطع المستخرج من CSS يبدأ داخل تعليق مفتوح، فتُسقط بقيته أولًا.
    ملف JS يبدأ بفاتحة تعليق، فلا يُفعَّل هذا المسار عليه.
    """
    head = text.find('*/')
    if head != -1 and '/*' not in text[:head]:
        text = text[head + 2:]
    return COMMENT_RE.sub(' ', text)


ROOT = pathlib.Path(__file__).resolve().parent.parent

JS_PATH = ROOT / 'assets' / 'js' / 'pwa-install.js'
CSS_PATH = ROOT / 'assets' / 'css' / 'parmaga.css'
INDEX_PATH = ROOT / 'index.html'
NOT_FOUND_PATH = ROOT / '404.html'
LESSON_PATH = (
    ROOT
    / 'courses'
    / 'programming-ai-baccalaureate-2'
    / 'term-1'
    / 'chapter-01'
    / 'lesson-01'
    / 'index.html'
)
VIEWER_PATH = ROOT / 'assets' / 'js' / 'lesson-viewer.js'
MANIFEST_PATH = ROOT / 'manifest.webmanifest'
ICON_PATH = ROOT / 'assets' / 'images' / 'fav192.png'
ADR20_PATH = (
    ROOT / 'docs' / 'decisions' / 'ADR-0020-smart-install-banner-and-hero-cta.md'
)

HTML_PAGES = (INDEX_PATH, NOT_FOUND_PATH, LESSON_PATH)

PRINT_BLOCK_LINES = 98
PRINT_BLOCK_SHA1 = 'f8bf32aa9b06dd8d72704d6abab9a37a987a14c3'
VIEWER_SHA256 = '01422204dcd5876e5e37c5082b75a8da7efa752820fd2107a2a009a483b0003a'
MANIFEST_SHA256 = 'bc2cb4f45f39e848fc215ef6e7f0d450aede55f9e9b4454c94e96e41d35e915c'

SECTION_BEGIN = 'BEGIN pwa-install'
SECTION_END = '/* END pwa-install */'
PRINT_LAYER_MARK = 'Layer 5'

# E8: لا اختبار أعمى يمنع كل ورود لـhttp أو //. هذه السلاسل الثلاث مسموحة
# حرفيًا: namespace قياسي، ومسار أيقونة محلي، ومحدد مرساة واتساب.
ALLOWED_URL_LITERALS = (
    "'http://www.w3.org/2000/svg'",
    "'/assets/images/fav192.png'",
    "'.hero a.button[href^=\"https://wa.me/\"]'",
)

ALLOWED_HOST_SELECTORS = ('.page-home', '.page-not-found', '.hero > div:first-child')


def read_bytes(path):
    return path.read_bytes()


def read_text(path):
    return path.read_bytes().decode('utf-8')


def sha256_of(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def crlf_lines(path):
    lines = path.read_bytes().split(b'\r\n')
    if lines and lines[-1] == b'':
        lines.pop()
    return lines


def function_body(source, name):
    """جسم دالة بمطابقة أقواس، لتحليل ترتيب العمليات لا مجرد وجود النص."""
    marker = 'function ' + name + '('
    start = source.find(marker)
    if start < 0:
        raise AssertionError('دالة غائبة: ' + name)
    if source.find(marker, start + 1) >= 0:
        raise AssertionError('دالة معرّفة أكثر من مرة: ' + name)
    opened = source.find('{', start)
    depth = 0
    index = opened
    while index < len(source):
        char = source[index]
        if char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
            if depth == 0:
                return source[opened:index + 1]
        index += 1
    raise AssertionError('جسم غير مكتمل: ' + name)


def isolated_section(css):
    begin = css.find(SECTION_BEGIN)
    end = css.find(SECTION_END)
    if begin < 0 or end < 0 or end < begin:
        raise AssertionError('حدود القسم المعزول غير سليمة')
    return css[begin:end + len(SECTION_END)]


def css_rule(section, selector):
    start = section.find(selector)
    if start < 0:
        raise AssertionError('قاعدة غائبة: ' + selector)
    opened = section.find('{', start)
    closed = section.find('}', opened)
    if opened < 0 or closed < 0:
        raise AssertionError('قاعدة غير مكتملة: ' + selector)
    return section[opened:closed + 1]


def selector_lines(section):
    found = set()
    for raw in section.split('\n'):
        line = raw.strip()
        if not line:
            continue
        if not (line[0] in '.#[:*' or line.startswith('html')):
            continue
        if not (line.endswith('{') or line.endswith(',')):
            continue
        found.add(line.rstrip('{').strip().rstrip(',').strip())
    return found


class TestPages(unittest.TestCase):
    """الصفحات الثلاث: سطر سكربت واحد، وصفر markup، وصفر معالج سطري."""

    def test_script_line_once_per_page_with_defer(self):
        pattern = re.compile(
            r'<script\s+src="/assets/js/pwa-install\.js"\s+defer\s*>\s*</script>'
        )
        for path in HTML_PAGES:
            text = read_text(path)
            self.assertEqual(len(pattern.findall(text)), 1, path.name)
            self.assertEqual(text.count('pwa-install.js'), 1, path.name)

    def test_no_inline_handlers(self):
        pattern = re.compile(r'\son[a-z]+\s*=', re.IGNORECASE)
        for path in HTML_PAGES:
            self.assertEqual(pattern.findall(read_text(path)), [], path.name)
        self.assertNotIn('onclick', read_text(JS_PATH))

    def test_no_static_promotion_markup(self):
        for path in HTML_PAGES:
            self.assertNotIn('pg-install', read_text(path), path.name)

    def test_whatsapp_anchor_is_unique_and_untouched(self):
        """الوحدانية المقصودة هي وحدانية ما يطابق WA_SELECTOR داخل .hero.

        ensureCta يُدرج بعد أول مطابقة لـ.hero a.button[href^="https://wa.me/"]،
        والخانة محجوزة في .hero > div:first-child، فتعدد المراسي داخل البطل
        وحده هو ما يجعل الموضع رهين ترتيب المصدر ويكسر E7. روابط واتساب
        خارج البطل (action-link في قسم التواصل) لا يراها المحدد.
        """
        text = read_text(INDEX_PATH)
        start = text.find('<section class="hero"')
        self.assertNotEqual(start, -1)
        hero = text[start:text.find('</section>', start)]
        self.assertEqual(hero.count('https://wa.me/'), 1)
        self.assertEqual(hero.count('class="button"'), 1)
        self.assertIn('احجز مكانك على واتساب', hero)
        self.assertEqual(text.count('https://wa.me/'), 2)


class TestScriptContract(unittest.TestCase):
    """السكربت: البصمة، والحدود، والنصوص، والإدراج، والإيماءة."""

    def setUp(self):
        self.js = read_text(JS_PATH)

    def test_dialog_is_native_and_semantic(self):
        self.assertIn("document.createElement('dialog')", self.js)
        self.assertIn("setAttribute('aria-modal', 'true')", self.js)
        self.assertIn("setAttribute('aria-labelledby', TITLE_ID)", self.js)
        self.assertIn("addEventListener('cancel', onDialogCancel)", self.js)
        self.assertIn("document.createElement('ol')", self.js)
        self.assertIn('showModal()', self.js)
        self.assertNotIn("setAttribute('role', 'dialog')", self.js)

    def test_banner_and_cta_start_hidden(self):
        self.assertIn('node.hidden = true;', function_body(self.js, 'buildBanner'))
        self.assertIn('node.hidden = true;', function_body(self.js, 'buildCta'))
        self.assertIn(
            'banner.hidden = false;', function_body(self.js, 'revealBanner')
        )
        self.assertIn('cta.hidden = false;', function_body(self.js, 'revealCta'))

    def test_lesson_page_is_excluded(self):
        self.assertIn('function isLessonPage()', self.js)
        self.assertNotIn('insertOnLessonPage', self.js)
        self.assertNotIn('lesson-viewer-controls', self.js)
        for name in ('init', 'revealBanner', 'revealCta'):
            self.assertIn('isLessonPage()', function_body(self.js, name), name)

    def test_f1_guard_precedes_insertion(self):
        body = function_body(self.js, 'ensureRoot')
        guard = body.find('breaksFixedContainingBlock(document.body)')
        append = body.find('document.body.appendChild')
        self.assertGreater(guard, -1)
        self.assertGreater(append, guard)

    def test_cta_inserted_after_anchor_without_touching_it(self):
        body = function_body(self.js, 'ensureCta')
        self.assertIn('document.querySelector(WA_SELECTOR)', body)
        self.assertIn('host.insertBefore(node, anchor.nextSibling)', body)
        self.assertNotIn('anchor.appendChild', body)
        self.assertNotIn('anchor.remove', body)
        self.assertNotIn("setAttribute('href'", body)
        self.assertNotIn("createElement('div')", body)
        self.assertIn("node.className = 'button pg-install-cta';", self.js)

    def test_prompt_is_gesture_only(self):
        self.assertEqual(self.js.count('.prompt()'), 1)
        self.assertIn('pending.prompt()', function_body(self.js, 'runInstallPath'))
        for name in ('init', 'onBeforeInstallPrompt', 'onDelayElapsed',
                     'revealBanner', 'revealCta', 'armDelay'):
            self.assertNotIn('prompt()', function_body(self.js, name), name)
        for handler in ('onBannerClick', 'onCtaClick', 'onDismissClick'):
            self.assertIn("addEventListener('click', " + handler + ')', self.js)

    def test_prevent_default_is_immediate(self):
        body = function_body(self.js, 'onBeforeInstallPrompt')
        self.assertEqual(self.js.count('preventDefault()'), 1)
        stopped = body.find('event.preventDefault()')
        first_gate = body.find('readSuppressed()')
        self.assertGreater(stopped, -1)
        self.assertGreater(first_gate, stopped)

    def test_event_is_memory_only_and_cleared_before_use(self):
        body = function_body(self.js, 'runInstallPath')
        cleared = body.find('promptEvent = null;')
        used = body.find('pending.prompt()')
        self.assertGreater(cleared, -1)
        self.assertGreater(used, cleared)
        self.assertIn("mode = '';", body)
        self.assertIn('promptEvent = null;', function_body(self.js, 'teardown'))
        self.assertIn('promptEvent = null;', function_body(self.js, 'onAppInstalled'))
        self.assertNotIn('JSON.stringify', self.js)

    def test_user_choice_handled_softly(self):
        body = function_body(self.js, 'runInstallPath')
        self.assertIn('pending.userChoice', body)
        self.assertIn("if (value === 'dismissed') {", body)
        self.assertIn('suppress();', body)
        self.assertIn('}, function () {', body)

    def test_app_installed_tears_down(self):
        self.assertIn('teardown();', function_body(self.js, 'onAppInstalled'))
        body = function_body(self.js, 'teardown')
        for token in ('clearDelay();', 'closeDialog();', 'unlockScroll();',
                      'lastTrigger = null;', 'banner = null;', 'cta = null;'):
            self.assertIn(token, body, token)

    def test_focus_returns_to_the_opening_trigger(self):
        body = function_body(self.js, 'onDialogClose')
        self.assertIn('lastTrigger.focus()', body)
        self.assertIn('lastTrigger.parentNode', body)
        self.assertIn(
            'lastTrigger = trigger || null;', function_body(self.js, 'runInstallPath')
        )
        self.assertNotIn('button.focus()', self.js)

    def test_forbidden_apis_absent(self):
        forbidden = (
            'localStorage', 'indexedDB', 'document.cookie', 'serviceWorker',
            'caches', 'fetch(', 'XMLHttpRequest', 'sendBeacon', 'eval(',
            'new Function', 'innerHTML', 'outerHTML', 'insertAdjacentHTML',
            'document.write', 'MutationObserver', 'setInterval',
            'navigator.userAgent', 'beacon.min.js',
        )
        code = code_only(self.js)
        for token in forbidden:
            self.assertNotIn(token, code, token)

    def test_no_unload_listeners_so_bfcache_stays_eligible(self):
        self.assertNotIn('unload', code_only(self.js))

    def test_single_guarded_session_key(self):
        self.assertIn("var SESSION_KEY = 'pg-install-dismissed';", self.js)
        self.assertEqual(self.js.count("'pg-install-dismissed'"), 1)
        self.assertEqual(self.js.count('setItem'), 1)
        self.assertIn('try {', function_body(self.js, 'readSuppressed'))
        self.assertIn('try {', function_body(self.js, 'writeSuppressed'))
        self.assertIn('writeSuppressed();', function_body(self.js, 'suppress'))
        self.assertNotIn('sessionStorage', read_text(VIEWER_PATH))

    def test_url_policy_allows_three_literals_only(self):
        stripped = self.js
        for literal in ALLOWED_URL_LITERALS:
            self.assertIn(literal, self.js, literal)
            stripped = stripped.replace(literal, '')
        self.assertNotIn('http', stripped)
        self.assertNotIn("'//", stripped)
        self.assertNotIn('"//', stripped)

    def test_icon_is_local_sized_and_silent(self):
        self.assertIn("var ICON_SRC = '/assets/images/fav192.png';", self.js)
        self.assertTrue(ICON_PATH.is_file(), 'الأيقونة المحلية غائبة')
        body = function_body(self.js, 'buildBanner')
        for token in ('logo.src = ICON_SRC;', 'logo.width = 32;',
                      'logo.height = 32;', "logo.setAttribute('alt', '');",
                      "logo.setAttribute('aria-hidden', 'true');"):
            self.assertIn(token, body, token)
        self.assertIn('fav192.png', read_text(MANIFEST_PATH))

    def test_approved_texts_and_language_tagging(self):
        for text in ('Parmaga على شاشتك الرئيسية', 'Install app',
                     'طريقة الإضافة', 'أضف Parmaga إلى شاشتك الرئيسية',
                     'ليس الآن', 'إضافة Parmaga إلى الشاشة الرئيسية',
                     'إغلاق', 'اضغط زر المشاركة في Safari.',
                     'ترويج تثبيت التطبيق'):
            self.assertIn(text, self.js, text)
        body = function_body(self.js, 'buildBanner')
        self.assertEqual(self.js.count("setAttribute('lang'"), 1)
        self.assertLess(
            body.find("setAttribute('lang', 'en')"), body.find('LABEL_ACTION_PROMPT')
        )
        self.assertIn("setAttribute('aria-label', LABEL_REGION)", body)
        self.assertIn("setAttribute('aria-label', LABEL_DISMISS)", body)

    def test_rejected_texts_and_names_absent(self):
        css = read_text(CSS_PATH)
        for text in ('ثبّت برمجة', 'إضافة برمجة إلى الشاشة الرئيسية',
                     'تنزيل التطبيق للأندرويد والآيفون',
                     'تثبيت Parmaga لتصفح أسرع', 'pg-install-bar-shown'):
            self.assertNotIn(text, self.js, text)
            self.assertNotIn(text, css, text)

    def test_listeners_registered_and_removed_once(self):
        for event in ('beforeinstallprompt', 'appinstalled', 'visibilitychange'):
            self.assertEqual(
                self.js.count("addEventListener('" + event + "'"), 1, event
            )
            self.assertEqual(
                self.js.count("removeEventListener('" + event + "'"), 1, event
            )

    def test_panel_state_is_never_read_or_written(self):
        code = code_only(self.js)
        self.assertNotIn('data-panel-open', code)
        self.assertNotIn('dataset', code)
        self.assertEqual(code.count('classList'), code.count('LOCK_CLASS'))


class TestTiming(unittest.TestCase):
    """المحور الزمني: مستقل، أحادي الاستدعاء، ولا يحكم CTA."""

    def setUp(self):
        self.js = read_text(JS_PATH)

    def test_delay_constant_defined_once(self):
        self.assertEqual(self.js.count('var DELAY_MS = 30000;'), 1)
        self.assertEqual(self.js.count('30000'), 1)
        self.assertGreaterEqual(self.js.count('DELAY_MS'), 2)

    def test_single_timeout_call_site(self):
        self.assertEqual(self.js.count('setTimeout('), 1)
        self.assertEqual(self.js.count('clearTimeout('), 1)
        self.assertIn(
            'window.setTimeout(onDelayElapsed, delayRemaining);',
            function_body(self.js, 'armDelay'),
        )
        self.assertIn(
            'window.clearTimeout(delayHandle);', function_body(self.js, 'clearDelay')
        )

    def test_clock_starts_at_init_not_on_event(self):
        self.assertIn('armDelay();', function_body(self.js, 'init'))
        self.assertNotIn('armDelay', function_body(self.js, 'onBeforeInstallPrompt'))
        self.assertIn('clearDelay();', function_body(self.js, 'armDelay'))

    def test_delay_gate_governs_banner_only(self):
        banner = function_body(self.js, 'revealBanner')
        self.assertIn('if (delayElapsed !== true) {', banner)
        for name in ('revealCta', 'ensureCta', 'buildCta'):
            self.assertNotIn('delayElapsed', function_body(self.js, name), name)

    def test_banner_gate_requires_six_conditions(self):
        banner = function_body(self.js, 'revealBanner')
        reveal = banner.find('banner.hidden = false;')
        self.assertGreater(reveal, -1)
        for gate in ('delayElapsed !== true', "mode !== 'prompt'",
                     'isLessonPage()', 'readSuppressed()', 'isAppMode()',
                     'ensureBanner()'):
            position = banner.find(gate)
            self.assertGreater(position, -1, gate)
            self.assertLess(position, reveal, gate)

    def test_visible_time_pauses_and_resumes(self):
        body = function_body(self.js, 'onVisibilityChange')
        self.assertIn('document.hidden === true', body)
        self.assertIn('pauseDelay();', body)
        self.assertIn('armDelay();', body)
        paused = function_body(self.js, 'pauseDelay')
        self.assertIn('Date.now()', paused)
        self.assertIn('delayRemaining', paused)

    def test_timer_cleared_on_every_exit(self):
        for name in ('suppress', 'teardown', 'onDisplayModeChange',
                     'pauseDelay', 'onBeforeInstallPrompt'):
            self.assertIn('clearDelay()', function_body(self.js, name), name)


class TestStyles(unittest.TestCase):
    """القسم المعزول: بصمة، وطبقة، وحجز، وصمت طباعة، وكتلة مجمدة."""

    def setUp(self):
        self.css = read_text(CSS_PATH)
        self.section = isolated_section(self.css)

    def test_isolated_section_boundaries(self):
        self.assertEqual(self.css.count(SECTION_BEGIN), 1)
        self.assertEqual(self.css.count(SECTION_END), 1)
        self.assertLess(
            self.css.find(SECTION_END), self.css.find(PRINT_LAYER_MARK)
        )

    def test_five_forbidden_properties_and_motion_absent(self):
        for prop in ('transform:', 'filter:', 'perspective:', 'contain:',
                     'will-change:', 'animation:', 'transition:'):
            self.assertNotIn(prop, self.section, prop)

    def test_cta_is_distinct_from_whatsapp_by_tokens_only(self):
        """CTA أزرق حدًّا وخلفية ونصه ورقي، بلا قيمة خام وبلا حركة."""
        cta = css_rule(self.section, '.pg-install-cta {')
        self.assertIn('border-color: var(--pg-blue-500);', cta)
        self.assertIn('background: var(--pg-blue-500);', cta)
        self.assertIn('color: var(--pg-paper);', cta)
        self.assertNotIn('var(--pg-navy-700)', cta)
        hover = css_rule(self.section, '.pg-install-cta:hover {')
        self.assertIn('background: var(--pg-blue-500);', hover)
        self.assertIn('color: var(--pg-paper);', hover)
        self.assertIn('border-color: var(--pg-navy-900);', hover)
        self.assertIn('text-decoration: underline;', hover)
        self.assertIn('text-underline-offset: var(--pg-space-1);', hover)
        self.assertNotIn('background: var(--pg-navy-900);', hover)
        self.assertNotIn('background: var(--pg-navy-700);', hover)
        for rule in (cta, hover):
            self.assertIsNone(re.search(r'#[0-9A-Fa-f]{3,8}', rule), rule)
            for prop in ('transform', 'transition', 'animation'):
                self.assertNotIn(prop, rule, prop)
        self.assertNotIn('.pg-install-cta:focus-visible', self.css)

    def test_shared_button_contract_is_unchanged(self):
        """واتساب يبقى Navy: عقد .button العام لم يمسّه تمييز CTA."""
        base = css_rule(self.css, '.button {')
        self.assertIn(
            'border: var(--pg-border-width) solid var(--pg-navy-700);', base)
        self.assertIn('background: var(--pg-navy-700);', base)
        self.assertIn('color: var(--pg-paper);', base)
        hover = css_rule(self.css, '.button:hover {')
        self.assertIn('border-color: var(--pg-navy-900);', hover)
        self.assertIn('background: var(--pg-navy-900);', hover)
        active = css_rule(self.css, '.button:active,')
        self.assertIn('border-color: var(--pg-navy-900);', active)
        self.assertIn(
            'box-shadow: inset 0 0 0 var(--pg-border-width-strong)'
            ' var(--pg-paper);', active)
        self.assertIn('text-decoration: underline;', active)
        self.assertIn('text-underline-offset: var(--pg-space-1);', active)
        self.assertNotIn('background:', active)

    def test_only_three_host_rules_exist(self):
        selectors = selector_lines(self.section)
        for host in ALLOWED_HOST_SELECTORS:
            self.assertIn(host, selectors, host)
        allowed = set(ALLOWED_HOST_SELECTORS) | {'html.pg-install-locked'}
        for selector in selectors:
            if selector in allowed:
                continue
            self.assertTrue(selector.startswith('.pg-install'), selector)

    def test_reservation_is_permanent_and_preserves_body_padding(self):
        home = css_rule(self.section, '.page-home,')
        self.assertNotIn('padding:', home)
        self.assertIn('padding-block-end:', home)
        self.assertIn('var(--pg-space-4)', home)
        self.assertIn('var(--pg-install-bar-block-size)', home)
        self.assertIn('env(safe-area-inset-bottom, 0px)', home)
        self.assertEqual(self.section.count('--pg-install-bar-block-size:'), 2)

    def test_bar_height_formulas_resolve_to_112px_and_68px(self):
        """يمنع الانزياح بين صيغ الارتفاع في CSS وأرقام E4 في ADR-0020."""
        tokens = {}
        for name in ('--pg-touch-target', '--pg-space-7'):
            found = re.findall(r'%s:\s*(\d+)px;' % name, self.css)
            self.assertEqual(len(found), 1, name)
            tokens[name] = int(found[0])
        touch = tokens['--pg-touch-target']
        space = tokens['--pg-space-7']
        self.assertEqual(touch, 44)
        self.assertEqual(space, 24)
        self.assertEqual(touch * 2 + space, 112)
        self.assertEqual(touch + space, 68)

        narrow = ('--pg-install-bar-block-size: '
                  'calc(var(--pg-touch-target) * 2 + var(--pg-space-7));')
        wide = ('--pg-install-bar-block-size: '
                'calc(var(--pg-touch-target) + var(--pg-space-7));')
        wide_query = '@media screen and (min-width: 800px)'
        self.assertEqual(self.section.count(narrow), 1)
        self.assertEqual(self.section.count(wide), 1)
        self.assertEqual(self.section.count(wide_query), 1)
        self.assertLess(
            self.section.find(narrow), self.section.find(wide_query)
        )
        self.assertLess(
            self.section.find(wide_query), self.section.find(wide)
        )

    def test_cta_slot_guarantees_zero_shift(self):
        host = css_rule(self.section, '.hero > div:first-child')
        self.assertIn('position: relative;', host)
        self.assertIn('padding-block-end: var(--pg-install-cta-slot);', host)
        self.assertNotIn('padding:', host)
        cta = css_rule(self.section, '.pg-install-cta {')
        self.assertIn('position: absolute;', cta)
        self.assertIn('inset-block-end: 0;', cta)
        self.assertIn('inset-inline-start: 0;', cta)
        self.assertEqual(self.section.count('--pg-install-cta-slot:'), 2)

    def test_single_layer_below_thirty(self):
        layers = re.findall(r'z-index:\s*(\d+)', self.section)
        self.assertEqual(len(layers), 1)
        self.assertLess(int(layers[0]), 30)

    def test_no_local_focus_rule_and_no_font_shorthand(self):
        code = code_only(self.section)
        self.assertNotIn(':focus-visible', code)
        self.assertNotIn('font: ', code)
        self.assertIn('font-family: inherit;', self.section)
        self.assertIn('font-size: inherit;', self.section)
        self.assertIn('font-weight: var(--pg-font-weight-strong);', self.section)
        self.assertIn('button:focus-visible', self.css)

    def test_component_is_silent_in_print(self):
        code = code_only(self.section)
        base = code[:code.find('@media screen')]
        for selector in ('.pg-install,', '.pg-install-banner,',
                         '.pg-install-cta,', '.pg-install-dialog {'):
            self.assertIn(selector, base, selector)
        self.assertIn('display: none;', base)
        self.assertNotIn('@media print', code)

    def test_sibling_and_lesson_rules_removed(self):
        self.assertNotIn('lesson-viewer-controls', self.section)
        self.assertNotIn('data-panel-open', self.section)
        self.assertNotIn('--pg-install-reserve', self.css)

    def test_frozen_print_block_intact(self):
        lines = crlf_lines(CSS_PATH)
        tail = lines[-PRINT_BLOCK_LINES:]
        self.assertEqual(len(tail), PRINT_BLOCK_LINES)
        joined = b'\r\n'.join(tail)
        candidates = {
            hashlib.sha1(joined).hexdigest(),
            hashlib.sha1(joined + b'\r\n').hexdigest(),
        }
        self.assertIn(PRINT_BLOCK_SHA1, candidates, 'كتلة الطباعة المجمدة تغيّرت')


class TestCommentStripper(unittest.TestCase):
    """ضابط معاكس: المُجرِّد يحذف التوثيق وحده ولا يحذف شيفرة."""

    def test_stripper_keeps_code_and_drops_documentation(self):
        js = code_only(read_text(JS_PATH))
        section = code_only(isolated_section(read_text(CSS_PATH)))
        self.assertIn('ADR-0019', read_text(JS_PATH))
        self.assertNotIn('ADR-0019', js)
        self.assertIn('sessionStorage', js)
        self.assertIn('setTimeout', js)
        self.assertIn('z-index: 20;', section)
        self.assertIn('display: none;', section)
        self.assertNotIn('ADR-0020', section)


class TestIntegrity(unittest.TestCase):
    """الملفات المحمية، وعرف الأسطر، وحالة القرار."""

    def test_protected_files_untouched(self):
        self.assertEqual(sha256_of(VIEWER_PATH), VIEWER_SHA256)
        self.assertEqual(sha256_of(MANIFEST_PATH), MANIFEST_SHA256)

    def test_crlf_is_total(self):
        paths = (JS_PATH, CSS_PATH, INDEX_PATH, NOT_FOUND_PATH, LESSON_PATH,
                 ADR20_PATH, pathlib.Path(__file__).resolve())
        for path in paths:
            lone = re.findall(rb'(?<!\r)\n', read_bytes(path))
            self.assertEqual(len(lone), 0, path.name)

    def test_adr_0020_status_and_completeness(self):
        adr = read_text(ADR20_PATH)
        self.assertIn(
            '## Status\r\n'
            'Proposed — Owner-approved reconciliation; pending E13'
            ' verification\r\n',
            adr,
        )
        self.assertNotIn('## Status\r\nAccepted\r\n', adr)
        for number in range(1, 15):
            self.assertIn('### E%d ' % number, adr, 'E%d' % number)
        self.assertIn('## Consequences', adr)

    def test_adr_0020_records_contrast_and_inp_applicability(self):
        """E10 تسجّل التباين المقيس، وE13 تميّز INP بدل فرضه على الثلاث."""
        adr = read_text(ADR20_PATH)
        self.assertIn('--pg-blue-500', adr)
        self.assertIn('5.2758:1', adr)
        self.assertIn('--pg-navy-700 دون أي تغيير', adr)
        self.assertNotIn('تُقاس CLS وLCP وINP على', adr)
        self.assertEqual(
            adr.count('Not Applicable — no comparable eligible interaction'), 2)
        for cell in ('| `index.html` |', '| `404.html` |', '| صفحة الدرس |'):
            self.assertIn(cell, adr, cell)
        self.assertNotIn('| `index.html` | مطلوب قبل/بعد | مطلوب قبل/بعد |'
                         ' مطلوب قبل/بعد |', adr)
        self.assertIn('ليست إعفاءً دائمًا', adr)


if __name__ == '__main__':
    unittest.main(verbosity=2)
