import test from 'node:test';
import assert from 'node:assert/strict';
import {initialGuard,guardReducer,normalizeDomain,timeInRange,blockedReason,contentHidden,health} from '../src/browser-guard-state.mjs';

test('browser rule domains remove URL details and reject invalid or unsafe inputs',()=>{
  assert.equal(normalizeDomain('https://www.YouTube.com/watch?v=test#sample'),'youtube.com');
  for(const value of ['javascript:alert(1)','https://user:pass@example.org','bad..example','localhost','https://-bad.example','']) assert.equal(normalizeDomain(value),'');
});
test('browser schedules cross midnight with inclusive start, exclusive end and no equal-time lockout',()=>{
  assert.equal(timeInRange('22:00','22:00','07:00'),true);
  assert.equal(timeInRange('02:30','22:00','07:00'),true);
  assert.equal(timeInRange('07:00','22:00','07:00'),false);
  assert.equal(timeInRange('20:00','22:00','07:00'),false);
  assert.equal(timeInRange('12:00','12:00','12:00'),false);
  assert.equal(timeInRange('29:00','22:00','07:00'),false);
});
test('website rules cover subdomains, avoid lookalikes and respect pause and per-site hours',()=>{
  let state=initialGuard();
  assert.equal(blockedReason(state,'m.youtube.com').type,'website');
  assert.equal(blockedReason(state,'notyoutube.com'),null);
  assert.equal(blockedReason(state,'roblox.com'),null);
  state=guardReducer(state,{type:'time',value:'17:00'});
  assert.equal(blockedReason(state,'roblox.com').type,'website');
  state=guardReducer(state,{type:'toggle-rule',domain:'youtube.com'});
  assert.equal(blockedReason(state,'youtube.com'),null);
});
test('bedtime overrides site rules and restricts otherwise available sample sites',()=>{
  let state=guardReducer(initialGuard(),{type:'bedtime',value:{enabled:true}});
  state=guardReducer(state,{type:'time',value:'23:00'});
  assert.equal(blockedReason(state,'learn.example.org').type,'bedtime');
  assert.equal(blockedReason(state,'youtube.com').type,'bedtime');
  assert.equal(blockedReason(guardReducer(state,{type:'time',value:'07:00'}),'learn.example.org'),null);
});
test('rule updates deduplicate normalized hosts and reject invalid schedules',()=>{
  const state=initialGuard();
  const next=guardReducer(state,{type:'rule',value:{domain:'https://www.youtube.com/watch',enabled:false,schedule:null}});
  assert.equal(next.rules.length,state.rules.length);
  assert.equal(next.rules.find(r=>r.domain==='youtube.com').enabled,false);
  assert.equal(guardReducer(state,{type:'rule',value:{domain:'example.org',schedule:{start:'29:00',end:'07:00'}}}),state);
});
test('preclassified alerts follow scanner scope and sensitivity, deduplicate and retain metadata only',()=>{
  let state=guardReducer(initialGuard(),{type:'visit',value:'reddit.com'});
  assert.equal(contentHidden(state,'threat'),true);
  assert.equal(contentHidden(state,'bullying'),false);
  state=guardReducer(state,{type:'scan'});
  assert.equal(state.alerts.length,1);
  assert.equal(guardReducer(state,{type:'scan'}),state);
  state=guardReducer(guardReducer(state,{type:'sensitivity',value:'strict'}),{type:'scan'});
  assert.equal(state.alerts.length,2);
  assert.ok(state.alerts.every(a=>!('text' in a)));
  assert.ok(guardReducer(state,{type:'read-alerts'}).alerts.every(a=>a.read));
  assert.equal(contentHidden(guardReducer(state,{type:'monitor',value:'Reddit'}),'threat'),false);
  assert.equal(contentHidden(guardReducer(state,{type:'scanner'}),'threat'),false);
});
test('health exposes incomplete coverage and reset removes all sample changes',()=>{
  let state=initialGuard();
  assert.equal(health(state).title,'Protection limited');
  state=guardReducer(state,{type:'incognito'});
  assert.equal(health(state).title,'Protected');
  assert.equal(health({...state,monitored:[]}).title,'Protection limited');
  assert.equal(health({...state,rules:[]}).title,'Needs attention');
  assert.deepEqual(guardReducer({...state,time:'23:00',alerts:[{id:'sample'}]},{type:'reset'}),initialGuard());
});
