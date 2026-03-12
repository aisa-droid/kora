// ─────────────────────────────────────────────────────────────────────────────
// KORA v8.1.1 — Part 1 of 2
// Constants · Storage · API · Helpers · Style atoms
// Onboarding · MoodOverlay · SessionMode · RoomDetail
// ─────────────────────────────────────────────────────────────────────────────
//
// VERCEL PROXY — create /api/kora.js in your project root:
//
//   export default async function handler(req, res) {
//     if (req.method !== "POST") return res.status(405).end();
//     const response = await fetch("https://api.anthropic.com/v1/messages", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "anthropic-version": "2023-06-01",
//         "x-api-key": process.env.ANTHROPIC_API_KEY,
//       },
//       body: JSON.stringify(req.body),
//     });
//     const data = await response.json();
//     res.status(response.status).json(data);
//   }
//
// Then set ANTHROPIC_API_KEY in your Vercel environment variables.
// The callKORA() function below already points to "/api/kora".
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

// ─── API ──────────────────────────────────────────────────────────────────────
export async function callKORA(messages, system) {
  try {
    const res = await fetch("/api/kora", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: system || KORA_SYSTEM,
        messages: messages.slice(-12),
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.content?.[0]?.text || "I'm here with you.";
  } catch (err) {
    console.warn("KORA API:", err.message);
    throw err;
  }
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
export const save = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};
export const load = (k, fb = null) => {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; }
};

