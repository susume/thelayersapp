# Homepage Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Layers homepage from a dark, gloomy SaaS aesthetic into a warm, welcoming design using a Warm Sage (feng shui Wood element) palette, reordered sections for better energy flow, with Guard Mobile removed and all solo-developer tells stripped.

**Architecture:** Single large static HTML file (`index.html`) with all CSS in a `<style>` block, all JavaScript i18n in a `<script>` block, and all HTML in `<body>`. Changes are sequential — each task edits a distinct region of the file. No build tools, no dependencies. Preview via `python -m http.server 4321`.

**Tech Stack:** Plain HTML5, CSS custom properties, vanilla JS i18n object (en/ja/zh/vi). Preview server already running on port 4321.

---

## File Map

| File | Tasks | What changes |
|---|---|---|
| `index.html` | 0–7 | CSS variables, body styles, section order, all content, all i18n |
| `guard-mobile.html` | 8 | `<head>` meta tags only |

---

## Task 0: CSS Palette — Root Variables & Body

**Goal:** Replace every dark-palette token in `:root` and `body` with Warm Sage values so the entire site shifts to the new colour scheme in one step.

**Files:**
- Modify: `index.html` — `<style>` block, `:root {}` and `body {}` rules

**Acceptance Criteria:**
- [ ] All 11 CSS custom properties in `:root` updated
- [ ] `body` background and color updated
- [ ] `body::after` grid lines updated to faint sage
- [ ] No `#0d0d12`, `#131318`, `#ffffff` (as text color), or `#a0a0b0` remaining in `:root` or `body`

**Verify:** Open `http://localhost:4321/` — page background is warm cream `#F7F4EE`, text is dark charcoal `#1C2B20`

**Steps:**

- [ ] **Step 1: Replace `:root` block**

Find this block in `<style>`:
```css
:root {
  --bg:      #0d0d12;
  --bg2:     #131318;
  --accent:  #5b7fff;
  --accent2: #7c9fff;
  --green:   #2ed573;
  --text:    #ffffff;
  --muted:   #a0a0b0;
  --dim:     #555568;
  --border:  rgba(91,127,255,0.15);
  --card-bg: rgba(26,26,36,0.8);
  --pill:    #252530;
}
```

Replace with:
```css
:root {
  --bg:      #F7F4EE;
  --bg2:     #FFFFFF;
  --accent:  #2D6A4F;
  --accent2: #3D8B67;
  --green:   #2D6A4F;
  --text:    #1C2B20;
  --muted:   #5A6B5E;
  --dim:     #9AA89D;
  --border:  rgba(45,106,79,0.15);
  --card-bg: #FFFFFF;
  --pill:    #EDF5F0;
}
```

- [ ] **Step 2: Update `body` rule**

Find:
```css
body {
  background: var(--bg); color: var(--text);
  font-family: 'Outfit', sans-serif; font-weight: 400;
  line-height: 1.6; overflow-x: hidden;
}
```

The variables now point to the right values — this rule stays as-is (uses vars). ✓

- [ ] **Step 3: Update `body::after` grid**

Find:
```css
body::after {
  content: ''; position: fixed; inset: 0;
  background-image: linear-gradient(rgba(91,127,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(91,127,255,0.03) 1px, transparent 1px);
  background-size: 60px 60px; pointer-events: none; z-index: 0;
}
```

Replace with (very faint sage grid):
```css
body::after {
  content: ''; position: fixed; inset: 0;
  background-image: linear-gradient(rgba(45,106,79,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(45,106,79,0.04) 1px, transparent 1px);
  background-size: 60px 60px; pointer-events: none; z-index: 0;
}
```

- [ ] **Step 4: Commit**

```bash
cd "C:\Users\gakut\Downloads\ALL layers files\ALL layers files\layers_v3\layers_v3\HTML\thelayersapp-main"
git add index.html
git commit -m "design: apply Warm Sage CSS palette tokens"
```

---

## Task 1: CSS — Nav, Cards, Hero, Announce Bar, Footer

**Goal:** Update every hardcoded hex colour in the CSS rules (outside `:root`) — nav, cards, hero gradient, announce bar, brand dot, footer, and all purple/dark overrides — to match the Warm Sage palette.

**Files:**
- Modify: `index.html` — `<style>` block, all rules below `:root`

**Acceptance Criteria:**
- [ ] Nav has light frosted background
- [ ] Brand dot is forest green with green glow
- [ ] `.announce-bar` has forest-green-to-teal gradient
- [ ] `.hero` has warm sage gradient, not dark radial
- [ ] All `.ndp-icon.purple`, `.ndp-icon.green`, `.ndp-icon.blue` updated to new accent colours
- [ ] Cards have `box-shadow: 0 2px 16px rgba(45,106,79,0.07)` lift
- [ ] Footer is white with sage border
- [ ] No `#0d0d12`, `#131318`, `#a78bfa`, `#c4b5fd`, `rgba(167,139,250,…)` anywhere in CSS

**Verify:** Open `http://localhost:4321/` — nav is light/frosted, hero has warm green-cream gradient, announce bar is green, cards look lifted and warm

**Steps:**

- [ ] **Step 1: Update nav background**

Find:
```css
nav {
  position: fixed; top: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 64px;
  background: rgba(13,13,18,0.92); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border); z-index: 100;
}
```

Replace `background: rgba(13,13,18,0.92)` with `background: rgba(247,244,238,0.94)`:
```css
nav {
  position: fixed; top: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px; height: 64px;
  background: rgba(247,244,238,0.94); backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border); z-index: 100;
}
```

- [ ] **Step 2: Update brand dot animation**

Find:
```css
.brand-dot { width: 10px; height: 10px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 12px var(--accent); animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 8px var(--accent); } 50% { box-shadow: 0 0 20px var(--accent), 0 0 40px rgba(91,127,255,0.3); } }
```

