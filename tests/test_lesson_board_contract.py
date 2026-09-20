"""
PARMAGA — عقد طبقة بورد الدرس — ADR-0021.

تحليل ثابت لبصمة التنفيذ والعقود القابلة للقياس بلا شبكة ولا متصفح
ولا dependency خارج مكتبة Python القياسية.

لا تدّعي هذه الاختبارات قياس سلاسة الإصبع الفعلية أو رفض راحة الكف
أو CLS/LCP/INP؛ تبقى تلك البنود Unknown حتى اختبار الجهاز والقياس.
"""

from __future__ import annotations

import hashlib
import pathlib
import re
import unittest


ROOT = pathlib.Path(__file__).resolve().parent.parent

JS_PATH = ROOT / "assets" / "js" / "lesson-board.js"
CSS_PATH = ROOT / "assets" / "css" / "parmaga.css"
HTML_PATH = (
    ROOT
    / "courses"
    / "programming-ai-baccalaureate-2"
    / "term-1"
    / "chapter-01"
    / "lesson-01"
    / "index.html"
)
VIEWER_PATH = ROOT / "assets" / "js" / "lesson-viewer.js"
ADR_0022_PATH = (
    ROOT
    / "docs"
    / "decisions"
    / "ADR-0022-transparent-lesson-ink-overlay.md"
)

SECTION_BEGIN = "/* BEGIN lesson-board */"
SECTION_END = "/* END lesson-board */"

PRINT_BLOCK_LINES = 98
PRINT_BLOCK_SHA1 = "f8bf32aa9b06dd8d72704d6abab9a37a987a14c3"
VIEWER_SHA256 = (
    "01422204dcd5876e5e37c5082b75a8da7efa752820fd2107a2a009a483b0003a"
)

COMMENT_RE = re.compile(r"/\*.*?\*/|//[^\r\n]*", re.DOTALL)


def read_bytes(path):
    return path.read_bytes()


def read_text(path):
    return read_bytes(path).decode("utf-8")


def sha256_of(path):
    return hashlib.sha256(read_bytes(path)).hexdigest()


def code_only(text):
    return COMMENT_RE.sub(" ", text)


def isolated_section(css):
    if css.count(SECTION_BEGIN) != 1:
        raise AssertionError("علامة BEGIN lesson-board يجب أن توجد مرة واحدة")
    if css.count(SECTION_END) != 1:
        raise AssertionError("علامة END lesson-board يجب أن توجد مرة واحدة")

    begin = css.index(SECTION_BEGIN)
    end = css.index(SECTION_END, begin)

    if end <= begin:
        raise AssertionError("ترتيب حدود lesson-board غير سليم")

    return css[begin : end + len(SECTION_END)]


def has_complete_crlf(path):
    data = read_bytes(path)
    return b"\n" not in data.replace(b"\r\n", b"")


JS_READY = JS_PATH.is_file()
CSS_TEXT = read_text(CSS_PATH)
CSS_READY = SECTION_BEGIN in CSS_TEXT and SECTION_END in CSS_TEXT


