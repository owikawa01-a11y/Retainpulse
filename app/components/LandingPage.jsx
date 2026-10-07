"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const Icon = ({ children, className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const Arrow = () => <Icon className="w-4 h-4"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></Icon>;
const Check = () => <Icon className="w-4 h-4"><path d="m5 12 4 4L19 6"/></Icon>;
const Spark = () => <Icon className="w-4 h-4"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z"/></Icon>;
const Logo = ({ compact=false }) => (
  <div className="flex items-center gap-2.5">
    <span className={`${compact ? "w-8 h-8" : "w-9 h-9"} rounded-[11px] overflow-hidden inline-flex shadow-lg shadow-violet-500/20`}>
      <img src="/logo-mark.svg" alt="" className="w-full h-full" />
    </span>
    {!compact && <span className="font-bold tracking-[-0.04em] text-lg">Retain<span className="text-gradient-violet">Pulse</span></span>}
  </div>
);

function Reveal({ children, className="", delay=0 }) {
  const ref=useRef(null); const [show,setShow]=useState(false);
  useEffect(()=>{ const el=ref.current; if(!el)return; const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setShow(true);o.disconnect();}}, {threshold:.12}); o.observe(el); return()=>o.disconnect();},[]);
  return <div ref={ref} className={`transition-all duration-700 ${show?"opacity-100 translate-y-0":"opacity-0 translate-y-8"} ${className}`} style={{transitionDelay:`${delay}ms`}}>{children}</div>;
}

function CursorGlow(){
  const [p,setP]=useState({x:-500,y:-500});
  useEffect(()=>{const move=e=>setP({x:e.clientX,y:e.clientY}); window.addEventListener("pointermove",move,{passive:true}); return()=>window.removeEventListener("pointermove",move);},[]);
  return <div className="fixed z-0 pointer-events-none w-[420px] h-[420px] rounded-full blur-[110px] bg-violet-600/[.10] -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-300 ease-out" style={{left:p.x,top:p.y}}/>;
}

