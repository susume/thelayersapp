# Layers Guard hardening security checklist

Run these checks on a disposable test profile or a parent-managed Windows test
PC. Do not test restore against a machine whose policy backup has not been
verified.

## Extension and session controls

- [ ] Unhardened Incognito is available; when Layers Guard is not allowed, the
      popup shows `Protection limited` and warns that Incognito may bypass it.
- [ ] After enabling Allow in Incognito, the popup reports `Protected in
      Incognito` and supported blocking/scanning works in an Incognito window.
- [ ] During active bedtime, a new HTTP/HTTPS navigation redirects to the
      bedtime page.
- [ ] During active bedtime, new page fetches, media, subframes, and WebSocket
      connections are blocked while extension pages remain reachable.
- [ ] Refreshing Parent Controls does not reset the PIN cooldown during the
      current browser session.
- [ ] A successful PIN login clears the temporary throttle.
- [ ] Changing scanner settings updates an already-open matching page without
      creating duplicate observers.

## Windows Secure Mode

- [ ] Before hardening, the Bypass Protection card leaves Guest Mode, other
      profiles, extension removal, and other browsers as warnings.
- [ ] Run the harden script as Administrator with a real published Web Store
      extension ID.
- [ ] The checker reports `BrowserGuestModeEnabled=0`.
- [ ] The checker reports `IncognitoModeAvailability=1`.
- [ ] The checker reports `BrowserAddPersonEnabled=0`.
- [ ] The checker reports `ExtensionDeveloperModeSettings=1`.
- [ ] Chrome Guest Mode cannot be started.
- [ ] Chrome's Incognito entry point is unavailable.
- [ ] Chrome's Add person/profile entry point is unavailable.
- [ ] Developer Mode cannot be enabled on `chrome://extensions`.
- [ ] A force-installed Web Store extension cannot be removed through normal
      extension controls.
- [ ] With no extension ID, harden/check report that force-install is not
      configured and return an incomplete/non-zero result.
- [ ] The extension reports Windows Secure Mode only when the managed marker is
      present; it never treats an assumption as a green check.

## Profiles, accounts, and rollback

- [ ] The checker reports existing `Default`/`Profile *` directories or local
      profile metadata when more than one profile exists.
- [ ] Existing profiles are never deleted automatically.
- [ ] The local Administrators group is displayed for manual review.
- [ ] The child's account is not an Administrator and remains a Standard User.
- [ ] A non-Administrator cannot change the HKLM policy values.
- [ ] The backup records absent values as absent and preserves original types.
- [ ] Restore removes only unchanged Layers Guard values that were absent before
      setup.
- [ ] Restore preserves unrelated Chrome policy values and unrelated
      `ExtensionSettings` entries.
- [ ] Running harden twice produces the same effective policy and does not
      replace unrelated policy entries.

## Coverage boundary

- [ ] Verify that Edge, Firefox, Brave, Opera, portable browsers, native apps,
      other devices, and users with Administrator access are treated as outside
      Layers Guard's Chrome-only boundary.
- [ ] Verify that no router, DNS, firewall, process-killing, telemetry, service,
      scheduled task, or Native Messaging behavior was introduced.
