"""Parmaga — عقود واجهة الدرس للمرحلة 7.1 وفق ADR-0012.

هذه اختبارات ساكنة: تقرأ المصادر المنشورة وتتحقق من العقود القابلة للقياس
بلا متصفح وبلا شبكة. البنود الزمنية والتركيزية والبصرية تُتحقق في V2
متصفحيًا، ولا يزعم هذا الملف تغطيتها. وكل ما لم يُقَس هنا ولا هناك يبقى
Unknown صراحة بنص قسم Verification من ADR-0012.

ولا يمسّ هذا الملف الاختبارات الـ61 القائمة في tests/test_verify_lesson.py،
ولا يعدّل أي أصل، ولا يكتب شيئًا على القرص.
"""

from __future__ import annotations

import hashlib
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS_REL = "assets/js/lesson-viewer.js"
CSS_REL = "assets/css/parmaga.css"
HTML_REL = (
    "courses/programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01/index.html"
)
ASSETS_REL = (
    "assets/lessons/programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01"
)

PAGE_COUNT = 22
PRINT_BLOCK_SHA1 = "f8bf32aa9b06dd8d72704d6abab9a37a987a14c3"
PRINT_BLOCK_LINES = 98


def read_text(relpath):
    with open(os.path.join(ROOT, relpath), "r", encoding="utf-8") as handle:
        return handle.read()


BLOCK_COMMENT_RE = re.compile(r"/\*.*?\*/", re.DOTALL)


def strip_comments(source):
    """يجرّد تعليقات JS فيقع الفحص على الكود التنفيذي وحده."""
    return BLOCK_COMMENT_RE.sub(" ", source)


class SourceTestCase(unittest.TestCase):
    """قراءة المصادر مرة واحدة لكل الصف."""

    @classmethod
    def setUpClass(cls):
        cls.js = read_text(JS_REL)
        cls.css = read_text(CSS_REL)
        cls.html = read_text(HTML_REL)

    def assert_absent(self, haystack, needles, label):
        for needle in needles:
            self.assertNotIn(
                needle, haystack, "{0}: العنصر المحرَّم {1!r} موجود".format(label, needle)
            )


class TestFullViewDefault(SourceTestCase):
    """المعايير 1 و2 و3 و4 و5 و8 — الوضع الافتراضي هو العرض الكامل."""

    def test_initial_phase_is_full(self):
        self.assertIn("phase: 'FULL'", self.js)
        self.assertIn("mode: 'static'", self.js)

    def test_init_does_not_load_a_page(self):
        """§2: لا fetch تلقائي. لا استدعاء loadPage في مسار التهيئة."""
        self.assertIn("setPhase('FULL');", self.js)
        self.assertNotIn("loadPage(start", self.js)

    def test_fetch_is_reachable_only_through_load_page(self):
        """موضع window.fetch واحد، وداخل fetchSvg وحدها."""
        self.assertEqual(1, self.js.count("window.fetch("))
        self.assertEqual(1, self.js.count("function loadPage("))
        self.assertIn("fetchSvg(page.src, signal)", self.js)

    def test_load_page_has_no_autoplay_parameter(self):
        self.assertIn("function loadPage(n) {", self.js)
        self.assertNotIn("function loadPage(n, autoplay)", self.js)
        for call in ("loadPage(n, ", "loadPage(start, ", "loadPage(state.current, "):
            self.assertNotIn(call, self.js, "نداء يحمل معامل ثانيًا: " + call)

    def test_static_pages_are_twenty_two_in_order(self):
        ids = re.findall(r'<li class="lesson-page" id="page-(\d+)"', self.html)
        self.assertEqual([str(i) for i in range(1, PAGE_COUNT + 1)], ids)

    def test_no_inline_svg_in_published_page(self):
        self.assertNotIn("<svg", self.html)

    def test_no_pen_node_in_published_page(self):
        self.assertNotIn('class="lesson-pen', self.html)

    def test_stage_is_created_hidden(self):
        self.assertIn("stage.hidden = true;", self.js)


