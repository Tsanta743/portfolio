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
body { background:var(--bg); color:var(--tx); font-family:var(--sans); overflow-x:hidden; }
@media(min-width:769px){ body{ cursor:none; } }
body::after {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:9990;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
}
#cur,#curb { position:fixed;pointer-events:none;z-index:9999;border-radius:50%;transform:translate(-50%,-50%); }
#cur { width:10px;height:10px;background:var(--c1);mix-blend-mode:difference;transition:transform .1s; }
#curb { width:38px;height:38px;background:rgba(0,212,255,.09);border:1px solid rgba(0,212,255,.22);transition:left .12s ease,top .12s ease,width .3s,height .3s; }
@media(max-width:768px){ #cur,#curb{ display:none; } }

.page-enter { animation:pageIn .45s cubic-bezier(.23,1,.32,1) both; }
@keyframes pageIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

.grid-bg {
  position:absolute;inset:0;pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);
  background-size:60px 60px;
  mask-image:radial-gradient(ellipse at 50% 50%,black 20%,transparent 75%);
}
.orb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;animation:drift 9s ease-in-out infinite alternate;}
.orb1{width:400px;height:400px;background:radial-gradient(circle,rgba(124,58,237,.16),transparent 70%);top:-100px;right:-60px;}
.orb2{width:300px;height:300px;background:radial-gradient(circle,rgba(0,212,255,.11),transparent 70%);bottom:-60px;left:-60px;animation-delay:-5s;}
.orb3{width:200px;height:200px;background:radial-gradient(circle,rgba(6,255,165,.08),transparent 70%);top:45%;left:42%;animation-delay:-3s;}
@keyframes drift{from{transform:translate(0,0) scale(1)}to{transform:translate(20px,15px) scale(1.05)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes scrollAnim{0%{transform:scaleY(0);transform-origin:top}49%{transform:scaleY(1);transform-origin:top}50%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:rgba(0,212,255,.25);border-radius:3px}

/* Mobile nav overlay */
.mob-overlay{
  position:fixed;inset:0;z-index:490;
  background:rgba(5,5,8,.97);backdrop-filter:blur(24px);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
  animation:pageIn .3s ease both;
}
.mob-link{
  font-family:var(--mono);font-size:1rem;color:var(--mu2);
  text-decoration:none;background:none;border:none;
  letter-spacing:.1em;cursor:pointer;
  padding:1.1rem 2rem;width:100%;text-align:center;
  transition:color .2s,background .2s;border-bottom:1px solid var(--b1);
}
.mob-link:hover,.mob-link:active{color:var(--c1);background:rgba(0,212,255,.04);}
.mob-link.active{color:var(--c1);}
.mob-section-label{
  font-family:var(--mono);font-size:.62rem;color:var(--mu);
  letter-spacing:.2em;text-transform:uppercase;
  padding:.8rem 2rem .4rem;width:100%;text-align:center;
}

/* Responsive utilities */
.skills-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem;}
@media(max-width:900px){.skills-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:500px){.skills-grid{grid-template-columns:1fr;}}

.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;}
@media(max-width:700px){.stats-grid{grid-template-columns:repeat(2,1fr);}}

.programs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem;}
@media(max-width:900px){.programs-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:500px){.programs-grid{grid-template-columns:1fr;}}

.values-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;}
@media(max-width:900px){.values-grid{grid-template-columns:repeat(2,1fr);}}

.extras-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;}
@media(max-width:720px){.extras-grid{grid-template-columns:1fr;gap:2.5rem;}}

.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;max-width:680px;margin:0 auto;}
@media(max-width:520px){.contact-grid{grid-template-columns:1fr;}}

.edu-grid{display:grid;grid-template-columns:42px 1fr auto;gap:1.2rem;align-items:center;}
@media(max-width:540px){.edu-grid{grid-template-columns:38px 1fr;}.edu-date-col{display:none;}}

.hero-grid{display:grid;grid-template-columns:1fr 1fr;align-items:center;}
@media(max-width:860px){.hero-grid{grid-template-columns:1fr;}.hero-card-wrap{display:none; margin-top:50px;}}

.eni-hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;}
@media(max-width:860px){.eni-hero-grid{grid-template-columns:1fr;gap:2rem;}}

