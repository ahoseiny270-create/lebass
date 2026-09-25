#!/usr/bin/env python3
"""MODERA template builder — سرهم‌بندی صفحات از قالب‌های tpl/"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TPL = ROOT / 'tpl'

def load(name):
    return (TPL / 'partials' / name).read_text(encoding='utf-8')

def main():
    head, header, footer, overlays, scripts = (load(f) for f in
        ['head.html', 'header.html', 'footer.html', 'overlays.html', 'scripts.html'])
    pages = sorted((TPL / 'pages').glob('*.html'))
    if not pages:
        print('no pages found'); sys.exit(1)
    for p in pages:
        raw = p.read_text(encoding='utf-8')
        m = re.match(r'\s*<!--\s*(\{.*?\})\s*-->\s*\n?', raw, re.S)
        if not m:
            print(f'SKIP {p.name}: missing meta comment'); continue
        meta = json.loads(m.group(1))
        body = raw[m.end():]
        html = (head.replace('{{TITLE}}', meta['title'])
                    .replace('{{DESC}}', meta.get('desc', ''))
                    .replace('{{PAGE}}', meta.get('page', p.stem))
                + header + '\n<main id="main">\n' + body + '\n</main>\n'
                + footer + overlays + scripts)
        out = ROOT / p.name
        out.write_text(html, encoding='utf-8')
        print(f'built {out.name} ({len(html)//1024} KB)')
    print('done.')

if __name__ == '__main__':
    main()
