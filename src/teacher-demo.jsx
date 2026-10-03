import React, {useState, useEffect, useRef, useReducer} from 'react';
import {createRoot} from 'react-dom/client';
import {timerValue, pauseTimer, parseDuration, pickNumber, roomReducer, initialRoom} from './teacher-state.mjs';

const shapes = {
  layers: <><path d="m3 7 9-5 9 5-9 5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
  caption: <><path d="M4 5h16v12H9l-5 4z"/><path d="M8 9h8M8 13h5"/></>,
  timer: <><circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 5V2M12 9v5l3 2"/></>,
  picker: <><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 7h.01M17 7h.01M12 12h.01M7 17h.01M17 17h.01" strokeWidth="3"/></>,
  draw: <><path d="m4 16 12-12 4 4L8 20H4zM14 6l4 4"/></>,
  classroom: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></>,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" strokeWidth="3"/>,
  dictionary: <><path d="M12 5C7 2 3 4 3 4v16s4-2 9 1c5-3 9-1 9-1V4s-4-2-9 1v16"/></>,
  noise: <><path d="M3 10v4M7 6v12M12 3v18M17 6v12M21 10v4"/></>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  back: <path d="m14 6-6 6 6 6"/>,
  next: <path d="m10 6 6 6-6 6"/>,
  undo: <><path d="m8 4-5 5 5 5M3 9h10a7 7 0 0 1 0 14"/></>,
};
function Icon({name}) {return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;}
const names = {timer:'Timer',picker:'Picker',classroom:'Classroom',dictionary:'Dictionary',noise:'Noise meter'};
const captions = [
  {en:'Plants use sunlight to make their own food.',Japanese:'植物は太陽の光を使って、自分で栄養を作ります。',Chinese:'植物利用阳光制造自己的养分。',Vietnamese:'Thực vật sử dụng ánh sáng mặt trời để tự tạo ra thức ăn.'},
  {en:'What do you notice about the leaves?',Japanese:'葉について、どんなことに気づきましたか？',Chinese:'关于叶子，你注意到了什么？',Vietnamese:'Bạn nhận thấy điều gì về những chiếc lá?'},
  {en:'Take two minutes to discuss with your partner.',Japanese:'隣の人と2分間話し合ってください。',Chinese:'请和你的同伴讨论两分钟。',Vietnamese:'Hãy dành hai phút để thảo luận với bạn của mình.'},
];
const words = {
  photosynthesis:{definition:'The process by which plants use sunlight, water and carbon dioxide to make food, releasing oxygen.',synonym:'Related terms: light-dependent reactions, carbon fixation. There is no exact everyday synonym.',Japanese:'光合成',Chinese:'光合作用',Vietnamese:'quang hợp'},
  ecosystem:{definition:'A community of living things and the environment they interact with.',synonym:'Related terms: ecological community, habitat, biome. Their meanings are not identical.',Japanese:'生態系',Chinese:'生态系统',Vietnamese:'hệ sinh thái'},
};
const freshTimer = (mode='countdown', value=120) => ({mode,value,initial:value,running:false,startedAt:0});
const clock = value => `${Math.floor(value / 60).toString().padStart(2,'0')}:${(value % 60).toString().padStart(2,'0')}`;

