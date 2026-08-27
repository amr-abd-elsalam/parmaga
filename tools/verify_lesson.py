"""Parmaga published-lesson verification tool.

This is the official and only verification implementation for this repository,
as decided by ADR-0006 section 2. It proves that every publication candidate
lesson published inside this repository matches its manifest, that identifiers
and paths obey ADR-0004, and that every published SVG asset passes the ten
security checks of ADR-0005 section 9.

Invocation contract, identical locally and in GitHub Actions:

    python3 tools/verify_lesson.py <repository-root>

Exit codes:

    0  every check completed successfully
    1  a content, manifest or asset verification check failed
    2  a usage or environment error prevented verification from starting

Boundaries. The tool never writes, never repairs, never publishes, never uses
the network, never reads secrets, and never reaches the private custody
repository parmaga-content. Custody fields are checked for shape only; proving
that a custody snapshot exists is a local human step before publication.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import xml.etree.ElementTree as ElementTree

EXIT_OK = 0
EXIT_VERIFICATION_FAILED = 1
EXIT_USAGE = 2

TOOL_TITLE = "Parmaga lesson verification"

MANIFEST_ROOT_PARTS = ("docs", "content", "manifests")
ASSET_ROOT_PARTS = ("assets", "lessons")

REQUIRED_SCHEMA_VERSION = 2
REQUIRED_STATUS = "published"
REQUIRED_CHECKSUM_ALGORITHM = "sha256"
REQUIRED_CUSTODY_REPOSITORY = "parmaga-content"

UTF8_BOM = b"\xef\xbb\xbf"

SHA1_HEX_RE = re.compile(r"\A[0-9a-f]{40}\Z")
SHA256_HEX_RE = re.compile(r"\A[0-9a-f]{64}\Z")
PAGE_FILE_RE = re.compile(r"\Apage-(\d{3,})\.svg\Z")

SVG_ROOT_TAGS = ("svg", "{http://www.w3.org/2000/svg}svg")

# Lesson level fields. ADR-0005 section 7 as amended by ADR-0006 section 3.
LESSON_FIELDS = (
    ("schemaVersion", "integer"),
    ("course", "string"),
    ("term", "string"),
    ("chapter", "string"),
    ("lesson", "string"),
    ("displayTitleAr", "string"),
    ("displayTitleEn", "string"),
    ("permanentPath", "string"),
    ("assetBasePath", "string"),
    ("status", "string"),
    ("inventoryDate", "string"),
    ("checksumAlgorithm", "string"),
    ("declaredPageCount", "integer"),
    ("custodyRepository", "string"),
    ("custodySnapshot", "string"),
    ("notes", "array"),
    ("pages", "array"),
)

# Page level fields. ADR-0005 section 7.
PAGE_FIELDS = (
    ("id", "string"),
    ("file", "string"),
    ("sourceFileName", "string"),
    ("order", "integer"),
    ("role", "string"),
    ("sha256", "string"),
    ("bytes", "integer"),
    ("width", "string"),
    ("height", "string"),
    ("viewBox", "string"),
    ("encoding", "string"),
    ("xmlWellFormed", "boolean"),
    ("textElementCount", "integer"),
    ("fontsReferenced", "array"),
    ("security", "object"),
    ("descriptionAr", "string"),
)

VALID_PAGE_ROLES = ("content", "opening")

# The ten security conditions of ADR-0005 section 9, in the order stated there.
# Each entry is (manifest flag key, human description, compiled pattern).
SECURITY_CHECKS = (
    (
        "hasScript",
        "script element",
        re.compile(r"""<\s*(\w+:)?script\b"""),
    ),
    (
        "hasForeignObject",
        "foreignObject element",
        re.compile(r"""<\s*(\w+:)?foreignObject\b"""),
    ),
    (
        "hasEventHandlers",
        "inline on* event handler attribute",
        re.compile(r"""\son[a-zA-Z]+\s*=\s*["']"""),
    ),
    (
        "hasJavascriptUri",
        "javascript: reference",
        re.compile(r"""javascript:"""),
    ),
    (
        "hasExternalHttpRef",
        "external http or https reference",
        re.compile(
            r"""(?:(?:xlink:href|href|src)\s*=\s*["']\s*https?:)"""
            r"""|(?:url\(\s*["']?\s*https?:)"""
        ),
    ),
    (
        "hasDataUri",
        "data: reference",
        re.compile(r"""["'(]\s*data:"""),
    ),
    (
        "hasEmbeddedImage",
        "image element",
        re.compile(r"""<\s*(\w+:)?image\b"""),
    ),
    (
        "hasExternalUse",
        "use element pointing at an external file instead of an internal anchor",
        re.compile(r"""<\s*(\w+:)?use\b[^>]*?(?:xlink:)?href\s*=\s*["'][^#"']"""),
    ),
    (
        "hasIframeEmbedObject",
        "iframe, embed or object element",
        re.compile(r"""<\s*(\w+:)?(iframe|embed|object)\b"""),
    ),
    (
        "hasStyleImport",
        "@import directive inside style",
        re.compile(r"""@import"""),
    ),
)


