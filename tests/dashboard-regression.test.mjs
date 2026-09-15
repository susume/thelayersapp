import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, '..', 'dashboard.html'), 'utf8');

// Execute the production functions with controlled clocks and Firebase adapters.
function runtime(names, globals = {}) {
  const context = vm.createContext(globals);
  for (const name of names) {
    const start = html.search(new RegExp('    (?:async )?function ' + name + '\\('));
    assert.ok(start >= 0, name);
    const end = html.indexOf('\n    }', start) + 6;
    vm.runInContext(html.slice(start, end), context);
  }
  return context;
}

test('health never treats configuration flags or stale reports as active protection', () => {
  const now = 1800000000000;
  const c = runtime(['normaliseTimestamp', 'getDeviceHealth'], { _statusLoaded: true, HEARTBEAT_TIMEOUT_MS: 120000 });
  assert.equal(c.getDeviceHealth({ online: true, last_seen: now, guard_enabled: true }, now).protectionState, 'unknown');
  assert.equal(c.getDeviceHealth({ online: true, last_seen: now, protection_state: 'protected' }, now).protectionState, 'protected');
  assert.equal(c.getDeviceHealth({ last_seen: now - 120001, protection_active: true }, now).protectionState, 'attention');
  assert.equal(c.getDeviceHealth({ online: true, last_seen: now + 60000 }, now).online, false);
  assert.equal(c.getDeviceHealth({ last_seen: now, protection_state: 'partial' }, now).startupNeedsRepair, false);
});

test('pairing code parsing is strict and expiry is unit-safe at the boundary', () => {
  const c = runtime(['normalisePairingCode', 'timestampMs', 'pairingCodeExpiryMs', 'pairingCodeExpired']);
  assert.equal(c.normalisePairingCode('LG-1234'), 'LG-1234');
  assert.equal(c.normalisePairingCode('1234'), 'LG-1234');
  assert.equal(c.normalisePairingCode('layersguard://pair?code=1234'), 'LG-1234');
  assert.equal(c.normalisePairingCode('https://example.test/LG-1234'), '');
  assert.equal(c.normalisePairingCode('layersguard://pair?code=%E0%A4%A'), '');
  assert.equal(c.normalisePairingCode('LG-12A4'), '');

  const createdAtSeconds = 1800000000;
  const createdAtMs = createdAtSeconds * 1000;
  const record = { created_at: createdAtSeconds };
  assert.equal(c.pairingCodeExpiryMs(record), createdAtMs + 600000);
  assert.equal(c.pairingCodeExpired(record, createdAtMs + 599999), false);
  assert.equal(c.pairingCodeExpired(record, createdAtMs + 600000), true);
  assert.equal(c.pairingCodeExpired({ expires_at: createdAtMs + 600000 }, createdAtMs + 600000), true);
});

