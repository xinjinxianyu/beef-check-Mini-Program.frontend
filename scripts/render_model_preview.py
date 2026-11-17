from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parent.parent
SOURCE_IMAGE = ROOT / "assets" / "home" / "beef-camera.jpg"
OUTPUT = Path(
    r"C:\Users\潘苏杰\.codex\visualizations\2026\10\27"
    r"\01a17c08-70c2-7e22-af50-676e3b0aba6a\beef-yolo-classes-preview.png"
)

WIDTH, HEIGHT = 1600, 1050
INK = "#18382E"
SOFT = "#65756B"
BEEF = "#D9543D"
YELLOW = "#F2C85B"
PAPER = "#F7F3E9"
CARD = "#FFFDF7"
LINE = "#E4E1D8"

FONT_REGULAR = "C:/Windows/Fonts/msyh.ttc"
FONT_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
FONT_SERIF = "C:/Windows/Fonts/simsun.ttc"


def font(size, bold=False, serif=False):
    if serif:
        return ImageFont.truetype(FONT_SERIF, size)
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text(draw, xy, value, size, fill=INK, bold=False, serif=False, anchor=None):
    draw.text(xy, value, font=font(size, bold, serif), fill=fill, anchor=anchor)


def wrap(draw, value, x, y, size, fill, width, gap=5):
    selected = ""
    current_y = y
    for char in value:
        candidate = selected + char
        if draw.textlength(candidate, font=font(size)) > width and selected:
            draw.text((x, current_y), selected, font=font(size), fill=fill)
            selected = char
            current_y += size + gap
        else:
            selected = candidate
    if selected:
        draw.text((x, current_y), selected, font=font(size), fill=fill)


def nav(draw, x, y, width):
    rounded(draw, (x + 12, y, x + width - 12, y + 60), 20, INK)
    items = [("首页", False), ("识别", True), ("助手", False), ("百科", False), ("我的", False)]
    cell = (width - 24) / len(items)
    for i, (label, active) in enumerate(items):
        cx = x + 12 + cell * (i + 0.5)
        if label == "识别":
            draw.ellipse((cx - 23, y - 23, cx + 23, y + 23), fill=BEEF, outline=PAPER, width=4)
            text(draw, (cx, y), "◎", 17, CARD, bold=True, anchor="mm")
        else:
            text(draw, (cx, y + 19), "·", 18, CARD if active else "#9CAAA2", anchor="mm")
        text(draw, (cx, y + 39), label, 9, CARD if active else "#9CAAA2", anchor="mm")


def phone(draw, canvas, x, y, width, height):
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    rounded(sd, (x + 7, y + 16, x + width + 7, y + height + 16), 38, (0, 0, 0, 75))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(18)))
    rounded(draw, (x, y, x + width, y + height), 40, "#FDFCF8", "#EAEAE4", 2)
    rounded(draw, (x + 7, y + 7, x + width - 7, y + height - 7), 33, PAPER)
    rounded(draw, (x + width / 2 - 36, y + 8, x + width / 2 + 36, y + 20), 8, "#14261F")


