"use client";

import { useRef } from "react";

export default function LandingPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const joinRef = useRef<HTMLDivElement>(null);

  function scrollToJoin() {
    joinRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleJoin() {
    const input = emailRef.current;
    if (!input) return;
    const email = input.value;
    if (!email || !email.includes("@")) {
      input.style.borderColor = "#ef4444";
      return;
    }
    input.style.borderColor = "#34d399";
    input.disabled = true;
    const btn = input.parentElement?.querySelector("button");
    if (btn) {
      btn.textContent = "\u2713 You're in!";
      btn.style.background = "#34d399";
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg: #08080a;
          --surface: #111114;
          --surface-2: #1a1a1f;
          --border: #222228;
          --border-hover: #333340;
          --text: #f0eff4;
          --text-dim: #8a8994;
          --text-muted: #55545e;
          --accent: #a78bfa;
          --accent-dim: #7c5cbf;
          --accent-glow: rgba(167,139,250,0.12);
          --green: #34d399;
          --green-dim: rgba(52,211,153,0.1);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        body::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999;
        }

        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 40px;
          background: rgba(8,8,10,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .lp-logo {
          font-family: 'JetBrains Mono', monospace;
          font-size: 18px; font-weight: 500; letter-spacing: -0.02em;
        }
        .lp-logo span { color: var(--accent); }
        .lp-nav-links { display: flex; gap: 32px; align-items: center; }
        .lp-nav-links a {
          font-size: 14px; color: var(--text-dim); text-decoration: none;
          transition: color 0.2s;
        }
        .lp-nav-links a:hover { color: var(--text); }
        .lp-nav-cta {
          font-size: 13px; font-weight: 500; color: var(--bg) !important;
          background: var(--accent); padding: 8px 20px; border-radius: 8px;
          transition: all 0.2s;
        }
        .lp-nav-cta:hover { background: #b99dff; transform: translateY(-1px); }

        .lp-hero {
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 120px 24px 80px; position: relative;
        }
        .lp-hero::before {
          content: '';
          position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
          width: 800px; height: 800px;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          pointer-events: none;
        }

        .lp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; color: var(--accent);
          background: var(--accent-glow);
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 99px; padding: 6px 16px;
          margin-bottom: 32px;
          animation: lp-fadeInUp 0.6s ease both;
        }
        .lp-badge-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--green);
          animation: lp-pulse-dot 2s infinite;
        }

        .lp-h1 {
          font-size: clamp(42px, 6.5vw, 80px);
          font-weight: 700; line-height: 1.05; letter-spacing: -0.03em;
          max-width: 900px;
          animation: lp-fadeInUp 0.6s ease 0.1s both;
        }
        .lp-h1 .gradient {
          background: linear-gradient(135deg, var(--accent) 0%, #60a5fa 50%, var(--green) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-subtitle {
          font-size: clamp(17px, 2vw, 20px);
          color: var(--text-dim); max-width: 520px;
          margin: 24px auto 48px; line-height: 1.6;
          animation: lp-fadeInUp 0.6s ease 0.2s both;
        }

        .lp-hero-cta-row {
          display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: center;
          animation: lp-fadeInUp 0.6s ease 0.3s both;
        }
        .lp-btn-primary {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px; font-weight: 600; color: var(--bg);
          background: var(--accent); border: none; border-radius: 12px;
          padding: 16px 36px; cursor: pointer; transition: all 0.25s;
        }
        .lp-btn-primary:hover { background: #b99dff; transform: translateY(-2px); box-shadow: 0 8px 30px var(--accent-glow); }

        .lp-hero-proof {
          margin-top: 32px; font-size: 13px; color: var(--text-muted);
          animation: lp-fadeInUp 0.6s ease 0.4s both;
        }
        .lp-hero-proof strong { color: var(--text-dim); }

        .lp-stats {
          display: flex; justify-content: center; gap: 48px; flex-wrap: wrap;
          padding: 48px 24px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .lp-stat { text-align: center; }
        .lp-stat-n {
          font-family: 'JetBrains Mono', monospace;
          font-size: 36px; font-weight: 500;
        }
        .lp-stat-l { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

        .lp-section { padding: 100px 24px; max-width: 1100px; margin: 0 auto; }
        .lp-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em;
          color: var(--accent); margin-bottom: 12px;
        }
        .lp-section-title {
          font-size: clamp(28px, 4vw, 44px); font-weight: 700;
          letter-spacing: -0.02em; line-height: 1.15; max-width: 640px;
          margin-bottom: 16px;
        }
        .lp-section-sub {
          font-size: 17px; color: var(--text-dim); max-width: 540px;
          line-height: 1.6; margin-bottom: 48px;
        }

        .lp-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .lp-step {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 28px; position: relative;
          transition: border-color 0.3s;
        }
        .lp-step:hover { border-color: var(--border-hover); }
        .lp-step-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 48px; font-weight: 700; color: var(--surface-2);
          position: absolute; top: 16px; right: 20px; line-height: 1;
        }
        .lp-step-icon { font-size: 28px; margin-bottom: 16px; }
        .lp-step h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
        .lp-step p { font-size: 14px; color: var(--text-dim); line-height: 1.55; }

        .lp-features { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .lp-feat {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 32px; transition: border-color 0.3s;
        }
        .lp-feat:hover { border-color: var(--border-hover); }
        .lp-feat.wide { grid-column: span 2; }
        .lp-feat-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--accent); background: var(--accent-glow);
          padding: 4px 10px; border-radius: 6px; display: inline-block;
          margin-bottom: 16px;
        }
        .lp-feat h3 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
        .lp-feat p { font-size: 15px; color: var(--text-dim); line-height: 1.6; }

        .lp-course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .lp-course-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; overflow: hidden; transition: all 0.3s;
        }
        .lp-course-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }
        .lp-course-thumb {
          height: 160px; background: var(--surface-2);
          display: flex; align-items: center; justify-content: center;
          font-size: 48px; position: relative;
        }
        .lp-course-new {
          position: absolute; top: 12px; right: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; background: var(--green-dim); color: var(--green);
          border: 1px solid rgba(52,211,153,0.2); border-radius: 6px; padding: 3px 8px;
        }
        .lp-course-body { padding: 20px; }
        .lp-course-cat {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--accent); margin-bottom: 8px;
        }
        .lp-course-body h4 { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
        .lp-course-body p { font-size: 13px; color: var(--text-dim); }
        .lp-course-meta {
          display: flex; gap: 16px; margin-top: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: var(--text-muted);
        }

        .lp-pricing-card {
          max-width: 480px; margin: 0 auto;
          background: linear-gradient(135deg, rgba(167,139,250,0.06), rgba(96,165,250,0.04));
          border: 1px solid rgba(167,139,250,0.25);
          border-radius: 20px; padding: 40px; text-align: center;
        }
        .lp-pricing-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--accent); margin-bottom: 8px;
        }
        .lp-pricing-amount { font-size: 56px; font-weight: 700; }
        .lp-pricing-amount span { font-size: 18px; font-weight: 400; color: var(--text-dim); }
        .lp-pricing-desc { font-size: 15px; color: var(--text-dim); margin: 8px 0 28px; }
        .lp-pricing-list { list-style: none; text-align: left; margin-bottom: 32px; }
        .lp-pricing-list li {
          font-size: 15px; color: var(--text-dim); padding: 10px 0;
          border-top: 1px solid rgba(167,139,250,0.1);
          display: flex; align-items: center; gap: 12px;
        }
        .lp-pricing-list li::before { content: '\u2713'; color: var(--green); font-weight: 600; }
        .lp-pricing-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 16px; font-weight: 600; color: var(--bg);
          background: var(--accent); border: none; border-radius: 12px;
          padding: 16px 48px; cursor: pointer; transition: all 0.25s;
          width: 100%;
        }
        .lp-pricing-btn:hover { background: #b99dff; transform: translateY(-2px); }

        .lp-cta-section {
          text-align: center; padding: 100px 24px;
          max-width: 640px; margin: 0 auto;
        }
        .lp-cta-section h2 {
          font-size: clamp(32px, 5vw, 48px); font-weight: 700;
          letter-spacing: -0.02em; margin-bottom: 16px;
        }
        .lp-cta-section p { font-size: 17px; color: var(--text-dim); margin-bottom: 36px; }

        .lp-email-form { display: flex; gap: 8px; max-width: 440px; margin: 0 auto; }
        .lp-email-form input {
          flex: 1; font-family: 'DM Sans', sans-serif; font-size: 15px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 14px 18px; color: var(--text);
          outline: none; transition: border-color 0.2s;
        }
        .lp-email-form input::placeholder { color: var(--text-muted); }
        .lp-email-form input:focus { border-color: var(--accent); }

        .lp-footer {
          text-align: center; padding: 48px 24px;
          border-top: 1px solid var(--border);
          font-size: 13px; color: var(--text-muted);
        }
        .lp-footer a { color: var(--text-dim); text-decoration: none; }
        .lp-footer .lp-footer-brand {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px; color: var(--text-dim); margin-bottom: 8px;
        }

        @keyframes lp-fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 768px) {
          .lp-nav { padding: 12px 20px; }
          .lp-nav-links a:not(.lp-nav-cta) { display: none; }
          .lp-features { grid-template-columns: 1fr; }
          .lp-feat.wide { grid-column: span 1; }
          .lp-stats { gap: 32px; }
          .lp-email-form { flex-direction: column; }
        }
      `}</style>

      <nav className="lp-nav">
        <div className="lp-logo">ACDMY<span>.</span>in</div>
        <div className="lp-nav-links">
          <a href="#courses">Courses</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#join" className="lp-nav-cta">Join Waitlist</a>
        </div>
      </nav>

      <div className="lp-hero">
        <div className="lp-badge"><div className="lp-badge-dot" /> New course every day</div>
        <h1 className="lp-h1">Learn AI.<br /><span className="gradient">Build with it.</span></h1>
        <p className="lp-subtitle">A new hands-on AI course drops every single day. Video lessons, interactive exercises, AI mentor, and a community of builders. $25/mo.</p>
        <div className="lp-hero-cta-row">
          <button className="lp-btn-primary" onClick={scrollToJoin}>Start Learning — $25/mo</button>
        </div>
        <p className="lp-hero-proof"><strong>365 courses/year</strong> · Video + text · Interactive exercises · AI mentor</p>
      </div>

      <div className="lp-stats">
        <div className="lp-stat"><div className="lp-stat-n">1</div><div className="lp-stat-l">New course / day</div></div>
        <div className="lp-stat"><div className="lp-stat-n">5</div><div className="lp-stat-l">Lessons per course</div></div>
        <div className="lp-stat"><div className="lp-stat-n">$25</div><div className="lp-stat-l">Per month</div></div>
        <div className="lp-stat"><div className="lp-stat-n">&infin;</div><div className="lp-stat-l">AI mentor access</div></div>
      </div>

      <section className="lp-section">
        <div className="lp-section-label">How It Works</div>
        <div className="lp-section-title">A new course lands every morning.</div>
        <div className="lp-section-sub">AI builds the course. A human curates it. You learn by doing — not just watching.</div>
        <div className="lp-steps">
          <div className="lp-step">
            <div className="lp-step-num">01</div>
            <div className="lp-step-icon">🎯</div>
            <h3>Daily Drop</h3>
            <p>Every morning, a new course appears in your library. AI tools, workflows, prompts, frameworks — whatever&apos;s cutting edge right now.</p>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">02</div>
            <div className="lp-step-icon">🎬</div>
            <h3>Watch + Do</h3>
            <p>Each course has 5 lessons. Video walkthroughs, interactive exercises, and quizzes that test understanding — not memorization.</p>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">03</div>
            <div className="lp-step-icon">🤖</div>
            <h3>Ask Your Mentor</h3>
            <p>Stuck? Your AI mentor knows the course material and your progress. Ask anything. Get unstuck in seconds.</p>
          </div>
          <div className="lp-step">
            <div className="lp-step-num">04</div>
            <div className="lp-step-icon">🏆</div>
            <h3>Earn &amp; Share</h3>
            <p>Complete courses, earn certificates, climb the leaderboard. Share on LinkedIn. Visible proof you&apos;re ahead of the curve.</p>
          </div>
        </div>
      </section>

      <section className="lp-section" id="features">
        <div className="lp-section-label">What&apos;s Inside</div>
        <div className="lp-section-title">Not another passive video library.</div>
        <div className="lp-section-sub">Every course is built to make you do the work — because that&apos;s how you actually learn.</div>
        <div className="lp-features">
          <div className="lp-feat">
            <div className="lp-feat-tag">Video</div>
            <h3>Bite-Sized Video Lessons</h3>
            <p>Avatar intros, then screen walkthroughs with voiceover. No fluff. Every lesson under 10 minutes. Designed for people who build, not people who binge.</p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-tag">Interactive</div>
            <h3>Exercises &amp; Quizzes</h3>
            <p>Step-by-step exercises that make you use the tools. Quizzes that test understanding. You don&apos;t pass by watching — you pass by doing.</p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-tag">Always On</div>
            <h3>AI Mentor Chat</h3>
            <p>Your personal tutor that knows every course and your learning history. Ask anything, anytime. Like office hours that never close.</p>
          </div>
          <div className="lp-feat">
            <div className="lp-feat-tag">Proof</div>
            <h3>Shareable Certificates</h3>
            <p>Complete a course, earn a certificate with a unique verification URL. Share on LinkedIn. Each cert is social proof that compounds.</p>
          </div>
          <div className="lp-feat wide">
            <div className="lp-feat-tag">Community</div>
            <h3>Learn With Builders</h3>
            <p>Weekly challenges, leaderboard, accountability streaks. Post your wins, share what you built, get feedback from people doing the same thing. You don&apos;t cancel when your streak is on the line.</p>
          </div>
        </div>
      </section>

      <section className="lp-section" id="courses">
        <div className="lp-section-label">Course Library</div>
        <div className="lp-section-title">This week&apos;s drops.</div>
        <div className="lp-section-sub">A sample of what lands daily. From prompt engineering to building full AI-powered products.</div>
        <div className="lp-course-grid">
          <div className="lp-course-card">
            <div className="lp-course-thumb" style={{ background: "linear-gradient(135deg,#1a1040,#2d1b69)" }}>🧠<div className="lp-course-new">TODAY</div></div>
            <div className="lp-course-body">
              <div className="lp-course-cat">Prompt Engineering</div>
              <h4>Claude System Prompts That Actually Work</h4>
              <p>Build production-grade system prompts. Structured outputs, tool use, chain-of-thought — with real examples.</p>
              <div className="lp-course-meta"><span>5 lessons</span><span>~35 min</span><span>Video + Quiz</span></div>
            </div>
          </div>
          <div className="lp-course-card">
            <div className="lp-course-thumb" style={{ background: "linear-gradient(135deg,#0a2a1e,#134e3a)" }}>⚡</div>
            <div className="lp-course-body">
              <div className="lp-course-cat">AI Agents</div>
              <h4>Build Your First AI Agent in 30 Minutes</h4>
              <p>From zero to a working agent. Tool calling, memory, error handling. Deploy by the end of the course.</p>
              <div className="lp-course-meta"><span>5 lessons</span><span>~30 min</span><span>Video + Exercise</span></div>
            </div>
          </div>
          <div className="lp-course-card">
            <div className="lp-course-thumb" style={{ background: "linear-gradient(135deg,#2a1a0a,#4a2a10)" }}>📊</div>
            <div className="lp-course-body">
              <div className="lp-course-cat">Business</div>
              <h4>AI-Powered Content Machines</h4>
              <p>How to build an automated content pipeline that generates, publishes, and distributes — while you sleep.</p>
              <div className="lp-course-meta"><span>5 lessons</span><span>~40 min</span><span>Video + Exercise</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section" id="pricing">
        <div className="lp-section-label">Pricing</div>
        <div className="lp-section-title">One plan. Everything included.</div>
        <div className="lp-section-sub">No tiers. No upsells. $25/mo gets you the full platform.</div>
        <div className="lp-pricing-card">
          <div className="lp-pricing-label">ACDMY Pro</div>
          <div className="lp-pricing-amount">$25 <span>/mo</span></div>
          <div className="lp-pricing-desc">Cancel anytime. New course every day.</div>
          <ul className="lp-pricing-list">
            <li>New course every single day (365/year)</li>
            <li>Video lessons + text content</li>
            <li>Interactive exercises &amp; quizzes</li>
            <li>AI mentor chat (unlimited)</li>
            <li>Community + weekly challenges</li>
            <li>Leaderboard + streaks</li>
            <li>Shareable certificates</li>
            <li>Full course library access</li>
          </ul>
          <button className="lp-pricing-btn" onClick={scrollToJoin}>Join Waitlist</button>
        </div>
      </section>

      <div className="lp-cta-section" ref={joinRef} id="join">
        <h2>Start learning <span style={{ color: "var(--accent)" }}>today</span>.</h2>
        <p>Drop your email. We&apos;ll send you access as soon as we open.</p>
        <div className="lp-email-form">
          <input type="email" placeholder="your@email.com" ref={emailRef} />
          <button className="lp-btn-primary" onClick={handleJoin}>Join Waitlist</button>
        </div>
        <p className="lp-hero-proof" style={{ marginTop: 16 }}><strong>No spam.</strong> Just a launch date.</p>
      </div>

      <footer className="lp-footer">
        <div className="lp-footer-brand">ACDMY.in</div>
        <p>A <a href="https://livin.in">LIVIN Media</a> spoke · Built with AI · &copy; 2026</p>
      </footer>
    </>
  );
}
