from pathlib import Path
import os
import sys

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "artifacts" / "competition_assets"
DELIVERABLE = Path(
    os.environ.get(
        "COMPETITION_DOC_OUTPUT",
        str(ROOT / "deliverables" / "第九届传智杯-AI小程序赛道-识牛.docx"),
    )
)
PREVIEW = Path(
    r"C:\Users\潘苏杰\.codex\visualizations\2026\10\27"
    r"\01a17c08-70c2-7e22-af50-676e3b0aba6a\beef-yolo-classes-preview.png"
)
FOOD_IMAGE = ROOT / "assets" / "home" / "beef-camera.jpg"

ARCH_IMAGE = ASSETS / "architecture.png"
FLOW_IMAGE = ASSETS / "flow.png"

SKILL_SCRIPTS = Path(
    r"C:\Users\潘苏杰\.codex\plugins\cache\openai-primary-runtime\documents"
    r"\26.805.11740\skills\documents\scripts"
)
sys.path.insert(0, str(SKILL_SCRIPTS))
from table_geometry import apply_table_geometry  # noqa: E402


INK = RGBColor(24, 56, 46)
INK_SOFT = RGBColor(74, 91, 82)
BEEF = RGBColor(166, 62, 46)
GOLD = RGBColor(174, 128, 34)
PAPER = "#F7F3E9"
TABLE_FILL = "E8EEE5"
SOFT_FILL = "F4F0E7"
WHITE = "FFFFFF"
CONTENT_WIDTH_DXA = 9026

FONT_BODY = "Microsoft YaHei"
FONT_HEADING = "Microsoft YaHei"
FONT_MONO = "Consolas"
FONT_CN = "C:/Windows/Fonts/msyh.ttc"
FONT_CN_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
FONT_SERIF = "C:/Windows/Fonts/simsun.ttc"


def pil_font(size, bold=False, serif=False):
    if serif:
        return ImageFont.truetype(FONT_SERIF, size)
    return ImageFont.truetype(FONT_CN_BOLD if bold else FONT_CN, size)


def draw_center(draw, xy, text, size, fill, bold=False, serif=False):
    font = pil_font(size, bold, serif)
    box = draw.textbbox((0, 0), text, font=font)
    width = box[2] - box[0]
    draw.text((xy[0] - width / 2, xy[1]), text, font=font, fill=fill)


def make_architecture():
    width, height = 1800, 970
    image = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(image)
    draw.text((72, 44), "识牛 · 核心架构", font=pil_font(48, True, True), fill="#18382E")
    draw.text(
        (74, 111),
        "微信原生交互 + 分层服务适配 + 本地优先的数据策略",
        font=pil_font(22),
        fill="#68776E",
    )

    layers = [
        (
            "用户入口与场景",
            166,
            ["商超购买", "家庭烹饪", "火锅点单", "牛肉知识学习"],
            "#DCE7D5",
        ),
        (
            "微信小程序交互层",
            354,
            ["首页", "识别与 Canvas", "结果报告", "牛肉助手", "百科", "历史 / 个人中心"],
            "#F0E6D4",
        ),
        (
            "领域服务层",
            542,
            ["推理适配器", "AI 问答服务", "112 道菜谱库", "本地历史", "反馈服务"],
            "#F6E3DC",
        ),
        (
            "微信能力与数据层",
            730,
            ["wx.chooseMedia", "Canvas 2D", "本地存储 / 文件", "云函数 / 云存储", "分享"],
            "#E4ECE8",
        ),
    ]

    for title, y, boxes, fill in layers:
        draw.rounded_rectangle((72, y, 1728, y + 142), radius=28, fill=fill)
        draw.text((100, y + 20), title, font=pil_font(23, True), fill="#18382E")
        left = 420
        available = 1270
        gap = 16
        box_width = int((available - gap * (len(boxes) - 1)) / len(boxes))
        for index, label in enumerate(boxes):
            x = left + index * (box_width + gap)
            draw.rounded_rectangle(
                (x, y + 55, x + box_width, y + 119),
                radius=18,
                fill="#FFFDF7",
                outline="#CCD5CE",
                width=2,
            )
            draw_center(
                draw,
                ((x + x + box_width) / 2, y + 71),
                label,
                20,
                "#31493D",
            )

    draw.line((900, 309, 900, 343), fill="#A63E2E", width=5)
    draw.polygon(((890, 337), (910, 337), (900, 350)), fill="#A63E2E")
    draw.line((900, 496, 900, 531), fill="#A63E2E", width=5)
    draw.polygon(((890, 525), (910, 525), (900, 538)), fill="#A63E2E")
    draw.line((900, 684, 900, 719), fill="#A63E2E", width=5)
    draw.polygon(((890, 713), (910, 713), (900, 726)), fill="#A63E2E")
    draw.text(
        (74, 913),
        "外部能力：YOLO26 ONNX 端侧推理（已接入）/ 大模型 API（预留）/ QQ SMTP 反馈（云函数）",
        font=pil_font(19),
        fill="#6A786F",
    )
    image.save(ARCH_IMAGE)