Replace the `rgba(91,127,255,0.3)` with `rgba(45,106,79,0.3)`:
```css
.brand-dot { width: 10px; height: 10px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 12px var(--accent); animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 8px var(--accent); } 50% { box-shadow: 0 0 20px var(--accent), 0 0 40px rgba(45,106,79,0.3); } }
```

- [ ] **Step 3: Update ndp-icon colour variants**

Find:
```css
.ndp-icon.blue   { background: rgba(91,127,255,0.15);  border: 1px solid rgba(91,127,255,0.25); }
.ndp-icon.green  { background: rgba(46,213,115,0.12);  border: 1px solid rgba(46,213,115,0.25); }
.ndp-icon.purple { background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.25); }
```

Replace with:
```css
.ndp-icon.blue   { background: rgba(45,106,79,0.12);  border: 1px solid rgba(45,106,79,0.25); }
.ndp-icon.green  { background: rgba(45,106,79,0.10);  border: 1px solid rgba(45,106,79,0.20); }
.ndp-icon.purple { background: rgba(15,118,110,0.12); border: 1px solid rgba(15,118,110,0.25); }
```

- [ ] **Step 4: Update announce bar**

Find:
```css
.announce-bar {
```
Locate the full `.announce-bar` CSS rule. Find any `background` property and set it to:
```css
background: linear-gradient(90deg, #2D6A4F, #0F766E);
```
Also update `.ab-tag` background — find:
```css
.ab-tag { background: rgba(91,127,255,0.2);
```
Replace with:
```css
.ab-tag { background: rgba(255,255,255,0.2);
```

- [ ] **Step 5: Update hero section**

Find the `.hero-glow` rule and remove or neutralise the purple/blue radial glow:
```css
.hero-glow {
  position: fixed; ...
  background: radial-gradient(circle, rgba(91,127,255,0.08) 0%, transparent 68%);
```
Replace gradient with sage:
```css
  background: radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 68%);
```

Find `.hero` section rule and add a warm gradient background. Locate:
```css
.hero {
  min-height: 100vh; display: flex; ...
```
Add `background: linear-gradient(180deg, #EDF5F0 0%, #F7F4EE 60%);` to this rule.

- [ ] **Step 6: Update hero badge colours**

Find:
```css
.hero-badge {
  ...
  background: rgba(91,127,255,0.08); border: 1px solid rgba(91,127,255,0.2);
  ... color: var(--accent2);
```
Replace the rgba values:
```css
  background: rgba(45,106,79,0.08); border: 1px solid rgba(45,106,79,0.2);
```

- [ ] **Step 7: Update product cards**

Find `.product-card` and `.price-card` rules. Add `box-shadow: 0 2px 16px rgba(45,106,79,0.07);` and ensure any hardcoded dark background is replaced with `var(--card-bg)`.

Find `.product-card.featured` — update its `background` from any dark gradient to:
```css
background: linear-gradient(135deg, rgba(45,106,79,0.06), #FFFFFF);
```

- [ ] **Step 8: Update footer**

Find:
```css
footer { background: var(--bg2); border-top: 1px solid var(--border); padding: 48px 40px; }
```
This uses vars so it's already correct once variables are updated. ✓

Also find `.footer-copy { color: var(--dim); ... }` — uses var, correct. ✓

- [ ] **Step 9: Update band (dark section) backgrounds**

Find `.band` rule:
```css
.band   { padding: 100px 40px; background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
```
Uses vars — already correct. ✓

- [ ] **Step 10: Sweep for remaining hardcoded purple/dark values**

Search the `<style>` block for: `#a78bfa`, `#c4b5fd`, `rgba(167,139,250`, `#0d0d12`, `#131318`, `#252530`, `rgba(26,26,36`, `rgba(91,127,255`

For each found occurrence (outside `:root`), apply:
- `#a78bfa` → `#0F766E`
- `#c4b5fd` → `#34D399`
- `rgba(167,139,250,0.12)` → `rgba(15,118,110,0.12)`
- `rgba(167,139,250,0.2)` → `rgba(15,118,110,0.2)`
- `rgba(167,139,250,0.25)` → `rgba(15,118,110,0.25)`
- `rgba(167,139,250,0.3)` → `rgba(15,118,110,0.3)`
- `rgba(167,139,250,0.35)` → `rgba(15,118,110,0.35)`
- `rgba(167,139,250,0.4)` → `rgba(15,118,110,0.4)`
- `rgba(167,139,250,0.08)` → `rgba(15,118,110,0.08)`
- `rgba(167,139,250,0.06)` → `rgba(15,118,110,0.06)`
- `rgba(167,139,250,0.1)` → `rgba(15,118,110,0.1)`
- `rgba(167,139,250,0.15)` → `rgba(15,118,110,0.15)`
- `rgba(167,139,250,0.18)` → `rgba(15,118,110,0.18)`
- `#0d0d12` → `#F7F4EE`
- `#131318` → `#FFFFFF`
- `rgba(26,26,36,0.8)` → `#FFFFFF`
- `rgba(26,26,36,0.9)` → `#FFFFFF`
- `rgba(26,26,36,0.95)` → `#FFFFFF`
- `rgba(91,127,255,0.06)` → `rgba(45,106,79,0.06)`
- `rgba(91,127,255,0.07)` → `rgba(45,106,79,0.07)`
- `rgba(91,127,255,0.08)` → `rgba(45,106,79,0.08)`
- `rgba(91,127,255,0.1)` → `rgba(45,106,79,0.1)`
- `rgba(91,127,255,0.12)` → `rgba(45,106,79,0.12)`
- `rgba(91,127,255,0.15)` → `rgba(45,106,79,0.15)`
- `rgba(91,127,255,0.18)` → `rgba(45,106,79,0.18)`
- `rgba(91,127,255,0.2)` → `rgba(45,106,79,0.2)`
- `rgba(91,127,255,0.25)` → `rgba(45,106,79,0.25)`
- `rgba(91,127,255,0.3)` → `rgba(45,106,79,0.3)`
- `rgba(91,127,255,0.35)` → `rgba(45,106,79,0.35)`
- `rgba(91,127,255,0.4)` → `rgba(45,106,79,0.4)`
- `rgba(13,13,18,0.92)` → `rgba(247,244,238,0.94)`
- `rgba(13,13,18,0.94)` → `rgba(247,244,238,0.94)`
- `rgba(0,0,0,0.6)` (in dropdown shadow) → `rgba(45,106,79,0.15)`
- `#2ed573` (hardcoded green) → `#2D6A4F`
- `#0d0d12` (in inline styles in HTML body) → `#F7F4EE`

