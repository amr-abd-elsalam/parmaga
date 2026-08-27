"""Tests for the Parmaga published-lesson verification tool.

Standard library only, as required by ADR-0006 section 2. Every fixture is
created inside a temporary directory and removed automatically, so no SVG file
and no tracked fixture is ever added to the repository.
"""

from __future__ import annotations

import contextlib
import hashlib
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOL_PATH = os.path.join(REPO_ROOT, "tools", "verify_lesson.py")

sys.path.insert(0, os.path.join(REPO_ROOT, "tools"))

import verify_lesson  # noqa: E402  (path is prepared immediately above)

COURSE = "programming-ai-baccalaureate-2"
TERM = "term-1"
CHAPTER = "chapter-01"
LESSON = "lesson-01"
KEY = (COURSE, TERM, CHAPTER, LESSON)

SNAPSHOT = "1234567890abcdef1234567890abcdef12345678"

CLEAN_SECURITY = {
    "hasScript": False,
    "hasForeignObject": False,
    "hasEventHandlers": False,
    "hasJavascriptUri": False,
    "hasExternalHttpRef": False,
    "hasDataUri": False,
    "hasEmbeddedImage": False,
    "hasExternalUse": False,
    "hasIframeEmbedObject": False,
    "hasStyleImport": False,
    "findings": [],
}

SECURITY_PAYLOADS = (
    ("hasScript", "<script>1</script>", "script element"),
    ("hasForeignObject", '<foreignObject width="10" height="10"/>', "foreignObject"),
    ("hasEventHandlers", '<rect onclick="void(0)"/>', "event handler"),
    ("hasJavascriptUri", '<a href="javascript:void(0)"/>', "javascript:"),
    ("hasExternalHttpRef", '<rect fill="url(https://example.com/a)"/>', "http"),
    ("hasDataUri", '<rect fill="url(data:image/png;base64,AA)"/>', "data:"),
    ("hasEmbeddedImage", '<image width="10" height="10"/>', "image element"),
    ("hasExternalUse", '<use href="other.svg#anchor"/>', "external file"),
    ("hasIframeEmbedObject", '<object type="text/plain"/>', "iframe, embed or object"),
    ("hasStyleImport", "<style>@import url(other.css);</style>", "@import"),
)


def svg_bytes(payload=""):
    """Return a minimal well formed SVG document carrying an optional payload."""
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" '
        'viewBox="0 0 1080 1350">' + payload + "</svg>"
    ).encode("utf-8")


def default_assets():
    """Return two distinct, security clean assets for a valid lesson."""
    return {
        "page-001.svg": svg_bytes('<rect width="10" height="10"/>'),
        "page-002.svg": svg_bytes('<rect width="20" height="20"/>'),
    }


def page_entry(name, order, raw):
    """Return one manifest page entry describing the given bytes."""
    return {
        "id": name[: -len(".svg")],
        "file": name,
        "sourceFileName": name,
        "order": order,
        "role": "opening" if order == 1 else "content",
        "sha256": hashlib.sha256(raw).hexdigest(),
        "bytes": len(raw),
        "width": "1080",
        "height": "1350",
        "viewBox": "0 0 1080 1350",
        "encoding": "utf-8",
        "xmlWellFormed": True,
        "textElementCount": 0,
        "fontsReferenced": ["Tahoma"],
        "security": dict(CLEAN_SECURITY),
        "descriptionAr": "صفحة اختبارية",
        }


def default_manifest(assets):
    """Return a fully valid schema version 2 manifest for the given assets."""
    pages = [
        page_entry(name, order, assets[name])
        for order, name in enumerate(sorted(assets), start=1)
    ]
    return {
        "schemaVersion": 2,
        "course": COURSE,
        "term": TERM,
        "chapter": CHAPTER,
        "lesson": LESSON,
        "displayTitleAr": "درس اختباري",
        "displayTitleEn": "Test lesson",
        "permanentPath": "/courses/{0}/{1}/{2}/{3}/".format(*KEY),
        "assetBasePath": "/assets/lessons/{0}/{1}/{2}/{3}/".format(*KEY),
        "status": "published",
        "inventoryDate": "2026-08-27",
        "checksumAlgorithm": "sha256",
        "declaredPageCount": len(pages),
        "custodyRepository": "parmaga-content",
        "custodySnapshot": SNAPSHOT,
        "notes": [],
        "pages": pages,
    }


