// Sample data only. No accounts, persistent storage or device commands.
export const devices = {
  windows: {name: "Emma’s PC", platform: 'Windows', app: 'Guard Desktop', used: 134, apps: [['Roblox', 64], ['Chrome', 46], ['Minecraft', 24]]},
  android: {name: "Emma’s phone", platform: 'Android', app: 'Guard Mobile', used: 78, apps: [['YouTube', 38], ['Chrome', 25], ['WhatsApp', 15]]}
};
const rules = () => ({limit: 180, paused: false, locked: false, bedtime: '21:00', bedtimeOn: true, blockedApps: ['TikTok'], blockedSites: ['example.com']});
export function initialState() {
  return {device: 'windows', tab: 'today', period: 'week', view: 'browser', rules: {windows: rules(), android: rules()}, requests: [{id: 1, device: 'windows', kind: 'time', value: 15}], nextId: 2, alerts: true, message: ''};
}
export function reduceDemo(state, action) {
  if (action.type === 'reset') return initialState();
  const id = action.device || state.device, rule = state.rules[id];
  const change = (patch, message) => ({...state, rules: {...state.rules, [id]: {...rule, ...patch}}, message});
  switch (action.type) {
    case 'device': return devices[action.value] ? {...state, device: action.value, message: ''} : state;
    case 'tab': return {...state, tab: action.value, message: ''};
    case 'period': return {...state, period: action.value};
    case 'view': return {...state, view: action.value};
    case 'pause': return change({paused: !rule.paused}, !rule.paused ? 'Internet paused on this sample device.' : 'Internet resumed on this sample device.');
    case 'lock': return change({locked: !rule.locked}, !rule.locked ? 'Sample device locked. See the child’s screen.' : 'Sample device unlocked.');
    case 'extend': return change({limit: rule.limit + action.minutes}, `${action.minutes} minutes added to the sample allowance.`);
    case 'limit': {const limit = Math.max(30, Math.min(480, Number(action.value) || 180)); return change({limit}, 'Daily allowance updated in the demo.');}
    case 'bedtime': return /^\d{2}:\d{2}$/.test(action.value) ? change({bedtime: action.value}, 'Bedtime updated in the demo.') : state;
    case 'bedtimeOn': return change({bedtimeOn: !rule.bedtimeOn}, rule.bedtimeOn ? 'Sample bedtime disabled.' : 'Sample bedtime enabled.');
    case 'app': return change({blockedApps: rule.blockedApps.includes(action.value) ? rule.blockedApps.filter(x => x !== action.value) : [...rule.blockedApps, action.value]}, 'Sample app rule updated.');
    case 'site': {const value = String(action.value).trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]; if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) return {...state, message: 'Enter a domain such as example.org.'}; return change({blockedSites: [...new Set([...rule.blockedSites, value])]}, 'Website blocked in the demo.');}
    case 'removeSite': return change({blockedSites: rule.blockedSites.filter(x => x !== action.value)}, 'Website rule removed in the demo.');
    case 'request': return state.requests.some(x => x.device === id) ? {...state, tab: 'inbox', message: 'This device already has a sample request waiting.'} : {...state, requests: [...state.requests, {id: state.nextId, device: id, kind: 'time', value: 15}], nextId: state.nextId + 1, tab: 'inbox', message: 'A sample request arrived in the parent Inbox.'};
    case 'resolve': {const request = state.requests.find(x => x.id === action.id); if (!request) return state; return {...state, rules: action.approve ? {...state.rules, [request.device]: {...state.rules[request.device], limit: state.rules[request.device].limit + request.value}} : state.rules, requests: state.requests.filter(x => x.id !== action.id), message: action.approve ? 'Request approved. The sample child has 15 extra minutes.' : 'Sample request declined.'};}
    case 'alert': return {...state, alerts: false, message: 'Sample alert marked as reviewed.'};
    default: return state;
  }
}
export const formatTime = minutes => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