def make_flow():
    width, height = 1800, 500
    image = Image.new("RGB", (width, height), PAPER)
    draw = ImageDraw.Draw(image)
    draw.text((64, 30), "核心用户流程", font=pil_font(40, True, True), fill="#18382E")
    steps = [
        ("01", "开始识别", "选择拍照或相册"),
        ("02", "本地预处理", "用户主动选图"),
        ("03", "端侧推理", "YOLO26 检测"),
        ("04", "结果解释", "部位 / 新鲜度 / 画框"),
        ("05", "延伸服务", "做法助手 / 百科 / 反馈"),
    ]
    start_x, y = 64, 150
    gap = 28
    box_width = int((width - 128 - gap * (len(steps) - 1)) / len(steps))
    for index, (number, title, subtitle) in enumerate(steps):
        x = start_x + index * (box_width + gap)
        fill = "#18382E" if index in (2, 4) else "#FFFDF7"
        fg = "#FFFDF7" if fill == "#18382E" else "#18382E"
        sub = "#B8C8BE" if fill == "#18382E" else "#738077"
        draw.rounded_rectangle((x, y, x + box_width, y + 220), radius=26, fill=fill, outline="#D5D8D2")
        draw.text((x + 22, y + 22), number, font=pil_font(18, True), fill="#D9B24C" if fill == "#18382E" else "#A63E2E")
        draw.text((x + 22, y + 63), title, font=pil_font(27, True, True), fill=fg)
        draw.text((x + 22, y + 110), subtitle, font=pil_font(19), fill=sub)
        if index < len(steps) - 1:
            arrow_x = x + box_width + 6
            draw.line((arrow_x, y + 110, arrow_x + 14, y + 110), fill="#A63E2E", width=4)
            draw.polygon(
                ((arrow_x + 14, y + 103), (arrow_x + 14, y + 117), (arrow_x + 24, y + 110)),
                fill="#A63E2E",
            )
    draw.rounded_rectangle((64, 400, 1736, 462), radius=18, fill="#E7DED0")
    draw.text(
        (86, 417),
        "隐私原则：用户主动选图；识别记录仅保存在本机；反馈由用户主动提交。",
        font=pil_font(20, True),
        fill="#5B4B42",
    )
    image.save(FLOW_IMAGE)


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_run_font(run, name=FONT_BODY, size=11, color=INK, bold=None, italic=None):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    run.font.color.rgb = color
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def prevent_row_split(row):
    tr_pr = row._tr.get_or_add_trPr()
    cant_split = OxmlElement("w:cantSplit")
    tr_pr.append(cant_split)


def add_page_field(paragraph):
    run = paragraph.add_run()
    begin = OxmlElement("w:fldChar")
    begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    separate = OxmlElement("w:fldChar")
    separate.set(qn("w:fldCharType"), "separate")
    placeholder = OxmlElement("w:t")
    placeholder.text = "1"
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([begin, instr, separate, placeholder, end])
    set_run_font(run, FONT_BODY, 8.5, RGBColor(120, 128, 121))


def set_last_image_alt(doc, alt_text):
    doc_pr = doc.inline_shapes[-1]._inline.docPr
    doc_pr.set("descr", alt_text)
    doc_pr.set("title", alt_text)


