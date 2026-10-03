"use client";

import { useState } from 'react';
import Link from 'next/link';

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const IconBack = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const IconSpark = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export default function PricingPage() {
  const [showOfferDetails, setShowOfferDetails] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#05050c] text-white font-sans antialiased overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-violet-600/[0.13] rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] bg-fuchsia-600/[0.07] rounded-full blur-[130px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:px-10 md:py-16">

        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <IconBack />
          <span>Back to home</span>
        </Link>

        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-6">
            <IconSpark />
            <span>Founding Members · 5 spots only</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent mb-4">
            I install it for you.
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Not a self-serve tool. I personally install and configure RetainPulse on your site within 48 hours,
            then manage it for 30 days.
          </p>
        </header>

        {/* Main Pricing Card */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative rounded-3xl p-8 md:p-10 bg-gradient-to-br from-violet-500/[0.10] to-fuchsia-500/[0.04] border-2 border-violet-500/40 shadow-2xl shadow-violet-500/20">

            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold tracking-wider uppercase shadow-lg">
              Founding Member · 50% off
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">RetainPulse Setup Service</h2>
              <p className="text-sm text-slate-400">Done-for-you. No SDK. No dev sprint. 48 hours.</p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-slate-500 line-through text-2xl">$499</span>
                <span className="text-6xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">$249</span>
              </div>
              <p className="text-xs text-slate-500">Founding Member price · One-time</p>
            </div>

            {/* What you get */}
            <div className="mb-8 space-y-4">
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">Step 1</span>
                  <span className="text-sm font-bold text-white">$100</span>
                </div>
                <p className="text-sm text-slate-300 mb-1 font-medium">Installation (upfront)</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  I install and configure the widget on your site within 48 hours.
                  Live dashboard, AI follow-up questions, one retention offer per reason.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider">Step 2</span>
                  <span className="text-sm font-bold text-white">$149</span>
                </div>
                <p className="text-sm text-slate-300 mb-1 font-medium">30-Day Management (after 7 days)</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  I monitor results for 30 days. Weekly insights. Custom retention offers per reason.
                  If it doesn't work, you don't pay the second part.
                </p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {[
                'Personally installed by me within 48 hours',
                'AI follow-up questions on every cancellation',
                'One smart retention offer per reason',
                'Full dashboard with every cancellation reason',
                'Recovered Revenue tracking',
                '30 days of hands-on management',
                'Direct email access to me — no chatbot',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex-shrink-0 text-violet-400">
                    <IconCheck />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/book"
              className="group w-full py-4 rounded-2xl font-semibold text-sm bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Book my installation</span>
              <span className="transition-transform group-hover:translate-x-1">
                <IconArrowRight />
              </span>
            </Link>

            <p className="text-xs text-slate-500 text-center mt-4">
              Only 5 spots at this price. After that, full price returns.
            </p>

            <button
              onClick={() => setShowOfferDetails(!showOfferDetails)}
              className="w-full mt-3 text-xs text-slate-500 hover:text-slate-400 transition-colors"
            >
              {showOfferDetails ? '← Hide details' : 'What exactly is included? →'}
            </button>

            {showOfferDetails && (
              <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-3 text-xs text-slate-400 leading-relaxed">
                <p>
                  <strong className="text-white">48-hour setup.</strong> I log into your site (or your codebase),
                  install the widget, connect it to your cancellation flow, and test it with a real cancellation.
                </p>
                <p>
                  <strong className="text-white">AI follow-up.</strong> When a customer cancels, they pick a reason.
                  The AI asks ONE contextual follow-up question to understand the real "why."
                </p>
                <p>
                  <strong className="text-white">Retention offer.</strong> Based on the answer, one matching offer is shown.
                  Not a discount for everyone — a targeted offer per reason.
                </p>
                <p>
                  <strong className="text-white">Dashboard.</strong> Every cancellation, every reason, every answer.
                  Recovered Revenue tracked. CSV exportable.
                </p>
                <p>
                  <strong className="text-white">30-day management.</strong> For 30 days after install,
                  I monitor results, tweak the retention offers, and send you weekly insights.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Comparison Teaser */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Compared to alternatives</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-400">$300+</p>
                <p className="text-xs text-slate-500 mt-1">Churnkey / month</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-400">$200+</p>
                <p className="text-xs text-slate-500 mt-1">ProsperStack / month</p>
              </div>
              <div>
                <p className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">$249</p>
                <p className="text-xs text-slate-500 mt-1">RetainPulse · one-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-5">
              Common questions
            </h3>
            <div className="space-y-5 text-sm">
              <div>
                <p className="font-medium text-white mb-1">Why so cheap compared to Churnkey?</p>
                <p className="text-slate-400 leading-relaxed">
                  Because I'm building this in public and you're one of my first 5 customers.
                  In exchange for the discount, I'll use your results as a case study (anonymized if you prefer).
                </p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">What if it doesn't work?</p>
                <p className="text-slate-400 leading-relaxed">
                  You pay $100 upfront for the installation. If after 7 days you don't see the value,
                  you don't pay the $149 management fee. Simple.
                </p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Do I need a developer?</p>
                <p className="text-slate-400 leading-relaxed">
                  No. I do the entire installation. You just give me access (or send me the code snippet to paste).
                </p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">How do I pay?</p>
                <p className="text-slate-400 leading-relaxed">
                  Payoneer payment link. Card or bank transfer. You get an invoice for both steps.
                </p>
              </div>
              <div>
                <p className="font-medium text-white mb-1">Can I cancel anytime?</p>
                <p className="text-slate-400 leading-relaxed">
                  Yes. The service is one-time. After 30 days, you keep the widget and the dashboard forever —
                  no recurring fees.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white/[0.05] text-white border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all"
          >
            <span>Book my installation</span>
            <IconArrowRight />
          </Link>
          <p className="text-xs text-slate-500 mt-3">
            Or DM me on X: <span className="text-slate-400">@Retainpulse</span>
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/[0.06] text-center text-xs text-slate-600">
          © 2026 RetainPulse. All rights reserved.
        </footer>
      </div>
    </div>
  );
}