class TestExplicitEntry(SourceTestCase):
    """المعايير 9 و10 و13 و14 — الدخول والتشغيل بفعل صريح."""

    def test_entry_guarded_by_full_phase(self):
        self.assertIn("function enterInteractive() {", self.js)
        self.assertIn("if (state.phase !== 'FULL') { return; }", self.js)

    def test_entry_is_bound_to_the_mode_button_only(self):
        self.assertIn("enterInteractive();", self.js)
        self.assertEqual(1, self.js.count("enterInteractive();"))
        self.assertIn("data-viewer-mode", self.html)

    def test_loading_then_idle(self):
        self.assertIn("setPhase('INTERACTIVE_LOADING');", self.js)
        self.assertIn("setPhase('INTERACTIVE_IDLE');", self.js)

    def test_success_path_does_not_start_motion(self):
        """runPlan لا يُستدعى من مسار نجاح التحميل، بل من startAnimation وحدها."""
        self.assertEqual(2, self.js.count("runPlan("))  # التعريف + startAnimation
        self.assertIn("function startAnimation() {", self.js)
        self.assertIn("setPhase('INTERACTIVE_RUNNING');", self.js)

    def test_five_phases_exist(self):
        for phase in (
            "FULL",
            "INTERACTIVE_LOADING",
            "INTERACTIVE_IDLE",
            "INTERACTIVE_RUNNING",
            "INTERACTIVE_PAUSED",
        ):
            self.assertIn("'" + phase + "'", self.js)

    def test_mode_is_derived_in_one_place(self):
        """ADR-0010 §7: mode مشتق لا مصدر ثانٍ — يُكتب في setPhase وحدها.

        النمط يستثني == و=== و!== بـlookahead، فلا تُحسب المقارنات إسنادًا.
        """
        writes = re.findall(r"state\.mode\s*=(?!=)", self.js)
        self.assertEqual(1, len(writes))
        setter = self.js.split("function setPhase(next) {")[1].split("\n  }")[0]
        self.assertIn("state.mode =", setter)


class TestSinglePanelAndIdleTimeout(SourceTestCase):
    """المعايير 16 و17 و18 و19 و22 و23 — اللوحة الواحدة والمهلة."""

    def test_single_open_panel_source(self):
        self.assertIn("function setOpenPanel(key) {", self.js)
        self.assertIn("var open = (state.openPanel === keys[i]);", self.js)

    def test_open_panel_is_written_through_one_path(self):
        """كل كتابة أخرى على openPanel هي تصفير في مسار التنظيف لا فتح."""
        writes = re.findall(r"state\.openPanel = (\S+?);", self.js)
        for value in writes:
            self.assertIn(value, ("key", "null"))

    def test_idle_timeout_is_exactly_8000(self):
        self.assertIn("var PANEL_IDLE_MS = 8000;", self.js)
        self.assertEqual(1, self.js.count("8000"))

    def test_single_panel_timer_reference(self):
        self.assertIn("var panelTimer = null;", self.js)
        self.assertEqual(1, self.js.count("var panelTimer"))
        self.assertIn("function clearPanelTimer() {", self.js)
        self.assertIn("function armPanelTimer() {", self.js)
        self.assertIn("clearPanelTimer();\n    if (!state.openPanel)", self.js)

    def test_reset_sources_are_the_declared_four(self):
        for evt in ("click", "keydown", "change", "focusin"):
            self.assertIn(
                "controls.addEventListener('{0}', armPanelTimer);".format(evt), self.js
            )

    def test_no_forbidden_reset_sources(self):
        """التعليقات تُجرَّد أولًا: نصٌّ يَنفي mousemove ليس استعمالًا له،
        وإسقاط الاختبار بسبب توثيق المنع خطأ في الاختبار لا في الكود."""
        self.assert_absent(
            strip_comments(self.js), ["mousemove", "'scroll'", '"scroll"'], "المهلة"
        )

    def test_outside_click_collapses_the_open_panel(self):
        """الانحراف D4: مستمع واحد على المستند يطوي ولا يفتح، ويهمل النقر
        داخل الأدوات، ولا يمسّ مصادر إعادة ضبط المهلة الأربعة."""
        self.assertIn("function onDocumentClick(evt) {", self.js)
        self.assertIn(
            "if (el.controls && el.controls.contains(evt.target)) { return; }", self.js
        )
        self.assertEqual(
            1, self.js.count("document.addEventListener('click', onDocumentClick);")
        )
        self.assertNotIn("document.addEventListener('click', armPanelTimer);", self.js)

    def test_aria_and_hidden_share_one_source(self):
        self.assertIn("if (panel) { panel.hidden = !open; }", self.js)
        self.assertIn(
            "btn.setAttribute('aria-expanded', open ? 'true' : 'false');", self.js
        )

    def test_no_focus_trap(self):
        self.assert_absent(
            self.js, ["focusTrap", "trapFocus", "preventDefault()"], "التركيز"
        )

    def test_escape_closes_and_restores_focus(self):
        self.assertIn("function onControlsKeydown(evt) {", self.js)
        self.assertIn("setOpenPanel(null);\n    var btn = buttonFor(key);", self.js)


