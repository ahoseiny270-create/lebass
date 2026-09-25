#!/usr/bin/env python3
"""ساخت کاور تبلیغاتی مارکت از روی اسکرین‌شات‌ها (1600x900)"""
from PIL import Image, ImageDraw

W, H = 1600, 900
BG = (26, 22, 17)
GOLD = (201, 162, 75)

def rounded(img, r=26):
    m = Image.new('L', img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, *img.size], radius=r, fill=255)
    out = Image.new('RGBA', img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0), m)
    return out.convert('RGB')

canvas = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(canvas)
# نوار طلایی بالا و پایین
d.rectangle([0, 0, W, 10], fill=GOLD)
d.rectangle([0, H - 10, W, H], fill=GOLD)

desk = Image.open('screenshots/home.png').crop((0, 0, 1440, 1060)).resize((1130, 833))
desk = rounded(desk)
canvas.paste(desk, (40, 34))

mob = Image.open('screenshots/mobile-home.png').crop((0, 0, 780, 1560)).resize((330, 660))
mob = rounded(mob, 30)
canvas.paste(mob, (1215, 120))
# قاب طلایی دور موبایل
d.rounded_rectangle([1215, 120, 1215 + 330, 120 + 660], radius=30, outline=GOLD, width=4)

canvas.save('screenshots/cover.jpg', quality=88)
print('cover saved:', canvas.size)