.wrap{max-width:1100px;margin:0 auto;}
.sec{padding:5rem clamp(1.2rem,5vw,3.5rem);}
`;

/* ── Hooks ── */
function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width:768px)");
    setM(mq.matches);
    const h = e => setM(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return m;
}

function useReveal(threshold = 0.08) {
  const ref = useRef();
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

/* ── SVG ── */
function S({ size = 24, sw = 1.7, stroke = "currentColor", style, children }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>{children}</svg>;
}

/* ── NAV ── */
function Nav({ page, setPage }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const anchors = ["skills", "experience", "formation", "contact"];

  const go = p => { setPage(p); setOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goAnchor = a => { setOpen(false); };

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, padding: `${isMobile ? "1rem" : "1.3rem"} clamp(1.2rem,5vw,3.5rem)`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(5,5,8,.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <button onClick={() => go("portfolio")} style={{ fontFamily: "var(--mono)", fontSize: ".78rem", color: "var(--c1)", letterSpacing: ".12em", display: "flex", alignItems: "center", gap: ".5rem", background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c3)", display: "inline-block", animation: "blink 2s ease-in-out infinite" }} />
          tsantatiana
        </button>

        {!isMobile ? (
          <ul style={{ display: "flex", gap: "1.5rem", listStyle: "none", alignItems: "center" }}>
            {[{id:"portfolio",label:"Portfolio"},{id:"eni",label:"ENI"}].map(l => (
              <li key={l.id}>
                <button onClick={() => go(l.id)} style={{ fontFamily: "var(--mono)", fontSize: ".72rem", color: page === l.id ? "var(--c1)" : "var(--mu2)", background: "none", border: "none", cursor: "none", letterSpacing: ".1em", borderBottom: page === l.id ? "1px solid var(--c1)" : "1px solid transparent", paddingBottom: 2, transition: "color .2s" }}>{l.label}</button>
              </li>
            ))}
            {page === "portfolio" && anchors.map(a => (
              <li key={a}>
                <a href={`#${a}`} style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--mu2)", textDecoration: "none", letterSpacing: ".1em", transition: "color .2s" }}
                  onMouseEnter={e => e.target.style.color = "var(--c1)"}
                  onMouseLeave={e => e.target.style.color = "var(--mu2)"}
                >{a[0].toUpperCase() + a.slice(1)}</a>
              </li>
            ))}
          </ul>
        ) : (
          <button onClick={() => setOpen(v => !v)} style={{ background: "none", border: "1px solid var(--b2)", borderRadius: 8, padding: ".4rem .6rem", cursor: "pointer", color: "var(--tx)", display: "flex", alignItems: "center" }}>
            {open
              ? <S size={20}><path d="M18 6 6 18"/><path d="M6 6l12 12"/></S>
              : <S size={20}><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></S>}
          </button>
        )}
      </nav>

      {isMobile && open && (
        <div className="mob-overlay">
          <div className="mob-section-label">Navigation</div>
          <button className={`mob-link${page==="portfolio"?" active":""}`} onClick={() => go("portfolio")}>Portfolio</button>
          <button className={`mob-link${page==="eni"?" active":""}`} onClick={() => go("eni")}>À propos — ENI</button>
          {page === "portfolio" && <>
            <div className="mob-section-label" style={{ marginTop: ".5rem" }}>Sections</div>
            {anchors.map(a => <a key={a} href={`#${a}`} className="mob-link" onClick={() => goAnchor(a)}>{a[0].toUpperCase()+a.slice(1)}</a>)}
          </>}
        </div>
      )}
    </>
  );
}



/* ── SECTION HEADER ── */
function SecHeader({ num, title, accent }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "2.8rem", flexWrap: "wrap", opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: "opacity .7s ease, transform .7s ease" }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--mu)", letterSpacing: ".1em" }}>{num}</span>
      <h2 style={{ fontSize: "clamp(1.55rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-.03em" }}>
        {title} <em style={{ fontStyle: "normal", position: "relative", display: "inline-block" }}>
          {accent}
          <span style={{ position: "absolute", bottom: ".08em", left: 0, right: 0, height: ".1em", background: "linear-gradient(90deg,var(--c1),var(--c2))", borderRadius: 2, zIndex: -1, opacity: .5 }} />
        </em>
      </h2>
      <div style={{ flex: 1, minWidth: 30, height: 1, background: "linear-gradient(to right,rgba(255,255,255,.12),transparent)" }} />
    </div>
  );
}

