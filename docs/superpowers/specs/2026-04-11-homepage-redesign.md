# Layers Homepage Redesign — Implementation Spec
**Date:** 2026-04-11  
**File:** `index.html` (primary) + `guard-mobile.html` (meta only)  
**Status:** Approved by user

---

## 1. Scope

Four changes across `index.html` and its inline i18n (en/ja/zh/vi):

1. Remove Guard Mobile as a free standalone app
2. Redesign: dark palette → Warm Sage + feng shui section order
3. Remove all solo-developer / "father of four" tells
4. Rewrite all copy — shorter, active voice, all 4 languages

---

## 2. Palette — Warm Sage (Option B)

Replace every CSS variable and hardcoded colour in the `<style>` block:

| Token | Old value | New value |
|---|---|---|
| `--bg` | `#0d0d12` | `#F7F4EE` |
| `--bg2` | `#131318` | `#FFFFFF` |
| `--accent` | `#5b7fff` | `#2D6A4F` |
| `--accent2` | `#7c9fff` | `#3D8B67` |
| `--green` | `#2ed573` | `#2D6A4F` |
| `--text` | `#ffffff` | `#1C2B20` |
| `--muted` | `#a0a0b0` | `#5A6B5E` |
| `--dim` | `#555568` | `#9AA89D` |
| `--border` | `rgba(91,127,255,0.15)` | `rgba(45,106,79,0.15)` |
| `--card-bg` | `rgba(26,26,36,0.8)` | `#FFFFFF` |
| `--pill` | `#252530` | `#EDF5F0` |
| Guard accent `#a78bfa` | purple | `#0F766E` (deep teal) |
| Guard accent2 `#c4b5fd` | light purple | `#34D399` (mint) |
| Guard border `rgba(167,139,250,…)` | purple-tinted | `rgba(15,118,110,…)` |
| Guard glow `rgba(167,139,250,…)` | purple | `rgba(15,118,110,…)` |

