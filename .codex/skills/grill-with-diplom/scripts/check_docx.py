from __future__ import annotations

import sys
from collections import Counter

from docx import Document


EXPECTED = {
    "top_margin_cm": 2.0,
    "bottom_margin_cm": 2.0,
    "left_margin_cm": 2.5,
    "right_margin_cm": 1.0,
    "font_name": "Times New Roman",
    "font_size_pt": 14.0,
    "first_line_indent_cm": 1.25,
    "line_spacing": 1.5,
}


def almost_equal(actual: float | None, expected: float, tolerance: float = 0.05) -> bool:
    return actual is not None and abs(actual - expected) <= tolerance


def cm(value) -> float | None:
    return None if value is None else round(value.cm, 3)


def pt(value) -> float | None:
    return None if value is None else round(value.pt, 3)


def effective_font(paragraph):
    run = next((r for r in paragraph.runs if r.text.strip()), None)
    return (
        (run.font.name if run else None)
        or paragraph.style.font.name
        or paragraph.part.document.styles["Normal"].font.name
    )


def effective_size(paragraph):
    run = next((r for r in paragraph.runs if r.text.strip()), None)
    return (
        pt(run.font.size) if run and run.font.size else None
    ) or pt(paragraph.style.font.size) or pt(paragraph.part.document.styles["Normal"].font.size)


def main(path: str) -> int:
    doc = Document(path)
    issues: list[str] = []

    for index, section in enumerate(doc.sections, start=1):
        checks = {
            "top margin": cm(section.top_margin),
            "bottom margin": cm(section.bottom_margin),
            "left margin": cm(section.left_margin),
            "right margin": cm(section.right_margin),
        }
        expected = {
            "top margin": EXPECTED["top_margin_cm"],
            "bottom margin": EXPECTED["bottom_margin_cm"],
            "left margin": EXPECTED["left_margin_cm"],
            "right margin": EXPECTED["right_margin_cm"],
        }
        for label, actual in checks.items():
            if not almost_equal(actual, expected[label]):
                issues.append(
                    f"section {index}: {label} is {actual} cm, expected {expected[label]} cm"
                )

    paragraphs = [p for p in doc.paragraphs if p.text.strip()]
    fonts = Counter(effective_font(p) for p in paragraphs)
    sizes = Counter(effective_size(p) for p in paragraphs)
    line_spacings = Counter(p.paragraph_format.line_spacing for p in paragraphs)
    first_line_indents = Counter(cm(p.paragraph_format.first_line_indent) for p in paragraphs)

    print("SUMMARY")
    print(f"- non-empty paragraphs: {len(paragraphs)}")
    print(f"- effective fonts: {dict(fonts)}")
    print(f"- effective sizes (pt): {dict(sizes)}")
    print(f"- explicit line spacings: {dict(line_spacings)}")
    print(f"- explicit first-line indents (cm): {dict(first_line_indents)}")

    if issues:
        print("FAIL")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("PASS")
    print("- page margins match the rules")
    print("- typography distributions printed for manual follow-up")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: check_docx.py <document.docx>")
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1]))