/* ── SKILL CARD ── */
function SkillCard({ icon, cat, pills, grad }) {
  const [h, setH] = useState(false);
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: "var(--surf)", border: "1px solid var(--b1)", borderRadius: 14, padding: "1.4rem 1.5rem", position: "relative", overflow: "hidden", transition: "all .3s cubic-bezier(.23,1,.32,1)", transform: h ? "translateY(-5px)" : vis ? "none" : "translateY(20px)", opacity: vis ? 1 : 0, boxShadow: h ? "0 16px 40px rgba(0,0,0,.4)" : "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: grad, transform: `scaleX(${h?1:0})`, transformOrigin: "left", transition: "transform .35s ease" }} />
      <div style={{ color: "var(--c1)", marginBottom: ".65rem" }}>{icon}</div>
      <div style={{ fontFamily: "var(--mono)", fontSize: ".62rem", color: "var(--mu2)", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: ".65rem" }}>{cat}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".28rem" }}>
        {pills.map(([label, ico]) => (
          <span key={label} style={{ fontFamily: "var(--mono)", fontSize: ".67rem", padding: ".27rem .62rem", borderRadius: 5, background: h ? "rgba(0,212,255,.06)" : "var(--surf2)", border: h ? "1px solid rgba(0,212,255,.2)" : "1px solid var(--b1)", color: h ? "var(--c1)" : "var(--mu2)", transition: "all .2s", display: "flex", alignItems: "center", gap: ".28rem" }}>
            {ico && <i className={ico} style={{ fontSize: ".9rem" }} />}{label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── EXP ITEM ── */
function ExpItem({ role, org, date, desc, delay = 0 }) {
  const [ref, vis] = useReveal();
  const [h, setH] = useState(false);
  return (
    <div ref={ref} style={{ position: "relative", marginBottom: "1.8rem", paddingLeft: "2.5rem", opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-18px)", transition: `opacity .6s ${delay}s ease, transform .6s ${delay}s ease` }}>
      <div style={{ position: "absolute", left: 7, top: ".35rem", width: h ? 15 : 11, height: h ? 15 : 11, borderRadius: "50%", background: h ? "var(--c1)" : "var(--bg)", border: "2px solid var(--c1)", boxShadow: `0 0 ${h?18:10}px rgba(0,212,255,${h?.8:.4})`, transition: "all .3s", marginLeft: h ? -2 : 0 }} />
      <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
        style={{ background: "var(--surf)", border: `1px solid ${h ? "rgba(0,212,255,.25)" : "var(--b1)"}`, borderRadius: 14, padding: "1.4rem 1.5rem", transform: h ? "translateX(6px)" : "none", transition: "all .3s cubic-bezier(.23,1,.32,1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: ".65rem", gap: ".8rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "-.02em", marginBottom: ".22rem" }}>{role}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--c2)", display: "flex", alignItems: "center", gap: ".35rem" }}>
              <span style={{ width: ".4rem", height: 1, background: "var(--c2)", display: "inline-block" }} />{org}
            </div>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: ".64rem", color: "var(--c1)", background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", padding: ".24rem .68rem", borderRadius: 5, whiteSpace: "nowrap" }}>{date}</div>
        </div>
        <p style={{ fontSize: ".88rem", color: "var(--mu2)", lineHeight: 1.75 }}>{desc}</p>
      </div>
    </div>
  );
}

/* ── EDU ROW ── */
function EduRow({ icon, degree, school, date, badge, idx }) {
  const [ref, vis] = useReveal();
  const [h, setH] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      className="edu-grid"
      style={{ background: h ? "var(--surf2)" : "var(--surf)", border: `1px solid ${h ? "rgba(255,255,255,.14)" : "var(--b1)"}`, borderRadius: 12, padding: "1.1rem 1.3rem", transition: "all .3s cubic-bezier(.23,1,.32,1)", transform: vis ? (h ? "scale(1.01)" : "none") : "translateY(16px)", opacity: vis ? 1 : 0, transitionDelay: `${idx * 0.07}s` }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,rgba(0,212,255,.1),rgba(124,58,237,.1))", border: "1px solid rgba(0,212,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--c1)" }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: ".16rem" }}>{degree}</div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--mu2)" }}>{school}</div>
      </div>
      <div className="edu-date-col" style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".63rem", color: "var(--mu)" }}>{date}</div>
        {badge && <span style={{ display: "inline-block", marginTop: ".28rem", fontFamily: "var(--mono)", fontSize: ".58rem", padding: ".18rem .58rem", borderRadius: 100, background: "rgba(6,255,165,.07)", border: "1px solid rgba(6,255,165,.22)", color: "var(--c3)" }}>{badge}</span>}
      </div>
    </div>
  );
}

/* ── LANG BAR ── */
function LangBar({ name, level, pct }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{ marginBottom: "1.3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".42rem" }}>
        <span style={{ fontWeight: 700, fontSize: ".95rem" }}>{name}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: ".63rem", color: "var(--mu2)" }}>{level}</span>
      </div>
      <div style={{ height: 3, background: "var(--surf2)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg,var(--c1),var(--c2))", borderRadius: 2, width: vis ? `${pct}%` : "0%", transition: "width 1.1s cubic-bezier(.23,1,.32,1) .2s" }} />
      </div>
    </div>
  );
}

/* ── CONTACT CARD ── */
function CCard({ icon, label, value, href }) {
  const [h, setH] = useState(false);
  const Tag = href ? "a" : "div";
  return (
    <Tag href={href} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: "var(--surf)", border: `1px solid ${h ? "rgba(0,212,255,.28)" : "var(--b1)"}`, borderRadius: 12, padding: "1.1rem 1.3rem", textDecoration: "none", color: "var(--tx)", display: "flex", alignItems: "center", gap: ".9rem", transition: "all .3s cubic-bezier(.23,1,.32,1)", transform: h ? "translateY(-3px)" : "none", boxShadow: h ? "0 12px 28px rgba(0,0,0,.4)" : "none", cursor: href ? "pointer" : "default" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: h ? "rgba(0,212,255,.15)" : "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s", color: "var(--c1)" }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: ".58rem", color: "var(--mu)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: ".16rem" }}>{label}</div>
        <div style={{ fontSize: ".83rem", fontWeight: 600 }}>{value}</div>
      </div>
    </Tag>
  );
}

/* ── INT CARD ── */
function IntCard({ icon, name, wide }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h ? "var(--surf2)" : "var(--surf)", border: `1px solid ${h ? "rgba(255,255,255,.12)" : "var(--b1)"}`, borderRadius: 10, padding: ".9rem 1.1rem", display: "flex", alignItems: "center", gap: ".7rem", transition: "all .25s", transform: h ? "translateY(-2px)" : "none", gridColumn: wide ? "span 2" : undefined, color: "var(--mu2)" }}>
      <div style={{ color: "var(--c1)" }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: ".86rem" }}>{name}</div>
    </div>
  );
}