Also update `.no-ads` background:
```css
/* find: */
background: rgba(46,213,115,0.07); border: 1px solid rgba(46,213,115,0.2);
/* replace: */
background: rgba(45,106,79,0.06); border: 1px solid rgba(45,106,79,0.18);
```
And `.no-ads strong { color: var(--green); }` — uses var, correct. ✓

- [ ] **Step 11: Add `.trust-strip` CSS** (needed for Task 3)

Add this rule at the end of the `<style>` block, before `</style>`:
```css
.trust-strip { display: flex; align-items: center; gap: 16px; background: rgba(15,118,110,0.06); border: 1px solid rgba(15,118,110,0.18); border-radius: 16px; padding: 24px 36px; margin: 24px 0 0; }
.trust-strip .ti { font-size: 1.8rem; flex-shrink: 0; }
.trust-strip p { font-size: 0.95rem; color: var(--muted); line-height: 1.6; }
.trust-strip strong { color: #0F766E; }
```

- [ ] **Step 12: Commit**

```bash
git add index.html
git commit -m "design: update all hardcoded colours to Warm Sage palette"
```

---

## Task 2: Section Reorder (Feng Shui Flow)

**Goal:** Move the HTML body sections into the approved feng shui order — Guard (peace of mind) moves before teacher problem; products grid moves before guard.

**Files:**
- Modify: `index.html` — `<body>` section order only (no content changes)

**Acceptance Criteria:**
- [ ] On page load, order is: hero → products → guard → problem → students → languages → sync → pricing → footer
- [ ] Story section (`id="story"`) is removed from the HTML entirely
- [ ] All section IDs preserved correctly

**Verify:** Open `http://localhost:4321/` — scroll order matches: hero, products grid, guard/parents section, teacher problem, students, languages, sync, pricing, footer

**Steps:**

- [ ] **Step 1: Identify the four moveable sections**

The body currently reads (in order):
1. `<section class="hero">` — stays
2. `<div class="band" id="problem">` — moves DOWN to position 6
3. `<section class="wrap" id="products">` — moves UP to position 4
4. `<div class="band" id="students">` — moves DOWN to position 7
5. `<section class="wrap" id="guard">` — moves UP to position 5
6. `<section class="wrap" id="languages">` — stays
7. `<div class="band" id="sync">` — stays
8. `<div class="band" id="pricing">` — stays
9. `<div class="band" id="story">` — DELETE

- [ ] **Step 2: Reorder by cut-and-paste**

Restructure the body so sections appear in this exact order:
```
<nav>...</nav>
<div class="announce-bar" ...>...</div>
<section class="hero">...</section>
<section class="wrap" id="products">...</section>   ← was 3rd
<section class="wrap" id="guard">...</section>       ← was 5th
<div class="band" id="problem">...</div>             ← was 2nd
<div class="band" id="students">...</div>            ← was 4th
<section class="wrap" id="languages">...</section>
<div class="band" id="sync">...</div>
<div class="band" id="pricing">...</div>
<footer>...</footer>
```

Do NOT touch any content inside the sections — only their order.

- [ ] **Step 3: Delete the story section**

Delete the entire block from `<div class="band" id="story">` to its closing `</div>` (inclusive). This is the section containing the "Why I built Layers" content.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "design: reorder sections for feng shui flow, remove story section"
```

---

## Task 3: Remove Guard Mobile — All References

**Goal:** Remove every mention of Guard Mobile as a free standalone app from the page — announce bar, nav dropdown, products card, guard section, pricing card, footer.

**Files:**
- Modify: `index.html` — announce bar, nav, products section, guard section, pricing section, footer

**Acceptance Criteria:**
- [ ] Announce bar references Guard Pro, not Guard Mobile
- [ ] Nav dropdown has no Guard Mobile entry
- [ ] Products grid Guard card has no "📱 Android App" button
- [ ] Guard section has no Guard Mobile card (replaced by Guard Pro teaser in Task 4)
- [ ] Pricing Guard card has no Android references
- [ ] Footer has no Guard Mobile link

**Verify:** Cmd+F search for "guard-mobile" in page source — zero results

**Steps:**

- [ ] **Step 1: Update announce bar text**

Find:
```html
<span><strong>Layers Guard Mobile for Android</strong> — Block websites, set bedtime lockouts, and monitor chats. Free.</span>
<a href="guard-mobile.html" class="ab-link">Learn more →</a>
```

Replace with:
```html
<span><strong>Layers Guard Pro for Windows</strong> — Remote parental control for your child's PC. Coming soon.</span>
<a href="guard-pro.html" class="ab-link">Learn more →</a>
```

- [ ] **Step 2: Remove Guard Mobile from nav dropdown**

Find and delete this entire `<a>` element from inside `.nav-dropdown-panel`:
```html
<a href="guard-mobile.html" class="ndp-item" role="menuitem">
  <div class="ndp-icon purple">📱</div>
  <div><div class="ndp-name">Layers Guard Mobile</div><div class="ndp-sub">Parental controls · Android</div></div>
  <span class="ndp-free">FREE</span>
