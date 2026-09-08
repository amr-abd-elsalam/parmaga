#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Browser baseline harness — PR 2.

يخدم جِذر المستودع على 127.0.0.1 بمكتبة Python القياسية وحدها، ويستدعي متصفح
الصورة المثبَّت مسبقًا عبر subprocess بأعلام headless الموثَّقة، ثم يقيس أربعة
أشياء ويطبع مخرجًا يصلح دليلًا في الدفتر.

الحدود المنقولة عن الـhandoff نقلًا عن ADR-0015:
  - الحدّ الأول: بلا package manifest وبلا تثبيت أي حزمة. مكتبة قياسية فقط.
  - §4: بلا عميل WebSocket وبلا DevTools Protocol يدويًا. أعلام CLI فقط.
  - الحدّ السابع: assertions حاجبة على حضور النصّ وعلى عدد مراجع SVG فقط.
    اللقطة والطباعة artifacts للفحص البشري ولا تحجبان.
  - بلا شبكة خارجية: 127.0.0.1 وحده، ولا CDN، ولا build step.

حالات الخروج:
  0  كل الـassertions الحاجبة نجحت.
  1  فشل assertion حاجبة واحدة أو أكثر — فشل مقيس يُقيَّد ولا يُخفى.
  2  صفحة الدرس غير موجودة على القرص.
  3  لا متصفح في الصورة — لا يُفترض مسار.
"""

import argparse
import functools
import hashlib
import http.server
import os
import re
import subprocess
import sys
import tempfile
import threading

LESSON_URL_PATH = (
    "/courses/programming-ai-baccalaureate-2/term-1/chapter-01/lesson-01/index.html"
)
EXPECTED_SVG_REFS = 22

# مرساتان مقيستان حرفيًا من بايتات صفحة الدرس، لا مفترضتان.
ARABIC_ANCHOR = "تطور تكنولوجيا المعلومات والتحول الاجتماعي"
LATIN_ANCHOR = "Augmented Reality and Virtual Reality"

SVG_REF_RE = re.compile(r"page-\d{3}\.svg")

PHONE_WINDOW = "412,892"
NAV_TIMEOUT_MS = 20000
VIRTUAL_TIME_BUDGET_MS = 8000
PROC_TIMEOUT_S = 90

PNG_MAGIC = b"\x89PNG\r\n\x1a\n"
PDF_MAGIC = b"%PDF"

BROWSER_CANDIDATES = (
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "microsoft-edge",
    "microsoft-edge-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
    "/opt/google/chrome/chrome",
    "/opt/microsoft/msedge/msedge",
)

HEADLESS_MODES = ("--headless=new", "--headless")
SANDBOX_MODES = (False, True)


def which(name):
    """يبحث في PATH بلا الاعتماد على shutil.which لملف مطلق."""
    for directory in os.environ.get("PATH", "").split(os.pathsep):
        if not directory:
            continue
        path = os.path.join(directory, name)
        if os.path.isfile(path) and os.access(path, os.X_OK):
            return path
    return None


def find_browser():
    """يكتشف المتصفح بترتيب محاولات. يعيد (path, source) أو (None, tried)."""
    tried = []
    override = os.environ.get("PARMAGA_BROWSER", "").strip()
    if override:
        tried.append(override + " [PARMAGA_BROWSER]")
        if os.path.isfile(override) and os.access(override, os.X_OK):
            return override, "PARMAGA_BROWSER"
    for candidate in BROWSER_CANDIDATES:
        tried.append(candidate)
        if os.sep in candidate:
            if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
                return candidate, "absolute path"
        else:
            found = which(candidate)
            if found:
                return found, "PATH"
    return None, tried


def browser_version(browser):
    try:
        proc = subprocess.run(
            [browser, "--version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=30,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return "unreadable: %s" % exc
    return proc.stdout.decode("utf-8", "replace").strip() or "empty --version output"


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler بلا ضجيج على stderr."""

    def log_message(self, fmt, *args):
        return


def start_server(root):
    handler = functools.partial(QuietHandler, directory=root)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd


def build_command(browser, headless, no_sandbox, profile_dir, task_flags, url):
    flags = [
        headless,
        "--disable-gpu",
        "--hide-scrollbars",
        "--disable-extensions",
        "--disable-dev-shm-usage",
        "--user-data-dir=" + profile_dir,
        "--timeout=%d" % NAV_TIMEOUT_MS,
        "--virtual-time-budget=%d" % VIRTUAL_TIME_BUDGET_MS,
    ]
    if no_sandbox:
        flags.append("--no-sandbox")
    return [browser] + flags + list(task_flags) + [url]