def sync_page(manifest, index, raw):
    """Point one manifest page entry at the real size and checksum of raw."""
    manifest["pages"][index]["bytes"] = len(raw)
    manifest["pages"][index]["sha256"] = hashlib.sha256(raw).hexdigest()


class VerifyLessonTestCase(unittest.TestCase):
    """Shared fixture helpers. Every case gets its own temporary repository."""

    def setUp(self):
        self.root = tempfile.mkdtemp(prefix="parmaga-verify-")
        self.addCleanup(shutil.rmtree, self.root, True)

    def manifest_dir(self, key=KEY):
        return os.path.join(self.root, "docs", "content", "manifests", *key[:3])

    def manifest_path(self, key=KEY):
        return os.path.join(self.manifest_dir(key), key[3] + ".json")

    def asset_dir(self, key=KEY):
        return os.path.join(self.root, "assets", "lessons", *key)

    def write_manifest_bytes(self, raw, key=KEY):
        os.makedirs(self.manifest_dir(key), exist_ok=True)
        with open(self.manifest_path(key), "wb") as handle:
            handle.write(raw)

    def write_manifest(self, manifest, key=KEY):
        raw = json.dumps(manifest, ensure_ascii=False, indent=2).encode("utf-8")
        self.write_manifest_bytes(raw, key)

    def write_assets(self, assets, key=KEY):
        os.makedirs(self.asset_dir(key), exist_ok=True)
        for name, raw in assets.items():
            with open(os.path.join(self.asset_dir(key), name), "wb") as handle:
                handle.write(raw)

    def write_lesson(self, manifest=None, assets=None, key=KEY):
        if assets is None:
            assets = default_assets()
        if manifest is None:
            manifest = default_manifest(assets)
        self.write_manifest(manifest, key)
        self.write_assets(assets, key)
        return manifest, assets

    def run_tool(self, *args):
        """Run the tool in process and return (exit code, captured stdout)."""
        buffer = io.StringIO()
        with contextlib.redirect_stdout(buffer):
            code = verify_lesson.main(list(args))
        return code, buffer.getvalue()

    def assert_fails(self, needle=None):
        code, output = self.run_tool(self.root)
        self.assertEqual(code, 1, msg="expected verification failure\n" + output)
        self.assertIn("RESULT: FAIL", output)
        if needle is not None:
            self.assertIn(needle, output)
        return output

    def assert_passes(self):
        code, output = self.run_tool(self.root)
        self.assertEqual(code, 0, msg="expected success\n" + output)
        self.assertIn("RESULT: PASS", output)
        return output


class TestCandidateDiscovery(VerifyLessonTestCase):
    """Item 1 and the rule that the current version 1 manifest is not published."""

    def test_zero_candidates_is_an_explicit_success(self):
        output = self.assert_passes()
        self.assertIn("Publication candidates: 0", output)
        self.assertIn("candidate count is zero", output)

    def test_inventoried_version_one_manifest_is_not_a_candidate(self):
        manifest = default_manifest(default_assets())
        manifest["schemaVersion"] = 1
        manifest["status"] = "inventoried"
        del manifest["custodyRepository"]
        del manifest["custodySnapshot"]
        manifest["pages"] = []
        manifest["declaredPageCount"] = 0
        self.write_manifest(manifest)
        output = self.assert_passes()
        self.assertIn("Publication candidates: 0", output)

    def test_assets_without_a_manifest_are_a_candidate_and_fail(self):
        self.write_assets(default_assets())
        self.assert_fails("manifest is missing")

    def test_svg_outside_the_legal_structure_fails(self):
        os.makedirs(os.path.join(self.root, "assets", "lessons"), exist_ok=True)
        with open(os.path.join(self.root, "assets", "lessons", "stray.svg"), "wb") as fh:
            fh.write(svg_bytes())
        self.assert_fails("canonical path")

    def test_current_repository_passes_the_official_invocation(self):
        code, output = self.run_tool(REPO_ROOT)
        self.assertEqual(code, 0, msg=output)