class TestUnifiedFloatingModel(SourceTestCase):
    """المعياران 6 و33 — نموذج واحد بلا اكتشاف جهاز ولا عتبة عرض."""

    def test_no_viewport_gated_interaction_model_in_js(self):
        self.assert_absent(
            self.js,
            ["state.floating", "applyFloating", "max-width: 799px"],
            "العوم الموحد",
        )

    def test_no_device_or_ua_detection(self):
        self.assert_absent(
            self.js + self.css,
            [
                "userAgent",
                "navigator.",
                "ontouchstart",
                "maxTouchPoints",
                "hover: none",
                "pointer: coarse",
            ],
            "اكتشاف الجهاز",
        )

    def test_reduced_motion_query_is_retained(self):
        self.assertIn("prefers-reduced-motion: reduce", self.js)

    def test_writing_button_starts_hidden_in_full(self):
        self.assertIn('data-viewer-disclosure="motion"', self.html)
        motion_button = self.html.split('data-viewer-disclosure="motion"')[1].split(
            "</button>"
        )[0]
        self.assertIn("hidden", motion_button)
        self.assertIn("function applyButtonVisibility() {", self.js)
        self.assertIn("el.fabMotion.hidden = full;", self.js)

    def test_writing_panel_starts_hidden(self):
        self.assertIn('data-viewer-panel="motion" hidden', self.html)
        self.assertIn('data-viewer-panel="nav" hidden', self.html)

    def test_pages_button_is_never_hidden_by_phase(self):
        nav_button = self.html.split('data-viewer-disclosure="nav"')[1].split(
            "</button>"
        )[0]
        self.assertNotIn("hidden", nav_button)


class TestSpeedContract(SourceTestCase):
    """المعياران 27 و28 — ثماني سرعات مفردة بلا slider."""

    def test_closed_ordered_speed_list(self):
        self.assertIn(
            "var SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];", self.js
        )

    def test_start_at_one(self):
        self.assertIn("var SPEED_START_INDEX = 3;", self.js)
        self.assertIn("speedIndex: SPEED_START_INDEX,", self.js)
        self.assertIn("speed: SPEEDS[SPEED_START_INDEX],", self.js)

    def test_old_continuous_range_is_gone(self):
        self.assert_absent(
            self.js, ["SPEED_MIN", "SPEED_MAX", "SPEED_STEP", "changeSpeed"], "السرعة"
        )

    def test_step_is_one_element_and_bounded(self):
        self.assertIn("function stepSpeed(dir) {", self.js)
        self.assertIn("if (next < 0 || next >= SPEEDS.length) { return; }", self.js)

    def test_ends_are_disabled_declaratively(self):
        self.assertIn("el.slower.disabled = state.speedIndex <= 0;", self.js)
        self.assertIn(
            "el.faster.disabled = state.speedIndex >= SPEEDS.length - 1;", self.js
        )

    def test_no_slider_scrubber_or_timeline(self):
        self.assert_absent(
            self.js + self.css + self.html,
            ["slider", "scrubber", "timeline", 'type="range"', "input type=range"],
            "التقدم القابل للسحب",
        )