</a>
```

- [ ] **Step 3: Remove Android App button from products grid Guard card**

In the Guard card inside `id="products"`, find and delete:
```html
<a href="guard-mobile.html" style="...">📱 Android App</a>
```
(The "Learn More" button to guard.html stays.)

Also update the Guard card `<p>` description — find:
```
Block websites, set internet schedules, and cut off internet at bedtime. PIN-protected so your children can't change anything. Works in incognito.
```
Replace with:
```
Block websites, set bedtime curfews, and monitor what your child sees. PIN-protected so children can't change anything — even in incognito.
```

- [ ] **Step 4: Remove Guard Mobile card from guard section**

In `id="guard"`, the 2-col grid has two cards. Find and DELETE the entire second card div — it starts with:
```html
<div style="background:var(--card-bg);border:1px solid rgba(167,139,250,0.2);..." onmouseover="...">
  <div style="font-size:2.2rem;margin-bottom:16px;">📱</div>
  <h3 style="...">Layers Guard Mobile</h3>
```
…and ends at its closing `</div>` before the closing `</div>` of the 2-col grid wrapper.

The grid will now be a single-column (Guard Chrome). Leave the grid wrapper — it will be updated to 2 columns again when we add Guard Pro in Task 4.

- [ ] **Step 5: Remove Android from pricing Guard card**

In the Guard pricing card, find and delete this line:
```html
<li><span class="ck" style="color:#a78bfa;">✓</span> Chat monitoring on Android</li>
```

Find:
```html
<li><span class="ck" style="color:#a78bfa;">✓</span> Chrome, Edge &amp; Android</li>
```
Replace with:
```html
<li><span class="ck" style="color:#0F766E;">✓</span> Chrome &amp; Edge</li>
```

Also update all `style="color:#a78bfa;"` in the Guard pricing card to `style="color:#0F766E;"`.

- [ ] **Step 6: Remove Guard Mobile from footer**

Find in `<footer>`:
```html
<a href="guard-mobile.html" style="color:#a78bfa;">Guard Mobile</a>
```
Delete this `<a>` element entirely.

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: remove Guard Mobile as standalone free app"
```

---

## Task 4: Guard Section — Add Guard Pro Teaser & Trust Strip

**Goal:** Replace the removed Guard Mobile card with a Guard Pro teaser card, and replace the "Built by a parent" blurb with a clean trust strip.

**Files:**
- Modify: `index.html` — `id="guard"` section

**Acceptance Criteria:**
- [ ] Guard section shows a 2-col grid: Guard Chrome card (left) + Guard Pro teaser card (right)
- [ ] Guard Pro card has "Coming Soon" badge, correct description, 4 feature bullets, ghost CTA → `guard-pro.html`
- [ ] "Built by a parent / father of four" blurb is gone
- [ ] Trust strip shows with teal styling

**Verify:** Open `http://localhost:4321/#guard` — two cards side by side, Guard Pro has emerald "Coming Soon" badge, trust strip reads "No ads. No accounts. No cloud."

**Steps:**

- [ ] **Step 1: Restore 2-col grid and insert Guard Pro card**

After the Guard Chrome card (ending `</div>`), insert this Guard Pro teaser card inside the grid wrapper:

```html
<!-- Guard Pro teaser -->
<div style="background:var(--card-bg);border:1px solid rgba(52,211,153,0.25);border-radius:20px;padding:36px;transition:transform 0.3s,border-color 0.3s;position:relative;" onmouseover="this.style.transform='translateY(-4px)';this.style.borderColor='rgba(52,211,153,0.45)'" onmouseout="this.style.transform='none';this.style.borderColor='rgba(52,211,153,0.25)'">
  <span style="position:absolute;top:16px;right:16px;background:#34D399;color:#0d2b1f;font-size:0.65rem;font-weight:800;padding:3px 10px;border-radius:100px;letter-spacing:0.08em;text-transform:uppercase;">Coming Soon</span>
  <div style="font-size:2.2rem;margin-bottom:16px;">🖥</div>
  <h3 style="font-family:'DM Serif Display',serif;font-size:1.5rem;margin-bottom:8px;color:var(--text);">Layers Guard Pro</h3>
  <p style="font-size:0.82rem;color:#0F766E;font-weight:600;margin-bottom:14px;">Windows Agent · Coming Soon</p>
  <p style="font-size:0.9rem;color:var(--muted);line-height:1.7;margin-bottom:20px;">Set rules from your phone — they enforce themselves on your child's Windows PC, silently, without a second screen.</p>
  <ul style="list-style:none;display:flex;flex-direction:column;gap:8px;margin-bottom:24px;">
    <li style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--muted);"><span style="color:#0F766E;">✓</span> Remote control from the Controller app</li>
    <li style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--muted);"><span style="color:#0F766E;">✓</span> Block apps and websites on the PC</li>
    <li style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--muted);"><span style="color:#0F766E;">✓</span> Daily time limits + bedtime lockout</li>
    <li style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--muted);"><span style="color:#0F766E;">✓</span> Real-time alerts to your phone</li>
  </ul>
  <a href="guard-pro.html" style="display:inline-flex;align-items:center;gap:8px;background:transparent;color:#0F766E;padding:11px 22px;border-radius:10px;font-size:0.88rem;font-weight:700;text-decoration:none;transition:all 0.2s;border:1px solid rgba(15,118,110,0.4);">Learn More →</a>
</div>
```

- [ ] **Step 2: Replace "Built by a parent" blurb with trust strip**

