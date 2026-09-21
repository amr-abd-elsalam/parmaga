"""Tests for the browser-baseline serving scope (defect B2).

Standard library only, as required by ADR-0006 section 2. Every fixture is
created inside a temporary directory and removed automatically, so no file
is ever added to the repository by these tests.
"""

from __future__ import annotations

import http.client
import inspect
import os
import shutil
import sys
import tempfile
import unittest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOL_PATH = os.path.join(REPO_ROOT, "tools", "browser_baseline.py")

sys.path.insert(0, os.path.join(REPO_ROOT, "tools"))

import browser_baseline  # noqa: E402  (path is prepared immediately above)

INDEX_MARKER = "parmaga-index-marker"
ASSET_MARKER = "parmaga-asset-marker"
SECRET_MARKER = "parmaga-secret-marker"


class HiddenSegmentTests(unittest.TestCase):
    """hidden_segment وحدها: بلا خادم ولا منفذ ولا قرص."""

    root = os.path.join(os.sep, "srv", "parmaga")

    def segment(self, *parts):
        target = os.path.join(self.root, *parts) if parts else self.root
        return browser_baseline.QuietHandler.hidden_segment(self.root, target)

    def test_plain_nested_file_is_allowed(self):
        self.assertEqual(self.segment("courses", "lesson-01", "index.html"), "")

    def test_asset_name_containing_a_dot_is_allowed(self):
        self.assertEqual(self.segment("assets", "page-001.svg"), "")

    def test_root_itself_is_allowed(self):
        self.assertEqual(self.segment(), "")

    def test_git_directory_is_blocked(self):
        self.assertEqual(self.segment(".git", "config"), ".git")

    def test_nested_hidden_directory_is_blocked(self):
        self.assertEqual(self.segment("courses", ".hidden", "note.txt"), ".hidden")

    def test_dotenv_file_is_blocked(self):
        self.assertEqual(self.segment(".env"), ".env")

    def test_target_outside_root_is_blocked(self):
        outside = os.path.join(os.sep, "srv", "other", "secret.txt")
        self.assertEqual(
            browser_baseline.QuietHandler.hidden_segment(self.root, outside),
            os.pardir,
        )

    def test_empty_target_is_blocked(self):
        self.assertEqual(
            browser_baseline.QuietHandler.hidden_segment(self.root, ""),
            os.pardir,
        )


class ServedScopeTests(unittest.TestCase):
    """خادم حيّ من start_server على دليل مؤقت خارج شجرة العمل."""

    def setUp(self):
        self.root = os.path.realpath(tempfile.mkdtemp(prefix="parmaga-"))
        self.addCleanup(shutil.rmtree, self.root, True)
        self.write("index.html", INDEX_MARKER)
        self.write(os.path.join("assets", "page-001.svg"), ASSET_MARKER)
        self.write(os.path.join("chapter-01", "notes.txt"), "plain body")
        self.write(os.path.join(".git", "config"), SECRET_MARKER)
        self.write(".env", SECRET_MARKER)
        self.httpd = browser_baseline.start_server(self.root)
        self.addCleanup(self.httpd.server_close)
        self.addCleanup(self.httpd.shutdown)
        self.port = self.httpd.server_address[1]

    def write(self, rel, text):
        path = os.path.join(self.root, rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(text)

    def get(self, target):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        try:
            conn.request("GET", target)
            response = conn.getresponse()
            return response.status, response.read().decode("utf-8", "replace")
        finally:
            conn.close()

    def test_root_path_still_serves_index_html(self):
        status, body = self.get("/")
        self.assertEqual(status, 200)
        self.assertIn(INDEX_MARKER, body)

    def test_index_html_is_served_by_explicit_path(self):
        status, body = self.get("/index.html")
        self.assertEqual(status, 200)
        self.assertIn(INDEX_MARKER, body)

    def test_asset_with_a_dot_in_its_name_is_served(self):
        status, body = self.get("/assets/page-001.svg")
        self.assertEqual(status, 200)
        self.assertIn(ASSET_MARKER, body)

    def test_directory_listing_is_disabled(self):
        status, body = self.get("/chapter-01/")
        self.assertEqual(status, 404)
        self.assertNotIn("notes.txt", body)

    def test_git_directory_is_not_served(self):
        status, body = self.get("/.git/config")
        self.assertEqual(status, 404)
        self.assertNotIn(SECRET_MARKER, body)

    def test_dotenv_file_is_not_served(self):
        status, body = self.get("/.env")
        self.assertEqual(status, 404)
        self.assertNotIn(SECRET_MARKER, body)

    def test_percent_encoded_hidden_segment_is_not_served(self):
        status, body = self.get("/%2Egit/config")
        self.assertEqual(status, 404)
        self.assertNotIn(SECRET_MARKER, body)

    def test_server_is_bound_to_the_loopback_interface(self):
        self.assertEqual(self.httpd.server_address[0], "127.0.0.1")


class ProfileCleanupTests(unittest.TestCase):
    """B1: main() must remove the temp profile root so it does not leak."""

    def test_main_removes_profile_root(self):
        source = inspect.getsource(browser_baseline.main)
        normalized = source.replace("\r\n", "\n")
        self.assertIn(
            "shutil.rmtree(profile_root",
            normalized,
            "main() must remove profile_root so temp dirs do not leak (B1)",
        )


if __name__ == "__main__":
    unittest.main()
