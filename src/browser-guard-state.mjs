// A local, transient extension preview. Never touches browser permissions or storage.
export const scanSites = ['Instagram','Facebook','X / Twitter','Reddit','TikTok','YouTube','Discord'];
export function initialGuard() {
  return {rules:[{domain:'youtube.com',enabled:true,schedule:null},{domain:'tiktok.com',enabled:true,schedule:null},{domain:'roblox.com',enabled:true,schedule:{start:'16:00',end:'18:00'}}], bedtime:{enabled:false,start:'22:00',end:'07:00'}, time:'20:30',scanner:true,sensitivity:'standard',monitored:[...scanSites],incognito:false,alerts:[],domain:'learn.example.org'};
}
export function normalizeDomain(input) {
  try {
    const value=input.trim();
    const url=new URL(/^[a-z][a-z\d+.-]*:/i.test(value)?value:'https://'+value);
    if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return '';
    const domain=url.hostname.toLowerCase().replace(/^www\./,'').replace(/\.$/,'');
    return domain.length<=253&&/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)?domain:'';
  } catch {return '';}
}
export const validTime = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
export function timeInRange(time,start,end) {
  if(![time,start,end].every(validTime))return false;
  const minutes=s=>Number(s.slice(0,2))*60+Number(s.slice(3));
  const t=minutes(time),a=minutes(start),b=minutes(end);
  return a===b ? false : a<b ? t>=a&&t<b : t>=a||t<b;
}
export const activeRule = (rule,time) => rule.enabled && (!rule.schedule || timeInRange(time,rule.schedule.start,rule.schedule.end));
export function blockedReason(state,domain=state.domain) {
  if(state.bedtime.enabled&&timeInRange(state.time,state.bedtime.start,state.bedtime.end))return {type:'bedtime',end:state.bedtime.end};
  const rule=state.rules.find(r=>activeRule(r,state.time)&&(domain===r.domain||domain.endsWith('.'+r.domain)));
  return rule?{type:'website',rule}:null;
}
export function contentHidden(state,id) {
  return state.domain==='reddit.com'&&!blockedReason(state)&&state.scanner&&state.monitored.includes('Reddit')&&(id==='threat'||state.sensitivity==='strict');
}
export function health(state) {
  if(state.scanner&&!state.monitored.length)return {title:'Protection limited',reason:'Choose websites for Content Protection.',kind:'warning'};
  if(!state.rules.some(r=>r.enabled))return {title:'Needs attention',reason:'No website blocking rules are enabled.',kind:'warning'};
  if(!state.incognito)return {title:'Protection limited',reason:'Incognito is not enabled in this sample browser.',kind:'warning'};
  if(state.alerts.some(a=>!a.read))return {title:'Needs attention',reason:'Review your recent content alerts.',kind:'warning'};
  if(blockedReason(state)?.type==='bedtime')return {title:'Bedtime active',reason:`Browsing is restricted until ${state.bedtime.end}.`,kind:'bedtime'};
  return {title:'Protected',reason:'Your sample browser rules are ready.',kind:'success'};
}
export function guardReducer(state,action) {
  if(action.type==='reset')return initialGuard();
  if(action.type==='visit'){const domain=normalizeDomain(action.value);return domain?{...state,domain}:state;}
  if(action.type==='time')return validTime(action.value)?{...state,time:action.value}:state;
  if(action.type==='bedtime') {
    const bedtime={...state.bedtime,...action.value};
    return [bedtime.start,bedtime.end].every(validTime)?{...state,bedtime}:state;
  }
  if(action.type==='rule') {
    const domain=normalizeDomain(action.value.domain);
    if(!domain)return state;
    const schedule=action.value.schedule||null;
    if(schedule&&![schedule.start,schedule.end].every(validTime))return state;
    const rule={domain,enabled:action.value.enabled!==false,schedule};
    const exists=state.rules.some(r=>r.domain===domain);
    return {...state,rules:exists?state.rules.map(r=>r.domain===domain?rule:r):[...state.rules,rule]};
  }
  if(action.type==='toggle-rule')return {...state,rules:state.rules.map(r=>r.domain===action.domain?{...r,enabled:!r.enabled}:r)};
  if(action.type==='remove-rule')return {...state,rules:state.rules.filter(r=>r.domain!==action.domain)};
  if(action.type==='scanner')return {...state,scanner:!state.scanner};
  if(action.type==='sensitivity'&&['standard','strict'].includes(action.value))return {...state,sensitivity:action.value};
  if(action.type==='monitor'&&scanSites.includes(action.value))return {...state,monitored:state.monitored.includes(action.value)?state.monitored.filter(s=>s!==action.value):[...state.monitored,action.value]};
  if(action.type==='incognito')return {...state,incognito:!state.incognito};
  if(action.type==='scan') {
    const incoming=[{id:'threat',category:'Threat',severity:'High'},{id:'bullying',category:'Bullying',severity:'Medium'}].filter(a=>contentHidden(state,a.id)&&!state.alerts.some(old=>old.id===a.id));
    return incoming.length?{...state,alerts:[...incoming.map(a=>({...a,domain:'reddit.com',time:state.time,read:false})),...state.alerts]}:state;
  }
  if(action.type==='read-alerts')return state.alerts.some(a=>!a.read)?{...state,alerts:state.alerts.map(a=>({...a,read:true}))}:state;
  if(action.type==='clear-alerts')return {...state,alerts:[]};
  return state;
}
