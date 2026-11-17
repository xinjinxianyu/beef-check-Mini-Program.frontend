from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


WIDTH = 1600
HEIGHT = 1050

INK = "#18382E"
INK_LIGHT = "#315247"
PAPER = "#F7F3E9"
CARD = "#FFFDF7"
BEEF = "#D9543D"
YELLOW = "#F2C85B"
SAGE = "#E3EADC"
SOFT = "#6A786F"
MUTED = "#929C95"
LINE = "#E5E1D8"

FONT_REGULAR = "C:/Windows/Fonts/msyh.ttc"
FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
FONT_SERIF = "C:/Windows/Fonts/simsun.ttc"

OUTPUT = Path(
    r"C:/Users/潘苏杰/.codex/visualizations/2026/10/27/"
    r"01a17c08-70c2-7e22-af50-676e3b0aba6a/beef-mini-program-preview.png"
)


def font(size, bold=False, serif=False):
    if serif:
        return ImageFont.truetype(FONT_SERIF, size)
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def text(draw, xy, content, size, fill=INK, bold=False, serif=False, anchor=None):
    draw.text(xy, content, font=font(size, bold, serif), fill=fill, anchor=anchor)


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def paragraph(draw, xy, content, size, fill=SOFT, width=250, gap=7, bold=False):
    x, y = xy
    current = ""
    lines = []
    text_font = font(size, bold)
    for char in content:
        candidate = current + char
        if draw.textlength(candidate, font=text_font) > width and current:
            lines.append(current)
            current = char
        else:
            current = candidate
    if current:
        lines.append(current)
    for line in lines:
        draw.text((x, y), line, font=text_font, fill=fill)
        y += size + gap
    return y


def line(draw, p1, p2, fill=LINE, width=1):
    draw.line((*p1, *p2), fill=fill, width=width)


def label(draw, xy, content, bg, fg, size=11, pad_x=9, pad_y=5):
    x, y = xy
    text_font = font(size, True)
    width = int(draw.textlength(content, font=text_font)) + pad_x * 2
    height = size + pad_y * 2
    rounded(draw, (x, y, x + width, y + height), height / 2, bg)
    draw.text((x + pad_x, y + pad_y - 1), content, font=text_font, fill=fg)
    return width


def status_bar(draw, x, y, width):
    text(draw, (x + 20, y + 10), "9:41", 10, INK, True)
    text(draw, (x + width - 20, y + 10), "|||  o  >", 10, INK, True, anchor="ra")


def bottom_nav(draw, x, y, width, active):
    rounded(draw, (x + 12, y, x + width - 12, y + 62), 20, INK)
    items = [
        ("田", "首页"),
        ("◎", "识别"),
        ("◌", "助手"),
        ("典", "百科"),
        ("人", "我的"),
    ]
    cell = (width - 24) / len(items)
    for index, (icon, name) in enumerate(items):
        cx = x + 12 + cell * (index + 0.5)
        is_active = name == active
        color = CARD if is_active else "#8A9A90"
        if name == "识别":
            draw.ellipse((cx - 24, y - 22, cx + 24, y + 26), fill=BEEF, outline=PAPER, width=5)
            text(draw, (cx, y + 1), icon, 17, CARD, True, anchor="mm")
            color = CARD if is_active else "#9EAAA2"
        else:
            text(draw, (cx, y + 16), icon, 15, color, serif=True, anchor="mm")
        text(draw, (cx, y + 39), name, 9, color, anchor="mm")


