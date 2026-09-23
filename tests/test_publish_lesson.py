"""Tests for tools/publish_lesson.py: HTML escaping (ADR-0024 K2) and the
first regression net for the tool (ADR-0024 K3).

Standard library only, as required by ADR-0006 section 2. Nothing is written
inside the repository: files these tests write go to temporary directories
outside it, plus the tool's own publish_all_manifest.json in the system temp dir.
"""

from __future__ import annotations

import contextlib
import html.parser
import io
import os
import shutil
import sys
import tempfile
import unittest
from unittest import mock

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_DIR = os.path.join(
    REPO_ROOT, "tools", "publish_configs",
    "programming-ai-baccalaureate-2", "term-1", "chapter-01")

sys.path.insert(0, os.path.join(REPO_ROOT, "tools"))

import publish_lesson  # noqa: E402  (path is prepared immediately above)

HOSTILE = "a < b && c > \"d\" 'e'"
HOSTILE_ESCAPED = "a &lt; b &amp;&amp; c &gt; &quot;d&quot; &#x27;e&#x27;"


class _LessonParser(html.parser.HTMLParser):
    """Collects what a reader sees, with character references resolved."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.alts = []
        self.items = []
        self.heads = {}
        self.meta = {}
        self._in_body = False
        self._capture = None
        self._buf = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "img" and a.get("class") == "lesson-page-image":
            self.alts.append(a.get("alt"))
        elif tag == "meta" and (a.get("name") or a.get("property")):
            self.meta[a.get("name") or a.get("property")] = a.get("content")
        elif tag == "div" and a.get("class") == "transcript-body":
            self._in_body = True
        elif tag in ("title", "h1") or (tag == "p" and self._in_body):
            self._capture = tag
            self._buf = []

    def handle_endtag(self, tag):
        if self._capture is not None and tag == self._capture:
            text = "".join(self._buf)
            if tag == "p":
                self.items.append(text)
            else:
                self.heads[tag] = text
            self._capture = None
        elif tag == "div" and self._in_body:
            self._in_body = False

    def handle_data(self, data):
        if self._capture is not None:
            self._buf.append(data)


def _parse(text):
    parser = _LessonParser()
    parser.feed(text)
    parser.close()
    return parser


def _page(order, description):
    return {"order": order, "id": "page-%03d" % order, "width": "1080",
            "height": "1350", "descriptionAr": description}


def _config(title, text):
    return {
        "course": "c", "term": "t", "chapter": "ch", "lesson": "l",
        "displayNumber": "9-9", "displayTitleAr": title, "declaredPageCount": 1,
        "pages": [{"transcript": [{"lang": "en", "dir": "ltr", "text": text}]}],
    }


class RenderPageBlockEscapeTests(unittest.TestCase):
    """descriptionAr goes into alt, transcript text into <p>: both escaped."""

    def _block(self):
        config = _config("t", HOSTILE)
        return publish_lesson.render_page_block(
            _page(2, HOSTILE), config["pages"][0]["transcript"], 1, True, config)

    def test_alt_attribute_is_escaped(self):
        self.assertIn(' alt="%s">' % HOSTILE_ESCAPED, self._block())

    def test_transcript_paragraph_is_escaped(self):
        self.assertIn('<p lang="en" dir="ltr">%s</p>' % HOSTILE_ESCAPED,
                      self._block())

    def test_parser_recovers_original_text(self):
        parsed = _parse(self._block())
        self.assertEqual(parsed.alts, [HOSTILE])
        self.assertEqual(parsed.items, [HOSTILE])


class BuildHtmlEscapeTests(unittest.TestCase):
    """displayTitleAr and the meta description are escaped exactly once."""

    def _html(self):
        return publish_lesson.build_html(
            _config(HOSTILE, "x"), {"pages": [_page(1, "y")]})

    def test_raw_title_never_reaches_the_page(self):
        text = self._html()
        self.assertNotIn(HOSTILE, text)
        self.assertIn(HOSTILE_ESCAPED, text)
        self.assertNotIn("&amp;amp;", text)

    def test_parser_recovers_title_in_every_site(self):
        parsed = _parse(self._html())
        self.assertEqual(parsed.heads["title"], HOSTILE + " | Parmaga")
        self.assertEqual(parsed.heads["h1"], HOSTILE)
        self.assertEqual(parsed.meta["og:title"], HOSTILE)
        self.assertIn(HOSTILE, parsed.meta["description"])
        self.assertEqual(parsed.meta["og:description"], parsed.meta["description"])


class CommittedLessonTests(unittest.TestCase):
    """The committed pages are exactly what the tool renders from their configs."""

    def _load(self, lesson):
        config = publish_lesson.load_config(os.path.join(CONFIG_DIR, lesson + ".json"))
        manifest = publish_lesson.load_manifest(
            os.path.join(REPO_ROOT, publish_lesson.manifest_relpath_for(config)))
        path = os.path.join(REPO_ROOT, publish_lesson.lesson_html_relpath_for(config))
        with open(path, "rb") as f:
            return config, manifest, f.read()

    def _assert_regenerates(self, lesson):
        config, manifest, committed = self._load(lesson)
        with tempfile.TemporaryDirectory() as tmp:
            out = os.path.join(tmp, "index.html")
            publish_lesson.write_with_ending(
                out, publish_lesson.build_html(config, manifest), "crlf")
            with open(out, "rb") as f:
                rendered = f.read()
        self.assertTrue(rendered == committed, "%s page differs from render" % lesson)

    def _assert_round_trip(self, lesson):
        config, _manifest, committed = self._load(lesson)
        parsed = _parse(committed.decode("utf-8"))
        self.assertEqual(parsed.alts, [p["descriptionAr"] for p in config["pages"]])
        self.assertEqual(
            parsed.items, [i["text"] for p in config["pages"] for i in p["transcript"]])

    def test_lesson_01_page_regenerates_byte_for_byte(self):
        self._assert_regenerates("lesson-01")

    def test_lesson_02_page_regenerates_byte_for_byte(self):
        self._assert_regenerates("lesson-02")

    def test_lesson_01_transcript_round_trips(self):
        self._assert_round_trip("lesson-01")

    def test_lesson_02_transcript_round_trips(self):
        self._assert_round_trip("lesson-02")


class ContextPacketTests(unittest.TestCase):
    """ADR-0005 section 10: every Context Packet stays under 8000 bytes with no
    SVG markup, and the committed packets are exactly what the tool renders."""

    CAP = 8000

    def _each(self):
        for root, _dirs, files in os.walk(os.path.join(REPO_ROOT, "tools", "publish_configs")):
            for name in sorted(files):
                if name.endswith(".json"):
                    config = publish_lesson.load_config(os.path.join(root, name))
                    manifest = publish_lesson.load_manifest(
                        os.path.join(REPO_ROOT, publish_lesson.manifest_relpath_for(config)))
                    yield config, publish_lesson.build_context(config, manifest)

    def test_every_context_packet_is_under_cap_without_svg(self):
        seen = 0
        for config, text in self._each():
            data = text.encode("utf-8")
            self.assertLess(len(data), self.CAP, config["lesson"])
            self.assertNotIn(b"<svg", data.lower(), config["lesson"])
            seen += 1
        self.assertGreaterEqual(seen, 2)

    def test_committed_context_regenerates_byte_for_byte(self):
        for config, text in self._each():
            path = os.path.join(REPO_ROOT, publish_lesson.context_relpath_for(config))
            with tempfile.TemporaryDirectory() as tmp:
                out = os.path.join(tmp, "context.md")
                publish_lesson.write_with_ending(out, text, "lf")
                with open(out, "rb") as f:
                    rendered = f.read()
            with open(path, "rb") as f:
                self.assertTrue(rendered == f.read(), "%s context differs" % config["lesson"])


class ToolInventoryTests(unittest.TestCase):
    """ADR-0024, ledger contract (kha): the text-extraction tool stays outside
    the repository. A new Python tool under tools/ needs its own ADR and must be
    added to this recorded set in the same pull request."""

    RECORDED = ["browser_baseline.py", "publish_lesson.py", "verify_lesson.py"]

    def test_tools_python_files_are_the_recorded_set(self):
        base = os.path.join(REPO_ROOT, "tools")
        found = []
        for root, dirs, files in os.walk(base):
            dirs[:] = [d for d in dirs if d != "__pycache__"]
            for name in files:
                if name.endswith(".py"):
                    found.append(os.path.relpath(os.path.join(root, name), base))
        self.assertEqual(sorted(found), self.RECORDED)


class AllNewLessonTests(unittest.TestCase):
    """ADR-0024 K1: `all` on a lesson with no canonical Manifest. With
    --in-place it creates the Manifest through `inventory` and continues; with
    --output-dir it stops with exit status 1 and writes nothing. Runs on a copy
    of lesson 1-1 in a temporary repository root; `verify` is replaced here
    because it scans the whole repository (tests/test_verify_lesson.py)."""

    LESSON = "lesson-01"

    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = tmp.name
        self.config_path = os.path.join(CONFIG_DIR, self.LESSON + ".json")
        self.config = publish_lesson.load_config(self.config_path)
        c = self.config
        assets = os.path.join("assets", "lessons", c["course"], c["term"], c["chapter"], c["lesson"])
        shutil.copytree(os.path.join(REPO_ROOT, assets), os.path.join(self.root, assets))
        for name in ("index.html", "sitemap.xml"):
            shutil.copy2(os.path.join(REPO_ROOT, name), os.path.join(self.root, name))
        patcher = mock.patch.multiple(
            publish_lesson, REPO_ROOT=self.root, cmd_verify=lambda _config_path: 0)
        patcher.start()
        self.addCleanup(patcher.stop)
        self.canonical = os.path.join(self.root, publish_lesson.manifest_relpath_for(c))

    def _run(self, output_dir=None, in_place=True):
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            rc = publish_lesson.cmd_all(self.config_path, output_dir, in_place=in_place)
        return rc, out.getvalue()

    def _bytes(self, root, relpath):
        with open(os.path.join(root, relpath), "rb") as f:
            return f.read()

    def test_in_place_creates_manifest_equal_to_committed(self):
        self.assertFalse(os.path.exists(self.canonical))
        self.assertEqual(self._run()[0], 0)
        c = self.config
        for rel in (publish_lesson.manifest_relpath_for(c),
                    publish_lesson.lesson_html_relpath_for(c),
                    publish_lesson.context_relpath_for(c),
                    "index.html", "sitemap.xml"):
            self.assertTrue(self._bytes(self.root, rel) == self._bytes(REPO_ROOT, rel), rel)

    def test_second_run_writes_nothing_in_repository(self):
        self.assertEqual(self._run()[0], 0)
        rc, out = self._run()
        self.assertEqual(rc, 0)
        inside = [line for line in out.splitlines()
                  if "wrote=" in line and (self.root + os.sep) in line]
        self.assertEqual(len(inside), 4, out)
        self.assertTrue(all(line.endswith("(wrote=False)") for line in inside), out)

    def test_output_dir_without_manifest_stops_and_writes_nothing(self):
        outdir = os.path.join(self.root, "out")
        os.mkdir(outdir)
        self.assertEqual(self._run(output_dir=outdir, in_place=False)[0], 1)
        self.assertFalse(os.path.exists(self.canonical))
        self.assertEqual(os.listdir(outdir), [])


if __name__ == "__main__":
    unittest.main()