def json_type_name(value):
    """Return the JSON type name of a decoded Python value."""
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, int):
        return "integer"
    if isinstance(value, float):
        return "number"
    if isinstance(value, str):
        return "string"
    if isinstance(value, list):
        return "array"
    if isinstance(value, dict):
        return "object"
    return type(value).__name__


def matches_type(value, expected):
    """Return True when value has the expected JSON type."""
    if expected == "boolean":
        return isinstance(value, bool)
    if expected == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected == "string":
        return isinstance(value, str)
    if expected == "array":
        return isinstance(value, list)
    if expected == "object":
        return isinstance(value, dict)
    return False


def rel_posix(root, absolute_path):
    """Return a repository relative path using forward slashes."""
    return os.path.relpath(absolute_path, root).replace(os.sep, "/")


def join_root(root, relative_posix_path):
    """Join a repository relative posix path onto the repository root."""
    return os.path.join(root, *relative_posix_path.split("/"))


def lesson_key_label(key):
    """Return the display label of a lesson key tuple."""
    return "/".join(key)


def manifest_relpath_for(key):
    """Return the canonical manifest path for a lesson key tuple."""
    course, term, chapter, lesson = key
    return "/".join(MANIFEST_ROOT_PARTS + (course, term, chapter, lesson + ".json"))


def asset_dir_relpath_for(key):
    """Return the canonical asset directory for a lesson key tuple."""
    return "/".join(ASSET_ROOT_PARTS + key)


def canonical_page_file(order):
    """Return the canonical asset file name for a page order.

    ADR-0004 section 18 pads to three digits. Beyond 999 the number simply
    continues, and earlier files are never renamed. Both rules are satisfied by
    a single three digit minimum width format.
    """
    return "page-{0:03d}.svg".format(order)


def read_file_bytes(path):
    """Read a file and return its bytes, or raise OSError."""
    with open(path, "rb") as handle:
        return handle.read()


def is_inside_root(root, absolute_path):
    """Return True when the resolved path stays inside the repository root."""
    resolved_root = os.path.realpath(root)
    resolved_path = os.path.realpath(absolute_path)
    if resolved_path == resolved_root:
        return True
    return resolved_path.startswith(resolved_root + os.sep)


class Report:
    """Collects verification problems as sortable records."""

    def __init__(self):
        self._problems = []

    def add(self, path, field, reason):
        self._problems.append((str(path), str(field), str(reason)))

    def __len__(self):
        return len(self._problems)

    def lines(self):
        """Return the problem lines in a stable, fully deterministic order."""
        ordered = sorted(set(self._problems))
        return [
            "ERROR | {0} | {1} | {2}".format(path, field, reason)
            for path, field, reason in ordered
        ]


