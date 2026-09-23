"""Tests for tools/publish_lesson.py: HTML escaping (ADR-0024 K2) and the
first regression net for the tool (ADR-0024 K3).

Standard library only, as required by ADR-0006 section 2. Nothing is written
inside the repository: the only file these tests write goes to a temporary
directory that is removed automatically.
"""

from __future__ import annotations

import html.parser
import os
import sys
import tempfile
import unittest

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


if __name__ == "__main__":
    unittest.main()