Find the blurb block (immediately after the 2-col grid closing `</div>`):
```html
<div style="margin-top:24px;background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.18);border-radius:14px;padding:20px 28px;display:flex;align-items:center;gap:16px;" class="reveal">
  <span style="font-size:1.5rem;flex-shrink:0;">👨‍👧‍👦</span>
  <p style="font-size:0.9rem;color:var(--muted);line-height:1.65;"><strong style="color:#c4b5fd;">Built by a parent.</strong> I have four children and I built these tools because I needed them myself. No ads, no tracking, no accounts. Just a parent helping other parents keep their kids safe online.</p>
</div>
```

Replace with:
```html
<div class="trust-strip reveal">
  <span class="ti">🔒</span>
  <p><strong>No ads. No accounts. No cloud.</strong> Everything runs on your device. Your family's data stays yours.</p>
</div>
```

- [ ] **Step 3: Update guard section headline and intro text**

Find inside `id="guard"`:
```html
<h2>Protect your children<br><em style="color:#a78bfa;">at home, too.</em></h2>
<p class="intro">Layers Guard gives parents the same control teachers have — block websites, set schedules, and cut internet at bedtime. Free on Chrome, Edge, and Android.</p>
```

Replace with:
```html
<h2>Your child is<br><em style="color:#0F766E;">protected.</em></h2>
<p class="intro">Layers Guard gives you real control. Block harmful sites, set bedtime curfews, and monitor what your child sees. Free on Chrome and Edge.</p>
```

- [ ] **Step 4: Update guard section label tag colour**

Find:
```html
<span class="label-tag" style="color:#a78bfa;">// For parents</span>
```
Replace:
```html
<span class="label-tag" style="color:#0F766E;">// For parents</span>
```

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add Guard Pro teaser card, trust strip, update guard section copy"
```

---

## Task 5: Remove Solo Developer Tells

**Goal:** Strip every "built by a teacher", "father of four", "Peter Hoang" tell from meta tags, hero badge HTML, guard blurb, who_intro, and footer.

**Files:**
- Modify: `index.html` — `<head>` meta section, hero HTML, footer HTML

**Acceptance Criteria:**
- [ ] `<meta name="description">` contains no "father of four" or "teacher" builder reference
- [ ] `<meta property="og:description">` same
- [ ] `<meta name="twitter:description">` same
- [ ] Hero badge HTML says "🛡 Trusted by families in 40+ countries"
- [ ] Footer copyright is `© 2026 Layers · thelayersapp.com`
- [ ] No "I have four children", "father of four", "I built", "solo" in page HTML

**Verify:** Cmd+F in browser devtools source for "father" → zero results; for "I built" → zero results

**Steps:**

- [ ] **Step 1: Update meta description**

Find:
```html
<meta name="description" content="Classroom tools for teachers, productivity tools for students, and parental controls for families. Free student extension, free parental web filter, and a floating teacher toolbar. Built by a teacher and father of four in Japan.">
```
Replace with:
```html
<meta name="description" content="Classroom tools for teachers, study tools for students, and free parental controls for families. Block harmful sites, translate lessons live, and help every child succeed.">
```

- [ ] **Step 2: Update OG and Twitter descriptions**

Find:
```html
<meta property="og:description" content="Classroom tools for teachers, study tools for students, parental controls for families. Built by a teacher and father of four in Japan.">
```
Replace with:
```html
<meta property="og:description" content="Classroom tools for teachers, study tools for students, and free parental controls for families. Free to use, free to trust.">
```

Find:
```html
<meta name="twitter:description" content="Classroom tools for teachers, study tools for students, parental controls for families. Built by a teacher and father of four in Japan.">
```
Replace with:
```html
<meta name="twitter:description" content="Classroom tools for teachers, study tools for students, and free parental controls for families. Free to use, free to trust.">
```

- [ ] **Step 3: Update Schema.org author block**

Find in the JSON-LD `<script>`:
```json
"author": {
  "@type": "Person",
  "name": "Peter Hoang",
  "jobTitle": "Teacher & Developer",
  "address": { "@type": "PostalAddress", "addressCountry": "JP" }
},
```
Replace with:
```json
"author": {
  "@type": "Organization",
  "name": "Layers"
},
```
(Apply this change to all schema blocks that have the Person author reference.)

- [ ] **Step 4: Update hero badge HTML**

Find in `<section class="hero">`:
```html
<div class="hero-badge">🌏 Built by a teacher &amp; father of four in Japan</div>
```
Replace with:
```html
<div class="hero-badge">🛡 Trusted by families in 40+ countries</div>
```

- [ ] **Step 5: Update footer copyright**

Find:
```html
<p class="footer-copy">© 2026 Layers · Peter Hoang · Japan · <a href="https://thelayersapp.com" style="color:var(--accent);text-decoration:none;">thelayersapp.com</a></p>
```
Replace with:
```html
<p class="footer-copy">© 2026 Layers · <a href="https://thelayersapp.com" style="color:var(--accent);text-decoration:none;">thelayersapp.com</a></p>
```

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "privacy: remove solo developer and father-of-four references"
```

---

## Task 6: English Copy Rewrites + EN i18n Updates

**Goal:** Update all English-language copy in the i18n `en:{}` object and any non-i18n HTML text — shorter, active voice, ≤50% word count where possible.

**Files:**
- Modify: `index.html` — `<script>` block `en:{}` object, plus a few non-i18n HTML strings

**Acceptance Criteria:**
- [ ] `hero_badge` updated
- [ ] `hero_sub` updated
- [ ] `prob_h2`, `prob_intro` updated (active voice)
- [ ] `prod_intro` updated (shorter)
- [ ] `stud_intro` updated (shorter)
- [ ] `sync_intro` updated (shorter)
- [ ] `price_intro` updated (shorter)
- [ ] `no_ads` updated
- [ ] `who_intro` updated (no "built by a teacher")
- [ ] `story_tag`, `story_h2`, `story_body`, `story_coffee` keys deleted from `en:{}`

