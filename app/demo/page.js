"use client";

import { useState } from 'react';
import Link from 'next/link';

// ===========================================
//  Brand Logo
// ===========================================
const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative w-9 h-9 rounded-[10px] bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
      <div className="absolute inset-0 rounded-[10px] bg-gradient-to-tr from-transparent via-white/25 to-transparent"></div>
      <svg className="w-5 h-5 text-white relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h3l2-7 4 14 2-7h7" />
      </svg>
    </div>
    <span className="text-lg font-bold tracking-tight">
      Retain<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Pulse</span>
    </span>
  </div>
);

// ===========================================
//  Icons
// ===========================================
const IconArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ===========================================
//  Main Component
// ===========================================
export default function DemoPage() {
  const [showWidget, setShowWidget] = useState(false);

  const loadWidget = () => {
    window.RetainPulseConfig = {
      publicKey: '3a11005ef9ac7874bd34c67a',
      customerEmail: 'demo@customer.com',
      cancelUrl: '/demo',
    };

    if (window.RetainPulse) {
      window.RetainPulse.show();
      return;
    }

    const script = document.createElement('script');
    script.src = '/widget.js';
    script.onload = () => {
      if (window.RetainPulse) window.RetainPulse.show();
    };
    document.body.appendChild(script);
  };

  return (
    <div className="relative min-h-screen bg-[#05050c] text-white overflow-hidden">

      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-violet-600/[0.12] rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/[0.08] rounded-full blur-[130px]"></div>
      </div>

      <div className="relative z-10">

        {/* ═══════ Navbar ═══════ */}
        <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/">
            <button className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Back to home
            </button>
          </Link>
        </nav>

        {/* ═══════ Hero ═══════ */}
        <section className="max-w-4xl mx-auto px-6 pt-12 md:pt-20 pb-16 text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE DEMO · No signup required
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
            See exactly what your customers
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              will experience.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Click the button below to trigger the cancellation flow. This is the exact
            experience your customers will see on your site.
          </p>

          <button
            onClick={loadWidget}
            className="group relative px-10 py-5 rounded-2xl text-lg font-bold text-white overflow-hidden transition-transform hover:scale-[1.03] active:scale-95 shadow-2xl shadow-violet-500/40"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-violet-600 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-3">
              🧪 Try the live demo
            </span>
          </button>

          <p className="text-xs text-slate-500 mt-4">
            No account needed · Takes 30 seconds
          </p>
        </section>

        {/* ═══════ Stats Preview ═══════ */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-slate-500 mb-6">
            Sample dashboard metrics
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-emerald-300 to-emerald-500 bg-clip-text text-transparent">$98</p>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-wider">Recovered / month</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-violet-300 to-violet-500 bg-clip-text text-transparent">67%</p>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-wider">Save rate</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">2</p>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-wider">Customers saved</p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600 mt-4">
            ↑ Live preview of what your RetainPulse dashboard will show
          </p>
        </section>

        {/* ═══════ What You Saw ═══════ */}
        <section className="max-w-2xl mx-auto px-6 pb-16">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 md:p-8">
            <h3 className="text-base font-semibold text-white mb-5">
              What you just saw
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 text-violet-400"><IconCheck /></span>
                <span>5 cancellation reasons your customers can pick from</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 text-violet-400"><IconCheck /></span>
                <span>An AI follow-up question that digs deeper</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 text-violet-400"><IconCheck /></span>
                <span>One reason-matched retention offer</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 text-violet-400"><IconCheck /></span>
                <span>A clear Keep / Pause / Cancel decision</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 text-violet-400"><IconCheck /></span>
                <span>Everything logged to your dashboard in real time</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ═══════ CTA Section ═══════ */}
        <section className="max-w-3xl mx-auto px-6 pb-24">
          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-violet-500/[0.10] via-fuchsia-500/[0.04] to-transparent border border-violet-500/20 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-violet-500/[0.15] rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

            <div className="relative text-center">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Want this on your site?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                I personally install and configure this for you within 48 hours —
                and manage it for 30 days.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/book"
                  className="group relative px-7 py-4 rounded-2xl text-base font-semibold text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-violet-500/30 inline-flex items-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-violet-600 transition-opacity duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    Book my installation
                    <IconArrowRight />
                  </span>
                </Link>
              </div>

              <p className="text-xs text-slate-500 mt-6">
                $100 upfront · $149 after 7 days · Total $249
              </p>
            </div>
          </div>
        </section>

        {/* ═══════ Footer ═══════ */}
        <footer className="border-t border-white/[0.06] py-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo />
            <p className="text-xs text-slate-600">
              © 2026 RetainPulse. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}