test('dashboard pairing uses one idempotent transaction path for both pairing entry points', () => {
  assert.equal((html.match(/async function submitPairingCode\(/g) || []).length, 1);
  const submitStart = html.indexOf('async function submitPairingCode');
  const submitEnd = html.indexOf('// ── MODE 1:', submitStart);
  const submit = html.slice(submitStart, submitEnd);
  assert.match(submit, /runTransaction\(ref\(db, GUARD_ROOT \+ '\/pairing_codes\/' \+ code\)/);
  assert.match(submit, /claimResult = 'idempotent'/);
  assert.match(submit, /parent_auth_uid: currentUser\.uid/);
  assert.match(submit, /new Set\(\[\.\.\.list, finalDeviceId\]\)/);
  assert.match(html, /settingsPairCode.*?submitPairingCode/s);
  assert.match(html, /let pairingDisplayCode = null/);
  assert.match(html, /staleCode/);
  assert.match(html, /stopPairingWebcam\(\);\s*stopPairingPolling\(\);/);
});

test('autosave coalesces edits and retains the original device after navigation', async () => {
  const timers = new Map();
  const writes = [];
  const feedback = [];
  let timerId = 0;
  let resolveWrite;
  const c = runtime(['scheduleFeedbackId', 'scheduleAutosave'], {
    currentDeviceId: 'child-a', _deviceSession: 1, _scheduleSaveTimers: {}, _scheduleSavePatches: {},
    db: {}, GUARD_ROOT: 'guard', ref: (_, path) => path,
    update: (path, patch) => { writes.push({ path, patch }); return new Promise(resolve => { resolveWrite = resolve; }); },
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; }, clearTimeout: id => timers.delete(id),
    T: key => key, setScheduleFeedback: (...args) => feedback.push(args),
    getSettingSavedMessage: () => 'saved', renderHeroLimit: () => {}, showToast: () => {},
  });
  c.scheduleAutosave('time-limit', { daily_limit_enabled: true });
  c.scheduleAutosave('time-limit', { daily_limit_mins: 90 });
  assert.equal(timers.size, 1);
  c.currentDeviceId = 'child-b'; c._deviceSession++;
  const completion = [...timers.values()][0]();
  assert.equal(writes[0].path, 'guard/child-a/schedule');
  assert.equal(writes[0].patch.daily_limit_enabled, true);
  assert.equal(writes[0].patch.daily_limit_mins, 90);
  resolveWrite(); await completion;
  assert.equal(feedback.filter(args => args[2] === 'saved').length, 0);
});

test('command acknowledgement rejects missing, failed and stale outcomes', () => {
  const c = runtime(['normaliseTimestamp', 'getAckCandidates', 'isCommandAcknowledged']);
  const pending = { cmdName: 'extend_time', payload: { minutes: 15 }, timestamp: 1800000000000 };
  const ack = { command: 'extend_time', timestamp: pending.timestamp };
  assert.equal(c.isCommandAcknowledged(pending, { command_ack: ack }), false);
  assert.equal(c.isCommandAcknowledged(pending, { command_ack: { ...ack, status: 'failed' } }), false);
  assert.equal(c.isCommandAcknowledged(pending, { command_ack: { ...ack, status: 'applied', timestamp: pending.timestamp - 1 } }), false);
  assert.equal(c.isCommandAcknowledged(pending, { command_ack: { ...ack, status: 'applied' } }), true);
});

test('parent activity reports a request instead of device completion', () => {
  const c = runtime(['formatActivityCommand'], {
    T: key => key === 'command_requested' ? '{action} requested' : key,
    commandActionLabel: () => 'Lock', fillTemplate: (str, values) => str.replace('{action}', values.action),
  });
  assert.equal(c.formatActivityCommand({ source: 'web_dashboard', command: 'emergency_lock', status: 'sent', payload: { active: true } }), 'Lock requested');
});

test('inline action arguments preserve quotes without executing injected code', () => {
  const c = runtime(['escapeAttr', 'escapeInlineArgument']);
  const value = "child'); injected = true; //";
  const decoded = c.escapeInlineArgument(value).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  c.injected = false;
  vm.runInContext("received = '" + decoded + "'", c);
  assert.equal(c.received, value);
  assert.equal(c.injected, false);
});

test('remote command completion cannot update a different device screen', async () => {
  let finish;
  const feedback = [];
  const c = runtime(['actionKey', 'runRemoteCommand'], {
    currentDeviceId: 'a', _deviceSession: 1, _commandInFlight: new Set(), _commandRetry: null,
    _pendingCommands: {}, T: key => key, setCommandFeedback: (...args) => feedback.push(args),
    renderActionButtons: () => {}, writeCommand: () => new Promise(resolve => { finish = resolve; }),
  });
  const result = c.runRemoteCommand('emergency_lock', { active: true });
  c.currentDeviceId = 'b'; c._deviceSession++;
  finish({ ok: true, timestamp: 1800000000000 });
  await result;
  assert.equal(Object.keys(c._pendingCommands).length, 0);
  assert.equal(feedback.length, 1);
  assert.equal(c._commandInFlight.size, 0);
});

test('dashboard HTML has unique static IDs and no duplicate hero subtitle', () => {
  const ids = [...html.matchAll(/id="([A-Za-z][A-Za-z0-9_-]*)"/g)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], []);
  assert.equal(html.includes('id="heroSub"'), false);
  assert.match(html, /id="headerSubtitle"/);
  assert.match(html, /id="heroSubtitle"/);
});

