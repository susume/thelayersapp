// Transient preview data only; no accounts, microphones or classroom services.
export function timerValue(timer, now) {
  const elapsed = timer.running ? Math.max(0, Math.floor((now - timer.startedAt) / 1000)) : 0;
  return timer.mode === 'countdown' ? Math.max(0, timer.value - elapsed) : timer.value + elapsed;
}
export function pauseTimer(timer, now) {
  return {...timer, value: timerValue(timer, now), running: false};
}
export function parseDuration(text) {
  if (!/^\d{1,3}:[0-5]\d$/.test(text.trim())) return null;
  const [m, s] = text.trim().split(':').map(Number);
  return m * 60 + s;
}
export function pickNumber(from, to, random = Math.random()) {
  const min = Number(from), max = Number(to);
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max > 100 || min > max) return null;
  return min + Math.floor(Math.min(.999999999, Math.max(0, random)) * (max - min + 1));
}
export const initialRoom = {connected: false, focus: false, offline: false, help: true, link: ''};
export function roomReducer(room, action) {
  if (action.type === 'start') return {...initialRoom, connected: true};
  if (action.type === 'end') return {...initialRoom};
  if (!room.connected) return room;
  if (action.type === 'focus') return {...room, focus: !room.focus};
  if (action.type === 'offline') return {...room, offline: !room.offline};
  if (action.type === 'help') return {...room, help: !room.help};
  if (action.type === 'link') {
    try {
      const url = new URL(action.value);
      if (!['https:', 'http:'].includes(url.protocol) || room.offline) return room;
      return {...room, link: url.href};
    } catch { return room; }
  }
  return room;
}
