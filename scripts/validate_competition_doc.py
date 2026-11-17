import sys
import os
from pathlib import Path

from docx import Document
from docx.oxml.ns import qn


ROOT = Path(__file__).resolve().parent.parent
DOCX = Path(
    os.environ.get(
        "COMPETITION_DOC_OUTPUT",
        str(ROOT / "deliverables" / "第九届传智杯-AI小程序赛道-识牛.docx"),
    )
)
SKILL_SCRIPTS = Path(
    r"C:\Users\潘苏杰\.codex\plugins\cache\openai-primary-runtime\documents"
    r"\26.805.11740\skills\documents\scripts"
)
sys.path.insert(0, str(SKILL_SCRIPTS))
from table_geometry import audit_docx_tables  # noqa: E402


def main():
    assert DOCX.exists(), "DOCX 文件不存在"
    document = Document(DOCX)
    headings = [p.text.strip() for p in document.paragraphs if p.style.name == "Heading 1"]
    required = [
        "一、项目说明",
        "二、小程序与 AI 能力说明",
        "三、创新点说明",
        "四、技术实现",
        "五、成果展示",
        "六、历史说明",
        "七、落地规划",
    ]
    missing = [heading for heading in required if heading not in headings]
    assert not missing, f"缺少必需章节：{missing}"

    table_issues = audit_docx_tables(DOCX)
    assert not table_issues, "表格几何检查未通过"

    alt_texts = []
    for inline in document.inline_shapes:
        doc_pr = inline._inline.docPr
        alt_texts.append(doc_pr.get("descr") or doc_pr.get("title") or "")
    assert len(alt_texts) == 4 and all(alt_texts), "图片替代文字不完整"

    page_breaks = sum(
        1
        for paragraph in document.paragraphs
        for run in paragraph.runs
        if run._r.findall(".//" + qn("w:br"))
    )
    assert page_breaks >= 1, "缺少封面分页"
    assert len(document.sections) == 1
    assert len(document.tables) == 17
    assert len(document.inline_shapes) == 4

    print(
        "Competition DOCX check passed:",
        f"{len(required)} sections,",
        f"{len(document.tables)} tables,",
        f"{len(document.inline_shapes)} images,",
        f"{len(document.paragraphs)} paragraphs.",
    )


if __name__ == "__main__":
    main()
