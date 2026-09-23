#!/usr/bin/env python3
"""Parmaga lesson publication tool.

Commands:
  inventory <config> --output <path>        Build manifest.json from SVG assets + config.
  render    <config> --output-dir <path>    Build index.html and context.md.
  patch     <config> --output-dir <path>    Produce patched root index.html and sitemap.xml.
  verify    <config>                        Run verify_lesson.py against the repository.
  all       <config>                        Run inventory, render, patch, verify in order.

Idempotent and fail-safe: every write is prepared in /tmp, compared, then moved.
Never reads or writes parmaga-content. Never re-implements verify_lesson checks;
imports verify_lesson and calls its scan_security.

Common options:
  --in-place     Write to canonical repository paths instead of --output-dir.
  --force        Write even if the target file already has identical content.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import shutil
import sys
import tempfile
import xml.etree.ElementTree as ET
from html import escape as html_escape

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS_DIR = os.path.join(REPO_ROOT, "tools")
if TOOLS_DIR not in sys.path:
    sys.path.insert(0, TOOLS_DIR)

import verify_lesson  # noqa: E402

SECURITY_FLAG_KEYS = tuple(
    flag_key for flag_key, _desc, _pat in verify_lesson.SECURITY_CHECKS
) + ("findings",)


def local_tag(tag):
    return tag.split("}")[-1] if "}" in tag else tag


def read_text(path):
    with open(path, "rb") as f:
        return f.read().decode("utf-8")


def load_config(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_manifest(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def svg_dir_for(config):
    return os.path.join(
        REPO_ROOT, "assets", "lessons",
        config["course"], config["term"], config["chapter"], config["lesson"],
    )


def manifest_relpath_for(config):
    return os.path.join(
        "docs", "content", "manifests",
        config["course"], config["term"], config["chapter"],
        config["lesson"] + ".json",
    )


def context_relpath_for(config):
    return os.path.join(
        "docs", "content", "context",
        config["course"], config["term"], config["chapter"],
        config["lesson"] + ".md",
    )


def lesson_html_relpath_for(config):
    return os.path.join(
        "courses",
        config["course"], config["term"], config["chapter"], config["lesson"],
        "index.html",
    )


def scan_svg(svg_abs_path):
    with open(svg_abs_path, "rb") as f:
        raw = f.read()
    sha = hashlib.sha256(raw).hexdigest()
    n_bytes = len(raw)
    root = ET.fromstring(raw)
    text_count = sum(1 for e in root.iter() if local_tag(e.tag) == "text")
    fonts = set()
    for e in root.iter():
        for a, v in e.attrib.items():
            if local_tag(a) == "font-family":
                for part in v.split(","):
                    name = part.strip().strip("'\"")
                    if name:
                        fonts.add(name)
    width = root.get("width") or ""
    height = root.get("height") or ""
    view_box = root.get("viewBox") or ""
    text = raw.decode("utf-8")
    detected = verify_lesson.scan_security(text)
    detected_keys = {k for k, _ in detected}
    security = {}
    for flag_key in SECURITY_FLAG_KEYS:
        if flag_key == "findings":
            security["findings"] = []
        else:
            security[flag_key] = flag_key in detected_keys
    return {
        "sha256": sha,
        "bytes": n_bytes,
        "width": width,
        "height": height,
        "viewBox": view_box,
        "textElementCount": text_count,
        "fontsReferenced": sorted(fonts),
        "security": security,
    }


def build_manifest(config):
    svg_dir = svg_dir_for(config)
    pages = []
    for idx, page in enumerate(config["pages"], start=1):
        svg_file = page["id"] + ".svg"
        measured = scan_svg(os.path.join(svg_dir, svg_file))
        pages.append({
            "id": page["id"],
            "file": svg_file,
            "sourceFileName": svg_file,
            "order": idx,
            "role": page["role"],
            "sha256": measured["sha256"],
            "bytes": measured["bytes"],
            "width": measured["width"],
            "height": measured["height"],
            "viewBox": measured["viewBox"],
            "encoding": "utf-8",
            "xmlWellFormed": True,
            "textElementCount": measured["textElementCount"],
            "fontsReferenced": measured["fontsReferenced"],
            "security": measured["security"],
            "descriptionAr": page["descriptionAr"],
        })
    return {
        "schemaVersion": 2,
        "course": config["course"],
        "term": config["term"],
        "chapter": config["chapter"],
        "lesson": config["lesson"],
        "displayTitleAr": config["displayTitleAr"],
        "displayTitleEn": config["displayTitleEn"],
        "permanentPath": "/courses/{0}/{1}/{2}/{3}/".format(
            config["course"], config["term"], config["chapter"], config["lesson"]),
        "assetBasePath": "/assets/lessons/{0}/{1}/{2}/{3}/".format(
            config["course"], config["term"], config["chapter"], config["lesson"]),
        "status": config["status"],
        "inventoryDate": config["inventoryDate"],
        "checksumAlgorithm": "sha256",
        "declaredPageCount": config["declaredPageCount"],
        "custodyRepository": config["custodyRepository"],
        "custodySnapshot": config["custodySnapshot"],
        "notes": list(config["extraNotes"]),
        "pages": pages,
    }


def dumps_canonical(value, indent=2, max_width=300):
    """Column-aware canonical JSON writer."""
    def primitive_repr(v):
        if v is None:
            return "null"
        if isinstance(v, bool):
            return "true" if v else "false"
        if isinstance(v, (int, float)):
            return json.dumps(v)
        if isinstance(v, str):
            return json.dumps(v, ensure_ascii=False)
        raise TypeError(type(v))

    def encode(v, level, col):
        pad = " " * (indent * level)
        pad_inner = " " * (indent * (level + 1))
        if v is None or isinstance(v, (bool, int, float, str)):
            return primitive_repr(v)
        if isinstance(v, list):
            if not v:
                return "[]"
            if all(not isinstance(e, (list, dict)) for e in v):
                flat = "[" + ", ".join(primitive_repr(e) for e in v) + "]"
                if col + len(flat) <= max_width:
                    return flat
            items = [pad_inner + encode(e, level + 1, indent * (level + 1)) for e in v]
            return "[\n" + ",\n".join(items) + "\n" + pad + "]"
        if isinstance(v, dict):
            if not v:
                return "{}"
            items = []
            for k, val in v.items():
                key_str = json.dumps(k, ensure_ascii=False)
                prefix = pad_inner + key_str + ": "
                val_str = encode(val, level + 1, len(prefix))
                items.append(prefix + val_str)
            return "{\n" + ",\n".join(items) + "\n" + pad + "}"
        raise TypeError(type(v))

    return encode(value, 0, 0)


def manifest_to_text(manifest):
    return dumps_canonical(manifest) + "\n"


def render_page_block(page, transcript, total, is_first, config):
    n = page["order"]
    page_id = page["id"]
    html_id = "page-{}".format(n)
    alt = html_escape(page["descriptionAr"], quote=True)
    lazy = "" if is_first else ' loading="lazy"'
    src = "/assets/lessons/%s/%s/%s/%s/%s.svg" % (
        config["course"], config["term"], config["chapter"], config["lesson"], page_id)
    lines = [
        '<li class="lesson-page" id="%s" data-page-index="%d">' % (html_id, n),
        "<h2>الصفحة %d من %d</h2>" % (n, total),
        '<img class="lesson-page-image" data-page-image src="%s" width="%s" height="%s"%s alt="%s">'
            % (src, page["width"], page["height"], lazy, alt),
        '<details class="lesson-transcript">',
        "<summary>نص الصفحة %d</summary>" % n,
        '<div class="transcript-body">',
    ]
    for item in transcript:
        lines.append('<p lang="%s" dir="%s">%s</p>'
                     % (item["lang"], item["dir"], html_escape(item["text"], quote=True)))
    lines.append("</div>")
    lines.append("</details>")
    lines.append("</li>")
    return "\n".join(lines)


def build_html(config, manifest):
    tmpl = read_text(os.path.join(TOOLS_DIR, "templates", "lesson-page.html.tmpl"))
    tmpl = tmpl.replace("\r\n", "\n")
    meta_description = (
        "الدرس %s من مادة البرمجة والذكاء الاصطناعي للبكالوريا: %s، "
        "في %d صفحة مع النص الكامل بالعربية والإنجليزية."
        % (config["displayNumber"], config["displayTitleAr"], config["declaredPageCount"])
    )
    permanent_url = "https://parmaga.com/courses/%s/%s/%s/%s/" % (
        config["course"], config["term"], config["chapter"], config["lesson"])
    blocks = []
    for i, page in enumerate(manifest["pages"]):
        transcript = config["pages"][i]["transcript"]
        blocks.append(render_page_block(
            page, transcript, config["declaredPageCount"], page["order"] == 1, config))
    pages_list = "\n\n".join(blocks)
    html = tmpl
    html = html.replace("{{DISPLAY_TITLE_AR}}", html_escape(config["displayTitleAr"], quote=True))
    html = html.replace("{{META_DESCRIPTION}}", html_escape(meta_description, quote=True))
    html = html.replace("{{PERMANENT_URL}}", permanent_url)
    html = html.replace("{{DISPLAY_NUMBER}}", config["displayNumber"])
    html = html.replace("{{DECLARED_PAGE_COUNT}}", str(config["declaredPageCount"]))
    html = html.replace("{{PAGES_LIST}}", pages_list)
    return html


def build_context(config, manifest):
    tmpl = read_text(os.path.join(TOOLS_DIR, "templates", "context.md.tmpl"))
    tmpl = tmpl.replace("\r\n", "\n")
    rows = ["| المعرّف | البايتات | الوصف |", "|---|---|---|"]
    for page in manifest["pages"]:
        rows.append("| %s | %d | %s |" % (
            page["id"], page["bytes"], page["descriptionAr"]))
    table = "\n".join(rows)
    s = config["contextSections"]
    ctx = tmpl
    ctx = ctx.replace("{{CHAPTER}}", config["chapter"])
    ctx = ctx.replace("{{LESSON}}", config["lesson"])
    ctx = ctx.replace("{{MANIFEST_RELPATH}}",
                      manifest_relpath_for(config).replace(os.sep, "/"))
    ctx = ctx.replace("{{PERMANENT_PATH}}", manifest["permanentPath"])
    ctx = ctx.replace("{{ASSET_BASE_PATH}}", manifest["assetBasePath"])
    ctx = ctx.replace("{{COURSE}}", config["course"])
    ctx = ctx.replace("{{TERM}}", config["term"])
    ctx = ctx.replace("{{COURSE_LABEL_AR}}", config["courseLabelAr"])
    ctx = ctx.replace("{{TERM_LABEL_AR}}", config["termLabelAr"])
    ctx = ctx.replace("{{TITLE_AR}}", config["displayTitleAr"])
    ctx = ctx.replace("{{TITLE_EN}}", config["displayTitleEn"])
    ctx = ctx.replace("{{PIVOT_QUESTION_AR}}", config["pivotQuestionAr"])
    ctx = ctx.replace("{{STATUS_AR}}", s["statusAr"])
    ctx = ctx.replace("{{PAGES_NARRATIVE_AR}}", s["pagesNarrativeAr"])
    ctx = ctx.replace("{{PAGES_TABLE_ROWS}}", table)
    ctx = ctx.replace("{{STRUCTURE_SUMMARY_AR}}", s["structureSummaryAr"])
    ctx = ctx.replace("{{CONSTRAINTS_AR}}", s["constraintsAr"])
    ctx = ctx.replace("{{DECIDED_AR}}", s["decidedAr"])
    ctx = ctx.replace("{{UNDECIDED_AR}}", s["undecidedAr"])
    ctx = ctx.replace("{{HOW_TO_USE_AR}}", s["howToUseAr"])
    return ctx


def write_with_ending(path, content, ending):
    content = content.replace("\r\n", "\n")
    if ending == "crlf":
        content = content.replace("\n", "\r\n")
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(content)


def safe_write(target_path, content, ending, force=False):
    """Write atomically. If target exists with identical bytes, skip unless force."""
    target_path = os.path.abspath(target_path)
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=".publish-", suffix=".tmp",
                               dir=os.path.dirname(target_path))
    os.close(fd)
    try:
        write_with_ending(tmp, content, ending)
        if not force and os.path.exists(target_path):
            with open(tmp, "rb") as f1, open(target_path, "rb") as f2:
                if f1.read() == f2.read():
                    os.unlink(tmp)
                    return False
        shutil.move(tmp, target_path)
        return True
    except Exception:
        if os.path.exists(tmp):
            os.unlink(tmp)
        raise


# --- commands ---


def cmd_inventory(config_path, output_path, force=False):
    config = load_config(config_path)
    manifest = build_manifest(config)
    text = manifest_to_text(manifest)
    wrote = safe_write(output_path, text, "lf", force=force)
    print("inventory: %s (wrote=%s)" % (output_path, wrote))
    return 0


def cmd_render(config_path, output_dir, force=False, in_place=False):
    config = load_config(config_path)
    manifest = load_manifest(os.path.join(REPO_ROOT, manifest_relpath_for(config)))
    html = build_html(config, manifest)
    ctx = build_context(config, manifest)
    if in_place:
        html_out = os.path.join(REPO_ROOT, lesson_html_relpath_for(config))
        ctx_out = os.path.join(REPO_ROOT, context_relpath_for(config))
    else:
        html_out = os.path.join(output_dir, config["lesson"] + "_index_regen.html")
        ctx_out = os.path.join(output_dir, config["lesson"] + "_context_regen.md")
    wrote_html = safe_write(html_out, html, "crlf", force=force)
    wrote_ctx = safe_write(ctx_out, ctx, "lf", force=force)
    print("render: %s (wrote=%s)" % (html_out, wrote_html))
    print("render: %s (wrote=%s)" % (ctx_out, wrote_ctx))
    return 0


def _patch_root_html(config, root_html):
    permanent_path = "/courses/%s/%s/%s/%s/" % (
        config["course"], config["term"], config["chapter"], config["lesson"])
    link_text = "%s \u2014 %s" % (config["displayNumber"], config["displayTitleAr"])
    new_link = '<a class="action-link" href="%s">%s</a>' % (permanent_path, link_text)
    existing_marker = '<a class="action-link" href="%s">' % permanent_path
    placeholder = "<p>%s</p>" % link_text
    if existing_marker in root_html:
        return root_html, "already-patched"
    if placeholder not in root_html:
        return None, "placeholder-not-found"
    return root_html.replace(placeholder, new_link), "patched"


def _patch_sitemap(config, sitemap_xml):
    permanent_url = "https://parmaga.com/courses/%s/%s/%s/%s/" % (
        config["course"], config["term"], config["chapter"], config["lesson"])
    if permanent_url in sitemap_xml:
        return sitemap_xml, "already-patched"
    if "</urlset>" not in sitemap_xml:
        return None, "urlset-not-found"
    block = "  <url>\n    <loc>%s</loc>\n  </url>\n" % permanent_url
    new_sitemap = sitemap_xml.replace("</urlset>", block + "</urlset>")
    return new_sitemap, "patched"


def cmd_patch(config_path, output_dir, force=False, in_place=False):
    config = load_config(config_path)
    root_html = read_text(os.path.join(REPO_ROOT, "index.html"))
    sitemap_xml = read_text(os.path.join(REPO_ROOT, "sitemap.xml"))

    new_root, root_status = _patch_root_html(config, root_html)
    if new_root is None:
        print("patch: ERROR: lesson placeholder not found in root index.html",
              file=sys.stderr)
        print("patch: expected placeholder: <p>%s \u2014 %s</p>" % (
            config["displayNumber"], config["displayTitleAr"]), file=sys.stderr)
        return 2

    new_sitemap, sitemap_status = _patch_sitemap(config, sitemap_xml)
    if new_sitemap is None:
        print("patch: ERROR: sitemap structure unexpected", file=sys.stderr)
        return 2

    if in_place:
        root_out = os.path.join(REPO_ROOT, "index.html")
        sm_out = os.path.join(REPO_ROOT, "sitemap.xml")
    else:
        root_out = os.path.join(output_dir, "index_regen.html")
        sm_out = os.path.join(output_dir, "sitemap_regen.xml")

    wrote_root = safe_write(root_out, new_root, "crlf", force=force)
    wrote_sm = safe_write(sm_out, new_sitemap, "lf", force=force)
    print("patch: root %s -> %s (wrote=%s)" % (root_status, root_out, wrote_root))
    print("patch: sitemap %s -> %s (wrote=%s)" % (sitemap_status, sm_out, wrote_sm))
    return 0


def cmd_verify(config_path):
    config = load_config(config_path)
    return verify_lesson.main([REPO_ROOT])


def cmd_all(config_path, output_dir, force=False, in_place=False):
    config = load_config(config_path)
    canonical = os.path.join(REPO_ROOT, manifest_relpath_for(config))

    # 0. new lesson (ADR-0024 K1): no canonical Manifest yet. render reads the
    #    Manifest from its canonical path only, so it is created in place only.
    if not os.path.exists(canonical):
        if not in_place:
            print("all: canonical manifest missing: %s; rerun with --in-place "
                  "to create it" % canonical, file=sys.stderr)
            return 1
        rc = cmd_inventory(config_path, canonical)
        if rc != 0:
            return rc
        print("all: manifest created at canonical path")

    # 1. inventory -> /tmp, compare with canonical
    tmp_manifest = os.path.join(tempfile.gettempdir(), "publish_all_manifest.json")
    rc = cmd_inventory(config_path, tmp_manifest, force=True)
    if rc != 0:
        return rc
    with open(tmp_manifest, "rb") as f1, open(canonical, "rb") as f2:
        if f1.read() != f2.read():
            print("all: MANIFEST DIFFERS from canonical; stopping", file=sys.stderr)
            return 1
    print("all: manifest matches canonical")

    # 2. render
    rc = cmd_render(config_path, output_dir, force=force, in_place=in_place)
    if rc != 0:
        return rc

    # 3. patch
    rc = cmd_patch(config_path, output_dir, force=force, in_place=in_place)
    if rc != 0:
        return rc

    # 4. verify
    return cmd_verify(config_path)


def main(argv):
    parser = argparse.ArgumentParser(prog="publish_lesson.py")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_inv = sub.add_parser("inventory")
    p_inv.add_argument("config")
    p_inv.add_argument("--output", required=True)
    p_inv.add_argument("--force", action="store_true")

    p_ren = sub.add_parser("render")
    p_ren.add_argument("config")
    p_ren.add_argument("--output-dir")
    p_ren.add_argument("--in-place", action="store_true")
    p_ren.add_argument("--force", action="store_true")

    p_pat = sub.add_parser("patch")
    p_pat.add_argument("config")
    p_pat.add_argument("--output-dir")
    p_pat.add_argument("--in-place", action="store_true")
    p_pat.add_argument("--force", action="store_true")

    p_ver = sub.add_parser("verify")
    p_ver.add_argument("config")

    p_all = sub.add_parser("all")
    p_all.add_argument("config")
    p_all.add_argument("--output-dir")
    p_all.add_argument("--in-place", action="store_true")
    p_all.add_argument("--force", action="store_true")

    args = parser.parse_args(argv)

    def _resolve_outdir(args):
        if getattr(args, "in_place", False):
            return None
        if not getattr(args, "output_dir", None):
            print("ERROR: --output-dir required unless --in-place is given",
                  file=sys.stderr)
            sys.exit(2)
        return args.output_dir

    if args.cmd == "inventory":
        return cmd_inventory(args.config, args.output, force=args.force)
    if args.cmd == "render":
        return cmd_render(args.config, _resolve_outdir(args),
                          force=args.force, in_place=args.in_place)
    if args.cmd == "patch":
        return cmd_patch(args.config, _resolve_outdir(args),
                         force=args.force, in_place=args.in_place)
    if args.cmd == "verify":
        return cmd_verify(args.config)
    if args.cmd == "all":
        return cmd_all(args.config, _resolve_outdir(args),
                       force=args.force, in_place=args.in_place)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
