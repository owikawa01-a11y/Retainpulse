'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';

const BENCHMARKS = [
  { label: 'Enterprise',    min: 0.5, max: 1.5, color: '#22c55e' },
  { label: 'Mid-market',    min: 1.0, max: 3.0, color: '#eab308' },
  { label: 'SMB / Startup', min: 3.0, max: 7.0, color: '#f97316' },
  { label: 'High churn',    min: 7.0, max: 100, color: '#ef4444' },
];

function getBenchmark(rate) {
  return BENCHMARKS.find((b) => rate >= b.min && rate < b.max) || BENCHMARKS[BENCHMARKS.length - 1];
}

function getHealthScore(rate) {
  if (rate < 1) return { grade: 'A', label: 'Excellent', color: '#22c55e' };
  if (rate < 2) return { grade: 'B', label: 'Strong', color: '#84cc16' };
  if (rate < 3.5) return { grade: 'C', label: 'Good', color: '#eab308' };
  if (rate < 5) return { grade: 'D', label: 'At Risk', color: '#f97316' };
  return { grade: 'F', label: 'Critical', color: '#ef4444' };
}

// ─────────────────────────────────────────────
//  Count-up hook
// ─────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    const end = target;
    const startTime = performance.now();
    let rafId;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (end - start) * eased);
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else prevTarget.current = end;
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}

// ─────────────────────────────────────────────
//  Animated stat card
// ─────────────────────────────────────────────
function StatCard({ label, value, prefix = '', suffix = '', color = 'text-white', delay = 0 }) {
  const animated = useCountUp(value, 900);
  return (
    <div
      className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-500/40 hover:bg-white/[0.05] transition-all duration-300 group"
      style={{ animation: `fadeSlideUp 0.6s ease-out ${delay}ms both` }}
    >
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 group-hover:text-slate-400 transition-colors">
        {label}
      </p>
      <p className={`text-3xl md:text-4xl font-bold ${color} tabular-nums`}>
        {prefix}{animated.toFixed(value < 10 ? 1 : 0)}{suffix}
      </p>
    </div>
  );
}