test('seven-day chart defines its geometry before calculating the limit line', () => {
  const chartStart = html.indexOf('function renderWeekChart');
  const chart = html.slice(chartStart, html.indexOf('// ── Activity log rendering', chartStart));
  assert.ok(chart.indexOf('var CHART_HEIGHT =') < chart.indexOf('var limitPx ='));
  assert.match(chart, /style\.bottom = limitPx \+ 'px'/);
  assert.equal(html.includes('NaNpx'), false);
  assert.match(chart, /Math\.max\.apply\(null/);
});

test('device health and command state are explicit and time-aware', () => {
  assert.match(html, /function getDeviceHealth\(status/);
  assert.match(html, /setInterval\(refreshDeviceHealth, 15000\)/);
  assert.match(html, /function settlePendingCommands\(status\)/);
  assert.match(html, /command_ack|last_command_ack/);
  assert.match(html, /status\.emergency_locked === pending\.payload\.active/);
  assert.match(html, /status\.internet_paused === pending\.payload\.active/);
  assert.match(html, /offline_child_device|command_offline/);

  const commandStart = html.indexOf('async function writeCommand');
  const commandEnd = html.indexOf('async function runRemoteCommand', commandStart);
  const writeCommand = html.slice(commandStart, commandEnd);
  assert.match(writeCommand, /return \{ ok: true/);
  assert.match(writeCommand, /return \{ ok: false/);
  assert.equal(/update\(ref\(db, GUARD_ROOT \+ '\/' \+ did \+ '\/status'/.test(writeCommand), false);
});

test('today hierarchy, controls, and mobile secondary navigation are present', () => {
  assert.equal(html.includes('class="summary-cards"'), false);
  assert.match(html, /id="protectionStrip"/);
  assert.match(html, /id="pendingRequestsCard"/);
  assert.match(html, /class="empty-state compact"[^>]*data-i18n="approval_empty_compact"/);
  assert.match(html, /id="popularAppsSearch"/);
  assert.match(html, /id="blockedAppForm"/);
  assert.match(html, /id="appLimitForm"/);
  assert.match(html, /id="mobileMoreOverlay"/);
  assert.match(html, /data-tab="more"/);
  assert.match(html, /id="mobileMoreSettings"/);
  assert.match(html, /id="mobileMoreLogout"/);
  assert.equal(html.includes('</div></button>`'), false);
});

test('semantic controls, dialog accessibility, focus treatment, and reduced motion exist', () => {
  assert.match(html, /role="switch" aria-checked="false"/);
  assert.match(html, /role="dialog" aria-modal="true"/);
  assert.match(html, /function openDialog\(id/);
  assert.match(html, /function closeDialog\(id/);
  assert.match(html, /if \(e\.key === 'Escape'\)/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /prefers-reduced-motion: reduce/);
  assert.match(html, /const cell = document\.createElement\('button'\)/);
  assert.match(html, /const btn = document\.createElement\('button'\)/);
});

test('device selector resolves metadata before rendering and edit tooling is opt-in', () => {
  assert.match(html, /Promise\.all\(devices\.map\(async \(did\)/);
  assert.match(html, /const loadToken = \+\+_selectorLoadToken/);
  assert.match(html, /const editMode = params\.get\('edit'\) === '1'/);
  assert.match(html, /if \(!editMode\) return/);
  assert.equal(html.includes('type="text/babel"'), false);
});