def set_cell_text(cell, text, bold=False, color=INK, size=9.5, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = ""
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    paragraph = cell.paragraphs[0]
    paragraph.alignment = align
    paragraph.paragraph_format.space_before = Pt(0)
    paragraph.paragraph_format.space_after = Pt(0)
    paragraph.paragraph_format.line_spacing = 1.15
    run = paragraph.add_run(str(text))
    set_run_font(run, FONT_BODY, size, color, bold)


def add_table(doc, headers, rows, widths, alignments=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    apply_table_geometry(
        table,
        widths,
        table_width_dxa=sum(widths),
        indent_dxa=120,
        cell_margins_dxa={"top": 90, "bottom": 90, "start": 120, "end": 120},
    )
    header = table.rows[0]
    set_repeat_table_header(header)
    prevent_row_split(header)
    for index, title in enumerate(headers):
        cell = header.cells[index]
        set_cell_shading(cell, "18382E")
        set_cell_text(
            cell,
            title,
            bold=True,
            color=RGBColor(255, 253, 247),
            size=9.3,
            align=WD_ALIGN_PARAGRAPH.CENTER,
        )

    for row_index, values in enumerate(rows):
        row = table.add_row()
        prevent_row_split(row)
        for index, value in enumerate(values):
            cell = row.cells[index]
            if row_index % 2 == 1:
                set_cell_shading(cell, "F7F4ED")
            alignment = WD_ALIGN_PARAGRAPH.LEFT
            if alignments and index < len(alignments):
                alignment = alignments[index]
            set_cell_text(cell, value, size=9.3, align=alignment)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_callout(doc, title, text, fill=SOFT_FILL):
    table = doc.add_table(rows=1, cols=1)
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    apply_table_geometry(
        table,
        [CONTENT_WIDTH_DXA],
        table_width_dxa=CONTENT_WIDTH_DXA,
        indent_dxa=170,
        cell_margins_dxa={"top": 120, "bottom": 120, "start": 170, "end": 170},
    )
    cell = table.cell(0, 0)
    set_repeat_table_header(table.rows[0])
    set_cell_shading(cell, fill)
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(title)
    set_run_font(r, FONT_HEADING, 10, INK, True)
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_after = Pt(0)
    p2.paragraph_format.line_spacing = 1.2
    r2 = p2.add_run(text)
    set_run_font(r2, FONT_BODY, 9.5, INK_SOFT)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def add_heading(doc, text, level):
    paragraph = doc.add_heading(text, level=level)
    paragraph.paragraph_format.keep_with_next = True
    return paragraph


def add_body(doc, text, bold_prefix=None):
    paragraph = doc.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    if bold_prefix and text.startswith(bold_prefix):
        first = paragraph.add_run(bold_prefix)
        set_run_font(first, FONT_BODY, 11, INK, True)
        rest = paragraph.add_run(text[len(bold_prefix):])
        set_run_font(rest, FONT_BODY, 11, INK_SOFT)
    else:
        run = paragraph.add_run(text)
        set_run_font(run, FONT_BODY, 11, INK_SOFT)
    return paragraph


def add_bullet(doc, text):
    paragraph = doc.add_paragraph(style="List Bullet")
    paragraph.paragraph_format.left_indent = Inches(0.375)
    paragraph.paragraph_format.first_line_indent = Inches(-0.194)
    paragraph.paragraph_format.space_after = Pt(4)
    paragraph.paragraph_format.line_spacing = 1.208
    run = paragraph.add_run(text)
    set_run_font(run, FONT_BODY, 10.5, INK_SOFT)
    return paragraph


def add_numbered_step(doc, text):
    paragraph = doc.add_paragraph(style="List Number")
    paragraph.paragraph_format.left_indent = Inches(0.375)
    paragraph.paragraph_format.first_line_indent = Inches(-0.194)
    paragraph.paragraph_format.space_after = Pt(4)
    paragraph.paragraph_format.line_spacing = 1.208
    run = paragraph.add_run(text)
    set_run_font(run, FONT_BODY, 10.5, INK_SOFT)
    return paragraph


def add_code_block(doc, code):
    table = doc.add_table(rows=1, cols=1)
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    apply_table_geometry(
        table,
        [CONTENT_WIDTH_DXA],
        table_width_dxa=CONTENT_WIDTH_DXA,
        indent_dxa=170,
        cell_margins_dxa={"top": 120, "bottom": 120, "start": 170, "end": 170},
    )
    cell = table.cell(0, 0)
    set_repeat_table_header(table.rows[0])
    set_cell_shading(cell, "203B31")
    cell.text = ""
    for index, line in enumerate(code.strip("\n").splitlines()):
        p = cell.paragraphs[0] if index == 0 else cell.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.1
        run = p.add_run(line)
        set_run_font(run, FONT_MONO, 8.5, RGBColor(241, 238, 226))
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def configure_document(doc):
    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.2)
    section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(2.2)
    section.right_margin = Cm(2.2)
    section.header_distance = Cm(1.0)
    section.footer_distance = Cm(1.0)
    section.different_first_page_header_footer = True

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = FONT_BODY
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_BODY)
    normal.font.size = Pt(11)
    normal.font.color.rgb = INK_SOFT
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    normal.paragraph_format.space_before = Pt(0)
    normal.paragraph_format.space_after = Pt(8)
    normal.paragraph_format.line_spacing = 1.333

    h1 = styles["Heading 1"]
    h1.font.name = FONT_HEADING
    h1._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_HEADING)
    h1.font.size = Pt(16)
    h1.font.bold = True
    h1.font.color.rgb = INK
    h1.paragraph_format.space_before = Pt(18)
    h1.paragraph_format.space_after = Pt(10)

    h2 = styles["Heading 2"]
    h2.font.name = FONT_HEADING
    h2._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_HEADING)
    h2.font.size = Pt(13)
    h2.font.bold = True
    h2.font.color.rgb = BEEF
    h2.paragraph_format.space_before = Pt(12)
    h2.paragraph_format.space_after = Pt(6)

    h3 = styles["Heading 3"]
    h3.font.name = FONT_HEADING
    h3._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_HEADING)
    h3.font.size = Pt(12)
    h3.font.bold = True
    h3.font.color.rgb = RGBColor(78, 102, 88)
    h3.paragraph_format.space_before = Pt(8)
    h3.paragraph_format.space_after = Pt(4)

    for section_item in doc.sections:
        header = section_item.header
        header_p = header.paragraphs[0]
        header_p.text = ""
        header_p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        header_run = header_p.add_run("第九届传智杯 · AI小程序赛道  |  识牛")
        set_run_font(header_run, FONT_BODY, 8.5, RGBColor(128, 136, 129))

        footer = section_item.footer
        footer_p = footer.paragraphs[0]
        footer_p.text = ""
        footer_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        label = footer_p.add_run("识牛作品文档  ·  ")
        set_run_font(label, FONT_BODY, 8.5, RGBColor(128, 136, 129))
        add_page_field(footer_p)