def result_screen(draw, canvas, x, y, width, height):
    phone(draw, canvas, x, y, width, height)
    sx, sy = x + 22, y + 34
    text(draw, (sx, sy + 8), "9:41", 10, INK, bold=True)
    text(draw, (sx + width - 66, sy + 8), "●  ●  ▰", 9, INK, bold=True)
    rounded(draw, (sx, sy + 42, sx + 34, sy + 76), 12, INK)
    text(draw, (sx + 17, sy + 59), "牧", 14, CARD, bold=True, serif=True, anchor="mm")
    text(draw, (sx + 45, sy + 44), "识牛 · 识别报告", 16, INK, bold=True, serif=True)
    text(draw, (sx, sy + 94), "端侧 YOLO26 · 本地推理", 9, BEEF, bold=True)

    photo_box = (sx, sy + 119, sx + width - 44, sy + 486)
    image = Image.open(SOURCE_IMAGE).convert("RGB")
    image_ratio = image.width / image.height
    box_ratio = (photo_box[2] - photo_box[0]) / (photo_box[3] - photo_box[1])
    if image_ratio > box_ratio:
        crop_height = image.height
        crop_width = int(crop_height * box_ratio)
        left = (image.width - crop_width) // 2
        image = image.crop((left, 0, left + crop_width, crop_height))
    else:
        crop_width = image.width
        crop_height = int(crop_width / box_ratio)
        top = (image.height - crop_height) // 2
        image = image.crop((0, top, crop_width, top + crop_height))
    image = image.resize((photo_box[2] - photo_box[0], photo_box[3] - photo_box[1]))
    rounded_mask = Image.new("L", image.size, 0)
    ImageDraw.Draw(rounded_mask).rounded_rectangle((0, 0, image.width, image.height), radius=22, fill=255)
    canvas.paste(image, (photo_box[0], photo_box[1]), rounded_mask)

    draw.rounded_rectangle((sx + 26, sy + 164, sx + width - 72, sy + 424), radius=8, outline=YELLOW, width=3)
    rounded(draw, (sx + 24, sy + 142, sx + 126, sy + 168), 8, YELLOW)
    text(draw, (sx + 36, sy + 148), "里脊 93%", 10, INK, bold=True)
    rounded(draw, (sx + width - 138, sy + 440, sx + width - 66, sy + 468), 9, "#173D2F")
    text(draw, (sx + width - 102, sy + 454), "新鲜 91%", 9, CARD, anchor="mm")

    rounded(draw, (sx, sy + 503, sx + width - 44, sy + 623), 20, CARD, LINE)
    text(draw, (sx + 16, sy + 518), "里脊 · 菲力", 23, INK, bold=True, serif=True)
    text(draw, (sx + width - 116, sy + 521), "部位置信度 93%", 8, SOFT, anchor="ra")
    wrap(draw, "肉质细嫩、脂肪较少，适合快炒、煎制或短时间涮煮。", sx + 16, sy + 551, 9, SOFT, width - 80)
    rounded(draw, (sx + 16, sy + 592, sx + 116, sy + 612), 99, "#E5ECDF")
    text(draw, (sx + 66, sy + 602), "模型支持类别", 8, "#4C6954", anchor="mm")

    rounded(draw, (sx, sy + 642, sx + width - 44, sy + 750), 20, INK)
    text(draw, (sx + 18, sy + 657), "AI 做法建议", 9, YELLOW, bold=True)
    text(draw, (sx + 18, sy + 677), "适合快炒 / 香煎 / 短时涮煮", 14, CARD, bold=True, serif=True)
    text(draw, (sx + 18, sy + 706), "建议逆纹切片，高温短时间烹饪。", 8, "#AFC0B6")
    rounded(draw, (sx + 18, sy + 728, sx + 142, sy + 744), 99, "#27483B")
    text(draw, (sx + 80, sy + 736), "继续询问牛肉助手 ↗", 7, YELLOW, anchor="mm")
    nav(draw, x + 7, y + height - 78, width - 14)


def info_screen(draw, canvas, x, y, width, height):
    phone(draw, canvas, x, y, width, height)
    sx, sy = x + 22, y + 34
    text(draw, (sx, sy + 8), "9:41", 10, INK, bold=True)
    text(draw, (sx + width - 66, sy + 8), "●  ●  ▰", 9, INK, bold=True)
    rounded(draw, (sx, sy + 42, sx + 34, sy + 76), 12, INK)
    text(draw, (sx + 17, sy + 59), "典", 14, CARD, bold=True, serif=True, anchor="mm")
    text(draw, (sx + 45, sy + 44), "识牛百科", 16, INK, bold=True, serif=True)
    rounded(draw, (sx + width - 113, sy + 43, sx + width - 44, sy + 72), 15, CARD, LINE)
    text(draw, (sx + width - 79, sy + 58), "问助手", 8, SOFT, anchor="mm")

    rounded(draw, (sx, sy + 91, sx + width - 44, sy + 256), 22, INK)
    text(draw, (sx + 17, sy + 110), "中式部位 · 模型类别", 9, YELLOW, bold=True)
    text(draw, (sx + 17, sy + 135), "里脊", 30, CARD, bold=True, serif=True)
    text(draw, (sx + 17, sy + 174), "菲力 / Tenderloin", 8, "#9FB0A6")
    wrap(draw, "几乎无肌间脂肪，肉质细嫩，适合快速烹饪。", sx + 17, sy + 201, 9, "#B4C2B9", width - 100)
    draw.ellipse((sx + width - 130, sy + 108, sx + width - 70, sy + 168), fill=BEEF)
    line_y = sy + 136
    draw.line((sx + width - 119, line_y, sx + width - 80, line_y - 15), fill="#F4B8AA", width=2)
    draw.line((sx + width - 119, line_y + 12, sx + width - 80, line_y + 2), fill="#F4B8AA", width=2)

    tabs = ["中式部位", "新鲜度", "保存指南"]
    rounded(draw, (sx, sy + 273, sx + width - 44, sy + 321), 14, CARD, LINE)
    for i, tab in enumerate(tabs):
        left = sx + 5 + i * 104
        if i == 0:
            rounded(draw, (left, sy + 279, left + 100, sy + 315), 10, INK)
            text(draw, (left + 50, sy + 297), tab, 8, CARD, bold=True, anchor="mm")
        else:
            text(draw, (left + 50, sy + 297), tab, 8, SOFT, anchor="mm")

    rounded(draw, (sx, sy + 340, sx + width - 44, sy + 681), 20, CARD, LINE)
    rounded(draw, (sx, sy + 340, sx + 5, sy + 681), 3, BEEF)
    text(draw, (sx + 17, sy + 356), "腰内侧 · 纯瘦", 8, BEEF, bold=True)
    text(draw, (sx + 17, sy + 374), "里脊", 26, INK, bold=True, serif=True)
    rounded(draw, (sx + width - 126, sy + 358, sx + width - 61, sy + 381), 8, INK)
    text(draw, (sx + width - 93, sy + 369), "¥65/斤", 8, YELLOW, bold=True, anchor="mm")
    wrap(draw, "全牛较嫩的部位，几乎无肌间脂肪，牛肉风味相对清淡。", sx + 17, sy + 414, 9, SOFT, width - 84)

    rows = [
        ("位置", "腰椎内侧，腹腔后壁的长圆柱形肌肉。"),
        ("辨认", "颜色深红、形状规整，没有外脊脂肪边。"),
        ("做法", "菲力牛排、铁板牛柳、黑椒牛柳。"),
    ]
    row_y = sy + 465
    for label, value in rows:
        text(draw, (sx + 17, row_y), label, 8, BEEF, bold=True)
        wrap(draw, value, sx + 64, row_y - 1, 8, SOFT, width - 135, 3)
        draw.line((sx + 17, row_y + 43, sx + width - 64, row_y + 43), fill=LINE)
        row_y += 53

    rounded(draw, (sx + 14, sy + 628, sx + width - 58, sy + 670), 10, "#F6F1E7")
    text(draw, (sx + 25, sy + 640), "价格统一：元 / 斤", 8, INK, bold=True)
    text(draw, (sx + 25, sy + 655), "河北鲜品 S 级 65 元/斤", 7, SOFT)
    nav(draw, x + 7, y + height - 78, width - 14)