// Export all data as JSON for user ownership
export const exportData = () => {
  const keys = ["kora-profile","goals","sessions","mood-logs","journal-entries","milestones","reviews"];
  const data = {};
  keys.forEach(k => { data[k] = load(k); });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `kora-export-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(url);
};

// ─── PROMPTS ──────────────────────────────────────────────────────────────────
export const KORA_SYSTEM = `You are KORA — a Creative Operating System for disciplined creators.
Voice: calm, direct, poetic. You support real creative work, not just feelings about it.
Rules: Mirror state briefly then orient toward action. Never shame. 3–4 sentences max.
One soft invitation at the end. Never use "just" or "simply".`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const MOODLETS = [
  { id:"flow",       emoji:"🌊", label:"Flow",      color:"#7ECFCF", dark:"#0a2020" },
  { id:"drive",      emoji:"🔥", label:"Drive",     color:"#E8906A", dark:"#200e06" },
  { id:"joy",        emoji:"🌈", label:"Joy",       color:"#F0C97A", dark:"#2a2008" },
  { id:"soft",       emoji:"🌸", label:"Soft",      color:"#E4AACA", dark:"#2c1422" },
  { id:"dreamy",     emoji:"☁️", label:"Dreamy",    color:"#B8ACD6", dark:"#161228" },
  { id:"melancholy", emoji:"🌧", label:"Fog",       color:"#90B4CC", dark:"#0c1418" },
  { id:"anxiety",    emoji:"🌀", label:"Overwhelm", color:"#A89EC8", dark:"#141020" },
  { id:"numb",       emoji:"🧊", label:"Shutdown",  color:"#8EC4D4", dark:"#0a1820" },
];

export const MOOD_FALLBACKS = {
  flow:       "You're moving with something alive. Let that current carry you into the work.",
  drive:      "Real fire today. Aim it at the one thing that matters most before you begin.",
  joy:        "Something is open. Joy is alignment — take that into the work.",
  soft:       "Softness is a creative condition. Begin slowly. The session will find its rhythm.",
  dreamy:     "The dreamy state often precedes breakthrough. Let the ambiguity live inside the work.",
  melancholy: "Fog can carry depth. The work doesn't require you to feel ready — only to show up.",
  anxiety:    "That aliveness can become fuel. One breath, one task, one hour. That's enough.",
  numb:       "The work doesn't ask for full presence — just your hands and a small window of time.",
};

export const TX_FALLBACKS = {
  morning: {
    default:"New cycle. Before the world arrives — what does the work need from you today?",
    flow:"The channel is clear. Something wants to move through you.",
    drive:"Engines warm. Name your one target before the world loads.",
    anxiety:"Scattered signal. One breath, then the first small move.",
    melancholy:"Not every day needs fire. The quiet work still counts.",
    numb:"Just show up to the desk. That alone is enough.",
  },
  midday: {
    default:"Midday check. Push, pause, or recalibrate?",
    flow:"Is the current carrying you, or are you forcing it?",
    drive:"Make sure the energy is aimed at what matters.",
    anxiety:"One minute of quiet before you continue.",
    melancholy:"You don't have to be lighter by evening.",
    numb:"You've made it to midday. That counts.",
  },
  evening: {
    default:"What moved forward today — even one small thing?",
    flow:"What did the current carry forward? Name it.",
    drive:"What did today's fire build?",
    anxiety:"Whatever the day held, you moved through it.",
    melancholy:"The day had weight. It doesn't need to resolve.",
    numb:"The quietest work still mattered.",
  },
};

export const ROOMS = [
  { id:"flow",      emoji:"🌊", name:"Flow Room",      purpose:"Deep creative work",    color:"#7ECFCF", dark:"#060f0f", gradient:"radial-gradient(ellipse at 30% 40%,#0d2828 0%,#060a0a 100%)", ritual:"You're in the current. Stay in the wave.",        tags:["Deep Focus","Instrumental","Ambient"],  spotifyId:"37i9dQZF1DX8NTLI2TtZa6" },
  { id:"spark",     emoji:"🔥", name:"Spark Room",     purpose:"Activation & drive",    color:"#E8906A", dark:"#0e0604", gradient:"radial-gradient(ellipse at 40% 30%,#2c1208 0%,#080400 100%)", ritual:"Your engines are warm. Pick one target.",          tags:["Energizing","Rhythmic","Ignition"],     spotifyId:"37i9dQZF1DX76Wlfdnj7AP" },
  { id:"fog",       emoji:"🌧", name:"Fog Room",       purpose:"Slow emotional work",   color:"#90B4CC", dark:"#060c10", gradient:"radial-gradient(ellipse at 50% 60%,#0e1820 0%,#060808 100%)", ritual:"No mission. Just presence.",                      tags:["Soft Piano","Emotional","Acoustic"],   spotifyId:"37i9dQZF1DX7gIoKXt0gmx" },
  { id:"grounding", emoji:"🌀", name:"Grounding Room", purpose:"Anxiety reset",         color:"#A89EC8", dark:"#080610", gradient:"radial-gradient(ellipse at 60% 30%,#161222 0%,#060508 100%)", ritual:"Feet on the floor. One breath in, one out.",      tags:["Slow Ambient","Nature","Breath"],      spotifyId:"37i9dQZF1DWZqd5JICZI0u" },
  { id:"night",     emoji:"🌙", name:"Night Room",     purpose:"Reflection & shutdown", color:"#6B7FAE", dark:"#04060c", gradient:"radial-gradient(ellipse at 50% 20%,#0c1022 0%,#040406 100%)", ritual:"The mission rests now.",                          tags:["Deep Ambient","Sound Bath","Sleep"],   spotifyId:"37i9dQZF1DWZd79rJ6a7lp" },
];

export const MOOD_TO_ROOM = {
  flow:"flow", drive:"spark", joy:"spark",
  soft:"fog",  dreamy:"flow", melancholy:"fog",
  anxiety:"grounding", numb:"grounding",
};

export const GOAL_CATEGORIES = [
  { id:"creative", label:"Creative", color:"#E4AACA", icon:"✦" },
  { id:"learning", label:"Learning", color:"#B8ACD6", icon:"◎" },
  { id:"health",   label:"Health",   color:"#7ECFCF", icon:"◌" },
  { id:"life",     label:"Life",     color:"#F0C97A", icon:"◇" },
  { id:"business", label:"Business", color:"#E8906A", icon:"◈" },
];

export const FREQUENCIES = [
  { id:"daily",    label:"Daily",    sub:"Every day"     },
  { id:"weekday",  label:"Weekdays", sub:"Mon – Fri"     },
  { id:"weekly",   label:"Weekly",   sub:"Once a week"   },
  { id:"freeform", label:"Freeform", sub:"When I choose" },
];

export const GOAL_SUGGESTIONS = [
  { title:"Photography",         category:"creative", emoji:"📷" },
  { title:"Drawing & Sketching", category:"creative", emoji:"✏️" },
  { title:"Writing",             category:"creative", emoji:"📝" },
  { title:"Music Practice",      category:"creative", emoji:"🎸" },
  { title:"Painting",            category:"creative", emoji:"🎨" },
  { title:"Reading",             category:"learning", emoji:"📚" },
  { title:"Language Learning",   category:"learning", emoji:"🌐" },
  { title:"Business Dev",        category:"business", emoji:"💡" },
  { title:"Exercise",            category:"health",   emoji:"🏃" },
  { title:"Meditation",          category:"health",   emoji:"🧘" },
];

export const CREATOR_TYPES = ["Photographer","Filmmaker","Visual Artist","Illustrator","Designer","Writer","Musician","Other"];
export const SESSION_DURATIONS = [{ mins:25,label:"25" },{ mins:45,label:"45" },{ mins:60,label:"60" },{ mins:90,label:"90" }];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const tod        = () => { const h=new Date().getHours(); return h<12?"morning":h<17?"midday":"evening"; };
export const greet      = () => { const h=new Date().getHours(); return h<12?"Good morning":h<17?"Good afternoon":"Good evening"; };
export const fmtTime    = s  => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
export const todayStr   = () => new Date().toDateString();
export const weekStart  = () => { const d=new Date(); d.setDate(d.getDate()-d.getDay()); d.setHours(0,0,0,0); return d; };
export const monthStart = () => { const d=new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; };
export const uid        = () => `${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
export const getCat     = id => GOAL_CATEGORIES.find(c=>c.id===id) || GOAL_CATEGORIES[0];
export const getRoom    = id => ROOMS.find(r=>r.id===id) || ROOMS[0];

export const getMoodPattern = logs => {
  if (!logs?.length) return null;
  const c={};
  logs.slice(0,7).forEach(l => { c[l.moodId]=(c[l.moodId]||0)+1; });
  return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;
};

export const todayGoals = goals => {
  const day=new Date().getDay(), isWeekday=day>=1&&day<=5;
  return goals.filter(g => {
    if (g.archived) return false;
    if (g.targetFrequency==="daily") return true;
    if (g.targetFrequency==="weekday") return isWeekday;
    return true; // freeform + weekly always show
  });
};

export const computeMetrics = (goals, sessions) => {
  const ws=weekStart(), ms=monthStart();
  const active       = goals.filter(g=>!g.archived);
  const weekSessions = sessions.filter(s=>new Date(s.date)>=ws);
  const monthSessions= sessions.filter(s=>new Date(s.date)>=ms);
  let planned=0, done=0;
  active.forEach(g => {
    const t = g.targetFrequency==="daily"?7 : g.targetFrequency==="weekday"?5 : 1;
    planned += t;
    done    += Math.min(weekSessions.filter(s=>s.goalId===g.id).length, t);
  });
  return {
    weekSessions, monthSessions,
    integrity:    planned>0 ? Math.round((done/planned)*100) : null,
    avgDuration:  weekSessions.length ? Math.round(weekSessions.reduce((a,s)=>a+s.duration,0)/weekSessions.length) : 0,
    weekEvidence: weekSessions.filter(s=>s.evidence?.trim()).length,
    activeGoals:  active,
  };
};

export const buildMemory = (moodLogs, sessions, goals, profile) => {
  const p=[];
  if (moodLogs?.length)       p.push(`Recent moods: ${moodLogs.slice(0,4).map(l=>`${l.emoji} ${l.label}`).join(", ")}.`);
  if (sessions?.length)       p.push(`Recent sessions: ${sessions.slice(0,3).map(s=>`${s.goalTitle||"session"} ${s.duration}min`).join(", ")}.`);
  const ag = goals?.filter(g=>!g.archived);
  if (ag?.length)             p.push(`Goals: ${ag.map(g=>g.title).join(", ")}.`);
  if (profile?.name)          p.push(`Name: ${profile.name}.`);
  if (profile?.creativeGoals) p.push(`Vision: "${profile.creativeGoals.slice(0,80)}".`);
  return p.length ? `\n\n[KORA MEMORY]\n${p.join(" ")}` : "";
};

// ─── STYLE ATOMS ──────────────────────────────────────────────────────────────
export const chipSt = active => ({
  padding:"7px 14px",
  border:`1px solid ${active?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.07)"}`,
  borderRadius:20, background:active?"rgba(255,255,255,0.07)":"transparent",
  cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:".6rem",
  fontWeight:300, letterSpacing:".1em", color:active?"#EEE9E0":"#5A5760", transition:"all .2s",
});
export const iSt = {
  width:"100%", background:"rgba(255,255,255,0.038)",
  border:"1px solid rgba(255,255,255,0.09)", borderRadius:11,
  padding:"12px 16px", fontFamily:"'DM Sans',sans-serif",
  fontSize:".86rem", fontWeight:300, color:"#EEE9E0", outline:"none",
};
export const taSt = (h=80) => ({ ...iSt, resize:"none", minHeight:h, lineHeight:1.7 });

export const Dots = ({ color="#555" }) => (
  <span style={{ display:"inline-flex",gap:5,alignItems:"center" }}>
    {[0,1,2].map(i=>(
      <span key={i} style={{ display:"inline-block",width:5,height:5,borderRadius:"50%",background:color,animation:`kdot 1.3s ease-in-out ${i*0.18}s infinite` }}/>
    ))}
  </span>
);

export const Ey = ({ t, c="rgba(228,170,202,0.78)" }) => (
  <div style={{ fontSize:".46rem",fontWeight:300,letterSpacing:".35em",textTransform:"uppercase",color:c,marginBottom:5 }}>{t}</div>
);

export const PT = ({ children }) => (
  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.4rem,2.1vw,1.82rem)",fontWeight:300,color:"#EEE9E0",lineHeight:1.22 }}>{children}</div>
);

export const SL = ({ t }) => (
  <div style={{ fontSize:".46rem",fontWeight:300,letterSpacing:".28em",textTransform:"uppercase",color:"#5A5760",marginBottom:9 }}>{t}</div>
);

export function Reveal({ children, delay=0 }) {
  const [vis,setVis]=useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setVis(true),80+delay); return()=>clearTimeout(t); },[]);
  return (
    <div style={{ opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:`all .5s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
export function OnboardingScreen({ onComplete }) {
  const [step,setStep]   = useState(0);
  const [vis,setVis]     = useState(false);
  const [name,setName]   = useState("");
  const [picked,setPicked] = useState([]);
  const [custom,setCustom] = useState("");
  const [freq,setFreq]   = useState("daily");
  const [vision,setVision] = useState("");

  useEffect(()=>{ const t=setTimeout(()=>setVis(true),80); return()=>clearTimeout(t); },[step]);
  const advance = () => { setVis(false); setTimeout(()=>setStep(s=>s+1),260); };
  const toggle  = title => setPicked(p=>p.includes(title)?p.filter(x=>x!==title):[...p,title]);

  const finish = () => {
    const goalObjects = [];
    picked.forEach(title => {
      const sg  = GOAL_SUGGESTIONS.find(s=>s.title===title);
      const cat = getCat(sg?.category||"creative");
      goalObjects.push({ id:`goal_${uid()}`,title,category:sg?.category||"creative",targetFrequency:freq,color:cat.color,createdAt:new Date().toISOString(),archived:false });
    });
    if (custom.trim()) goalObjects.push({ id:`goal_${uid()}`,title:custom.trim(),category:"creative",targetFrequency:freq,color:"#E4AACA",createdAt:new Date().toISOString(),archived:false });
    onComplete({ name:name.trim(), creativeGoals:vision.trim(), goals:goalObjects });
  };

  const canGo  = step===0 ? name.trim().length>0 : true;
  const titles = ["Welcome.","What are you working on?","How often will you practice?","One final question."];

  return (
    <div style={{ minHeight:"100vh",background:"#07070f",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px" }}>
      <div style={{ position:"fixed",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,#E4AACA0d 0%,transparent 70%)",top:"-110px",right:"-110px",pointerEvents:"none" }}/>
      <div style={{ position:"fixed",width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle,#B8ACD608 0%,transparent 70%)",bottom:"-80px",left:"-80px",pointerEvents:"none" }}/>

      <div style={{ maxWidth:460,width:"100%",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:"all .5s ease" }}>
        <div style={{ textAlign:"center",marginBottom:50 }}>
          <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.9rem",fontWeight:300,letterSpacing:".46em",color:"#EEE9E0",marginBottom:7 }}>KORA</div>
          <div style={{ fontSize:".42rem",fontWeight:300,letterSpacing:".32em",textTransform:"uppercase",color:"#1e1c28" }}>Creative Operating System</div>
        </div>

        {/* Progress dots */}
        <div style={{ display:"flex",gap:7,justifyContent:"center",marginBottom:46 }}>
          {titles.map((_,i)=>(
            <div key={i} style={{ width:i===step?22:6,height:6,borderRadius:3,background:i===step?"#E4AACA":i<step?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.05)",transition:"all .35s" }}/>
          ))}
        </div>

        <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.35rem,2.7vw,1.8rem)",fontWeight:300,color:"#EEE9E0",lineHeight:1.3,marginBottom:5 }}>{titles[step]}</div>

        {step===0 && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".9rem",color:"#5A5760",marginBottom:28,marginTop:5 }}>What shall I call you?</div>
            <input autoFocus placeholder="Your name…" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&canGo&&advance()} style={iSt}/>
            <p style={{ fontSize:".68rem",fontWeight:300,color:"#1e1c28",lineHeight:1.78,marginTop:16 }}>KORA helps you align, do real work, and reflect. Two to four minutes a day — then you leave the phone.</p>
          </div>
        )}

        {step===1 && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".86rem",color:"#5A5760",marginBottom:22,marginTop:5 }}>Choose the goals that matter right now.</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:14 }}>
              {GOAL_SUGGESTIONS.map(sg => {
                const sel=picked.includes(sg.title), cat=getCat(sg.category);
                return (
                  <button key={sg.title} onClick={()=>toggle(sg.title)} style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 13px",border:`1px solid ${sel?cat.color+"55":"rgba(255,255,255,0.07)"}`,borderRadius:11,background:sel?`${cat.color}10`:"rgba(255,255,255,0.018)",cursor:"pointer",textAlign:"left",transition:"all .2s" }}>
                    <span style={{ fontSize:"1.05rem",flexShrink:0 }}>{sg.emoji}</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".7rem",fontWeight:300,color:sel?"#EEE9E0":"#5A5760",transition:"color .2s" }}>{sg.title}</span>
                  </button>
                );
              })}
            </div>
            <input placeholder="Or add your own…" value={custom} onChange={e=>setCustom(e.target.value)} style={iSt}/>
          </div>
        )}

        {step===2 && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".86rem",color:"#5A5760",marginBottom:24,marginTop:5 }}>Sets your default rhythm. Adjustable per goal.</div>
            <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
              {FREQUENCIES.map(f=>(
                <button key={f.id} onClick={()=>setFreq(f.id)} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",border:`1px solid ${freq===f.id?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.07)"}`,borderRadius:12,background:freq===f.id?"rgba(255,255,255,0.06)":"transparent",cursor:"pointer",transition:"all .2s" }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".82rem",fontWeight:300,color:freq===f.id?"#EEE9E0":"#5A5760" }}>{f.label}</span>
                  <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".62rem",fontWeight:300,color:"#3A3840" }}>{f.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step===3 && (
          <div style={{ animation:"fadeUp .4s ease" }}>
            <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".86rem",color:"#5A5760",marginBottom:24,marginTop:5 }}>What are you building toward?</div>
            <textarea placeholder="A body of work, a skill, a series — your longer horizon…" value={vision} onChange={e=>setVision(e.target.value)} style={{ ...taSt(96),fontFamily:"'Playfair Display',serif",fontStyle:"italic" }}/>
            <div style={{ marginTop:8,fontSize:".56rem",fontWeight:300,color:"#1e1c28",lineHeight:1.7 }}>Shapes your transmissions and long-term review.</div>
          </div>
        )}

        <button onClick={()=>step<3?advance():finish()} disabled={!canGo} style={{ width:"100%",marginTop:26,background:canGo?"#E4AACA":"rgba(255,255,255,0.04)",border:"none",borderRadius:12,padding:"13px",fontFamily:"'DM Sans',sans-serif",fontSize:".64rem",fontWeight:300,letterSpacing:".24em",textTransform:"uppercase",color:canGo?"#07070f":"#2A2830",cursor:canGo?"pointer":"default",transition:"all .3s" }}>
          {step<3 ? "Continue" : "Enter KORA"}
        </button>
      </div>
    </div>
  );
}