def load_manifest(root, relpath, report):
    """Load and decode one manifest file.

    Returns the decoded object, or None when the file could not be classified.
    Any failure here is a verification failure, because an unreadable manifest
    cannot be ruled out of the publication candidate set.
    """
    absolute = join_root(root, relpath)
    if os.path.islink(absolute):
        report.add(relpath, "-", "symbolic links are not allowed for manifest files")
        return None
    if not is_inside_root(root, absolute):
        report.add(relpath, "-", "resolved path escapes the repository root")
        return None
    try:
        raw = read_file_bytes(absolute)
    except OSError as error:
        report.add(relpath, "-", "cannot be read: {0}".format(error.strerror))
        return None
    if raw.startswith(UTF8_BOM):
        report.add(relpath, "encoding", "a UTF-8 BOM is not allowed in a manifest file")
        return None
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError:
        report.add(relpath, "encoding", "file is not valid UTF-8")
        return None
    try:
        data = json.loads(text)
    except json.JSONDecodeError as error:
        report.add(
            relpath,
            "-",
            "invalid JSON: {0} at line {1} column {2}".format(
                error.msg, error.lineno, error.colno
            ),
        )
        return None
    if not isinstance(data, dict):
        report.add(
            relpath,
            "-",
            "manifest root must be a JSON object, found {0}".format(json_type_name(data)),
        )
        return None
    return data


def discover_manifests(root, report):
    """Return a mapping of lesson key to (relpath, manifest object)."""
    found = {}
    base = os.path.join(root, *MANIFEST_ROOT_PARTS)
    if not os.path.isdir(base):
        return found
    for dirpath, dirnames, filenames in os.walk(base):
        dirnames.sort()
        for name in sorted(filenames):
            if not name.endswith(".json"):
                continue
            relpath = rel_posix(root, os.path.join(dirpath, name))
            data = load_manifest(root, relpath, report)
            if data is None:
                continue
            parts = relpath.split("/")
            if len(parts) != len(MANIFEST_ROOT_PARTS) + 4:
                if data.get("status") == REQUIRED_STATUS:
                    report.add(
                        relpath,
                        "-",
                        "published manifest is not at the canonical path "
                        "docs/content/manifests/<course>/<term>/<chapter>/<lesson>.json",
                    )
                continue
            key = (parts[3], parts[4], parts[5], parts[6][: -len(".json")])
            found[key] = (relpath, data)
    return found


def discover_assets(root, report):
    """Return a mapping of lesson key to the set of SVG file names present."""
    found = {}
    base = os.path.join(root, *ASSET_ROOT_PARTS)
    if not os.path.isdir(base):
        return found
    for dirpath, dirnames, filenames in os.walk(base):
        dirnames.sort()
        for name in sorted(filenames):
            if not name.endswith(".svg"):
                continue
            relpath = rel_posix(root, os.path.join(dirpath, name))
            parts = relpath.split("/")
            if len(parts) != len(ASSET_ROOT_PARTS) + 5:
                report.add(
                    relpath,
                    "-",
                    "SVG asset is not at the canonical path "
                    "assets/lessons/<course>/<term>/<chapter>/<lesson>/page-<NNN>.svg",
                )
                continue
            key = (parts[2], parts[3], parts[4], parts[5])
            found.setdefault(key, set()).add(name)
    return found


def scan_security(text):
    """Return the list of (flag key, description) actually detected in the bytes."""
    detected = []
    for flag_key, description, pattern in SECURITY_CHECKS:
        if pattern.search(text):
            detected.append((flag_key, description))
    return detected