Additional CSS changes:
- `body { background: #F7F4EE; color: #1C2B20; }`
- `body::after` grid: change grid lines to `rgba(45,106,79,0.04)` (very faint sage, or remove entirely)
- `nav { background: rgba(247,244,238,0.94); }` — light frosted
- `.brand-dot { background: #2D6A4F; box-shadow: 0 0 12px rgba(45,106,79,0.4); }`
- Cards: `box-shadow: 0 2px 16px rgba(45,106,79,0.07);` — gentle lift
- Hero: `background: linear-gradient(180deg, #EDF5F0 0%, #F7F4EE 100%);`
- Announce bar: `background: linear-gradient(90deg, #2D6A4F, #0F766E);`
- All button `.btn-primary`: `background: #2D6A4F;`
- `.nav-cta`: `background: #2D6A4F;`
- Footer: `background: #FFFFFF; border-top: 1px solid rgba(45,106,79,0.15);`
- All hardcoded dark hex values (#131318, #0d0d12, #1a1a36, etc.) → equivalent warm sage
- All hardcoded purple values (#a78bfa, #c4b5fd, rgba(167,139,250,…)) → teal equivalents

---

## 3. Section Order (Feng Shui Flow)

Reorder the `<body>` HTML sections as follows. Do NOT change content inside sections yet (that's step 4+), just reorder the blocks:

**New order:**
1. `<nav>` — unchanged position
2. `.announce-bar` — unchanged position
3. `<section class="hero">` — unchanged position
4. `<section class="wrap" id="products">` — **was #5, now #4** (orientation)
5. `<section class="wrap" id="guard">` — **was #7, now #5** (peace of mind — moved up)
6. `<div class="band" id="problem">` — **was #4, now #6** (teacher focus zone)
7. `<div class="band" id="students">` — **was #6, now #7**
8. `<section class="wrap" id="languages">` — **was #8, stays #8**
9. `<div class="band" id="sync">` — **was #9, stays #9**
10. `<div class="band" id="pricing">` — **was #10, stays #10**
11. ~~`<div class="band" id="story">`~~ — **REMOVE entirely** (both HTML and all i18n keys)
12. `<footer>` — unchanged position

---

## 4. Remove Guard Mobile as Standalone Free App

### 4a. Announce bar
Old: `Layers Guard Mobile for Android — Block websites, set bedtime lockouts, and monitor chats. Free.`  
New: `Layers Guard Pro for Windows — Remote parental control for your child's PC. Coming soon.`  
(Update all 4 language i18n equivalents)

### 4b. Nav dropdown panel
Remove this entire `<a>` block:
```html
<a href="guard-mobile.html" class="ndp-item" role="menuitem">
  <div class="ndp-icon purple">📱</div>
  <div><div class="ndp-name">Layers Guard Mobile</div><div class="ndp-sub">Parental controls · Android</div></div>
  <span class="ndp-free">FREE</span>
</a>
```

### 4c. Products grid — Guard card
Remove the Android App button:
```html
<a href="guard-mobile.html" ...>📱 Android App</a>
```
Update Guard card description to not mention Android.

### 4d. Guard section (#guard) — replace Guard Mobile card
Replace the entire "Guard Mobile" card `<div>` with a **Guard Pro teaser card**:
- Header: `🖥 Layers Guard Pro`
- Sub: `Windows Agent · Coming Soon`
- Description: "Set rules from your phone and they enforce themselves on your child's Windows PC — silently, without a second screen."
- Feature bullets:
  - ✓ Remote control from the Controller app
  - ✓ Block apps and websites on the PC
  - ✓ Daily time limits + bedtime lockout
  - ✓ Real-time alerts to your phone
- CTA: Ghost button → `guard-pro.html` — "Learn More →" (emerald `#34D399` theme, "Coming Soon" badge)

### 4e. Pricing — Guard card
Remove "Chat monitoring on Android" bullet  
Change "Chrome, Edge & Android" → "Chrome & Edge"  
Remove any Android references

### 4f. Footer
Remove: `<a href="guard-mobile.html" ...>Guard Mobile</a>`

---

## 5. Remove Solo Developer / "Father of Four" Tells

### 5a. Meta tags (top of `<head>`)
- `<meta name="description">`: remove "Built by a teacher and father of four in Japan"  
  New: "Classroom tools for teachers, study tools for students, and free parental controls for families. Block harmful sites, translate lessons live, and help every child succeed."
- `<meta property="og:description">`: same update  
- `<meta name="twitter:description">`: same update
- Schema.org `author` Person block: keep name but remove `jobTitle` "Teacher & Developer" → no jobTitle needed

### 5b. Hero badge
Old: `🌏 Built by a teacher & father of four in Japan`  
New: `🛡 Trusted by families in 40+ countries`  
Update i18n `hero_badge` key in **all 4 languages**.  
ja currently: `🌏 多言語クラスのために作られた · 14日間無料体験` → update to: `🛡 世界40カ国以上の家族に信頼されています`  
zh currently: `🌏 专为多语言课堂打造 · 14天免费试用` → update to: `🛡 受到全球40多个国家家庭的信任`  
vi: update similarly: `🛡 Được tin dùng bởi các gia đình tại 40+ quốc gia`

### 5c. Guard section "Built by a parent" blurb
Remove this entire block:
```html
<div style="margin-top:24px;...">
  <span>👨‍👧‍👦</span>
  <p><strong>Built by a parent.</strong> I have four children and I built these tools because I needed them myself. No ads, no tracking, no accounts. Just a parent helping other parents keep their kids safe online.</p>
</div>
```
Replace with a simpler trust statement:
```html
<div class="trust-strip">
  <span>🔒</span>
  <p><strong>No ads. No accounts. No cloud.</strong> Everything runs on your device. Your family's data stays yours.</p>
</div>
```
(Style `.trust-strip` with teal tint, consistent with new palette)

### 5d. `who_intro` key (en)
Old: "Built by a teacher in Japan for classrooms full of students from Vietnam, China, Nepal, and beyond — Layers is used by language teachers, presenters, and trainers worldwide."  
New: "Designed for multilingual classrooms — used by language teachers, trainers, and presenters in over 40 countries."  
Update ja/zh/vi equivalents to remove any "I built" / "私が作った" framing.

### 5e. Story section — remove entirely
Delete the full `<div class="band" id="story">` block from HTML.  
Delete these i18n keys from all 4 language objects: `story_tag`, `story_h2`, `story_body`, `story_coffee`, `story_sign`.

### 5f. Footer copyright
Old: `© 2026 Layers · Peter Hoang · Japan · thelayersapp.com`  
New: `© 2026 Layers · thelayersapp.com`

---

## 6. Copy Rewrites (English — active voice, ≤50% of current word count)

### Hero
Old sub: "Classroom tools for teachers. Study tools for students. Parental controls for families. Everything is built to help children succeed — at school and at home."  
New sub: "Classroom tools for teachers. Study tools for students. Parental controls for families. Free to use, free to trust."

### Problem section headline
Old: "Every interruption costs you the room."  
New: "Every interruption loses the room." *(active, shorter)*

### Problem intro
Old: "Every time you stop to translate for a student, switch apps for a timer, or hunt for a file — you lose everyone else. Layers keeps every tool on top of your presentation, one click away."  
New: "Stop to translate, hunt for a file, switch apps for a timer — you lose the room. Layers keeps everything on top of your presentation. One click, no switching."

### Products section intro
Old: "Classroom management for teachers. Productivity tools for students. Parental controls for families. Every product is free or one-time purchase — no subscriptions, ever."  
New: "Four tools. One mission: help children learn, focus, and stay safe. Free for students and parents. One-time purchase for teachers."

### Guard section intro
Old: "Layers Guard gives parents the same control teachers have — block websites, set schedules, and cut internet at bedtime. Free on Chrome, Edge, and Android."  
New: "Layers Guard gives you real control. Block harmful sites, set bedtime curfews, and monitor what your child sees. Free on Chrome and Edge."

### Guard section headline
Old: "Protect your children at home, too."  
New: "Your child is protected." *(direct, reassuring)*

### Student section intro
Old: "Layers Student is a complete floating toolkit that lives in the browser — seven tools, always one click away, on top of any page your students are working on. Free forever, no account needed."  
New: "Seven tools. One click away. Always on top of whatever page they're on. Free forever — no sign-up needed."

### Sync section intro
Old: "Create a permanent classroom once and share the code with your class. From that moment, every student's screen is connected — and they'll automatically rejoin at the start of every lesson."  
New: "Share the room code once. Every student's screen connects — and auto-rejoins every lesson from then on."

### Pricing section intro
Old: "Students and parents get everything free. Teachers pay once — no subscriptions, no monthly fees, no renewals."  
New: "Students and parents: always free. Teachers: pay once, keep forever."

### No-ads strip
Old: "Students and teachers will never see an advertisement inside Layers. Your purchase keeps the app improving — nothing else."  
New: "No ads. Students, teachers, and parents will never see one. Your purchase keeps Layers improving."

### i18n: Apply equivalent rewrites to ja/zh/vi keys listed above.

---

## 7. guard-mobile.html — Meta Updates Only

Update head meta tags only:
- Remove "free" from title → `Layers Guard Mobile — Android Parental Controls`
- Remove "Built by a teacher and father of four" from description
- Remove "Free Android app" framing from description and og/twitter

---

## 8. Files Changed

| File | Changes |
|---|---|
| `index.html` | Full redesign: CSS, section order, content, i18n |
| `guard-mobile.html` | Meta description updates only |

---

## 9. What Does NOT Change

- All URLs and `href` links (except removing guard-mobile nav entry)
- The toolbar demo widget
- The languages grid
- Product pricing ($29, free, custom)
- The school/enterprise strip
- `guard.html`, `guard-pro.html`, `get.html`, `contact.html`
- ja/, zh/, vi/ subdirectory pages (they don't contain homepage content)
- `worker.js`, blog pages