class TestADR0022(unittest.TestCase):
    """عقود القرار المعماري المقبول قبل تعديل المنتج."""

    @classmethod
    def setUpClass(cls):
        if not ADR_0022_PATH.is_file():
            raise AssertionError(f"ADR-0022 غير موجود: {ADR_0022_PATH}")
        cls.adr = read_text(ADR_0022_PATH)

    def test_status_relationship_and_model_are_explicit(self):
        for token in (
            "Accepted — Owner-approved; implementation pending",
            "ADR-0021",
            "يعلو ADR-0022 على ADR-0021 فقط",
            "النموذج A+",
            "ليست document/content-anchored",
            "ثلاثة أضعاف ارتفاع viewport",
        ):
            self.assertIn(token, self.adr, token)

    def test_transparency_is_visual_but_modal_is_not_click_through(self):
        for token in (
            "native modal dialog",
            "`dialog`",
            "Canvas",
            "حاوية السطح",
            "`::backdrop`",
            "شفافة بصريًا",
            "inert",
            "click-through",
            "لا توجد ورقة بيضاء",
            "لا إطار كبير",
            "لا ظل",
            "لا يحتاج الحوار أو Canvas إلى `z-index`",
            "لا يعدل إعداد viewport",
        ):
            self.assertIn(token, self.adr, token)

    def test_canvas_coordinates_resize_and_session_are_decided(self):
        for token in (
            "Canvas واحدة فقط",
            "boardX = clientX - scrollerRect.left",
            "boardY = clientY - scrollerRect.top + scroller.scrollTop",
            "يقاس `scrollerRect` عند بداية الضربة",
            "لا يستدعى `getBoundingClientRect()` لكل عينة",
            "لا يدخل `scrollLeft` في حساب الرسم",
            "لا يغير DPR الإحداثيات المنطقية",
            "لا يستخدم transform لعكس Canvas",
            "تنتهي الضربة بصورة منضبطة قبل تغيير الأبعاد",
            "تحجيم موحد يحافظ على النسبة",
            "يبقى Undo وRedo صالحين",
            "لا يحدث replay بسبب scroll العادي",
        ):
            self.assertIn(token, self.adr, token)

    def test_vertical_pan_colors_and_eraser_are_decided(self):
        for token in (
            "وضع مستقل اسمه `pan`",
            "initialScrollTop + initialClientY - currentClientY",
            "scrollHeight - clientHeight",
            "لا يعدل PAN قيمة `scrollLeft`",
            "لا يسمح بحركة أفقية",
            "--pg-navy-700",
            "--pg-red-600",
            "تخزن كل ضربة رسم اللون الذي بدأت به",
            "الممحاة لا تعتمد على لون",
            "عرض الممحاة مستقل تمامًا عن عرض القلم",
            "5% من أصغر بعد منطقي للـviewport",
            "`destination-out`",
            "لا يستخدم `crosshair`",
        ):
            self.assertIn(token, self.adr, token)

    def test_input_performance_and_dpr_cap_are_decided(self):
        for token in (
            "الإصبع هو مسار الإدخال الأساسي",
            "pointer capture",
            "coalesced events",
            "fallback إلى pointer event العادي",
            "العينات المكررة",
            "timestamp أقدم",
            "عينة `pointerup` إذا كانت مكررة",
            "يثبت mode واللون عند بداية الضربة",
            "لا يستخدم `pendingSamples.shift()`",
            "read index",
            "لا يحدث replay داخل `pointermove` أو `drawIncrement` أو scroll",
            "8,294,400 backing-store pixels",
            "effectiveDPR",
            "sqrt(8294400 / logicalArea)",
            "أقل من 1",
            "لا تنشأ Canvas ثانية",
        ):
            self.assertIn(token, self.adr, token)

    def test_tools_have_short_visible_text_and_full_arabic_names(self):
        expected = {
            "BD": "فتح البورد",
            "NV": "الرسم باللون الكحلي",
            "RD": "الرسم باللون الأحمر",
            "ER": "الممحاة",
            "PAN": "تمرير البورد رأسيًا",
            "UN": "تراجع",
            "RE": "إعادة",
            "CLR": "مسح كل الكتابة",
            "X": "إخفاء البورد",
        }
        for visible, accessible_name in expected.items():
            self.assertIn(f"`{visible}`", self.adr, visible)
            self.assertIn(accessible_name, self.adr, accessible_name)

        for token in (
            "`button` حقيقي",
            "`aria-label` عربي كامل",
            "`aria-pressed`",
            "`disabled` دلاليًا",
            "--pg-touch-target",
            "44px",
            "شريط الأدوات رأسيًا",
            "قائمة رأسية قابلة للتمرير",
            "زر `X` عند الطرف السفلي",
            "لا يوجد overflow أفقي",
            "ولا يضاف animation أو transition",
        ):
            self.assertIn(token, self.adr, token)

    def test_stop_gates_and_complete_footprint_are_recorded(self):
        for path in (
            "docs/decisions/ADR-0022-transparent-lesson-ink-overlay.md",
            "assets/js/lesson-board.js",
            "assets/css/parmaga.css",
            "tests/test_lesson_board_contract.py",
            "docs/ai/ARCHITECT_EVIDENCE_LEDGER.md",
        ):
            self.assertIn(f"`{path}`", self.adr, path)

        for token in (
            "### D12 — بصمة التنفيذ",
            "### D14 — بوابات التوقف",
            "لا يشمل الإذن الحالي JavaScript أو CSS أو HTML أو دفتر الأدلة",
            "تعديل `lesson-viewer.js`",
            "إضافة `z-index`",
            "إنشاء Canvas ثانية",
            "تغيير ارتفاع البورد عن ثلاثة أضعاف viewport",
            "تقليل هدف اللمس عن 44px",
            "انتظار موافقة المالك قبل تعديل JavaScript أو CSS",
        ):
            self.assertIn(token, self.adr, token)


