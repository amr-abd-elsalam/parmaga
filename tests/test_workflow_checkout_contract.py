"""Checkout hardening contract for GitHub Actions workflows.

Standard library only, as required by ADR-0006 section 2. The standard
library ships no YAML parser, so this contract is textual and local: it
scans every workflow for actions/checkout steps and requires an explicit
persist-credentials: false inside the same step block. This is weaker
than a structural YAML analysis, and that limit is recorded in the
evidence ledger rather than hidden here.
"""

from __future__ import annotations

import os
import re
import unittest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKFLOW_DIR = os.path.join(REPO_ROOT, ".github", "workflows")

CHECKOUT_RE = re.compile(r"^\s*-?\s*uses:\s*actions/checkout@")
PERSIST_RE = re.compile(r"^\s*persist-credentials:\s*false\s*$")
STEP_START_RE = re.compile(r"^\s*-\s")
WINDOW = 8


def workflow_paths():
    """Return every workflow file path, sorted by file name."""
    names = sorted(
        name
        for name in os.listdir(WORKFLOW_DIR)
        if name.endswith(".yml") or name.endswith(".yaml")
    )
    return [os.path.join(WORKFLOW_DIR, name) for name in names]


def read_lines(path):
    """Read a text file and return its lines without line endings."""
    with open(path, "r", encoding="utf-8") as handle:
        return handle.read().splitlines()


def unhardened_checkouts(lines):
    """Return 1-based line numbers of checkout steps lacking the flag."""
    offenders = []
    for index, line in enumerate(lines):
        if not CHECKOUT_RE.match(line):
            continue
        hardened = False
        for follower in lines[index + 1:index + 1 + WINDOW]:
            if STEP_START_RE.match(follower):
                break
            if PERSIST_RE.match(follower):
                hardened = True
                break
        if not hardened:
            offenders.append(index + 1)
    return offenders


PRE_FIX_SAMPLE = [
    "      - name: Check out the repository",
    "        uses: actions/checkout@11bd719",
    "",
    "      - name: Report runner interpreter",
    "        run: |",
]

POST_FIX_SAMPLE = [
    "      - name: Check out the repository",
    "        uses: actions/checkout@11bd719",
    "        with:",
    "          persist-credentials: false",
    "",
]


class WorkflowInventoryTest(unittest.TestCase):
    """The workflow directory must exist and expose readable workflows."""

    def test_workflow_directory_exists(self):
        self.assertTrue(os.path.isdir(WORKFLOW_DIR))

    def test_workflow_files_are_discovered(self):
        self.assertGreaterEqual(len(workflow_paths()), 1)

    def test_every_workflow_checks_out_the_repository(self):
        for path in workflow_paths():
            with self.subTest(workflow=os.path.basename(path)):
                lines = read_lines(path)
                hits = [line for line in lines if CHECKOUT_RE.match(line)]
                self.assertGreaterEqual(len(hits), 1)


class DetectorSelfTest(unittest.TestCase):
    """The detector must reject the pre-fix shape and accept the fixed one."""

    def test_detector_flags_a_checkout_without_the_flag(self):
        self.assertEqual(unhardened_checkouts(PRE_FIX_SAMPLE), [2])

    def test_detector_accepts_a_checkout_with_the_flag(self):
        self.assertEqual(unhardened_checkouts(POST_FIX_SAMPLE), [])

    def test_detector_ignores_a_flag_owned_by_the_next_step(self):
        lines = list(PRE_FIX_SAMPLE) + ["          persist-credentials: false"]
        self.assertEqual(unhardened_checkouts(lines), [2])

    def test_detector_reports_every_offending_checkout(self):
        lines = list(PRE_FIX_SAMPLE) + list(PRE_FIX_SAMPLE)
        self.assertEqual(unhardened_checkouts(lines), [2, 7])


class CheckoutCredentialContractTest(unittest.TestCase):
    """Every checkout step in every workflow must disable credential reuse."""

    def test_no_workflow_leaves_credentials_persisted(self):
        for path in workflow_paths():
            with self.subTest(workflow=os.path.basename(path)):
                offenders = unhardened_checkouts(read_lines(path))
                self.assertEqual(offenders, [])

    def test_browser_baseline_declares_the_flag_exactly_once(self):
        lines = read_lines(os.path.join(WORKFLOW_DIR, "browser-baseline.yml"))
        hits = [line for line in lines if PERSIST_RE.match(line)]
        self.assertEqual(len(hits), 1)

    def test_verify_lessons_declares_the_flag_exactly_once(self):
        lines = read_lines(os.path.join(WORKFLOW_DIR, "verify-lessons.yml"))
        hits = [line for line in lines if PERSIST_RE.match(line)]
        self.assertEqual(len(hits), 1)


if __name__ == "__main__":
    unittest.main()
