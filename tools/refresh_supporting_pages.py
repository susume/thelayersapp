"""One-time migration of the dashboard shell, editorial pages and assistant copy.

Run after build_site.py. Kept as an inspectable migration rather than using an
opaque replacement of app logic. The page builder does not alter Firebase code.
"""
from pathlib import Path
from html import escape, unescape
import re
import xml.etree.ElementTree as ET
from build_site import ROOT, shell, hero, section, card, button, notice, cta, LOCALIZED

def refresh_dashboard():
    path = ROOT / 'dashboard.html'
    text = path.read_text(encoding='utf-8')
    if 'assets/dashboard-theme.css' not in text:
        text = text.replace('</head>', '<meta name="description" content="Parent dashboard for paired Layers Guard Windows and Android child devices. Current access is arranged through the Layers team.">\n<meta name="robots" content="noindex,follow">\n<meta name="theme-color" content="#142c38">\n<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">\n<link rel="stylesheet" href="assets/dashboard-theme.css">\n</head>',1)
        text = text.replace('<body>','<body class="dashboard-page">',1)
    auth_end = '      </form>\n    </div>\n  </section>\n\n  <!-- ===== SCREEN: LICENSE ===== -->'
    if 'Layers product overview</a>' not in text:
        assert auth_end in text, 'The auth structure changed; inspect it before migrating.'
        text = text.replace(auth_end, '      </form>\n      <p class="site-return">Current app access: <a href="contact.html?topic=guard">contact the Layers team</a></p>\n      <a class="site-return" href="index.html">Layers product overview</a>\n    </div>\n  </section>\n\n  <!-- ===== SCREEN: LICENSE ===== -->',1)
    text = text.replace('href="https://thelayersapp.com/guard-pro.html" target="_blank"','href="contact.html?topic=guard"')
    text = text.replace('data-i18n="license_get">Get a license key</a>','data-i18n="license_get">Contact for access</a>')
    words = [('Get a license key','Contact for access'),('ライセンスキーを取得','利用について問い合わせ'),('获取许可证密钥','联系获取使用权限'),('Lấy mã giấy phép','Liên hệ để sử dụng'),('Nhận mã giấy phép','Liên hệ để sử dụng'),('Lấy mã bản quyền','Liên hệ để sử dụng')]
    for before,after in words:
        text = re.sub(r"(license_get:\s*)'"+re.escape(before)+r"'",lambda m:m[1]+"'"+after+"'",text)
    # Translate the two new informational links with the dashboard's existing language system.
    text = text.replace('<p class="site-return">Current app access: <a href="contact.html?topic=guard">contact the Layers team</a></p>', '<p class="site-return"><a href="contact.html?topic=guard" data-i18n="site_access">Contact the team for current access</a></p>')
    text = text.replace('<a class="site-return" href="index.html">Layers product overview</a>', '<a class="site-return" href="index.html" data-i18n="site_overview">Layers product overview</a>')
    if 'site_access:' not in text:
        labels={'Contact for access':('Contact the team for current access','Layers product overview'), '利用について問い合わせ':('現在の利用についてチームに問い合わせ','Layers 製品のご案内'), '联系获取使用权限':('联系团队获取当前使用权限','Layers 产品概览'), 'Liên hệ để sử dụng':('Liên hệ nhóm để được truy cập hiện tại','Tổng quan sản phẩm Layers')}
        def add_labels(match):
            access,overview=labels[match[2]]
            return match[0]+"\n        site_access: '"+access+"',\n        site_overview: '"+overview+"',"
        text=re.sub(r"(license_get:\s*)'(Contact for access|利用について問い合わせ|联系获取使用权限|Liên hệ để sử dụng)',",add_labels,text)
    path.write_text(text,encoding='utf-8')