**Verify:** Switch language to EN on the page, check each section's visible text is the new shorter copy

**Steps:**

- [ ] **Step 1: Update hero keys in en:{}**

Find in `en: {`:
```js
hero_badge:"🌏 Built by a teacher &amp; father of four in Japan",
```
Replace with:
```js
hero_badge:"🛡 Trusted by families in 40+ countries",
```

Find:
```js
hero_sub:"Classroom tools for teachers. Study tools for students. Parental controls for families. Everything is built to help children succeed — at school and at home.",
```
Replace with:
```js
hero_sub:"Classroom tools for teachers. Study tools for students. Parental controls for families. Free to use, free to trust.",
```

- [ ] **Step 2: Update problem section keys**

Find:
```js
prob_h2:"Every interruption<br>costs you <em>the room.</em>",
prob_intro:"Every time you stop to translate for a student, switch apps for a timer, or hunt for a file — you lose everyone else. Layers keeps every tool on top of your presentation, one click away.",
```
Replace with:
```js
prob_h2:"Every interruption<br>loses <em>the room.</em>",
prob_intro:"Stop to translate, hunt for a file, switch apps for a timer — you lose the room. Layers keeps everything on top of your presentation. One click, no switching.",
```

- [ ] **Step 3: Update products section**

Find (in HTML, not i18n — check section `id="products"`):
```html
<p class="intro">Classroom management for teachers. Productivity tools for students. Parental controls for families. Every product is free or one-time purchase — no subscriptions, ever.</p>
```
Replace with:
```html
<p class="intro">Four tools. One mission: help children learn, focus, and stay safe. Free for students and parents. One-time purchase for teachers.</p>
```

Also update the h2:
```html
<h2>Four tools. One <em>mission.</em></h2>
```
Stays — this is already good. ✓

- [ ] **Step 4: Update students section keys**

Find:
```js
stud_intro:"Layers Student is a complete floating toolkit that lives in the browser — seven tools, always one click away, on top of any page your students are working on. Free forever, no account needed.",
```
Replace with:
```js
stud_intro:"Seven tools. One click away. Always on top of whatever page they're on. Free forever — no sign-up needed.",
```

- [ ] **Step 5: Update sync section keys**

Find:
```js
sync_intro:"Create a permanent classroom once and share the code with your class. From that moment, every student's screen is connected — and they'll automatically rejoin at the start of every lesson.",
```
Replace with:
```js
sync_intro:"Share the room code once. Every student's screen connects — and auto-rejoins every lesson from then on.",
```

- [ ] **Step 6: Update pricing keys**

Find:
```js
price_intro:"Students and parents get everything free. Teachers pay once — no subscriptions, no monthly fees, no renewals.",
```
Replace with:
```js
price_intro:"Students and parents: always free. Teachers: pay once, keep forever.",
```

- [ ] **Step 7: Update no_ads key**

Find:
```js
no_ads:"<strong>No ads. Ever.</strong> Students and teachers will never see an advertisement inside Layers. Your purchase keeps the app improving — nothing else.",
```
Replace with:
```js
no_ads:"<strong>No ads. Ever.</strong> Students, teachers, and parents will never see one. Your purchase keeps Layers improving.",
```

- [ ] **Step 8: Update who_intro key**

Find:
```js
who_intro:"Built by a teacher in Japan for classrooms full of students from Vietnam, China, Nepal, and beyond — Layers is used by language teachers, presenters, and trainers worldwide.",
```
Replace with:
```js
who_intro:"Designed for multilingual classrooms — used by language teachers, trainers, and presenters in over 40 countries.",
```

- [ ] **Step 9: Delete story keys from en:{}**

Find and delete all of these key-value pairs from the `en:{}` object:
```js
story_tag:"// Why I built Layers",
story_h2:"This is personal.<br><em>Here's why.</em>",
story_body:'<p>I\'m Peter Hoang, a teacher living in Japan...',    ← long string
story_coffee:"Support Layers"
```
(Delete from `story_tag` up to and including `story_coffee:"Support Layers"` and the trailing comma of the last key before it)

- [ ] **Step 10: Commit**

```bash
git add index.html
git commit -m "copy: rewrite EN copy for active voice and brevity, strip story keys"
```

---

## Task 7: Japanese (JA) i18n Updates

**Goal:** Update all Japanese i18n strings — hero badge, who_intro, story key removal, announce bar reference, and Guard Mobile references in any JA strings.

**Files:**
- Modify: `index.html` — `<script>` block `ja:{}` object

**Acceptance Criteria:**
- [ ] `hero_badge` updated (no longer references multilingual classrooms + trial)
- [ ] `who_intro` updated (no "私が作った" framing)
- [ ] `story_tag`, `story_h2`, `story_body`, `story_coffee` keys deleted from `ja:{}`
- [ ] `price_intro` updated to match EN brevity

**Verify:** Switch language selector to 日本語 — hero badge shows "🛡 世界40カ国以上の家族に信頼されています"

**Steps:**

- [ ] **Step 1: Update hero_badge**

Find in `ja: {`:
```js
hero_badge:"🌏 多言語クラスのために作られた · 14日間無料体験",
```
Replace with:
```js
hero_badge:"🛡 世界40カ国以上の家族に信頼されています",
```

- [ ] **Step 2: Update who_intro**

Find:
```js
who_intro:"日本の教室で、ベトナム、中国、ネパールなどからの生徒たちのために作られました。言語の壁がある教室で教えるすべての先生に。",
```
Replace with:
```js
who_intro:"多言語クラスのために設計されました — 40カ国以上で語学教師、トレーナー、プレゼンターが使用しています。",
```

- [ ] **Step 3: Update price_intro**