class TestUsageAndEnvironment(VerifyLessonTestCase):
    """Items 2 and 3."""

    def test_missing_argument_exits_two(self):
        code, output = self.run_tool()
        self.assertEqual(code, 2)
        self.assertIn("USAGE ERROR", output)

    def test_extra_argument_exits_two(self):
        code, output = self.run_tool(self.root, self.root)
        self.assertEqual(code, 2)
        self.assertIn("USAGE ERROR", output)

    def test_flag_argument_exits_two(self):
        code, output = self.run_tool("--help")
        self.assertEqual(code, 2)
        self.assertIn("USAGE ERROR", output)

    def test_missing_root_exits_two(self):
        code, output = self.run_tool(os.path.join(self.root, "absent"))
        self.assertEqual(code, 2)
        self.assertIn("ENVIRONMENT ERROR", output)

    def test_root_that_is_a_file_exits_two(self):
        target = os.path.join(self.root, "a-file")
        with open(target, "wb") as handle:
            handle.write(b"x")
        code, output = self.run_tool(target)
        self.assertEqual(code, 2)
        self.assertIn("not a directory", output)

    def test_every_run_prints_a_final_summary(self):
        for args in ((), (self.root,), (os.path.join(self.root, "absent"),)):
            with self.subTest(args=args):
                _code, output = self.run_tool(*args)
                self.assertIn("RESULT:", output)


class TestValidLesson(VerifyLessonTestCase):
    """Item 4."""

    def test_small_valid_version_two_lesson_passes(self):
        self.write_lesson()
        output = self.assert_passes()
        self.assertIn("Publication candidates: 1", output)
        self.assertIn("All checks passed", output)

    def test_lesson_with_many_pages_passes(self):
        assets = {
            "page-{0:03d}.svg".format(order): svg_bytes(
                '<rect width="{0}" height="10"/>'.format(order)
            )
            for order in range(1, 6)
        }
        self.write_lesson(assets=assets)
        self.assert_passes()