ARTICLES = [
 ('why-i-built-layers.html','Why I built Layers','The story behind the classroom tools.',False),
 ('5-invisible-barriers-international-students.html','Five invisible barriers for international students','A classroom perspective on language and belonging.',False),
 ('why-parents-should-control-childrens-screen-time.html','Why parents should guide children’s screen time','An earlier discussion of screen habits and parent involvement.',True),
 ('the-world-is-protecting-children-online.html','The world is protecting children online','An earlier article on children’s online safety.',True),
 ('eastern-vs-western-parenting-styles.html','Eastern and Western parenting styles','A discussion of structure, independence and parenting.',True),
 ('whats-new-v38-mac.html','Archive: Layers v3.8 and the former Mac app','Historical release notes. Mac apps and Layers Talk are discontinued.',True),
]

def refresh_articles():
    source = ROOT / 'content' / 'articles'
    source.mkdir(parents=True,exist_ok=True)
    for filename,title,description,historical in ARTICLES:
        target = ROOT / 'blog' / filename
        saved = source / filename
        if not saved.exists():
            html=target.read_text(encoding='utf-8')
            header=re.search(r'<header class="article-header"[^>]*>.*?</header>',html,re.S)
            body=re.search(r'<article class="article-body"[^>]*>.*?</article>',html,re.S)
            assert header and body, filename
            content=header[0]+body[0]
            # Preserve the article narrative and original date, but remove current-sale CTAs.
            content=re.sub(r'<a\b[^>]*href="https://thelayersapp\.gumroad\.com[^"<>]*"[^>]*>.*?</a>','<a href="../contact.html?topic=access">Contact for current access</a>',content,flags=re.S)
            content=re.sub(r'\sstyle="[^"]*"','',content)
            content=content.replace('class="cta-btn cta-primary"','class="btn btn-primary"').replace('class="cta-btn cta-secondary"','class="btn btn-secondary"')
            # Own-product prices in a release article are obsolete; keep its technical history.
            if filename=='whats-new-v38-mac.html':
                content=re.sub(r'\$(?:29|49|59)(?:\s*(?:one-time|once))?','legacy offer',content)
            saved.write_text(content,encoding='utf-8')
        content=notice('This article reflects its original publication date. For the current lineup, Windows and Android are the active app platforms; Mac apps and Layers Talk are discontinued. Access is by contacting the team. See the current product pages for features and setup requirements.')+saved.read_text(encoding='utf-8')
        content+= '<div style="height:32px"></div>'+cta()
        # Shell is nested under blog; adjust the current access CTA rather than article links.
        content=content.replace('href="contact.html?topic=access"','href="../contact.html?topic=access"')
        shell('blog/'+filename,title,description,content,editorial=True,noindex=(filename=='whats-new-v38-mac.html'))
    cards=''.join(card(title,description,href=filename,label='Read article',eyebrow='Archive' if filename=='whats-new-v38-mac.html' else 'From the Layers team') for filename,title,description,_ in ARTICLES)
    content=hero('Notes from the Layers team.','Ideas about learning, family life and technology, plus earlier product history. For current features and access, use the product pages.','Layers journal')+section('Stories & perspectives','<div class="cards two">'+cards+'</div>')
    shell('blog/index.html','Layers journal','Stories about classroom learning and family technology. Historical product articles are labelled with the current lineup.',content)

