// ─────────────────────────────────────────────────────────────────────────────
// KORA Beta 2.0 — Part 1 of 3 — Foundation
// Constants · Storage · API · Helpers · Style atoms · Shared components
// ─────────────────────────────────────────────────────────────────────────────
//
// NETLIFY FUNCTION — create /netlify/functions/kora.js:
//
//   exports.handler = async (event) => {
//     const response = await fetch("https://api.anthropic.com/v1/messages", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "anthropic-version": "2023-06-01",
//         "x-api-key": process.env.ANTHROPIC_API_KEY,
//       },
//       body: event.body,
//     });
//     const data = await response.json();
//     return { statusCode: response.status, body: JSON.stringify(data),
//       headers: { "Content-Type": "application/json" } };
//   };
//
// Set ANTHROPIC_API_KEY in Netlify environment variables.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";

// ─── API ──────────────────────────────────────────────────────────────────────
export async function callKORA(messages, system) {
  try {
    const res = await fetch("/.netlify/functions/kora", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 400,
        system: system || KORA_SYSTEM,
        messages: messages.slice(-8),
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.content?.[0]?.text || null;
  } catch (err) {
    console.warn("KORA API:", err.message);
    throw err;
  }
}

export const KORA_SYSTEM = `You are KORA — a calm creative operating system.
Voice: slow, warm, poetic. You guide energy, not tasks.
Never mention productivity, goals, or completion.
Speak to state. 2–3 sentences maximum. End with a soft invitation, never a command.`;

// ─── STORAGE ──────────────────────────────────────────────────────────────────
export const save  = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
export const load  = (k, fb = null) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };

export const exportData = () => {
  const keys = ["kora-profile","practices","sessions","mood-logs","journal-entries","touchpoints","reviews"];
  const data = {}; keys.forEach(k => { data[k] = load(k); });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `kora-export-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(url);
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

// Check-in states — 4 clean options
export const CHECK_IN_STATES = [
  { id:"overwhelmed", label:"Overwhelmed", emoji:"🌪", color:"#8BA7C4", sub:"Let's slow this down.", room:"ground" },
  { id:"low",         label:"Low",         emoji:"🌙", color:"#9B8FB5", sub:"We'll keep it light.",  room:"ground" },
  { id:"focused",     label:"Focused",     emoji:"🔥", color:"#C4906A", sub:"Let's use that.",       room:"flow"   },
  { id:"flow",        label:"Flow",        emoji:"🌊", color:"#6AABAA", sub:"Let's go.",             room:"flow"   },
];

// Flow Field zones — the new dashboard centerpiece
export const FLOW_ZONES = [
  { id:"movement", label:"Movement", emoji:"🌊", color:"#6AABAA", dark:"#060f0e", practices:["Walk","Run","Yoga","Stretch","Gym","Dance"] },
  { id:"head",     label:"Head",     emoji:"🧠", color:"#8BA7C4", dark:"#060a10", practices:["Reading","Research","Planning","Learning","Strategy"] },
  { id:"hands",    label:"Hands",    emoji:"✋", color:"#C4906A", dark:"#100806", practices:["Drawing","Guitar","Photography","Writing","Cooking"] },
  { id:"life",     label:"Life",     emoji:"🧼", color:"#9B8FB5", dark:"#0a0810", practices:["Clean","Admin","Finance","Health","Relationships"] },
  { id:"joy",      label:"Joy",      emoji:"✨", color:"#C4B06A", dark:"#100e06", practices:["Film","Music","Friends","Nature","Create freely"] },
];

// Rooms — state environments
export const ROOMS = [
  {
    id:"flow", emoji:"🌊", name:"Flow", purpose:"Deep creation",
    color:"#6AABAA", dark:"#04100f",
    gradient:"radial-gradient(ellipse at 35% 45%, #0a2422 0%, #040c0a 100%)",
    arrive:"Arrive.", breathe:"Breathe.", prompt:"What wants to move?",
    closure:"What came through?",
    tags:["Creation","Momentum","Immersion"],
    youtubeDefault:"PLjeOes9C3bCsOqCPGcv49UwMYlz1zEiQg",
    // Color system: deep navy → soft indigo → muted teal, amber glow overlay
  },
  {
    id:"focus", emoji:"🔥", name:"Focus", purpose:"Intense work",
    color:"#C4906A", dark:"#100804",
    gradient:"radial-gradient(ellipse at 40% 35%, #241408 0%, #0c0604 100%)",
    arrive:"Arrive.", breathe:"Settle.", prompt:"One target. What is it?",
    closure:"What did you build?",
    tags:["Deep Work","Clarity","Output"],
    youtubeDefault:"PLjeOes9C3bCsOqCPGcv49UwMYlz1zEiQg",
  },
  {
    id:"ground", emoji:"🌙", name:"Ground", purpose:"Body reset",
    color:"#9B8FB5", dark:"#080610",
    gradient:"radial-gradient(ellipse at 50% 60%, #140e20 0%, #060408 100%)",
    arrive:"Arrive.", breathe:"Breathe slowly.", prompt:"Nothing to do. Just be here.",
    closure:"How does your body feel now?",
    tags:["Reset","Slow","Calm"],
    youtubeDefault:"PLjeOes9C3bCsOqCPGcv49UwMYlz1zEiQg",
  },
  {
    id:"explore", emoji:"🌧", name:"Explore", purpose:"Curiosity & ideas",
    color:"#8BA7C4", dark:"#060a10",
    gradient:"radial-gradient(ellipse at 55% 40%, #0c1420 0%, #040608 100%)",
    arrive:"Arrive.", breathe:"Let the mind open.", prompt:"What are you curious about?",
    closure:"Did anything emerge?",
    tags:["Ideas","Wandering","Discovery"],
    youtubeDefault:"PLjeOes9C3bCsOqCPGcv49UwMYlz1zEiQg",
  },
  {
    id:"night", emoji:"🌌", name:"Night", purpose:"Closure",
    color:"#6B7FAE", dark:"#04060e",
    gradient:"radial-gradient(ellipse at 50% 25%, #0c1028 0%, #040408 100%)",
    arrive:"The day closes.", breathe:"One breath.", prompt:"What wants to be released?",
    closure:"Transmission saved.",
    tags:["Reflection","Closure","Integration"],
    youtubeDefault:"PLjeOes9C3bCsOqCPGcv49UwMYlz1zEiQg",
  },
];

// State → Room routing
export const STATE_TO_ROOM = {
  overwhelmed: "ground",
  low:         "ground",
  focused:     "focus",
  flow:        "flow",
};

export const SESSION_DURATIONS = [
  { mins:5,  label:"5"  },
  { mins:10, label:"10" },
  { mins:25, label:"25" },
  { mins:45, label:"45" },
];

export const LOG_TAGS = [
  { id:"content",  emoji:"🎥", label:"Content"  },
  { id:"photo",    emoji:"📸", label:"Photo"    },
  { id:"writing",  emoji:"✍️", label:"Writing"  },
  { id:"insight",  emoji:"💭", label:"Insight"  },
  { id:"life",     emoji:"🌿", label:"Life"     },
];

export const CREATOR_TYPES = ["Photographer","Filmmaker","Visual Artist","Illustrator","Designer","Writer","Musician","Other"];

export const MORNING_ANCHOR = [
  { id:"bed",   label:"Make your bed",   emoji:"🛏" },
  { id:"teeth", label:"Brush your teeth", emoji:"🦷" },
  { id:"water", label:"Drink water",      emoji:"💧" },
];

// AI transmission fallbacks per time of day
export const TX_FALLBACKS = {
  morning: "Before the world arrives — what does the work need from you today?",
  midday:  "Midday. Push, pause, or recalibrate?",
  evening: "What moved forward today — even one small thing?",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const uid        = () => `${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
export const todayStr   = () => new Date().toDateString();
export const weekStart  = () => { const d=new Date(); d.setDate(d.getDate()-d.getDay()); d.setHours(0,0,0,0); return d; };
export const fmtTime    = s  => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
export const getRoom    = id => ROOMS.find(r=>r.id===id) || ROOMS[0];
export const getZone    = id => FLOW_ZONES.find(z=>z.id===id) || FLOW_ZONES[0];
export const getState   = id => CHECK_IN_STATES.find(s=>s.id===id);

export const tod = () => {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "midday" : "evening";
};

export const greet = (name) => {
  const h = new Date().getHours();
  const base = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return name ? `${base}, ${name.split(" ")[0]}.` : `${base}.`;
};

export const isMorning = () => new Date().getHours() < 12;

export const daysSince = (dateStr) => {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
};

export const buildMemory = (moodLogs, sessions, practices, profile) => {
  const p = [];
  if (moodLogs?.length)   p.push(`Recent states: ${moodLogs.slice(0,3).map(l=>`${l.emoji} ${l.label}`).join(", ")}.`);
  if (sessions?.length)   p.push(`Recent sessions: ${sessions.slice(0,3).map(s=>`${s.practiceTitle||"session"} ${s.duration}min in ${s.roomId}`).join(", ")}.`);
  if (practices?.length)  p.push(`Practices: ${practices.filter(p=>!p.archived).map(p=>p.title).join(", ")}.`);
  if (profile?.name)      p.push(`Name: ${profile.name}.`);
  if (profile?.season)    p.push(`Current season: ${profile.season}.`);
  return p.length ? `\n\n[CONTEXT]\n${p.join(" ")}` : "";
};

// ─── STYLE ATOMS ──────────────────────────────────────────────────────────────
export const C = {
  bg:      "#06060e",
  bgAlt:   "#09090f",
  surface: "rgba(255,255,255,0.03)",
  border:  "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.16)",
  text:    "#E8E4DE",
  textSub: "#5A5668",
  textDim: "#2A2838",
  accent:  "#D4A87A",
};

export const F = {
  serif: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  sans:  "'DM Sans', 'Helvetica Neue', sans-serif",
};

export const iSt = {
  width:"100%", background:"rgba(255,255,255,0.03)",
  border:"1px solid rgba(255,255,255,0.08)", borderRadius:10,
  padding:"12px 16px", fontFamily:F.sans, fontSize:".86rem",
  fontWeight:300, color:C.text, outline:"none", boxSizing:"border-box",
};

export const taSt = (h=80) => ({ ...iSt, resize:"none", minHeight:h, lineHeight:1.75 });

export const btnPrimary = (color=C.accent) => ({
  width:"100%", background:color, border:"none", borderRadius:12,
  padding:"14px", fontFamily:F.sans, fontSize:".62rem", fontWeight:400,
  letterSpacing:".22em", textTransform:"uppercase", color:"#06060e",
  cursor:"pointer", transition:"all .3s",
});

export const btnGhost = {
  background:"none", border:"1px solid rgba(255,255,255,0.09)", borderRadius:11,
  padding:"11px 20px", fontFamily:F.sans, fontSize:".58rem", fontWeight:300,
  letterSpacing:".18em", textTransform:"uppercase", color:C.textSub, cursor:"pointer",
  transition:"all .25s",
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

export const Dots = ({ color = "#555" }) => (
  <span style={{ display:"inline-flex", gap:5, alignItems:"center" }}>
    {[0,1,2].map(i => (
      <span key={i} style={{ display:"inline-block", width:5, height:5, borderRadius:"50%",
        background:color, animation:`kdot 1.3s ease-in-out ${i*0.2}s infinite` }}/>
    ))}
  </span>
);

export const Eyebrow = ({ t, color = "rgba(212,168,122,0.65)" }) => (
  <div style={{ fontSize:".44rem", fontWeight:300, letterSpacing:".32em",
    textTransform:"uppercase", color, marginBottom:6 }}>{t}</div>
);

export const PageTitle = ({ children, style={} }) => (
  <div style={{ fontFamily:F.serif, fontSize:"clamp(1.5rem,2.4vw,2rem)",
    fontWeight:300, color:C.text, lineHeight:1.2, ...style }}>{children}</div>
);

export const SectionLabel = ({ t }) => (
  <div style={{ fontSize:".42rem", fontWeight:300, letterSpacing:".26em",
    textTransform:"uppercase", color:C.textDim, marginBottom:10 }}>{t}</div>
);

export function Reveal({ children, delay=0, style={} }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 60+delay); return () => clearTimeout(t); }, []);
  return (
    <div style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(10px)",
      transition:`opacity .5s ease ${delay}ms, transform .5s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

// Breathing glow — the signature KORA animation
export function BreathingGlow({ color="#6AABAA", intensity=0.08 }) {
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
      <div style={{
        position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%,-50%)",
        width:"60vw", height:"60vw", borderRadius:"50%",
        background:`radial-gradient(circle, ${color}${Math.round(intensity*255).toString(16).padStart(2,"0")} 0%, transparent 70%)`,
        animation:"breathe 5s ease-in-out infinite",
      }}/>
    </div>
  );
}

// Grain texture overlay
export function GrainOverlay({ opacity=0.035 }) {
  return (
    <div style={{
      position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
      backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      opacity,
    }}/>
  );
}

// Global CSS — all keyframes live here
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@200;300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    background: #06060e;
    color: #E8E4DE;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  ::selection { background: rgba(212,168,122,0.18); }
  ::-webkit-scrollbar { width: 2px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }
  input, textarea, button { font-family: inherit; }
  input::placeholder, textarea::placeholder { color: #2A2838; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes kdot {
    0%,80%,100% { transform:scale(0.5); opacity:0.3; }
    40%         { transform:scale(1);   opacity:1;   }
  }
  @keyframes breathe {
    0%,100% { transform:translate(-50%,-50%) scale(1);    opacity:0.7; }
    50%     { transform:translate(-50%,-50%) scale(1.12); opacity:1;   }
  }
  @keyframes drift {
    0%,100% { transform:translate(-50%,-50%) scale(1)    rotate(0deg);   }
    33%     { transform:translate(-52%,-48%) scale(1.04) rotate(2deg);   }
    66%     { transform:translate(-48%,-52%) scale(0.97) rotate(-1.5deg);}
  }
  @keyframes ripple {
    from { transform:translate(-50%,-50%) scale(0); opacity:0.4; }
    to   { transform:translate(-50%,-50%) scale(3); opacity:0;   }
  }
  @keyframes slideUp {
    from { transform:translateY(100%); opacity:0; }
    to   { transform:translateY(0);    opacity:1; }
  }
  @keyframes textFade {
    0%   { opacity:0; transform:translateY(8px); }
    20%  { opacity:1; transform:translateY(0);   }
    80%  { opacity:1; transform:translateY(0);   }
    100% { opacity:0; transform:translateY(-4px);}
  }

  .kora-btn-ghost:hover { border-color: rgba(255,255,255,0.22) !important; color: #E8E4DE !important; }
  .kora-zone-card:hover { transform: translateY(-2px); }
  .kora-nav-item:hover  { background: rgba(255,255,255,0.04) !important; }
`;