class TestFootprint(unittest.TestCase):
    """البصمة الإنتاجية والحفاظ على الملفات المحمية."""

    def test_new_javascript_file_exists(self):
        self.assertTrue(JS_PATH.is_file(), JS_PATH)

    def test_single_defer_line_on_candidate_lesson_only(self):
        html = read_text(HTML_PATH)
        pattern = re.compile(
            r'<script\s+src="/assets/js/lesson-board\.js"\s+defer\s*>\s*</script>'
        )
        self.assertEqual(len(pattern.findall(html)), 1)
        self.assertEqual(html.count("/assets/js/lesson-board.js"), 1)

    def test_no_static_board_root_or_controls_in_html(self):
        html = read_text(HTML_PATH)
        for token in (
            "pg-lesson-board",
            "data-lesson-board",
            "<canvas",
            "فتح البورد",
            "إخفاء البورد",
        ):
            self.assertNotIn(token, html, token)

    def test_no_second_css_file(self):
        names = sorted(path.name for path in CSS_PATH.parent.glob("*.css"))
        self.assertEqual(names, ["parmaga.css"])

    def test_viewer_is_byte_identical_to_baseline(self):
        self.assertEqual(sha256_of(VIEWER_PATH), VIEWER_SHA256)

    def test_frozen_print_block_is_byte_identical(self):
        data = read_bytes(CSS_PATH)
        marker = b"\r\n@media print {"
        at = data.find(marker)
        self.assertNotEqual(at, -1, "كتلة الطباعة المجمدة غير موجودة")

        block = data[at + 2 :]
        self.assertEqual(block.count(b"\n"), PRINT_BLOCK_LINES)
        self.assertEqual(hashlib.sha1(block).hexdigest(), PRINT_BLOCK_SHA1)

    def test_test_file_uses_repository_crlf_convention(self):
        self.assertTrue(
            has_complete_crlf(pathlib.Path(__file__).resolve()),
            "ملف عقد البورد ليس CRLF كاملًا",
        )