ASSISTANT_PROMPT = '''You are the Layers website assistant. Help visitors choose the right product and understand setup. Be concise and honest. If you do not know, direct them to questions@thelayersapp.com.

CURRENT ACCESS
Do not quote prices, offer checkout, invent store listings or claim a public release. Current access and builds are arranged through the team at https://www.thelayersapp.com/contact.html?topic=access . Existing licence keys can still be used where the app or dashboard asks for them. Do not request full payment details, passwords or parent PINs.

CURRENT PRODUCT FAMILY
Guard Family consists of a browser parent dashboard at https://www.thelayersapp.com/dashboard.html , the Android parent Controller, Guard Desktop on the child's Windows 10/11 PC, and Guard Mobile on the child's Android phone/tablet. Parents pair each child app using its current expiring code. The dashboard and Controller have Today, Trends and Controls, device status, app/time summaries, schedules, website/app lists, per-app limits, requests and alerts. Parent controls act on the selected paired device; do not promise every device is controlled by a single click.

Windows protection requires parent/administrator setup for full website/firewall capability. Standard child sessions can report reduced protection. Android needs the relevant VPN, accessibility, usage, overlay and other setup permissions. Background/battery restrictions and lost permissions can limit protection. Online or paired does not necessarily mean fully protected. Local saved rules can continue while an app is running; new remote commands need a connection. Content alerts are best-effort and can miss content or flag it incorrectly. Do not promise impossible-to-bypass protection, location tracking, reading all messages, or full browser history.

The free Layers Guard browser extension is independent and managed locally in Chrome/Edge. It has website blocking, browsing schedules, best-effort page-text scanning, a local PIN-gated parent panel and local settings/alerts. It does not pair to the Guard Family dashboard, control native apps or routers, or secure other browsers. Optional Windows Secure Mode applies Chrome policies; it needs administrator approval and a Standard User child account. Force-install requires the verified Guard extension ID. Direct visitors to contact for current extension access rather than the old shared store link.

Layers Teacher is an always-on-top Windows classroom toolbar. It includes push-to-talk speech translation/captions, countdown/stopwatch, class lists and random picker, screen annotation/pointer, noise meter, dictionary/translation, and Classroom room-code connection. Classroom can send links, Focus Mode, browser lockdown, blocked websites and schedules to participating Student extensions. Classroom controls operate in participating browsers, not the entire student computer. Windows source is v3.18, but this does not establish the build in any old public download. The local 14-day teacher trial does not collect payment details or automatically charge at expiry; it asks for a licence key.

Layers Student is a free learning extension for Chrome/Edge: dictionary, synonyms, translation, read aloud, scratchpad/selection tools, supported PDF viewer and optional teacher-room connection with help requests. Online features need a connection; microphone features need permission. It cannot inject on browser-internal pages. Student room codes are distinct from Guard Family device-pairing codes.

DISCONTINUED
Mac apps (Teacher and Guard) and the separate Layers Talk/old Pro branding are not active offerings. There is no current iPhone/iPad child app. A parent can still open the web dashboard in a compatible Mac or iPhone browser to manage supported Windows/Android child devices. Do not promote Mac downloads or separate Talk pricing.

CONTACT AND PAYMENT QUESTIONS
The contact form prepares an email draft; it does not forward or send mail. The visitor must press Send in their email app or copy the draft into webmail. Never claim a message or refund has been sent. This assistant cannot send email, operate customer devices, cancel subscriptions or issue refunds.
For an unexpected charge, ask for merchant, date, product and order reference with sensitive payment details hidden. Do not identify a charge or accuse another service based only on the app name. Current app code uses licence verification, not automatic renewal. Payment-account settings and historical deployments are separate evidence.

LINKS
Product overview: https://www.thelayersapp.com/
Guard Family: https://www.thelayersapp.com/guard-pro.html
Windows child app: https://www.thelayersapp.com/guard-desktop.html
Android child app: https://www.thelayersapp.com/guard-mobile.html
Teacher: https://www.thelayersapp.com/teacher.html
Student: https://www.thelayersapp.com/student.html
Browser Guard: https://www.thelayersapp.com/guard.html
Help: https://www.thelayersapp.com/support.html
Privacy: https://www.thelayersapp.com/privacy.html
'''