export default function Calculator() {
  const [mrr, setMrr] = useState('');
  const [customers, setCustomers] = useState('');
  const [churn, setChurn] = useState('');
  const [asksWhy, setAsksWhy] = useState(null);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const m = parseFloat(mrr);
    const c = parseInt(customers, 10);
    const r = parseFloat(churn);
    if (!m || !c || !r || m <= 0 || c <= 0 || r <= 0 || r >= 100) return null;

    const monthlyChurnRate = r / 100;
    const churnedPerMonth = c * monthlyChurnRate;
    const revenueLostPerMonth = m * monthlyChurnRate;
    const annualChurnRate = 1 - Math.pow(1 - monthlyChurnRate, 12);
    const customers12m = c * Math.pow(1 - monthlyChurnRate, 12);
    const customers12mIfImproved = c * Math.pow(1 - monthlyChurnRate * 0.8, 12);
    const improvedChurn = monthlyChurnRate * 0.8;
    const revenueSavedPerMonth = m * (monthlyChurnRate - improvedChurn);

    return {
      churnRate: r,
      churnedPerMonth,
      revenueLostPerMonth,
      annualChurnRate: annualChurnRate * 100,
      customers12m,
      customers12mIfImproved,
      revenueSavedPerMonth,
      annualRevenueSaved: revenueSavedPerMonth * 12,
      annualRevenueLost: revenueLostPerMonth * 12,
      benchmark: getBenchmark(r),
      health: getHealthScore(r),
    };
  }, [mrr, customers, churn]);

  const diagnosis = useMemo(() => {
    if (!result || asksWhy === null) return null;
    if (asksWhy === false) {
      return {
        title: "You're flying blind",
        text: "You don't know why customers leave. Every retention strategy you try will be a guess until you fix this.",
        severity: 'critical',
      };
    }
    if (asksWhy === true && result.churnRate >= 3) {
      return {
        title: "Your survey isn't reaching them",
        text: "You ask, but churn is still high. Most customers never fill out a survey — they just leave. The question needs to be in their path, not in an email they ignore.",
        severity: 'warning',
      };
    }
    if (asksWhy === true && result.churnRate < 3) {
      return {
        title: "You're doing the right things",
        text: "You ask, and your churn reflects it. The next step is to make every answer searchable, so you can spot patterns instead of reading feedback one by one.",
        severity: 'good',
      };
    }
    return null;
  }, [asksWhy, result]);

  const fix = useMemo(() => {
    if (!diagnosis) return null;
    if (asksWhy === false) {
      return {
        text: 'Add one question to your cancel flow: "What would have made you stay?" No email, no survey. Just a single question at the exact moment they click cancel.',
        cta: 'RetainPulse does this automatically →',
      };
    }
    if (asksWhy === true && result.churnRate >= 3) {
      return {
        text: "Your question needs to be at the cancel moment, not in a follow-up email. Most customers don't open post-cancellation surveys.",
        cta: 'See how RetainPulse asks at the right moment →',
      };
    }
    if (asksWhy === true && result.churnRate < 3) {
      return {
        text: 'Start categorizing every answer by reason. After 20-30 responses, patterns will show up — and you can fix the top one.',
        cta: 'RetainPulse categorizes answers for you →',
      };
    }
    return null;
  }, [diagnosis, asksWhy, result]);

  const handleShare = async () => {
    if (!result) return;
    const text = `My SaaS churn: ${result.churnRate}% monthly (${result.annualChurnRate.toFixed(1)}% annually).

That's $${result.revenueLostPerMonth.toFixed(0)}/month walking out the door.

Benchmark: ${result.benchmark.label}
Health: ${result.health.grade} (${result.health.label})

Calculated with RetainPulse → retainpulse.pro/tools/churn-calculator`;

    try {
      if (navigator.share) await navigator.share({ text });
      else throw new Error('no share');
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (e) {
        console.error('Copy failed', e);
      }
    }
  };

  const readyForDiagnosis = result && asksWhy !== null;
  const progressPct = result ? Math.max(0, Math.min(100, ((result.churnRate - 0.5) / 9.5) * 100)) : 0;

  return (
    <main className="min-h-screen bg-[#05050C] text-white overflow-hidden">
      {/* Keyframes */}
      <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3); }
          50% { box-shadow: 0 0 40px rgba(139,92,246,0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes barGrow {
          from { width: 0; }
        }
      `}</style>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12" style={{ animation: 'fadeSlideUp 0.6s ease-out both' }}>
          <Link href="/" className="text-sm text-violet-400 hover:text-violet-300 mb-6 inline-block transition-colors">
            ← Back to RetainPulse
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight bg-gradient-to-br from-white via-white to-violet-300 bg-clip-text text-transparent">
            SaaS Churn Calculator
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            See your real churn rate, your 12-month projection, and the one thing you should fix first.
            <span className="text-slate-500"> No signup. Just answers.</span>
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-5 mb-10">
          <div style={{ animation: 'fadeSlideUp 0.6s ease-out 0.1s both' }}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Current MRR ($)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={mrr}
              onChange={(e) => setMrr(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-lg focus:outline-none focus:border-violet-500 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] transition-all duration-200"
            />
          </div>

          <div style={{ animation: 'fadeSlideUp 0.6s ease-out 0.15s both' }}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Active customers
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={customers}
              onChange={(e) => setCustomers(e.target.value)}
              placeholder="e.g. 120"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-lg focus:outline-none focus:border-violet-500 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] transition-all duration-200"
            />
          </div>

          <div style={{ animation: 'fadeSlideUp 0.6s ease-out 0.2s both' }}>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Monthly churn rate (%)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={churn}
              onChange={(e) => setChurn(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-lg focus:outline-none focus:border-violet-500 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] transition-all duration-200"
            />
            <p className="text-xs text-slate-500 mt-2">
              Don't know it? Most SMB SaaS founders see 3–7% monthly.
            </p>
          </div>

          <div style={{ animation: 'fadeSlideUp 0.6s ease-out 0.25s both' }}>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Do you ask customers why they're leaving?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAsksWhy(true)}
                className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  asksWhy === true
                    ? 'border-violet-500 bg-violet-500/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setAsksWhy(false)}
                className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  asksWhy === false
                    ? 'border-violet-500 bg-violet-500/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 mb-12">
            {/* Health Score */}
            <div
              className="p-6 rounded-2xl border flex items-center justify-between gap-4 relative overflow-hidden"
              style={{
                animation: 'scaleIn 0.5s ease-out both',
                borderColor: result.health.color + '40',
                background: `linear-gradient(135deg, ${result.health.color}15 0%, ${result.health.color}05 100%)`,
              }}
            >
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Churn Health Score</p>
                <p className="text-4xl font-bold tabular-nums">
                  {result.churnRate}% <span className="text-lg text-slate-500 font-medium">monthly</span>
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  ~{result.annualChurnRate.toFixed(1)}% annually · {result.benchmark.label}
                </p>
              </div>
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-6xl font-black shrink-0 relative z-10"
                style={{
                  background: result.health.color,
                  color: '#000',
                  animation: 'glowPulse 2.5s ease-in-out infinite',
                }}
              >
                {result.health.grade}
              </div>
            </div>

            {/* Benchmark progress bar */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Enterprise</span>
                <span>Mid-market</span>
                <span>SMB</span>
                <span>High</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${progressPct}%`,
                    background: `linear-gradient(90deg, #22c55e, #eab308, #f97316, #ef4444)`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Your churn sits at <span className="text-white font-medium">{result.churnRate}%</span> — {result.benchmark.label.toLowerCase()} range
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <StatCard label="Customers lost / month" value={result.churnedPerMonth} delay={100} />
              <StatCard label="Revenue lost / month" value={result.revenueLostPerMonth} prefix="$" color="text-red-400" delay={200} />
              <StatCard label="Customers after 12 months" value={result.customers12m} delay={300} />
              <StatCard label="If churn dropped 20%" value={result.customers12mIfImproved} color="text-green-400" delay={400} />
            </div>

            {/* The Cost */}
            <div
              className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 relative overflow-hidden"
              style={{ animation: 'fadeSlideUp 0.6s ease-out 0.5s both' }}
            >
              <p className="text-xs uppercase tracking-widest text-violet-300 font-medium mb-2">The real cost of churn</p>
              <p className="text-lg text-white leading-relaxed relative z-10">
                You're losing{' '}
                <strong className="text-red-400 tabular-nums">${result.annualRevenueLost.toFixed(0)}/year</strong> to churn.
                Reducing it by just 20% would save you{' '}
                <strong className="text-green-400 tabular-nums">${result.annualRevenueSaved.toFixed(0)}/year</strong>.
              </p>
            </div>

            {/* Diagnosis */}
            {readyForDiagnosis && diagnosis && (
              <div
                className="p-6 rounded-2xl border relative overflow-hidden"
                style={{
                  animation: 'fadeSlideUp 0.6s ease-out 0.6s both',
                  borderColor:
                    diagnosis.severity === 'critical' ? '#ef444440' :
                    diagnosis.severity === 'warning' ? '#f9731640' : '#22c55e40',
                  background:
                    diagnosis.severity === 'critical' ? '#ef44440a' :
                    diagnosis.severity === 'warning' ? '#f973160a' : '#22c55e0a',
                }}
              >
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">The real problem</p>
                <h3 className="text-xl font-bold text-white mb-2">{diagnosis.title}</h3>
                <p className="text-slate-300 leading-relaxed">{diagnosis.text}</p>
              </div>
            )}

            {/* Fix */}
            {readyForDiagnosis && fix && (
              <div
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/10"
                style={{ animation: 'fadeSlideUp 0.6s ease-out 0.7s both' }}
              >
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Your one next step</p>
                <p className="text-slate-200 leading-relaxed mb-4">{fix.text}</p>
                <Link
                  href="/"
                  className="inline-block px-5 py-2.5 rounded-xl font-semibold text-white text-sm hover:scale-[1.02] transition-transform"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' }}
                >
                  {fix.cta}
                </Link>
              </div>
            )}

            {/* Share */}
            <div className="flex justify-center pt-2" style={{ animation: 'fadeIn 0.8s ease-out 0.9s both' }}>
              <button
                onClick={handleShare}
                className="px-6 py-3 rounded-xl border border-white/20 hover:border-violet-500 hover:bg-violet-500/10 text-sm font-medium text-white transition-all duration-200 active:scale-95"
              >
                {copied ? '✓ Copied to clipboard' : 'Share your result'}
              </button>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 pt-12 border-t border-white/10" style={{ animation: 'fadeIn 0.8s ease-out 0.3s both' }}>
          <h2 className="text-2xl font-bold mb-4">
            But do you know <em className="text-violet-400">why</em> they're leaving?
          </h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Most founders guess. The answers are usually not "too expensive" — they're quieter than that.
            RetainPulse asks one question right before a customer cancels, and shows you the real reasons.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-white hover:scale-[1.02] transition-transform"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' }}
          >
            See how RetainPulse works →
          </Link>
        </div>

        {/* Benchmarks */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Churn rate benchmarks</h3>
          <ul className="text-sm text-slate-500 space-y-1">
            <li><span className="text-green-400">●</span> Enterprise SaaS: 0.5–1.5% monthly</li>
            <li><span className="text-yellow-400">●</span> Mid-market SaaS: 1–3% monthly</li>
            <li><span className="text-orange-400">●</span> SMB / Startup: 3–7% monthly</li>
            <li><span className="text-red-400">●</span> High churn: 7%+ monthly</li>
          </ul>
        </div>
      </div>
    </main>
  );
}