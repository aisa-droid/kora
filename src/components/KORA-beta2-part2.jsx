// ─────────────────────────────────────────────────────────────────────────────
// KORA Beta 2.0 — Part 2 of 3 — Screens
// Onboarding · CheckIn · MorningAnchor · RoomEnvironment · FlowField
// Practice · Journal · Record · Reflect · Signal · Profile
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import {
  callKORA, save, load, exportData,
  KORA_SYSTEM, CHECK_IN_STATES, FLOW_ZONES, ROOMS, STATE_TO_ROOM,
  SESSION_DURATIONS, LOG_TAGS, CREATOR_TYPES, MORNING_ANCHOR, TX_FALLBACKS,
  uid, todayStr, weekStart, fmtTime, getRoom, getZone, getState,
  tod, greet, isMorning, daysSince, buildMemory,
  C, F, iSt, taSt, btnPrimary, btnGhost,
  Dots, Eyebrow, PageTitle, SectionLabel, Reveal, BreathingGlow, GrainOverlay,
} from "./KORA-beta2-part1";

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
// Goal: complete one full loop within 2 minutes.
// No tutorials. No feature tours. Experience first.
export function OnboardingScreen({ onComplete }) {
  const [phase, setPhase]   = useState("entry"); // entry → checkin → room → session → reflect → done
  const [vis, setVis]       = useState(false);
  const [state, setState]   = useState(null);
  const [room, setRoom]     = useState(null);
  const [duration, setDuration] = useState(5);
  const [sessionStart, setSessionStart] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [reflection, setReflection] = useState("");
  const [name, setName]     = useState("");
  const timerRef = useRef(null);

  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  const transition = (next, delay=0) => {
    setVis(false);
    setTimeout(() => { setPhase(next); setTimeout(() => setVis(true), 60); }, 260 + delay);
  };

  const selectState = (s) => {
    setState(s);
    const r = getRoom(STATE_TO_ROOM[s.id]);
    setRoom(r);
    transition("room");
  };

  const startSession = () => {
    const now = Date.now();
    setSessionStart(now);
    setTimeLeft(duration * 60);
    transition("session");
    setTimeout(() => {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    }, 600);
  };

  const endSession = () => {
    clearInterval(timerRef.current);
    transition("reflect");
  };

  const finish = () => {
    const sessionData = {
      id: uid(), date: new Date().toISOString(),
      dateLabel: new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}),
      roomId: room?.id, practiceTitle: "First session",
      duration: Math.max(1, Math.round((Date.now() - sessionStart) / 60000)),
      notes: reflection, evidence: "", mood: state ? { id:state.id, emoji:state.emoji, label:state.label, color:state.color } : null,
      tags: [],
    };
    onComplete({ name: name.trim(), sessionData });
  };

  const pct = timeLeft !== null ? (1 - timeLeft / (duration * 60)) * 100 : 0;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center",
      justifyContent:"center", padding:"32px 24px", position:"relative", overflow:"hidden" }}>
      <GrainOverlay/>
      <BreathingGlow color="#D4A87A" intensity={0.05}/>

      <div style={{ position:"relative", zIndex:1, maxWidth:420, width:"100%",
        opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(14px)", transition:"all .55s ease" }}>

        {/* ── ENTRY ── */}
        {phase==="entry" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:F.serif, fontSize:"2.2rem", fontWeight:300,
              letterSpacing:".5em", color:C.text, marginBottom:8 }}>KORA</div>
            <div style={{ fontSize:".42rem", fontWeight:300, letterSpacing:".28em",
              textTransform:"uppercase", color:C.textDim, marginBottom:52 }}>Creative Operating System</div>

            <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:"1.1rem",
              fontWeight:300, color:C.text, lineHeight:1.7, marginBottom:10 }}>
              KORA helps you move when you feel stuck.
            </div>
            <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".88rem",
              fontWeight:300, color:C.textSub, lineHeight:1.7, marginBottom:36 }}>
              We'll start simple.
            </div>

            <input
              placeholder="What shall I call you?"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key==="Enter" && name.trim() && transition("checkin")}
              style={{ ...iSt, textAlign:"center", marginBottom:14,
                fontFamily:F.serif, fontStyle:"italic", fontSize:"1rem" }}
            />
            <button
              onClick={() => name.trim() && transition("checkin")}
              disabled={!name.trim()}
              style={{ ...btnPrimary(), opacity:name.trim()?1:0.3 }}>
              Begin
            </button>
          </div>
        )}

        {/* ── CHECK-IN ── */}
        {phase==="checkin" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".88rem",
              color:C.textSub, marginBottom:32 }}>How are you arriving{name?`, ${name.split(" ")[0]}`:""}?</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {CHECK_IN_STATES.map(s => (
                <button key={s.id} onClick={() => selectState(s)} style={{
                  padding:"20px 14px", border:`1px solid rgba(255,255,255,0.07)`,
                  borderRadius:14, background:"rgba(255,255,255,0.02)", cursor:"pointer",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                  transition:"all .25s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=`${s.color}44`; e.currentTarget.style.background=`${s.color}0c`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}>
                  <span style={{ fontSize:"1.6rem" }}>{s.emoji}</span>
                  <span style={{ fontFamily:F.sans, fontSize:".66rem", fontWeight:300, color:C.textSub }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ROOM ENTRY ── */}
        {phase==="room" && room && (
          <div style={{ textAlign:"center" }}>
            <div style={{ marginBottom:32 }}>
              <div style={{ fontSize:"2.4rem", marginBottom:12 }}>{room.emoji}</div>
              <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".9rem",
                color:room.color, marginBottom:8 }}>{state?.sub}</div>
              <div style={{ fontFamily:F.serif, fontSize:"1.5rem", fontWeight:300,
                color:C.text, marginBottom:6 }}>{room.name}</div>
              <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".78rem",
                color:C.textSub }}>{room.purpose}</div>
            </div>

            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:".48rem", fontWeight:300, letterSpacing:".22em",
                textTransform:"uppercase", color:C.textDim, marginBottom:10 }}>How long?</div>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                {SESSION_DURATIONS.map(d => (
                  <button key={d.mins} onClick={() => setDuration(d.mins)} style={{
                    padding:"9px 16px", border:`1px solid ${duration===d.mins?"rgba(255,255,255,0.24)":"rgba(255,255,255,0.07)"}`,
                    borderRadius:9, background:duration===d.mins?"rgba(255,255,255,0.08)":"transparent",
                    cursor:"pointer", fontFamily:F.sans, fontSize:".78rem", fontWeight:300,
                    color:duration===d.mins?C.text:C.textSub, transition:"all .2s",
                  }}>{d.label}</button>
                ))}
              </div>
            </div>

            <button onClick={startSession} style={btnPrimary(room.color)}>Enter Room</button>
          </div>
        )}

        {/* ── SESSION ── */}
        {phase==="session" && room && (
          <div style={{ textAlign:"center" }}>
            {/* Circular timer */}
            <div style={{ position:"relative", width:180, height:180, margin:"0 auto 28px" }}>
              <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", transform:"rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5"/>
                <circle cx="50" cy="50" r="44" fill="none" stroke={room.color} strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*44}`}
                  strokeDashoffset={`${2*Math.PI*44*(1-pct/100)}`}
                  style={{ transition:"stroke-dashoffset 1s linear", opacity:.6 }}/>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontFamily:F.sans, fontSize:"1.9rem", fontWeight:200,
                  letterSpacing:".06em", color:C.text, lineHeight:1 }}>{fmtTime(timeLeft||0)}</div>
              </div>
            </div>

            <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:"1rem",
              fontWeight:300, color:C.textSub, lineHeight:1.75, marginBottom:32,
              animation:"fadeIn .6s ease" }}>
              {room.prompt}
            </div>

            <button onClick={endSession} style={{ ...btnGhost, display:"inline-block" }}
              className="kora-btn-ghost">
              {timeLeft===0 ? "Continue →" : "End session"}
            </button>
          </div>
        )}

        {/* ── REFLECT ── */}
        {phase==="reflect" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ fontFamily:F.serif, fontSize:"1.4rem", fontWeight:300,
                color:C.text, marginBottom:6 }}>Session complete.</div>
              <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".86rem",
                color:C.textSub }}>{room?.closure}</div>
            </div>
            <textarea
              autoFocus
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              placeholder="Write anything — or nothing. One word is enough."
              style={{ ...taSt(100), fontFamily:F.serif, fontStyle:"italic",
                fontSize:".92rem", marginBottom:14 }}
            />
            <button onClick={finish} style={btnPrimary()}>Continue</button>
            {reflection.length === 0 && (
              <button onClick={finish} style={{ ...btnGhost, width:"100%", marginTop:8,
                display:"block", textAlign:"center" }} className="kora-btn-ghost">
                Let it go
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MORNING ANCHOR ───────────────────────────────────────────────────────────
export function MorningAnchorScreen({ onComplete, onSkip, name }) {
  const [checked, setChecked] = useState([]);
  const [vis, setVis]         = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  const toggle = id => setChecked(c => c.includes(id) ? c.filter(x=>x!==id) : [...c,id]);
  const allDone = checked.length === MORNING_ANCHOR.length;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center",
      justifyContent:"center", padding:"32px 24px", position:"relative", overflow:"hidden" }}>
      <GrainOverlay/>
      <BreathingGlow color="#D4A87A" intensity={0.04}/>
      <div style={{ position:"relative", zIndex:1, maxWidth:380, width:"100%",
        opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(12px)", transition:"all .55s ease" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <Eyebrow t="Morning" color="rgba(212,168,122,0.5)"/>
          <PageTitle>Prepare your environment.</PageTitle>
          <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".82rem",
            color:C.textSub, marginTop:8, lineHeight:1.7 }}>
            Return when ready.
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
          {MORNING_ANCHOR.map(item => {
            const done = checked.includes(item.id);
            return (
              <button key={item.id} onClick={() => toggle(item.id)} style={{
                display:"flex", alignItems:"center", gap:14, padding:"16px 18px",
                border:`1px solid ${done?"rgba(212,168,122,0.3)":"rgba(255,255,255,0.07)"}`,
                borderRadius:13, background:done?"rgba(212,168,122,0.06)":"rgba(255,255,255,0.02)",
                cursor:"pointer", textAlign:"left", transition:"all .28s",
              }}>
                <span style={{ fontSize:"1.2rem" }}>{item.emoji}</span>
                <span style={{ fontFamily:F.sans, fontSize:".82rem", fontWeight:300,
                  color:done?C.text:C.textSub, flex:1, transition:"color .25s" }}>{item.label}</span>
                {done && <span style={{ color:C.accent, fontSize:".7rem" }}>✓</span>}
              </button>
            );
          })}
        </div>

        <button onClick={onComplete} disabled={!allDone}
          style={{ ...btnPrimary(), opacity:allDone?1:0.28, marginBottom:10 }}>
          I'm ready
        </button>
        <button onClick={onSkip} style={{ ...btnGhost, width:"100%", display:"block",
          textAlign:"center" }} className="kora-btn-ghost">
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── CHECK-IN OVERLAY ─────────────────────────────────────────────────────────
export function CheckInOverlay({ onSave, onClose }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  const select = s => {
    onSave({ id:uid(), moodId:s.id, label:s.label, emoji:s.emoji, color:s.color,
      date:new Date().toISOString() });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:80, background:"rgba(4,4,10,0.97)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"24px",
      opacity:vis?1:0, transition:"opacity .4s" }}>
      <div style={{ maxWidth:440, width:"100%", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:-40, right:0,
          background:"none", border:"none", cursor:"pointer", fontFamily:F.sans,
          fontSize:".48rem", letterSpacing:".2em", textTransform:"uppercase",
          color:C.textDim, transition:"color .2s" }}
          onMouseEnter={e=>e.currentTarget.style.color=C.textSub}
          onMouseLeave={e=>e.currentTarget.style.color=C.textDim}>Close</button>

        <div style={{ textAlign:"center", marginBottom:28, animation:"fadeUp .4s ease" }}>
          <Eyebrow t="State Check-In"/>
          <PageTitle>How are you arriving?</PageTitle>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10,
          animation:"fadeUp .4s ease .08s both" }}>
          {CHECK_IN_STATES.map(s => (
            <button key={s.id} onClick={() => select(s)} style={{
              padding:"20px 12px", border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:14, background:"rgba(255,255,255,0.02)",
              cursor:"pointer", display:"flex", flexDirection:"column",
              alignItems:"center", gap:8, transition:"all .22s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${s.color}44`; e.currentTarget.style.background=`${s.color}0c`; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}>
              <span style={{ fontSize:"1.5rem" }}>{s.emoji}</span>
              <span style={{ fontFamily:F.sans, fontSize:".6rem", fontWeight:300, color:C.textSub }}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOM ENVIRONMENT ─────────────────────────────────────────────────────────