class TestManifestIntegrity(VerifyLessonTestCase):
    """Items 5, 6, 7, 8, 9, 10, 11, 12, 13 and 14."""

    def test_invalid_json_fails(self):
        self.write_manifest_bytes(b"{ not json")
        self.write_assets(default_assets())
        self.assert_fails("invalid JSON")

    def test_utf8_bom_fails(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        raw = json.dumps(manifest, ensure_ascii=False).encode("utf-8")
        self.write_manifest_bytes(b"\xef\xbb\xbf" + raw)
        self.write_assets(assets)
        self.assert_fails("BOM")

    def test_schema_version_one_candidate_fails(self):
        manifest, _assets = self.write_lesson()
        manifest["schemaVersion"] = 1
        self.write_manifest(manifest)
        self.assert_fails("schemaVersion")

    def test_status_must_be_published(self):
        manifest, _assets = self.write_lesson()
        manifest["status"] = "inventoried"
        self.write_manifest(manifest)
        self.assert_fails("status")

    def test_checksum_algorithm_must_be_sha256(self):
        manifest, _assets = self.write_lesson()
        manifest["checksumAlgorithm"] = "sha1"
        self.write_manifest(manifest)
        self.assert_fails("checksumAlgorithm")

    def test_each_missing_lesson_field_is_reported(self):
        for field, _kind in verify_lesson.LESSON_FIELDS:
            with self.subTest(field=field):
                manifest, _assets = self.write_lesson()
                del manifest[field]
                self.write_manifest(manifest)
                output = self.assert_fails()
                self.assertIn(field, output)

    def test_each_null_lesson_field_is_reported(self):
        for field, _kind in verify_lesson.LESSON_FIELDS:
            with self.subTest(field=field):
                manifest, _assets = self.write_lesson()
                manifest[field] = None
                self.write_manifest(manifest)
                self.assert_fails("must not be null")

    def test_each_missing_page_field_is_reported(self):
        for field, _kind in verify_lesson.PAGE_FIELDS:
            with self.subTest(field=field):
                manifest, _assets = self.write_lesson()
                del manifest["pages"][0][field]
                self.write_manifest(manifest)
                output = self.assert_fails()
                self.assertIn(field, output)

    def test_wrong_value_type_is_reported(self):
        manifest, _assets = self.write_lesson()
        manifest["declaredPageCount"] = "2"
        manifest["pages"][0]["bytes"] = "many"
        self.write_manifest(manifest)
        output = self.assert_fails("expected integer")
        self.assertIn("found string", output)

    def test_custody_repository_must_be_a_bare_name(self):
        manifest, _assets = self.write_lesson()
        manifest["custodyRepository"] = "https://github.com/owner/parmaga-content"
        self.write_manifest(manifest)
        self.assert_fails("bare repository name")

    def test_custody_repository_value_is_checked(self):
        manifest, _assets = self.write_lesson()
        manifest["custodyRepository"] = "some-other-repo"
        self.write_manifest(manifest)
        self.assert_fails("custodyRepository")

    def test_custody_snapshot_format_is_checked(self):
        for value in ("abc", "A" * 40, "g" * 40, "1234567890abcdef" * 3):
            with self.subTest(value=value):
                manifest, _assets = self.write_lesson()
                manifest["custodySnapshot"] = value
                self.write_manifest(manifest)
                self.assert_fails("40 lowercase hexadecimal")

    def test_identifiers_must_match_the_manifest_path(self):
        for field in ("course", "term", "chapter", "lesson"):
            with self.subTest(field=field):
                manifest, _assets = self.write_lesson()
                manifest[field] = "wrong-value"
                self.write_manifest(manifest)
                self.assert_fails("match the manifest path")

    def test_permanent_path_mismatch_fails(self):
        manifest, _assets = self.write_lesson()
        manifest["permanentPath"] = "/courses/wrong/"
        self.write_manifest(manifest)
        self.assert_fails("permanentPath")

    def test_asset_base_path_mismatch_fails(self):
        manifest, _assets = self.write_lesson()
        manifest["assetBasePath"] = "/assets/lessons/wrong/"
        self.write_manifest(manifest)
        self.assert_fails("assetBasePath")

    def test_declared_page_count_mismatch_fails(self):
        manifest, _assets = self.write_lesson()
        manifest["declaredPageCount"] = 7
        self.write_manifest(manifest)
        self.assert_fails("declaredPageCount")


class TestPagesAndNumbering(VerifyLessonTestCase):
    """Items 15, 16, 22 and the opening page rule."""

    def test_numbering_gap_fails(self):
        assets = {
            "page-001.svg": svg_bytes('<rect width="1" height="1"/>'),
            "page-002.svg": svg_bytes('<rect width="2" height="2"/>'),
            "page-004.svg": svg_bytes('<rect width="4" height="4"/>'),
        }
        manifest = default_manifest(assets)
        manifest["pages"][2]["order"] = 4
        self.write_lesson(manifest, assets)
        self.assert_fails("contiguous")

    def test_duplicate_order_fails(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][1]["order"] = 1
        self.write_lesson(manifest, assets)
        self.assert_fails("declared more than once")

    def test_missing_opening_page_fails(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][0]["role"] = "content"
        self.write_lesson(manifest, assets)
        self.assert_fails("role 'opening'")

    def test_two_opening_pages_fail(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][1]["role"] = "opening"
        self.write_lesson(manifest, assets)
        self.assert_fails("role 'opening'")

    def test_unknown_role_fails(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][1]["role"] = "summary"
        self.write_lesson(manifest, assets)
        self.assert_fails("expected one of")

    def test_illegal_file_name_fails(self):
        assets = {"final.svg": svg_bytes('<rect width="1" height="1"/>')}
        manifest = default_manifest(assets)
        self.write_lesson(manifest, assets)
        self.assert_fails("does not follow page-<NNN>.svg")

    def test_file_name_must_match_its_order(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][1]["order"] = 3
        manifest["pages"].append(
            page_entry("page-002.svg", 2, assets["page-002.svg"])
        )
        manifest["declaredPageCount"] = 3
        self.write_lesson(manifest, assets)
        self.assert_fails("for order")

    def test_duplicate_checksum_fails(self):
        raw = svg_bytes('<rect width="9" height="9"/>')
        assets = {"page-001.svg": raw, "page-002.svg": raw}
        self.write_lesson(default_manifest(assets), assets)
        self.assert_fails("more than one page")

    def test_canonical_page_file_padding_and_overflow(self):
        self.assertEqual(verify_lesson.canonical_page_file(1), "page-001.svg")
        self.assertEqual(verify_lesson.canonical_page_file(27), "page-027.svg")
        self.assertEqual(verify_lesson.canonical_page_file(100), "page-100.svg")
        self.assertEqual(verify_lesson.canonical_page_file(999), "page-999.svg")
        self.assertEqual(verify_lesson.canonical_page_file(1000), "page-1000.svg")
        self.assertEqual(verify_lesson.canonical_page_file(1234), "page-1234.svg")
        for name in ("page-001.svg", "page-999.svg", "page-1000.svg"):
            self.assertTrue(verify_lesson.PAGE_FILE_RE.match(name), name)
        for name in ("page-1.svg", "page-01.svg", "final.svg", "page-001.SVG"):
            self.assertIsNone(verify_lesson.PAGE_FILE_RE.match(name), name)


class TestAssetsOnDisk(VerifyLessonTestCase):
    """Items 17, 18, 19, 20, 21, 23, 24 and 25."""

    def test_missing_asset_file_fails(self):
        _manifest, _assets = self.write_lesson()
        os.remove(os.path.join(self.asset_dir(), "page-002.svg"))
        self.assert_fails("declared asset file is missing")

    def test_undeclared_extra_svg_fails(self):
        _manifest, assets = self.write_lesson()
        with open(os.path.join(self.asset_dir(), "page-003.svg"), "wb") as handle:
            handle.write(svg_bytes('<rect width="3" height="3"/>'))
        self.assert_fails("not declared in the manifest")

    def test_symbolic_link_asset_fails(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        self.write_manifest(manifest)
        os.makedirs(self.asset_dir(), exist_ok=True)
        outside = os.path.join(self.root, "outside.svg")
        with open(outside, "wb") as handle:
            handle.write(assets["page-001.svg"])
        with open(os.path.join(self.asset_dir(), "page-002.svg"), "wb") as handle:
            handle.write(assets["page-002.svg"])
        link = os.path.join(self.asset_dir(), "page-001.svg")
        try:
            os.symlink(outside, link)
        except (OSError, NotImplementedError, AttributeError) as error:
            self.skipTest("symbolic links unavailable: {0}".format(error))
        self.assert_fails("symbolic links are not allowed")

    def test_paths_outside_the_root_are_rejected(self):
        inside = os.path.join(self.root, "assets", "lessons", "a.svg")
        outside = os.path.join(self.root, "..", "escaped.svg")
        self.assertTrue(verify_lesson.is_inside_root(self.root, inside))
        self.assertTrue(verify_lesson.is_inside_root(self.root, self.root))
        self.assertFalse(verify_lesson.is_inside_root(self.root, outside))

    def test_size_mismatch_fails(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][0]["bytes"] = 12
        self.write_lesson(manifest, assets)
        self.assert_fails("bytes, file is")

    def test_checksum_mismatch_fails(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][0]["sha256"] = "0" * 64
        self.write_lesson(manifest, assets)
        self.assert_fails("file hashes to")

    def test_malformed_checksum_field_fails(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][0]["sha256"] = "NOTAHASH"
        self.write_lesson(manifest, assets)
        self.assert_fails("64 lowercase hexadecimal")

    def test_empty_asset_fails(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        assets["page-001.svg"] = b""
        sync_page(manifest, 0, b"")
        self.write_lesson(manifest, assets)
        self.assert_fails()

    def test_malformed_xml_fails(self):
        raw = b'<svg xmlns="http://www.w3.org/2000/svg"><rect></svg>'
        manifest, assets = default_manifest(default_assets()), default_assets()
        assets["page-001.svg"] = raw
        sync_page(manifest, 0, raw)
        self.write_lesson(manifest, assets)
        self.assert_fails("XML is not well formed")

    def test_declared_xml_well_formed_must_agree(self):
        raw = b'<svg xmlns="http://www.w3.org/2000/svg"><rect></svg>'
        manifest, assets = default_manifest(default_assets()), default_assets()
        assets["page-001.svg"] = raw
        sync_page(manifest, 0, raw)
        manifest["pages"][0]["xmlWellFormed"] = False
        self.write_lesson(manifest, assets)
        output = self.assert_fails("XML is not well formed")
        self.assertNotIn("xmlWellFormed | manifest declares", output)

    def test_root_element_must_be_svg(self):
        raw = b'<notsvg width="1080" height="1350" viewBox="0 0 1080 1350"/>'
        manifest, assets = default_manifest(default_assets()), default_assets()
        assets["page-001.svg"] = raw
        sync_page(manifest, 0, raw)
        self.write_lesson(manifest, assets)
        self.assert_fails("root element must be svg")

    def test_geometry_mismatch_fails(self):
        for attribute, value in (
            ("width", "800"),
            ("height", "600"),
            ("viewBox", "0 0 800 600"),
        ):
            with self.subTest(attribute=attribute):
                manifest, assets = default_manifest(default_assets()), default_assets()
                manifest["pages"][0][attribute] = value
                self.write_lesson(manifest, assets)
                self.assert_fails("root element has")


class TestSecurityScanning(VerifyLessonTestCase):
    """Items 26 and 27, covering the ten conditions of ADR-0005 section 9."""

    def test_each_security_condition_blocks_publication(self):
        for flag_key, payload, needle in SECURITY_PAYLOADS:
            with self.subTest(condition=flag_key):
                raw = svg_bytes(payload)
                manifest, assets = default_manifest(default_assets()), default_assets()
                assets["page-001.svg"] = raw
                sync_page(manifest, 0, raw)
                self.write_lesson(manifest, assets)
                output = self.assert_fails("security." + flag_key)
                self.assertIn("publication is blocked", output)
                self.assertIn(needle, output)

    def test_declaring_the_finding_does_not_permit_it(self):
        raw = svg_bytes("<script>1</script>")
        manifest, assets = default_manifest(default_assets()), default_assets()
        assets["page-001.svg"] = raw
        sync_page(manifest, 0, raw)
        manifest["pages"][0]["security"]["hasScript"] = True
        self.write_lesson(manifest, assets)
        self.assert_fails("publication is blocked")

    def test_security_flag_inconsistency_is_reported(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][0]["security"]["hasScript"] = True
        self.write_lesson(manifest, assets)
        self.assert_fails("scanning the bytes gives")

    def test_non_empty_findings_fail(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][0]["security"]["findings"] = ["accepted with justification"]
        self.write_lesson(manifest, assets)
        self.assert_fails("must be empty for a published asset")

    def test_missing_findings_is_reported(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        del manifest["pages"][0]["security"]["findings"]
        self.write_lesson(manifest, assets)
        self.assert_fails("findings")

    def test_clean_assets_produce_no_security_error(self):
        self.write_lesson()
        output = self.assert_passes()
        self.assertNotIn("security", output)


class TestToolBehaviour(VerifyLessonTestCase):
    """Items 28, 29 and 30."""

    def test_error_order_is_stable_and_sorted(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][0]["bytes"] = 5
        manifest["pages"][1]["sha256"] = "0" * 64
        manifest["permanentPath"] = "/courses/wrong/"
        self.write_lesson(manifest, assets)
        with open(os.path.join(self.asset_dir(), "page-003.svg"), "wb") as handle:
            handle.write(svg_bytes('<rect width="3" height="3"/>'))
        first_code, first = self.run_tool(self.root)
        second_code, second = self.run_tool(self.root)
        self.assertEqual(first_code, 1)
        self.assertEqual(first_code, second_code)
        self.assertEqual(first, second)
        errors = [line for line in first.splitlines() if line.startswith("ERROR |")]
        self.assertGreater(len(errors), 1)
        self.assertEqual(errors, sorted(errors))

    def test_input_files_are_never_modified(self):
        self.write_lesson()
        with open(os.path.join(self.asset_dir(), "page-003.svg"), "wb") as handle:
            handle.write(svg_bytes('<rect width="3" height="3"/>'))

        def snapshot():
            state = {}
            for dirpath, dirnames, filenames in os.walk(self.root):
                dirnames.sort()
                for name in sorted(filenames):
                    path = os.path.join(dirpath, name)
                    with open(path, "rb") as handle:
                        state[path] = (handle.read(), os.stat(path).st_mtime_ns)
            return state

        before = snapshot()
        self.run_tool(self.root)
        self.assertEqual(before, snapshot())

    def test_command_line_invocation_matches_in_process_behaviour(self):
        self.write_lesson()
        expected_code, expected_output = self.run_tool(self.root)
        completed = subprocess.run(
            [sys.executable, TOOL_PATH, self.root],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        self.assertEqual(completed.returncode, expected_code)
        self.assertEqual(completed.stdout.decode("utf-8"), expected_output)
        self.assertEqual(completed.stderr.decode("utf-8"), "")

    def test_command_line_failure_exit_code_is_one(self):
        manifest, assets = default_manifest(default_assets()), default_assets()
        manifest["pages"][0]["sha256"] = "0" * 64
        self.write_lesson(manifest, assets)
        completed = subprocess.run(
            [sys.executable, TOOL_PATH, self.root],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        self.assertEqual(completed.returncode, 1)
        self.assertIn(b"RESULT: FAIL", completed.stdout)

    def test_command_line_usage_exit_code_is_two(self):
        completed = subprocess.run(
            [sys.executable, TOOL_PATH],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        self.assertEqual(completed.returncode, 2)
        self.assertIn(b"USAGE ERROR", completed.stdout)


if __name__ == "__main__":
    unittest.main()