@unittest.skipUnless(CSS_READY, "قسم lesson-board لم يُنفذ بعد")
class TestStyles(unittest.TestCase):
    """قسم CSS معزول، صامت افتراضيًا، ومن دون طبقة أو حركة."""

    @classmethod
    def setUpClass(cls):
        cls.css = read_text(CSS_PATH)
        cls.section = isolated_section(cls.css)
        cls.code = code_only(cls.section)

    def test_section_is_after_pwa_and_before_frozen_print_layer(self):
        pwa_end = self.css.index("/* END pwa-install */")
        board_begin = self.css.index(SECTION_BEGIN)
        board_end = self.css.index(SECTION_END)
        print_layer = self.css.index(
            "/* ==========================================================================\r\n"
            "   Layer 5 — Print"
        )
        self.assertLess(pwa_end, board_begin)
        self.assertLess(board_begin, board_end)
        self.assertLess(board_end, print_layer)

    def test_hidden_by_default_and_shown_on_screen_only(self):
        screen = self.code.find("@media screen")
        self.assertGreater(screen, -1)
        base = self.code[:screen]
        self.assertIn(".pg-lesson-board-root", base)
        self.assertIn(".pg-lesson-board-dialog", base)
        self.assertIn("display: none;", base)
        self.assertNotIn("@media print", self.code)

    def test_open_button_uses_opposite_logical_sides(self):
        self.assertIn(
            "inset-inline-end: var(--pg-float-inset);",
            self.section,
        )
        self.assertIn(
            "@media screen and (min-width: 800px)",
            self.section,
        )
        self.assertIn(
            "inset-inline-start: var(--pg-float-inset);",
            self.section,
        )
        self.assertNotIn("z-index", self.code)

    def _declarations_for(self, selector):
        pattern = re.compile(
            re.escape(selector) + r"\s*\{(?P<body>[^}]*)\}",
            re.DOTALL,
        )
        match = pattern.search(self.code)
        self.assertIsNotNone(match, f"قاعدة CSS مفقودة: {selector}")
        return match.group("body")

    def test_dialog_and_surface_leave_full_canvas_space(self):
        dialog = self._declarations_for(".pg-lesson-board-dialog[open]")
        surface = self._declarations_for(".pg-lesson-board-surface")
        canvas = self._declarations_for(".pg-lesson-board-canvas")

        self.assertNotIn("grid-template-rows", dialog)
        self.assertIn("position: relative;", dialog)
        self.assertIn("position: absolute;", surface)
        self.assertIn("inset: 0;", surface)
        self.assertIn("inline-size: 100%;", canvas)
        self.assertIn("block-size: auto;", canvas)

    def test_toolbar_is_vertical_and_overlays_canvas(self):
        toolbar = self._declarations_for(".pg-lesson-board-toolbar")

        self.assertIn("position: absolute;", toolbar)
        self.assertIn("display: flex;", toolbar)
        self.assertIn("flex-direction: column;", toolbar)
        self.assertNotIn("flex-direction: row;", toolbar)

    def test_tools_scroll_vertically_without_horizontal_overflow(self):
        tools = self._declarations_for(".pg-lesson-board-tools")

        self.assertIn("display: flex;", tools)
        self.assertIn("flex-direction: column;", tools)
        self.assertIn("overflow-y: auto;", tools)
        self.assertIn("overflow-x: hidden;", tools)

    def test_close_button_stays_at_logical_block_end(self):
        close = self._declarations_for(".pg-lesson-board-close")

        self.assertIn("margin-block-start: auto;", close)
        self.assertIn("flex: 0 0 auto;", close)

    def test_dialog_surface_canvas_and_backdrop_are_transparent(self):
        for selector in (
            ".pg-lesson-board-dialog[open]",
            ".pg-lesson-board-dialog::backdrop",
            ".pg-lesson-board-surface",
            ".pg-lesson-board-canvas",
        ):
            declarations = self._declarations_for(selector)
            self.assertIn("background: transparent;", declarations, selector)

    def test_screen_plane_has_no_large_border_or_shadow(self):
        for selector in (
            ".pg-lesson-board-dialog[open]",
            ".pg-lesson-board-surface",
            ".pg-lesson-board-canvas",
        ):
            declarations = self._declarations_for(selector)
            self.assertIn("border: 0;", declarations, selector)
            self.assertIn("box-shadow: none;", declarations, selector)

    def test_a_plus_css_has_no_horizontal_toolbar_row(self):
        self.assertNotIn(
            "grid-template-rows: auto minmax(0, 1fr);",
            self.section,
        )
        self.assertNotIn("overflow-x: auto;", self.code)
        self.assertNotIn("cursor: crosshair;", self.code)

    def test_no_layer_animation_transition_or_local_focus_rule(self):
        for token in (
            "z-index",
            "animation",
            "transition",
            ":focus-visible",
        ):
            self.assertNotIn(token, self.code, token)

    def test_only_adr_approved_pixel_literals_are_used(self):
        measurements = re.findall(
            r"(?<![-\w])\d+(?:\.\d+)?px",
            self.code,
        )
        self.assertEqual(measurements, ["0px", "800px"])
        self.assertEqual(
            self.section.count("@media screen and (min-width: 800px)"),
            1,
        )
        self.assertEqual(
            self.section.count("env(safe-area-inset-bottom, 0px)"),
            1,
        )

    def test_touch_targets_use_existing_token(self):
        self.assertIn(
            "min-block-size: var(--pg-touch-target);",
            self.section,
        )
        self.assertIn(
            "min-inline-size: var(--pg-touch-target);",
            self.section,
        )

    def test_canvas_owns_touch_gestures_only_inside_surface(self):
        self.assertIn(".pg-lesson-board-canvas", self.section)
        self.assertIn("touch-action: none;", self.section)
        self.assertNotIn("cursor: crosshair;", self.section)
        self.assertNotIn("touch-action: none;", self.css[: self.css.index(SECTION_BEGIN)])

    def test_logical_properties_and_no_rtl_canvas_mirroring(self):
        forbidden = re.compile(
            r"(?<![-\w])(?:left|right|top|bottom|margin-left|margin-right|"
            r"padding-left|padding-right)\s*:"
        )
        self.assertEqual(forbidden.findall(self.code), [])
        self.assertNotIn("scaleX(", self.code)
        self.assertNotIn("direction: ltr", self.code)

    def test_existing_tokens_are_used(self):
        for token in (
            "var(--pg-touch-target)",
            "var(--pg-paper)",
            "var(--pg-wood-700)",
            "var(--pg-navy-700)",
            "var(--pg-shadow-panel)",
            "var(--pg-radius-control)",
        ):
            self.assertIn(token, self.section, token)

    def test_no_fourth_bottom_reservation(self):
        code = self.code
        for selector in (
            ".page-lesson main",
            ".page-lesson",
            "body",
            "html",
        ):
            self.assertNotIn(selector, code)
        self.assertNotIn("padding-block-end", code)