def phone_frame(canvas, draw, x, y, width, height):
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    rounded(shadow_draw, (x + 8, y + 18, x + width + 8, y + height + 18), 44, (0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    canvas.alpha_composite(shadow)
    rounded(draw, (x, y, x + width, y + height), 42, "#FCFCFA", "#ECECE8", 2)
    rounded(draw, (x + 7, y + 7, x + width - 7, y + height - 7), 35, PAPER)
    rounded(draw, (x + width / 2 - 42, y + 8, x + width / 2 + 42, y + 22), 8, "#14261F")


def brand(draw, x, y):
    rounded(draw, (x, y, x + 32, y + 32), 10, INK)
    text(draw, (x + 16, y + 15), "牧", 17, CARD, True, serif=True, anchor="mm")
    text(draw, (x + 43, y + 1), "识牛", 17, INK, True, serif=True)
    text(draw, (x + 43, y + 22), "BEEF ATLAS", 7, MUTED)


def home_screen(canvas, draw, x, y, width, height):
    phone_frame(canvas, draw, x, y, width, height)
    sx, sy = x + 20, y + 30
    status_bar(draw, x + 7, sy, width - 14)
    brand(draw, sx, sy + 34)
    rounded(draw, (sx + width - 78, sy + 31, sx + width - 38, sy + 71), 20, CARD, LINE)
    text(draw, (sx + width - 58, sy + 50), "游", 13, BEEF, True, serif=True, anchor="mm")

    text(draw, (sx, sy + 94), "端侧识别 · 隐私留在本机", 9, BEEF, True)
    text(draw, (sx, sy + 113), "看得准，", 40, INK, True, serif=True)
    text(draw, (sx, sy + 157), "吃得明白。", 40, BEEF, True, serif=True)
    paragraph(draw, (sx, sy + 211), "拍下牛肉，识别部位与新鲜度，再问一句怎么做。", 12, SOFT, 260)

    card = (sx, sy + 254, sx + width - 40, sy + 495)
    rounded(draw, card, 24, INK)
    draw.ellipse((sx + 230, sy + 267, sx + 430, sy + 470), outline="#2D4C40", width=1)
    label(draw, (sx + 14, sy + 270), "AI 识别", "#27473A", CARD, 8)
    text(draw, (sx + width - 52, sy + 278), "首次加载约 3 MB", 7, "#A1AEA7", anchor="ra")
    draw.ellipse((sx + 36, sy + 322, sx + 267, sy + 441), fill="#E7DFCF", outline="#F7F1E4", width=2)
    draw.ellipse((sx + 82, sy + 343, sx + 221, sy + 418), fill=BEEF, outline="#922E25", width=4)
    line(draw, (sx + 20, sy + 371), (sx + width - 65, sy + 371), "#B9A454", 2)
    label(draw, (sx + 23, sy + 300), "● 里脊", "#142E24", CARD, 8)
    label(draw, (sx + 235, sy + 405), "新鲜", "#142E24", CARD, 8)
    rounded(draw, (sx + 12, sy + 438, sx + width - 52, sy + 484), 15, CARD)
    text(draw, (sx + 32, sy + 450), "拍照识别牛肉", 13, INK, True)
    text(draw, (sx + 32, sy + 468), "支持相机与相册", 8, MUTED)
    draw.ellipse((sx + width - 89, sy + 448, sx + width - 63, sy + 474), fill=INK)
    text(draw, (sx + width - 76, sy + 461), "↗", 13, CARD, anchor="mm")

    text(draw, (sx + 4, sy + 523), "◎  本地计算", 10, INK, True)
    text(draw, (sx + 4, sy + 539), "    图片不出设备", 8, MUTED)
    text(draw, (sx + 155, sy + 523), "◷  0 次", 10, INK, True)
    text(draw, (sx + 155, sy + 539), "    我的识别记录", 8, MUTED)

    text(draw, (sx, sy + 578), "KNOW-HOW", 8, BEEF, True)
    text(draw, (sx, sy + 596), "从识肉到做菜", 20, INK, True, serif=True)
    rounded(draw, (sx, sy + 635, sx + width - 40, sy + 721), 18, BEEF)
    text(draw, (sx + 15, sy + 650), "AI · 标准问答", 7, "#F8DCD4", True)
    text(draw, (sx + 15, sy + 668), "牛肉做法助手", 18, CARD, True, serif=True)
    text(draw, (sx + 15, sy + 694), "结合部位，快速获得烹饪建议", 8, "#F8E3DD")
    draw.ellipse((sx + width - 108, sy + 650, sx + width - 62, sy + 696), outline="#F18B78", width=1)
    draw.ellipse((sx + width - 96, sy + 662, sx + width - 74, sy + 684), fill=YELLOW)
    text(draw, (sx + width - 85, sy + 673), "问", 12, INK, True, serif=True, anchor="mm")
    bottom_nav(draw, x + 7, y + height - 80, width - 14, "首页")


def wiki_screen(canvas, draw, x, y, width, height):
    phone_frame(canvas, draw, x, y, width, height)
    sx, sy = x + 20, y + 30
    status_bar(draw, x + 7, sy, width - 14)
    brand(draw, sx, sy + 34)
    label(draw, (sx + width - 113, sy + 34), "问助手", INK, CARD, 8)

    rounded(draw, (sx, sy + 82, sx + width - 40, sy + 271), 25, INK)
    text(draw, (sx + 18, sy + 102), "FIELD NOTES · 01", 8, YELLOW, True)
    text(draw, (sx + 18, sy + 126), "看懂牛肉，", 28, CARD, True, serif=True)
    text(draw, (sx + 18, sy + 159), "再决定怎么吃。", 28, CARD, True, serif=True)
    paragraph(draw, (sx + 18, sy + 204), "从部位、价格到新鲜度与保存方式，把选肉问题整理成随手可查的图谱。", 9, "#AEBDB4", 235, 4)
    draw.ellipse((sx + 245, sy + 94, sx + 365, sy + 214), outline="#426052", width=1)
    draw.arc((sx + 270, sy + 112, sx + 340, sy + 190), 180, 355, fill=YELLOW, width=3)
    text(draw, (sx + 305, sy + 164), "牛", 24, YELLOW, True, serif=True, anchor="mm")
    line(draw, (sx + 18, sy + 248), (sx + width - 60, sy + 248), "#3A564A")
    text(draw, (sx + 18, sy + 255), "24 篇内容", 8, YELLOW, True)

    tabs = ["中式部位", "潮汕火锅", "新鲜度", "保存"]
    tab_y = sy + 286
    rounded(draw, (sx, tab_y, sx + width - 40, tab_y + 48), 15, CARD, LINE)
    for i, title in enumerate(tabs):
        left = sx + 5 + i * 70
        if i == 0:
            rounded(draw, (left, tab_y + 5, left + 66, tab_y + 43), 10, INK)
            text(draw, (left + 33, tab_y + 24), title, 7, CARD, True, anchor="mm")
        else:
            text(draw, (left + 33, tab_y + 24), title, 7, MUTED, anchor="mm")

    paragraph(draw, (sx + 3, sy + 346), "本类说明  河北为排酸鲜品，山东为冷冻分割品，等级与修清程度会影响价格。", 7, SOFT, 280, 3)
    rounded(draw, (sx, sy + 388, sx + width - 40, sy + 430), 11, "#FCF0EB")
    text(draw, (sx + 10, sy + 400), "¥", 10, CARD, True, anchor="mm")
    draw.ellipse((sx + 3, sy + 393, sx + 19, sy + 409), fill=BEEF)
    paragraph(draw, (sx + 25, sy + 394), "价格为量级参考，购买时以实际等级和渠道为准。", 7, "#8A5D53", 265, 2)

    text(draw, (sx, sy + 447), "QUICK REFERENCE", 7, BEEF, True)
    text(draw, (sx, sy + 461), "中式部位", 18, INK, True, serif=True)
    text(draw, (sx + width - 45, sy + 464), "展开详情", 7, MUTED, anchor="ra")

    cards = [
        ("肩颈 · 大理石纹", "上脑", "¥76.5/斤", "脂肪交错均匀，口感接近眼肉但脂肪更低。"),
        ("肋脊 · 红白镶嵌", "眼肉", "¥72.5/斤", "脂肪在瘦肉中形成“眼睛”斑纹，鲜嫩多汁。"),
        ("外脊 · 脂肪边", "外脊", "¥74/斤", "外侧带半圈脂肪或筋膜，香嫩油润。"),
        ("腹部 · 筋油相间", "牛腩", "¥39/斤", "筋膜、肉与油花混合，久炖后软烂浓郁。"),
    ]
    for index, (kicker, title, price, summary) in enumerate(cards):
        top = sy + 490 + index * 80
        rounded(draw, (sx, top, sx + width - 40, top + 68), 15, CARD, LINE)
        rounded(draw, (sx, top, sx + 5, top + 68), 3, BEEF)
        text(draw, (sx + 14, top + 9), kicker, 6, BEEF, True)
        label(draw, (sx + width - 95, top + 8), price, INK, YELLOW, 7, 6, 3)
        text(draw, (sx + 14, top + 23), title, 15, INK, True, serif=True)
        text(draw, (sx + 14, top + 46), summary, 6, SOFT)
    bottom_nav(draw, x + 7, y + height - 80, width - 14, "百科")


def detail_screen(canvas, draw, x, y, width, height):
    phone_frame(canvas, draw, x, y, width, height)
    sx, sy = x + 20, y + 30
    status_bar(draw, x + 7, sy, width - 14)
    draw.ellipse((sx, sy + 34, sx + 34, sy + 68), outline=LINE, fill=CARD)
    text(draw, (sx + 17, sy + 50), "‹", 17, INK, True, anchor="mm")
    text(draw, (sx + width / 2 - 20, sy + 50), "百科详情", 14, INK, True, serif=True, anchor="mm")
    rounded(draw, (sx + width - 74, sy + 34, sx + width - 40, sy + 68), 17, CARD, LINE)
    text(draw, (sx + width - 57, sy + 50), "典", 11, BEEF, True, serif=True, anchor="mm")

    rounded(draw, (sx, sy + 84, sx + width - 40, sy + 226), 22, INK)
    text(draw, (sx + 17, sy + 103), "CN CUTS · 02", 8, YELLOW, True)
    text(draw, (sx + 17, sy + 126), "眼肉", 31, CARD, True, serif=True)
    text(draw, (sx + 17, sy + 165), "肋眼 / Ribeye", 8, "#92A198")
    paragraph(draw, (sx + 17, sy + 189), "红白镶嵌呈“眼睛”状，常用于牛排和快速煎烤。", 9, "#AFBDB5", 245, 3)
    draw.ellipse((sx + 255, sy + 108, sx + 325, sy + 178), fill=BEEF, outline="#F48772", width=2)
    line(draw, (sx + 268, sy + 137), (sx + 311, sy + 112), "#F7C6B8", 2)
    line(draw, (sx + 268, sy + 151), (sx + 311, sy + 143), "#F7C6B8", 2)

    tabs = ["中式部位", "潮汕火锅", "新鲜度", "保存"]
    tab_y = sy + 240
    rounded(draw, (sx, tab_y, sx + width - 40, tab_y + 44), 14, CARD, LINE)
    for i, title in enumerate(tabs):
        left = sx + 5 + i * 70
        if i == 0:
            rounded(draw, (left, tab_y + 5, left + 66, tab_y + 39), 9, INK)
            text(draw, (left + 33, tab_y + 22), title, 7, CARD, True, anchor="mm")
        else:
            text(draw, (left + 33, tab_y + 22), title, 7, MUTED, anchor="mm")

    rounded(draw, (sx, sy + 296, sx + width - 40, sy + 681), 18, CARD, LINE)
    rounded(draw, (sx, sy + 296, sx + 5, sy + 681), 3, BEEF)
    text(draw, (sx + 14, sy + 308), "肋脊 · 红白镶嵌", 7, BEEF, True)
    text(draw, (sx + 14, sy + 323), "眼肉", 21, INK, True, serif=True)
    label(draw, (sx + width - 105, sy + 311), "¥72.5/斤", INK, YELLOW, 8)
    paragraph(draw, (sx + 14, sy + 354), "脂肪含量较高，鲜嫩多汁；红白镶嵌形成类似眼睛的斑纹。", 8, SOFT, 270, 3)

    sections = [
        ("位置", "第 6 至第 12 根肋骨之间，一端接上脑，另一端接外脊。"),
        ("辨认", "白色脂肪在红肉中形成“眼睛”状斑纹。"),
        ("特性", "鲜嫩多汁，香甜不干涩，是评级常用部位。"),
        ("做法", "煎牛排、涮火锅、烧烤。"),
    ]
    section_y = sy + 394
    for title, content in sections:
        text(draw, (sx + 14, section_y), title, 7, BEEF, True)
        paragraph(draw, (sx + 53, section_y - 1), content, 7, INK_LIGHT, 230, 2)
        line(draw, (sx + 14, section_y + 31), (sx + width - 58, section_y + 31), LINE)
        section_y += 38

    rounded(draw, (sx + 10, sy + 552, sx + width - 50, sy + 673), 12, "#F7F3EA")
    text(draw, (sx + 20, sy + 562), "价格参考", 9, INK, True)
    text(draw, (sx + width - 120, sy + 563), "S 级鲜品参考", 6, MUTED)
    prices = [
        ("河北 · 排酸鲜品", "S 级", "72.50 元/斤"),
        ("河北 · 排酸鲜品", "A 级", "69.50 元/斤"),
        ("山东 · 冷冻", "冷冻品", "42.50 元/斤"),
    ]
    row_y = sy + 583
    for source, spec, value in prices:
        text(draw, (sx + 20, row_y), source, 6, INK_LIGHT)
        text(draw, (sx + 20, row_y + 9), spec, 5, MUTED)
        text(draw, (sx + width - 60, row_y + 4), value, 7, BEEF, True, anchor="ra")
        line(draw, (sx + 20, row_y + 21), (sx + width - 60, row_y + 21), LINE)
        row_y += 26

    rounded(draw, (sx, sy + 696, sx + width - 40, sy + 764), 15, CARD, LINE)
    text(draw, (sx + 14, sy + 708), "肩颈 · 大理石纹", 6, BEEF, True)
    text(draw, (sx + 14, sy + 722), "上脑", 13, INK, True, serif=True)
    text(draw, (sx + 14, sy + 742), "脂肪交错均匀，口感接近眼肉。", 6, SOFT)
    label(draw, (sx + width - 96, sy + 711), "¥76.5/斤", INK, YELLOW, 7)
    bottom_nav(draw, x + 7, y + height - 80, width - 14, "百科")


def render():
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), "#10281F")
    draw = ImageDraw.Draw(canvas)

    for y in range(HEIGHT):
        mix = y / HEIGHT
        color = (
            int(16 + 7 * mix),
            int(40 + 9 * mix),
            int(31 + 5 * mix),
            255,
        )
        draw.line((0, y, WIDTH, y), fill=color)

    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse((-240, -260, 620, 600), fill=(242, 200, 91, 24))
    od.ellipse((1260, 680, 1900, 1320), fill=(217, 84, 61, 25))
    od.ellipse((35, 680, 420, 1065), outline=(255, 255, 255, 18), width=1)
    od.ellipse((85, 730, 370, 1015), outline=(255, 255, 255, 14), width=1)
    canvas.alpha_composite(overlay)
    draw = ImageDraw.Draw(canvas)

    rounded(draw, (52, 66, 320, 125), 19, YELLOW)
    text(draw, (82, 80), "牧", 30, INK, True, serif=True)
    text(draw, (137, 79), "识牛", 27, INK, True, serif=True)
    text(draw, (139, 109), "BEEF ATLAS", 9, "#6D633C")

    text(draw, (54, 176), "INTERACTIVE DESIGN PREVIEW", 11, YELLOW, True)
    text(draw, (52, 210), "把每一口牛肉，", 38, CARD, True, serif=True)
    text(draw, (52, 255), "看得更明白。", 38, CARD, True, serif=True)
    paragraph(
        draw,
        (54, 320),
        "原生微信小程序界面效果预览。包含端侧识别、识别报告、牛肉做法助手、百科与个人中心。",
        14,
        "#AFC0B6",
        250,
        8,
    )
    line(draw, (54, 430), (220, 430), BEEF, 2)
    text(draw, (54, 455), "页面结构", 10, "#81988A", True)
    for idx, item in enumerate(["01  首页与识别入口", "02  中式 / 潮汕百科", "03  部位详情与价格"]):
        text(draw, (54, 480 + idx * 29), item, 12, CARD)
    text(draw, (54, 650), "说明", 10, YELLOW, True)
    paragraph(
        draw,
        (54, 674),
        "这是按当前 WXML / WXSS 设计生成的效果预览，不是网页版本，也不会改变小程序工程。",
        10,
        "#92A99B",
        238,
        6,
    )
    label(draw, (54, 790), "DESIGN PREVIEW · 2026", "#21473A", "#A9C1B3", 8)

    home_screen(canvas, draw, 360, 72, 360, 914)
    wiki_screen(canvas, draw, 772, 72, 360, 914)
    detail_screen(canvas, draw, 1184, 72, 360, 914)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUTPUT, quality=95)
    print(OUTPUT)


if __name__ == "__main__":
    render()