/* ── PROGRAM CARD ── */
function ProgramCard({ title, desc, icon, color, idx }) {
  const [ref, vis] = useReveal();
  const [h, setH] = useState(false);
  const rgb = color==="var(--c1)"?"0,212,255":color==="var(--c2)"?"124,58,237":color==="var(--c3)"?"6,255,165":"255,107,107";
  return (
    <div ref={ref} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: "var(--surf)", border: `1px solid ${h ? "rgba(255,255,255,.12)" : "var(--b1)"}`, borderRadius: 14, padding: "1.5rem", transition: "all .3s cubic-bezier(.23,1,.32,1)", transform: vis ? (h ? "translateY(-5px)" : "none") : "translateY(20px)", opacity: vis ? 1 : 0, transitionDelay: `${idx * 0.07}s`, boxShadow: h ? "0 16px 40px rgba(0,0,0,.4)" : "none", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${color},transparent)`, transform: `scaleX(${h?1:0})`, transformOrigin: "left", transition: "transform .35s ease" }} />
      <div style={{ width: 42, height: 42, borderRadius: 10, background: `rgba(${rgb},.1)`, border: `1px solid rgba(${rgb},.2)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: ".9rem", color }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: ".93rem", marginBottom: ".45rem" }}>{title}</div>
      <div style={{ fontSize: ".83rem", color: "var(--mu2)", lineHeight: 1.68 }}>{desc}</div>
    </div>
  );
}

/* ── VALUE CARD ── */
function ValueCard({ icon, title, desc, idx }) {
  const [ref, vis] = useReveal();
  const [h, setH] = useState(false);
  return (
    <div ref={ref} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: "var(--surf)", border: `1px solid ${h ? "rgba(255,255,255,.12)" : "var(--b1)"}`, borderRadius: 14, padding: "1.3rem", transition: "all .3s cubic-bezier(.23,1,.32,1)", transform: vis ? (h ? "translateY(-4px)" : "none") : "translateY(20px)", opacity: vis ? 1 : 0, transitionDelay: `${idx * 0.07}s` }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: ".85rem", color: "var(--c1)" }}>{icon}</div>
      <div style={{ fontWeight: 700, marginBottom: ".32rem" }}>{title}</div>
      <div style={{ fontSize: ".82rem", color: "var(--mu2)", lineHeight: 1.62 }}>{desc}</div>
    </div>
  );
}

/* ── COUNTER ── */
function Counter({ target, suffix="" }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n = 0;
    const step = () => { n += Math.ceil(target/30); if (n >= target) { setV(target); return; } setV(n); requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [target]);
  return <>{v}{suffix}</>;
}

