"""Attach the shared keyboard rules to all demos and their notebook hosts."""
import os
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'

def build():
    count = 0
    for page in DIST.rglob('*.html'):
        text = page.read_text(encoding='utf8')
        if not (re.search(r'id=[\"\']prev[\"\']', text) or page == DIST/'index.html' or page.name == 'optimizations.html'):
            continue
        script = os.path.relpath(DIST/'demo-keyboard.js', page.parent).replace('\\', '/')
        tag = f'<script src="{script}"></script>'
        text = re.sub(r'<script src="[^"]*demo-keyboard\.js"></script>', '', text)
        closing = '</body>' if '</body>' in text else '</html>'
        updated = text.replace(closing, tag+closing)
        assert tag in updated, page
        if page.read_text(encoding='utf8') != updated:
            page.write_text(updated, encoding='utf8')
        count += 1
    print(f'Keyboard rules attached to {count} demo/host pages.')

if __name__ == '__main__': build()