class TestPenContract(SourceTestCase):
    """المعايير 24 و25 و26 مع الانحراف D3 — قلم واحد واقعي محلي بالكامل،
    وزر إظهار وإخفاء واحد، والاختيار في ذاكرة الجلسة وحدها."""

    def test_pen_is_one_local_multipart_shape(self):
        self.assertIn("var PEN_PARTS = [", self.js)
        for part in ("nib", "tip", "collar", "body", "grip", "gloss", "cap"):
            self.assertIn("cls: '" + part + "'", self.js)
            self.assertIn(".lesson-pen-" + part, self.css)

    def test_geometry_constants_are_declared(self):
        for name in ("PEN_NOMINAL_LEN", "PEN_TILT_DEG", "PEN_ANGLE_BASE",
                     "PEN_TILT_WOBBLE", "PEN_LEN_PER_LINE", "PEN_BASELINE_RATIO"):
            self.assertIn("var " + name + " =", self.js)

    def test_body_extends_below_the_written_line(self):
        """الجسم إلى أسفل السطر الجاري فلا يحجب ما كُتب فوقه في الاتجاهين."""
        self.assertIn("var PEN_ANGLE_BASE = 180 - PEN_TILT_DEG;", self.js)
        self.assertIn("var angle = dir * PEN_ANGLE_BASE", self.js)

    def test_direction_covers_rtl_and_ltr(self):
        self.assertIn("function writesRtl(node) {", self.js)
        self.assertIn("function hasRtlChars(text) {", self.js)
        self.assertIn("var dir = rtl ? -1 : 1;", self.js)

    def test_no_external_pen_asset(self):
        """§11: الهندسة محلية بالكامل، بلا dependency ولا CDN ولا خط أيقونات."""
        self.assert_absent(
            self.css,
            ["cdn", "https://", "http://", "url(", "@import", "font-face"],
            "أصول القلم في CSS",
        )
        for spec in ("tag: 'polygon'", "tag: 'rect'"):
            self.assertIn(spec, self.js, "جزء قلم غير محلي: " + spec)

    def test_pen_created_only_on_explicit_play(self):
        """ensurePen: التعريف، وstartAnimation، والإظهار أثناء الجريان."""
        self.assertEqual(3, self.js.count("ensurePen("))
        self.assertIn("if (state.penVisible) { ensurePen(activeRoot); }", self.js)
        self.assertIn("state.phase === 'INTERACTIVE_RUNNING' && activeRoot", self.js)

    def test_one_toggle_replaces_the_three_shape_buttons(self):
        self.assert_absent(
            self.js,
            ["PEN_SHAPES", "PEN_ORDER", "setPenShape", "penShape", "togglePen"],
            "القلم القديم",
        )
        self.assert_absent(
            self.html, ["data-viewer-pen-shape", "viewer-pen-group"], "القلم القديم"
        )
        self.assertEqual(1, self.html.count("data-viewer-pen>"))

    def test_toggle_names_the_next_action(self):
        """كزر التشغيل: اسم الفعل التالي لا وصف الحالة، ولا aria-pressed
        مع اسم متغيّر فلا تُعلن الحالة مرتين."""
        self.assertIn(
            "state.penVisible ? 'إخفاء القلم' : 'إظهار القلم'", self.js
        )
        self.assertIn(">إخفاء القلم</button>", self.html)
        self.assertNotIn("data-viewer-pen aria-pressed", self.html)

    def test_visibility_choice_is_session_memory_only(self):
        self.assertIn("function setPenVisibility(on) {", self.js)
        self.assertIn("state.penVisible = next;", self.js)


class TestNoPersistence(SourceTestCase):
    """المعيار 29 — صفر تخزين دائم وصفر persistence في الـURL."""

    def test_no_storage_apis(self):
        self.assert_absent(
            self.js + self.css + self.html,
            [
                "localStorage",
                "sessionStorage",
                "indexedDB",
                "document.cookie",
                "caches.",
                "Cache(",
            ],
            "التخزين",
        )

    def test_url_carries_page_only(self):
        self.assertIn("var target = '#page-' + n;", self.js)
        self.assert_absent(
            self.js,
            ["?speed", "?mode", "?pen", "searchParams", "URLSearchParams"],
            "الـURL",
        )


class TestHistoryContract(SourceTestCase):
    """المعيار 31 — التاريخ يغيّر الصفحة فقط."""

    def test_both_history_events_bound(self):
        self.assertIn("window.addEventListener('popstate', onHistoryNav);", self.js)
        self.assertIn("window.addEventListener('hashchange', onHistoryNav);", self.js)

    def test_history_path_goes_through_goto_only(self):
        handler = self.js.split("function onHistoryNav() {")[1].split("\n  }")[0]
        self.assertIn("goTo(n, true);", handler)
        self.assert_absent(
            handler, ["loadPage", "enterInteractive", "startAnimation"], "التاريخ"
        )

    def test_invalid_fragment_is_ignored(self):
        self.assertIn("if (!m) { return; }", self.js)

    def test_full_phase_page_change_does_not_fetch(self):
        goto = self.js.split("function goTo(n, fromHistory) {")[1].split("\n  }")[0]
        self.assertIn("if (state.phase === 'FULL') {", goto)
        self.assertIn("return;", goto)