function Window({tool, active, close, children}) {
  const head = useRef(null), windowRef = useRef(null), dragging = useRef(null), firstRender = useRef(true);
  const [offset,setOffset] = useState({x:0,y:0});
  useEffect(() => {
    if(firstRender.current){firstRender.current=false;return;}
    if(!active)return;
    if(!window.matchMedia('(max-width:800px)').matches)head.current?.focus({preventScroll:true});
  }, [active]);
  function beginDrag(e) {
    if(e.button!==0||e.target.closest('button')||window.matchMedia('(max-width:800px)').matches)return;
    const r=windowRef.current.getBoundingClientRect(), bounds=windowRef.current.closest('.td-desktop').getBoundingClientRect();
    dragging.current={x:e.clientX,y:e.clientY,offset,rect:r,bounds};
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function moveDrag(e) {
    const d=dragging.current;if(!d)return;
    const dx=Math.max(d.bounds.left+12-d.rect.left,Math.min(e.clientX-d.x,d.bounds.right-12-d.rect.right));
    const dy=Math.max(d.bounds.top+48-d.rect.top,Math.min(e.clientY-d.y,d.bounds.bottom-150-d.rect.bottom));
    setOffset({x:d.offset.x+dx,y:d.offset.y+dy});
  }
  return <section ref={windowRef} style={{transform:`translate(${offset.x}px,${offset.y}px)`}} className={`td-window td-${tool}`} aria-label={`${names[tool]} tool`}>
    <header className="td-titlebar" onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={()=>{dragging.current=null;}} onPointerCancel={()=>{dragging.current=null;}}><strong ref={head} tabIndex="-1"><Icon name={tool}/>{names[tool]}</strong><button aria-label={`Close ${names[tool]}`} onClick={close}><Icon name="close"/></button></header>
    <div className="td-window-body">{children}</div>
  </section>;
}
function Timer({timer,setTimer,now}) {
  const [duration,setDuration] = useState(`${Math.floor(timer.initial/60)}:${(timer.initial%60).toString().padStart(2,'0')}`), [error,setError] = useState('');
  const value = timerValue(timer,now);
  function preset(seconds) {setTimer(freshTimer('countdown',seconds));setDuration(`${Math.floor(seconds/60)}:${(seconds%60).toString().padStart(2,'0')}`);setError('');}
  return <><div className="td-segment" aria-label="Timer mode">{['countdown','stopwatch'].map(mode=><button key={mode} aria-pressed={timer.mode===mode} onClick={()=>{setTimer(freshTimer(mode,mode==='countdown'?120:0));setDuration('2:00');setError('');}}>{mode==='countdown'?'Countdown':'Stopwatch'}</button>)}</div>
    {timer.mode==='countdown'&&<><form className="td-row" onSubmit={e=>{e.preventDefault();const n=parseDuration(duration);if(n===null||n===0)setError('Use minutes:seconds, for example 2:00.');else preset(n);}}><label className="td-grow">Set time<input aria-label="Countdown duration" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="m:ss"/></label><button type="submit">Set</button></form><div className="td-presets">{[30,60,120,180,300,600].map(s=><button key={s} onClick={()=>preset(s)}>{s===30?'30s':`${s/60}m`}</button>)}</div></>}
    <div className="td-clock" role="timer" aria-label={`${timer.mode}: ${clock(value)}`}><span>{clock(value)}</span><small>{timer.running?'In progress':value===0&&timer.mode==='countdown'?'Time’s up':timer.mode==='countdown'?'Time to think':'Ready when you are'}</small></div>
    {timer.mode==='countdown'&&<progress aria-label="Time remaining" max={timer.initial||1} value={value}/>}
    <div className="td-row"><button className={timer.running?'td-amber':'td-green'} disabled={!timer.running&&timer.mode==='countdown'&&value===0} onClick={()=>setTimer(t=>t.running?pauseTimer(t,Date.now()):{...t,running:true,startedAt:Date.now()})}>{timer.running?'Pause':'Start'}</button><button onClick={()=>setTimer(t=>freshTimer(t.mode,t.initial))}>Reset</button></div>
    {error&&<p className="td-error" role="alert">{error}</p>}<p className="td-note">Try a preset, start the timer, or switch to stopwatch.</p>
  </>;
}
function Picker() {
  const [mode,setMode]=useState('numbers'),[from,setFrom]=useState('1'),[to,setTo]=useState('35'),[result,setResult]=useState('?'),[roster,setRoster]=useState('Alex\nHana\nJamie\nLinh\nNoah\nRiley\nSam\nYuki'),[editing,setEditing]=useState(false),[error,setError]=useState('');
  const students=roster.split('\n').map(n=>n.trim()).filter(Boolean);
  function pick() {const value=mode==='numbers'?pickNumber(from,to):students[Math.floor(Math.random()*students.length)];if(value===null||value===undefined){setError(mode==='numbers'?'Choose a whole-number range between 1 and 100.':'Add at least one student to your class list.');return;}setError('');setResult(value);}
  return <><div className="td-segment" aria-label="Picker mode">{['numbers','class'].map(m=><button key={m} aria-pressed={mode===m} onClick={()=>{setMode(m);setResult('?');setError('');}}>{m==='numbers'?'Numbers':'Class list'}</button>)}</div>
    {mode==='numbers'?<div className="td-row"><label>From<input type="number" min="1" max="100" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="number" min="1" max="100" value={to} onChange={e=>setTo(e.target.value)}/></label></div>:<><div className="td-row td-between"><strong>Class 4B</strong><button onClick={()=>setEditing(!editing)}>{editing?'Done':'Edit list'}</button></div>{editing?<label>One name per line<textarea aria-label="Class roster" rows="5" value={roster} onChange={e=>{setRoster(e.target.value);setResult('?');}}/></label>:<div className="td-roster">{students.map((n,i)=><span key={i} className={result===n?'selected':''}>{n}</span>)}</div>}</>}
    <output className="td-picked" aria-live="polite">{result}</output><button className="td-purple td-wide" onClick={pick}>{mode==='numbers'?'Pick number':'Pick student'}</button>{error&&<p role="alert" className="td-error">{error}</p>}<p className="td-note">Sample class list. Changes stay in this preview.</p>
  </>;
}
function Classroom({room,dispatch}) {
  const [url,setUrl]=useState('https://example.org/lesson'),[error,setError]=useState('');
  const status=room.offline?'Browser offline':room.focus?'Focus mode on':room.link?'Lesson link received':'On the lesson';
  return <><p className="td-class-name">Class 4B · Science</p><p className="td-note">{room.connected?'A sample room with three student browsers.':'Start a sample class to explore the connected tools.'}</p><div className="td-row td-between"><span className={room.connected?'td-success':''}>{room.connected?'3 students connected':'Not connected'}</span><button className="td-purple" onClick={()=>{dispatch({type:room.connected?'end':'start'});setError('');}}>{room.connected?'End Class':'Start Class'}</button></div>
    {room.connected&&<><div className="td-room-code"><small>CLASSROOM CODE</small><strong>leaf-428</strong><small>Students enter this code in Layers Student</small></div>{room.help&&<div className="td-help"><span>Student 2 is asking for help</span><button onClick={()=>dispatch({type:'help'})}>Resolve</button></div>}</>}
    <div className="td-control"><div><strong>Focus Mode</strong><small>Limit distractions in connected browsers.</small></div><button aria-label="Focus Mode" aria-pressed={room.focus} disabled={!room.connected} onClick={()=>dispatch({type:'focus'})}>{room.focus?'On':'Off'}</button></div>
    <div className="td-control"><div><strong className="td-danger-text">Browser lockdown</strong><small>Pause browsing during an activity.</small></div><button aria-label="Browser lockdown" aria-pressed={room.offline} disabled={!room.connected} onClick={()=>dispatch({type:'offline'})}>{room.offline?'On':'Off'}</button></div>
    <form onSubmit={e=>{e.preventDefault();let valid=false;try{valid=['http:','https:'].includes(new URL(url).protocol);}catch{}if(!valid){setError('Enter a complete http:// or https:// link.');return;}dispatch({type:'link',value:url});setError('');}}><label>Push link to students<input aria-label="Lesson link" value={url} disabled={!room.connected} onChange={e=>setUrl(e.target.value)}/></label><button className="td-wide td-purple" disabled={!room.connected||room.offline}>Send link</button></form>{error&&<p className="td-error" role="alert">{error}</p>}
    {room.connected&&<><div className="td-students" aria-live="polite">{[1,2,3].map(n=><div key={n}><span className="td-student-number">{n}</span><div><strong>Student {n}</strong><small>{status}</small></div></div>)}{room.link&&<p>Sent to 3 sample browsers: {room.link}</p>}</div><button className="td-wide" onClick={()=>dispatch({type:'help'})}>{room.help?'Withdraw sample help request':'Simulate a help request'}</button></>}
    <p className="td-note">This preview changes sample browsers only.</p>
  </>;
}
function Dictionary({language}) {
  const [word,setWord]=useState('photosynthesis'),[mode,setMode]=useState('definition'),[result,setResult]=useState('');
  useEffect(()=>{if(mode==='translate')setResult('');},[language]);
  return <><div className="td-segment" aria-label="Dictionary mode">{['definition','synonym','translate'].map(m=><button key={m} aria-pressed={mode===m} onClick={()=>{setMode(m);setResult('');}}>{m==='definition'?'Define':m==='synonym'?'Synonyms':'Translate'}</button>)}</div><label>Sample word<select value={word} onChange={e=>{setWord(e.target.value);setResult('');}}>{Object.keys(words).map(w=><option key={w}>{w}</option>)}</select></label>{mode==='translate'&&<div className="td-language-pair">English <span>→</span> {language}</div>}<button className="td-purple td-wide" onClick={()=>setResult(words[word][mode==='translate'?language:mode])}>{mode==='translate'?'Translate':'Look up'}</button><div className="td-definition" aria-live="polite">{result||'Choose a word, then look it up.'}</div><p className="td-note">Prewritten sample results. The Windows app uses online lookups.</p></>;
}
function Noise() {
  const [running,setRunning]=useState(false),[level,setLevel]=useState(24),[threshold,setThreshold]=useState(65);
  const loud=level>=threshold, color=loud?'#ff4757':level>=threshold*.65?'#ffa502':'#2ed573';
  return <><strong className="td-center">Classroom noise</strong><div className="td-gauge"><svg viewBox="0 0 220 125" aria-hidden="true"><path d="M20 110a90 90 0 0 1 180 0" fill="none" stroke="#343c4d" strokeWidth="20"/><path d="M20 110a90 90 0 0 1 180 0" fill="none" stroke={color} strokeWidth="20" pathLength="100" strokeDasharray={`${running?level:0} 100`}/><text x="110" y="100" textAnchor="middle" fill={color}>{running?level:'—'}</text></svg></div><p className="td-center" aria-live="polite">{running?loud?'Above threshold':level>threshold*.65?'Getting louder':'Comfortably quiet':'Stopped'}</p><label>Alarm threshold · {threshold}<input aria-label="Noise alarm threshold" type="range" min="20" max="95" value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/></label><button className="td-wide" disabled={running} onClick={()=>setThreshold(Math.min(95,Math.max(20,Math.round(level*2.2))))}>Calibrate sample level</button><button className={`td-wide ${running?'td-red':'td-green'}`} onClick={()=>setRunning(!running)}>{running?'Stop':'Start sample meter'}</button><div className="td-presets">{[['Quiet',24],['Busy',55],['Loud',86]].map(([label,n])=><button key={label} disabled={!running} aria-pressed={level===n} onClick={()=>setLevel(n)}>{label}</button>)}</div><p className="td-note">Simulated relative levels, not decibels. Your microphone is not used.</p></>;
}

function Plant() {return <svg className="td-plant" viewBox="0 0 420 260" role="img" aria-label="Sunlight, water and carbon dioxide help a plant grow and release oxygen"><g fill="none" stroke="#a9c8b6" strokeWidth="2"><path d="M60 68h72M346 68h-56M68 210h75" strokeDasharray="4 5"/></g><circle cx="58" cy="60" r="24" fill="#edc467"/><g stroke="#edc467" strokeWidth="3"><path d="M58 24v-9M58 105v-9M22 60h-9M103 60h-9M33 35l-7-7M83 35l7-7"/></g><path d="M207 228V98" fill="none" stroke="#426b50" strokeWidth="7"/><path d="M207 162c-54 3-68-26-67-61 45 0 67 15 67 61Z" fill="#648e65"/><path d="M207 130c1-53 31-66 65-62 0 39-19 64-65 62Z" fill="#7b9f70"/><path d="M207 188c48-2 62-29 60-60-36 2-60 16-60 60Z" fill="#577d56"/><path d="M173 222h71l-12 31h-47Z" fill="#bc8e71"/><circle cx="350" cy="65" r="25" fill="#e3ece2"/><text x="350" y="71" textAnchor="middle" fill="#426b50" fontSize="18" fontWeight="700">CO₂</text><path d="M57 170c0 0-17 21-17 32a17 17 0 0 0 34 0c0-11-17-32-17-32" fill="#92b9d0"/><text x="14" y="133" fill="#5b665b" fontSize="13">Sunlight</text><text x="312" y="115" fill="#5b665b" fontSize="13">Carbon dioxide</text><text x="38" y="247" fill="#5b665b" fontSize="13">Water</text><text x="292" y="217" fill="#426b50" fontSize="14">Oxygen →</text></svg>;}

function TeacherDemo() {
  const [tool,setTool]=useState('timer'),[caption,setCaption]=useState(true),[phrase,setPhrase]=useState(0),[language,setLanguage]=useState('Japanese'),[more,setMore]=useState(false),[slide,setSlide]=useState(0),[draw,setDraw]=useState(false),[pen,setPen]=useState('pen'),[color,setColor]=useState('#ff4444'),[strokes,setStrokes]=useState([]),[current,setCurrent]=useState(null),[timer,setTimer]=useState(freshTimer()),[now,setNow]=useState(Date.now()),[announcement,setAnnouncement]=useState(''),[resetId,setResetId]=useState(0);
  const [room,dispatch]=useReducer(roomReducer,initialRoom);
  const root=useRef(null),menuButton=useRef(null), menuRef=useRef(null), stroke=useRef(null);
  useEffect(()=>{if(!timer.running)return;const id=setInterval(()=>{const n=Date.now();setNow(n);if(timer.mode==='countdown'&&timerValue(timer,n)===0){setTimer(t=>pauseTimer(t,n));setAnnouncement('Timer finished.');}},200);return()=>clearInterval(id);},[timer]);
  useEffect(()=>{if(!more)return;menuRef.current?.querySelector('button')?.focus({preventScroll:true});const close=e=>{if(!menuRef.current?.contains(e.target)&&!menuButton.current?.contains(e.target))setMore(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[more]);
  function choose(next) {setTool(t=>t===next?null:next);setMore(false);}
  function closeTool() {const closing=tool;setTool(null);(root.current?.querySelector(`[data-tool="${closing}"]`)||menuButton.current)?.focus({preventScroll:!window.matchMedia("(max-width:800px)").matches});}
  function reset() {setResetId(n=>n+1);setTimer(freshTimer());setNow(Date.now());setTool('timer');setCaption(true);setLanguage('Japanese');setPhrase(0);setSlide(0);setDraw(false);setPen('pen');setColor('#ff4444');setStrokes([]);setCurrent(null);stroke.current=null;setMore(false);dispatch({type:'end'});setAnnouncement('Preview reset.');}
  function point(e) {const r=e.currentTarget.getBoundingClientRect();return [Math.round((e.clientX-r.left)/r.width*1000),Math.round((e.clientY-r.top)/r.height*640)];}
  function begin(e) {if(!draw||e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);if(pen==='eraser'){setStrokes(s=>s.slice(0,-1));return;}const p=point(e);stroke.current={color,pen,points:[p]};setCurrent(stroke.current);}
  function move(e) {if(!stroke.current)return;const p=point(e);stroke.current={...stroke.current,points:[...stroke.current.points,p]};setCurrent(stroke.current);}
  function end() {if(stroke.current){const finished=stroke.current;setStrokes(s=>[...s,finished]);stroke.current=null;setCurrent(null);}}
  function annotation(s,i) {return <polyline key={i} points={s.points.map(p=>p.join(',')).join(' ')} fill="none" stroke={s.color} strokeWidth={s.pen==='highlight'?28:5} opacity={s.pen==='highlight'?.4:1} strokeLinecap="round" strokeLinejoin="round"/>;}
  return <div className="teacher-demo" ref={root} onKeyDown={e=>{if(e.key==='Escape'){if(more){setMore(false);menuButton.current?.focus();}else if(draw){setDraw(false);setCurrent(null);stroke.current=null;}else if(tool)closeTool();}if(draw&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();setStrokes(s=>s.slice(0,-1));}}}>
    <div className="td-intro"><div><span className="eyebrow">Interactive Windows preview</span><h2>Your lesson. Your tools. All together.</h2><p>Click the toolbar and try it for yourself. Sample data only; no microphone or account needed.</p></div><button className="td-reset" onClick={reset}><Icon name="undo"/>Reset preview</button></div>
    <div className="td-shortcuts" aria-label="Preview activities"><span>Try a classroom moment</span><button onClick={()=>{setCaption(true);setPhrase(p=>(p+1)%captions.length);}}>Translate a sentence</button><button onClick={()=>setTool('picker')}>Pick a student</button><button onClick={()=>setTool('classroom')}>Connect a classroom</button><button onClick={()=>{setDraw(true);setTool(null);}}>Annotate the slide</button></div>
    <div className={`td-desktop ${draw?'td-drawing':''}`}>
      <div className="td-desktop-bar"><span><Icon name="layers"/>Science lesson.pptx</span><span>Windows app preview</span></div>
      <div className="td-dock" aria-label="Layers Teacher toolbar"><div className="td-dock-brand"><Icon name="layers"/><strong>Layers</strong></div><div className="td-dock-languages"><span>English</span><span aria-hidden="true">→</span><select aria-label="Translation language" value={language} onChange={e=>setLanguage(e.target.value)}>{['Japanese','Chinese','Vietnamese'].map(l=><option key={l}>{l}</option>)}</select></div><div className="td-dock-tools"><button aria-pressed={caption} onClick={()=>setCaption(!caption)}><Icon name="caption"/>Caption</button>{['timer','picker'].map(t=><button data-tool={t} key={t} aria-pressed={tool===t} onClick={()=>choose(t)}><Icon name={t}/>{names[t]}</button>)}<button aria-pressed={draw} onClick={()=>{setDraw(!draw);setTool(null);}}><Icon name="draw"/>Draw</button><button data-tool="classroom" aria-pressed={tool==='classroom'} onClick={()=>choose('classroom')}><Icon name="classroom"/>Classroom</button><div className="td-more-wrap"><button ref={menuButton} aria-expanded={more} aria-controls="td-more-tools" onClick={()=>setMore(!more)}><Icon name="more"/>More</button>{more&&<div ref={menuRef} id="td-more-tools" className="td-more-menu">{['dictionary','noise'].map(t=><button data-tool={t} key={t} onClick={()=>choose(t)}><Icon name={t}/>{names[t]}</button>)}</div>}</div></div></div>
      {Object.keys(names).map(t=><div key={`${t}-${resetId}`} className="td-tool-host" hidden={tool!==t}><Window tool={t} active={tool===t} close={closeTool}>{t==='timer'?<Timer timer={timer} setTimer={setTimer} now={now}/>:t==='picker'?<Picker/>:t==='classroom'?<Classroom room={room} dispatch={dispatch}/>:t==='dictionary'?<Dictionary language={language}/>:<Noise/>}</Window></div>)}
      {draw&&<aside className="td-draw-palette" aria-label="Drawing palette"><strong>Draw</strong>{[['pen','Pen'],['highlight','Highlighter']].map(([key,label])=><button key={key} aria-label={label} aria-pressed={pen===key} onClick={()=>setPen(key)}>{key==='pen'?<Icon name="draw"/>:key==='highlight'?<span className="td-highlight-icon"/>:<Icon name="undo"/>}</button>)}<div className="td-colors">{[['#ff4444','Red'],['#ffdd00','Yellow'],['#3498db','Blue'],['#2ed573','Green']].map(([c,name])=><button key={c} aria-label={`${name} ink`} aria-pressed={color===c} onClick={()=>setColor(c)}><span style={{background:c}}/></button>)}</div><button aria-label="Undo annotation" disabled={!strokes.length} onClick={()=>setStrokes(s=>s.slice(0,-1))}><Icon name="undo"/></button><button onClick={()=>setStrokes([])}>Clear</button><button aria-label="Exit drawing" onClick={()=>setDraw(false)}><Icon name="close"/></button></aside>}
      <div className="td-lesson-area">
        {caption&&<div className="td-caption" aria-live="polite"><span className="td-caption-label">Caption · English → {language} <small>Sample</small></span><span>{captions[phrase].en}</span><strong lang={{Japanese:'ja',Chinese:'zh',Vietnamese:'vi'}[language]}>{captions[phrase][language]}</strong><button aria-label="Next sample caption" onClick={()=>setPhrase(p=>(p+1)%captions.length)}><Icon name="next"/></button></div>}
        <div className="td-slide">
          <div className="td-slide-heading"><span>SCIENCE / CLASS 4B</span><span>0{slide+1}</span></div><h3>{slide===0?'How do plants make food?':'Everything is connected.'}</h3><p>{slide===0?'A little sunlight. A lot of possibility.':'Every plant is part of an ecosystem.'}</p><Plant/><div className="td-slide-prompt"><small>THINK · PAIR · SHARE</small><strong>{slide===0?'What does a plant need to grow?':'What happens if one part changes?'}</strong><span>Discuss your ideas with a partner.</span></div>
          <svg className="td-ink" viewBox="0 0 1000 640" preserveAspectRatio="none" role="img" aria-label={`${strokes.length} annotations on lesson slide`} onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>{strokes.map(annotation)}{current&&annotation(current,'current')}</svg>
        </div>
        <div className="td-slide-nav"><button aria-label="Previous lesson slide" disabled={slide===0} onClick={()=>{setSlide(0);setStrokes([]);}}> <Icon name="back"/></button><span>Slide {slide+1} of 2</span><button aria-label="Next lesson slide" disabled={slide===1} onClick={()=>{setSlide(1);setStrokes([]);}}><Icon name="next"/></button></div>
      </div>
    </div>
    {draw&&<div className="td-draw-hint"><span>Draw directly on the slide. Esc exits drawing; Ctrl/Cmd+Z undoes a stroke.</span><button onClick={()=>setStrokes(s=>[...s,{pen:'highlight',color,points:[[110,120],[850,120]]}])}>Add a sample highlight</button></div>}
    <p className="td-footer-note">A preview of the current Windows toolbar. Captions, lookups and classroom connections are simulated here. <a href="contact.html?topic=teacher">Join the free closed beta</a> to try the application.</p><span className="td-sr" role="status">{announcement}</span>
  </div>;
}

for (const host of document.querySelectorAll('[data-teacher-demo]')) createRoot(host).render(<TeacherDemo/>);
