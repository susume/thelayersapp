import test from 'node:test';
import assert from 'node:assert/strict';
import {timerValue, pauseTimer, parseDuration, pickNumber, roomReducer, initialRoom} from '../src/teacher-state.mjs';

test('paused countdown preserves elapsed time across a later restart',()=>{
  const timer={mode:'countdown',value:120,running:true,startedAt:1000};
  const paused=pauseTimer(timer,41500);
  assert.equal(paused.value,80);
  assert.equal(timerValue(paused,600000),80);
  assert.equal(timerValue({...paused,running:true,startedAt:600000},610000),70);
});
test('countdown finishes at zero, while stopwatch accumulates elapsed seconds',()=>{
  assert.equal(timerValue({mode:'countdown',value:30,running:true,startedAt:1000},90000),0);
  assert.equal(timerValue({mode:'stopwatch',value:14,running:true,startedAt:1000},11000),24);
});
test('timer accepts minute:second values and rejects ambiguous or malformed entries',()=>{
  assert.equal(parseDuration(' 2:30 '),150);
  for(const bad of ['2','2:60','-1:00','1.5:00','a:30','1:2']) assert.equal(parseDuration(bad),null);
});
test('random picker includes both endpoints and rejects invalid ranges',()=>{
  assert.equal(pickNumber('1','35',0),1);
  assert.equal(pickNumber('1','35',.999999),35);
  assert.equal(pickNumber('8','8',.5),8);
  for(const pair of [['','10'],['5','2'],['2.5','10'],['1','101']]) assert.equal(pickNumber(...pair),null);
});
test('sample classroom controls require a connection and do not outlive the class',()=>{
  assert.deepEqual(roomReducer(initialRoom,{type:'focus'}),initialRoom);
  let room=roomReducer(initialRoom,{type:'start'});
  room=roomReducer(room,{type:'focus'});
  room=roomReducer(room,{type:'link',value:'https://example.org/lesson'});
  assert.equal(room.focus,true);
  assert.equal(room.link,'https://example.org/lesson');
  assert.deepEqual(roomReducer(room,{type:'end'}),initialRoom);
});
test('classroom rejects unsafe links and blocks sending while browsers are offline',()=>{
  const connected=roomReducer(initialRoom,{type:'start'});
  for(const value of ['javascript:alert(1)','data:text/html,test','not a url']) assert.deepEqual(roomReducer(connected,{type:'link',value}),connected);
  const offline=roomReducer(connected,{type:'offline'});
  assert.deepEqual(roomReducer(offline,{type:'link',value:'https://example.org'}),offline);
});
