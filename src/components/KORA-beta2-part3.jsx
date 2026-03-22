// ─────────────────────────────────────────────────────────────────────────────
// KORA Beta 2.0 — Part 3 of 3 — App Shell
// Navigation · State management · KORAApp (default export)
// ─────────────────────────────────────────────────────────────────────────────
//
// USAGE — src/App.jsx:
//   import KORAApp from "./components/KORA-beta2-part3";
//   export default function App() { return <KORAApp />; }
//
// FILE STRUCTURE:
//   src/components/KORA-beta2-part1.jsx  ← foundation
//   src/components/KORA-beta2-part2.jsx  ← screens
//   src/components/KORA-beta2-part3.jsx  ← this file
//   netlify/functions/kora.js            ← API proxy
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  save, load, buildMemory,
  ROOMS, FLOW_ZONES, C, F, GLOBAL_CSS,
  Eyebrow, GrainOverlay,
} from "./KORA-beta2-part1";
import {
  OnboardingScreen, MorningAnchorScreen, CheckInOverlay,
  RoomEnvironment, FlowFieldScreen, PracticeScreen,
  JournalScreen, RecordScreen, ReflectScreen, SignalScreen, ProfileScreen,
} from "./KORA-beta2-part2";

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  { id:"home",     icon:"◎", label:"Home",     sub:"Flow Field"    },
  { id:"practice", icon:"✦", label:"Practice", sub:"Your work"     },
  { id:"journal",  icon:"◌", label:"Journal",  sub:"Ritual"        },
  { id:"record",   icon:"◇", label:"Record",   sub:"Log"           },
  { id:"reflect",  icon:"◈", label:"Reflect",  sub:"Review"        },
  { id:"signal",   icon:"⟡", label:"Signal",   sub:"Transmission"  },
  { id:"profile",  icon:"◉", label:"Profile",  sub:"You"           },
];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function KORAApp() {

  // ── Persistence ─────────────────────────────────────────────────────────
  const [onboarded,  setOnboarded]    = useState(()=>!!load("kora-profile"));
  const [profile,    setProfileState] = useState(()=>load("kora-profile")||{});
  const [practices,  setPracticesState] = useState(()=>load("practices")||[]);
  const [sessions,   setSessionsState]  = useState(()=>load("sessions")||load("session-log")||[]);
  const [moodLogs,   setMoodLogsState]  = useState(()=>load("mood-logs")||[]);
  const [journalEntries, setJournalState] = useState(()=>load("journal-entries")||[]);

  const setProfile   = v  => { setProfileState(v);    save("kora-profile",v);     };
  const setPractices = fn => setPracticesState(prev=>{ const n=typeof fn==="function"?fn(prev):fn; save("practices",n); return n; });
  const setSessions  = fn => setSessionsState(prev=>{  const n=typeof fn==="function"?fn(prev):fn; save("sessions",n);  return n; });
  const setMoodLogs  = fn => setMoodLogsState(prev=>{  const n=typeof fn==="function"?fn(prev):fn; save("mood-logs",n); return n; });
  const setJournal   = fn => setJournalState(prev=>{   const n=typeof fn==="function"?fn(prev):fn; save("journal-entries",n); return n; });

  // ── UI State ─────────────────────────────────────────────────────────────
  const [screen,       setScreen]      = useState("home");
  const [showCheckIn,  setCheckIn]     = useState(false);
  const [showMorning,  setMorning]     = useState(false);
  const [activeRoom,   setActiveRoom]  = useState(null);
  const [roomPractice, setRoomPractice]= useState(null);

  // ── On mount: check if morning anchor should show ─────────────────────
  useEffect(() => {
    if (!onboarded) return;
    const lastAnchor = load("last-anchor");
    const today = new Date().toDateString();
    if (new Date().getHours() < 12 && lastAnchor !== today) {
      // Small delay so the app feels like it's loaded before showing anchor
      const t = setTimeout(() => setMorning(true), 1200);
      return () => clearTimeout(t);
    }
  }, [onboarded]);

  // ── Memory context for API calls ─────────────────────────────────────────
  const memory = buildMemory(moodLogs, sessions, practices, profile);

  // ── Onboarding complete ───────────────────────────────────────────────────
  const handleOnboard = ({ name, sessionData }) => {
    setProfile({ name });
    if (sessionData) setSessions([sessionData]);
    setOnboarded(true);
    setScreen("home");
  };

  // ── Morning anchor complete ───────────────────────────────────────────────
  const handleMorningDone = () => {
    save("last-anchor", new Date().toDateString());
    setMorning(false);
    setCheckIn(true); // lead straight into check-in after anchor
  };

  // ── Room navigation ───────────────────────────────────────────────────────
  const enterRoom = (room, practice=null) => {
    setActiveRoom(room);
    setRoomPractice(practice||null);
  };

  const exitRoom = () => {
    setActiveRoom(null);
    setRoomPractice(null);
  };

  const completeSession = (sessionData) => {
    setSessions(ss=>[sessionData,...ss]);
    exitRoom();
    setScreen("record");
  };

  // ── Import handler ────────────────────────────────────────────────────────
  const handleImport = (data) => {
    const map = {
      "kora-profile":    v=>setProfileState(v),
      "practices":       v=>setPracticesState(v),
      "sessions":        v=>setSessionsState(v),
      "mood-logs":       v=>setMoodLogsState(v),
      "journal-entries": v=>setJournalState(v),
    };
    Object.entries(map).forEach(([k,fn])=>{ if(data[k]!=null){save(k,data[k]);fn(data[k]);}});
    if(data["kora-profile"]){setOnboarded(true);}
    // Also handle v8.1.1 key names for backwards compat
    if(data["goals"]&&!data["practices"]){save("practices",data["goals"]);setPracticesState(data["goals"]);}
  };

  const accentColor = moodLogs?.[0]?.color || C.accent;

  // ── Render guards ─────────────────────────────────────────────────────────
  if (!onboarded) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <OnboardingScreen onComplete={handleOnboard}/>
    </>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Overlays */}
      {showCheckIn && (
        <CheckInOverlay
          onSave={m=>setMoodLogs(ml=>[m,...ml])}
          onClose={()=>setCheckIn(false)}
        />
      )}

      {showMorning && (
        <MorningAnchorScreen
          onComplete={handleMorningDone}
          onSkip={()=>{save("last-anchor",new Date().toDateString());setMorning(false);}}
          name={profile?.name}
        />
      )}

      {/* Room environment — full screen takeover */}
      {activeRoom && (
        <RoomEnvironment
          room={activeRoom}
          moodLogs={moodLogs}
          practices={practices}
          initialPractice={roomPractice}
          onComplete={completeSession}
          onBack={exitRoom}
          memory={memory}
        />
      )}

      {/* Main layout */}
      <div style={{ display:"flex", minHeight:"100vh" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width:192, flexShrink:0, background:"#040410",
          borderRight:"1px solid rgba(255,255,255,0.04)",
          display:"flex", flexDirection:"column",
          position:"sticky", top:0, height:"100vh", overflowY:"auto",
        }}>
          {/* Brand */}
          <div style={{ padding:"26px 22px 18px" }}>
            <div style={{ fontFamily:F.serif, fontSize:"1.2rem", fontWeight:300,
              letterSpacing:".42em", color:C.text }}>KORA</div>
            <div style={{ fontSize:".36rem", fontWeight:300, letterSpacing:".26em",
              textTransform:"uppercase", color:"#16141e", marginTop:2 }}>Beta 2.0</div>
          </div>

          {/* Room portals */}
          <div style={{ padding:"0 14px 14px" }}>
            <div style={{ fontSize:".38rem", fontWeight:300, letterSpacing:".22em",
              textTransform:"uppercase", color:"#16141e", marginBottom:7 }}>Rooms</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {ROOMS.map(r=>(
                <button key={r.id} onClick={()=>enterRoom(r)} title={r.name} style={{
                  background:"none", border:"1px solid rgba(255,255,255,0.05)",
                  borderRadius:8, padding:"6px 8px", cursor:"pointer",
                  fontSize:".78rem", transition:"all .22s",
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=`${r.color}44`;e.currentTarget.style.background=`${r.color}0a`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.05)";e.currentTarget.style.background="none";}}>
                  {r.emoji}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height:1, background:"rgba(255,255,255,0.04)", margin:"0 14px 6px" }}/>

          {/* Nav */}
          <nav style={{ flex:1, padding:"6px 0" }}>
            {NAV.map(item=>{
              const active = screen===item.id;
              return (
                <button key={item.id} onClick={()=>setScreen(item.id)} className="kora-nav-item"
                  style={{
                    width:"100%", display:"flex", alignItems:"center", gap:11,
                    padding:"10px 18px", background:active?"rgba(255,255,255,0.04)":"none",
                    border:"none", borderLeft:`2px solid ${active?accentColor:"transparent"}`,
                    cursor:"pointer", textAlign:"left", transition:"all .2s",
                  }}>
                  <span style={{ fontSize:".74rem", color:active?accentColor:"#242230",
                    transition:"color .2s", flexShrink:0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily:F.sans, fontSize:".64rem", fontWeight:300,
                      color:active?C.text:"#3A3848", transition:"color .2s", lineHeight:1.2 }}>{item.label}</div>
                    <div style={{ fontFamily:F.sans, fontSize:".42rem", fontWeight:300,
                      color:"#16141e", letterSpacing:".08em" }}>{item.sub}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Check-in + footer */}
          <div style={{ padding:"10px 14px 20px" }}>
            <button onClick={()=>setCheckIn(true)} style={{
              width:"100%", marginBottom:10, padding:"9px 12px",
              background:"rgba(255,255,255,0.025)",
              border:`1px solid ${moodLogs?.[0]?moodLogs[0].color+"22":"rgba(255,255,255,0.06)"}`,
              borderRadius:10, cursor:"pointer",
              display:"flex", alignItems:"center", gap:8, transition:"all .25s",
            }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.14)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=moodLogs?.[0]?`${moodLogs[0].color}22`:"rgba(255,255,255,0.06)"}>
              <span style={{ fontSize:".78rem" }}>{moodLogs?.[0]?.emoji||"○"}</span>
              <span style={{ fontFamily:F.sans, fontSize:".48rem", fontWeight:300,
                color:"#3A3848", letterSpacing:".08em" }}>{moodLogs?.[0]?.label||"Check in"}</span>
            </button>
            <div style={{ fontFamily:F.sans, fontSize:".5rem", fontWeight:300, color:"#1a1828" }}>
              {profile?.name||""}</div>
            {profile?.season && (
              <div style={{ fontFamily:F.serif, fontStyle:"italic", fontSize:".46rem",
                color:"#141220", marginTop:2, lineHeight:1.5 }}>{profile.season}</div>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{
          flex:1, minWidth:0, padding:"46px 52px",
          maxWidth:740, margin:"0 auto", boxSizing:"border-box",
        }}>
          {screen==="home" && (
            <FlowFieldScreen
              sessions={sessions} practices={practices}
              moodLogs={moodLogs} profile={profile}
              onEnterRoom={enterRoom}
              onCheckIn={()=>setCheckIn(true)}
              onNav={setScreen}
            />
          )}
          {screen==="practice" && (
            <PracticeScreen
              practices={practices} sessions={sessions}
              setPractices={setPractices}
              onEnterRoom={enterRoom}
            />
          )}
          {screen==="journal" && (
            <JournalScreen
              journalEntries={journalEntries}
              setJournalEntries={setJournal}
              moodLogs={moodLogs}
            />
          )}
          {screen==="record" && (
            <RecordScreen sessions={sessions} setSessions={setSessions}/>
          )}
          {screen==="reflect" && (
            <ReflectScreen
              sessions={sessions} moodLogs={moodLogs}
              journalEntries={journalEntries} practices={practices}
            />
          )}
          {screen==="signal" && (
            <SignalScreen
              moodLogs={moodLogs} sessions={sessions}
              practices={practices} profile={profile} memory={memory}
            />
          )}
          {screen==="profile" && (
            <ProfileScreen
              profile={profile} setProfile={setProfile}
              sessions={sessions} moodLogs={moodLogs}
              onImport={handleImport}
            />
          )}
        </main>
      </div>
    </>
  );
}