class TestTeardownContract(SourceTestCase):
    """المعيار 32 — الـ13 بندًا والعودة السليمة إلى FULL."""

    def test_return_to_full_exists_and_is_the_failure_path(self):
        self.assertIn("function returnToFull(message) {", self.js)
        self.assertIn("returnToFull('تعذّر تحميل العرض التفاعلي", self.js)

    def test_all_cleanup_steps_present(self):
        body = self.js.split("function returnToFull(message) {")[1].split(
            "\n  function onToggleMode"
        )[0]
        for step in (
            "bumpGeneration();",
            "abortFetch();",
            "clearAllTimers();",
            "clearPanelTimer();",
            "state.resume = null;",
            "destroyPen();",
            "teardownStage();",
            "el.stage.hidden = true;",
            "state.mounted = false;",
            "setPhase('FULL');",
            "removeAttribute('data-viewer-active')",
            "state.openPanel = null;",
            "applyDisclosure();",
        ):
            self.assertIn(step, body, "خطوة التنظيف الغائبة: " + step)

    def test_abort_controller_is_used(self):
        self.assertIn("new window.AbortController()", self.js)
        self.assertIn("state.controller.abort()", self.js)

    def test_generation_guard_on_callbacks(self):
        self.assertGreaterEqual(self.js.count("isStale(gen)"), 3)

    def test_teardown_is_idempotent_by_guards(self):
        """كل خطوة محروسة بفحص وجود، فلا تعتمد على عقدة أو مؤقت أو طلب."""
        self.assertIn("if (panelTimer !== null) {", self.js)
        self.assertIn("if (state.pen && state.pen.parentNode) {", self.js)
        self.assertIn("if (state.controller) {", self.js)
        self.assertIn("if (el.stage) {", self.js)


class TestPrintContractFrozen(SourceTestCase):
    """ADR-0011 مجمَّد — كتلة @media print لم تُمسّ."""

    def test_print_block_fingerprint_is_unchanged(self):
        """تُحسب البصمة على البايتات كما يفعل الحارس G4 بـsed | sha1sum.

        المستودع CRLF بنص §2 من دفتر الأدلة، فتطبيع النهايات قبل الهاش
        ينتج قيمة أخرى ويكسر التكافؤ بين الاختبار والحارس.
        """
        with open(os.path.join(ROOT, CSS_REL), "rb") as handle:
            data = handle.read()
        at = data.find(b"\r\n@media print {")
        self.assertNotEqual(-1, at, "كتلة @media print غير موجودة")
        block = data[at + 2:]
        self.assertEqual(PRINT_BLOCK_LINES, block.count(b"\n"))
        self.assertEqual(PRINT_BLOCK_SHA1, hashlib.sha1(block).hexdigest())

    def test_no_page_rule_outside_the_print_block(self):
        before = self.css.split("@media print {")[0]
        self.assertNotIn("@page", before)


class TestLessonAssetsUntouched(unittest.TestCase):
    """أصول SVG خارج النطاق — عددها وأسماؤها كما هي."""

    def test_twenty_two_canonical_assets(self):
        directory = os.path.join(ROOT, ASSETS_REL)
        names = sorted(
            name for name in os.listdir(directory) if name.endswith(".svg")
        )
        self.assertEqual(PAGE_COUNT, len(names))
        self.assertEqual(
            ["page-{0:03d}.svg".format(i) for i in range(1, PAGE_COUNT + 1)], names
        )


class TestStyleContract(SourceTestCase):
    """عقد CSS: أشكال القلم، والعوم الموحد، وحد الطباعة."""

    def test_pen_part_classes_exist(self):
        for part in ("nib", "tip", "collar", "body", "grip", "gloss", "cap"):
            self.assertIn(".lesson-pen-" + part, self.css)

    def test_no_viewport_switch_of_the_interaction_model(self):
        self.assertNotIn("max-width: 799px", self.css)

    def test_screen_guard_used_for_floating_layer(self):
        self.assertIn("@media screen", self.css)

    def test_safe_area_respected(self):
        self.assertIn("env(safe-area-inset-bottom", self.css)


if __name__ == "__main__":
    unittest.main()