def verify_page_asset(root, key, manifest_relpath, index, page, report):
    """Verify one declared page against its asset file. Returns the file name."""
    field_prefix = "pages[{0}]".format(index)
    asset_dir = asset_dir_relpath_for(key)

    for name, expected in PAGE_FIELDS:
        if name not in page:
            report.add(manifest_relpath, field_prefix + "." + name, "required field is missing")
            continue
        value = page[name]
        if value is None:
            report.add(
                manifest_relpath, field_prefix + "." + name, "required field must not be null"
            )
            continue
        if not matches_type(value, expected):
            report.add(
                manifest_relpath,
                field_prefix + "." + name,
                "expected {0}, found {1}".format(expected, json_type_name(value)),
            )

    order = page.get("order")
    declared_file = page.get("file")
    declared_id = page.get("id")
    role = page.get("role")
    declared_sha = page.get("sha256")
    declared_bytes = page.get("bytes")

    if isinstance(role, str) and role not in VALID_PAGE_ROLES:
        report.add(
            manifest_relpath,
            field_prefix + ".role",
            "expected one of {0}, found {1!r}".format(", ".join(VALID_PAGE_ROLES), role),
        )

    if isinstance(order, int) and not isinstance(order, bool) and order < 1:
        report.add(
            manifest_relpath, field_prefix + ".order", "page order must start at 1"
        )

    if isinstance(declared_sha, str) and not SHA256_HEX_RE.match(declared_sha):
        report.add(
            manifest_relpath,
            field_prefix + ".sha256",
            "expected 64 lowercase hexadecimal characters",
        )

    if isinstance(declared_bytes, int) and not isinstance(declared_bytes, bool):
        if declared_bytes <= 0:
            report.add(
                manifest_relpath, field_prefix + ".bytes", "declared size must be positive"
            )

    if not isinstance(declared_file, str):
        return None

    if not PAGE_FILE_RE.match(declared_file):
        report.add(
            manifest_relpath,
            field_prefix + ".file",
            "file name {0!r} does not follow page-<NNN>.svg".format(declared_file),
        )
        return declared_file

    if isinstance(order, int) and not isinstance(order, bool) and order >= 1:
        expected_file = canonical_page_file(order)
        if declared_file != expected_file:
            report.add(
                manifest_relpath,
                field_prefix + ".file",
                "expected {0} for order {1}, found {2}".format(
                    expected_file, order, declared_file
                ),
            )
        expected_id = expected_file[: -len(".svg")]
        if isinstance(declared_id, str) and declared_id != expected_id:
            report.add(
                manifest_relpath,
                field_prefix + ".id",
                "expected {0} for order {1}, found {2}".format(
                    expected_id, order, declared_id
                ),
            )
    elif isinstance(declared_id, str):
        expected_id = declared_file[: -len(".svg")]
        if declared_id != expected_id:
            report.add(
                manifest_relpath,
                field_prefix + ".id",
                "expected {0} to match file {1}, found {2}".format(
                    expected_id, declared_file, declared_id
                ),
            )

    asset_relpath = asset_dir + "/" + declared_file
    absolute = join_root(root, asset_relpath)

    if os.path.islink(absolute):
        report.add(asset_relpath, "-", "symbolic links are not allowed for published assets")
        return declared_file
    if not is_inside_root(root, absolute):
        report.add(asset_relpath, "-", "resolved path escapes the repository root")
        return declared_file
    if not os.path.isfile(absolute):
        report.add(asset_relpath, "-", "declared asset file is missing")
        return declared_file

    try:
        raw = read_file_bytes(absolute)
    except OSError as error:
        report.add(asset_relpath, "-", "cannot be read: {0}".format(error.strerror))
        return declared_file

    actual_size = len(raw)
    if actual_size <= 0:
        report.add(asset_relpath, "-", "asset file is empty")
    if isinstance(declared_bytes, int) and not isinstance(declared_bytes, bool):
        if declared_bytes != actual_size:
            report.add(
                asset_relpath,
                "bytes",
                "manifest declares {0} bytes, file is {1} bytes".format(
                    declared_bytes, actual_size
                ),
            )

    actual_sha = hashlib.sha256(raw).hexdigest()
    if isinstance(declared_sha, str) and SHA256_HEX_RE.match(declared_sha):
        if declared_sha != actual_sha:
            report.add(
                asset_relpath,
                "sha256",
                "manifest declares {0}, file hashes to {1}".format(declared_sha, actual_sha),
            )

    parsed_root = None
    try:
        parsed_root = ElementTree.fromstring(raw)
    except ElementTree.ParseError as error:
        report.add(asset_relpath, "-", "XML is not well formed: {0}".format(error))

    declared_well_formed = page.get("xmlWellFormed")
    if isinstance(declared_well_formed, bool):
        if declared_well_formed != (parsed_root is not None):
            report.add(
                asset_relpath,
                "xmlWellFormed",
                "manifest declares {0}, parsing the file gives {1}".format(
                    str(declared_well_formed).lower(), str(parsed_root is not None).lower()
                ),
            )

    if parsed_root is not None:
        if parsed_root.tag not in SVG_ROOT_TAGS:
            report.add(
                asset_relpath,
                "-",
                "root element must be svg, found {0}".format(parsed_root.tag),
            )
        else:
            for attribute in ("width", "height", "viewBox"):
                declared_value = page.get(attribute)
                if not isinstance(declared_value, str):
                    continue
                actual_value = parsed_root.get(attribute)
                if actual_value != declared_value:
                    report.add(
                        asset_relpath,
                        attribute,
                        "manifest declares {0!r}, root element has {1!r}".format(
                            declared_value, actual_value
                        ),
                    )

    text = raw.decode("utf-8", "replace")
    detected = scan_security(text)
    detected_keys = set()
    for flag_key, description in detected:
        detected_keys.add(flag_key)
        report.add(
            asset_relpath,
            "security." + flag_key,
            "security scan detected {0}; publication is blocked".format(description),
        )

    security = page.get("security")
    if isinstance(security, dict):
        findings = security.get("findings")
        if "findings" not in security:
            report.add(
                manifest_relpath,
                field_prefix + ".security.findings",
                "required field is missing",
            )
        elif not isinstance(findings, list):
            report.add(
                manifest_relpath,
                field_prefix + ".security.findings",
                "expected array, found {0}".format(json_type_name(findings)),
            )
        elif findings:
            report.add(
                manifest_relpath,
                field_prefix + ".security.findings",
                "must be empty for a published asset, found {0} entry or entries".format(
                    len(findings)
                ),
            )
        for flag_key, _description, _pattern in SECURITY_CHECKS:
            if flag_key not in security:
                continue
            declared_flag = security[flag_key]
            if not isinstance(declared_flag, bool):
                report.add(
                    manifest_relpath,
                    field_prefix + ".security." + flag_key,
                    "expected boolean, found {0}".format(json_type_name(declared_flag)),
                )
                continue
            if declared_flag != (flag_key in detected_keys):
                report.add(
                    asset_relpath,
                    "security." + flag_key,
                    "manifest declares {0}, scanning the bytes gives {1}".format(
                        str(declared_flag).lower(), str(flag_key in detected_keys).lower()
                    ),
                )

    return declared_file