// Full screen. Timer overlays inside. Session lives here.
export function RoomEnvironment({ room, moodLogs, practices, onComplete, onBack, memory }) {
  const [phase, setPhase]         = useState("ritual"); // ritual → setup → active → closure
  const [ritualStep, setRStep]    = useState(0); // 0=arrive 1=breathe 2=prompt
  const [selPractice, setSelP]    = useState(null);
  const [duration, setDuration]   = useState(25);
  const [customDur, setCustomDur] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [timeLeft, setTimeLeft]   = useState(null);
  const [ambientText, setAmbient] = useState(null);
  const [ambientLoading, setAL]   = useState(false);
  const [notes, setNotes]         = useState("");
  const [evidence, setEvidence]   = useState("");
  const [selectedTags, setTags]   = useState([]);
  const [youtubeUrl, setYT]       = useState("");
  const [showYT, setShowYT]       = useState(false);
  const [ripple, setRipple]       = useState(null);
  const [vis, setVis]             = useState(false);
  const timerRef = useRef(null);
  const lastMood = moodLogs?.[0];
  const activePractices = practices?.filter(p=>!p.archived) || [];

  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  // Ritual sequence: arrive → breathe → prompt (auto-advance)
  useEffect(() => {
    if (phase !== "ritual") return;
    const times = [0, 1800, 3600];
    const timers = times.map((delay, i) => setTimeout(() => setRStep(i), delay));
    const done = setTimeout(() => setPhase("setup"), 5000);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [phase]);

  const handleStart = () => {
    const dur = customDur ? parseInt(customDur) || duration : duration;
    const now = Date.now();
    setStartedAt(now);
    setTimeLeft(dur * 60);
    setPhase("active");
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if(t<=1){clearInterval(timerRef.current);return 0;} return t-1; });
    }, 1000);
    // Fire ambient KORA text in background
    setAL(true);
    const ctx = lastMood ? `${lastMood.label} ${lastMood.emoji}` : "present";
    const pTitle = selPractice?.title || room.name;
    callKORA([{ role:"user", content:`Starting a ${dur}min session in ${room.name} on "${pTitle}". State: ${ctx}. Brief ambient reflection.` }],
      KORA_SYSTEM + (memory||""))
      .then(r => { setAmbient(r); setAL(false); })
      .catch(() => { setAmbient(null); setAL(false); });
  };

  const handleRipple = e => {
    const r = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - r.left, y: e.clientY - r.top, id: Date.now() });
    setTimeout(() => setRipple(null), 1000);
  };

  const endSession = () => {
    clearInterval(timerRef.current);
    const elapsed = startedAt ? Math.max(1, Math.round((Date.now()-startedAt)/60000)) : duration;
    setDuration(elapsed);
    setPhase("closure");
  };

  const finish = () => {
    const session = {
      id: uid(), date: new Date().toISOString(),
      dateLabel: new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}),
      roomId: room.id, practiceId: selPractice?.id, practiceTitle: selPractice?.title || room.name,
      duration, notes, evidence, tags: selectedTags,
      mood: lastMood ? { id:lastMood.moodId, emoji:lastMood.emoji, label:lastMood.label, color:lastMood.color } : null,
    };
    onComplete(session);
  };

  const pct = timeLeft !== null ? (1 - timeLeft / (duration*60)) * 100 : 0;
  const ytId = youtubeUrl.match(/[?&]v=([^&]+)/)?.[1] || youtubeUrl.match(/youtu\.be\/([^?]+)/)?.[1] || room.youtubeDefault;

  return (
    <div onClick={handleRipple} style={{ position:"fixed", inset:0, zIndex:60, background:room.gradient,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"24px", overflowY:"auto", opacity:vis?1:0, transition:"opacity .6s ease", cursor:"default" }}>
      <GrainOverlay opacity={0.04}/>

      {/* Breathing glow */}
      <div style={{ position:"fixed", width:"55vw", height:"55vw", borderRadius:"50%",
        background:`radial-gradient(circle,${room.color}10 0%,transparent 70%)`,
        top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none",
        animation:"breathe 5s ease-in-out infinite" }}/>

      {/* Ripple effect on tap */}
      {ripple && (
        <div style={{ position:"fixed", left:ripple.x, top:ripple.y, width:2, height:2,
          borderRadius:"50%", border:`1px solid ${room.color}44`,
          animation:"ripple 1s ease-out forwards", pointerEvents:"none", zIndex:2 }}/>
      )}

      {/* Back button */}
      {phase !== "active" && (
        <button onClick={onBack} style={{ position:"fixed", top:20, left:24, background:"none",
          border:"none", cursor:"pointer", fontFamily:F.sans, fontSize:".48rem", fontWeight:300,
          letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)",
          transition:"color .2s", zIndex:3 }}
          onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.55)"}
          onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.18)"}>← Back</button>
      )}

      <div style={{ position:"relative", zIndex:1, maxWidth:440, width:"100%", textAlign:"center" }}>

        {/* ── RITUAL SEQUENCE ── */}
        {phase==="ritual" && (
          <div>
            <div style={{ fontSize:"2rem", marginBottom:20 }}>{room.emoji}</div>
            {ritualStep >= 0 && (
              <div key={`r0`} style={{ fontFamily:F.serif, fontStyle:"italic",
                fontSize:"1.3rem", fontWeight:300, color:`${room.color}cc`,
                animation:"textFade 1.8s ease forwards", marginBottom:8 }}>
                {room.arrive}
              </div>
            )}
            {ritualStep >= 1 && (
              <div key={`r1`} style={{ fontFamily:F.serif, fontStyle:"italic",
                fontSize:"1.3rem", fontWeight:300, color:`${room.color}aa`,
                animation:"textFade 1.8s ease forwards" }}>
                {room.breathe}
              </div>
            )}
          </div>
        )}

        {/* ── SETUP ── */}
        {phase==="setup" && (
          <div style={{ animation:"fadeUp .5s ease" }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:"1.5rem", marginBottom:6 }}>{room.emoji}</div>
              <div style={{ fontFamily:F.serif, fontSize:"1.6rem", fontWeight:300,
                color:C.text, marginBottom:4 }}>{room.prompt}</div>
            </div>

            {/* Practice picker */}
            {activePractices.length > 0 && (
              <div style={{ marginBottom:20, textAlign:"left" }}>
                <div style={{ fontSize:".42rem", fontWeight:300, letterSpacing:".22em",
                  textTransform:"uppercase", color:C.textDim, marginBottom:9 }}>Practice (optional)</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {activePractices.slice(0,6).map(p => {
                    const sel = selPractice?.id === p.id;
                    const zone = FLOW_ZONES.find(z=>z.id===p.zoneId);
                    return (
                      <button key={p.id} onClick={()=>setSelP(sel?null:p)} style={{
                        padding:"7px 14px", border:`1px solid ${sel?(zone?.color||C.accent)+"44":"rgba(255,255,255,0.09)"}`,
                        borderRadius:20, background:sel?`${zone?.color||C.accent}10`:"transparent",
                        cursor:"pointer", fontFamily:F.sans, fontSize:".6rem", fontWeight:300,
                        color:sel?C.text:C.textSub, transition:"all .2s",
                      }}>{p.title}</button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Duration */}
            <div style={{ marginBottom:28, textAlign:"left" }}>
              <div style={{ fontSize:".42rem", fontWeight:300, letterSpacing:".22em",
                textTransform:"uppercase", color:C.textDim, marginBottom:9 }}>Duration</div>
              <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                {SESSION_DURATIONS.map(d => (
                  <button key={d.mins} onClick={() => { setDuration(d.mins); setCustomDur(""); }} style={{
                    padding:"8px 14px", border:`1px solid ${!customDur&&duration===d.mins?"rgba(255,255,255,0.26)":"rgba(255,255,255,0.08)"}`,
                    borderRadius:9, background:!customDur&&duration===d.mins?"rgba(255,255,255,0.09)":"transparent",
                    cursor:"pointer", fontFamily:F.sans, fontSize:".74rem", fontWeight:300,
                    color:!customDur&&duration===d.mins?C.text:C.textSub, transition:"all .2s",
                  }}>{d.label}</button>
                ))}
                <input
                  placeholder="Own"
                  value={customDur}
                  onChange={e=>setCustomDur(e.target.value.replace(/\D/,""))}
                  style={{ ...iSt, width:54, padding:"8px 10px", textAlign:"center", fontSize:".74rem" }}
                />
              </div>
            </div>

            <button onClick={handleStart} style={btnPrimary(room.color)}>Begin</button>
          </div>
        )}

        {/* ── ACTIVE SESSION ── */}
        {phase==="active" && (
          <div style={{ animation:"fadeIn .5s ease" }}>
            <div style={{ position:"relative", width:190, height:190, margin:"0 auto 24px" }}>
              <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", transform:"rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.2"/>
                <circle cx="50" cy="50" r="44" fill="none" stroke={room.color} strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*44}`}
                  strokeDashoffset={`${2*Math.PI*44*(1-pct/100)}`}
                  style={{ transition:"stroke-dashoffset 1s linear", opacity:.55 }}/>
              </svg>
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontFamily:F.sans, fontSize:"2rem", fontWeight:200,
                  letterSpacing:".05em", color:C.text }}>{fmtTime(timeLeft||0)}</div>
                {selPractice && <div style={{ fontSize:".44rem", color:C.textDim, marginTop:3,
                  letterSpacing:".1em" }}>{selPractice.title}</div>}
              </div>
            </div>

            {/* Ambient KORA text */}
            <div style={{ minHeight:56, marginBottom:28, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {ambientLoading && <Dots color={room.color}/>}
              {!ambientLoading && ambientText && (
                <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".88rem",
                  fontWeight:300, color:`${room.color}88`, lineHeight:1.75,
                  animation:"fadeIn .8s ease" }}>{ambientText}</div>
              )}
            </div>

            {/* YouTube (hidden until tapped) */}
            {showYT && (
              <div style={{ borderRadius:11, overflow:"hidden", marginBottom:16 }}>
                <iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=0&modestbranding=1`}
                  width="100%" height="120" frameBorder="0" allow="autoplay; fullscreen" style={{ display:"block" }}/>
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"center", gap:12 }}>
              <button onClick={() => setShowYT(v=>!v)} style={{ ...btnGhost, fontSize:".46rem",
                padding:"7px 14px" }} className="kora-btn-ghost">
                {showYT ? "Hide music" : "🎵 Music"}
              </button>
              <button onClick={endSession} style={{ ...btnGhost, fontSize:".46rem", padding:"7px 14px" }}
                className="kora-btn-ghost">
                {timeLeft===0 ? "Continue →" : "End early"}
              </button>
            </div>
          </div>
        )}

        {/* ── CLOSURE ── */}
        {phase==="closure" && (
          <div style={{ animation:"fadeUp .5s ease", textAlign:"left" }}>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ fontFamily:F.serif, fontSize:"1.3rem", fontWeight:300,
                color:C.text, marginBottom:4 }}>Session complete.</div>
              <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".84rem",
                color:`${room.color}aa` }}>{room.closure}</div>
            </div>

            <textarea value={notes} onChange={e=>setNotes(e.target.value)}
              placeholder="What came through? Even one word."
              style={{ ...taSt(72), fontFamily:F.serif, fontStyle:"italic",
                fontSize:".9rem", marginBottom:10 }}/>
            <textarea value={evidence} onChange={e=>setEvidence(e.target.value)}
              placeholder="Evidence — what was made or discovered…"
              style={{ ...taSt(48), fontSize:".78rem", marginBottom:12 }}/>

            {/* Tags */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:20 }}>
              {LOG_TAGS.map(tag => {
                const sel = selectedTags.includes(tag.id);
                return (
                  <button key={tag.id} onClick={() => setTags(t=>sel?t.filter(x=>x!==tag.id):[...t,tag.id])} style={{
                    padding:"5px 12px", border:`1px solid ${sel?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.07)"}`,
                    borderRadius:20, background:sel?"rgba(255,255,255,0.07)":"transparent",
                    cursor:"pointer", fontFamily:F.sans, fontSize:".56rem", fontWeight:300,
                    color:sel?C.text:C.textSub, transition:"all .2s",
                  }}>{tag.emoji} {tag.label}</button>
                );
              })}
            </div>

            <button onClick={finish} style={btnPrimary()}>Log and close</button>
            <button onClick={finish} style={{ ...btnGhost, width:"100%", marginTop:8,
              display:"block", textAlign:"center" }} className="kora-btn-ghost">Let it go</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FLOW FIELD (DASHBOARD) ───────────────────────────────────────────────────