def refresh_assistant():
    path=ROOT/'worker.js'
    text=path.read_text(encoding='utf-8')
    assert '`' not in ASSISTANT_PROMPT
    text,count=re.subn(r'const SYSTEM_PROMPT = `.*?`;',lambda _:'const SYSTEM_PROMPT = `'+ASSISTANT_PROMPT+'`;',text,count=1,flags=re.S)
    assert count==1
    path.write_text(text,encoding='utf-8')
    (ROOT/'llms.txt').write_text('''# Layers

Current product and access information, updated 3 October 2026.

## Access
Contact questions@thelayersapp.com for current builds, access and activation guidance.
No public prices or checkout links are advertised. Do not invent release availability.
Existing licence keys remain supported where the product asks for them.

## Guard Family
Parent controls: web dashboard in a compatible browser, or Android Guard Controller.
Child apps: Guard Desktop on Windows 10/11; Guard Mobile on Android.
Pair each device with the parent account using its current pairing code.
Features: time limits, per-app limits, schedules/bedtime, app/site lists, device locks,
internet pause, usage/status reporting, child requests, and best-effort content alerts.
Protection depends on permissions and running services; online is not proof of protection.
There is no current iOS child app or advertised location tracking.

## Classroom
Layers Teacher: Windows toolbar with speech translation/captions, timer, picker,
annotation, dictionary, noise meter, and classroom room-code connection.
Layers Student: free Chrome/Edge learning extension with dictionary, translation,
read aloud, notes, PDF viewer support and optional teacher-room connection.
Teacher source v3.18 does not establish the version of an old public download.
The local 14-day Windows teacher trial does not automatically charge at expiry.

## Browser Guard
Separate free Chrome/Edge extension. Browser-local parent controls, site rules,
browsing schedule and best-effort page scanning. Does not pair to the family dashboard.
Optional Windows Secure Mode applies Chrome policies, not whole-device protection.
Ask the team for the correct extension listing; the old site shared one unconfirmed ID.

## Discontinued
Teacher Mac, Guard Mac and separate Layers Talk are no longer active offerings.
A Mac browser can still open the parent dashboard for Windows/Android child devices.

## Contact
The form prepares a draft. Visitors send it in an email app or webmail.
The assistant cannot send emails, issue refunds or cancel subscriptions.
For payment questions, request merchant, date and order reference with private details hidden.

## Pages
https://www.thelayersapp.com/
https://www.thelayersapp.com/guard-pro.html
https://www.thelayersapp.com/teacher.html
https://www.thelayersapp.com/student.html
https://www.thelayersapp.com/guard.html
https://www.thelayersapp.com/get.html
https://www.thelayersapp.com/support.html
https://www.thelayersapp.com/contact.html
https://www.thelayersapp.com/privacy.html
''',encoding='utf-8')

def refresh_sitemap():
    # Archive apps, unlisted utilities and authenticated dashboard are intentionally excluded.
    pages=['index.html','guard-pro.html','guard-desktop.html','guard-mobile.html','teacher.html','student.html','guard.html','get.html','contact.html','support.html','privacy.html','guardinstall.html','layersinstall.html','guard-windows.html','blog/index.html']
    pages += ['blog/'+name for name,*_ in ARTICLES if name!='whats-new-v38-mac.html']
    pages += [lang+'/'+name for lang in ['ja','zh','vi'] for name in sorted(LOCALIZED) if name!='soho.html']
    ET.register_namespace('','http://www.sitemaps.org/schemas/sitemap/0.9')
    root=ET.Element('{http://www.sitemaps.org/schemas/sitemap/0.9}urlset')
    for page in pages:
        url=ET.SubElement(root,'url')
        route=page.replace('index.html','')
        ET.SubElement(url,'loc').text='https://www.thelayersapp.com/'+route
        ET.SubElement(url,'lastmod').text='2026-10-03'
    ET.indent(root)
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(root,encoding='unicode')+'\n',encoding='utf-8')
    (ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: https://www.thelayersapp.com/sitemap.xml\n',encoding='utf-8')
    # Historical extensionless locale paths should show the same up-to-date home page.
    for lang in ['ja','zh','vi']:
        alias=ROOT/lang/'index'
        if alias.exists(): alias.write_text((ROOT/lang/'index.html').read_text(encoding='utf-8'),encoding='utf-8')

if __name__=='__main__':
    refresh_dashboard()
    refresh_articles()
    refresh_assistant()
    refresh_sitemap()
    print('Refreshed dashboard styling/access labels, journal shell, assistant information and sitemap.')