def verify_candidate(root, key, manifest_relpath, data, asset_names, report):
    """Verify one publication candidate lesson."""
    if data is None:
        report.add(
            manifest_relpath,
            "-",
            "manifest is missing for a lesson that has published SVG assets under "
            "assets/lessons/",
        )
        return

    for name, expected in LESSON_FIELDS:
        if name not in data:
            report.add(manifest_relpath, name, "required field is missing")
            continue
        value = data[name]
        if value is None:
            report.add(manifest_relpath, name, "required field must not be null")
            continue
        if not matches_type(value, expected):
            report.add(
                manifest_relpath,
                name,
                "expected {0}, found {1}".format(expected, json_type_name(value)),
            )

    schema_version = data.get("schemaVersion")
    if isinstance(schema_version, int) and not isinstance(schema_version, bool):
        if schema_version != REQUIRED_SCHEMA_VERSION:
            report.add(
                manifest_relpath,
                "schemaVersion",
                "a publication candidate must declare schemaVersion {0}, found {1}".format(
                    REQUIRED_SCHEMA_VERSION, schema_version
                ),
            )

    status = data.get("status")
    if isinstance(status, str) and status != REQUIRED_STATUS:
        report.add(
            manifest_relpath,
            "status",
            "a publication candidate must declare status {0!r}, found {1!r}".format(
                REQUIRED_STATUS, status
            ),
        )

    algorithm = data.get("checksumAlgorithm")
    if isinstance(algorithm, str) and algorithm != REQUIRED_CHECKSUM_ALGORITHM:
        report.add(
            manifest_relpath,
            "checksumAlgorithm",
            "expected {0!r}, found {1!r}".format(REQUIRED_CHECKSUM_ALGORITHM, algorithm),
        )

    custody_repository = data.get("custodyRepository")
    if isinstance(custody_repository, str):
        if re.search(r"""[\s/\\:@?#]""", custody_repository):
            report.add(
                manifest_relpath,
                "custodyRepository",
                "must be a bare repository name with no URL, path or access data",
            )
        elif custody_repository != REQUIRED_CUSTODY_REPOSITORY:
            report.add(
                manifest_relpath,
                "custodyRepository",
                "expected {0!r}, found {1!r}".format(
                    REQUIRED_CUSTODY_REPOSITORY, custody_repository
                ),
            )

    custody_snapshot = data.get("custodySnapshot")
    if isinstance(custody_snapshot, str) and not SHA1_HEX_RE.match(custody_snapshot):
        report.add(
            manifest_relpath,
            "custodySnapshot",
            "expected 40 lowercase hexadecimal characters",
        )

    course, term, chapter, lesson = key
    for name, expected_value in (
        ("course", course),
        ("term", term),
        ("chapter", chapter),
        ("lesson", lesson),
    ):
        value = data.get(name)
        if isinstance(value, str) and value != expected_value:
            report.add(
                manifest_relpath,
                name,
                "expected {0!r} to match the manifest path, found {1!r}".format(
                    expected_value, value
                ),
            )

    expected_permanent = "/courses/{0}/{1}/{2}/{3}/".format(course, term, chapter, lesson)
    permanent_path = data.get("permanentPath")
    if isinstance(permanent_path, str) and permanent_path != expected_permanent:
        report.add(
            manifest_relpath,
            "permanentPath",
            "expected {0!r} per ADR-0004, found {1!r}".format(
                expected_permanent, permanent_path
            ),
        )

    expected_asset_base = "/assets/lessons/{0}/{1}/{2}/{3}/".format(
        course, term, chapter, lesson
    )
    asset_base_path = data.get("assetBasePath")
    if isinstance(asset_base_path, str) and asset_base_path != expected_asset_base:
        report.add(
            manifest_relpath,
            "assetBasePath",
            "expected {0!r} per ADR-0004 section 18, found {1!r}".format(
                expected_asset_base, asset_base_path
            ),
        )

    pages = data.get("pages")
    if not isinstance(pages, list):
        return
    if not pages:
        report.add(manifest_relpath, "pages", "a published lesson must declare at least one page")
        return

    declared_count = data.get("declaredPageCount")
    if isinstance(declared_count, int) and not isinstance(declared_count, bool):
        if declared_count != len(pages):
            report.add(
                manifest_relpath,
                "declaredPageCount",
                "declares {0}, the pages array holds {1} entry or entries".format(
                    declared_count, len(pages)
                ),
            )

    declared_files = []
    for index, page in enumerate(pages):
        if not isinstance(page, dict):
            report.add(
                manifest_relpath,
                "pages[{0}]".format(index),
                "expected object, found {0}".format(json_type_name(page)),
            )
            continue
        name = verify_page_asset(root, key, manifest_relpath, index, page, report)
        if name is not None:
            declared_files.append(name)

    roles = [page.get("role") for page in pages if isinstance(page, dict)]
    opening_count = roles.count("opening")
    if opening_count != 1:
        report.add(
            manifest_relpath,
            "pages",
            "exactly one page must have role 'opening', found {0}".format(opening_count),
        )

    orders = [
        page.get("order")
        for page in pages
        if isinstance(page, dict)
        and isinstance(page.get("order"), int)
        and not isinstance(page.get("order"), bool)
    ]
    seen_orders = set()
    for value in sorted(orders):
        if value in seen_orders:
            report.add(
                manifest_relpath,
                "pages",
                "page order {0} is declared more than once".format(value),
            )
        seen_orders.add(value)
    for expected_order in range(1, len(pages) + 1):
        if expected_order not in seen_orders:
            report.add(
                manifest_relpath,
                "pages",
                "page order {0} is missing; numbering must start at 1 and be "
                "contiguous".format(expected_order),
            )

    for field_name, label in (("id", "page id"), ("file", "asset file name")):
        counts = {}
        for page in pages:
            if not isinstance(page, dict):
                continue
            value = page.get(field_name)
            if isinstance(value, str):
                counts[value] = counts.get(value, 0) + 1
        for value in sorted(counts):
            if counts[value] > 1:
                report.add(
                    manifest_relpath,
                    "pages",
                    "{0} {1!r} is declared more than once".format(label, value),
                )

    checksum_counts = {}
    for page in pages:
        if not isinstance(page, dict):
            continue
        value = page.get("sha256")
        if isinstance(value, str):
            checksum_counts[value] = checksum_counts.get(value, 0) + 1
    for value in sorted(checksum_counts):
        if checksum_counts[value] > 1:
            report.add(
                manifest_relpath,
                "pages",
                "checksum {0} is declared for more than one page".format(value),
            )

    asset_dir = asset_dir_relpath_for(key)
    for extra in sorted(asset_names - set(declared_files)):
        report.add(
            asset_dir + "/" + extra,
            "-",
            "SVG asset is present in the lesson directory but not declared in the manifest",
        )