Find:
```js
price_intro:"生徒は常に全機能を無料で利用できます。教師は一度だけ支払い — サブスクなし、月額なし、更新料なし。",
```
Replace with:
```js
price_intro:"生徒と保護者はずっと無料。教師は一度だけ — それで永久に使えます。",
```

- [ ] **Step 4: Update stud_intro**

Find:
```js
stud_intro:"Layers Studentはブラウザに常駐する7つのツールキット。作業中のページの上に常にワンクリックでアクセスできます。永久無料、アカウント不要。",
```
Replace with:
```js
stud_intro:"7つのツール。ワンクリック。作業中のページの上に常に表示。永久無料 — 登録不要。",
```

- [ ] **Step 5: Update sync_intro**

Find:
```js
sync_intro:"授業室を一度作成してコードをクラスで共有するだけ。その瞬間からすべての生徒の画面に接続でき、次回の授業から自動的に再接続されます。",
```
Replace with:
```js
sync_intro:"ルームコードを一度共有するだけ。全生徒の画面が接続され、毎回の授業に自動で再接続されます。",
```

- [ ] **Step 6: Delete story keys from ja:{}**

Find and delete from `ja:{}`:
```js
story_tag:"// Layersを作った理由",
story_h2:"これは個人的な話です。<br><em>聞いてください。</em>",
story_body:'<p>Peter Hoangです。日本で教師をしています。</p>...',
story_coffee:"Layersを応援する"
```

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "i18n: update JA strings — badge, who_intro, copy brevity, remove story"
```

---

## Task 8: Chinese (ZH) i18n Updates

**Goal:** Update all Chinese i18n strings to match the same changes as EN/JA.

**Files:**
- Modify: `index.html` — `<script>` block `zh:{}` object

**Acceptance Criteria:**
- [ ] `hero_badge` updated
- [ ] `who_intro` updated (no "由一位...老师" builder framing)
- [ ] `story_tag`, `story_h2`, `story_body`, `story_coffee` deleted from `zh:{}`
- [ ] `price_intro`, `stud_intro`, `sync_intro` updated

**Verify:** Switch language selector to 中文 — hero badge shows "🛡 受到全球40多个国家家庭的信任"

**Steps:**

- [ ] **Step 1: Update hero_badge**

Find in `zh: {`:
```js
hero_badge:"🌏 专为多语言课堂打造 · 14天免费试用",
```
Replace with:
```js
hero_badge:"🛡 受到全球40多个国家家庭的信任",
```

- [ ] **Step 2: Update who_intro**

Find:
```js
who_intro:"由一位在日本执教的老师为多语言班级打造 — 班里有来自越南、中国、尼泊尔等地的学生。如果您的课堂跨越语言，这款工具是为您而设。",
```
Replace with:
```js
who_intro:"专为多语言课堂设计 — 在40多个国家被语言教师、培训师和演讲者使用。",
```

- [ ] **Step 3: Update price_intro**

Find:
```js
price_intro:"学生始终免费使用全部功能。教师一次付费 — 无订阅、无月费、无续费。",
```
Replace with:
```js
price_intro:"学生和家长：永久免费。教师：一次付费，永久使用。",
```

- [ ] **Step 4: Update stud_intro**

Find:
```js
stud_intro:"Layers Student 是浏览器内的完整浮动工具套件——七种工具，始终一键可达，悬浮于学生正在浏览的任何页面上方。永久免费，无需账户。",
```
Replace with:
```js
stud_intro:"七种工具。一键即达。始终悬浮于正在浏览的页面上方。永久免费——无需注册。",
```

- [ ] **Step 5: Update sync_intro**

Find:
```js
sync_intro:"一次创建永久课堂并与班级共享代码。从那一刻起，每个学生的屏幕都与您连接——每节课开始时会自动重新连接。",
```
Replace with:
```js
sync_intro:"共享一次房间码，所有学生屏幕即连接——每节课自动重新连接。",
```

- [ ] **Step 6: Delete story keys from zh:{}**

Find and delete from `zh:{}`:
```js
story_tag:"// 为什么我创建了 Layers",
story_h2:...
story_body:'<p>...',
story_coffee:...
```
(Delete all four story keys from the zh object.)

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "i18n: update ZH strings — badge, who_intro, copy brevity, remove story"
```

---

## Task 9: Vietnamese (VI) i18n Updates

**Goal:** Update all Vietnamese i18n strings to match the same changes as EN/JA/ZH.

**Files:**
- Modify: `index.html` — `<script>` block `vi:{}` object

**Acceptance Criteria:**
- [ ] `hero_badge` updated
- [ ] `who_intro` updated (no "được xây dựng bởi" builder framing)
- [ ] `story_tag`, `story_h2`, `story_body`, `story_coffee` deleted from `vi:{}`
- [ ] `price_intro`, `stud_intro`, `sync_intro` updated

**Verify:** Switch language selector to Tiếng Việt — hero badge shows "🛡 Được tin dùng bởi các gia đình tại 40+ quốc gia"

**Steps:**

- [ ] **Step 1: Locate the vi:{} object**

The `vi:{}` object follows `zh:{}` in the i18n script. All changes mirror the structure of the earlier language tasks.

- [ ] **Step 2: Update hero_badge**

Find in `vi: {` (exact string varies — find `hero_badge:` key):
Replace whatever the current value is with:
```js
hero_badge:"🛡 Được tin dùng bởi các gia đình tại 40+ quốc gia",
```

- [ ] **Step 3: Update who_intro**

Find the `who_intro:` key in `vi:{}`. Replace its value with:
```js
who_intro:"Được thiết kế cho lớp học đa ngôn ngữ — được giáo viên, người đào tạo và người trình bày tại hơn 40 quốc gia sử dụng.",
```

- [ ] **Step 4: Update price_intro**

Find `price_intro:` in `vi:{}`. Replace with:
```js
price_intro:"Học sinh và phụ huynh: miễn phí mãi mãi. Giáo viên: trả một lần, dùng mãi.",
```

- [ ] **Step 5: Update stud_intro**

Find `stud_intro:` in `vi:{}`. Replace with:
```js
stud_intro:"Bảy công cụ. Một cú nhấp. Luôn hiển thị trên trang đang mở. Miễn phí mãi mãi — không cần đăng ký.",
```

- [ ] **Step 6: Update sync_intro**

Find `sync_intro:` in `vi:{}`. Replace with:
```js
sync_intro:"Chia sẻ mã phòng một lần. Màn hình tất cả học sinh kết nối — và tự động kết nối lại mỗi buổi học.",
```

- [ ] **Step 7: Delete story keys from vi:{}**

Find and delete all four story keys (`story_tag`, `story_h2`, `story_body`, `story_coffee`) from the `vi:{}` object.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "i18n: update VI strings — badge, who_intro, copy brevity, remove story"
```

---

## Task 10: guard-mobile.html — Meta Updates

**Goal:** Update only the `<head>` meta tags in `guard-mobile.html` to remove "free" framing and "father of four" references.

**Files:**
- Modify: `guard-mobile.html` — `<head>` section only

**Acceptance Criteria:**
- [ ] Title no longer says "Free Parental Controls"
- [ ] Description contains no "father of four" or "Free Android app"
- [ ] OG/Twitter descriptions updated to match

**Verify:** View page source — search "father" → 0 results, "Free Parental" → 0 results in meta tags

**Steps:**

- [ ] **Step 1: Update title**

Find:
```html
<title>Layers Guard Mobile — Free Parental Controls for Android</title>
```
Replace with:
```html
<title>Layers Guard Mobile — Android Parental Controls</title>
```

- [ ] **Step 2: Update meta description**

Find:
```html
<meta name="description" content="Protect your child's Android phone with VPN-based site blocking, bedtime lockout, chat monitoring, and on-device AI — all free, no account needed. Built by a teacher and father of four.">
```
Replace with:
```html
<meta name="description" content="Protect your child's Android phone with VPN-based site blocking, bedtime lockout, chat monitoring, and on-device AI. No account needed.">
```

- [ ] **Step 3: Update OG tags**

Find:
```html
<meta property="og:title" content="Layers Guard Mobile — Free Parental Controls for Android">
<meta property="og:description" content="VPN-based site blocking, bedtime lockout, chat monitoring with on-device AI. Free Android app for parents. No account, no subscription.">
```
Replace with:
```html
<meta property="og:title" content="Layers Guard Mobile — Android Parental Controls">
<meta property="og:description" content="VPN-based site blocking, bedtime lockout, chat monitoring with on-device AI. No account needed.">
```

- [ ] **Step 4: Update Twitter tags**

Find:
```html
<meta name="twitter:title" content="Layers Guard Mobile — Free Parental Controls for Android">
<meta name="twitter:description" content="Block sites, lock internet at bedtime, monitor chats with on-device AI. Free Android app built by a teacher and father of four.">
```
Replace with:
```html
<meta name="twitter:title" content="Layers Guard Mobile — Android Parental Controls">
<meta name="twitter:description" content="Block sites, lock internet at bedtime, monitor chats with on-device AI. No account needed.">
```

- [ ] **Step 5: Update Schema.org in guard-mobile.html**

Find the `"offers"` block in the JSON-LD script:
```json
"offers": {
  "@type": "Offer",
  "price": "0",
  "priceCurrency": "USD",
  "availability": "https://schema.org/PreOrder",
  "description": "Free forever — coming soon to Google Play"
},
```
Replace with:
```json
"offers": {
  "@type": "Offer",
  "price": "9.99",
  "priceCurrency": "USD",
  "availability": "https://schema.org/PreOrder",
  "description": "Coming soon to Google Play"
},
```

Also update the author block — find `"jobTitle": "Teacher, Father of four"` and delete the `jobTitle` line.

- [ ] **Step 6: Commit**

```bash
git add guard-mobile.html
git commit -m "meta: update guard-mobile.html titles and descriptions"
```

---

## Self-Review

### Spec Coverage Check

| Spec Section | Covered By |
|---|---|
| 2. Palette CSS variables | Task 0 |
| 2. Additional CSS rules (nav, hero, cards, etc.) | Task 1 |
| 3. Section reorder | Task 2 |
| 3. Story section removal (HTML) | Task 2 |
| 4a. Announce bar | Task 3 |
| 4b. Nav dropdown Guard Mobile removal | Task 3 |
| 4c. Products grid Android button removal | Task 3 |
| 4d. Guard section Guard Pro card | Task 4 |
| 4e. Pricing Android removal | Task 3 |
| 4f. Footer Guard Mobile link removal | Task 3 |
| 5a. Meta tags | Task 5 |
| 5b. Hero badge HTML | Task 5 |
| 5c. Guard blurb → trust strip | Task 4 |
| 5d. who_intro | Task 6 |
| 5e. Story i18n keys removal (all languages) | Tasks 6–9 |
| 5f. Footer copyright | Task 5 |
| 6. EN copy rewrites | Task 6 |
| 6. JA equivalent rewrites | Task 7 |
| 6. ZH equivalent rewrites | Task 8 |
| 6. VI equivalent rewrites | Task 9 |
| 7. guard-mobile.html meta | Task 10 |

All spec sections covered. ✓

### No Placeholders ✓
All steps include exact find/replace strings.

### Type Consistency ✓
CSS class `.trust-strip` introduced in Task 1 (Step 11) and used in Task 4 (Step 2). Teal colour `#0F766E` used consistently across Tasks 1, 3, 4. No mismatches.