/* ─────────────────────────────────────────────
   PORTFOLIO PAGE
───────────────────────────────────────────── */
function PortfolioPage({ photo, setPhoto }) {
  const skills = [
    { icon: <S size={22}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></S>, cat: "Frontend", grad: "linear-gradient(90deg,#00d4ff,#7c3aed)", pills:[["React JS","devicon-react-original"],["Tailwind CSS","devicon-tailwindcss-plain"],["UX / UI",null]] },
    { icon: <S size={22}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></S>, cat: "Backend", grad: "linear-gradient(90deg,#7c3aed,#06ffa5)", pills:[["Node.js","devicon-nodejs-plain"],["Laravel","devicon-laravel-plain"],["PHP","devicon-php-plain"],["WordPress","devicon-wordpress-plain"]] },
    { icon: <S size={22}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></S>, cat: "Langages", grad: "linear-gradient(90deg,#06ffa5,#00d4ff)", pills:[["Java","devicon-java-plain"],["Python","devicon-python-plain"],["C#","devicon-csharp-plain"]] },
    { icon: <S size={22}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></S>, cat: "Réseau & VoIP", grad: "linear-gradient(90deg,#ff6b6b,#7c3aed)", pills:[["VoIP",null],["Asterisk",null]] },
    { icon: <S size={22}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></S>, cat: "SysAdmin", grad: "linear-gradient(90deg,#00d4ff,#ff6b6b)", pills:[["Debian","devicon-debian-plain"],["Windows Server","devicon-windows8-plain"]] },
    { icon: <S size={22}><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></S>, cat: "Méthodes & Autres", grad: "linear-gradient(90deg,#06ffa5,#ff6b6b)", pills:[["Merise",null],["UML",null],["Arduino","devicon-arduino-plain"]] },
  ];

  const gradIcon = <S size={19}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></S>;
  const bookIcon = <S size={19}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></S>;
  const homeIcon = <S size={19}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></S>;

  const formation = [
    { icon: gradIcon, degree: "2ème année de Maîtrise — Informatique Générale", school: "ENI · Fianarantsoa", date: "01/2026 → Présent", badge: "En cours" },
    { icon: bookIcon, degree: "1ère année de Maîtrise — Informatique Générale", school: "ENI · Fianarantsoa", date: "01/2025 → 12/2025" },
    { icon: bookIcon, degree: "Licence 3 — Informatique Générale", school: "ENI · Fianarantsoa", date: "01/2024 → 12/2024" },
    { icon: bookIcon, degree: "Licence 2 — Informatique Générale", school: "ENI · Fianarantsoa", date: "01/2023 → 12/2023" },
    { icon: bookIcon, degree: "Licence 1 — Informatique Générale", school: "ENI · Fianarantsoa", date: "11/2021 → 11/2022" },
    { icon: homeIcon, degree: "Baccalauréat — Série D", school: "Lycée Ampitatafika · Antananarivo", date: "10/2020 → 08/2021", badge: "Assez Bien" },
  ];

  return (
    <div className="page-enter">
      {/* HERO */}
      <section style={{ minHeight: "100vh", position: "relative", overflow: "hidden", padding: "clamp(5rem,12vw,8rem) clamp(1.2rem,5vw,3.5rem) clamp(3rem,8vw,4rem)" }}>
        <div className="grid-bg"/><div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
        <div className="hero-grid wrap" style={{ height: "100%", position: "relative", zIndex: 2 }}>
          {/* Left */}
          <div style={{ animation: "pageIn .7s ease both", marginRight:"5px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--c3)", letterSpacing: ".15em", textTransform: "uppercase", padding: ".4rem 1rem", border: "1px solid rgba(6,255,165,.25)", borderRadius: 100, background: "rgba(6,255,165,.05)", marginBottom: "1.5rem" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c3)", animation: "blink 1.5s infinite" }} />
              Disponible · Ouvert aux opportunités
            </div>
            <h1 style={{ fontSize: "clamp(2rem,6vw,5rem)", fontWeight: 800, lineHeight: .95, letterSpacing: "-.03em", marginBottom: "1rem" }}>
              <span style={{ display: "block" }}>Tsantatiana</span>
              <span style={{ display: "block", background: "linear-gradient(135deg,var(--c1) 0%,var(--c2) 55%,var(--c4) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Fandresena</span>
              <span style={{ display: "block" }}>Rahandrisoa</span>
            </h1>
            <p style={{ fontFamily: "var(--mono)", fontSize: "clamp(.75rem,.9vw,.88rem)", color: "var(--mu2)", letterSpacing: ".04em", marginBottom: "1.2rem" }}>
              <strong style={{ color: "var(--c1)" }}>Développeur Full Stack</strong> & Administrateur Système & Réseau
            </p>
            <p style={{ fontSize: "clamp(.88rem,1vw,1rem)", color: "var(--mu2)", lineHeight: 1.75, maxWidth: 460, marginBottom: "2rem" }}>
              Je conçois des applications web performantes et gère des infrastructures réseau robustes. Expert en React, Laravel, VoIP et Linux.
            </p>
            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
              <a href="#contact" style={{ fontFamily: "var(--mono)", fontSize: ".75rem", letterSpacing: ".07em", padding: ".78rem 1.5rem", borderRadius: 8, textDecoration: "none", background: "linear-gradient(135deg,var(--c1),var(--c2))", color: "#fff", boxShadow: "0 0 24px rgba(0,212,255,.28)", display: "flex", alignItems: "center", gap: ".45rem" }}>
                <S size={14}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></S>
                Me contacter
              </a>
              <a href="#skills" style={{ fontFamily: "var(--mono)", fontSize: ".75rem", letterSpacing: ".07em", padding: ".78rem 1.5rem", borderRadius: 8, textDecoration: "none", background: "transparent", color: "var(--mu2)", border: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", gap: ".45rem" }}>
                <S size={14}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></S>
                Mon parcours
              </a>
            </div>
          </div>

          {/* Right — floating card (hidden on mobile via CSS) */}
          <div className="hero-card-wrap" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ background: "var(--surf)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, padding: "2.2rem", width: 305, animation: "floatUp 6s ease-in-out infinite", boxShadow: "0 40px 80px rgba(0,0,0,.55)", position: "relative" }}>
              <div style={{ position: "absolute", inset: -1, borderRadius: 20, zIndex: -1, filter: "blur(8px)", background: "linear-gradient(135deg,rgba(0,212,255,.18),rgba(124,58,237,.18),rgba(6,255,165,.1))" }} />
              <div style={{ fontSize: "1rem", fontWeight: 800, marginBottom: ".18rem", textAlign: "center" }}>Tsantatiana F.R.</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".64rem", color: "var(--c1)", letterSpacing: ".07em", marginBottom: "1.1rem", textAlign: "center" }}>DEV · SYSADMIN · ENI</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".55rem", marginBottom: "1rem" }}>
                {[["2+","ans d'exp."],["12+","technologies"],["2","stages"],["M2","académique"]].map(([n,l]) => (
                  <div key={l} style={{ background: "var(--surf2)", borderRadius: 9, padding: ".6rem", border: "1px solid var(--b1)" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 900, background: "linear-gradient(135deg,var(--c1),var(--c3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{n}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: ".57rem", color: "var(--mu)", letterSpacing: ".04em" }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".26rem" }}>
                {["React","Laravel","Node.js","VoIP","Linux"].map(t => (
                  <span key={t} style={{ fontFamily: "var(--mono)", fontSize: ".58rem", padding: ".23rem .58rem", borderRadius: 5, background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", color: "var(--c1)" }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: mini photo + stats strip */}
        <div style={{ display: "none" }} className="mobile-hero-extra">
          {/* shown via media query if needed */}
        </div>

        <div style={{ position: "absolute", bottom: "1.8rem", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: ".4rem", fontFamily: "var(--mono)", fontSize: ".58rem", color: "var(--mu)", letterSpacing: ".14em" }}>
          <div style={{ width: 1, height: 30, background: "linear-gradient(to bottom,var(--c1),transparent)", animation: "scrollAnim 1.5s ease-in-out infinite" }} />
          SCROLL
        </div>
      </section>

      {/* SKILLS */}
      <section id="skills" className="sec" style={{ background: "var(--bg)" }}>
        <div className="wrap">
          <SecHeader num="01" title="Stack" accent="Technique" />
          <div className="skills-grid">{skills.map((s,i) => <SkillCard key={i} {...s} />)}</div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="sec" style={{ background: "var(--bg2)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,.07),transparent 70%)", top: -120, right: -120, pointerEvents: "none" }} />
        <div className="wrap">
          <SecHeader num="02" title="Expériences" accent="Pro" />
          <div style={{ position: "relative", paddingLeft: "2.5rem" }}>
            <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: "linear-gradient(to bottom,var(--c1),var(--c2),transparent)" }} />
            <ExpItem role="Développeur Full Stack Stagiaire" org="SOUKOUNDI — Antananarivo" date="09/2024 → 12/2024" desc="Conception et développement d'un site de gestion de parc auto — architecture système, base de données, interface responsive et module de reporting." delay={0} />
            <ExpItem role="Développeur Web Stagiaire" org="Trésor Public Malagasy — Antananarivo" date="09/2023 → 11/2023" desc="Mises à jour du site web institutionnel du Trésor Public Malagasy. Maintenance, corrections de bugs et optimisations de performance." delay={0.12} />
          </div>
        </div>
      </section>

      {/* FORMATION */}
      <section id="formation" className="sec" style={{ background: "var(--bg)" }}>
        <div className="wrap">
          <SecHeader num="03" title="Parcours" accent="Académique" />
          <div style={{ display: "grid", gap: ".75rem" }}>
            {formation.map((f,i) => <EduRow key={i} {...f} idx={i} />)}
          </div>
        </div>
      </section>

      {/* EXTRAS */}
      <section className="sec" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <SecHeader num="04" title="Langues &" accent="Intérêts" />
          <div className="extras-grid">
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1.4rem" }}>Langues parlées</div>
              <LangBar name="Malagasy" level="Langue maternelle" pct={100} />
              <LangBar name="Français" level="Opérationnel" pct={78} />
              <LangBar name="Anglais" level="Notions" pct={28} />
            </div>
            <div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1.4rem" }}>Centres d'intérêt</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem" }}>
                <IntCard icon={<S size={22}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></S>} name="Musique" />
                <IntCard icon={<S size={22}><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 19.07 19.07"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></S>} name="Basketball" />
                <IntCard icon={<S size={22}><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></S>} name="Jeux Vidéo" wide />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="sec" style={{ background: "var(--bg)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 90%,rgba(0,212,255,.04),transparent 60%)", pointerEvents: "none" }} />
        <div className="wrap">
          <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 2.8rem" }}>
            <h2 style={{ fontSize: "clamp(1.55rem,3.5vw,2.8rem)", fontWeight: 800, letterSpacing: "-.03em", marginBottom: ".65rem" }}>
              Travaillons{" "}<em style={{ fontStyle: "normal", position: "relative", display: "inline-block" }}>Ensemble<span style={{ position: "absolute", bottom: ".08em", left: 0, right: 0, height: ".1em", background: "linear-gradient(90deg,var(--c1),var(--c2))", borderRadius: 2, zIndex: -1, opacity: .5 }} /></em>
            </h2>
            <p style={{ color: "var(--mu2)", lineHeight: 1.7, fontSize: ".92rem" }}>Ouvert aux opportunités de stage, d'emploi ou de collaboration.</p>
          </div>
          <div className="contact-grid">
            <CCard icon={<S size={19}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></S>} label="Email" value="tsantatiana03@gmail.com" href="mailto:tsantatiana03@gmail.com" />
            <CCard icon={<S size={19}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17l.92-.08Z"/></S>} label="Mobile 1" value="+261 32 37 206 00" href="tel:+261323720600" />
            <CCard icon={<S size={19}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17l.92-.08Z"/></S>} label="Mobile 2" value="+261 34 35 061 22" href="tel:+261343506122" />
            <CCard icon={<S size={19}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></S>} label="Localisation" value="Ampitatafika, Antananarivo" />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ENI PAGE
───────────────────────────────────────────── */
function ENIPage() {
  const statsRef = useRef();
  const [cStarted, setCStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCStarted(true); }, { threshold: .3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const programs = [
    { title: "Informatique Générale", desc: "Développement logiciel, systèmes d'information, réseaux et administration système.", icon: <S size={22}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></S>, color: "var(--c1)" },
    { title: "Génie Logiciel", desc: "Architecture applicative, gestion de projets et qualité logicielle.", icon: <S size={22}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></S>, color: "var(--c2)" },
    { title: "Réseaux & Télécoms", desc: "Infrastructure réseau, protocoles et sécurité informatique.", icon: <S size={22}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></S>, color: "var(--c3)" },
    { title: "Intelligence Artificielle", desc: "Machine learning, deep learning et vision par ordinateur.", icon: <S size={22}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></S>, color: "var(--c4)" },
    { title: "Systèmes d'Information", desc: "Business intelligence, ERP et systèmes décisionnels.", icon: <S size={22}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></S>, color: "#a78bfa" },
  ];

  const values = [
    { icon: <S size={19}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></S>, title: "Excellence", desc: "Formation de haut niveau reconnue nationalement." },
    { icon: <S size={19}><path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></S>, title: "Innovation", desc: "Apprentissage des dernières technologies." },
    { icon: <S size={19}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></S>, title: "Communauté", desc: "Réseau d'anciens élèves actif et influent." },
    { icon: <S size={19}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></S>, title: "Ouverture", desc: "Partenariats internationaux et entreprises." },
  ];

  return (
    <div className="page-enter">
      {/* HERO ENI */}
      <section className="sec" style={{ minHeight: "auto", paddingTop: "clamp(5rem,12vw,8rem)", paddingBottom: "clamp(3rem,6vw,5rem)", position: "relative", overflow: "hidden" }}>
        <div className="grid-bg"/><div className="orb orb1"/><div className="orb orb2"/>
        <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--c3)", letterSpacing: ".15em", textTransform: "uppercase", padding: ".4rem 1rem", border: "1px solid rgba(6,255,165,.25)", borderRadius: 100, background: "rgba(6,255,165,.05)", marginBottom: "1.8rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c3)" }} />
            Fianarantsoa · Madagascar
          </div>
          <div className="eni-hero-grid">
            <div>
              <h1 style={{ fontSize: "clamp(1.9rem,5.5vw,4.5rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-.03em", marginBottom: "1.2rem" }}>
                École Nationale<br />
                <span style={{ background: "linear-gradient(135deg,var(--c1),var(--c2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>d'Informatique</span>
              </h1>
              <p style={{ fontSize: ".95rem", color: "var(--mu2)", lineHeight: 1.75, marginBottom: "1.8rem", maxWidth: 480 }}>
                L'ENI de Fianarantsoa est l'une des grandes écoles d'ingénieurs de Madagascar, formant depuis 1986 les experts en informatique du pays.
              </p>
              <a href="https://www.eni.mg" target="_blank" rel="noreferrer" style={{ fontFamily: "var(--mono)", fontSize: ".75rem", letterSpacing: ".07em", padding: ".78rem 1.5rem", borderRadius: 8, textDecoration: "none", background: "linear-gradient(135deg,var(--c1),var(--c2))", color: "#fff", display: "inline-flex", alignItems: "center", gap: ".45rem" }}>
                <S size={14}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></S>
                Site officiel
              </a>
            </div>
            <div style={{ background: "var(--surf)", border: "1px solid var(--b2)", borderRadius: 18, padding: "1.8rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: -1, borderRadius: 18, zIndex: -1, filter: "blur(8px)", background: "linear-gradient(135deg,rgba(0,212,255,.12),rgba(124,58,237,.12))" }} />
              <S size={64} stroke="var(--c1)" sw={1.2} style={{ marginBottom: ".7rem" }}>
                <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/>
                <path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/>
                <path d="M14 13h1"/><path d="M14 17h1"/>
              </S>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".7rem", color: "var(--c1)", letterSpacing: ".14em", marginBottom: ".35rem" }}>ENI · FIANARANTSOA</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: ".35rem" }}>Grande École d'Ingénieurs</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".65rem", color: "var(--mu2)", marginBottom: ".9rem" }}>Fondée en 1986 · État Malagasy</div>
              <div style={{ display: "flex", justifyContent: "center", gap: ".35rem", flexWrap: "wrap" }}>
                {["Licence","Master","Ingénieur"].map(d => <span key={d} style={{ fontFamily: "var(--mono)", fontSize: ".58rem", padding: ".2rem .6rem", borderRadius: 5, background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", color: "var(--c1)" }}>{d}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="sec" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <div className="stats-grid">
            {[{n:1986,l:"Année de fondation",s:""},{n:3000,l:"Étudiants formés",s:"+"},{n:5,l:"Filières disponibles",s:""},{n:38,l:"Ans d'excellence",s:"+"}].map((s,i) => (
              <div key={i} style={{ background: "var(--surf)", border: "1px solid var(--b1)", borderRadius: 14, padding: "1.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 900, background: "linear-gradient(135deg,var(--c1),var(--c3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {cStarted ? <Counter target={s.n} suffix={s.s} /> : "0"}
                </div>
                <div style={{ fontFamily: "var(--mono)", fontSize: ".66rem", color: "var(--mu2)", letterSpacing: ".06em", marginTop: ".3rem" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="sec" style={{ background: "var(--bg)" }}>
        <div className="wrap">
          <SecHeader num="01" title="Filières de" accent="Formation" />
          <div className="programs-grid">{programs.map((p,i) => <ProgramCard key={i} {...p} idx={i} />)}</div>
        </div>
      </section>

      {/* VALUES */}
      <section className="sec" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <SecHeader num="02" title="Nos" accent="Valeurs" />
          <div className="values-grid">{values.map((v,i) => <ValueCard key={i} {...v} idx={i} />)}</div>
        </div>
      </section>

      {/* MON PARCOURS */}
      <section className="sec" style={{ background: "var(--bg)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 100%,rgba(124,58,237,.06),transparent 60%)", pointerEvents: "none" }} />
        <div className="wrap" style={{ maxWidth: 900, position: "relative", zIndex: 1 }}>
          <SecHeader num="03" title="Mon" accent="Parcours ENI" />
          <div style={{ background: "var(--surf)", border: "1px solid var(--b2)", borderRadius: 18, padding: "clamp(1.5rem,4vw,2.8rem)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,var(--c1),var(--c2),var(--c3))" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: ".8rem", marginBottom: ".8rem", flexWrap: "wrap" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: ".68rem", color: "var(--c1)", letterSpacing: ".12em" }}>2021 → PRÉSENT</div>
              <div style={{ background: "rgba(6,255,165,.07)", border: "1px solid rgba(6,255,165,.22)", color: "var(--c3)", fontFamily: "var(--mono)", fontSize: ".6rem", padding: ".32rem .85rem", borderRadius: 100 }}>M2 En cours</div>
            </div>
            <h3 style={{ fontSize: "clamp(1.2rem,2.5vw,1.5rem)", fontWeight: 800, marginBottom: ".85rem", letterSpacing: "-.02em" }}>Étudiant en Informatique Générale</h3>
            <p style={{ color: "var(--mu2)", lineHeight: 1.78, marginBottom: ".9rem", fontSize: ".92rem" }}>
              Depuis mon entrée à l'ENI en 2021, j'ai acquis une solide formation en développement logiciel, réseaux et systèmes d'exploitation. L'ENI m'a donné les bases théoriques et pratiques pour concevoir des solutions informatiques complètes.
            </p>
            <p style={{ color: "var(--mu2)", lineHeight: 1.78, marginBottom: "1.6rem", fontSize: ".92rem" }}>
              Actuellement en M2, je poursuis mon approfondissement en architecture logicielle et administration systèmes avancée.
            </p>
            <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap" }}>
              {[["L1","2021–22"],["L2","2023"],["L3","2024"],["M1","2025"],["M2","2026 →"]].map(([lv,pd]) => (
                <div key={lv} style={{ background: "var(--surf2)", border: "1px solid var(--b1)", borderRadius: 9, padding: ".65rem .95rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--c1)" }}>{lv}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: ".56rem", color: "var(--mu2)", marginTop: ".12rem" }}>{pd}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── FOOTER ── */
function Footer({ setPage }) {
  return (
    <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--b1)", padding: "1.5rem clamp(1.2rem,5vw,3.5rem)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: ".66rem", color: "var(--mu)" }}>
        <strong style={{ color: "var(--c1)" }}>Tsantatiana F. Rahandrisoa</strong> · 2025
      </div>
      <button onClick={() => { setPage("eni"); window.scrollTo(0, 0); }}
        style={{ fontFamily: "var(--mono)", fontSize: ".66rem", color: "var(--mu2)", background: "none", border: "1px solid var(--b1)", borderRadius: 6, padding: ".32rem .85rem", cursor: "pointer", transition: "all .2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--c1)"; e.currentTarget.style.color = "var(--c1)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--b1)"; e.currentTarget.style.color = "var(--mu2)"; }}>
        À propos — ENI →
      </button>
    </footer>
  );
}

/* ── APP ── */
export default function App() {
  const [page, setPage] = useState("portfolio");
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    const cur = document.getElementById("cur");
    const curb = document.getElementById("curb");
    if (!cur || !curb) return;
    const move = e => { cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; curb.style.left = e.clientX + "px"; curb.style.top = e.clientY + "px"; };
    document.addEventListener("mousemove", move);
    const grow = () => { curb.style.width = "58px"; curb.style.height = "58px"; };
    const shrink = () => { curb.style.width = "38px"; curb.style.height = "38px"; };
    const attach = () => document.querySelectorAll("a,button").forEach(el => { el.addEventListener("mouseenter", grow); el.addEventListener("mouseleave", shrink); });
    attach();
    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => { document.removeEventListener("mousemove", move); obs.disconnect(); };
  }, []);

  const changePage = useCallback((p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  return (
    <>
      <div id="cur"/><div id="curb"/>
      <Nav page={page} setPage={changePage} />
      <main>{page === "portfolio" ? <PortfolioPage photo={photo} setPhoto={setPhoto} /> : <ENIPage />}</main>
      <Footer setPage={changePage} />
    </>
  );
}
