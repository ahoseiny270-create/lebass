#!/usr/bin/env python3
"""گرفتن اسکرین‌شات واقعی از قالب برای صفحه فروش در مارکت"""
import json
import os
from playwright.sync_api import sync_playwright

BASE = 'http://localhost:8000'
OUT = 'screenshots'
CART = [
    {"id": 5, "size": "L", "color": "طوسی", "qty": 1},
    {"id": 7, "size": "فری‌سایز", "color": "عسلی", "qty": 1},
]
os.makedirs(OUT, exist_ok=True)

SHOTS = [
    ('home', '/', 1440, 900, True, False),
    ('shop', '/shop.html', 1440, 900, True, False),
    ('product', '/product.html?id=5', 1440, 900, True, False),
    ('cart', '/cart.html', 1440, 900, True, True),
    ('checkout', '/checkout.html', 1440, 900, True, True),
    ('mobile-home', '/', 390, 844, True, False),
]

def run():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=['--no-sandbox'])
        for name, url, w, h, full, seed in SHOTS:
            ctx = browser.new_context(
                viewport={'width': w, 'height': h},
                device_scale_factor=2 if w < 500 else 1,
            )
            if seed:
                ctx.add_init_script(f"localStorage.setItem('modera_cart', `{json.dumps(CART, ensure_ascii=False)}`)")
            pg = ctx.new_page()
            pg.goto(BASE + url, wait_until='networkidle')
            pg.add_style_tag(content='.sticky-atc,.to-top{display:none!important}')
            pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
            pg.wait_for_timeout(1200)
            pg.evaluate("""async () => {
              const h = document.body.scrollHeight;
              for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
              document.querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
              window.scrollTo(0, 0);
            }""")
            pg.wait_for_timeout(1200)
            pg.screenshot(path=f'{OUT}/{name}.png', full_page=full)
            print('shot OK:', name, flush=True)
            ctx.close()
        browser.close()

if __name__ == '__main__':
    run()
