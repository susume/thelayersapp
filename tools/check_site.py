"""Check generated pages, local navigation, current access and inline JS syntax."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re, subprocess, tempfile, sys
from build_site import ROOT, PAGES, LOCALIZED

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.links=[]; self.ids=set(); self.h1=0; self.title=0; self.styles=[]; self.scripts=[]; self.script_srcs=[]; self.demo_mounts=[]; self.in_script=False; self.code=''; self.type=''; self.lang=''; self.data=[]
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='html': self.lang=a.get('lang','')
        if 'id' in a: self.ids.add(a['id'])
        if tag=='h1': self.h1+=1
        if 'data-guard-demo' in a: self.demo_mounts.append(a['data-guard-demo'])
        if tag=='title': self.title+=1
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag=='link' and a.get('rel')=='stylesheet': self.styles.append(a.get('href',''))
        if tag=='script':
            self.in_script=True; self.code=''; self.type=a.get('type',''); self.src=a.get('src')
            if self.src: self.script_srcs.append(self.src)
    def handle_data(self, data):
        if self.in_script: self.code+=data
        else: self.data.append(data)
    def handle_endtag(self, tag):
        if tag=='script' and self.in_script:
            if not self.src and self.code.strip(): self.scripts.append((self.type,self.code))
            self.in_script=False

pages=list(PAGES)+['guardinstall-print.html','blog/index.html']
pages += [str(p.relative_to(ROOT)).replace('\\','/') for p in (ROOT/'blog').glob('*.html') if p.name!='index.html']
pages += [lang+'/'+p for lang in ['ja','zh','vi'] for p in LOCALIZED]
errors=[]
parsed={name:Page((ROOT/name).read_text(encoding='utf-8')) for name in pages}
for name,page in parsed.items():
    if page.h1!=1 or page.title!=1: errors.append(f'{name}: must have one h1 and title')
    if not any(x.endswith('assets/site.css') for x in page.styles): errors.append(f'{name}: missing shared theme')
    expected=name.split('/')[0] if name.startswith(('ja/','zh/','vi/')) else 'en'
    if page.lang!=expected: errors.append(f'{name}: wrong language')
    if Path(name).name in ['index.html','guard-pro.html'] and not name.startswith('blog/'):
        if sorted(page.demo_mounts)!=['compact','full'] or 'demo' not in page.ids:
            errors.append(f'{name}: missing interactive hero or app walkthrough')
        if not any(x.endswith('assets/product-demo.js') for x in page.script_srcs):
            errors.append(f'{name}: missing React demo bundle')
    for asset in page.styles+page.script_srcs:
        u=urlsplit(asset)
        if not u.scheme and not u.netloc and not (ROOT/name).parent.joinpath(u.path).exists():
            errors.append(f'{name}: missing asset {asset}')
    for href in page.links:
        u=urlsplit(href)
        if u.scheme or u.netloc: continue
        target=(ROOT/u.path.lstrip('/') if u.path.startswith('/') else ROOT/name).parent/unquote(u.path) if not u.path.startswith('/') else ROOT/u.path.lstrip('/')
        if not u.path: target=ROOT/name
        if target.is_dir(): target=target/'index.html'
        if not target.exists(): errors.append(f'{name}: broken link {href}')
        elif u.fragment and target.suffix=='.html':
            destination=parsed.get(str(target.relative_to(ROOT)).replace('\\','/')) or Page(target.read_text(encoding='utf-8'))
            if unquote(u.fragment) not in destination.ids: errors.append(f'{name}: missing fragment {href}')
    visible=' '.join(page.data)
    if name == 'teacher.html':
        if 'data-teacher-demo' not in (ROOT/name).read_text(encoding='utf-8') or 'teacher-demo' not in page.ids:
            errors.append(f'{name}: missing interactive Teacher walkthrough')
        if not any(x.endswith('assets/teacher-demo.js') for x in page.script_srcs):
            errors.append(f'{name}: missing Teacher React bundle')
    # Historical article content can retain third-party figures, but current product pages cannot sell old offers.
    if not name.startswith('blog/'):
        if re.search(r'\$(?:29|49|59)\b|gumroad\.com/l/',(ROOT/name).read_text(encoding='utf-8')): errors.append(f'{name}: stale purchase offer')
        if re.search(r'(Windows\s*(?:&|and)\s*Mac|Mac.*READY)',visible): errors.append(f'{name}: stale platform claim')

node=sys.argv[1] if len(sys.argv)>1 else 'node'
with tempfile.TemporaryDirectory(prefix='layers-site-check-') as temp:
    for name in pages+['dashboard.html']:
        page=parsed.get(name) or Page((ROOT/name).read_text(encoding='utf-8'))
        for i,(kind,code) in enumerate(page.scripts):
            if kind and kind not in ['module','text/javascript','application/javascript']: continue
            target=Path(temp)/(name.replace('/','-')+f'-{i}.mjs')
            target.write_text(code,encoding='utf-8')
            result=subprocess.run([node,'--check',str(target)],capture_output=True,text=True)
            if result.returncode: errors.append(name+': '+result.stderr)
    for name in ['assets/site.js','assets/product-demo.js','assets/teacher-demo.js','worker.js']:
        target=Path(temp)/(Path(name).stem+'.mjs')
        target.write_text((ROOT/name).read_text(encoding='utf-8'),encoding='utf-8')
        result=subprocess.run([node,'--check',str(target)],capture_output=True,text=True)
        if result.returncode: errors.append(name+': '+result.stderr)
if errors:
    print('\n'.join(errors)); raise SystemExit(1)
print(f'Checked {len(pages)} public pages: local links/fragments, shared theme, metadata, language, current access and JavaScript syntax.')
