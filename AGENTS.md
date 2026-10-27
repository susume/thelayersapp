# Layers website and dashboard context

Read `README.md` and `docs/product-audit-2026-10-03.md` before changing product
claims. The current app/system handoff is
`https://github.com/susume/layers/blob/main/docs/HANDOFF.md`.

- Active native app platforms are Windows and Android. Native Mac apps are
  discontinued; the owner has no Mac testing devices and may delete the old
  source folders. Do not restore Mac offers, downloads, release tasks or
  testing requirements based on historical files.
- Mac browsers can still use the parent dashboard and supported extensions.
- Layers Talk is legacy, not an active offer. Closed-beta access, unpublished
  pricing and the existing contact flow remain as described in `README.md`.
- Keep website/dashboard work here and native app/extension work in
  `susume/layers`. Do not duplicate the website into the app repository.
- Preserve existing Firebase contracts and keep product demos isolated from
  live accounts/device commands. Source versions and CI artifacts do not
  prove what users have installed or what has been publicly released.