// ─── MOOD OVERLAY ─────────────────────────────────────────────────────────────
// v9 pattern: 1 tap → instant save + close. Zero blocking steps.
export function MoodOverlay({ onSaveMood, onClose }) {
  const [entered,setEntered] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setEntered(true),60); return()=>clearTimeout(t); },[]);

  const selectMood = m => {
    onSaveMood({ id:Date.now(),moodId:m.id,label:m.label,emoji:m.emoji,color:m.color,date:new Date().toISOString() });
    onClose();
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:70,background:"rgba(5,5,12,0.97)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",opacity:entered?1:0,transition:"opacity .4s" }}>
      <div style={{ maxWidth:480,width:"100%",position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute",top:-38,right:0,background:"none",border:"none",cursor:"pointer",fontSize:".5rem",letterSpacing:".2em",textTransform:"uppercase",color:"#222028",fontFamily:"'DM Sans',sans-serif",transition:"color .2s" }} onMouseEnter={e=>e.currentTarget.style.color="#5A5760"} onMouseLeave={e=>e.currentTarget.style.color="#222028"}>Close</button>
        <div style={{ animation:"fadeUp .4s ease" }}>
          <div style={{ marginBottom:28 }}>
            <Ey t="Morning Alignment"/>
            <PT>How are you arriving today?</PT>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9 }}>
            {MOODLETS.map(m=>(
              <button key={m.id} onClick={()=>selectMood(m)} style={{ border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,background:"rgba(255,255,255,0.014)",padding:"16px 7px",display:"flex",flexDirection:"column",alignItems:"center",gap:7,cursor:"pointer",transition:"all .24s" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.borderColor=`${m.color}44`; e.currentTarget.style.background=`${m.color}0a`; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"; e.currentTarget.style.background="rgba(255,255,255,0.014)"; }}>
                <span style={{ fontSize:"1.5rem" }}>{m.emoji}</span>
                <span style={{ fontSize:".44rem",fontWeight:300,letterSpacing:".14em",textTransform:"uppercase",color:"#3A3840" }}>{m.label}</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop:20,fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".72rem",color:"#1a1828",lineHeight:1.7,textAlign:"center" }}>
            Select your state. The rest will follow.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SESSION MODE ─────────────────────────────────────────────────────────────
// THE SPINE: mood → goal → room → timer → ambient KORA → log
// Timer starts on one tap. Reflection fires in background while phone is down.
// Session persists in sessionStorage so a refresh doesn't lose progress.
export function SessionMode({ preselectedGoal, goals, moodLogs, onComplete, onDismiss, memory }) {
  const lastMood    = moodLogs?.[0];
  const activeGoals = goals.filter(g=>!g.archived);

  // Persist active session across refresh
  const [phase,setPhase]           = useState(()=>sessionStorage.getItem("ks-phase")||"setup");
  const [selGoal,setSelGoal]       = useState(()=>{ try { return JSON.parse(sessionStorage.getItem("ks-goal"))||preselectedGoal||null; } catch { return preselectedGoal||null; } });
  const [selRoom,setSelRoom]       = useState(()=>{ try { return JSON.parse(sessionStorage.getItem("ks-room"))||null; } catch { return null; } });
  const [duration,setDuration]     = useState(()=>Number(sessionStorage.getItem("ks-dur"))||45);
  const [startedAt,setStartedAt]   = useState(()=>Number(sessionStorage.getItem("ks-start"))||null);
  const [timeLeft,setTimeLeft]     = useState(null);
  const [notes,setNotes]           = useState("");
  const [evidence,setEvidence]     = useState("");
  const [refl,setRefl]             = useState(null);
  const [reflLoading,setReflLoading] = useState(false);
  const [entered,setEntered]       = useState(false);
  const timerRef = useRef(null);

  useEffect(()=>{ const t=setTimeout(()=>setEntered(true),60); return()=>clearTimeout(t); },[]);

  // Auto-suggest room from mood
  useEffect(()=>{
    if (lastMood && !selRoom) {
      const rid = MOOD_TO_ROOM[lastMood.moodId];
      if (rid) setSelRoom(getRoom(rid));
    }
  },[]);

  // Restore timer if page was refreshed mid-session
  useEffect(()=>{
    if (phase==="active" && startedAt) {
      const elapsed   = Math.floor((Date.now()-startedAt)/1000);
      const remaining = duration*60 - elapsed;
      if (remaining > 0) {
        setTimeLeft(remaining);
        timerRef.current = setInterval(()=>{
          setTimeLeft(t=>{ if(t<=1){clearInterval(timerRef.current);setPhase("log");sessionStorage.setItem("ks-phase","log");return 0;} return t-1; });
        },1000);
      } else {
        setPhase("log"); sessionStorage.setItem("ks-phase","log");
      }
    }
    return ()=>clearInterval(timerRef.current);
  },[]);

  const persistGoal = g => { setSelGoal(g); sessionStorage.setItem("ks-goal",JSON.stringify(g)); };
  const persistRoom = r => { setSelRoom(r); sessionStorage.setItem("ks-room",JSON.stringify(r)); };

  const startSession = () => {
    if (!selGoal) return;
    const now = Date.now();
    setStartedAt(now); sessionStorage.setItem("ks-start",now);
    setDuration(duration); sessionStorage.setItem("ks-dur",duration);
    setTimeLeft(duration*60);
    setPhase("active"); sessionStorage.setItem("ks-phase","active");

    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>{ if(t<=1){clearInterval(timerRef.current);setPhase("log");sessionStorage.setItem("ks-phase","log");return 0;} return t-1; });
    },1000);

    // Fire KORA reflection non-blocking — user is already putting phone down
    setReflLoading(true);
    const moodCtx = lastMood?`${lastMood.label} ${lastMood.emoji}`:"present";
    callKORA([{ role:"user",content:`I'm beginning a ${duration}-minute session on "${selGoal.title}" in the ${selRoom?.name||"work space"}. My state: ${moodCtx}. Brief ambient reflection as I begin.` }], KORA_SYSTEM+(memory||""))
      .then(r=>{setRefl(r);setReflLoading(false);})
      .catch(()=>{setRefl(MOOD_FALLBACKS[lastMood?.moodId]||"The work begins now. Let it move through you.");setReflLoading(false);});
  };

  const endEarly = () => {
    clearInterval(timerRef.current);
    const elapsed = startedAt ? Math.floor((Date.now()-startedAt)/1000/60) : duration;
    setDuration(Math.max(5,elapsed));
    setPhase("log"); sessionStorage.setItem("ks-phase","log");
  };

  const finish = () => {
    // Clear session persistence
    ["ks-phase","ks-goal","ks-room","ks-dur","ks-start"].forEach(k=>sessionStorage.removeItem(k));
    onComplete({
      id:uid(), date:new Date().toISOString(),
      dateLabel:new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}),
      goalId:selGoal?.id, goalTitle:selGoal?.title, goalCategory:selGoal?.category,
      roomId:selRoom?.id, duration, notes, evidence,
      mood:lastMood?{id:lastMood.moodId,emoji:lastMood.emoji,label:lastMood.label,color:lastMood.color}:null,
    });
  };

  const pct       = timeLeft!==null?(1-timeLeft/(duration*60))*100:0;
  const roomColor = selRoom?.color||"#B8ACD6";

  return (
    <div style={{ position:"fixed",inset:0,zIndex:60,background:"#060610",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:entered?1:0,transition:"opacity 0.5s",padding:"24px",overflowY:"auto" }}>
      <div style={{ position:"fixed",width:460,height:460,borderRadius:"50%",background:`radial-gradient(circle,${roomColor}0e 0%,transparent 70%)`,top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none" }}/>
      <div style={{ position:"relative",zIndex:1,maxWidth:440,width:"100%",textAlign:"center" }}>

        {/* ── SETUP ── */}
        {phase==="setup" && (
          <div style={{ animation:"fadeUp .45s ease" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32 }}>
              <Ey t="Session"/>
              <button onClick={onDismiss} style={{ background:"none",border:"none",cursor:"pointer",fontSize:".5rem",letterSpacing:".18em",textTransform:"uppercase",color:"#1e1828",fontFamily:"'DM Sans',sans-serif",transition:"color .2s" }} onMouseEnter={e=>e.currentTarget.style.color="#5A5760"} onMouseLeave={e=>e.currentTarget.style.color="#1e1828"}>Cancel</button>
            </div>

            {/* Goal */}
            <div style={{ marginBottom:24,textAlign:"left" }}>
              <SL t="What are you working on?"/>
              {activeGoals.length===0
                ? <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".78rem",color:"#3A3840",padding:"12px 0" }}>No active goals. Add one in Goals first.</div>
                : <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                  {activeGoals.map(g=>{
                    const cat=getCat(g.category), sel=selGoal?.id===g.id;
                    return (
                      <button key={g.id} onClick={()=>persistGoal(g)} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",border:`1px solid ${sel?cat.color+"55":"rgba(255,255,255,0.07)"}`,borderRadius:12,background:sel?`${cat.color}10`:"rgba(255,255,255,0.018)",cursor:"pointer",textAlign:"left",transition:"all .2s" }}>
                        <span style={{ fontSize:".7rem",color:cat.color,opacity:sel?1:.5 }}>{cat.icon}</span>
                        <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".8rem",fontWeight:300,color:sel?"#EEE9E0":"#5A5760",flex:1,transition:"color .2s" }}>{g.title}</span>
                        {sel && <span style={{ fontSize:".42rem",letterSpacing:".2em",textTransform:"uppercase",color:cat.color }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              }
            </div>

            {/* Room */}
            <div style={{ marginBottom:24,textAlign:"left" }}>
              <SL t="Choose your space"/>
              <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
                {ROOMS.map(r=>{
                  const sel=selRoom?.id===r.id;
                  const suggested=lastMood&&MOOD_TO_ROOM[lastMood.moodId]===r.id;
                  return (
                    <button key={r.id} onClick={()=>persistRoom(r)} style={{ display:"flex",alignItems:"center",gap:7,padding:"8px 14px",border:`1px solid ${sel?r.color+"55":suggested?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.06)"}`,borderRadius:20,background:sel?`${r.color}10`:suggested?"rgba(255,255,255,0.025)":"transparent",cursor:"pointer",transition:"all .2s" }}>
                      <span style={{ fontSize:".86rem" }}>{r.emoji}</span>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".6rem",fontWeight:300,color:sel?r.color:suggested?"rgba(255,255,255,0.5)":"#3A3840",transition:"color .2s" }}>{r.name.split(" ")[0]}</span>
                      {suggested&&!sel&&<span style={{ fontSize:".36rem",color:"rgba(255,255,255,0.22)" }}>✦</span>}
                    </button>
                  );
                })}
              </div>
              {selRoom && <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".7rem",color:"#2A2830",marginTop:9,paddingLeft:2 }}>"{selRoom.ritual}"</div>}
            </div>

            {/* Duration */}
            <div style={{ marginBottom:32,textAlign:"left" }}>
              <SL t="Duration (minutes)"/>
              <div style={{ display:"flex",gap:8 }}>
                {SESSION_DURATIONS.map(d=>(
                  <button key={d.mins} onClick={()=>setDuration(d.mins)} style={{ flex:1,padding:"10px 0",border:`1px solid ${duration===d.mins?"rgba(255,255,255,0.22)":"rgba(255,255,255,0.07)"}`,borderRadius:10,background:duration===d.mins?"rgba(255,255,255,0.07)":"transparent",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",fontWeight:300,color:duration===d.mins?"#EEE9E0":"#4A4650",transition:"all .2s" }}>{d.label}</button>
                ))}
              </div>
            </div>

            <button onClick={startSession} disabled={!selGoal} style={{ width:"100%",background:selGoal?"#E4AACA":"rgba(255,255,255,0.04)",border:"none",borderRadius:13,padding:"15px",fontFamily:"'DM Sans',sans-serif",fontSize:".66rem",fontWeight:300,letterSpacing:".26em",textTransform:"uppercase",color:selGoal?"#07070f":"#2A2830",cursor:selGoal?"pointer":"default",transition:"all .3s" }}>
              Begin Session
            </button>
          </div>
        )}

        {/* ── ACTIVE ── */}
        {phase==="active" && (
          <div style={{ animation:"fadeUp .45s ease" }}>
            {/* Timer ring */}
            <div style={{ position:"relative",width:200,height:200,margin:"0 auto 32px" }}>
              <svg viewBox="0 0 100 100" style={{ width:"100%",height:"100%",transform:"rotate(-90deg)" }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5"/>
                <circle cx="50" cy="50" r="44" fill="none" stroke={roomColor} strokeWidth="1.5" strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*44}`}
                  strokeDashoffset={`${2*Math.PI*44*(1-pct/100)}`}
                  style={{ transition:"stroke-dashoffset 1s linear",opacity:.55 }}/>
              </svg>
              <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:"2.2rem",fontWeight:200,letterSpacing:".08em",color:"#EEE9E0",lineHeight:1 }}>{fmtTime(timeLeft||0)}</div>
                <div style={{ fontSize:".44rem",fontWeight:300,letterSpacing:".18em",textTransform:"uppercase",color:"#3A3840",marginTop:4 }}>{selGoal?.title?.split(" ")[0]||""}</div>
              </div>
            </div>

            {/* Room label */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:10 }}>
              <span style={{ fontSize:".88rem" }}>{selRoom?.emoji}</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".54rem",fontWeight:300,letterSpacing:".1em",color:"#2A2830" }}>{selRoom?.name}</span>
            </div>

            {/* Ambient KORA reflection — loads after session starts, non-blocking */}
            <div style={{ minHeight:70,marginBottom:36,display:"flex",alignItems:"center",justifyContent:"center" }}>
              {reflLoading && <div style={{ opacity:.4 }}><Dots color={roomColor}/></div>}
              {!reflLoading && refl && (
                <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".86rem",fontWeight:300,color:"#3A3840",lineHeight:1.75,animation:"fadeUp .6s ease",maxWidth:340 }}>{refl}</div>
              )}
            </div>

            <button onClick={endEarly} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:".5rem",fontWeight:300,letterSpacing:".18em",textTransform:"uppercase",color:"#1e1828",transition:"color .2s" }} onMouseEnter={e=>e.currentTarget.style.color="#5A5760"} onMouseLeave={e=>e.currentTarget.style.color="#1e1828"}>
              End early
            </button>
          </div>
        )}

        {/* ── LOG ── */}
        {phase==="log" && (
          <div style={{ animation:"fadeUp .45s ease" }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"1.2rem",fontWeight:300,color:"#EEE9E0",marginBottom:4 }}>Session complete.</div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".82rem",fontWeight:300,color:"#5A5760" }}>{duration} minutes. What moved forward?</div>
            </div>
            <div style={{ textAlign:"left",display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What specifically happened? One sentence is enough." style={{ ...taSt(68),fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".86rem",color:"#C8C4BC" }}/>
              <textarea value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Evidence — what was made, observed, or discovered…" style={{ ...taSt(52),fontSize:".76rem",color:"#9A9695" }}/>
            </div>
            <button onClick={finish} style={{ width:"100%",background:"rgba(255,255,255,0.055)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:12,padding:"14px",fontFamily:"'DM Sans',sans-serif",fontSize:".64rem",fontWeight:300,letterSpacing:".22em",textTransform:"uppercase",color:"#EEE9E0",cursor:"pointer",transition:"all .25s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.09)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.055)"}>
              Log and close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOM DETAIL ──────────────────────────────────────────────────────────────
export function RoomDetail({ room, onBack }) {
  const [customUrl,setCustomUrl] = useState("");
  const [inputVal,setInputVal]   = useState("");
  const [showInput,setShowInput] = useState(false);
  const [entered,setEntered]     = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setEntered(true),60); return()=>clearTimeout(t); },[]);

  const embed      = `https://open.spotify.com/embed/playlist/${room.spotifyId}?utm_source=generator&theme=0`;
  const loadCustom = () => {
    const m = inputVal.match(/playlist[\\/:]([A-Za-z0-9]+)/);
    if (m) setCustomUrl(`https://open.spotify.com/embed/playlist/${m[1]}?utm_source=generator&theme=0`);
    else if (inputVal.startsWith("http")) setCustomUrl(inputVal);
    setShowInput(false);
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:50,background:room.gradient,display:"flex",flexDirection:"column",opacity:entered?1:0,transition:"opacity 0.55s ease",overflow:"auto" }}>
      {/* Noise texture */}
      <div style={{ position:"fixed",inset:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,pointerEvents:"none",zIndex:0 }}/>
      <div style={{ position:"fixed",width:480,height:480,borderRadius:"50%",background:`radial-gradient(circle,${room.color}12 0%,transparent 70%)`,top:"-100px",right:"-80px",pointerEvents:"none",zIndex:0 }}/>

      <div style={{ position:"relative",zIndex:1,maxWidth:660,margin:"0 auto",width:"100%",padding:"34px 38px 52px" }}>
        <button onClick={onBack} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.22)",fontSize:".58rem",letterSpacing:".22em",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",fontWeight:300,marginBottom:40,display:"flex",alignItems:"center",gap:7,padding:0,transition:"color .2s" }} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.62)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.22)"}>← Rooms</button>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:"2.2rem",marginBottom:8 }}>{room.emoji}</div>
          <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.65rem,3.2vw,2.2rem)",fontWeight:300,color:"#EEE9E0",lineHeight:1.15,marginBottom:5 }}>{room.name}</div>
          <div style={{ fontSize:".7rem",fontWeight:300,color:"rgba(255,255,255,0.24)",letterSpacing:".06em" }}>{room.purpose}</div>
        </div>

        <div style={{ borderLeft:`2px solid ${room.color}40`,paddingLeft:19,marginBottom:28 }}>
          <div style={{ fontSize:".48rem",fontWeight:300,letterSpacing:".26em",textTransform:"uppercase",color:room.color,opacity:.7,marginBottom:7 }}>KORA</div>
          <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"1rem",fontWeight:300,color:"#CCC8C0",lineHeight:1.75 }}>"{room.ritual}"</div>
        </div>

        <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginBottom:28 }}>
          {room.tags.map(t=><span key={t} style={{ fontSize:".54rem",fontWeight:300,letterSpacing:".1em",padding:"4px 11px",borderRadius:20,border:`1px solid ${room.color}20`,color:`${room.color}aa` }}>{t}</span>)}
        </div>

        <div style={{ borderRadius:13,overflow:"hidden",marginBottom:14,boxShadow:`0 20px 55px ${room.color}12` }}>
          <iframe src={customUrl||embed} width="100%" height="380" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style={{ display:"block" }}/>
        </div>

        {!showInput
          ? <button onClick={()=>setShowInput(true)} style={{ background:"none",border:"none",cursor:"pointer",fontSize:".52rem",fontWeight:300,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(255,255,255,0.15)",fontFamily:"'DM Sans',sans-serif",padding:0,transition:"color .2s" }} onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.48)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.15)"}>+ Use your own playlist</button>
          : <div style={{ display:"flex",gap:7 }}>
              <input autoFocus placeholder="Paste Spotify URL…" value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadCustom()} style={{ flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"8px 13px",color:"#EEE9E0",fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",fontWeight:300,outline:"none" }}/>
              <button onClick={loadCustom} style={{ background:room.color,border:"none",borderRadius:8,padding:"8px 15px",color:"#080810",fontFamily:"'DM Sans',sans-serif",fontSize:".52rem",letterSpacing:".16em",textTransform:"uppercase",fontWeight:400,cursor:"pointer" }}>Load</button>
              <button onClick={()=>{setShowInput(false);setInputVal("");}} style={{ background:"none",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 11px",color:"rgba(255,255,255,0.24)",fontSize:".52rem",cursor:"pointer" }}>✕</button>
            </div>
        }
      </div>
    </div>
  );
}