def build():
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), "#112D23")
    background = ImageDraw.Draw(canvas)
    for y in range(HEIGHT):
        mix = y / HEIGHT
        background.line((0, y, WIDTH, y), fill=(17 + int(7 * mix), 43 + int(9 * mix), 34 + int(5 * mix)))
    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse((-220, -190, 480, 510), fill=(242, 200, 91, 20))
    od.ellipse((1300, 720, 1820, 1240), fill=(217, 84, 61, 22))
    canvas.alpha_composite(overlay)
    draw = ImageDraw.Draw(canvas)

    rounded(draw, (50, 52, 302, 110), 17, YELLOW)
    text(draw, (78, 68), "牧", 27, INK, bold=True, serif=True)
    text(draw, (130, 65), "识牛", 25, INK, bold=True, serif=True)
    text(draw, (132, 95), "BEEF ATLAS", 8, "#6D633C")
    text(draw, (52, 150), "MODEL OUTPUT", 10, YELLOW, bold=True)
    text(draw, (50, 181), "当前模型", 32, CARD, bold=True, serif=True)
    text(draw, (50, 220), "支持类别", 32, CARD, bold=True, serif=True)
    text(draw, (52, 272), "YOLO26 · 5 类部位检测", 11, "#9DB1A4")
    categories = ["肩肉", "里脊", "牛腩", "臀肉", "外脊"]
    for i, item in enumerate(categories):
        y = 322 + i * 58
        rounded(draw, (52, y, 282, y + 42), 13, "#21463A")
        draw.ellipse((66, y + 15, 78, y + 27), fill=BEEF if item == "里脊" else "#87A27C")
        text(draw, (90, y + 10), f"0{i + 1}", 8, YELLOW, bold=True)
        text(draw, (120, y + 7), item, 16, CARD, bold=True, serif=True)
    text(draw, (52, 644), "图注", 9, YELLOW, bold=True)
    wrap(
        draw,
        "成果展示图仅使用当前 YOLO26 实际支持的部位类别，不再使用眼肉作为识别结果。",
        52,
        668,
        11,
        "#A6BAB0",
        225,
        7,
    )

    result_screen(draw, canvas, 336, 76, 410, 900)
    info_screen(draw, canvas, 806, 76, 410, 900)
    text(draw, (1260, 300), "模型", 16, "#96AD9F", bold=True)
    text(draw, (1260, 327), "真实", 34, CARD, bold=True, serif=True)
    text(draw, (1260, 369), "类别", 34, CARD, bold=True, serif=True)
    text(draw, (1260, 430), "结果标注", 14, YELLOW, bold=True)
    text(draw, (1260, 458), "百科详情", 14, YELLOW, bold=True)
    text(draw, (1260, 486), "价格口径", 14, YELLOW, bold=True)
    wrap(draw, "图片识别在当前设备完成，界面展示以实际模型输出为准。", 1260, 558, 11, "#A6BAB0", 245, 7)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(OUTPUT, quality=95)
    print(OUTPUT)


if __name__ == "__main__":
    build()