def add_cover(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(28)
    p.paragraph_format.space_after = Pt(16)
    run = p.add_run("第九届传智杯  /  AI 小程序赛道")
    set_run_font(run, FONT_BODY, 11, RGBColor(179, 65, 48), True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    run = p.add_run("识牛")
    set_run_font(run, FONT_HEADING, 34, INK, True)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(8)
    run = p.add_run("AI 牛肉识别与烹饪知识小程序")
    set_run_font(run, FONT_BODY, 16, RGBColor(75, 94, 83))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(22)
    run = p.add_run("看得准，吃得明白。")
    set_run_font(run, FONT_HEADING, 11, GOLD, True)

    if FOOD_IMAGE.exists():
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.add_run().add_picture(str(FOOD_IMAGE), width=Inches(5.4))
        set_last_image_alt(doc, "识牛小程序首页牛肉视觉素材")

    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    add_table(
        doc,
        ["作品信息", "内容"],
        [
            ("作品名称", "识牛"),
            ("作品形态", "原生微信小程序"),
            ("作品方向", "AI 图像识别、烹饪知识问答与本地数据服务"),
            ("当前版本", "V1.0 · 前端与 AI 能力接口版本"),
            ("文档日期", "2026 年 11 月"),
        ],
        [1900, 7126],
        [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT],
    )

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(22)
    run = p.add_run("参赛作品文档")
    set_run_font(run, FONT_BODY, 10.5, RGBColor(119, 129, 121))
    p.add_run().add_break(WD_BREAK.PAGE)


def build_document():
    ASSETS.mkdir(parents=True, exist_ok=True)
    DELIVERABLE.parent.mkdir(parents=True, exist_ok=True)
    make_architecture()
    make_flow()

    doc = Document()
    configure_document(doc)
    add_cover(doc)

    add_heading(doc, "作品摘要", 1)
    add_body(
        doc,
        "识牛是一款面向牛肉消费与家庭烹饪场景的微信小程序。作品围绕“选肉、认肉、做肉”三个连续需求，将用户主动拍摄或选择的牛肉图片、部位知识、烹饪做法和本地识别记录组织为一条清晰的产品链路。用户既可以先识别部位再询问做法，也可以直接围绕牛肉提问，并查阅中式分割、潮汕火锅叫法、新鲜度与保存知识。",
    )
    add_body(
        doc,
        "产品坚持本地优先：识别历史与图片仅保存在当前设备，未提供云端同步；登录只用于保存头像昵称。当前版本已将 YOLO26 导出的 ONNX 检测模型和独立新鲜度分类模型接入端侧推理链路，模型由云存储下载并缓存在本机。做法助手仍使用本地知识回答，生产级大模型服务保留独立接口。",
    )
    add_callout(
        doc,
        "本版本的一句话定位",
        "从“这块牛肉是什么”出发，连接部位认知、新鲜度判断、烹饪做法和本地记录，让普通用户也能把牛肉看得明白、吃得放心。",
    )

    add_heading(doc, "一、项目说明", 1)
    add_heading(doc, "1.1 功能定位与价值", 2)
    add_body(
        doc,
        "牛肉部位命名不统一、价格口径复杂、菜谱术语分散，是家庭用户和餐饮初学者常见的学习门槛。识牛用图像识别作为入口，用结构化知识降低理解成本，并用情景化问答承接后续操作，形成“识别结果不是终点，而是烹饪服务起点”的体验。",
    )
    add_bullet(doc, "识别：支持相机拍摄与相册选图，完成端侧推理适配、加载进度、Canvas 检测框与结果报告。")
    add_bullet(doc, "理解：以中式分割名称作为主称呼，识别主链路覆盖肩肉、里脊、牛腩、臀肉、外脊 5 个模型类别，并结合百科知识及潮汕火锅别名。")
    add_bullet(doc, "行动：提供做法助手、112 道牛肉菜谱、技法兜底、百科与保存指南。")
    add_bullet(doc, "记录：识别结果与图片只保存在本机，用户可查看、删除或清空。")
    add_bullet(doc, "反馈：用户可在识别报告中提交纠错类型、备注和可选图片，云端邮件函数负责发送给管理员。")

    add_heading(doc, "1.2 目标用户与使用场景", 2)
    add_table(
        doc,
        ["目标用户", "典型场景", "核心需求"],
        [
            ("家庭烹饪用户", "超市采购、冰箱备餐、晚餐做菜", "快速辨认部位，知道适合怎么吃"),
            ("火锅消费者", "潮汕火锅点单、菜市场购买", "理解吊龙、脖仁、匙仁等名称与中式部位关系"),
            ("烹饪学习用户", "查看菜谱、判断新鲜度、学习保存", "用统一、可追溯的知识减少试错"),
            ("内容与商家运营者", "菜品介绍、食材内容制作", "结构化牛肉知识和可扩展的前端入口"),
        ],
        [1900, 2900, 4226],
    )

    add_heading(doc, "1.3 页面与功能结构", 2)
    add_table(
        doc,
        ["页面", "主要功能", "当前实现"],
        [
            ("首页", "品牌入口、识别 CTA、热门部位、助手与百科入口", "已完成"),
            ("识别页", "相机 / 相册选图、ONNX 模型加载、Canvas 检测框、结果卡片", "已接入 YOLO26 与新鲜度模型"),
            ("结果页", "部位、新鲜度、依据、做法、反馈、本地保存说明", "已完成"),
            ("牛肉做法助手", "自由提问、快捷问题、话题审核、部位上下文", "已完成前端与本地回答"),
            ("百科页", "中式部位、新鲜度、保存指南、价格参考", "已完成 20 条内容"),
            ("历史页", "本地记录、删除、清空", "已完成，仅本地"),
            ("登录 / 个人中心", "游客模式、微信资料、缓存与隐私", "已完成，登录默认演示模式"),
        ],
        [1700, 4726, 2600],
    )

    add_heading(doc, "1.4 核心用户流程", 2)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(FLOW_IMAGE), width=Inches(6.15))
    set_last_image_alt(doc, "识牛核心用户流程图")
    cap = doc.add_paragraph("图 1  识牛核心用户流程")
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(10)
    for item in [
        "用户从首页进入识别页，主动点击相机取景框或“打开相机”按钮；也可从相册选择图片。",
        "图片读取后复制到小程序本地目录，展示模型加载进度并在 Canvas 中绘制原图与检测框。",
        "识别结果以部位、新鲜度、判断依据、做法建议和推荐菜谱呈现，并自动写入本地历史。",
        "用户可继续进入牛肉做法助手，当前识别部位会作为固定上下文传入问答服务。",
        "用户可在结果页提交纠错反馈；反馈图片与内容通过云函数发送至管理员邮箱。",
    ]:
        add_numbered_step(doc, item)

    add_heading(doc, "二、小程序与 AI 能力说明", 1)
    add_heading(doc, "2.1 微信小程序能力调用", 2)
    add_table(
        doc,
        ["能力", "调用方式", "状态与用途"],
        [
            ("微信登录 / 用户资料", "wx.login、wx.getUserProfile", "已实现前端；默认模拟登录，正式 code 换登录态需后端"),
            ("拍照 / 相册", "wx.chooseMedia，兼容 wx.chooseImage", "已实现；必须由用户主动选择，单图压缩"),
            ("Canvas 标注", "Canvas 2D", "已实现原图绘制、检测框与标签叠加"),
            ("分享", "open-type=\"share\"，onShareAppMessage", "已实现识别报告分享"),
            ("本地存储", "wx.setStorageSync、文件系统", "已实现记录、偏好与图片持久化"),
            ("云开发", "wx.cloud.callFunction、uploadFile、云数据库", "已实现反馈云函数；需配置云环境和 SMTP"),
            ("支付 / 地图 / 订阅消息 / OCR / 语音", "未调用", "当前版本未使用"),
        ],
        [2000, 3300, 3726],
    )

    add_heading(doc, "2.2 AI 能力分层", 2)
    add_table(
        doc,
        ["AI 能力", "当前实现", "正式接入方向"],
        [
            ("图像部位识别", "YOLO26 ONNX 端侧检测、NMS 与 Canvas 标注", "当前支持肩肉、里脊、牛腩、臀肉、外脊 5 类"),
            ("新鲜度评估", "独立 ONNX 分类模型输出新鲜/不新鲜概率", "与部位检测置信度分离，避免混淆两个指标"),
            ("烹饪问答", "本地规则 + 112 道菜谱 + 技法兜底", "后端大模型 + RAG 知识库 + 服务器端限流与审核"),
            ("话题审核", "牛肉主体、真实意图、其他肉类、无关话题多层判断", "服务端语义分类器复核"),
            ("知识检索", "结构化百科与菜名匹配", "后续可演进为向量检索 RAG"),
            ("Agent / 多步规划", "未使用", "后续可扩展配菜、采购与步骤编排 Agent"),
        ],
        [1900, 3500, 3626],
    )
    add_callout(
        doc,
        "能力边界说明",
        "当前提交版本已接入 YOLO26 ONNX 部位检测模型与新鲜度分类模型，模型从云存储下载并缓存在本机，默认关闭模拟回退。真实大模型回答尚未部署，助手页当前使用本地知识逻辑；这一边界在演示与上线计划中保持一致。",
        "F5E6DF",
    )

    add_heading(doc, "三、创新点说明", 1)
    add_table(
        doc,
        ["创新维度", "创新点", "用户/技术证据"],
        [
            ("AI 应用创新", "将部位识别与烹饪问答串成连续链路，而非孤立图像分类", "识别结果自动成为助手上下文；可替换推理适配器"),
            ("场景创新", "中式分割与潮汕火锅叫法合并，减少“一肉多名”的理解成本", "7 组潮汕叫法并入对应中式部位，112 道菜谱"),
            ("产品创新", "识别、百科、做法和价格信息在同一小程序闭环", "8 个页面覆盖从选肉到做菜"),
            ("技术创新", "本地优先服务层 + 可替换 AI 网关 + 多层话题守卫", "按原型分离页面与能力，方便接 YOLO26 / 大模型"),
            ("体验创新", "用户主动选图、游客可用、本机记录，降低隐私与登录门槛", "chooseMedia 用户授权流程；历史仅本地"),
            ("商业模式创新", "工具内容 + 商家知识服务的双边延展潜力", "可面向用户免费、面向商家提供部位价格与内容服务"),
        ],
        [1900, 3800, 3326],
    )
    add_body(
        doc,
        "核心差异化不是“替用户查一个名称”，而是把一次识别转化为一串可执行的信息：当前是哪一块肉、属于哪个中式部位、潮汕火锅怎么称呼、价格是什么口径、适合哪种做法、用户还能继续问什么。",
    )

    add_heading(doc, "四、技术实现", 1)
    add_heading(doc, "4.1 核心架构", 2)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(ARCH_IMAGE), width=Inches(6.15))
    set_last_image_alt(doc, "识牛前端、服务适配与微信能力分层架构图")
    cap = doc.add_paragraph("图 2  识牛前端、服务适配与微信能力分层架构")
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(10)

    add_heading(doc, "4.2 前端与页面组织", 2)
    add_body(
        doc,
        "项目使用原生微信小程序技术栈（WXML、WXSS、JavaScript），不依赖第三方框架。页面、组件、服务和数据分层组织：pages 负责页面交互，components 提供底部导航与安全区占位，services 封装推理、AI、登录、历史和反馈，data 保存百科、菜谱与价格数据。",
    )
    add_code_block(
        doc,
        """
pages/
  index/ detect/ result/ assistant/
  wiki/ history/ login/ profile/
services/
  inference.js  ai.js  auth.js
  history.js    cloud.js
data/
  encyclopedia.js  beefRecipes.js
components/
  bottom-nav/ safe-top/
""",
    )

    add_heading(doc, "4.3 图片选择与本地处理", 2)
    add_body(
        doc,
        "选图严格遵循“用户主动触发”原则。当前端只通过微信媒体选择器拿到用户选中的临时路径，无法遍历或静默读取相册。选图后会复制到小程序用户目录，降低临时文件失效造成的记录损失。",
    )
    add_code_block(
        doc,
        """
wx.chooseMedia({
  count: 1,
  mediaType: ['image'],
  sourceType: [sourceType], // camera | album
  sizeType: ['compressed'],
  success(result) {
    const file = result.tempFiles[0]
    // 只处理用户明确选中并获得授权的图片
  }
})
""",
    )

    add_heading(doc, "4.4 AI 接入方案", 2)
    add_body(
        doc,
        "端侧识别层采用适配器模式，页面只依赖 loadModel(onProgress) 和 recognize(photoPath, onProgress) 两个接口。services/onnxInference.js 负责云模型下载、缓存校验、letterbox 预处理、YOLO26 输出解析、NMS、类别映射与归一化检测框输出。检测模型输出 5 类：beef_chuck、beef_fillet、beef_flank、beef_round 和 strip_loin，分别映射到肩肉、里脊、牛腩、臀肉和外脊。",
    )
    add_body(
        doc,
        "做法助手采用统一 askBeefAssistant(payload) 入口。请求包含结构化部位、新鲜度、问题 ID、菜名与话题策略；服务端可据此调用文心一言、通义千问等模型，并执行输入清洗、限流、内容审核与 Prompt 控制。",
    )
    add_code_block(
        doc,
        """
const result = await askBeefAssistant({
  questionId: 'custom',
  question: '杭椒牛柳怎么做',
  context: {
    cutId: 'tenderloin',
    cutName: '里脊',
    freshness: 88
  },
  dishName: '杭椒牛柳',
  policy: 'beef-cooking-context-v1'
})
""",
    )

    add_heading(doc, "4.5 话题守卫与知识路由", 2)
    add_body(
        doc,
        "助手不只检查是否出现“牛肉”关键词，而是组合主体、意图和上下文：先拦截股票、编程、写作和其他肉类，再判断是否为真实牛肉问题；存在识别结果时要求回答围绕当前部位。内置 112 道菜谱名与技法兜底，未命中的具体菜名可按“炒、炖、卤、蒸、烤”等技法给出基础路径。",
    )
    add_code_block(
        doc,
        """
if (OFF_TOPIC_TERMS.test(question)) return reject();
if (OTHER_MEAT_TERMS.test(question) && !hasBeefSubject) return reject();

if (hasRecognizedCut) return allow();

return (matchedDish ||
  (hasBeefSubject && hasFoodIntent))
  ? allow()
  : askForClearerQuestion();
""",
    )

    add_heading(doc, "4.6 技术难点与解决方案", 2)
    add_table(
        doc,
        ["难点", "解决方案", "效果"],
        [
            ("PyTorch 模型无法直接运行在小程序", "通过 ONNX / TFLite / WASM 或微信推理插件适配，保留统一推理接口", "页面与模型解耦"),
            ("模型体积和手机性能限制", "端侧量化、分辨率限制、缓存与进度提示；必要时切后端推理", "可渐进接入"),
            ("部位名称和菜名高度分散", "结构化百科 + 菜名别名 + 技法兜底 + 部位上下文", "112 道菜名与 20 条百科"),
            ("无关问题和“伪牛肉问题”", "主体、意图、上下文、反例测试联合判断", "40 个审核用例通过"),
            ("不同机型顶部遮挡", "状态栏高度 + 胶囊按钮几何 + 额外安全间距", "全页面统一安全区组件"),
            ("历史记录隐私", "仅使用本机存储和本地文件，不提供云同步", "删除/清空即可清除记录"),
        ],
        [2400, 4000, 2626],
    )

    add_heading(doc, "五、成果展示", 1)
    add_heading(doc, "5.1 功能界面", 2)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(PREVIEW), width=Inches(6.15))
    set_last_image_alt(doc, "识牛小程序里脊识别结果、模型类别和里脊百科详情界面")
    cap = doc.add_paragraph("图 3  开发版核心页面界面预览（最终效果以微信开发者工具编译为准）")
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(10)
    add_body(
        doc,
        "界面以暖米色纸感、深绿主色和牛肉红强调色构成统一视觉系统，突出部位名称、新鲜状态和烹饪建议。首页承担识别入口与知识导航，识别页提供明确的加载反馈与检测框，结果页把数据解释成可行动建议，助手页采用锁定部位的自由提问方式。",
    )

    add_heading(doc, "5.2 关键流程演示建议", 2)
    add_body(
        doc,
        "比赛演示录屏建议控制在 90 秒内：首页展示产品定位与识别入口；选择一张图片并展示加载过程；在结果页解释部位、新鲜度和判断依据；进入助手提出一个与当前部位相关的做法问题；最后打开百科与反馈面板，说明知识库、本地记录与反馈闭环。",
    )

    add_heading(doc, "5.3 测试记录", 2)
    add_table(
        doc,
        ["测试项", "覆盖范围", "结果"],
        [
            ("项目结构检查", "JSON、JS 语法、WXML 标签、事件绑定、页面文件完整性", "通过"),
            ("助手话题审核", "真牛肉、伪牛肉、无关话题、其他肉类、菜名与跨部位场景", "40 个用例通过"),
            ("牛肉菜谱库", "112 道菜名均可命中并生成做法步骤", "全部通过"),
            ("价格单位", "21 条价格记录统一为元/斤", "全部通过"),
            ("反馈邮件配置", "目标邮箱、云函数目录、云函数入口与依赖声明", "通过；邮件发送仍需云环境与授权码"),
            ("端侧模型接入", "YOLO26 ONNX 检测、新鲜度分类、云模型下载与本地缓存", "代码已接入；提交前需完成目标真机验收"),
            ("视觉渲染", "本次 Word 文档逐页渲染检查", "已完成"),
        ],
        [2200, 5000, 1826],
    )
    add_callout(
        doc,
        "成果状态",
        "前端页面、知识库、助手交互、本地历史与反馈闭环已经形成可演示版本；真实模型输出、外部大模型回答和邮件发送属于部署前配置项，不能视为已经上线。",
        "F5E6DF",
    )

    add_heading(doc, "六、历史说明", 1)
    add_body(
        doc,
        "本作品无往届成果迭代记录。没有沿用历史版本、历史奖项或往届作品成果，因此历史说明填写为“无”。当前版本为第九届传智杯 AI 小程序赛道首次提交版本。",
    )

    add_heading(doc, "七、落地规划", 1)
    add_heading(doc, "7.1 上线计划", 2)
    add_table(
        doc,
        ["阶段", "时间", "主要任务", "验收标准"],
        [
            ("模型优化期", "2026.11-2026.12", "扩充分割类别、真机性能调优、误识别样本回流与模型回归", "真实图片稳定输出类别与框"),
            ("封闭测试期", "2027.01-2027.02", "商家与校园用户试用、对话审核、真机性能优化", "稳定完成核心链路"),
            ("首发期", "2027.03", "小程序审核、反馈云函数部署、内容与帮助中心完善", "公开版本上线"),
            ("扩展期", "2027.04 起", "新鲜度模型、RAG 问答、商家知识与数据服务", "形成可运营的版本节奏"),
        ],
        [1600, 1900, 3700, 1826],
    )

    add_heading(doc, "7.2 用户增长和运营", 2)
    add_bullet(doc, "校园与社区试点：围绕“牛肉部位识别”“火锅点单扫盲”组织轻量体验活动，收集真实图片与问题。")
    add_bullet(doc, "内容增长：将高频部位、菜谱和保存问题整理成可分享知识卡，分享页回流到小程序。")
    add_bullet(doc, "商家合作：与生鲜店、肉铺和火锅店共创部位名称、价格口径和推荐做法。")
    add_bullet(doc, "反馈闭环：反馈通过云函数邮件发送到管理员邮箱，按周整理误识别图片、菜谱缺口与话题误判。")
    add_bullet(doc, "模型更新：建立“错误样本 - 标注 - 训练 - 回归测试 - 发布”的周期化迭代机制。")

    add_heading(doc, "7.3 商业闭环", 2)
    add_body(
        doc,
        "基础识别、百科和本地历史保持免费，优先建立可信度与使用频率。中期可围绕生鲜商家提供部位内容、菜单解释与知识接口服务；围绕烹饪内容提供精选菜谱和个性化备餐；围绕品牌合作提供可审核的牛肉知识与菜谱内容。所有商业扩展不改变用户主动授权和本地优先原则。",
    )

    add_heading(doc, "7.4 后续版本方向", 2)
    add_table(
        doc,
        ["版本方向", "优先级", "说明"],
        [
            ("YOLO26 真机优化", "P0", "完善量化、加速、低端机兼容与真实场景准确率"),
            ("真实大模型服务", "P0", "接入合规后端，完成 RAG、限流、内容安全和会话日志"),
            ("新鲜度模型", "P1", "独立训练颜色、脂肪、纹理分类，并明确不可替代食品安全检测"),
            ("商家反馈与管理", "P1", "反馈样本分类、错误标注和模型迭代看板"),
            ("语音与 OCR", "P2", "面向老年用户、包装标签和菜单扫描扩展输入方式"),
        ],
        [2300, 1000, 5726],
        [WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT],
    )

    add_heading(doc, "结语", 1)
    add_body(
        doc,
        "识牛把“看懂牛肉”做成一次可被解释、被追问、被记录的服务。作品当前已完成 YOLO26 端侧检测、新鲜度分类、产品骨架与可扩展的 AI 服务接口，下一步的关键是接入生产级大模型、扩充训练类别，并在真实场景中持续验证准确性、隐私与易用性。",
    )

    doc.save(DELIVERABLE)
    print(DELIVERABLE)


if __name__ == "__main__":
    build_document()