def combos(preferred):
    ordered = []
    if preferred is not None:
        ordered.append(preferred)
    for headless in HEADLESS_MODES:
        for no_sandbox in SANDBOX_MODES:
            pair = (headless, no_sandbox)
            if pair not in ordered:
                ordered.append(pair)
    return ordered


def invoke(browser, task_flags, url, profile_root, expect_stdout, preferred=None):
    """يجرّب مصفوفة (headless mode x sandbox) ويعيد أول نجاح مع سجل المحاولات."""
    attempts = []
    for headless, no_sandbox in combos(preferred):
        profile_dir = tempfile.mkdtemp(prefix="profile-", dir=profile_root)
        cmd = build_command(
            browser, headless, no_sandbox, profile_dir, task_flags, url
        )
        try:
            proc = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=PROC_TIMEOUT_S,
            )
            code = proc.returncode
            out = proc.stdout
            err = proc.stderr
        except subprocess.TimeoutExpired:
            code, out, err = 124, b"", b"subprocess timeout"
        except OSError as exc:
            code, out, err = 125, b"", str(exc).encode("utf-8")
        tail = err.decode("utf-8", "replace").strip().replace("\n", " | ")[-300:]
        attempts.append(
            "  attempt headless=%s no_sandbox=%s -> exit=%d stdout_bytes=%d stderr_tail=%s"
            % (headless, no_sandbox, code, len(out), tail or "(empty)")
        )
        if code == 0 and (not expect_stdout or len(out) > 0):
            return True, (headless, no_sandbox), out, attempts
    return False, None, b"", attempts


def ncr_decimal(text):
    return "".join("&#%d;" % ord(char) for char in text)


def ncr_hex(text):
    return "".join("&#x%x;" % ord(char) for char in text)


def find_text(dom, text):
    """يعيد شكل الحضور أو None. يقبل التسلسل بمراجع رقمية لأن ذلك حضور لا غياب."""
    if text in dom:
        return "literal"
    if ncr_decimal(text) in dom:
        return "ncr-decimal"
    if ncr_hex(text) in dom:
        return "ncr-hex"
    return None


