import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, reduceDemo as act} from '../src/demo-state.mjs';

test('device controls stay with their selected Windows or Android device', () => {
  let s=act(initialState(),{type:'pause'});
  s=act(s,{type:'lock'});
  s=act(s,{type:'device',value:'android'});
  assert.equal(s.rules.android.paused,false);
  assert.equal(s.rules.android.locked,false);
  assert.equal(s.rules.windows.paused,true);
  assert.equal(s.rules.windows.locked,true);
  s=act(s,{type:'extend',minutes:15});
  assert.equal(s.rules.android.limit,195);
  assert.equal(s.rules.windows.limit,180);
});
test('approval extends the requesting device even when another device is selected',()=>{
  let s=act(initialState(),{type:'device',value:'android'});
  s=act(s,{type:'resolve',id:1,approve:true});
  assert.equal(s.rules.windows.limit,195);
  assert.equal(s.rules.android.limit,180);
  assert.equal(s.requests.length,0);
  assert.deepEqual(act(s,{type:'resolve',id:1,approve:true}),s);
});
test('a child can request time again after a decision and refusal adds no allowance',()=>{
  let s=act(initialState(),{type:'resolve',id:1,approve:false});
  assert.equal(s.rules.windows.limit,180);
  s=act(s,{type:'request'});
  assert.equal(s.tab,'inbox');
  assert.equal(s.requests.length,1);
  assert.equal(act(s,{type:'request'}).requests.length,1);
});
test('rule changes clamp daily time, preserve device-specific bedtime, and toggle app blocks',()=>{
  let s=act(initialState(),{type:'limit',value:900});
  assert.equal(s.rules.windows.limit,480);
  s=act(s,{type:'bedtime',value:'20:30'});
  assert.equal(s.rules.windows.bedtime,'20:30');
  assert.equal(s.rules.android.bedtime,'21:00');
  s=act(s,{type:'app',value:'Roblox'});
  assert.ok(s.rules.windows.blockedApps.includes('Roblox'));
  assert.ok(!act(s,{type:'app',value:'Roblox'}).rules.windows.blockedApps.includes('Roblox'));
});
test('website rules normalize domains, reject invalid inputs, and remove safely',()=>{
  let s=act(initialState(),{type:'site',value:'https://EXAMPLE.ORG/page'});
  assert.ok(s.rules.windows.blockedSites.includes('example.org'));
  const invalid=act(s,{type:'site',value:'<script>alert(1)</script>'});
  assert.deepEqual(invalid.rules,s.rules);
  s=act(s,{type:'removeSite',value:'example.org'});
  assert.ok(!s.rules.windows.blockedSites.includes('example.org'));
});
test('reset restores every device, request and navigation screen',()=>{
  let s=act(initialState(),{type:'lock'});
  s=act(s,{type:'alert'});
  s=act(s,{type:'view',value:'controller'});
  assert.deepEqual(act(s,{type:'reset'}),initialState());
});
