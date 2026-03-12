// ─────────────────────────────────────────────────────────────────────────────
// KORA v8.1.1 — Part 2 of 2
// Dashboard · Goals · Journal · Log · Review · Transmission · Profile · App
// ─────────────────────────────────────────────────────────────────────────────
// USAGE:
//   Import Part 1 exports into this file, or bundle both files together.
//   The default export is KORAApp — render it at your app root.
//
//   import KORAApp from "./KORA-v8.1.1-part2";
//   export default function App() { return <KORAApp />; }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, createRef } from "react";
import {
  callKORA, save, load, exportData,
  KORA_SYSTEM, MOODLETS, MOOD_FALLBACKS, TX_FALLBACKS,
  ROOMS, MOOD_TO_ROOM, GOAL_CATEGORIES, FREQUENCIES,
  GOAL_SUGGESTIONS, CREATOR_TYPES, SESSION_DURATIONS,
  tod, greet, fmtTime, todayStr, weekStart, monthStart, uid,
  getCat, getRoom, getMoodPattern, todayGoals, computeMetrics, buildMemory,
  chipSt, iSt, taSt, Dots, Ey, PT, SL, Reveal,
  OnboardingScreen, MoodOverlay, SessionMode, RoomDetail,
} from "./KORA-v8.1.1-part1";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@200;300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: #07070f; color: #EEE9E0; font-family: 'DM Sans', sans-serif; font-weight: 300; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  ::selection { background: rgba(228,170,202,0.22); }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
  input, textarea, button { font-family: inherit; }
  input::placeholder, textarea::placeholder { color: #2A2830; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes kdot { 0%,80%,100% { transform:scale(0.5); opacity:0.3; } 40% { transform:scale(1); opacity:1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardScreen({ goals, sessions, moodLogs, profile, onStartSession, onCheckIn, onNav }) {
  const lastMood    = moodLogs?.[0];
  const accentColor = lastMood?.color || "#E4AACA";
  const metrics     = computeMetrics(goals, sessions);
  const todayDone   = todayStr();
  const checkedToday= moodLogs?.some(m => new Date(m.date).toDateString() === todayDone);
  const lastSession = sessions?.[0];
  const lastGoal    = lastSession ? goals.find(g => g.id === lastSession.goalId) || { title: lastSession.goalTitle } : null;
  const weekGoal    = lastGoal ? sessions.filter(s => new Date(s.date) >= weekStart() && s.goalId === lastSession?.goalId).length : 0;
  const recentSessions = sessions?.slice(0, 4) || [];

  return (
    <div>
      <style>{`.dash-cta:hover { background: rgba(255,255,255,0.08) !important; }`}</style>
      <Reveal>
        <div style={{ marginBottom: 38 }}>
          <Ey t={`${new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}`} />
          <PT>{greet()}{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}.</PT>
          {lastMood && (
            <div style={{ display:"flex",alignItems:"center",gap:7,marginTop:8 }}>
              <span style={{ fontSize:".92rem" }}>{lastMood.emoji}</span>
              <span style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".78rem",color:"#3A3840" }}>{lastMood.label}</span>
            </div>
          )}
        </div>
      </Reveal>

      {/* Morning alignment nudge */}
      {!checkedToday && (
        <Reveal delay={80}>
          <button onClick={onCheckIn} style={{ width:"100%",marginBottom:22,padding:"14px 18px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:13,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,transition:"all .25s" }} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.14)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}>
            <span style={{ fontSize:"1rem" }}>○</span>
            <div>
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".72rem",fontWeight:300,color:"#EEE9E0" }}>Check in your state</div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".6rem",color:"#3A3840",marginTop:2 }}>Takes 2 seconds. Shapes the session.</div>
            </div>
          </button>
        </Reveal>
      )}

      {/* Primary CTA — Resume Last Goal */}
      <Reveal delay={120}>
        {lastGoal ? (
          <button className="dash-cta" onClick={()=>onStartSession(lastGoal)} style={{ width:"100%",marginBottom:28,padding:"18px 22px",background:"rgba(255,255,255,0.04)",border:`1px solid ${accentColor}22`,borderRadius:14,cursor:"pointer",textAlign:"left",transition:"all .28s" }}>
            <div style={{ fontSize:".44rem",fontWeight:300,letterSpacing:".3em",textTransform:"uppercase",color:accentColor,opacity:.8,marginBottom:6 }}>Resume</div>
            <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.12rem",fontWeight:300,color:"#EEE9E0",marginBottom:4 }}>{lastGoal.title}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".6rem",fontWeight:300,color:"#3A3840" }}>{weekGoal} session{weekGoal!==1?"s":""} this week ·  Start →</div>
          </button>
        ) : (
          <button className="dash-cta" onClick={()=>onStartSession(null)} style={{ width:"100%",marginBottom:28,padding:"18px 22px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:14,cursor:"pointer",textAlign:"left",transition:"all .28s" }}>
            <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",fontWeight:300,color:"#EEE9E0",marginBottom:3 }}>Start your first session</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".6rem",fontWeight:300,color:"#3A3840" }}>mood → goal → room → work →</div>
          </button>
        )}
      </Reveal>

      {/* Stats row */}
      <Reveal delay={160}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:28 }}>
          {[
            { label:"Sessions this week", val: metrics.weekSessions.length },
            { label:"Active goals",        val: metrics.activeGoals.length  },
          ].map(s=>(
            <div key={s.label} style={{ padding:"14px 16px",background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12 }}>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.55rem",fontWeight:300,color:"#EEE9E0",lineHeight:1,marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:".52rem",fontWeight:300,letterSpacing:".1em",color:"#3A3840" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Today's goals */}
      {todayGoals(goals).length > 0 && (
        <Reveal delay={200}>
          <div style={{ marginBottom:28 }}>
            <SL t="Today" />
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {todayGoals(goals).map(g => {
                const cat  = getCat(g.category);
                const done = sessions.filter(s=>s.goalId===g.id && new Date(s.date)>=weekStart()).length;
                const tgt  = g.targetFrequency==="daily"?7 : g.targetFrequency==="weekday"?5 : 1;
                const pct  = Math.min(100, Math.round((done/tgt)*100));
                return (
                  <div key={g.id} style={{ padding:"12px 15px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.055)",borderRadius:11,cursor:"pointer",transition:"all .2s" }} onClick={()=>onStartSession(g)} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.055)"}>
                    <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:7 }}>
                      <span style={{ color:cat.color,fontSize:".72rem" }}>{cat.icon}</span>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",fontWeight:300,color:"#EEE9E0",flex:1 }}>{g.title}</span>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".55rem",fontWeight:300,color:"#3A3840" }}>{done}/{tgt}</span>
                    </div>
                    <div style={{ height:2,background:"rgba(255,255,255,0.05)",borderRadius:1 }}>
                      <div style={{ width:`${pct}%`,height:"100%",background:cat.color,borderRadius:1,opacity:.6,transition:"width .4s ease" }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}

      {/* Recent work */}
      {recentSessions.length > 0 && (
        <Reveal delay={240}>
          <div>
            <SL t="Recent Work" />
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {recentSessions.map(s => {
                const cat  = getCat(s.goalCategory);
                const icon = s.mood?.emoji || cat.icon;
                return (
                  <div key={s.id} style={{ display:"flex",alignItems:"center",gap:11,padding:"9px 13px",background:"rgba(255,255,255,0.016)",borderRadius:9 }}>
                    <span style={{ fontSize:".8rem",flexShrink:0 }}>{icon}</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".72rem",fontWeight:300,color:"#5A5760",flex:1 }}>{s.goalTitle}</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".56rem",fontWeight:300,color:"#2A2830" }}>{s.duration}m</span>
                    <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".5rem",fontWeight:300,color:"#1e1c28" }}>{s.dateLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ─── GOALS ────────────────────────────────────────────────────────────────────
function GoalsScreen({ goals, sessions, milestones, setGoals, setMilestones, onStartSession }) {
  const [tab, setTab]           = useState("active");
  const [adding, setAdding]     = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState({ title:"", category:"creative", targetFrequency:"daily" });
  const [newMile, setNewMile]   = useState("");

  const active   = goals.filter(g=>!g.archived);
  const archived = goals.filter(g=>g.archived);

  const saveGoal = () => {
    if (!form.title.trim()) return;
    const cat = getCat(form.category);
    if (editing) {
      setGoals(gs=>gs.map(g=>g.id===editing?{...g,...form}:g));
      setEditing(null);
    } else {
      const ng = { id:`goal_${uid()}`,title:form.title.trim(),category:form.category,targetFrequency:form.targetFrequency,color:cat.color,createdAt:new Date().toISOString(),archived:false };
      setGoals(gs=>[ng,...gs]);
    }
    setForm({title:"",category:"creative",targetFrequency:"daily"}); setAdding(false);
  };

  const addMile = () => {
    if (!newMile.trim()) return;
    setMilestones(ms=>[{id:`m_${uid()}`,text:newMile.trim(),progress:0},...ms]);
    setNewMile("");
  };

  const nudgeMile = (id, delta) => {
    setMilestones(ms=>ms.map(m=>m.id===id?{...m,progress:Math.min(100,Math.max(0,m.progress+delta))}:m));
  };

  return (
    <div>
      <Reveal><div style={{marginBottom:28}}><Ey t="Goals"/><PT>Your practice.</PT></div></Reveal>

      {/* Tabs */}
      <Reveal delay={60}>
        <div style={{ display:"flex",gap:6,marginBottom:26,borderBottom:"1px solid rgba(255,255,255,0.05)",paddingBottom:12 }}>
          {[["active","Active"],["milestones","Milestones"],["archived","Archived"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:".56rem",fontWeight:300,letterSpacing:".18em",textTransform:"uppercase",color:tab===id?"#EEE9E0":"#3A3840",paddingBottom:8,borderBottom:`1px solid ${tab===id?"#E4AACA":"transparent"}`,transition:"all .2s" }}>{label}</button>
          ))}
        </div>
      </Reveal>

      {/* ACTIVE TAB */}
      {tab==="active" && (
        <Reveal delay={80}>
          <div>
            {/* Add goal button */}
            {!adding && (
              <button onClick={()=>setAdding(true)} style={{ width:"100%",marginBottom:14,padding:"13px",border:"1px dashed rgba(255,255,255,0.1)",borderRadius:12,background:"transparent",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:".58rem",fontWeight:300,letterSpacing:".16em",textTransform:"uppercase",color:"#3A3840",transition:"all .25s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.22)";e.currentTarget.style.color="#EEE9E0";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="#3A3840";}}>+ Add goal</button>
            )}

            {/* Add/Edit form */}
            {(adding || editing) && (
              <div style={{ marginBottom:16,padding:"18px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:13,animation:"fadeUp .3s ease" }}>
                <input autoFocus placeholder="Goal title…" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&saveGoal()} style={{...iSt,marginBottom:10}}/>
                <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginBottom:10 }}>
                  {GOAL_CATEGORIES.map(c=>(
                    <button key={c.id} onClick={()=>setForm(f=>({...f,category:c.id}))} style={chipSt(form.category===c.id)}>
                      <span style={{color:form.category===c.id?c.color:"inherit"}}>{c.icon}</span> {c.label}
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex",gap:7,marginBottom:14 }}>
                  {FREQUENCIES.map(f=>(
                    <button key={f.id} onClick={()=>setForm(fo=>({...fo,targetFrequency:f.id}))} style={chipSt(form.targetFrequency===f.id)}>{f.label}</button>
                  ))}
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={saveGoal} style={{ flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:9,padding:"9px",fontFamily:"'DM Sans',sans-serif",fontSize:".58rem",letterSpacing:".16em",textTransform:"uppercase",color:"#EEE9E0",cursor:"pointer" }}>Save</button>
                  <button onClick={()=>{setAdding(false);setEditing(null);setForm({title:"",category:"creative",targetFrequency:"daily"});}} style={{ background:"none",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:"9px 14px",fontSize:".58rem",color:"#3A3840",cursor:"pointer" }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Goal cards */}
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {active.map((g,i) => {
                const cat   = getCat(g.category);
                const done  = sessions.filter(s=>s.goalId===g.id&&new Date(s.date)>=weekStart()).length;
                const tgt   = g.targetFrequency==="daily"?7:g.targetFrequency==="weekday"?5:1;
                const pct   = Math.min(100,Math.round((done/tgt)*100));
                return (
                  <div key={g.id} style={{ padding:"15px 16px",background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:13,animation:`fadeUp .35s ease ${i*40}ms both` }}>
                    <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:9 }}>
                      <span style={{ color:cat.color,fontSize:".8rem",marginTop:1 }}>{cat.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".82rem",fontWeight:300,color:"#EEE9E0",marginBottom:2 }}>{g.title}</div>
                        <div style={{ fontSize:".52rem",fontWeight:300,letterSpacing:".1em",color:"#2A2830" }}>{g.targetFrequency}</div>
                      </div>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".62rem",fontWeight:300,color:"#3A3840" }}>{done}/{tgt}</span>
                    </div>
                    <div style={{ height:2,background:"rgba(255,255,255,0.05)",borderRadius:1,marginBottom:11 }}>
                      <div style={{ width:`${pct}%`,height:"100%",background:cat.color,borderRadius:1,opacity:.55,transition:"width .5s ease" }}/>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={()=>onStartSession(g)} style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".52rem",letterSpacing:".14em",textTransform:"uppercase",color:cat.color,background:"none",border:`1px solid ${cat.color}30`,borderRadius:7,padding:"5px 12px",cursor:"pointer",transition:"all .2s" }} onMouseEnter={e=>e.currentTarget.style.background=`${cat.color}15`} onMouseLeave={e=>e.currentTarget.style.background="none"}>Start →</button>
                      <button onClick={()=>{setEditing(g.id);setForm({title:g.title,category:g.category,targetFrequency:g.targetFrequency});setAdding(false);}} style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".52rem",letterSpacing:".14em",textTransform:"uppercase",color:"#3A3840",background:"none",border:"1px solid rgba(255,255,255,0.06)",borderRadius:7,padding:"5px 12px",cursor:"pointer" }}>Edit</button>
                      <button onClick={()=>setGoals(gs=>gs.map(x=>x.id===g.id?{...x,archived:true}:x))} style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".52rem",letterSpacing:".14em",textTransform:"uppercase",color:"#2A2830",background:"none",border:"none",cursor:"pointer",marginLeft:"auto" }}>Archive</button>
                    </div>
                  </div>
                );
              })}
            </div>
            {active.length===0&&!adding && <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".86rem",color:"#2A2830",marginTop:16,lineHeight:1.7 }}>No active goals. Add one to begin.</div>}
          </div>
        </Reveal>
      )}

      {/* MILESTONES TAB */}
      {tab==="milestones" && (
        <Reveal delay={80}>
          <div>
            <div style={{ display:"flex",gap:8,marginBottom:16 }}>
              <input placeholder="Add a milestone…" value={newMile} onChange={e=>setNewMile(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addMile()} style={{...iSt,flex:1}}/>
              <button onClick={addMile} style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"0 16px",color:"#EEE9E0",fontSize:".58rem",letterSpacing:".14em",textTransform:"uppercase",cursor:"pointer" }}>Add</button>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {milestones.map((m,i)=>(
                <div key={m.id} style={{ padding:"14px 16px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.055)",borderRadius:12,animation:`fadeUp .35s ease ${i*40}ms both` }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",fontWeight:300,color:"#EEE9E0",marginBottom:9 }}>{m.text}</div>
                  <div style={{ height:2,background:"rgba(255,255,255,0.05)",borderRadius:1,marginBottom:11 }}>
                    <div style={{ width:`${m.progress}%`,height:"100%",background:"#B8ACD6",borderRadius:1,opacity:.6,transition:"width .4s" }}/>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".58rem",fontWeight:300,color:"#3A3840",marginRight:4 }}>{m.progress}%</span>
                    {[-10,10,25,50].map(d=>(
                      <button key={d} onClick={()=>nudgeMile(m.id,d)} style={{ padding:"3px 9px",border:"1px solid rgba(255,255,255,0.08)",borderRadius:6,background:"none",color:d<0?"#3A3840":"#6A6470",fontSize:".56rem",cursor:"pointer",transition:"all .2s" }} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>{d>0?"+":""}{d}%</button>
                    ))}
                    <button onClick={()=>setMilestones(ms=>ms.filter(x=>x.id!==m.id))} style={{ marginLeft:"auto",background:"none",border:"none",cursor:"pointer",color:"#1e1c28",fontSize:".58rem",transition:"color .2s" }} onMouseEnter={e=>e.currentTarget.style.color="#5A5760"} onMouseLeave={e=>e.currentTarget.style.color="#1e1c28"}>✕</button>
                  </div>
                </div>
              ))}
              {milestones.length===0&&<div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".86rem",color:"#2A2830",lineHeight:1.7 }}>No milestones yet. What are you building toward?</div>}
            </div>
          </div>
        </Reveal>
      )}

      {/* ARCHIVED TAB */}
      {tab==="archived" && (
        <Reveal delay={80}>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {archived.map(g=>{
              const cat=getCat(g.category);
              return (
                <div key={g.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 15px",background:"rgba(255,255,255,0.016)",border:"1px solid rgba(255,255,255,0.045)",borderRadius:11 }}>
                  <span style={{ color:cat.color,opacity:.4,fontSize:".7rem" }}>{cat.icon}</span>
                  <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",fontWeight:300,color:"#3A3840",flex:1 }}>{g.title}</span>
                  <button onClick={()=>setGoals(gs=>gs.map(x=>x.id===g.id?{...x,archived:false}:x))} style={{ background:"none",border:"1px solid rgba(255,255,255,0.07)",borderRadius:7,padding:"4px 11px",fontSize:".5rem",letterSpacing:".14em",textTransform:"uppercase",color:"#5A5760",cursor:"pointer" }}>Restore</button>
                </div>
              );
            })}
            {archived.length===0&&<div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".86rem",color:"#2A2830",lineHeight:1.7 }}>No archived goals.</div>}
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
// Time-aware ritual: morning pages before work, evening reflection after.
// Stream of consciousness — no tags, no categories, no performance pressure.
function JournalScreen({ journalEntries, setJournalEntries, moodLogs }) {
  const [text, setText]   = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const lastMood = moodLogs?.[0];
  const timeOfDay = tod();

  const prompts = {
    morning: {
      main: "What's moving through your mind before the work begins?",
      sub:  "Morning pages. Write without editing. Nothing you write here is wrong.",
      accent: "#F0C97A",
    },
    midday: {
      main: "Where are you right now, honestly?",
      sub:  "A mid-day check in. No agenda — just truth.",
      accent: "#B8ACD6",
    },
    evening: {
      main: "What happened today? What wants to be released?",
      sub:  "Evening ritual. Let the day land. Write until it's empty.",
      accent: "#6B7FAE",
    },
  };
  const p = prompts[timeOfDay];

  const todayEntries = journalEntries.filter(e=>new Date(e.date).toDateString()===todayStr());
  const pastEntries  = journalEntries.filter(e=>new Date(e.date).toDateString()!==todayStr()).slice(0,8);

  const saveEntry = () => {
    if (!text.trim()) return;
    setSaving(true);
    const entry = {
      id: uid(),
      text: text.trim(),
      type: timeOfDay,
      mood: lastMood ? { emoji:lastMood.emoji, label:lastMood.label, color:lastMood.color } : null,
      date: new Date().toISOString(),
      dateLabel: new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}),
      words: text.trim().split(/\s+/).filter(Boolean).length,
    };
    setTimeout(()=>{
      setJournalEntries(es=>[entry,...es]);
      setText("");
      setSaving(false);
      setSaved(true);
      setTimeout(()=>setSaved(false),2200);
    },350);
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <Reveal>
        <div style={{ marginBottom:28 }}>
          <Ey t={`${timeOfDay.charAt(0).toUpperCase()+timeOfDay.slice(1)} · ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric"})}`} c={p.accent+"cc"}/>
          <PT>{p.main}</PT>
          <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".78rem",color:"#2A2830",marginTop:6,lineHeight:1.7 }}>{p.sub}</div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div style={{ marginBottom:22,position:"relative" }}>
          {/* Mood badge */}
          {lastMood && (
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:11,opacity:.6 }}>
              <span style={{ fontSize:".8rem" }}>{lastMood.emoji}</span>
              <span style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".62rem",color:"#3A3840" }}>{lastMood.label}</span>
            </div>
          )}
          <textarea
            value={text}
            onChange={e=>setText(e.target.value)}
            placeholder="Begin writing…"
            style={{ ...taSt(220),fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".94rem",color:"#CCC8C0",lineHeight:1.82,border:`1px solid ${p.accent}18`,background:`${p.accent}04` }}
            autoFocus
          />
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:9 }}>
            <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".52rem",fontWeight:300,color:"#2A2830",opacity:wordCount>0?1:0,transition:"opacity .3s" }}>{wordCount} words</div>
            <button
              onClick={saveEntry}
              disabled={!text.trim()||saving}
              style={{ background:text.trim()?p.accent:"rgba(255,255,255,0.04)",border:"none",borderRadius:9,padding:"8px 18px",fontFamily:"'DM Sans',sans-serif",fontSize:".54rem",fontWeight:300,letterSpacing:".18em",textTransform:"uppercase",color:text.trim()?"#07070f":"#2A2830",cursor:text.trim()?"pointer":"default",transition:"all .3s" }}
            >
              {saving?"Saving…":saved?"Saved ✓":"Save"}
            </button>
          </div>
        </div>
      </Reveal>

      {/* Today's entries */}
      {todayEntries.length > 0 && (
        <Reveal delay={140}>
          <div style={{ marginBottom:22 }}>
            <SL t="Today"/>
            <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
              {todayEntries.map(e=>(
                <div key={e.id} style={{ padding:"13px 15px",background:"rgba(255,255,255,0.02)",border:`1px solid ${p.accent}14`,borderRadius:12 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7 }}>
                    <span style={{ fontSize:".44rem",fontWeight:300,letterSpacing:".2em",textTransform:"uppercase",color:p.accent,opacity:.7 }}>{e.type}</span>
                    <span style={{ fontSize:".44rem",color:"#2A2830",marginLeft:"auto" }}>{e.words}w</span>
                    {e.mood && <span style={{ fontSize:".7rem" }}>{e.mood.emoji}</span>}
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".78rem",color:"#5A5760",lineHeight:1.65,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{e.text}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Past entries preview */}
      {pastEntries.length > 0 && (
        <Reveal delay={180}>
          <div>
            <SL t="Archive"/>
            <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
              {pastEntries.map(e=>{
                const ep = prompts[e.type]||prompts.midday;
                return (
                  <div key={e.id} style={{ padding:"10px 14px",background:"rgba(255,255,255,0.014)",borderRadius:10 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                      <span style={{ fontSize:".42rem",fontWeight:300,letterSpacing:".18em",textTransform:"uppercase",color:ep.accent,opacity:.55 }}>{e.type}</span>
                      <span style={{ fontSize:".46rem",color:"#2A2830",flex:1 }}>{e.dateLabel}</span>
                      <span style={{ fontSize:".42rem",color:"#1e1c28" }}>{e.words}w</span>
                      {e.mood && <span style={{ fontSize:".62rem",opacity:.5 }}>{e.mood.emoji}</span>}
                    </div>
                    <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".7rem",color:"#3A3840",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{e.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ─── LOG ──────────────────────────────────────────────────────────────────────
function LogScreen({ sessions, setSessions }) {
  const [editing, setEditing] = useState(null);
  const [editNotes, setEditNotes]     = useState("");
  const [editEvidence, setEditEvidence] = useState("");
  const [confirmDel, setConfirmDel]   = useState(null);

  const startEdit = s => { setEditing(s.id); setEditNotes(s.notes||""); setEditEvidence(s.evidence||""); };
  const saveEdit  = id => {
    setSessions(ss=>ss.map(s=>s.id===id?{...s,notes:editNotes,evidence:editEvidence}:s));
    setEditing(null);
  };
  const deleteSession = id => {
    setSessions(ss=>ss.filter(s=>s.id!==id));
    setConfirmDel(null);
  };

  return (
    <div>
      <Reveal><div style={{ marginBottom:28 }}><Ey t="Creative Log"/><PT>The record.</PT></div></Reveal>
      {sessions.length===0 && (
        <Reveal delay={80}><div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".92rem",color:"#2A2830",lineHeight:1.75 }}>No sessions logged yet. Complete your first session to begin the record.</div></Reveal>
      )}
      <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
        {sessions.map((s,i)=>{
          const cat  = getCat(s.goalCategory);
          const isEd = editing===s.id;
          const isDel= confirmDel===s.id;
          return (
            <div key={s.id} style={{ padding:"15px 17px",background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:13,animation:`fadeUp .4s ease ${Math.min(i,5)*45}ms both` }}>
              {/* Header */}
              <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:isEd?12:s.notes||s.evidence?10:0 }}>
                <span style={{ fontSize:".8rem" }}>{s.mood?.emoji||cat.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".78rem",fontWeight:300,color:"#EEE9E0" }}>{s.goalTitle}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".52rem",fontWeight:300,color:"#2A2830",marginTop:1 }}>{s.duration}m · {s.dateLabel}</div>
                </div>
                {!isEd && !isDel && (
                  <div style={{ display:"flex",gap:6 }}>
                    <button onClick={()=>startEdit(s)} style={{ background:"none",border:"1px solid rgba(255,255,255,0.07)",borderRadius:6,padding:"4px 9px",fontSize:".48rem",letterSpacing:".12em",textTransform:"uppercase",color:"#3A3840",cursor:"pointer" }}>Edit</button>
                    <button onClick={()=>setConfirmDel(s.id)} style={{ background:"none",border:"none",fontSize:".58rem",color:"#1e1c28",cursor:"pointer",transition:"color .2s" }} onMouseEnter={e=>e.currentTarget.style.color="#5A5760"} onMouseLeave={e=>e.currentTarget.style.color="#1e1c28"}>✕</button>
                  </div>
                )}
              </div>

              {/* View mode */}
              {!isEd && !isDel && (
                <>
                  {s.notes && <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".8rem",color:"#6A6470",lineHeight:1.72,marginBottom:s.evidence?9:0 }}>{s.notes}</div>}
                  {s.evidence && <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".7rem",fontWeight:300,color:"#8A8490",lineHeight:1.65,borderLeft:`2px solid ${cat.color}30`,paddingLeft:10 }}>{s.evidence}</div>}
                </>
              )}

              {/* Edit mode */}
              {isEd && (
                <div>
                  <textarea value={editNotes} onChange={e=>setEditNotes(e.target.value)} placeholder="Session notes…" style={{ ...taSt(56),fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".82rem",marginBottom:8 }}/>
                  <textarea value={editEvidence} onChange={e=>setEditEvidence(e.target.value)} placeholder="Evidence…" style={{ ...taSt(44),fontSize:".74rem",marginBottom:10 }}/>
                  <div style={{ display:"flex",gap:7 }}>
                    <button onClick={()=>saveEdit(s.id)} style={{ flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"8px",fontSize:".54rem",letterSpacing:".14em",textTransform:"uppercase",color:"#EEE9E0",cursor:"pointer" }}>Save</button>
                    <button onClick={()=>setEditing(null)} style={{ background:"none",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:"8px 13px",fontSize:".54rem",color:"#3A3840",cursor:"pointer" }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Delete confirm */}
              {isDel && (
                <div style={{ display:"flex",alignItems:"center",gap:9,paddingTop:6 }}>
                  <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".62rem",fontWeight:300,color:"#5A5760",flex:1 }}>Delete this entry?</span>
                  <button onClick={()=>deleteSession(s.id)} style={{ background:"rgba(220,80,60,0.1)",border:"1px solid rgba(220,80,60,0.2)",borderRadius:7,padding:"5px 13px",fontSize:".52rem",letterSpacing:".12em",textTransform:"uppercase",color:"#E87060",cursor:"pointer" }}>Delete</button>
                  <button onClick={()=>setConfirmDel(null)} style={{ background:"none",border:"1px solid rgba(255,255,255,0.07)",borderRadius:7,padding:"5px 11px",fontSize:".52rem",color:"#3A3840",cursor:"pointer" }}>Cancel</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REVIEW ───────────────────────────────────────────────────────────────────
function ReviewScreen({ goals, sessions, moodLogs, milestones, journalEntries }) {
  const [tab, setTab]           = useState("weekly");
  const [weekNotes, setWeekNotes] = useState({q1:"",q2:"",q3:""});
  const [monthNote, setMonthNote] = useState("");
  const [saved, setSaved]       = useState(false);

  const metrics = computeMetrics(goals, sessions);
  const domMood = getMoodPattern(moodLogs);
  const domMoodlet = MOODLETS.find(m=>m.id===domMood);

  const saveReview = () => {
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  };

  const intColor = metrics.integrity===null?"#3A3840":metrics.integrity>=80?"#7EC87E":metrics.integrity>=50?"#F0C97A":"#E8906A";

  return (
    <div>
      <Reveal><div style={{ marginBottom:28 }}><Ey t="Review"/><PT>What the work has built.</PT></div></Reveal>

      <Reveal delay={60}>
        <div style={{ display:"flex",gap:6,marginBottom:26,borderBottom:"1px solid rgba(255,255,255,0.05)",paddingBottom:12 }}>
          {[["weekly","Weekly"],["monthly","Monthly"],["journal","Journal"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:".56rem",fontWeight:300,letterSpacing:".18em",textTransform:"uppercase",color:tab===id?"#EEE9E0":"#3A3840",paddingBottom:8,borderBottom:`1px solid ${tab===id?"#E4AACA":"transparent"}`,transition:"all .2s" }}>{label}</button>
          ))}
        </div>
      </Reveal>

      {/* WEEKLY */}
      {tab==="weekly" && (
        <Reveal delay={80}>
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:24 }}>
              {[
                { label:"Sessions",  val:metrics.weekSessions.length },
                { label:"Integrity", val:metrics.integrity!==null?`${metrics.integrity}%`:"—", color:intColor },
                { label:"Evidence",  val:metrics.weekEvidence },
              ].map(s=>(
                <div key={s.label} style={{ padding:"13px 14px",background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:11 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",fontWeight:300,color:s.color||"#EEE9E0",lineHeight:1,marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:".5rem",fontWeight:300,letterSpacing:".1em",color:"#3A3840" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
              {[
                { key:"q1",q:"Where did you show up?" },
                { key:"q2",q:"What moved forward?" },
                { key:"q3",q:"Where did you avoid the real work?" },
              ].map(({key,q})=>(
                <div key={key}>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".78rem",color:"#5A5760",marginBottom:7,lineHeight:1.5 }}>{q}</div>
                  <textarea value={weekNotes[key]} onChange={e=>setWeekNotes(n=>({...n,[key]:e.target.value}))} style={{ ...taSt(52),fontSize:".8rem" }}/>
                </div>
              ))}
            </div>

            {milestones.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <SL t="Milestones"/>
                <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                  {milestones.map(m=>(
                    <div key={m.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 13px",background:"rgba(255,255,255,0.016)",borderRadius:9 }}>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".72rem",fontWeight:300,color:"#5A5760",flex:1 }}>{m.text}</span>
                      <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".62rem",fontWeight:300,color:"#3A3840" }}>{m.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={saveReview} style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 20px",fontFamily:"'DM Sans',sans-serif",fontSize:".56rem",letterSpacing:".18em",textTransform:"uppercase",color:saved?"#7EC87E":"#EEE9E0",cursor:"pointer",transition:"all .3s" }}>{saved?"Saved ✓":"Save weekly review"}</button>
          </div>
        </Reveal>
      )}

      {/* MONTHLY */}
      {tab==="monthly" && (
        <Reveal delay={80}>
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:9,marginBottom:24 }}>
              {[
                { label:"Total sessions",   val: metrics.monthSessions.length },
                { label:"Hours logged",     val: `${Math.round(metrics.monthSessions.reduce((a,s)=>a+s.duration,0)/60*10)/10}h` },
                { label:"Evidence logged",  val: metrics.monthSessions.filter(s=>s.evidence?.trim()).length },
                { label:"Milestones",       val: milestones.length },
              ].map(s=>(
                <div key={s.label} style={{ padding:"13px 14px",background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:11 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",fontWeight:300,color:"#EEE9E0",lineHeight:1,marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:".5rem",fontWeight:300,letterSpacing:".1em",color:"#3A3840" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {domMoodlet && (
              <div style={{ padding:"13px 16px",background:"rgba(255,255,255,0.016)",border:`1px solid ${domMoodlet.color}22`,borderRadius:11,marginBottom:20,display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontSize:"1.1rem" }}>{domMoodlet.emoji}</span>
                <div>
                  <div style={{ fontSize:".44rem",fontWeight:300,letterSpacing:".2em",textTransform:"uppercase",color:domMoodlet.color,opacity:.7,marginBottom:3 }}>Dominant state this month</div>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:".82rem",fontWeight:300,color:"#EEE9E0" }}>{domMoodlet.label}</div>
                </div>
              </div>
            )}

            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".82rem",color:"#5A5760",marginBottom:8,lineHeight:1.5 }}>What shifts for next month?</div>
              <textarea value={monthNote} onChange={e=>setMonthNote(e.target.value)} style={{ ...taSt(80),fontSize:".82rem" }}/>
            </div>

            <button onClick={saveReview} style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"11px 20px",fontFamily:"'DM Sans',sans-serif",fontSize:".56rem",letterSpacing:".18em",textTransform:"uppercase",color:saved?"#7EC87E":"#EEE9E0",cursor:"pointer",transition:"all .3s" }}>{saved?"Saved ✓":"Save monthly review"}</button>
          </div>
        </Reveal>
      )}

      {/* JOURNAL ARCHIVE */}
      {tab==="journal" && (
        <Reveal delay={80}>
          <div>
            {journalEntries.length===0 && <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".88rem",color:"#2A2830",lineHeight:1.75 }}>No journal entries yet.</div>}
            <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
              {journalEntries.map((e,i)=>{
                const accent = e.type==="morning"?"#F0C97A":e.type==="evening"?"#6B7FAE":"#B8ACD6";
                return (
                  <div key={e.id} style={{ padding:"13px 15px",background:"rgba(255,255,255,0.018)",border:`1px solid ${accent}14`,borderRadius:12,animation:`fadeUp .35s ease ${Math.min(i,5)*35}ms both` }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7 }}>
                      <span style={{ fontSize:".42rem",fontWeight:300,letterSpacing:".2em",textTransform:"uppercase",color:accent,opacity:.7 }}>{e.type}</span>
                      <span style={{ fontSize:".48rem",color:"#2A2830",flex:1 }}>{e.dateLabel}</span>
                      <span style={{ fontSize:".42rem",color:"#1e1c28" }}>{e.words}w</span>
                      {e.mood && <span style={{ fontSize:".62rem",opacity:.45 }}>{e.mood.emoji}</span>}
                    </div>
                    <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".76rem",color:"#3A3840",lineHeight:1.65,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{e.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ─── TRANSMISSION ─────────────────────────────────────────────────────────────
function TransmissionScreen({ moodLogs, sessions, goals, profile, memory }) {
  const [tx, setTx]       = useState(null);
  const [loading, setLoading] = useState(false);
  const lastMood = moodLogs?.[0];
  const accentColor = lastMood?.color || "#E4AACA";
  const timeOfDay = tod();

  const getFallback = () => {
    const bucket = TX_FALLBACKS[timeOfDay]||TX_FALLBACKS.midday;
    return bucket[lastMood?.moodId]||bucket.default;
  };

  const generate = async () => {
    setLoading(true); setTx(null);
    const moodCtx = lastMood?`${lastMood.label} ${lastMood.emoji}`:"present";
    try {
      const t = await callKORA(
        [{ role:"user", content:`Generate a transmission for ${timeOfDay}. State: ${moodCtx}. Keep it 2–3 sentences, poetic, oriented toward what to do or feel next. No sign-off.` }],
        KORA_SYSTEM+(memory||"")
      );
      setTx(t);
    } catch {
      setTx(getFallback());
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ generate(); },[]);

  return (
    <div>
      <Reveal><div style={{ marginBottom:32 }}><Ey t="Signal" c={accentColor+"aa"}/><PT>Today's transmission.</PT></div></Reveal>

      <Reveal delay={80}>
        <div style={{ minHeight:120,marginBottom:32,display:"flex",alignItems:"center" }}>
          {loading && <div style={{ opacity:.4 }}><Dots color={accentColor}/></div>}
          {!loading && tx && (
            <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"clamp(1rem,1.8vw,1.18rem)",fontWeight:300,color:"#CCC8C0",lineHeight:1.82,animation:"fadeUp .6s ease" }}>{tx}</div>
          )}
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          {lastMood && (
            <div style={{ display:"flex",alignItems:"center",gap:7,padding:"7px 14px",border:`1px solid ${accentColor}22`,borderRadius:20 }}>
              <span>{lastMood.emoji}</span>
              <span style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".7rem",color:"#5A5760" }}>{lastMood.label}</span>
            </div>
          )}
          <button onClick={generate} disabled={loading} style={{ background:"none",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"7px 16px",fontFamily:"'DM Sans',sans-serif",fontSize:".52rem",fontWeight:300,letterSpacing:".18em",textTransform:"uppercase",color:"#3A3840",cursor:"pointer",transition:"all .25s" }} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.2)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"}>New transmission</button>
        </div>
      </Reveal>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfileScreen({ profile, setProfile, goals, sessions, moodLogs, onImport }) {
  const [form, setForm]       = useState(profile||{});
  const [saved, setSaved]     = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const fileRef = useRef(null);
  const metrics = computeMetrics(goals, sessions);
  const intColor = metrics.integrity===null?"#3A3840":metrics.integrity>=80?"#7EC87E":metrics.integrity>=50?"#F0C97A":"#E8906A";

  const save_ = () => {
    setProfile(form);
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  };

  const handleImport = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        // Strip BOM and trim whitespace before parsing
        const raw = evt.target.result.replace(/^\uFEFF/, "").trim();
        const data = JSON.parse(raw);
        if (typeof data !== "object" || data === null) throw new Error("not an object");
        onImport(data);
        setImportMsg("Imported ✓");
      } catch(err) {
        console.error("KORA import error:", err.message);
        setImportMsg("Try again");
      } finally {
        setImporting(false);
        setTimeout(()=>setImportMsg(null), 4000);
        e.target.value = "";
      }
    };
    reader.onerror = () => {
      setImportMsg("Could not read file");
      setImporting(false);
    };
    reader.readAsText(file, "UTF-8");
  };

  return (
    <div>
      <Reveal><div style={{ marginBottom:28 }}><Ey t="Profile"/><PT>{profile?.name||"Creator"}.</PT></div></Reveal>

      {/* Integrity score */}
      <Reveal delay={60}>
        <div style={{ padding:"18px 20px",background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:13,marginBottom:24 }}>
          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12 }}>
            <div>
              <Ey t="Integrity Score"/>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"2rem",fontWeight:300,color:intColor,lineHeight:1 }}>{metrics.integrity!==null?`${metrics.integrity}%`:"—"}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".58rem",fontWeight:300,color:"#3A3840",marginBottom:2 }}>This week</div>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.1rem",fontWeight:300,color:"#EEE9E0" }}>{metrics.weekSessions.length} sessions</div>
            </div>
          </div>
          {metrics.integrity!==null && (
            <div style={{ height:2,background:"rgba(255,255,255,0.05)",borderRadius:1 }}>
              <div style={{ width:`${metrics.integrity}%`,height:"100%",background:intColor,borderRadius:1,opacity:.55,transition:"width .6s ease" }}/>
            </div>
          )}
        </div>
      </Reveal>

      {/* Vision preview */}
      {profile?.creativeGoals && (
        <Reveal delay={90}>
          <div style={{ padding:"14px 18px",background:"rgba(255,255,255,0.016)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:12,marginBottom:24,borderLeft:"2px solid rgba(228,170,202,0.2)" }}>
            <div style={{ fontSize:".44rem",fontWeight:300,letterSpacing:".26em",textTransform:"uppercase",color:"rgba(228,170,202,0.5)",marginBottom:7 }}>Creative Vision</div>
            <div style={{ fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:".82rem",color:"#5A5760",lineHeight:1.7 }}>"{profile.creativeGoals}"</div>
          </div>
        </Reveal>
      )}

      {/* Edit form */}
      <Reveal delay={120}>
        <div style={{ display:"flex",flexDirection:"column",gap:11,marginBottom:22 }}>
          <div>
            <div style={{ fontSize:".48rem",fontWeight:300,letterSpacing:".2em",textTransform:"uppercase",color:"#3A3840",marginBottom:6 }}>Name</div>
            <input value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={iSt}/>
          </div>
          <div>
            <div style={{ fontSize:".48rem",fontWeight:300,letterSpacing:".2em",textTransform:"uppercase",color:"#3A3840",marginBottom:7 }}>Creator type</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
              {CREATOR_TYPES.map(t=>(
                <button key={t} onClick={()=>setForm(f=>({...f,creatorType:t}))} style={chipSt(form.creatorType===t)}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:".48rem",fontWeight:300,letterSpacing:".2em",textTransform:"uppercase",color:"#3A3840",marginBottom:6 }}>Current focus</div>
            <input value={form.currentFocus||""} onChange={e=>setForm(f=>({...f,currentFocus:e.target.value}))} placeholder="What's the main project right now?" style={iSt}/>
          </div>
          <div>
            <div style={{ fontSize:".48rem",fontWeight:300,letterSpacing:".2em",textTransform:"uppercase",color:"#3A3840",marginBottom:6 }}>Creative vision</div>
            <textarea value={form.creativeGoals||""} onChange={e=>setForm(f=>({...f,creativeGoals:e.target.value}))} placeholder="What are you building toward?" style={{ ...taSt(80),fontFamily:"'Playfair Display',serif",fontStyle:"italic" }}/>
          </div>
        </div>
        <div style={{ display:"flex",gap:9,marginBottom:9 }}>
          <button onClick={save_} style={{ flex:1,background:"rgba(255,255,255,0.055)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"11px",fontFamily:"'DM Sans',sans-serif",fontSize:".58rem",fontWeight:300,letterSpacing:".2em",textTransform:"uppercase",color:saved?"#7EC87E":"#EEE9E0",cursor:"pointer",transition:"all .3s" }}>{saved?"Saved ✓":"Save changes"}</button>
          <button onClick={exportData} style={{ background:"none",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"11px 18px",fontFamily:"'DM Sans',sans-serif",fontSize:".58rem",fontWeight:300,letterSpacing:".16em",textTransform:"uppercase",color:"#3A3840",cursor:"pointer",transition:"all .2s" }} onMouseEnter={e=>e.currentTarget.style.color="#EEE9E0"} onMouseLeave={e=>e.currentTarget.style.color="#3A3840"} title="Export all data as JSON">Export</button>
        </div>
        {/* Import */}
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display:"none" }}/>
        <button onClick={()=>fileRef.current?.click()} disabled={importing} style={{ width:"100%",background:"rgba(255,255,255,0.02)",border:"1px dashed rgba(255,255,255,0.09)",borderRadius:10,padding:"11px",fontFamily:"'DM Sans',sans-serif",fontSize:".58rem",fontWeight:300,letterSpacing:".18em",textTransform:"uppercase",color:importMsg?.includes("✓")?"#7EC87E":importMsg?"#E8906A":"#3A3840",cursor:"pointer",transition:"all .3s" }} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.18)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.09)"}>
          {importing?"Reading…":importMsg||"Import backup (JSON)"}
        </button>
      </Reveal>
    </div>
  );
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard",     icon:"◎", label:"Dashboard",    sub:"Today" },
  { id:"goals",         icon:"✦", label:"Goals",         sub:"Practice" },
  { id:"journal",       icon:"◌", label:"Journal",       sub:"Ritual" },
  { id:"log",           icon:"◇", label:"Log",           sub:"Record" },
  { id:"review",        icon:"◈", label:"Review",        sub:"Reflect" },
  { id:"transmission",  icon:"⟡", label:"Signal",        sub:"Transmission" },
  { id:"profile",       icon:"◉", label:"Profile",       sub:"You" },
];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function KORAApp() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [onboarded, setOnboarded]       = useState(()=>!!load("kora-profile"));
  const [profile,   setProfileState]    = useState(()=>load("kora-profile")||{});
  const [goals,     setGoalsState]      = useState(()=>load("goals")||[]);
  const [sessions,  setSessionsState]   = useState(()=>load("sessions")||load("session-log")||[]);
  const [moodLogs,  setMoodLogsState]   = useState(()=>load("mood-logs")||[]);
  const [journalEntries, setJournalState] = useState(()=>load("journal-entries")||[]);
  const [milestones, setMilestonesState] = useState(()=>load("milestones")||[]);

  const [screen,    setScreen]          = useState("dashboard");
  const [showMood,  setShowMood]        = useState(false);
  const [showSession, setShowSession]   = useState(false);
  const [sessionGoal, setSessionGoal]   = useState(null);
  const [roomDetail, setRoomDetail]     = useState(null);
  const [mobileNav, setMobileNav]       = useState(false);

  // ── Persist helpers ───────────────────────────────────────────────────────
  const setProfile  = v => { setProfileState(v);    save("kora-profile",v); };
  const setGoals    = fn => setGoalsState(prev=>{ const n=typeof fn==="function"?fn(prev):fn; save("goals",n); return n; });
  const setSessions = fn => setSessionsState(prev=>{ const n=typeof fn==="function"?fn(prev):fn; save("sessions",n); return n; });
  const setMoodLogs = fn => setMoodLogsState(prev=>{ const n=typeof fn==="function"?fn(prev):fn; save("mood-logs",n); return n; });
  const setJournal  = fn => setJournalState(prev=>{ const n=typeof fn==="function"?fn(prev):fn; save("journal-entries",n); return n; });
  const setMilestones= fn=> setMilestonesState(prev=>{ const n=typeof fn==="function"?fn(prev):fn; save("milestones",n); return n; });

  // ── Memory string for KORA API ────────────────────────────────────────────
  const memory = buildMemory(moodLogs, sessions, goals, profile);

  // ── Onboarding complete ───────────────────────────────────────────────────
  const handleOnboard = ({ name, creativeGoals, goals: initGoals }) => {
    setProfile({ name, creativeGoals });
    if (initGoals?.length) setGoals(initGoals);
    setOnboarded(true);
  };

  // ── Import handler ───────────────────────────────────────────────────────
  const handleImport = data => {
    const keys = ["kora-profile","goals","sessions","mood-logs","journal-entries","milestones"];
    keys.forEach(k => { if (data[k] != null) save(k, data[k]); });
    if (data["kora-profile"]) { setProfileState(data["kora-profile"]); setOnboarded(true); }
    if (data["goals"])              setGoalsState(data["goals"]);
    if (data["sessions"])           setSessionsState(data["sessions"]);
    if (data["mood-logs"])          setMoodLogsState(data["mood-logs"]);
    if (data["journal-entries"])    setJournalState(data["journal-entries"]);
    if (data["milestones"])         setMilestonesState(data["milestones"]);
  };

  // ── Session flow ──────────────────────────────────────────────────────────
  const startSession = goal => { setSessionGoal(goal); setShowSession(true); };
  const completeSession = session => {
    setSessions(ss=>[session,...ss]);
    setShowSession(false); setSessionGoal(null);
    setScreen("log");
  };

  // ── Nav ───────────────────────────────────────────────────────────────────
  const goTo = id => { setScreen(id); setMobileNav(false); };

  const lastMood    = moodLogs?.[0];
  const accentColor = lastMood?.color || "#E4AACA";

  // ── Render guard ──────────────────────────────────────────────────────────
  if (!onboarded) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <OnboardingScreen onComplete={handleOnboard}/>
    </>
  );

  const isMobile = typeof window!=="undefined" && window.innerWidth < 720;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Mood overlay */}
      {showMood && (
        <MoodOverlay
          onSaveMood={m=>setMoodLogs(ml=>[m,...ml])}
          onClose={()=>setShowMood(false)}
        />
      )}

      {/* Session overlay */}
      {showSession && (
        <SessionMode
          preselectedGoal={sessionGoal}
          goals={goals}
          moodLogs={moodLogs}
          onComplete={completeSession}
          onDismiss={()=>setShowSession(false)}
          memory={memory}
        />
      )}

      {/* Room detail */}
      {roomDetail && <RoomDetail room={roomDetail} onBack={()=>setRoomDetail(null)}/>}

      {/* Layout */}
      <div style={{ display:"flex",minHeight:"100vh" }}>

        {/* Sidebar */}
        <aside style={{ width:196,flexShrink:0,background:"#060610",borderRight:"1px solid rgba(255,255,255,0.042)",display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",overflowY:"auto" }}>
          {/* Brand */}
          <div style={{ padding:"28px 24px 20px" }}>
            <div style={{ fontFamily:"'Playfair Display',serif",fontSize:"1.25rem",fontWeight:300,letterSpacing:".38em",color:"#EEE9E0" }}>KORA</div>
            <div style={{ fontSize:".38rem",fontWeight:300,letterSpacing:".28em",textTransform:"uppercase",color:"#1a1828",marginTop:2 }}>Creative OS</div>
          </div>

          {/* Rooms quick-access */}
          <div style={{ padding:"0 16px 16px" }}>
            <div style={{ fontSize:".4rem",fontWeight:300,letterSpacing:".24em",textTransform:"uppercase",color:"#1a1828",marginBottom:7 }}>Rooms</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
              {ROOMS.map(r=>(
                <button key={r.id} onClick={()=>setRoomDetail(r)} title={r.name} style={{ background:"none",border:"1px solid rgba(255,255,255,0.05)",borderRadius:7,padding:"5px 7px",cursor:"pointer",fontSize:".76rem",transition:"all .2s" }} onMouseEnter={e=>{e.currentTarget.style.borderColor=`${r.color}33`;e.currentTarget.style.background=`${r.color}08`;}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.05)";e.currentTarget.style.background="none";}}>{r.emoji}</button>
              ))}
            </div>
          </div>

          <div style={{ height:1,background:"rgba(255,255,255,0.04)",margin:"0 16px 8px" }}/>

          {/* Nav items */}
          <nav style={{ flex:1,padding:"8px 0" }}>
            {NAV.map(item=>{
              const active = screen===item.id;
              return (
                <button key={item.id} onClick={()=>goTo(item.id)} style={{ width:"100%",display:"flex",alignItems:"center",gap:12,padding:"10px 20px",background:active?"rgba(255,255,255,0.04)":"none",border:"none",borderLeft:`2px solid ${active?accentColor:"transparent"}`,cursor:"pointer",textAlign:"left",transition:"all .2s" }}>
                  <span style={{ fontSize:".78rem",color:active?accentColor:"#2A2830",transition:"color .2s",flexShrink:0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".66rem",fontWeight:300,color:active?"#EEE9E0":"#3A3840",transition:"color .2s",lineHeight:1.2 }}>{item.label}</div>
                    <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".44rem",fontWeight:300,color:"#1a1828",letterSpacing:".1em" }}>{item.sub}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Mood check-in + Footer */}
          <div style={{ padding:"12px 16px 20px" }}>
            <button onClick={()=>setShowMood(true)} style={{ width:"100%",marginBottom:12,padding:"9px 12px",background:"rgba(255,255,255,0.025)",border:`1px solid ${lastMood?lastMood.color+"22":"rgba(255,255,255,0.07)"}`,borderRadius:10,cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all .25s" }} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.14)"} onMouseLeave={e=>e.currentTarget.style.borderColor=lastMood?`${lastMood.color}22`:"rgba(255,255,255,0.07)"}>
              <span style={{ fontSize:".8rem" }}>{lastMood?.emoji||"○"}</span>
              <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".5rem",fontWeight:300,color:"#3A3840",letterSpacing:".1em" }}>{lastMood?.label||"Check in"}</span>
            </button>
            <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".52rem",fontWeight:300,color:"#1a1828",lineHeight:1.6 }}>{profile?.name||""}</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:".46rem",fontWeight:300,color:"#141220" }}>{sessions.filter(s=>new Date(s.date)>=weekStart()).length} sessions this week</div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex:1,minWidth:0,padding:"48px 52px",maxWidth:760,margin:"0 auto",boxSizing:"border-box" }}>
          {screen==="dashboard" && (
            <DashboardScreen
              goals={goals} sessions={sessions} moodLogs={moodLogs} profile={profile}
              onStartSession={startSession}
              onCheckIn={()=>setShowMood(true)}
              onNav={goTo}
            />
          )}
          {screen==="goals" && (
            <GoalsScreen
              goals={goals} sessions={sessions} milestones={milestones}
              setGoals={setGoals} setMilestones={setMilestones}
              onStartSession={startSession}
            />
          )}
          {screen==="journal" && (
            <JournalScreen
              journalEntries={journalEntries}
              setJournalEntries={setJournal}
              moodLogs={moodLogs}
            />
          )}
          {screen==="log" && (
            <LogScreen sessions={sessions} setSessions={setSessions}/>
          )}
          {screen==="review" && (
            <ReviewScreen
              goals={goals} sessions={sessions} moodLogs={moodLogs}
              milestones={milestones} journalEntries={journalEntries}
            />
          )}
          {screen==="transmission" && (
            <TransmissionScreen
              moodLogs={moodLogs} sessions={sessions} goals={goals}
              profile={profile} memory={memory}
            />
          )}
          {screen==="profile" && (
            <ProfileScreen
              profile={profile} setProfile={setProfile}
              goals={goals} sessions={sessions} moodLogs={moodLogs}
              onImport={handleImport}
            />
          )}
        </main>
      </div>
    </>
  );
}