def run(root, report, out):
    """Discover candidates and verify them. Returns the candidate key list."""
    manifests = discover_manifests(root, report)
    assets = discover_assets(root, report)

    candidates = set()
    for key, (_relpath, data) in manifests.items():
        if data.get("status") == REQUIRED_STATUS:
            candidates.add(key)
    candidates.update(assets.keys())

    ordered = sorted(candidates)
    print("Publication candidates: {0}".format(len(ordered)), file=out)
    for key in ordered:
        print("  - {0}".format(lesson_key_label(key)), file=out)

    for key in ordered:
        entry = manifests.get(key)
        manifest_relpath = entry[0] if entry is not None else manifest_relpath_for(key)
        data = entry[1] if entry is not None else None
        verify_candidate(
            root, key, manifest_relpath, data, assets.get(key, set()), report
        )

    return ordered


def main(argv):
    """Entry point. Returns the process exit code."""
    out = sys.stdout
    print(TOOL_TITLE, file=out)

    if len(argv) != 1 or argv[0].startswith("-"):
        print(
            "USAGE ERROR: exactly one positional argument is required, the repository "
            "root; received {0} argument or arguments".format(len(argv)),
            file=out,
        )
        print("Usage: python3 tools/verify_lesson.py <repository-root>", file=out)
        print("RESULT: ERROR (usage)", file=out)
        return EXIT_USAGE

    raw_root = argv[0]
    if not os.path.exists(raw_root):
        print(
            "ENVIRONMENT ERROR: repository root {0!r} does not exist".format(raw_root),
            file=out,
        )
        print("RESULT: ERROR (environment)", file=out)
        return EXIT_USAGE
    if not os.path.isdir(raw_root):
        print(
            "ENVIRONMENT ERROR: repository root {0!r} is not a directory".format(raw_root),
            file=out,
        )
        print("RESULT: ERROR (environment)", file=out)
        return EXIT_USAGE

    root = os.path.realpath(raw_root)
    print("Repository root: {0}".format(root), file=out)

    report = Report()
    try:
        candidates = run(root, report, out)
    except OSError as error:
        print(
            "ENVIRONMENT ERROR: the repository could not be traversed: {0}".format(error),
            file=out,
        )
        print("RESULT: ERROR (environment)", file=out)
        return EXIT_USAGE

    if not candidates and len(report) == 0:
        print(
            "No publication candidate was found. The candidate count is zero, so there "
            "is nothing to verify.",
            file=out,
        )
        print("RESULT: PASS (0 errors)", file=out)
        return EXIT_OK

    for line in report.lines():
        print(line, file=out)

    error_count = len(set(report.lines()))
    if error_count:
        print("RESULT: FAIL ({0} errors)".format(error_count), file=out)
        return EXIT_VERIFICATION_FAILED

    print(
        "All checks passed for {0} publication candidate or candidates.".format(
            len(candidates)
        ),
        file=out,
    )
    print("RESULT: PASS (0 errors)", file=out)
    return EXIT_OK


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