export function FlowFieldScreen({ sessions, practices, moodLogs, profile, onEnterRoom, onCheckIn, onNav }) {
  const lastMood     = moodLogs?.[0];
  const accentColor  = lastMood?.color || C.accent;
  const checkedToday = moodLogs?.some(m => new Date(m.date).toDateString() === todayStr());
  const recentSessions = sessions?.slice(0,4) || [];

  // Suggestion logic based on zone usage
  const zoneCounts = {};
  sessions?.slice(0,14).forEach(s => { if(s.zoneId) zoneCounts[s.zoneId]=(zoneCounts[s.zoneId]||0)+1; });
  const lastZone = sessions?.[0]?.zoneId;
  const getSuggestion = () => {
    if (!lastMood) return null;
    if (lastMood.moodId==="overwhelmed") return "You seem overwhelmed. Movement first.";
    if (lastMood.moodId==="low") return "Low energy. Joy or Movement may help.";
    if (zoneCounts["head"] > (zoneCounts["hands"]||0)*2) return "You've been in Head a while. Try Hands.";
    if (!zoneCounts["movement"] && sessions?.length > 3) return "Movement hasn't been touched lately.";
    return null;
  };
  const suggestion = getSuggestion();

  // Which zones to show based on state
  const visibleZones = () => {
    if (!lastMood) return FLOW_ZONES;
    if (lastMood.moodId==="overwhelmed") return FLOW_ZONES.filter(z=>["movement","hands"].includes(z.id));
    if (lastMood.moodId==="low")         return FLOW_ZONES.filter(z=>["joy","head"].includes(z.id));
    return FLOW_ZONES;
  };
  const zones = visibleZones();

  // Last touched per zone
  const lastTouched = (zoneId) => {
    const s = sessions?.find(s=>s.zoneId===zoneId);
    return s ? daysSince(s.date) : null;
  };

  // State loop position
  const stateLoop = ["Spark","Explore","Flow","Ground","Night"];
  const currentLoop = lastMood?.moodId==="flow"?"Flow":lastMood?.moodId==="overwhelmed"?"Ground":"Explore";

  return (
    <div>
      {/* Header */}
      <Reveal>
        <div style={{ marginBottom:32 }}>
          <Eyebrow t={new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
            color="rgba(255,255,255,0.18)"/>
          <PageTitle>{greet(profile?.name)}</PageTitle>

          {/* State loop indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10 }}>
            <span style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".72rem",
              color:C.textSub }}>You are here:</span>
            <span style={{ fontFamily:F.sans, fontSize:".58rem", fontWeight:300,
              letterSpacing:".1em", padding:"3px 10px", border:`1px solid ${accentColor}33`,
              borderRadius:20, color:accentColor }}>{currentLoop}</span>
          </div>
        </div>
      </Reveal>

      {/* Check-in nudge */}
      {!checkedToday && (
        <Reveal delay={60}>
          <button onClick={onCheckIn} style={{ width:"100%", marginBottom:18,
            padding:"13px 18px", background:"rgba(255,255,255,0.02)",
            border:"1px solid rgba(255,255,255,0.07)", borderRadius:12,
            cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:12,
            transition:"all .25s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.14)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}>
            <span style={{ fontSize:"1rem" }}>○</span>
            <div>
              <div style={{ fontFamily:F.sans, fontSize:".74rem", fontWeight:300, color:C.text }}>
                How are you arriving today?</div>
              <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".6rem",
                color:C.textDim, marginTop:2 }}>Shapes what KORA shows you</div>
            </div>
          </button>
        </Reveal>
      )}

      {/* Suggestion strip */}
      {suggestion && (
        <Reveal delay={80}>
          <div style={{ marginBottom:16, padding:"11px 16px",
            background:`${accentColor}08`, border:`1px solid ${accentColor}18`,
            borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:".7rem" }}>→</span>
            <span style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".76rem",
              color:`${accentColor}cc` }}>{suggestion}</span>
          </div>
        </Reveal>
      )}

      {/* Flow Field grid */}
      <Reveal delay={100}>
        <div style={{ marginBottom:24 }}>
          <SectionLabel t="Flow Field"/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {zones.filter(z=>z.id!=="joy").map((zone, i) => {
              const touched = lastTouched(zone.id);
              const recent  = sessions?.some(s=>s.zoneId===zone.id && new Date(s.date)>=weekStart());
              return (
                <div key={zone.id} className="kora-zone-card" style={{
                  padding:"16px 15px", background:recent?`${zone.color}08`:"rgba(255,255,255,0.02)",
                  border:`1px solid ${recent?zone.color+"22":"rgba(255,255,255,0.06)"}`,
                  borderRadius:14, cursor:"pointer", transition:"all .28s",
                  opacity:!checkedToday||zones.includes(zone)?1:0.4,
                  animation:`fadeUp .4s ease ${i*50}ms both`,
                }} onClick={() => onEnterRoom(getRoom(zone.id==="movement"?"ground":zone.id==="head"?"flow":zone.id==="hands"?"flow":zone.id==="life"?"ground":"night"))}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ fontSize:"1.1rem" }}>{zone.emoji}</span>
                    {touched && <span style={{ fontFamily:F.sans, fontSize:".46rem",
                      fontWeight:300, color:C.textDim }}>{touched}</span>}
                  </div>
                  <div style={{ fontFamily:F.sans, fontSize:".72rem", fontWeight:300,
                    color:recent?C.text:C.textSub, marginBottom:8, transition:"color .25s" }}>
                    {zone.label}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {zone.practices.slice(0,3).map(p => (
                      <span key={p} style={{ fontSize:".48rem", fontWeight:300,
                        color:C.textDim, letterSpacing:".06em" }}>{p}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Joy — full width */}
          {zones.find(z=>z.id==="joy") && (() => {
            const zone = zones.find(z=>z.id==="joy");
            const touched = lastTouched(zone.id);
            const recent  = sessions?.some(s=>s.zoneId===zone.id && new Date(s.date)>=weekStart());
            return (
              <div className="kora-zone-card" style={{
                marginTop:10, padding:"15px 18px",
                background:recent?`${zone.color}08`:"rgba(255,255,255,0.02)",
                border:`1px solid ${recent?zone.color+"22":"rgba(255,255,255,0.06)"}`,
                borderRadius:14, cursor:"pointer", display:"flex", alignItems:"center",
                justifyContent:"space-between", transition:"all .28s",
                animation:"fadeUp .4s ease 200ms both",
              }} onClick={() => onEnterRoom(getRoom("night"))}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:"1.1rem" }}>{zone.emoji}</span>
                  <div>
                    <div style={{ fontFamily:F.sans, fontSize:".72rem", fontWeight:300,
                      color:recent?C.text:C.textSub }}>{zone.label}</div>
                    <div style={{ fontFamily:F.sans, fontSize:".5rem", color:C.textDim, marginTop:2 }}>
                      {zone.practices.slice(0,4).join(" · ")}</div>
                  </div>
                </div>
                {touched && <span style={{ fontFamily:F.sans, fontSize:".46rem",
                  fontWeight:300, color:C.textDim }}>{touched}</span>}
              </div>
            );
          })()}
        </div>
      </Reveal>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <Reveal delay={180}>
          <SectionLabel t="Recent"/>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {recentSessions.map(s => (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:11,
                padding:"8px 12px", background:"rgba(255,255,255,0.016)", borderRadius:9 }}>
                <span style={{ fontSize:".76rem", flexShrink:0 }}>{s.mood?.emoji||"◇"}</span>
                <span style={{ fontFamily:F.sans, fontSize:".7rem", fontWeight:300,
                  color:C.textSub, flex:1 }}>{s.practiceTitle||s.roomId}</span>
                <span style={{ fontFamily:F.sans, fontSize:".54rem", color:C.textDim }}>
                  {s.duration}m</span>
                <span style={{ fontFamily:F.sans, fontSize:".48rem", color:"rgba(255,255,255,0.1)" }}>
                  {s.dateLabel}</span>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ─── PRACTICE (was Goals) ─────────────────────────────────────────────────────
export function PracticeScreen({ practices, sessions, setPractices, onEnterRoom }) {
  const [adding, setAdding]   = useState(false);
  const [form, setForm]       = useState({ title:"", zoneId:"hands" });
  const [tab, setTab]         = useState("active");

  const active   = practices.filter(p=>!p.archived);
  const archived = practices.filter(p=>p.archived);

  const addPractice = () => {
    if (!form.title.trim()) return;
    const zone = getZone(form.zoneId);
    setPractices(ps=>[{ id:uid(), title:form.title.trim(), zoneId:form.zoneId,
      color:zone.color, createdAt:new Date().toISOString(), archived:false }, ...ps]);
    setForm({ title:"", zoneId:"hands" }); setAdding(false);
  };

  const getActivity = (p) => {
    const ws   = sessions.filter(s=>s.practiceId===p.id && new Date(s.date)>=weekStart());
    const last = sessions.find(s=>s.practiceId===p.id);
    return { week:ws.length, last: last ? daysSince(last.date) : null };
  };

  return (
    <div>
      <Reveal><div style={{ marginBottom:28 }}><Eyebrow t="Practice"/><PageTitle>Your practice.</PageTitle></div></Reveal>

      <Reveal delay={50}>
        <div style={{ display:"flex", gap:6, marginBottom:24, borderBottom:"1px solid rgba(255,255,255,0.05)", paddingBottom:12 }}>
          {[["active","Active"],["archived","Archived"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ background:"none", border:"none",
              cursor:"pointer", fontFamily:F.sans, fontSize:".54rem", fontWeight:300,
              letterSpacing:".18em", textTransform:"uppercase",
              color:tab===id?C.text:C.textSub, paddingBottom:8,
              borderBottom:`1px solid ${tab===id?C.accent:"transparent"}`, transition:"all .2s" }}>{label}</button>
          ))}
        </div>
      </Reveal>

      {tab==="active" && (
        <Reveal delay={80}>
          <div>
            {!adding && (
              <button onClick={()=>setAdding(true)} style={{ width:"100%", marginBottom:14,
                padding:"12px", border:"1px dashed rgba(255,255,255,0.09)", borderRadius:12,
                background:"transparent", cursor:"pointer", fontFamily:F.sans, fontSize:".56rem",
                fontWeight:300, letterSpacing:".14em", textTransform:"uppercase", color:C.textDim,
                transition:"all .25s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";e.currentTarget.style.color=C.textSub;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.09)";e.currentTarget.style.color=C.textDim;}}>
                + Add practice</button>
            )}

            {adding && (
              <div style={{ marginBottom:14, padding:"18px", background:"rgba(255,255,255,0.025)",
                border:"1px solid rgba(255,255,255,0.08)", borderRadius:13, animation:"fadeUp .3s ease" }}>
                <input autoFocus placeholder="Practice name…" value={form.title}
                  onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                  onKeyDown={e=>e.key==="Enter"&&addPractice()} style={{...iSt,marginBottom:10}}/>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:12 }}>
                  {FLOW_ZONES.map(z=>(
                    <button key={z.id} onClick={()=>setForm(f=>({...f,zoneId:z.id}))} style={{
                      padding:"5px 12px", border:`1px solid ${form.zoneId===z.id?z.color+"44":"rgba(255,255,255,0.07)"}`,
                      borderRadius:20, background:form.zoneId===z.id?`${z.color}10`:"transparent",
                      cursor:"pointer", fontFamily:F.sans, fontSize:".56rem", fontWeight:300,
                      color:form.zoneId===z.id?z.color:C.textSub, transition:"all .2s",
                    }}>{z.emoji} {z.label}</button>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={addPractice} style={{ flex:1, background:"rgba(255,255,255,0.07)",
                    border:"1px solid rgba(255,255,255,0.14)", borderRadius:9, padding:"9px",
                    fontFamily:F.sans, fontSize:".56rem", letterSpacing:".14em", textTransform:"uppercase",
                    color:C.text, cursor:"pointer" }}>Save</button>
                  <button onClick={()=>{setAdding(false);setForm({title:"",zoneId:"hands"});}} style={{
                    background:"none", border:"1px solid rgba(255,255,255,0.07)", borderRadius:9,
                    padding:"9px 14px", fontSize:".56rem", color:C.textSub, cursor:"pointer" }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {active.map((p,i)=>{
                const zone = getZone(p.zoneId);
                const act  = getActivity(p);
                return (
                  <div key={p.id} style={{ padding:"15px 17px", background:"rgba(255,255,255,0.022)",
                    border:"1px solid rgba(255,255,255,0.06)", borderRadius:13,
                    animation:`fadeUp .35s ease ${i*40}ms both` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <span style={{ fontSize:".9rem" }}>{zone.emoji}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:F.sans, fontSize:".8rem", fontWeight:300, color:C.text }}>{p.title}</div>
                        <div style={{ fontFamily:F.sans, fontSize:".52rem", color:C.textDim, marginTop:2 }}>
                          {zone.label}{act.last?` · ${act.last}`:""}
                          {act.week>0?` · ${act.week} this week`:""}
                        </div>
                      </div>
                    </div>
                    {/* Activity dots — presence not targets */}
                    <div style={{ display:"flex", gap:4, marginBottom:10 }}>
                      {[...Array(7)].map((_,di)=>{
                        const date = new Date(); date.setDate(date.getDate()-di);
                        const done = sessions.some(s=>s.practiceId===p.id&&new Date(s.date).toDateString()===date.toDateString());
                        return <div key={di} style={{ width:6, height:6, borderRadius:"50%",
                          background:done?zone.color:"rgba(255,255,255,0.07)", transition:"background .3s" }}/>;
                      })}
                    </div>
                    <div style={{ display:"flex", gap:7 }}>
                      <button onClick={()=>onEnterRoom(getRoom(p.zoneId==="movement"?"ground":p.zoneId==="head"?"flow":p.zoneId==="hands"?"flow":p.zoneId==="life"?"ground":"night"), p)} style={{
                        fontFamily:F.sans, fontSize:".5rem", letterSpacing:".12em", textTransform:"uppercase",
                        color:zone.color, background:"none", border:`1px solid ${zone.color}30`,
                        borderRadius:7, padding:"5px 11px", cursor:"pointer", transition:"all .2s" }}
                        onMouseEnter={e=>e.currentTarget.style.background=`${zone.color}10`}
                        onMouseLeave={e=>e.currentTarget.style.background="none"}>Enter →</button>
                      <button onClick={()=>setPractices(ps=>ps.map(x=>x.id===p.id?{...x,archived:true}:x))} style={{
                        fontFamily:F.sans, fontSize:".5rem", letterSpacing:".12em", textTransform:"uppercase",
                        color:C.textDim, background:"none", border:"none", cursor:"pointer", marginLeft:"auto" }}>Archive</button>
                    </div>
                  </div>
                );
              })}
              {active.length===0&&!adding&&<div style={{ fontFamily:F.serif, fontStyle:"italic",
                fontSize:".88rem", color:C.textDim, lineHeight:1.75 }}>No practices yet. Add one to begin.</div>}
            </div>
          </div>
        </Reveal>
      )}

      {tab==="archived" && (
        <Reveal delay={80}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {archived.map(p=>{
              const zone=getZone(p.zoneId);
              return (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 15px",
                  background:"rgba(255,255,255,0.016)", borderRadius:11 }}>
                  <span style={{ opacity:.4 }}>{zone.emoji}</span>
                  <span style={{ fontFamily:F.sans, fontSize:".76rem", fontWeight:300,
                    color:C.textSub, flex:1 }}>{p.title}</span>
                  <button onClick={()=>setPractices(ps=>ps.map(x=>x.id===p.id?{...x,archived:false}:x))} style={{
                    background:"none", border:"1px solid rgba(255,255,255,0.07)", borderRadius:7,
                    padding:"4px 11px", fontSize:".48rem", letterSpacing:".12em", textTransform:"uppercase",
                    color:C.textSub, cursor:"pointer" }}>Restore</button>
                </div>
              );
            })}
            {archived.length===0&&<div style={{ fontFamily:F.serif, fontStyle:"italic",
              fontSize:".88rem", color:C.textDim }}>No archived practices.</div>}
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
export function JournalScreen({ journalEntries, setJournalEntries, moodLogs }) {
  const [text, setText]     = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [touchedZones, setTZ] = useState([]);
  const timeOfDay = tod();
  const lastMood  = moodLogs?.[0];

  const prompts = {
    morning: { main:"What's moving through your mind before the work begins?",
      sub:"Morning pages. Write without editing.", accent:"#C4A86A" },
    midday:  { main:"Where are you right now, honestly?",
      sub:"A mid-day check in.", accent:"#8BA7C4" },
    evening: { main:"What happened today? What wants to be released?",
      sub:"Evening ritual. Let the day land.", accent:"#7B8FAE" },
  };
  const p = prompts[timeOfDay];

  const todayEntries = journalEntries.filter(e=>new Date(e.date).toDateString()===todayStr());
  const pastEntries  = journalEntries.filter(e=>new Date(e.date).toDateString()!==todayStr()).slice(0,6);

  const saveEntry = () => {
    if (!text.trim()) return;
    setSaving(true);
    const entry = {
      id:uid(), text:text.trim(), type:timeOfDay, touchedZones,
      mood:lastMood?{emoji:lastMood.emoji,label:lastMood.label,color:lastMood.color}:null,
      date:new Date().toISOString(),
      dateLabel:new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}),
      words:text.trim().split(/\s+/).filter(Boolean).length,
    };
    setTimeout(()=>{
      setJournalEntries(es=>[entry,...es]);
      setText(""); setTZ([]);
      setSaving(false); setSaved(true);
      setTimeout(()=>setSaved(false),2200);
    },300);
  };

  return (
    <div>
      <Reveal>
        <div style={{ marginBottom:24 }}>
          <Eyebrow t={`${timeOfDay.charAt(0).toUpperCase()+timeOfDay.slice(1)} · ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric"})}`} color={p.accent+"bb"}/>
          <PageTitle>{p.main}</PageTitle>
          <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".78rem",
            color:C.textDim, marginTop:6, lineHeight:1.7 }}>{p.sub}</div>
        </div>
      </Reveal>

      <Reveal delay={70}>
        {lastMood && (
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, opacity:.55 }}>
            <span style={{ fontSize:".76rem" }}>{lastMood.emoji}</span>
            <span style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".62rem",
              color:C.textSub }}>{lastMood.label}</span>
          </div>
        )}
        <textarea value={text} onChange={e=>setText(e.target.value)}
          placeholder="Begin writing…"
          style={{ ...taSt(200), fontFamily:F.serif, fontStyle:"italic", fontSize:".94rem",
            color:"#CCC8C0", lineHeight:1.82, border:`1px solid ${p.accent}18`,
            background:`${p.accent}04` }} autoFocus/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:9 }}>
          <div style={{ fontFamily:F.sans, fontSize:".5rem", color:C.textDim,
            opacity:text.trim().split(/\s+/).filter(Boolean).length>0?1:0, transition:"opacity .3s" }}>
            {text.trim().split(/\s+/).filter(Boolean).length} words</div>
          <button onClick={saveEntry} disabled={!text.trim()||saving}
            style={{ ...btnPrimary(p.accent), width:"auto", padding:"8px 20px",
              opacity:text.trim()?1:0.25, fontSize:".54rem" }}>
            {saving?"Saving…":saved?"Saved ✓":"Save"}</button>
        </div>
      </Reveal>

      {/* What did you touch today */}
      <Reveal delay={120}>
        <div style={{ marginTop:22, marginBottom:24 }}>
          <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".76rem",
            color:C.textSub, marginBottom:10 }}>What did you touch today?</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
            {FLOW_ZONES.map(z=>{
              const sel = touchedZones.includes(z.id);
              return (
                <button key={z.id} onClick={()=>setTZ(t=>sel?t.filter(x=>x!==z.id):[...t,z.id])} style={{
                  padding:"6px 14px", border:`1px solid ${sel?z.color+"44":"rgba(255,255,255,0.07)"}`,
                  borderRadius:20, background:sel?`${z.color}10`:"transparent",
                  cursor:"pointer", fontFamily:F.sans, fontSize:".56rem", fontWeight:300,
                  color:sel?z.color:C.textSub, transition:"all .2s",
                }}>{z.emoji} {z.label}</button>
              );
            })}
          </div>
        </div>
      </Reveal>

      {todayEntries.length>0 && (
        <Reveal delay={150}>
          <SectionLabel t="Today"/>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
            {todayEntries.map(e=>(
              <div key={e.id} style={{ padding:"12px 14px", background:"rgba(255,255,255,0.02)",
                border:`1px solid ${p.accent}12`, borderRadius:11 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:".42rem", fontWeight:300, letterSpacing:".2em",
                    textTransform:"uppercase", color:p.accent, opacity:.65 }}>{e.type}</span>
                  <span style={{ fontSize:".44rem", color:C.textDim, marginLeft:"auto" }}>{e.words}w</span>
                  {e.mood&&<span style={{ fontSize:".66rem" }}>{e.mood.emoji}</span>}
                </div>
                <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".76rem",
                  color:C.textSub, lineHeight:1.65, display:"-webkit-box",
                  WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{e.text}</div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {pastEntries.length>0 && (
        <Reveal delay={190}>
          <SectionLabel t="Archive"/>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {pastEntries.map(e=>{
              const ea=prompts[e.type]||prompts.midday;
              return (
                <div key={e.id} style={{ padding:"9px 13px", background:"rgba(255,255,255,0.014)", borderRadius:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:4 }}>
                    <span style={{ fontSize:".42rem", letterSpacing:".18em", textTransform:"uppercase",
                      color:ea.accent, opacity:.5 }}>{e.type}</span>
                    <span style={{ fontSize:".46rem", color:C.textDim, flex:1 }}>{e.dateLabel}</span>
                    <span style={{ fontSize:".4rem", color:"rgba(255,255,255,0.1)" }}>{e.words}w</span>
                    {e.mood&&<span style={{ fontSize:".6rem", opacity:.4 }}>{e.mood.emoji}</span>}
                  </div>
                  <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".7rem",
                    color:C.textDim, lineHeight:1.6, display:"-webkit-box",
                    WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{e.text}</div>
                </div>
              );
            })}
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ─── RECORD (was Log) ─────────────────────────────────────────────────────────
export function RecordScreen({ sessions, setSessions }) {
  const [editing, setEditing]   = useState(null);
  const [editNotes, setEN]      = useState("");
  const [editEvidence, setEE]   = useState("");
  const [confirmDel, setCD]     = useState(null);

  return (
    <div>
      <Reveal><div style={{ marginBottom:28 }}><Eyebrow t="Record"/><PageTitle>The record.</PageTitle></div></Reveal>
      {sessions.length===0&&<Reveal delay={60}><div style={{ fontFamily:F.serif, fontStyle:"italic",
        fontSize:".9rem", color:C.textDim, lineHeight:1.75 }}>No sessions logged yet.</div></Reveal>}
      <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
        {sessions.map((s,i)=>{
          const zone = s.zoneId ? getZone(s.zoneId) : null;
          const isEd = editing===s.id, isDel=confirmDel===s.id;
          return (
            <div key={s.id} style={{ padding:"15px 17px", background:"rgba(255,255,255,0.022)",
              border:"1px solid rgba(255,255,255,0.06)", borderRadius:13,
              animation:`fadeUp .4s ease ${Math.min(i,4)*45}ms both` }}>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:isEd?12:s.notes||s.evidence?10:0 }}>
                <span style={{ fontSize:".8rem" }}>{s.mood?.emoji||"◇"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:F.sans, fontSize:".78rem", fontWeight:300, color:C.text }}>
                    {s.practiceTitle||s.roomId}</div>
                  <div style={{ fontFamily:F.sans, fontSize:".52rem", color:C.textDim, marginTop:1 }}>
                    {s.duration}m · {s.dateLabel}
                    {zone?` · ${zone.emoji} ${zone.label}`:""}
                  </div>
                </div>
                {!isEd&&!isDel&&(
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>{setEditing(s.id);setEN(s.notes||"");setEE(s.evidence||"");}} style={{
                      background:"none", border:"1px solid rgba(255,255,255,0.07)", borderRadius:6,
                      padding:"4px 9px", fontSize:".46rem", letterSpacing:".1em", textTransform:"uppercase",
                      color:C.textSub, cursor:"pointer" }}>Edit</button>
                    <button onClick={()=>setCD(s.id)} style={{ background:"none", border:"none",
                      fontSize:".58rem", color:C.textDim, cursor:"pointer", transition:"color .2s" }}
                      onMouseEnter={e=>e.currentTarget.style.color=C.textSub}
                      onMouseLeave={e=>e.currentTarget.style.color=C.textDim}>✕</button>
                  </div>
                )}
              </div>

              {!isEd&&!isDel&&(
                <>
                  {s.notes&&<div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".8rem",
                    color:"#7A7480", lineHeight:1.72, marginBottom:s.evidence?8:0 }}>{s.notes}</div>}
                  {s.evidence&&<div style={{ fontFamily:F.sans, fontSize:".7rem", fontWeight:300,
                    color:"#8A8490", lineHeight:1.65, borderLeft:"2px solid rgba(255,255,255,0.08)",
                    paddingLeft:10 }}>{s.evidence}</div>}
                  {s.tags?.length>0&&(
                    <div style={{ display:"flex", gap:6, marginTop:8 }}>
                      {s.tags.map(tid=>{
                        const tag=LOG_TAGS.find(t=>t.id===tid);
                        return tag?<span key={tid} style={{ fontSize:".5rem", padding:"3px 9px",
                          border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, color:C.textDim }}>{tag.emoji} {tag.label}</span>:null;
                      })}
                    </div>
                  )}
                </>
              )}

              {isEd&&(
                <div>
                  <textarea value={editNotes} onChange={e=>setEN(e.target.value)}
                    style={{ ...taSt(52), fontFamily:F.serif, fontStyle:"italic", fontSize:".82rem", marginBottom:8 }}/>
                  <textarea value={editEvidence} onChange={e=>setEE(e.target.value)}
                    style={{ ...taSt(44), fontSize:".74rem", marginBottom:10 }}/>
                  <div style={{ display:"flex", gap:7 }}>
                    <button onClick={()=>{setSessions(ss=>ss.map(x=>x.id===s.id?{...x,notes:editNotes,evidence:editEvidence}:x));setEditing(null);}} style={{
                      flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                      borderRadius:8, padding:"8px", fontSize:".54rem", letterSpacing:".12em",
                      textTransform:"uppercase", color:C.text, cursor:"pointer" }}>Save</button>
                    <button onClick={()=>setEditing(null)} style={{ background:"none",
                      border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:"8px 13px",
                      fontSize:".54rem", color:C.textSub, cursor:"pointer" }}>Cancel</button>
                  </div>
                </div>
              )}

              {isDel&&(
                <div style={{ display:"flex", alignItems:"center", gap:9, paddingTop:6 }}>
                  <span style={{ fontFamily:F.sans, fontSize:".62rem", fontWeight:300,
                    color:C.textSub, flex:1 }}>Delete this entry?</span>
                  <button onClick={()=>{setSessions(ss=>ss.filter(x=>x.id!==s.id));setCD(null);}} style={{
                    background:"rgba(220,80,60,0.1)", border:"1px solid rgba(220,80,60,0.2)",
                    borderRadius:7, padding:"5px 12px", fontSize:".5rem", letterSpacing:".1em",
                    textTransform:"uppercase", color:"#E87060", cursor:"pointer" }}>Delete</button>
                  <button onClick={()=>setCD(null)} style={{ background:"none",
                    border:"1px solid rgba(255,255,255,0.07)", borderRadius:7, padding:"5px 10px",
                    fontSize:".5rem", color:C.textSub, cursor:"pointer" }}>Cancel</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REFLECT (was Review) ─────────────────────────────────────────────────────
export function ReflectScreen({ sessions, moodLogs, journalEntries, practices }) {
  const [tab, setTab]     = useState("weekly");
  const [answers, setAnswers] = useState(()=>load("reflect-weekly")||{q1:"",q2:"",q3:"",q4:"",q5:""});
  const [saved, setSaved] = useState(false);

  // Persist answers as they're typed
  useEffect(() => { save("reflect-weekly", answers); }, [answers]);

  const ws  = weekStart();
  const wk  = sessions.filter(s=>new Date(s.date)>=ws);
  const monthS = new Date(); monthS.setDate(1); monthS.setHours(0,0,0,0);
  const mk  = sessions.filter(s=>new Date(s.date)>=monthS);

  const saveReview = () => {
    setSaved(true);
    const review = { id:uid(), type:tab, date:new Date().toISOString(), answers, weekSessions:wk.length };
    const existing = load("reviews")||[];
    save("reviews",[review,...existing]);
    setTimeout(()=>setSaved(false),2000);
  };

  return (
    <div>
      <Reveal><div style={{ marginBottom:28 }}><Eyebrow t="Reflect"/><PageTitle>What the work has built.</PageTitle></div></Reveal>

      <Reveal delay={50}>
        <div style={{ display:"flex", gap:6, marginBottom:26, borderBottom:"1px solid rgba(255,255,255,0.05)", paddingBottom:12 }}>
          {[["weekly","Weekly"],["monthly","Monthly"],["journal","Journal"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ background:"none", border:"none",
              cursor:"pointer", fontFamily:F.sans, fontSize:".54rem", fontWeight:300,
              letterSpacing:".18em", textTransform:"uppercase",
              color:tab===id?C.text:C.textSub, paddingBottom:8,
              borderBottom:`1px solid ${tab===id?C.accent:"transparent"}`, transition:"all .2s" }}>{label}</button>
          ))}
        </div>
      </Reveal>

      {tab==="weekly" && (
        <Reveal delay={70}>
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:24 }}>
              {[{label:"Sessions",val:wk.length},{label:"Evidence",val:wk.filter(s=>s.evidence?.trim()).length},{label:"Days active",val:new Set(wk.map(s=>new Date(s.date).toDateString())).size}].map(s=>(
                <div key={s.label} style={{ padding:"13px 14px", background:"rgba(255,255,255,0.022)",
                  border:"1px solid rgba(255,255,255,0.06)", borderRadius:11 }}>
                  <div style={{ fontFamily:F.serif, fontSize:"1.4rem", fontWeight:300,
                    color:C.text, lineHeight:1, marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:".5rem", fontWeight:300, letterSpacing:".1em", color:C.textDim }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:20 }}>
              {[
                {key:"q1",q:"Where did I feel resistance?"},
                {key:"q2",q:"What moved naturally?"},
                {key:"q3",q:"What wants more of me?"},
                {key:"q4",q:"What did I create?"},
                {key:"q5",q:"What did I experience?"},
              ].map(({key,q})=>(
                <div key={key}>
                  <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".78rem",
                    color:C.textSub, marginBottom:7, lineHeight:1.5 }}>{q}</div>
                  <textarea value={answers[key]} onChange={e=>setAnswers(a=>({...a,[key]:e.target.value}))}
                    style={{ ...taSt(48), fontSize:".8rem" }}/>
                </div>
              ))}
            </div>

            <button onClick={saveReview} style={{ ...btnGhost, display:"inline-block",
              color:saved?"#7EC87E":C.textSub }} className="kora-btn-ghost">
              {saved?"Saved ✓":"Save reflection"}</button>
          </div>
        </Reveal>
      )}

      {tab==="monthly" && (
        <Reveal delay={70}>
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:24 }}>
              {[
                {label:"Total sessions",val:mk.length},
                {label:"Hours logged",val:`${Math.round(mk.reduce((a,s)=>a+s.duration,0)/60*10)/10}h`},
                {label:"Evidence logged",val:mk.filter(s=>s.evidence?.trim()).length},
                {label:"Active practices",val:practices.filter(p=>!p.archived).length},
              ].map(s=>(
                <div key={s.label} style={{ padding:"13px 14px", background:"rgba(255,255,255,0.022)",
                  border:"1px solid rgba(255,255,255,0.06)", borderRadius:11 }}>
                  <div style={{ fontFamily:F.serif, fontSize:"1.4rem", fontWeight:300,
                    color:C.text, lineHeight:1, marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:".5rem", fontWeight:300, letterSpacing:".1em", color:C.textDim }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".82rem",
              color:C.textSub, marginBottom:8 }}>What shifts for next month?</div>
            <textarea style={{ ...taSt(80), fontSize:".82rem", marginBottom:16 }}/>
            <button onClick={saveReview} style={{ ...btnGhost, display:"inline-block",
              color:saved?"#7EC87E":C.textSub }} className="kora-btn-ghost">
              {saved?"Saved ✓":"Save reflection"}</button>
          </div>
        </Reveal>
      )}

      {tab==="journal" && (
        <Reveal delay={70}>
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {journalEntries.length===0&&<div style={{ fontFamily:F.serif, fontStyle:"italic",
              fontSize:".88rem", color:C.textDim }}>No journal entries yet.</div>}
            {journalEntries.map((e,i)=>{
              const accent=e.type==="morning"?"#C4A86A":e.type==="evening"?"#7B8FAE":"#8BA7C4";
              return (
                <div key={e.id} style={{ padding:"13px 15px", background:"rgba(255,255,255,0.018)",
                  border:`1px solid ${accent}12`, borderRadius:12,
                  animation:`fadeUp .35s ease ${Math.min(i,4)*35}ms both` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:".42rem", letterSpacing:".2em", textTransform:"uppercase",
                      color:accent, opacity:.65 }}>{e.type}</span>
                    <span style={{ fontSize:".46rem", color:C.textDim, flex:1 }}>{e.dateLabel}</span>
                    <span style={{ fontSize:".4rem", color:"rgba(255,255,255,0.1)" }}>{e.words}w</span>
                    {e.mood&&<span style={{ fontSize:".6rem", opacity:.4 }}>{e.mood.emoji}</span>}
                  </div>
                  <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".74rem",
                    color:C.textDim, lineHeight:1.65, display:"-webkit-box",
                    WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{e.text}</div>
                </div>
              );
            })}
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ─── SIGNAL ───────────────────────────────────────────────────────────────────
export function SignalScreen({ moodLogs, sessions, practices, profile, memory }) {
  const [tx, setTx]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [received, setReceived] = useState(false);
  const lastMood = moodLogs?.[0];
  const accentColor = lastMood?.color || C.accent;
  const timeOfDay = tod();

  const generate = async () => {
    setLoading(true); setTx(null); setReceived(true);
    const moodCtx = lastMood?`${lastMood.label} ${lastMood.emoji}`:"present";
    try {
      const t = await callKORA(
        [{ role:"user", content:`Generate a transmission for ${timeOfDay}. State: ${moodCtx}. 2–3 sentences, poetic, oriented toward what to feel or do next. No sign-off.` }],
        KORA_SYSTEM + (memory||"")
      );
      setTx(t);
    } catch {
      setTx(TX_FALLBACKS[timeOfDay]||TX_FALLBACKS.morning);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Reveal>
        <div style={{ marginBottom:32 }}>
          <Eyebrow t="Signal" color={`${accentColor}88`}/>
          <PageTitle>Today's transmission.</PageTitle>
          {!received && (
            <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".82rem",
              color:C.textDim, marginTop:8, lineHeight:1.7 }}>
              One moment of quiet before you continue.
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div style={{ minHeight:100, marginBottom:36, display:"flex", alignItems:"center" }}>
          {loading && <Dots color={accentColor}/>}
          {!loading && tx && (
            <div style={{ fontFamily:F.serif, fontStyle:"italic",
              fontSize:"clamp(1rem,1.9vw,1.22rem)", fontWeight:300,
              color:"#CCC8C0", lineHeight:1.85, animation:"fadeUp .6s ease" }}>{tx}</div>
          )}
          {!loading && !tx && !received && (
            <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".88rem",
              color:C.textDim, lineHeight:1.75 }}>Ready when you are.</div>
          )}
        </div>
      </Reveal>

      <Reveal delay={130}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {!received
            ? <button onClick={generate} style={btnPrimary(accentColor)}>Receive</button>
            : <>
                {lastMood && (
                  <div style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 14px",
                    border:`1px solid ${accentColor}22`, borderRadius:20 }}>
                    <span>{lastMood.emoji}</span>
                    <span style={{ fontFamily:F.serif, fontStyle:"italic",
                      fontSize:".68rem", color:C.textSub }}>{lastMood.label}</span>
                  </div>
                )}
                <button onClick={generate} disabled={loading} style={{ ...btnGhost }} className="kora-btn-ghost">
                  New transmission</button>
              </>
          }
        </div>
      </Reveal>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export function ProfileScreen({ profile, setProfile, sessions, moodLogs, onImport }) {
  const [form, setForm]       = useState(profile||{});
  const [saved, setSaved]     = useState(false);
  const [importing, setImp]   = useState(false);
  const [importMsg, setIM]    = useState(null);
  const fileRef = useRef(null);

  const wk = sessions.filter(s=>new Date(s.date)>=weekStart()).length;

  const save_ = () => { setProfile(form); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const handleImport = e => {
    const file = e.target.files?.[0]; if (!file) return;
    setImp(true);
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const raw  = evt.target.result.replace(/^\uFEFF/,"").trim();
        const data = JSON.parse(raw);
        if (typeof data !== "object" || data===null) throw new Error();
        onImport(data); setIM("Imported ✓");
      } catch { setIM("Try again"); }
      finally { setImp(false); setTimeout(()=>setIM(null),3500); e.target.value=""; }
    };
    reader.onerror = ()=>{ setIM("Could not read file"); setImp(false); };
    reader.readAsText(file,"UTF-8");
  };

  return (
    <div>
      <Reveal><div style={{ marginBottom:28 }}><Eyebrow t="Profile"/><PageTitle>{profile?.name||"Creator"}.</PageTitle></div></Reveal>

      {/* Season */}
      {profile?.season && (
        <Reveal delay={50}>
          <div style={{ padding:"13px 18px", background:"rgba(255,255,255,0.02)",
            border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, marginBottom:20,
            borderLeft:`2px solid ${C.accent}44` }}>
            <div style={{ fontSize:".44rem", fontWeight:300, letterSpacing:".24em",
              textTransform:"uppercase", color:`${C.accent}66`, marginBottom:5 }}>Current Season</div>
            <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".88rem",
              color:C.textSub, lineHeight:1.6 }}>"{profile.season}"</div>
          </div>
        </Reveal>
      )}

      {/* Stats */}
      <Reveal delay={70}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:24 }}>
          {[{label:"Sessions this week",val:wk},{label:"Total sessions",val:sessions.length}].map(s=>(
            <div key={s.label} style={{ padding:"13px 14px", background:"rgba(255,255,255,0.022)",
              border:"1px solid rgba(255,255,255,0.06)", borderRadius:11 }}>
              <div style={{ fontFamily:F.serif, fontSize:"1.6rem", fontWeight:300,
                color:C.text, lineHeight:1, marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:".5rem", fontWeight:300, letterSpacing:".1em", color:C.textDim }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Form */}
      <Reveal delay={90}>
        <div style={{ display:"flex", flexDirection:"column", gap:11, marginBottom:22 }}>
          {[
            {label:"Name",key:"name",placeholder:"Your name"},
            {label:"Current Season",key:"season",placeholder:"e.g. Embodied Creative Era"},
            {label:"Current Focus",key:"currentFocus",placeholder:"What's the main project right now?"},
          ].map(f=>(
            <div key={f.key}>
              <div style={{ fontSize:".46rem", fontWeight:300, letterSpacing:".2em",
                textTransform:"uppercase", color:C.textDim, marginBottom:6 }}>{f.label}</div>
              <input value={form[f.key]||""} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}
                placeholder={f.placeholder} style={iSt}/>
            </div>
          ))}
          <div>
            <div style={{ fontSize:".46rem", fontWeight:300, letterSpacing:".2em",
              textTransform:"uppercase", color:C.textDim, marginBottom:7 }}>Creator Type</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {CREATOR_TYPES.map(t=>(
                <button key={t} onClick={()=>setForm(f=>({...f,creatorType:t}))} style={{
                  padding:"6px 13px", border:`1px solid ${form.creatorType===t?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.07)"}`,
                  borderRadius:20, background:form.creatorType===t?"rgba(255,255,255,0.07)":"transparent",
                  cursor:"pointer", fontFamily:F.sans, fontSize:".56rem", fontWeight:300,
                  color:form.creatorType===t?C.text:C.textSub, transition:"all .2s" }}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:".46rem", fontWeight:300, letterSpacing:".2em",
              textTransform:"uppercase", color:C.textDim, marginBottom:6 }}>Creative Vision</div>
            <textarea value={form.creativeGoals||""} onChange={e=>setForm(p=>({...p,creativeGoals:e.target.value}))}
              placeholder="What are you building toward?"
              style={{ ...taSt(72), fontFamily:F.serif, fontStyle:"italic" }}/>
          </div>
        </div>

        <div style={{ display:"flex", gap:9, marginBottom:9 }}>
          <button onClick={save_} style={{ flex:1, background:"rgba(255,255,255,0.055)",
            border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"11px",
            fontFamily:F.sans, fontSize:".58rem", fontWeight:300, letterSpacing:".18em",
            textTransform:"uppercase", color:saved?"#7EC87E":C.text, cursor:"pointer",
            transition:"all .3s" }}>{saved?"Saved ✓":"Save changes"}</button>
          <button onClick={exportData} style={{ ...btnGhost, padding:"11px 18px" }}
            className="kora-btn-ghost" title="Export all data">Export</button>
        </div>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display:"none" }}/>
        <button onClick={()=>fileRef.current?.click()} disabled={importing} style={{
          width:"100%", background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.08)",
          borderRadius:10, padding:"11px", fontFamily:F.sans, fontSize:".56rem", fontWeight:300,
          letterSpacing:".16em", textTransform:"uppercase",
          color:importMsg?.includes("✓")?"#7EC87E":importMsg?"#E8906A":C.textDim,
          cursor:"pointer", transition:"all .3s" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.18)"}
          onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>
          {importing?"Reading…":importMsg||"Import backup (JSON)"}</button>
      </Reveal>
    </div>
  );
}