@unittest.skipUnless(JS_READY, "lesson-board.js لم يُنفذ بعد")
class TestScriptContract(unittest.TestCase):
    """عقود JavaScript القابلة للتحقق الساكن."""

    @classmethod
    def setUpClass(cls):
        cls.js = read_text(JS_PATH)
        cls.code = code_only(cls.js)

    def test_uncompressed_size_is_at_most_24_kib(self):
        self.assertLessEqual(len(read_bytes(JS_PATH)), 24 * 1024)

    def test_single_dialog_and_single_canvas_are_created(self):
        self.assertEqual(
            self.js.count("document.createElement('dialog')"),
            1,
        )
        self.assertEqual(
            self.js.count("document.createElement('canvas')"),
            1,
        )
        self.assertIn("dialog.showModal()", self.js)
        self.assertNotIn("setAttribute('role', 'dialog')", self.js)

    def test_required_capabilities_are_checked(self):
        for token in (
            "window.PointerEvent",
            "window.HTMLDialogElement",
            "HTMLDialogElement.prototype.showModal",
            "canvas.getContext('2d')",
        ):
            self.assertIn(token, self.js, token)

    def test_root_is_inserted_after_viewer_controls(self):
        self.assertIn(
            "document.querySelector('.lesson-viewer-controls')",
            self.js,
        )
        self.assertIn("controls.parentNode", self.js)
        self.assertIn("controls.nextSibling", self.js)
        self.assertIn("insertBefore(root, controls.nextSibling)", self.js)
        self.assertNotIn("document.body.appendChild(root)", self.js)

    def test_pointer_types_and_lifecycle_are_supported(self):
        for token in (
            "'pointerdown'",
            "'pointermove'",
            "'pointerup'",
            "'pointercancel'",
            "'touch'",
            "'pen'",
            "'mouse'",
        ):
            self.assertIn(token, self.js, token)

    def test_coalesced_events_and_pointer_capture_exist(self):
        for token in (
            "getCoalescedEvents",
            "setPointerCapture",
            "releasePointerCapture",
        ):
            self.assertIn(token, self.js, token)

    def test_touch_arbitration_and_palm_evidence_exist(self):
        for token in (
            "isPrimary",
            "activePointerId",
            "activeTouchId",
            ".width",
            ".height",
            "penActive",
        ):
            self.assertIn(token, self.js, token)
        self.assertIn("pointerId", self.js)

    def test_pressure_and_speed_fallback_exist(self):
        for token in (
            ".pressure",
            "speed",
            "smoothedPressure",
            "smoothedSpeed",
        ):
            self.assertIn(token, self.js, token)

    def test_incremental_rendering_and_frame_batching_exist(self):
        for token in (
            "requestAnimationFrame",
            "drawIncrement",
            "pendingSamples",
        ):
            self.assertIn(token, self.js, token)

        move_start = self.js.index("function onPointerMove")
        move_end = self.js.index("function resetActivePointer", move_start)
        move_body = self.js[move_start:move_end]

        increment_start = self.js.index("function drawIncrement")
        increment_end = self.js.index("function scheduleIncrement", increment_start)
        increment_body = self.js[increment_start:increment_end]

        self.assertIn("scheduleIncrement()", move_body)
        self.assertNotIn("replay()", move_body)
        self.assertNotIn("replay()", increment_body)

    def test_history_tools_exist(self):
        for token in (
            "undoStack",
            "redoStack",
            "function undo(",
            "function redo(",
            "function clearAll(",
            "'draw'",
            "'erase'",
            "'clear'",
        ):
            self.assertIn(token, self.js, token)

    def test_resize_replays_strokes_under_pixel_cap(self):
        for token in (
            "MAX_BACKING_PIXELS = 8294400",
            "devicePixelRatio",
            "function resizeCanvas(",
            "function replay(",
            "'resize'",
            "'orientationchange'",
        ):
            self.assertIn(token, self.js, token)

    def test_point_limits_and_status_message_exist(self):
        for token in (
            "MAX_STROKE_POINTS",
            "MAX_SESSION_POINTS",
            "MAX_STROKES",
            "role', 'status",
        ):
            self.assertIn(token, self.js, token)

    def test_canvas_coordinates_are_physical_not_rtl_mirrored(self):
        self.assertIn("clientX - rect.left", self.js)
        self.assertIn("clientY - rect.top", self.js)
        self.assertNotIn("scale(-1", self.code)
        self.assertNotIn("canvas.style.transform", self.code)

    def test_dialog_escape_close_and_focus_return(self):
        for token in (
            "addEventListener('cancel'",
            "dialog.close()",
            "addEventListener('close'",
            "openButton.focus()",
        ):
            self.assertIn(token, self.js, token)

    def test_arabic_controls_are_present(self):
        for label in (
            "فتح البورد",
            "رسم",
            "ممحاة",
            "تراجع",
            "إعادة",
            "مسح الكل",
            "إخفاء البورد",
        ):
            self.assertIn(label, self.js, label)

    def test_forbidden_state_storage_network_and_execution_apis_are_absent(self):
        forbidden = (
            "data-panel-open",
            "localStorage",
            "sessionStorage",
            "indexedDB",
            "document.cookie",
            "serviceWorker",
            "caches",
            "CacheStorage",
            "fetch(",
            "XMLHttpRequest",
            "sendBeacon",
            "WebSocket",
            "EventSource",
            "eval(",
            "new Function",
            "innerHTML",
            "outerHTML",
            "insertAdjacentHTML",
            "document.write",
            "MutationObserver",
            "setInterval",
        )
        for token in forbidden:
            self.assertNotIn(token, self.code, token)

    def test_no_dependency_or_external_source_reference(self):
        for token in (
            "perfect-freehand",
            "signature_pad",
            "signature-pad",
            "atrament",
            "https://",
            "http://",
            "cdn",
            "import(",
            "require(",
        ):
            self.assertNotIn(token, self.code, token)

    def test_a_plus_board_uses_three_viewport_heights(self):
        self.assertRegex(
            self.code,
            r"(?:BOARD_HEIGHT_MULTIPLIER|BOARD_VIEWPORTS)\s*=\s*3\b",
        )
        for token in (
            "window.innerWidth",
            "window.innerHeight",
            "scrollHeight",
            "clientHeight",
        ):
            self.assertIn(token, self.js, token)

    def test_pan_is_an_independent_vertical_only_mode(self):
        for token in (
            "'pan'",
            "initialScrollTop",
            "initialClientY",
            "scrollTop",
            "setPointerCapture",
            "releasePointerCapture",
        ):
            self.assertIn(token, self.js, token)

        self.assertRegex(
            self.code,
            r"initialScrollTop\s*\+\s*initialClientY\s*-\s*"
            r"(?:currentClientY|event\.clientY)",
        )
        self.assertNotIn("scrollLeft", self.code)

    def test_board_coordinates_include_scroll_top(self):
        self.assertRegex(
            self.code,
            r"clientX\s*-\s*scrollerRect\.left",
        )
        self.assertRegex(
            self.code,
            r"clientY\s*-\s*scrollerRect\.top\s*\+\s*"
            r"(?:scroller\.)?scrollTop",
        )
        self.assertIn("scrollerRect", self.js)
        self.assertNotIn("scrollLeft", self.code)

    def test_strokes_capture_mode_and_color(self):
        for token in (
            "getComputedStyle",
            "--pg-navy-700",
            "--pg-red-600",
            "color",
            "mode",
        ):
            self.assertIn(token, self.js, token)

        self.assertRegex(
            self.code,
            r"(?:stroke|command)\.color\s*=",
        )
        self.assertRegex(
            self.code,
            r"(?:stroke|command)\.mode\s*=",
        )

    def test_short_visible_labels_and_full_arabic_names_exist(self):
        for visible in (
            "'BD'",
            "'NV'",
            "'RD'",
            "'ER'",
            "'PAN'",
            "'UN'",
            "'RE'",
            "'CLR'",
            "'X'",
        ):
            self.assertIn(visible, self.js, visible)

        for accessible_name in (
            "فتح البورد",
            "الرسم باللون الكحلي",
            "الرسم باللون الأحمر",
            "الممحاة",
            "تمرير البورد رأسيًا",
            "تراجع",
            "إعادة",
            "مسح كل الكتابة",
            "إخفاء البورد",
        ):
            self.assertIn(accessible_name, self.js, accessible_name)

        self.assertIn("aria-pressed", self.js)
        self.assertIn("disabled", self.js)

    def test_eraser_width_is_independent_and_larger(self):
        for token in (
            "ERASER_RATIO",
            "eraserWidth",
            "destination-out",
        ):
            self.assertIn(token, self.js, token)

        self.assertRegex(
            self.code,
            r"ERASER_RATIO\s*=\s*0?\.05\b",
        )
        self.assertRegex(
            self.code,
            r"Math\.min\([^)]*(?:innerWidth|viewportWidth)[^)]*"
            r"(?:innerHeight|viewportHeight)[^)]*\)",
        )

    def test_sample_queue_rejects_duplicates_and_old_timestamps(self):
        for token in (
            "timeStamp",
            "lastAcceptedTimestamp",
            "isDuplicateSample",
        ):
            self.assertIn(token, self.js, token)

        self.assertNotIn("pendingSamples.shift()", self.code)
        self.assertRegex(
            self.code,
            r"(?:sample|event)\.timeStamp\s*<\s*lastAcceptedTimestamp",
        )

    def test_pointerup_uses_the_same_sample_acceptance_path(self):
        self.assertIn("function acceptSample(", self.js)
        self.assertRegex(
            self.code,
            r"acceptSample\([^)]*(?:event|sample)[^)]*\)",
        )
        self.assertIn("'pointerup'", self.js)

    def test_pointerup_rejects_samples_from_non_active_pointer(self):
        pattern = re.compile(
            r"function\s+onPointerUp\s*\([^)]*\)\s*\{(?P<body>.*?)\r?\n  \}",
            re.DOTALL,
        )
        match = pattern.search(self.js)
        self.assertIsNotNone(match, "onPointerUp مفقودة")
        body = match.group("body")
        guard_index = body.find("event.pointerId !== activePointerId")
        accept_index = body.find("acceptSample(")
        self.assertNotEqual(
            guard_index, -1, "حارس هوية المؤشر مفقود من onPointerUp"
        )
        self.assertNotEqual(
            accept_index, -1, "قبول العينة مفقود من onPointerUp"
        )
        self.assertLess(
            guard_index,
            accept_index,
            "حارس الهوية يجب أن يسبق قبول العينة في onPointerUp",
        )

    def test_no_replay_is_bound_to_scroll_or_hot_paths(self):
        self.assertIn("addEventListener('scroll'", self.js)

        for function_name in (
            "onPointerMove",
            "drawIncrement",
            "onBoardScroll",
        ):
            pattern = re.compile(
                r"function\s+"
                + re.escape(function_name)
                + r"\s*\([^)]*\)\s*\{(?P<body>.*?)\r?\n  \}",
                re.DOTALL,
            )
            match = pattern.search(self.js)
            self.assertIsNotNone(
                match,
                f"دالة مطلوبة مفقودة: {function_name}",
            )
            self.assertNotIn("replay()", match.group("body"), function_name)

    def test_resize_finishes_active_stroke_and_updates_model(self):
        for token in (
            "finishActiveStroke",
            "logicalWidth",
            "logicalHeight",
            "orientationchange",
            "scrollTop",
        ):
            self.assertIn(token, self.js, token)

        self.assertRegex(
            self.code,
            r"(?:BOARD_HEIGHT_MULTIPLIER|BOARD_VIEWPORTS)\s*=\s*3\b",
        )

    def test_dpr_cap_accounts_for_the_long_canvas(self):
        for token in (
            "MAX_BACKING_PIXELS = 8294400",
            "logicalArea",
            "effectiveDPR",
            "Math.sqrt",
        ):
            self.assertIn(token, self.js, token)

        self.assertRegex(
            self.code,
            r"Math\.sqrt\(\s*MAX_BACKING_PIXELS\s*/\s*logicalArea\s*\)",
        )

    def test_hide_show_preserves_strokes_history_colors_and_scroll(self):
        for token in (
            "undoStack",
            "redoStack",
            "scrollTop",
            "savedScrollTop",
            "color",
        ):
            self.assertIn(token, self.js, token)

        self.assertNotIn("localStorage", self.code)
        self.assertNotIn("sessionStorage", self.code)

    def test_javascript_uses_repository_crlf_convention(self):
        self.assertTrue(has_complete_crlf(JS_PATH))

    def test_d9_mode_is_locked_after_stroke_starts(self):
        """ADR-0022 D9: mode يثبت عند بداية الضربة ويظل ثابتًا طوالها."""
        for function_name in (
            "onPointerMove",
            "finishStroke",
            "finishActiveStroke",
        ):
            pattern = re.compile(
                r"function\s+"
                + re.escape(function_name)
                + r"\s*\([^)]*\)\s*\{(?P<body>.*?)\r?\n  \}",
                re.DOTALL,
            )
            match = pattern.search(self.js)
            self.assertIsNotNone(match, f"دالة مطلوبة مفقودة: {function_name}")
            body = match.group("body")
            self.assertIn(
                "strokeMode",
                body,
                f"{function_name} يجب أن تقرأ strokeMode",
            )
            self.assertNotIn(
                "activeMode",
                body,
                f"{function_name} يجب ألا تقرأ activeMode بعد بدء الضربة",
            )
        self.assertNotIn(
            "activeMode !== 'pan' && acceptSample",
            self.js,
            "onPointerDown يجب أن يقرأ strokeMode لا activeMode بعد التثبيت",
        )

    def test_clear_all_respects_the_undo_limit(self):
        """F3: clearAll يسجّل أمرًا بلا فحص limitReached فيتجاوز MAX_STROKES."""
        pattern = re.compile(
            r"function\s+clearAll\s*\([^)]*\)\s*\{(?P<body>.*?)\r?\n  \}",
            re.DOTALL,
        )
        match = pattern.search(self.js)
        self.assertIsNotNone(match, "clearAll مفقودة")
        body = match.group("body")
        guard_index = body.find("limitReached(")
        command_index = body.find("commandAdded(")
        self.assertNotEqual(
            guard_index, -1, "حارس limitReached مفقود من clearAll"
        )
        self.assertNotEqual(
            command_index, -1, "تسجيل الأمر مفقود من clearAll"
        )
        self.assertLess(
            guard_index,
            command_index,
            "حارس الحدّ يجب أن يسبق تسجيل الأمر في clearAll",
        )


if __name__ == "__main__":
    unittest.main()
