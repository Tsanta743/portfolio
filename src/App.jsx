import { useState, useEffect, useRef, useCallback } from "react";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/devicon/2.15.1/devicon.min.css');

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
:root {
  --bg:#050508; --bg2:#08080e; --surf:#0e0e18; --surf2:#141424;
  --b1:rgba(255,255,255,0.06); --b2:rgba(255,255,255,0.12);
  --c1:#00d4ff; --c2:#7c3aed; --c3:#06ffa5; --c4:#ff6b6b;
  --tx:#f0f0f8; --mu:#5a5a7a; --mu2:#8a8aaa;
  --mono:'JetBrains Mono',monospace;
  --sans:'Syne',sans-serif;
}
html { scroll-behavior:smooth; }
body { background:var(--bg); color:var(--tx); font-family:var(--sans); overflow-x:hidden; cursor:none; }
body::after {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:9990;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
}

/* cursor */
#cur,#curb { position:fixed;pointer-events:none;z-index:9999;border-radius:50%;transform:translate(-50%,-50%); }
#cur { width:10px;height:10px;background:var(--c1);mix-blend-mode:difference;transition:transform .1s; }
#curb { width:38px;height:38px;background:rgba(0,212,255,.09);border:1px solid rgba(0,212,255,.22);transition:left .12s ease,top .12s ease,width .3s,height .3s; }

/* page transitions */
.page-enter { animation:pageIn .45s cubic-bezier(.23,1,.32,1) both; }
@keyframes pageIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

/* grid bg */
.grid-bg {
  position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);
  background-size:80px 80px;
  mask-image:radial-gradient(ellipse at 50% 50%,black 20%,transparent 75%);
}

/* orbs */
.orb { position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;animation:drift 9s ease-in-out infinite alternate; }
.orb1{width:500px;height:500px;background:radial-gradient(circle,rgba(124,58,237,.16),transparent 70%);top:-120px;right:-80px;}
.orb2{width:400px;height:400px;background:radial-gradient(circle,rgba(0,212,255,.11),transparent 70%);bottom:-80px;left:-80px;animation-delay:-5s;}
.orb3{width:250px;height:250px;background:radial-gradient(circle,rgba(6,255,165,.08),transparent 70%);top:45%;left:42%;animation-delay:-3s;}
@keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(25px,18px) scale(1.06)}}

/* scrollbar */
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:rgba(0,212,255,.25);border-radius:4px}
`;

/* ─── SVG icons ─── */
const Icon = ({ d, size = 20, strokeWidth = 1.7, style = {}, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" style={style} {...props}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const icons = {
  mail: ["M2 4h20v16H2z", "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"],
  phone: ["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17l.92-.08Z"],
  pin: ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", "M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"],
  arrow: ["M5 12h14", "m12 5 7 7-7 7"],
  grad: ["M22 10v6", "M2 10l10-5 10 5-10 5z", "M6 12v5c3 3 9 3 12 0v-5"],
  book: ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  home: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  layers: ["M12 2 2 7l10 5 10-5-10-5z", "M2 17l10 5 10-5", "M2 12l10 5 10-5"],
  server: [],
  code: ["M16 18 22 12 16 6", "M8 6 2 12 8 18"],
  wifi: ["M5 12.55a11 11 0 0 1 14.08 0", "M1.42 9a16 16 0 0 1 21.16 0", "M8.53 16.11a6 6 0 0 1 6.95 0", "M12 20h.01"],
  terminal: ["M4 17 10 11 4 5", "M12 19h8"],
  music: ["M9 18V5l12-2v13", "M6 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M18 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  sport: ["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z", "M4.93 4.93 19.07 19.07", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"],
  menu: ["M3 12h18", "M3 6h18", "M3 18h18"],
  x: ["M18 6 6 18", "M6 6l12 12"],
  camera: ["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z", "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  user: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  upload: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  star: ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  award: ["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M8.21 13.89 7 23l5-3 5 3-1.21-9.12"],
  globe: ["M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"],
  building: ["M3 21h18", "M5 21V7l8-4v18", "M19 21V11l-6-4", "M9 9h1", "M9 13h1", "M9 17h1", "M14 13h1", "M14 17h1"],
  users: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  cpu: ["M18 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z", "M9 9h6v6H9z", "M9 1v3", "M15 1v3", "M9 20v3", "M15 20v3", "M20 9h3", "M20 14h3", "M1 9h3", "M1 14h3"],
  lightbulb: ["M9 18h6", "M10 22h4", "M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"],
};

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */
const navStyle = {
  position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
  padding: "1.3rem 3.5rem",
  display: "flex", justifyContent: "space-between", alignItems: "center",
  background: "rgba(5,5,8,0.75)", backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

function Nav({ page, setPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { id: "portfolio", label: "Portfolio" },
    { id: "eni", label: "À propos — ENI" },
  ];
  const portfolioAnchors = ["skills", "experience", "formation", "contact"];

  return (
    <nav style={navStyle}>
      <div style={{ fontFamily: "var(--mono)", fontSize: ".8rem", color: "var(--c1)", letterSpacing: ".12em", display: "flex", alignItems: "center", gap: ".5rem" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c3)", display: "inline-block", animation: "blink 2s ease-in-out infinite" }} />
        tsantatiana.dev
      </div>
      {/* Desktop nav */}
      <ul style={{ display: "flex", gap: "2rem", listStyle: "none", alignItems: "center" }}>
        {links.map(l => (
          <li key={l.id}>
            <button onClick={() => setPage(l.id)} style={{
              fontFamily: "var(--mono)", fontSize: ".72rem", color: page === l.id ? "var(--c1)" : "var(--mu2)",
              background: "none", border: "none", cursor: "none", letterSpacing: ".1em",
              borderBottom: page === l.id ? "1px solid var(--c1)" : "1px solid transparent",
              paddingBottom: "2px", transition: "color .2s",
            }}>{l.label}</button>
          </li>
        ))}
        {page === "portfolio" && portfolioAnchors.map(a => (
          <li key={a}>
            <a href={`#${a}`} style={{
              fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--mu2)",
              textDecoration: "none", letterSpacing: ".1em", transition: "color .2s",
            }}
              onMouseEnter={e => e.target.style.color = "var(--c1)"}
              onMouseLeave={e => e.target.style.color = "var(--mu2)"}
            >{a.charAt(0).toUpperCase() + a.slice(1)}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}