function MiniGraph(){
  return <div className="h-32 flex items-end gap-2 px-2">
    {[34,48,42,65,54,78,70,92,84,100].map((h,i)=><div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-violet-500/20 to-violet-400/70 animate-pulse" style={{height:`${h}%`,animationDelay:`${i*70}ms`}}/> )}
  </div>;
}

function LostCounter(){
  const [n,setN]=useState(0);
  useEffect(()=>{let i=0; const t=setInterval(()=>{i+=3;setN(Math.min(i,127));if(i>=127)clearInterval(t)},18);return()=>clearInterval(t)},[]);
  return <div className="py-4"><div className="text-5xl font-bold tracking-tight text-white">{n}<span className="text-slate-500">+</span></div><div className="mt-2 text-xs text-slate-500">cancellations this month</div></div>;
}

function TiltCard({children,className=""}){
  const ref=useRef(null);
  const onMove=e=>{const r=ref.current.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;ref.current.style.transform=`perspective(900px) rotateX(${y*-4}deg) rotateY(${x*4}deg) translateY(-4px)`};
  const leave=()=>{if(ref.current)ref.current.style.transform=""};
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={leave} className={`transition-transform duration-200 ${className}`}>{children}</div>;
}

function LivePreview(){
  return <div className="relative max-w-5xl mx-auto">
    <div className="absolute -inset-8 bg-violet-600/[.10] blur-3xl rounded-[50px]"/>
    <div className="relative rounded-[28px] border border-white/[.09] bg-[#090912]/90 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.06] bg-white/[.02]">
        <div className="flex gap-1.5"><i className="w-2.5 h-2.5 rounded-full bg-white/20"/><i className="w-2.5 h-2.5 rounded-full bg-white/15"/><i className="w-2.5 h-2.5 rounded-full bg-white/10"/></div>
        <div className="text-[10px] uppercase tracking-[.2em] text-slate-600 font-mono">customer cancellation flow · live</div>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> live</div>
      </div>
      <div className="grid md:grid-cols-[1fr_1.1fr] gap-0">
        <div className="p-7 md:p-10 border-b md:border-b-0 md:border-r border-white/[.06]">
          <div className="text-xs text-slate-500 mb-3">SUBSCRIPTION</div>
          <div className="flex items-end justify-between"><div><div className="text-2xl font-semibold">Pro plan</div><div className="text-sm text-slate-500 mt-1">$49 / month</div></div><div className="text-xs text-slate-600 font-mono">•••• 4242</div></div>
          <div className="mt-10 rounded-2xl border border-rose-500/15 bg-rose-500/[.03] p-5">
            <div className="flex items-center gap-2 text-rose-300 text-sm font-medium"><span className="w-2 h-2 rounded-full bg-rose-400"/> Cancellation intent detected</div>
            <p className="text-xs text-slate-500 mt-2">RetainPulse intercepts the moment before the customer leaves.</p>
          </div>
        </div>
        <div className="p-7 md:p-10 bg-white/[.015]">
          <div className="text-xs uppercase tracking-[.18em] text-violet-400 font-semibold">RetainPulse</div>
          <h3 className="text-xl font-semibold mt-3">Before you go...</h3>
          <p className="text-sm text-slate-400 mt-2">What is the main reason you're cancelling?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
            {["Too expensive","Missing a feature","Switching tools","Not using it enough"].map((x,i)=><div key={x} className={`p-3 rounded-xl border text-xs ${i===0?"border-violet-500/50 bg-violet-500/[.10] text-white":"border-white/[.07] bg-white/[.025] text-slate-400"}`}>{x}</div>)}
          </div>
          <div className="mt-6 flex items-center gap-3 text-xs text-slate-600"><div className="h-px bg-white/[.06] flex-1"/><span>AI follow-up next</span><div className="h-px bg-white/[.06] flex-1"/></div>
        </div>
      </div>
    </div>
  </div>;
}

function FAQ(){
  const [open,setOpen]=useState(0);
  const items=[
    ["What exactly do I get for $249?","I install and configure the cancellation flow within 48 hours, then manage and optimize it for 30 days. You get the widget, dashboard, cancellation insights, AI follow-up questions, reason-matched retention offers, and direct access to me."],
    ["Do I need a developer?","No. This is a done-for-you service. I handle the installation and end-to-end testing. If your setup requires a small code change, I will tell you exactly what is needed."],
    ["What happens after the 30 days?","There is no recurring fee in the founding offer. You keep the installed widget and dashboard. The 30-day period is the hands-on management and optimization period."],
    ["What if it doesn't create value?","The $100 installation payment covers the setup work. The remaining $149 is due after 7 days only if you want to continue with the 30-day management period."],
    ["Is the demo a real product?","Yes. The demo route loads the same RetainPulse widget code used by the product, using a demo configuration. No signup is required."]
  ];
  return <div className="space-y-3">{items.map(([q,a],i)=><div key={q} className="rounded-2xl border border-white/[.06] bg-white/[.02] overflow-hidden"><button onClick={()=>setOpen(open===i?-1:i)} className="w-full px-5 py-5 text-left flex items-center justify-between gap-4"><span className="font-medium text-sm md:text-base">{q}</span><span className={`w-7 h-7 rounded-lg border border-white/[.08] flex items-center justify-center text-slate-400 transition-transform ${open===i?"rotate-45":""}`}>+</span></button>{open===i&&<div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed animate-[fadeInUp_.25s_ease-out]">{a}</div>}</div>)}</div>;
}

function PricingCard(){
  const [founding,setFounding]=useState(true);
  const price=founding?199:249;
  return <div className="relative max-w-2xl mx-auto">
    <div className="absolute -inset-px rounded-[30px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 bg-[length:200%_100%] animate-gradient opacity-70"/>
    <div className="relative m-px rounded-[29px] bg-[#080811] p-7 md:p-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div><div className="text-xs uppercase tracking-[.18em] text-violet-400 font-semibold">Founding offer</div><h3 className="text-2xl font-bold mt-2">Done-for-you retention</h3></div>
        <span className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">5 spots</span>
      </div>
      <div className="flex p-1 rounded-xl bg-white/[.03] border border-white/[.06] mb-8">
        <button onClick={()=>setFounding(true)} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition ${founding?"bg-violet-500/15 text-white":"text-slate-500"}`}>Founding · $199</button>
        <button onClick={()=>setFounding(false)} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition ${!founding?"bg-white/[.07] text-white":"text-slate-500"}`}>Standard · $249</button>
      </div>
      <div className="flex items-end gap-3"><span className="text-6xl font-bold tracking-[-.05em]">${price}</span><span className="pb-2 text-sm text-slate-500">one-time</span></div>
      <p className="text-sm text-slate-400 mt-3">No monthly software bill. $100 to start, remainder after 7 days.</p>
      <div className="grid sm:grid-cols-2 gap-3 mt-8">
        {["48-hour installation","AI follow-up questions","Reason-matched offer","Live cancellation dashboard","Recovered revenue tracking","30 days managed for you"].map(x=><div key={x} className="flex gap-2.5 text-sm text-slate-300 p-3 rounded-xl bg-white/[.025] border border-white/[.05]"><span className="text-emerald-400 mt-0.5"><Check/></span>{x}</div>)}
      </div>
      <Link href="/book" className="mt-8 w-full inline-flex justify-center items-center gap-2 rounded-2xl py-4 font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-500 shadow-xl shadow-violet-900/30 hover:scale-[1.01] transition-transform">Book installation <Arrow/></Link>
      <div className="mt-4 text-center text-xs text-slate-600">You keep the widget after the management period. No recurring fee on this offer.</div>
    </div>
  </div>;
}

export default function LandingPage(){
  return <main className="relative min-h-screen overflow-hidden bg-[#05050c] text-white">
    <CursorGlow/>
    <div className="absolute inset-x-0 top-0 h-[760px] grid-space pointer-events-none"/>
    <div className="absolute top-[-260px] left-1/2 -translate-x-1/2 w-[850px] h-[650px] rounded-full bg-violet-600/[.13] blur-[150px] pointer-events-none"/>
    <div className="absolute top-[420px] right-[-280px] w-[500px] h-[500px] rounded-full bg-fuchsia-600/[.07] blur-[130px] pointer-events-none"/>

    <nav className="relative z-20 max-w-6xl mx-auto px-5 md:px-6 h-20 flex items-center justify-between">
      <Link href="/" aria-label="RetainPulse home"><Logo/></Link>
      <div className="hidden md:flex items-center gap-7 text-sm text-slate-500">
        <a href="#how-it-works" className="hover:text-white transition">How it works</a><a href="#features" className="hover:text-white transition">Features</a><a href="#pricing" className="hover:text-white transition">Pricing</a><a href="#faq" className="hover:text-white transition">FAQ</a>
      </div>
      <Link href="/book" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[.06] border border-white/[.08] text-sm font-medium hover:bg-white/[.1] transition">Book installation <Arrow/></Link>
    </nav>

    <section className="relative z-10 max-w-6xl mx-auto px-5 md:px-6 pt-16 md:pt-24 pb-20 text-center">
      <Reveal>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-violet-500/20 bg-violet-500/[.07] text-violet-300 text-[11px] font-semibold uppercase tracking-[.16em]"><span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"/> Founding members · limited to 5</div>
      </Reveal>
      <Reveal delay={70}>
        <h1 className="mt-7 text-[clamp(3.1rem,8vw,6.9rem)] font-bold tracking-[-.055em] leading-[.94] max-w-5xl mx-auto">
          Your customers are
          <br/><span className="text-gradient-violet">telling you why they leave.</span>
        </h1>
      </Reveal>
      <Reveal delay={140}>
        <p className="mt-7 max-w-2xl mx-auto text-base md:text-xl text-slate-400 leading-relaxed">RetainPulse intercepts cancellation, uncovers the real reason, and gives you one relevant chance to save the customer — installed and managed for you.</p>
      </Reveal>
      <Reveal delay={210}>
        <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/book" className="group inline-flex justify-center items-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 font-semibold shadow-2xl shadow-violet-900/40 hover:scale-[1.02] transition">Book installation · $249 <Arrow/></Link>
          <Link href="/demo" className="inline-flex justify-center items-center gap-2 px-6 py-4 rounded-2xl bg-white/[.04] border border-white/[.08] text-slate-200 hover:bg-white/[.07] transition"><span className="text-violet-300"><Spark/></span> See the live demo</Link>
        </div>
      </Reveal>
      <Reveal delay={280}>
        <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><Check/><b className="text-slate-300 font-medium">48h</b> setup</span><span className="inline-flex items-center gap-1.5"><Check/><b className="text-slate-300 font-medium">No SDK</b> or dev sprint</span><span className="inline-flex items-center gap-1.5"><Check/><b className="text-slate-300 font-medium">30 days</b> managed</span></div>
      </Reveal>
    </section>

    <section className="relative z-10 px-5 md:px-6 pb-28"><LivePreview/></section>

    <section className="relative z-10 border-t border-white/[.05] py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <Reveal className="max-w-3xl mb-14"><div className="text-xs uppercase tracking-[.2em] text-violet-400 font-semibold">The hidden leak</div><h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-[-.04em] leading-[1.02]">Churn is expensive.<br/><span className="text-slate-500">Guessing is worse.</span></h2><p className="mt-5 text-slate-400 text-lg leading-relaxed">Most cancellation flows stop at a checkbox. RetainPulse turns that final moment into a structured conversation and a retention opportunity.</p></Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          <Reveal><TiltCard className="h-full"><div className="h-full rounded-3xl border border-white/[.06] bg-white/[.02] p-6 md:p-7"><div className="flex items-center justify-between"><span className="text-xs text-slate-500 uppercase tracking-wider">01 · silent churn</span><span className="text-rose-300"><Icon><path d="M4 7h16M4 12h10M4 17h6"/></Icon></span></div><div className="mt-8 rounded-2xl bg-black/20 border border-white/[.05] p-4"><MiniGraph/></div><h3 className="mt-6 text-lg font-semibold">Revenue disappears quietly.</h3><p className="mt-2 text-sm text-slate-500 leading-relaxed">Customers leave without giving you enough context to act.</p></div></TiltCard></Reveal>
          <Reveal delay={80}><TiltCard className="h-full"><div className="h-full rounded-3xl border border-white/[.06] bg-white/[.02] p-6 md:p-7"><div className="flex items-center justify-between"><span className="text-xs text-slate-500 uppercase tracking-wider">02 · generic feedback</span><span className="text-amber-300"><Icon><path d="M6 4h12v12H8l-2 4V4Z"/></Icon></span></div><div className="mt-8 rounded-2xl bg-black/20 border border-white/[.05] p-5 space-y-3 font-mono text-xs"><div className="text-slate-500">reason: <span className="text-white">other</span></div><div className="text-slate-600">reason: <span>other</span></div><div className="text-slate-700">reason: <span>other</span></div></div><h3 className="mt-6 text-lg font-semibold">“Other” isn't insight.</h3><p className="mt-2 text-sm text-slate-500 leading-relaxed">A single multiple-choice answer rarely explains what actually changed.</p></div></TiltCard></Reveal>
          <Reveal delay={160}><TiltCard className="h-full"><div className="h-full rounded-3xl border border-white/[.06] bg-white/[.02] p-6 md:p-7"><div className="flex items-center justify-between"><span className="text-xs text-slate-500 uppercase tracking-wider">03 · missed opportunity</span><span className="text-violet-300"><Spark/></span></div><div className="mt-8 rounded-2xl bg-black/20 border border-white/[.05] p-5"><LostCounter/></div><h3 className="mt-6 text-lg font-semibold">No intervention. No chance.</h3><p className="mt-2 text-sm text-slate-500 leading-relaxed">The cancellation moment is the last high-intent window to understand and respond.</p></div></TiltCard></Reveal>
        </div>
      </div>
    </section>

    <section id="how-it-works" className="relative z-10 border-t border-white/[.05] py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <Reveal className="text-center max-w-3xl mx-auto"><div className="text-xs uppercase tracking-[.2em] text-violet-400 font-semibold">How it works</div><h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-[-.04em]">One cancellation.<br/><span className="text-slate-500">Three intelligent steps.</span></h2></Reveal>
        <div className="mt-16 grid lg:grid-cols-3 gap-5 relative">
          {[["01","Install","I connect the widget to your existing cancellation action and test the full flow within 48 hours."],["02","Understand","The customer chooses a reason, then receives one contextual AI follow-up question."],["03","Intervene","RetainPulse presents one reason-matched retention offer before the cancellation completes."]].map(([n,t,d],i)=><Reveal key={n} delay={i*100}><div className="relative h-full p-7 rounded-3xl border border-white/[.06] bg-gradient-to-b from-white/[.035] to-white/[.015]"><div className="flex items-center justify-between"><span className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center justify-center font-mono text-sm">{n}</span><span className="text-[10px] uppercase tracking-[.2em] text-slate-600">{i===0?"48 hours":i===1?"AI layer":"Retention layer"}</span></div><h3 className="mt-8 text-xl font-semibold">{t}</h3><p className="mt-3 text-sm text-slate-400 leading-relaxed">{d}</p><div className="mt-8 h-px bg-gradient-to-r from-violet-500/40 to-transparent"/><div className="mt-4 text-xs text-slate-600 font-mono">{i===0?"install → verify → launch":i===1?"reason → question → answer":"context → offer → decision"}</div></div></Reveal>)}
        </div>
        <Reveal className="mt-10"><div className="max-w-4xl mx-auto rounded-2xl border border-white/[.06] bg-[#07070d] overflow-hidden"><div className="px-4 py-3 border-b border-white/[.06] flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-400/50"/><span className="w-2.5 h-2.5 rounded-full bg-amber-400/50"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-400/50"/><span className="ml-2 text-[10px] text-slate-600 font-mono">install.html</span></div><pre className="p-5 md:p-7 overflow-x-auto text-xs md:text-sm leading-7 text-slate-400 font-mono"><span className="text-violet-300">&lt;script</span> <span className="text-fuchsia-300">src</span>=<span className="text-emerald-300">"https://retainpulse.pro/widget.js"</span><span className="text-violet-300">&gt;&lt;/script&gt;</span>{"\n"}<span className="text-slate-600">// one trigger — your existing cancellation button</span>{"\n"}<span className="text-violet-300">&lt;button</span> <span className="text-fuchsia-300">data-retainpulse-trigger</span><span className="text-violet-300">&gt;</span>Cancel subscription<span className="text-violet-300">&lt;/button&gt;</span></pre></div></Reveal>
      </div>
    </section>

    <section className="relative z-10 py-20 border-y border-white/[.05]">
      <div className="max-w-6xl mx-auto px-5 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[["48h","installation"],["30 days","hands-on management"],["$0","monthly software fee"],["1","retention offer per cancellation"]].map(([v,l],i)=><Reveal key={l} delay={i*70}><div className="relative overflow-hidden rounded-2xl border border-white/[.06] bg-white/[.02] p-5 md:p-7 text-center"><div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-violet-500/10 blur-3xl"/><div className="relative text-3xl md:text-4xl font-bold tracking-[-.04em] text-gradient">{v}</div><div className="relative mt-2 text-[10px] uppercase tracking-[.14em] text-slate-600">{l}</div></div></Reveal>)}
      </div>
    </section>

    <section id="features" className="relative z-10 py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <Reveal className="max-w-3xl"><div className="text-xs uppercase tracking-[.2em] text-violet-400 font-semibold">Product surface</div><h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-[-.04em]">Built around the moment<br/><span className="text-slate-500">customers try to leave.</span></h2></Reveal>
        <div className="mt-14 grid md:grid-cols-2 gap-5">
          {[["Signal capture","Every cancellation reason and follow-up answer becomes structured data you can actually act on."],["AI follow-up","One contextual question digs deeper without turning cancellation into a long survey."],["Reason-matched offer","The flow presents one relevant offer instead of throwing discounts at everyone."],["Retention analytics","Track cancellations, decisions, estimated recovered revenue, and save-rate signals in your dashboard."],["Done-for-you setup","You don't need to learn an SDK or build a new cancellation system. I handle installation and testing."],["30-day management","For the founding offer, I monitor the flow, review patterns, and help tune the experience for 30 days."]].map(([t,d],i)=><Reveal key={t} delay={(i%2)*80}><div className="group rounded-3xl border border-white/[.06] bg-white/[.02] p-7 hover:border-violet-500/25 hover:bg-white/[.035] transition-all"><div className="flex items-start justify-between gap-5"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 border border-violet-500/20 flex items-center justify-center text-violet-300 group-hover:scale-105 transition-transform"><Check/></div><span className="text-xs font-mono text-slate-700">0{i+1}</span></div><h3 className="mt-6 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-lg">{d}</p></div></Reveal>)}
        </div>
      </div>
    </section>

    <section className="relative z-10 border-t border-white/[.05] py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5 md:px-6">
        <Reveal className="max-w-3xl mx-auto text-center"><div className="text-xs uppercase tracking-[.2em] text-violet-400 font-semibold">Live product</div><h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-[-.04em]">Don't take our word for it.<br/><span className="text-slate-500">Run the cancellation flow.</span></h2><p className="mt-5 text-slate-400">The demo uses the actual RetainPulse widget code. No signup required.</p></Reveal>
        <div className="mt-12 max-w-5xl mx-auto rounded-[28px] border border-white/[.08] overflow-hidden bg-[#08080f] shadow-violet">
          <iframe title="RetainPulse live cancellation demo" src="/demo?embed=1" className="w-full h-[560px] md:h-[600px] border-0" loading="lazy"/>
        </div>
      </div>
    </section>

    <section id="pricing" className="relative z-10 border-t border-white/[.05] py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-5 md:px-6"><Reveal className="text-center max-w-3xl mx-auto"><div className="text-xs uppercase tracking-[.2em] text-violet-400 font-semibold">Simple pricing</div><h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-[-.04em]">Start small. See the value.<br/><span className="text-slate-500">Then decide.</span></h2><p className="mt-5 text-slate-400">No recurring software bill in the founding offer. The second payment only comes after the first 7 days.</p></Reveal><Reveal delay={100} className="mt-12"><PricingCard/></Reveal></div>
    </section>

    <section className="relative z-10 border-t border-white/[.05] py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-5 md:px-6"><Reveal><div className="rounded-[32px] border border-violet-500/20 bg-gradient-to-br from-violet-500/[.10] via-fuchsia-500/[.04] to-transparent p-8 md:p-14 text-center overflow-hidden relative"><div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500/15 blur-3xl rounded-full"/><div className="relative"><div className="inline-flex items-center gap-2 text-xs text-violet-300 border border-violet-500/20 bg-violet-500/10 rounded-full px-3 py-1.5"><Spark/> Founding case study</div><h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-[-.04em]">Be our first case study.</h2><p className="mt-5 max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed">We're looking for 5 early SaaS customers who want a hands-on retention flow at founding-member pricing. In exchange, we learn from your data and build the perfect flow with you.</p><div className="mt-9 grid grid-cols-5 gap-2 max-w-md mx-auto">{[1,2,3,4,5].map((x)=><div key={x} className="aspect-square rounded-2xl border border-white/[.08] bg-white/[.025] flex items-center justify-center"><span className="text-slate-700 font-mono text-xs">0{x}</span></div>)}</div><Link href="/book" className="mt-9 inline-flex items-center gap-2 rounded-2xl px-6 py-4 bg-white text-black font-semibold hover:bg-slate-100 transition">Claim a founding spot <Arrow/></Link><div className="mt-4 text-xs text-slate-600">No fake testimonials. Just an honest first cohort.</div></div></div></Reveal></div>
    </section>

    <section id="faq" className="relative z-10 border-t border-white/[.05] py-24 md:py-32"><div className="max-w-3xl mx-auto px-5 md:px-6"><Reveal className="text-center mb-12"><div className="text-xs uppercase tracking-[.2em] text-violet-400 font-semibold">FAQ</div><h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-[-.04em]">Questions, answered.</h2></Reveal><Reveal><FAQ/></Reveal></div></section>

    <section className="relative z-10 py-24 md:py-32"><div className="max-w-5xl mx-auto px-5 md:px-6"><Reveal><div className="relative overflow-hidden rounded-[32px] border border-violet-500/25 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-transparent p-9 md:p-16 text-center"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,70,239,.2),transparent_45%)]"/><div className="relative"><div className="text-sm text-violet-200 font-mono">3 / 5 founding spots remaining</div><h2 className="mt-5 text-4xl md:text-6xl font-bold tracking-[-.05em]">Give every cancellation<br/><span className="text-gradient-violet">one more chance.</span></h2><p className="mt-6 text-slate-300/70 max-w-xl mx-auto">Install in 48 hours. Learn why customers leave. Intervene before the cancellation completes.</p><div className="mt-9 flex flex-col sm:flex-row justify-center gap-3"><Link href="/book" className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 bg-white text-black font-semibold hover:bg-slate-100 transition">Book installation <Arrow/></Link><Link href="/demo" className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 border border-white/15 bg-white/[.05] font-semibold hover:bg-white/[.08] transition">Try the demo</Link></div></div></div></Reveal></div></section>

    <footer className="relative z-10 border-t border-white/[.06] py-10"><div className="max-w-6xl mx-auto px-5 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6"><Link href="/"><Logo/></Link><div className="flex flex-wrap justify-center gap-5 text-xs text-slate-600"><Link href="/pricing" className="hover:text-slate-300">Pricing</Link><Link href="/terms" className="hover:text-slate-300">Terms</Link><Link href="/privacy" className="hover:text-slate-300">Privacy</Link><Link href="/refund" className="hover:text-slate-300">Refund</Link><a href="mailto:hello@retainpulse.pro" className="hover:text-slate-300">Contact</a><a href="https://x.com/Retainpulse" target="_blank" rel="noreferrer" className="hover:text-slate-300">X</a></div><div className="text-xs text-slate-700">© 2026 RetainPulse</div></div></footer>
  </main>;
}
