# Layers website: current product audit

Prepared on 3 October 2026 from the sibling `layers` app repository and this
website's `dashboard.html`. This is an implementation inventory, not proof of
which release a customer has installed or of payment-account settings.

## Publishing decisions supplied by the owner

- Windows and Android are the active app platforms.
- Mac applications are discontinued. A Mac browser can still be a parent client.
- Do not publish prices. Direct visitors to the team for current access.

## Source-backed product inventory

| Product | Source inspected | Website description |
|---|---|---|
| Teacher for Windows | `layers/layers-windows/layers.py`: `APP_VERSION`, `_build_toolbar`, `_open_more_action`, panel classes, `check_license`, `_check_trial` | Current source v3.18; captions/push-to-talk translation, countdown/stopwatch, class lists/random picker, screen annotation, dictionary, noise meter, classroom rooms, links, focus/lockdown and schedules. A source version is not a public binary version. |
| Student extension | `layers/chrome_extension V2/layers-student-update/manifest.json`, `content.js`, `background.js` | Source v2.0; study toolbar, dictionary, translation, read aloud, scratchpad, PDF viewer, classroom room/help connection. Participating-browser scope. |
| Independent Guard extension | `layers/chrome_extension_home/manifest.json`, `options.js`, `content-scanner.js`, `shared/storage.js`, `secure.html` | Source v2.0.0; local PIN-gated controls, website lists, browsing schedules, page-text pattern scanner, local settings/alerts. Does not use the family device-pairing contract. |
| Guard Desktop | `layers/LGC for WINDOWS/LayersGuardDesktop/layers-guard-desktop/guard_desktop.py`, `windows_ui.py`, `SETUP.md` | Windows child app, source v1.2; pairing, foreground time, site/app rules, per-app/daily limits, schedules, internet/device pause, child requests, diagnostics, PIN-gated parent options and startup. Administrator-only capabilities can be unavailable in a standard session. |
| Guard Mobile | `layers/layers-guard-mobile/App.js`, `src/screens/PairingScreen.js`, `SetupScreen.js`, `src/services/GuardSyncService.js`, `StatusReporter.js`, `FirebaseService.js`, native Android modules | Android child app; pairing, usage reporting, rules, schedules, device/time locks, requests and alerts. VPN/accessibility/usage/overlay and other permissions govern individual capabilities. Device/battery/background settings matter. |
| Guard Controller | `layers/LayersGuardController/App.js`, `src/screens/`, `src/services/FirebaseService.js`, `AuthService.js` | Android parent client; Today, Trends, Controls, pairing/device selection, limits, schedules, restrictions, requests, alerts and audit history. Parent email/password account and PIN. |
| Web dashboard | `thelayersapp/dashboard.html`: auth/pairing, device health, command acknowledgement, request handling, local-date time logs and string tables | Browser parent client of the same Guard devices. Sign-in, existing licence/setup flow, device selection, Today/Trends/Controls and the existing Firebase operations are retained. |
| Mac apps | `layers/layers-ios/layers-mac/layers-mac/`, `layers/layers-guard-mac/` | No longer promoted or offered; historical source and release notes are not deleted. |
| Layers Talk | `layers/layers-windows/layers_talk.py`, `layers/docs/architecture.md` | Legacy app, no longer an active offer. Its old route explains the change rather than selling a meeting translator. |

## Corrections made

1. Replaced the mixed product pages with a shared shell, semantic design tokens,
   typography, navigation, buttons, cards, footer and responsive layouts.
2. Added a dedicated Teacher page. Separated classroom rooms, independent browser
   controls and Guard device pairing rather than treating them as one system.
3. Removed current prices, Gumroad checkout links, public build downloads and
   generic Play Store purchase placeholders. Access is by contacting the team.
4. Removed active Mac support/download claims, location-tracking claims and
   guarantees that a child cannot bypass protection.
5. Rebuilt contact as a real validated draft form. It generates an encoded mailto
   link and a copyable draft; it neither transmits mail nor claims delivery.
6. Updated the privacy description to cover Firebase classroom/device data,
   parent accounts, activity/alert records, local preferences, online translation,
   speech and dictionary services, licence validation and draft handling.
7. Replaced outdated Japanese, Chinese and Vietnamese product pages with current
   translated summaries. Detailed device pages explicitly link to English guides.
8. Kept journal narratives and original dates. Added current-product notices,
   removed sale CTAs, applied the shared shell and labelled the old Mac release
   article as an archive with `noindex,follow`.