/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = () => {
      start += Math.ceil(target / 30);
      if (start >= target) { setVal(target); return; }
      setVal(start);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val}{suffix}</>;
}

/* ─────────────────────────────────────────────
   REVEAL HOOK
───────────────────────────────────────────── */
function useReveal() {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─────────────────────────────────────────────
   SKILL CARD
───────────────────────────────────────────── */
function SkillCard({ icon, cat, pills, grad }) {
  const [hover, setHover] = useState(false);
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      background: "var(--surf)", border: "1px solid var(--b1)",
      borderRadius: 14, padding: "1.6rem 1.8rem",
      position: "relative", overflow: "hidden",
      transition: "all .3s cubic-bezier(.23,1,.32,1)",
      transform: hover ? "translateY(-6px)" : vis ? "translateY(0)" : "translateY(20px)",
      opacity: vis ? 1 : 0,
      boxShadow: hover ? "0 20px 55px rgba(0,0,0,.4)" : "none",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: grad, borderRadius: "14px 14px 0 0",
        transform: `scaleX(${hover ? 1 : 0})`, transformOrigin: "left",
        transition: "transform .35s ease",
      }} />
      <div style={{ fontSize: "1.6rem", marginBottom: ".7rem", color: "var(--c1)" }}>{icon}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--mu2)", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: ".7rem" }}>{cat}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem" }}>
        {pills.map(([label, iconEl]) => (
          <span key={label} style={{
            fontFamily: "var(--mono)", fontSize: ".7rem",
            padding: ".32rem .7rem", borderRadius: 5,
            background: hover ? "rgba(0,212,255,.06)" : "var(--surf2)",
            border: hover ? "1px solid rgba(0,212,255,.2)" : "1px solid var(--b1)",
            color: hover ? "var(--c1)" : "var(--mu2)",
            transition: "all .2s",
            display: "flex", alignItems: "center", gap: ".3rem",
          }}>
            {iconEl && <i className={iconEl} style={{ fontSize: "1rem" }} />}
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TIMELINE ITEM
───────────────────────────────────────────── */
function ExpItem({ role, org, date, desc, delay = 0 }) {
  const [ref, vis] = useReveal();
  const [hover, setHover] = useState(false);
  return (
    <div ref={ref} style={{
      position: "relative", marginBottom: "2.5rem", paddingLeft: "3rem",
      opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-20px)",
      transition: `opacity .6s ${delay}s ease, transform .6s ${delay}s ease`,
    }}>
      {/* dot */}
      <div style={{
        position: "absolute", left: "7px", top: ".35rem",
        width: hover ? 18 : 14, height: hover ? 18 : 14, borderRadius: "50%",
        background: hover ? "var(--c1)" : "var(--bg)",
        border: "2px solid var(--c1)",
        boxShadow: `0 0 ${hover ? 22 : 12}px rgba(0,212,255,${hover ? .8 : .4})`,
        transition: "all .3s", marginLeft: hover ? -2 : 0,
      }} />
      <div
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          background: "var(--surf)", border: `1px solid ${hover ? "rgba(0,212,255,.25)" : "var(--b1)"}`,
          borderRadius: 14, padding: "1.8rem 2rem",
          transform: hover ? "translateX(8px)" : "none",
          transition: "all .3s cubic-bezier(.23,1,.32,1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".8rem", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-.02em", marginBottom: ".3rem" }}>{role}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--c2)", display: "flex", alignItems: "center", gap: ".4rem" }}>
              <span style={{ width: ".5rem", height: 1, background: "var(--c2)", display: "inline-block" }} />{org}
            </div>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--c1)", background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", padding: ".28rem .78rem", borderRadius: 5 }}>{date}</div>
        </div>
        <p style={{ fontSize: ".93rem", color: "var(--mu2)", lineHeight: 1.78 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LANG BAR
───────────────────────────────────────────── */
function LangBar({ name, level, pct }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{ marginBottom: "1.6rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
        <span style={{ fontWeight: 700 }}>{name}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".66rem", color: "var(--mu2)" }}>{level}</span>
      </div>
      <div style={{ height: 3, background: "var(--surf2)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", background: "linear-gradient(90deg,var(--c1),var(--c2))",
          borderRadius: 2,
          width: vis ? `${pct}%` : "0%",
          transition: "width 1.1s cubic-bezier(.23,1,.32,1) .2s",
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONTACT CARD
───────────────────────────────────────────── */
function CCard({ iconD, label, value, href }) {
  const [h, setH] = useState(false);
  const Tag = href ? "a" : "div";
  return (
    <Tag href={href} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "var(--surf)", border: `1px solid ${h ? "rgba(0,212,255,.28)" : "var(--b1)"}`,
        borderRadius: 13, padding: "1.4rem 1.7rem",
        textDecoration: "none", color: "var(--tx)",
        display: "flex", alignItems: "center", gap: "1.1rem",
        transition: "all .3s cubic-bezier(.23,1,.32,1)",
        transform: h ? "translateY(-4px)" : "none",
        boxShadow: h ? "0 16px 40px rgba(0,0,0,.4)" : "none",
        cursor: href ? "none" : "default",
      }}>
      <div style={{
        width: 46, height: 46, borderRadius: 11, flexShrink: 0,
        background: h ? "rgba(0,212,255,.15)" : "rgba(0,212,255,.08)",
        border: "1px solid rgba(0,212,255,.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .3s",
        boxShadow: h ? "0 0 18px rgba(0,212,255,.2)" : "none",
        color: "var(--c1)",
      }}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          {iconD.map((p, i) => <path key={i} d={p} />)}
        </svg>
      </div>
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".63rem", color: "var(--mu)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".22rem" }}>{label}</div>
        <div style={{ fontSize: ".88rem", fontWeight: 600 }}>{value}</div>
      </div>
    </Tag>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
function SecHeader({ num, title, accent }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{
      display: "flex", alignItems: "baseline", gap: "1.4rem", marginBottom: "3.5rem",
      opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)",
      transition: "opacity .7s ease, transform .7s ease",
    }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--mu)", letterSpacing: ".1em" }}>{num}</span>
      <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.9rem)", fontWeight: 800, letterSpacing: "-.03em" }}>
        {title}{" "}
        <em style={{ fontStyle: "normal", position: "relative", display: "inline-block" }}>
          {accent}
          <span style={{
            position: "absolute", bottom: ".08em", left: 0, right: 0, height: ".1em",
            background: "linear-gradient(90deg,var(--c1),var(--c2))", borderRadius: 2, zIndex: -1, opacity: .5,
          }} />
        </em>
      </h2>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(255,255,255,.12), transparent)" }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: PORTFOLIO
───────────────────────────────────────────── */
function PortfolioPage({ photo, setPhoto }) {
  const skills = [
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
      cat: "Frontend", grad: "linear-gradient(90deg,#00d4ff,#7c3aed)",
      pills: [["React JS", "devicon-react-original"], ["Tailwind CSS", "devicon-tailwindcss-plain"], ["UX / UI", null]],
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
      cat: "Backend", grad: "linear-gradient(90deg,#7c3aed,#06ffa5)",
      pills: [["Node.js", "devicon-nodejs-plain"], ["Laravel", "devicon-laravel-plain"], ["PHP", "devicon-php-plain"], ["WordPress", "devicon-wordpress-plain"]],
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
      cat: "Langages", grad: "linear-gradient(90deg,#06ffa5,#00d4ff)",
      pills: [["Java", "devicon-java-plain"], ["Python", "devicon-python-plain"], ["C#", "devicon-csharp-plain"]],
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>,
      cat: "Réseau & VoIP", grad: "linear-gradient(90deg,#ff6b6b,#7c3aed)",
      pills: [["VoIP", null], ["Asterisk", null]],
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>,
      cat: "SysAdmin", grad: "linear-gradient(90deg,#00d4ff,#ff6b6b)",
      pills: [["Debian", "devicon-debian-plain"], ["Windows Server", "devicon-windows8-plain"]],
    },
    {
      icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>,
      cat: "Méthodes & Autres", grad: "linear-gradient(90deg,#06ffa5,#ff6b6b)",
      pills: [["Merise", null], ["UML", null], ["Arduino", "devicon-arduino-plain"]],
    },
  ];

  const eduIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
  const bookIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
  const homeIcon = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );

  const formation = [
    { icon: eduIcon, degree: "2ème année de Maîtrise — Informatique Générale", school: "École Nationale d'Informatique · Fianarantsoa", date: "01/2026 → Présent", badge: "En cours" },
    { icon: bookIcon, degree: "1ère année de Maîtrise — Informatique Générale", school: "École Nationale d'Informatique · Fianarantsoa", date: "01/2025 → 12/2025" },
    { icon: bookIcon, degree: "Licence 3 — Informatique Générale", school: "École Nationale d'Informatique · Fianarantsoa", date: "01/2024 → 12/2024" },
    { icon: bookIcon, degree: "Licence 2 — Informatique Générale", school: "École Nationale d'Informatique · Fianarantsoa", date: "01/2023 → 12/2023" },
    { icon: bookIcon, degree: "Licence 1 — Informatique Générale", school: "École Nationale d'Informatique · Fianarantsoa", date: "11/2021 → 11/2022" },
    { icon: homeIcon, degree: "Baccalauréat — Série D", school: "Lycée Ampitatafika · Antananarivo", date: "10/2020 → 08/2021", badge: "Assez Bien" },
  ];

  return (
    <div className="page-enter">
      {/* ── HERO ── */}
      <section id="hero" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", padding: "0 3.5rem", position: "relative", overflow: "hidden" }}>
        <div className="grid-bg" />
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />

        {/* left */}
        <div style={{ position: "relative", zIndex: 2, animation: "pageIn .7s ease both" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: ".6rem",
            fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--c3)",
            letterSpacing: ".18em", textTransform: "uppercase",
            padding: ".45rem 1.1rem", border: "1px solid rgba(6,255,165,.25)",
            borderRadius: 100, background: "rgba(6,255,165,.05)", marginBottom: "2rem",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c3)", animation: "blink 1.5s infinite" }} />
            Disponible · Ouvert aux opportunités
          </div>
          <h1 style={{ fontSize: "clamp(3rem,5.5vw,5.8rem)", fontWeight: 800, lineHeight: .95, letterSpacing: "-.03em", marginBottom: "1.2rem" }}>
            <span style={{ display: "block" }}>Tsantatiana</span>
            <span style={{ display: "block", background: "linear-gradient(135deg,var(--c1) 0%,var(--c2) 55%,var(--c4) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Fandresena
            </span>
            <span style={{ display: "block" }}>Rahandrisoa</span>
          </h1>
          <p style={{ fontFamily: "var(--mono)", fontSize: ".88rem", color: "var(--mu2)", letterSpacing: ".05em", marginBottom: "1.8rem" }}>
            <strong style={{ color: "var(--c1)" }}>Développeur Full Stack</strong> & Administrateur Système & Réseau
          </p>
          <p style={{ fontSize: "1rem", color: "var(--mu2)", lineHeight: 1.78, maxWidth: 480, marginBottom: "2.5rem" }}>
            Je conçois des applications web performantes et gère des infrastructures réseau robustes. Expert en React, Laravel, VoIP et administration serveur Linux.
          </p>
          <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap" }}>
            <a href="#contact" style={{
              fontFamily: "var(--mono)", fontSize: ".78rem", letterSpacing: ".08em",
              padding: ".88rem 2rem", borderRadius: 8, textDecoration: "none",
              background: "linear-gradient(135deg,var(--c1),var(--c2))",
              color: "#fff", boxShadow: "0 0 28px rgba(0,212,255,.28)",
              display: "flex", alignItems: "center", gap: ".5rem",
              transition: "all .3s cubic-bezier(.23,1,.32,1)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              Me contacter
            </a>
            <a href="#skills" style={{
              fontFamily: "var(--mono)", fontSize: ".78rem", letterSpacing: ".08em",
              padding: ".88rem 2rem", borderRadius: 8, textDecoration: "none",
              background: "transparent", color: "var(--mu2)",
              border: "1px solid rgba(255,255,255,.12)",
              display: "flex", alignItems: "center", gap: ".5rem",
              transition: "all .3s",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              Mon parcours
            </a>
          </div>
        </div>

        {/* right — floating card with photo */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{
            background: "var(--surf)", border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 20, padding: "2.4rem", width: 320,
            animation: "floatUp 6s ease-in-out infinite",
            boxShadow: "0 40px 80px rgba(0,0,0,.55)",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: -1, borderRadius: 20, zIndex: -1, filter: "blur(8px)",
              background: "linear-gradient(135deg,rgba(0,212,255,.18),rgba(124,58,237,.18),rgba(6,255,165,.1))",
            }} />
            
            <div style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: ".22rem", textAlign: "center" }}>Tsantatiana F.R.</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--c1)", letterSpacing: ".07em", marginBottom: "1.3rem", textAlign: "center" }}>DEV · SYSADMIN · ENI Fianarantsoa</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".65rem", marginBottom: "1.3rem" }}>
              {[["2+", "ans d'exp."], ["12+", "technologies"], ["2", "stages"], ["M2", "académique"]].map(([n, l]) => (
                <div key={l} style={{ background: "var(--surf2)", borderRadius: 10, padding: ".72rem", border: "1px solid var(--b1)" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, background: "linear-gradient(135deg,var(--c1),var(--c3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{n}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".6rem", color: "var(--mu)", letterSpacing: ".04em" }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".32rem" }}>
              {["React", "Laravel", "Node.js", "VoIP", "Linux"].map(t => (
                <span key={t} style={{ fontFamily: "var(--mono)", fontSize: ".62rem", padding: ".27rem .65rem", borderRadius: 5, background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", color: "var(--c1)" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: "2.2rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: ".4rem", fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--mu)", letterSpacing: ".14em" }}>
          <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom,var(--c1),transparent)", animation: "scrollAnim 1.5s ease-in-out infinite" }} />
          SCROLL
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={{ background: "var(--bg)", padding: "7rem 3.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SecHeader num="01" title="Stack" accent="Technique" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem" }}>
            {skills.map((s, i) => <SkillCard key={i} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section id="experience" style={{ background: "var(--bg2)", padding: "7rem 3.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,.07),transparent 70%)", top: -200, right: -200, pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SecHeader num="02" title="Expériences" accent="Pro" />
          <div style={{ position: "relative", paddingLeft: "3rem" }}>
            <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom,var(--c1),var(--c2),transparent)" }} />
            <ExpItem
              role="Développeur Full Stack Stagiaire"
              org="SOUKOUNDI — Antananarivo"
              date="09/2024 → 12/2024"
              desc="Conception et développement d'un site de gestion de parc auto complet — architecture système, modélisation de la base de données, interface utilisateur responsive et module de reporting."
              delay={0}
            />
            <ExpItem
              role="Développeur Web Stagiaire"
              org="Trésor Public Malagasy — Antananarivo"
              date="09/2023 → 11/2023"
              desc="Contribution aux mises à jour du site web institutionnel du Trésor Public Malagasy. Maintenance, corrections de bugs, améliorations fonctionnelles et optimisations de performance."
              delay={0.15}
            />
          </div>
        </div>
      </section>

      {/* ── FORMATION ── */}
      <section id="formation" style={{ background: "var(--bg)", padding: "7rem 3.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SecHeader num="03" title="Parcours" accent="Académique" />
          <div style={{ display: "grid", gap: ".9rem" }}>
            {formation.map((f, i) => {
              const [ref, vis] = [useRef(), useState(false)];
              return <EduRow key={i} {...f} idx={i} />;
            })}
          </div>
        </div>
      </section>

      {/* ── EXTRAS ── */}
      <section style={{ background: "var(--bg2)", padding: "7rem 3.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SecHeader num="04" title="Langues &" accent="Intérêts" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
            <div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1.8rem" }}>Langues parlées</div>
              <LangBar name="Malagasy" level="Langue maternelle" pct={100} />
              <LangBar name="Français" level="Opérationnel" pct={78} />
              <LangBar name="Anglais" level="Notions" pct={28} />
            </div>
            <div>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1.8rem" }}>Centres d'intérêt</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
                {[
                  [<svg key="m" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>, "Musique"],
                  [<svg key="s" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M4.93 4.93 19.07 19.07" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" /></svg>, "Basketball"],
                ].map(([ic, name]) => (
                  <IntCard key={name} icon={ic} name={name} />
                ))}
                <IntCard
                  icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="15" y1="13" x2="15.01" y2="13" /><line x1="18" y1="11" x2="18.01" y2="11" /><rect x="2" y="6" width="20" height="12" rx="2" /></svg>}
                  name="Jeux Vidéo" wide
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: "var(--bg)", padding: "7rem 3.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 90%,rgba(0,212,255,.04),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 3.5rem" }}>
            <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 800, letterSpacing: "-.03em", marginBottom: ".8rem" }}>
              Travaillons <em style={{ fontStyle: "normal", position: "relative", display: "inline-block" }}>
                Ensemble
                <span style={{ position: "absolute", bottom: ".08em", left: 0, right: 0, height: ".1em", background: "linear-gradient(90deg,var(--c1),var(--c2))", borderRadius: 2, zIndex: -1, opacity: .5 }} />
              </em>
            </h2>
            <p style={{ color: "var(--mu2)", lineHeight: 1.72 }}>Ouvert aux opportunités de stage, d'emploi ou de collaboration freelance.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".9rem", maxWidth: 680, margin: "0 auto" }}>
            <CCard iconD={icons.mail} label="Email" value="tsantatiana03@gmail.com" href="mailto:tsantatiana03@gmail.com" />
            <CCard iconD={icons.phone} label="Mobile 1" value="+261 32 37 206 00" href="tel:+261323720600" />
            <CCard iconD={icons.phone} label="Mobile 2" value="+261 34 35 061 22" href="tel:+261343506122" />
            <CCard iconD={icons.pin} label="Localisation" value="Ampitatafika, Antananarivo" />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EDU ROW (extracted to avoid hooks-in-loop)
───────────────────────────────────────────── */
function EduRow({ icon, degree, school, date, badge, idx }) {
  const [ref, vis] = useReveal();
  const [h, setH] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        display: "grid", gridTemplateColumns: "48px 1fr auto", gap: "1.4rem", alignItems: "center",
        background: h ? "var(--surf2)" : "var(--surf)", border: `1px solid ${h ? "rgba(255,255,255,.14)" : "var(--b1)"}`,
        borderRadius: 12, padding: "1.4rem 1.8rem",
        transition: "all .3s cubic-bezier(.23,1,.32,1)",
        transform: vis ? (h ? "scale(1.01)" : "none") : "translateY(18px)",
        opacity: vis ? 1 : 0,
        transitionDelay: `${idx * 0.09}s`,
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 11,
        background: "linear-gradient(135deg,rgba(0,212,255,.1),rgba(124,58,237,.1))",
        border: "1px solid rgba(0,212,255,.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: "var(--c1)",
      }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, marginBottom: ".22rem" }}>{degree}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--mu2)" }}>{school}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--mu)" }}>{date}</div>
        {badge && (
          <span style={{
            display: "inline-block", marginTop: ".35rem",
            fontFamily: "var(--mono)", fontSize: ".6rem", padding: ".22rem .65rem",
            borderRadius: 100, background: "rgba(6,255,165,.07)",
            border: "1px solid rgba(6,255,165,.22)", color: "var(--c3)",
          }}>{badge}</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   INT CARD
───────────────────────────────────────────── */
function IntCard({ icon, name, wide }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: h ? "var(--surf2)" : "var(--surf)",
        border: `1px solid ${h ? "rgba(255,255,255,.12)" : "var(--b1)"}`,
        borderRadius: 11, padding: "1.1rem",
        display: "flex", alignItems: "center", gap: ".8rem",
        transition: "all .25s", cursor: "default",
        transform: h ? "translateY(-2px)" : "none",
        gridColumn: wide ? "span 2" : undefined,
        color: "var(--mu2)",
      }}>
      <div style={{ color: "var(--c1)" }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: ".88rem" }}>{name}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE: ENI
───────────────────────────────────────────── */
function ENIPage() {
  const stats = [
    { num: 1986, label: "Année de fondation", suffix: "" },
    { num: 3000, label: "Étudiants formés", suffix: "+" },
    { num: 5, label: "Filières disponibles", suffix: "" },
    { num: 38, label: "Ans d'excellence", suffix: "+" },
  ];

  const programs = [
    { title: "Informatique Générale", desc: "Formation complète couvrant le développement logiciel, les systèmes d'information, les réseaux et l'administration système.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>, color: "var(--c1)" },
    { title: "Génie Logiciel", desc: "Conception et développement de logiciels de qualité, gestion de projets informatiques et architecture applicative.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>, color: "var(--c2)" },
    { title: "Réseaux & Télécoms", desc: "Infrastructure réseau, protocoles de communication, sécurité informatique et administration des systèmes distribués.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>, color: "var(--c3)" },
    { title: "Intelligence Artificielle", desc: "Machine learning, deep learning, traitement du langage naturel et vision par ordinateur.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>, color: "var(--c4)" },
    { title: "Systèmes d'Information", desc: "Gestion des données, business intelligence, ERP et systèmes décisionnels pour les entreprises.", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" /></svg>, color: "#a78bfa" },
  ];

  const values = [
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>, title: "Excellence", desc: "Formation de haut niveau reconnue nationalement." },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" /><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" /></svg>, title: "Innovation", desc: "Apprentissage des dernières technologies du domaine." },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, title: "Communauté", desc: "Un réseau d'anciens élèves actif et influent." },
    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" /></svg>, title: "Ouverture", desc: "Partenariats avec des entreprises et institutions internationales." },
  ];

  const [counterStarted, setCounterStarted] = useState(false);
  const statsRef = useRef();
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCounterStarted(true); }, { threshold: .3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="page-enter">
      {/* ── HERO ENI ── */}
      <section style={{ minHeight: "75vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "8rem 3.5rem 5rem", position: "relative", overflow: "hidden" }}>
        <div className="grid-bg" />
        <div className="orb orb1" /><div className="orb orb2" />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: ".6rem", fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--c3)", letterSpacing: ".18em", textTransform: "uppercase", padding: ".45rem 1.1rem", border: "1px solid rgba(6,255,165,.25)", borderRadius: 100, background: "rgba(6,255,165,.05)", marginBottom: "2rem", animation: "pageIn .6s ease both" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c3)" }} />
            Fianarantsoa · Madagascar
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div style={{ animation: "pageIn .7s ease both" }}>
              <h1 style={{ fontSize: "clamp(2.8rem,5vw,5rem)", fontWeight: 800, lineHeight: 1, letterSpacing: "-.03em", marginBottom: "1.5rem" }}>
                École Nationale<br />
                <span style={{ background: "linear-gradient(135deg,var(--c1),var(--c2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  d'Informatique
                </span>
              </h1>
              <p style={{ fontSize: "1.05rem", color: "var(--mu2)", lineHeight: 1.78, marginBottom: "2rem", maxWidth: 500 }}>
                L'École Nationale d'Informatique (ENI) de Fianarantsoa est l'une des grandes écoles d'ingénieurs de Madagascar, formant depuis 1986 les ingénieurs et experts en informatique du pays.
              </p>
              <div style={{ display: "flex", gap: ".8rem" }}>
                <a href="https://www.eni.mg" target="_blank" rel="noreferrer" style={{ fontFamily: "var(--mono)", fontSize: ".78rem", letterSpacing: ".08em", padding: ".88rem 2rem", borderRadius: 8, textDecoration: "none", background: "linear-gradient(135deg,var(--c1),var(--c2))", color: "#fff", display: "flex", alignItems: "center", gap: ".5rem" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" /></svg>
                  Site officiel
                </a>
              </div>
            </div>
            {/* ENI building illustration */}
            <div style={{ animation: "pageIn .8s .1s ease both" }}>
              <div style={{
                background: "var(--surf)", border: "1px solid var(--b2)", borderRadius: 20,
                padding: "2.5rem", textAlign: "center", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: -1, borderRadius: 20, zIndex: -1, filter: "blur(8px)", background: "linear-gradient(135deg,rgba(0,212,255,.12),rgba(124,58,237,.12))" }} />
                <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--c1)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
                    <path d="M9 9h1" /><path d="M9 13h1" /><path d="M9 17h1" />
                    <path d="M14 13h1" /><path d="M14 17h1" />
                  </svg>
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".75rem", color: "var(--c1)", letterSpacing: ".15em", marginBottom: ".5rem" }}>ENI · FIANARANTSOA</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: ".5rem" }}>Grande École d'Ingénieurs</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--mu2)" }}>Fondée en 1986 · Reconnue par l'État Malagasy</div>
                <div style={{ display: "flex", justifyContent: "center", gap: ".4rem", marginTop: "1.2rem", flexWrap: "wrap" }}>
                  {["Licence", "Master", "Ingénieur"].map(d => (
                    <span key={d} style={{ fontFamily: "var(--mono)", fontSize: ".62rem", padding: ".25rem .7rem", borderRadius: 5, background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", color: "var(--c1)" }}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section ref={statsRef} style={{ background: "var(--bg2)", padding: "5rem 3.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem" }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: "var(--surf)", border: "1px solid var(--b1)", borderRadius: 14,
              padding: "1.8rem", textAlign: "center",
              transition: "all .3s",
            }}>
              <div style={{ fontSize: "2.5rem", fontWeight: 900, background: "linear-gradient(135deg,var(--c1),var(--c3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {counterStarted ? <Counter target={s.num} suffix={s.suffix} /> : "0"}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--mu2)", letterSpacing: ".06em", marginTop: ".4rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section style={{ background: "var(--bg)", padding: "7rem 3.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SecHeader num="01" title="Filières de" accent="Formation" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.2rem" }}>
            {programs.map((p, i) => <ProgramCard key={i} {...p} idx={i} />)}
          </div>
        </div>
      </section>

      {/* ── VALEURS ── */}
      <section style={{ background: "var(--bg2)", padding: "7rem 3.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SecHeader num="02" title="Nos" accent="Valeurs" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.2rem" }}>
            {values.map((v, i) => <ValueCard key={i} {...v} idx={i} />)}
          </div>
        </div>
      </section>

      {/* ── MON LIEN avec ENI ── */}
      <section style={{ background: "var(--bg)", padding: "7rem 3.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(124,58,237,.06),transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <SecHeader num="03" title="Mon" accent="Parcours ENI" />
          <div style={{
            background: "var(--surf)", border: "1px solid var(--b2)", borderRadius: 20, padding: "3rem",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,var(--c1),var(--c2),var(--c3))" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "start" }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: "var(--c1)", letterSpacing: ".12em", marginBottom: "1rem" }}>2021 → PRÉSENT</div>
                <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-.02em" }}>Étudiant en Informatique Générale</h3>
                <p style={{ color: "var(--mu2)", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                  Depuis mon entrée à l'ENI en 2021, j'ai acquis une solide formation en développement logiciel, réseaux informatiques, et systèmes d'exploitation. L'ENI m'a donné les bases théoriques et pratiques qui me permettent aujourd'hui de concevoir des solutions informatiques complètes.
                </p>
                <p style={{ color: "var(--mu2)", lineHeight: 1.8 }}>
                  Actuellement en deuxième année de Maîtrise (M2), je poursuis mon approfondissement en architecture logicielle et administration systèmes avancée, avec l'ambition de contribuer au développement numérique de Madagascar.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ background: "rgba(6,255,165,.07)", border: "1px solid rgba(6,255,165,.22)", color: "var(--c3)", fontFamily: "var(--mono)", fontSize: ".65rem", padding: ".4rem 1rem", borderRadius: 100 }}>M2 En cours</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
              {[["L1", "2021–2022"], ["L2", "2023"], ["L3", "2024"],["M1", "2025"], ["M2", "2026 →"]].map(([level, period]) => (
                <div key={level} style={{
                  background: "var(--surf2)", border: "1px solid var(--b1)", borderRadius: 10,
                  padding: ".8rem 1.2rem", textAlign: "center",
                }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--c1)" }}>{level}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--mu2)", marginTop: ".2rem" }}>{period}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProgramCard({ title, desc, icon, color, idx }) {
  const [ref, vis] = useReveal();
  const [h, setH] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "var(--surf)", border: `1px solid ${h ? "rgba(255,255,255,.12)" : "var(--b1)"}`,
        borderRadius: 14, padding: "1.8rem",
        transition: "all .3s cubic-bezier(.23,1,.32,1)",
        transform: vis ? (h ? "translateY(-6px)" : "none") : "translateY(20px)",
        opacity: vis ? 1 : 0, transitionDelay: `${idx * 0.08}s`,
        boxShadow: h ? "0 20px 50px rgba(0,0,0,.4)" : "none",
        position: "relative", overflow: "hidden",
      }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color},transparent)`, transform: `scaleX(${h ? 1 : 0})`, transformOrigin: "left", transition: "transform .35s ease" }} />
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `rgba(${color === "var(--c1)" ? "0,212,255" : color === "var(--c2)" ? "124,58,237" : color === "var(--c3)" ? "6,255,165" : "255,107,107"},.1)`, border: `1px solid rgba(${color === "var(--c1)" ? "0,212,255" : color === "var(--c2)" ? "124,58,237" : color === "var(--c3)" ? "6,255,165" : "255,107,107"},.2)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.1rem", color: color }}>
        {icon}
      </div>
      <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: ".6rem" }}>{title}</div>
      <div style={{ fontSize: ".88rem", color: "var(--mu2)", lineHeight: 1.7 }}>{desc}</div>
    </div>
  );
}

function ValueCard({ icon, title, desc, idx }) {
  const [ref, vis] = useReveal();
  const [h, setH] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: "var(--surf)", border: `1px solid ${h ? "rgba(255,255,255,.12)" : "var(--b1)"}`,
        borderRadius: 14, padding: "1.6rem",
        transition: "all .3s cubic-bezier(.23,1,.32,1)",
        transform: vis ? (h ? "translateY(-4px)" : "none") : "translateY(20px)",
        opacity: vis ? 1 : 0, transitionDelay: `${idx * 0.08}s`,
      }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", color: "var(--c1)" }}>{icon}</div>
      <div style={{ fontWeight: 700, marginBottom: ".4rem" }}>{title}</div>
      <div style={{ fontSize: ".85rem", color: "var(--mu2)", lineHeight: 1.65 }}>{desc}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer({ setPage }) {
  return (
    <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--b1)", padding: "2.2rem 3.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--mu)" }}>
        Conçu par <strong style={{ color: "var(--c1)" }}>Tsantatiana Fandresena Rahandrisoa</strong> · 2025
      </div>
      <button onClick={() => { setPage("eni"); window.scrollTo(0, 0); }} style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--mu2)", background: "none", border: "1px solid var(--b1)", borderRadius: 6, padding: ".4rem 1rem", cursor: "none", transition: "all .2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c1)"; e.currentTarget.style.color = "var(--c1)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--b1)"; e.currentTarget.style.color = "var(--mu2)"; }}
      >
        À propos — ENI →
      </button>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("portfolio");
  const [photo, setPhoto] = useState(null);

  // inject styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS + `
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
      @keyframes scrollAnim{
        0%{transform:scaleY(0);transform-origin:top}
        49%{transform:scaleY(1);transform-origin:top}
        50%{transform:scaleY(1);transform-origin:bottom}
        100%{transform:scaleY(0);transform-origin:bottom}
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // cursor
  useEffect(() => {
    const cur = document.getElementById("cur");
    const curb = document.getElementById("curb");
    if (!cur || !curb) return;
    const move = e => {
      cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px";
      curb.style.left = e.clientX + "px"; curb.style.top = e.clientY + "px";
    };
    document.addEventListener("mousemove", move);
    const hoverEls = () => document.querySelectorAll("a,button,[data-hover]");
    const grow = () => { if (curb) { curb.style.width = "65px"; curb.style.height = "65px"; } };
    const shrink = () => { if (curb) { curb.style.width = "38px"; curb.style.height = "38px"; } };
    const attach = () => hoverEls().forEach(el => { el.addEventListener("mouseenter", grow); el.addEventListener("mouseleave", shrink); });
    attach();
    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => { document.removeEventListener("mousemove", move); obs.disconnect(); };
  }, []);

  const changePage = useCallback((p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  return (
    <>
      <div id="cur" /><div id="curb" />
      <Nav page={page} setPage={changePage} />
      <main style={{ paddingTop: 0 }}>
        {page === "portfolio"
          ? <PortfolioPage photo={photo} setPhoto={setPhoto} />
          : <ENIPage />}
      </main>
      <Footer setPage={changePage} />
    </>
  );
}
