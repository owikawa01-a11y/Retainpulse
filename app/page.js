"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Reveal from './components/Reveal';
import HeroDemo from './components/HeroDemo';

/* ===========================================
   Brand Logo
   =========================================== */
const Logo = ({ size = "md" }) => {
  const dims = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const icon = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const text = size === "sm" ? "text-base" : "text-lg";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative ${dims} rounded-[10px] bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30`}>
        <div className="absolute inset-0 rounded-[10px] bg-gradient-to-tr from-transparent via-white/25 to-transparent" />
        <svg className={`${icon} text-white relative`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h3l2-7 4 14 2-7h7" />
        </svg>
      </div>
      <span className={`${text} font-bold tracking-tight`}>
        Retain<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Pulse</span>
      </span>
    </div>
  );
};

/* ===========================================
   Icons
   =========================================== */
const Arrow = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
const Check = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const Spark = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

/* ===========================================
   Animated Counter
   =========================================== */
function Counter({ to, suffix = '', duration = 1600 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(eased * to));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{value}{suffix}</span>;
}

/* ===========================================
   Main
   =========================================== */
export default function Home() {
  const cursorRef = useRef(null);

  /* Cursor glow */
  useEffect(() => {
    const glow = cursorRef.current;
    if (!glow) return;
    let raf;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#05050c] text-white font-sans antialiased overflow-x-hidden">

      {/* ═══════ Background layers ═══════ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid" />

        {/* Animated gradient orbs */}
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-violet-600/[0.14] rounded-full blur-[160px] animate-float-slow" />
        <div className="absolute top-[30%] right-[-15%] w-[800px] h-[800px] bg-fuchsia-600/[0.10] rounded-full blur-[140px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/[0.05] rounded-full blur-[140px] animate-float-slow" style={{ animationDelay: '4s' }} />

        {/* Noise overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.015] mix-blend-overlay" />
      </div>

      {/* Cursor glow (desktop only) */}
      <div
        ref={cursorRef}
        className="hidden md:block fixed top-0 left-0 w-[500px] h-[500px] rounded-full bg-violet-500/[0.06] blur-[120px] pointer-events-none z-0 transition-transform duration-300 ease-out"
      />

      <div className="relative z-10">

        {/* ═══════ NAVBAR ═══════ */}
        <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#05050c]/70 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Logo />

            <div className="hidden md:flex items-center gap-1 text-sm text-slate-400">
              {[["How it works","#how-it-works"],["Features","#features"],["Pricing","#pricing"],["FAQ","#faq"]].map(([l,h]) => (
                <a key={h} href={h} className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-white/[0.04] transition-all duration-200">
                  {l}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link href="/demo" className="hidden sm:block px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                Live demo
              </Link>
              <Link href="/book" className="group relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden transition-transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-1.5">
                  Book installation
                  <Arrow />
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {/* ═══════ HERO ═══════ */}
        <section className="max-w-6xl mx-auto px-6 pt-20 md:pt-28 pb-24 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/[0.08] border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-10 backdrop-blur-sm animate-pulse-glow">
              <Spark />
              <span>Founding Members · 5 spots only</span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.75rem] font-bold tracking-[-0.035em] leading-[0.97] mb-8">
              <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
                Stop losing customers
              </span>
              <br />
              <span className="gradient-text">silently.</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              I personally install RetainPulse on your site within 48 hours — then manage it for 30 days.
              You see exactly why customers cancel, and get a real shot at keeping some of them.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Link href="/book" className="group relative px-8 py-4 rounded-2xl text-base font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-2xl shadow-violet-500/30">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-violet-600 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  Book my installation — $199
                  <Arrow />
                </span>
              </Link>
              <Link href="/demo" className="px-8 py-4 rounded-2xl text-base font-medium text-slate-200 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.16] transition-all duration-300 backdrop-blur-sm">
                See the live demo
              </Link>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-500 flex-wrap">
              {['48-hour setup', 'No dev work needed', 'You own everything'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Hero demo */}
          <Reveal delay={500}>
            <div className="mt-20">
              <HeroDemo />
            </div>
          </Reveal>
        </section>

        {/* ═══════ MARQUEE ═══════ */}
        <section className="py-16 border-t border-white/[0.04] overflow-hidden">
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-slate-600 mb-8">
            Built for indie SaaS founders
          </p>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#05050c] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#05050c] to-transparent z-10 pointer-events-none" />
            <div className="flex gap-16 animate-marquee whitespace-nowrap">
              {[...Array(2)].flatMap((_, dup) =>
                ['MicroSaaS','SoloStack','IndieHQ','LaunchPad','ShipFast','Bootstrapped','BuildInPublic','SaaSFounders'].map((name) => (
                  <span key={`${dup}-${name}`} className="text-lg font-bold text-slate-600 hover:text-slate-400 transition-colors duration-300 tracking-tight">
                    {name}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ═══════ PROBLEM ═══════ */}
        <section className="max-w-6xl mx-auto px-6 py-28 border-t border-white/[0.04]">
          <Reveal className="text-center mb-20">
            <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-[0.3em] mb-5">The Problem</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.025em] leading-[1.05] mb-6">
              You&apos;re losing revenue
              <br />
              <span className="text-slate-500">and you don&apos;t know why.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
              Every month, customers cancel. Some leave a feedback form. Most just disappear.
              You&apos;re left guessing — while your MRR quietly shrinks.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { tag: '01', title: 'Silent churn', desc: '70% of customers who cancel never tell you why. You lose them without a single signal.', accent: 'rose' },
              { tag: '02', title: 'Generic surveys', desc: 'Multi-choice forms give you data, not insight. You need to know the real reason behind the reason.', accent: 'amber' },
              { tag: '03', title: 'No retention play', desc: 'Without a way to intervene at the moment of cancellation, you never get a chance to save them.', accent: 'violet' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="group relative h-full p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] card-hover overflow-hidden">
                  {/* Accent glow */}
                  <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${
                    item.accent === 'rose' ? 'bg-rose-500' :
                    item.accent === 'amber' ? 'bg-amber-500' : 'bg-violet-500'
                  }`} />

                  <span className="relative inline-block text-[10px] font-mono tracking-widest text-slate-600 mb-6">
                    {item.tag}
                  </span>

                  <h3 className="relative text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="relative text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-28 border-t border-white/[0.04]">
          <Reveal className="text-center mb-20">
            <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-[0.3em] mb-5">How it works</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.025em] leading-[1.05] mb-6">
              I install it. You watch it work.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
              No SDK. No dev sprint. No backend changes. I do the entire setup for you.
            </p>
          </Reveal>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute top-20 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { num: '01', title: 'I install it (48 hours)', desc: 'You give me access. I install the widget, connect it to your cancellation flow, and test it end-to-end.' },
                { num: '02', title: 'AI asks the right question', desc: 'When someone clicks cancel, RetainPulse asks a smart, contextual follow-up — not a generic survey.' },
                { num: '03', title: 'I manage it for 30 days', desc: 'I monitor results, tweak the retention offers, and send you weekly insights — for 30 days.' },
              ].map((step, i) => (
                <Reveal key={step.num} delay={i * 150}>
                  <div className="group relative h-full p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] card-hover">
                    {/* Step badge */}
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 border border-violet-500/25 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/10 group-hover:scale-110 transition-transform duration-500">
                      <span className="text-sm font-mono font-bold text-violet-300">{step.num}</span>
                    </div>

                    <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Code block */}
          <Reveal delay={400}>
            <div className="mt-14 max-w-3xl mx-auto">
              <p className="text-center text-xs text-slate-500 mb-4">
                Or if you prefer to install it yourself — one script tag:
              </p>
              <div className="group relative rounded-2xl overflow-hidden">
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/40 via-fuchsia-500/40 to-violet-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
                <div className="relative rounded-2xl bg-black/60 border border-white/[0.06] overflow-hidden backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                    <span className="ml-3 text-xs text-slate-500 font-mono">install.html</span>
                  </div>
                  <pre className="p-5 text-xs md:text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`<script src="https://retainpulse.pro/widget.js"></script>
<script>
  window.RetainPulseConfig = {
    publicKey: "your_public_key"
  };
</script>
<button data-retainpulse-trigger>Cancel subscription</button>`}
                  </pre>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══════ STATS ═══════ */}
        <section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { to: 70, suffix: '%', label: 'of churn is silent' },
              { to: 48, suffix: 'h', label: 'installation time' },
              { to: 30, suffix: '', label: 'days of management' },
              { to: 0, suffix: '$', label: 'monthly fees' },
            ].map((stat, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="relative text-center p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] card-hover overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.05] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-2">
                    {stat.suffix === '$' ? `$${stat.to}` : <><Counter to={stat.to} />{stat.suffix}</>}
                  </div>
                  <div className="relative text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══════ FEATURES ═══════ */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-28 border-t border-white/[0.04]">
          <Reveal className="text-center mb-20">
            <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-[0.3em] mb-5">What&apos;s included</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.025em] leading-[1.05] mb-6">
              Everything you need.
              <br />
              <span className="text-slate-500">Nothing you don&apos;t.</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Personal installation', desc: 'I install it myself within 48 hours. No dev work needed from you.' },
              { title: 'AI follow-up questions', desc: 'Goes deeper than the first reason. Understands the real why behind every cancellation.' },
              { title: 'One retention offer', desc: 'Reason-matched and compliant with California ARA 2025. No dark patterns.' },
              { title: 'Recovered Revenue tracking', desc: 'See exactly how much MRR you saved this month, in one clean number.' },
              { title: 'Save rate analytics', desc: 'Track the percentage of cancel attempts you actually save — per reason.' },
              { title: '30-day management', desc: 'I monitor, tweak, and send weekly insights. Direct access to me — no chatbot.' },
            ].map((f, i) => (
              <Reveal key={i} delay={(i % 3) * 100}>
                <div className="group relative h-full p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] card-hover overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 border border-violet-500/20 flex items-center justify-center text-violet-300 mb-4 group-hover:scale-110 transition-transform duration-500">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══════ PRICING ═══════ */}
        <section id="pricing" className="max-w-5xl mx-auto px-6 py-28 border-t border-white/[0.04]">
          <Reveal className="text-center mb-16">
            <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-[0.3em] mb-5">Pricing</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.025em] leading-[1.05] mb-6">
              Founding Member offer
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              One-time. No monthly fees. Only 5 spots at this price.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="max-w-2xl mx-auto relative group">
              {/* Animated gradient border */}
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-[2px]" />
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 opacity-40" />

              <div className="relative rounded-3xl p-8 md:p-10 bg-[#0a0a14]">

                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold tracking-widest uppercase shadow-lg animate-pulse-glow">
                  Founding Members · 5 spots
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold mb-2">RetainPulse Setup Service</h3>
                  <p className="text-sm text-slate-400">Done-for-you. No SDK. 48 hours.</p>
                </div>

                <div className="text-center mb-10">
                  <div className="text-6xl font-bold tracking-tight gradient-text">$199</div>
                  <p className="text-xs text-slate-500 mt-2">One-time · No recurring fees</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { step: 'Step 1', price: '$100', label: 'Installation', color: 'violet' },
                    { step: 'Step 2', price: '$99', label: '30-day management', color: 'fuchsia' },
                  ].map((s) => (
                    <div key={s.step} className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 text-center hover:border-white/[0.16] transition-all duration-300">
                      <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${s.color === 'violet' ? 'text-violet-300' : 'text-fuchsia-300'}`}>{s.step}</p>
                      <p className="text-lg font-bold text-white">{s.price}</p>
                      <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                <Link href="/book" className="group/btn w-full py-4 rounded-2xl font-semibold text-sm bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                  <span>Book my installation</span>
                  <span className="transition-transform group-hover/btn:translate-x-1"><Arrow /></span>
                </Link>

                <p className="text-center text-sm mt-6">
                  <Link href="/pricing" className="text-violet-400 hover:text-violet-300 transition-colors">
                    See full details and FAQ →
                  </Link>
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══════ FAQ ═══════ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-28 border-t border-white/[0.04]">
          <Reveal className="text-center mb-16">
            <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-[0.3em] mb-5">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.025em]">Common questions</h2>
          </Reveal>

          <div className="space-y-3">
            {[
              { q: 'Why so much cheaper than Churnkey or ProsperStack?', a: "Because I'm building this in public and you're one of my first 5 customers. In exchange for the discount, I'll use your results as a case study (anonymized if you prefer). Churnkey and ProsperStack charge $200-300+ per month. I charge $199 one-time." },
              { q: "What if it doesn't work?", a: "You pay $100 upfront for the installation. If after 7 days you don't see the value, you don't pay the $99 management fee. Simple." },
              { q: 'Do I need a developer to install this?', a: "No. I do the entire installation myself within 48 hours. You just give me access (or send me the code snippet to paste)." },
              { q: 'How do I pay?', a: 'Payoneer payment link. Card or bank transfer. You get an invoice for both steps.' },
              { q: 'Can I cancel anytime?', a: "Yes. The service is one-time. After 30 days, you keep the widget and the dashboard forever — no recurring fees." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <details className="group rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.14] transition-colors duration-300 overflow-hidden">
                  <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-white">{item.q}</span>
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 group-open:rotate-45 transition-transform duration-300">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{item.a}</div>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ═══════ FINAL CTA ═══════ */}
        <section className="max-w-4xl mx-auto px-6 py-28">
          <Reveal>
            <div className="relative p-12 md:p-20 rounded-[40px] bg-gradient-to-br from-violet-500/[0.12] via-fuchsia-500/[0.06] to-transparent border border-violet-500/20 overflow-hidden text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/[0.2] rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-500/[0.15] rounded-full blur-3xl translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="relative">
                <h2 className="text-4xl md:text-6xl font-bold tracking-[-0.025em] leading-[1.05] mb-6">
                  Only 5 spots available.
                </h2>
                <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                  Once these are gone, the price goes up. Book your installation today.
                </p>

                <Link href="/book" className="group inline-flex relative px-10 py-4 rounded-2xl text-base font-semibold text-white overflow-hidden transition-transform hover:scale-[1.03] active:scale-[0.98] shadow-2xl shadow-violet-500/40">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-violet-600 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    Book my installation
                    <Arrow />
                  </span>
                </Link>

                <p className="text-xs text-slate-500 mt-6">
                  $100 upfront · $99 after 7 days · No recurring fees
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer className="border-t border-white/[0.06] py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <Logo size="sm" />
              <nav className="flex gap-6 text-sm text-slate-500 flex-wrap justify-center">
                <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
                <Link href="/refund" className="hover:text-slate-300 transition-colors">Refund</Link>
                <a href="mailto:hello@retainpulse.pro" className="hover:text-slate-300 transition-colors">Contact</a>
                <a href="https://x.com/Retainpulse" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">X / Twitter</a>
              </nav>
            </div>
            <div className="text-center text-xs text-slate-600">
              © 2026 RetainPulse. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}