def sha256_of(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def check_artifact(path, magic):
    if not os.path.isfile(path):
        return False, 0, "", "file not produced"
    size = os.path.getsize(path)
    if size == 0:
        return False, 0, "", "file is empty"
    with open(path, "rb") as handle:
        head = handle.read(len(magic))
    if head != magic:
        return False, size, sha256_of(path), "magic mismatch: %r" % head
    return True, size, sha256_of(path), "ok"


def main(argv):
    parser = argparse.ArgumentParser(
        description="Browser baseline harness — stdlib only, CLI flags only."
    )
    parser.add_argument("root", nargs="?", default=".", help="repository root to serve")
    parser.add_argument(
        "--out",
        default=os.path.join(tempfile.gettempdir(), "parmaga-browser-baseline"),
        help="directory for artifacts (kept outside the repository tree)",
    )
    args = parser.parse_args(argv[1:])

    root = os.path.abspath(args.root)
    out_dir = os.path.abspath(args.out)
    lesson_file = os.path.join(root, *LESSON_URL_PATH.lstrip("/").split("/"))

    print("=== ENVIRONMENT ===")
    print("python            : %s" % sys.version.split()[0])
    print("repository root   : %s" % root)
    print("artifacts dir     : %s" % out_dir)
    print("lesson url path   : %s" % LESSON_URL_PATH)

    if not os.path.isfile(lesson_file):
        print("FAIL: lesson page not found on disk: %s" % lesson_file)
        return 2

    browser, source = find_browser()
    if browser is None:
        print("FAIL: no preinstalled browser found. candidates tried, in order:")
        for candidate in source:
            print("  - %s" % candidate)
        print("set PARMAGA_BROWSER to an absolute executable path to override.")
        return 3

    print("browser path      : %s" % browser)
    print("browser source    : %s" % source)
    print("browser version   : %s" % browser_version(browser))

    os.makedirs(out_dir, exist_ok=True)
    profile_root = tempfile.mkdtemp(prefix="parmaga-browser-profiles-")
    httpd = start_server(root)
    port = httpd.server_address[1]
    url = "http://127.0.0.1:%d%s" % (port, LESSON_URL_PATH)
    print("served origin     : http://127.0.0.1:%d" % port)
    print("target url        : %s" % url)

    dom_path = os.path.join(out_dir, "dump-dom.html")
    shot_path = os.path.join(out_dir, "phone-412x892.png")
    pdf_path = os.path.join(out_dir, "lesson-print.pdf")

    results = []
    blocking_failures = 0

    try:
        print()
        print("=== TASK 1: --dump-dom ===")
        ok, working, dom_bytes, attempts = invoke(
            browser, ["--dump-dom"], url, profile_root, True
        )
        for line in attempts:
            print(line)

        if not ok:
            print("dump-dom produced no usable output on any flag combination")
            results.append(("M1 arabic-text-in-dom", "FAIL", "no dom", True))
            results.append(("M1 latin-text-in-dom", "FAIL", "no dom", True))
            results.append(("M2 svg-refs-in-dom", "FAIL", "no dom", True))
            blocking_failures += 3
        else:
            print("working combination: headless=%s no_sandbox=%s" % working)
            dom = dom_bytes.decode("utf-8", "replace")
            with open(dom_path, "wb") as handle:
                handle.write(dom_bytes)
            print("dom bytes         : %d" % len(dom_bytes))
            print("dom sha256        : %s" % sha256_of(dom_path))

            arabic = find_text(dom, ARABIC_ANCHOR)
            latin = find_text(dom, LATIN_ANCHOR)
            svg_refs = len(SVG_REF_RE.findall(dom))

            results.append(
                (
                    "M1 arabic-text-in-dom",
                    "PASS" if arabic else "FAIL",
                    arabic or "anchor absent",
                    True,
                )
            )
            results.append(
                (
                    "M1 latin-text-in-dom",
                    "PASS" if latin else "FAIL",
                    latin or "anchor absent",
                    True,
                )
            )
            results.append(
                (
                    "M2 svg-refs-in-dom",
                    "PASS" if svg_refs == EXPECTED_SVG_REFS else "FAIL",
                    "%d refs, expected %d" % (svg_refs, EXPECTED_SVG_REFS),
                    True,
                )
            )
            blocking_failures += sum(
                1 for value in (arabic, latin) if not value
            ) + (0 if svg_refs == EXPECTED_SVG_REFS else 1)

        preferred = working if ok else None

        print()
        print("=== TASK 2: --screenshot --window-size=%s ===" % PHONE_WINDOW)
        shot_ok, _, _, attempts = invoke(
            browser,
            ["--screenshot=" + shot_path, "--window-size=" + PHONE_WINDOW],
            url,
            profile_root,
            False,
            preferred,
        )
        for line in attempts:
            print(line)
        valid, size, digest, note = check_artifact(shot_path, PNG_MAGIC)
        print("screenshot        : exit_ok=%s valid_png=%s bytes=%d note=%s"
              % (shot_ok, valid, size, note))
        if digest:
            print("screenshot sha256 : %s" % digest)
        results.append(
            (
                "M3 phone-screenshot",
                "PRODUCED" if valid else "NOT PRODUCED",
                "%d bytes, %s, window %s" % (size, note, PHONE_WINDOW),
                False,
            )
        )

        print()
        print("=== TASK 3: --print-to-pdf --no-pdf-header-footer ===")
        pdf_ok, _, _, attempts = invoke(
            browser,
            ["--print-to-pdf=" + pdf_path, "--no-pdf-header-footer"],
            url,
            profile_root,
            False,
            preferred,
        )
        for line in attempts:
            print(line)
        valid, size, digest, note = check_artifact(pdf_path, PDF_MAGIC)
        print("print-to-pdf      : exit_ok=%s valid_pdf=%s bytes=%d note=%s"
              % (pdf_ok, valid, size, note))
        if digest:
            print("pdf sha256        : %s" % digest)
        results.append(
            (
                "M4 print-to-pdf",
                "PRODUCED" if valid else "NOT PRODUCED",
                "%d bytes, %s" % (size, note),
                False,
            )
        )
    finally:
        httpd.shutdown()
        httpd.server_close()

    print()
    print("=== RESULTS ===")
    for name, verdict, detail, blocking in results:
        print(
            "%-24s : %-12s %-40s [%s]"
            % (name, verdict, detail, "blocking" if blocking else "artifact only")
        )

    print()
    if blocking_failures:
        print("BASELINE: FAIL (%d blocking measurement(s) failed)" % blocking_failures)
        print("this failure is measured evidence. record it in the ledger.")
        return 1
    print("BASELINE: PASS (0 blocking failures)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