9. Updated the website assistant's product prompt, `llms.txt`, canonical URLs,
   localized alternate links, sitemap and robots sitemap URL.
10. Applied shared tokens to the dashboard through a separate stylesheet, without
    importing marketing layout rules into the authenticated application.

## Items that need external evidence

- The old site used extension ID `alielgklefmocpmnmfahepacngmeomof` for both Student
  and Guard. A successful current marketplace verification was not available.
  No current product page sends users to that listing. Confirm distinct listings
  before advertising installation or enabling force-install instructions again.
- Older policy BAT downloads still contain the historical extension ID; they are
  retained as files, but the new guide does not advertise them for installation.
- Public release binaries, Android signing/release status, current customer
  entitlements, Gumroad product settings and actual support-email delivery were
  not verified. No new public release or price is asserted.
- `version.json` is consumed by the Windows update check. Its release values are
  deliberately retained until a matching current binary is confirmed; changing
  them to source versions could falsely tell installed clients an update exists.
- The separate assistant Worker is not deployed by static GitHub Pages. The
  updated prompt needs its own normal Worker deployment if that service is used.
  Its older duplicate under `layers/HTML/AI Chatbot/worker.js` is not the canonical
  website copy and was not modified by this website change.
- Authenticated dashboard rendering against a real account and child device
  requires those credentials/devices. No account was created or device modified.

## Validation

- 41 public pages checked for local links and fragment targets, one page title and
  h1, shared theme, correct language metadata and retired offers.
- All inline JavaScript plus the shared script/Worker parsed successfully.
- 23 tests pass: existing dashboard regressions and draft encoding/validation,
  known contact topics, mobile navigation and Escape focus behavior.
- Browser checks cover desktop and narrow mobile home/product/contact/privacy,
  the three translated home pages, a journal article, and dashboard sign-in.
- Dashboard Firebase command, pairing, account and enforcement code was not
  replaced. Existing tests cover protection health, timestamps, idempotent
  pairing, autosave, request handling and command acknowledgement.

## Scope

The public Layers product, access, help, setup, privacy and journal pages are
updated. Unlisted independent utilities (`arcana.html`, `marquee.html`), old design
mockups, tweak tooling and existing policy scripts remain separate functional
assets and are not promoted as current Layers products. App executables and
Android applications are unchanged.
# Interactive website previews

The homepage and Guard Family walkthrough retain explorable app mockups. The
original phone/laptop composition and tabbed demo were recovered from Git before
rebuilding them as maintained React components in `src/product-demo.jsx`.
The old landing-page bundle used vanilla JavaScript; the restored walkthrough
uses React with an isolated shared state model rather than production services.

The web preview follows the current dashboard's sidebar, device selector,
Today/Trends/Controls screens, screen-time gauge, actions and request Inbox.
Android Controller previews follow `LayersGuardController/theme.js` (dark
background and purple accents). Windows child previews follow
`windows_ui.py` (a desktop window, lavender cards and screen-time/request views),
and Android child previews follow `layers-guard-mobile/src/theme.js`.

Visitors can switch sample devices, navigate app screens, pause internet, lock
and unlock, add time, edit allowance/bedtime, block apps/sites, and approve or
decline a sample time request. The hero and expanded walkthrough share state.
These previews do not authenticate, persist customer settings, call Firebase,
or operate real child devices. The rendered UI is a product walkthrough with
sample data, not the actual native binaries.
# Interactive Teacher preview

The Teacher page now loads a separate local React bundle. Its graphite dock,
language pair, Caption/Timer/Picker/Draw/Classroom/More controls and floating
tool windows follow `layers-windows/layers.py`: `PALETTE`, `_build_toolbar`,
`TimerLayer`, `PickerLayer`, `ScreenPointerLayer`, `ClassroomLayer`,
`DictionaryLayer` and `NoiseMeterLayer`. Desktop visitors can move tool windows
and draw on sample lesson slides. Phone layouts put the selected window below
the toolbar, before the lesson, so a tool change appears next to its controls.

The preview includes real local countdown/stopwatch timing, editable sample
class lists, random selection, slide navigation, freehand/highlighter strokes,
undo and clear. Captions/translations, dictionary results, relative noise levels,
room codes, help requests and student browser responses use transient sample
data. Classroom actions require a sample connection; ending the class resets
focus, lockdown and links. No microphone, Firebase, payment, account or remote
classroom API is used. The closed beta CTA and existing Guard demos are retained.
