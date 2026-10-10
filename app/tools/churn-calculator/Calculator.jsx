'use client';

import { useState, useMemo } from 'react';
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

export default function Calculator() {
  const [mrr, setMrr] = useState('');
  const [customers, setCustomers] = useState('');
  const [churn, setChurn] = useState('');

  const result = useMemo(() => {
    const m = parseFloat(mrr);
    const c = parseInt(customers, 10);
    const r = parseFloat(churn);

    if (!m || !c || !r || m <= 0 || c <= 0 || r <= 0 || r >= 100) return null;

    const monthlyChurnRate = r / 100;
    const churnedPerMonth = c * monthlyChurnRate;
    const revenueLostPerMonth = m * monthlyChurnRate;
    const annualChurnRate = 1 - Math.pow(1 - monthlyChurnRate, 12);

    // 12-month customer projection
    const customers12m = c * Math.pow(1 - monthlyChurnRate, 12);
    const customers12mIfImproved = c * Math.pow(1 - monthlyChurnRate * 0.8, 12);

    // Revenue impact of reducing churn by 20% (relative)
    const improvedChurn = monthlyChurnRate * 0.8;
    const revenueSavedPerMonth = m * (monthlyChurnRate - improvedChurn);

    const benchmark = getBenchmark(r);

    return {
      churnRate: r,
      churnedPerMonth,
      revenueLostPerMonth,
      annualChurnRate: annualChurnRate * 100,
      customers12m,
      customers12mIfImproved,
      revenueSavedPerMonth,
      annualRevenueSaved: revenueSavedPerMonth * 12,
      benchmark,
    };
  }, [mrr, customers, churn]);

  return (
    <main className="min-h-screen bg-[#05050C] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-violet-400 hover:text-violet-300 mb-6 inline-block">
            ← Back to RetainPulse
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            SaaS Churn Calculator
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            See your real churn rate, 12-month customer projection, and how much revenue you're losing every month.
            No signup. Just numbers.
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-5 mb-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Current MRR ($)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={mrr}
              onChange={(e) => setMrr(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Active customers
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={customers}
              onChange={(e) => setCustomers(e.target.value)}
              placeholder="e.g. 120"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Monthly churn rate (%)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={churn}
              onChange={(e) => setChurn(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-violet-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-2">
              Don't know it? Most SMB SaaS founders see 3–7% monthly.
            </p>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6 mb-12">
            {/* Benchmark */}
            <div
              className="p-6 rounded-2xl border"
              style={{ borderColor: result.benchmark.color + '40', background: result.benchmark.color + '10' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-400">Your benchmark</span>
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: result.benchmark.color, color: '#000' }}>
                  {result.benchmark.label}
                </span>
              </div>
              <p className="text-2xl font-bold">
                {result.churnRate}% monthly churn
              </p>
              <p className="text-sm text-slate-400 mt-1">
                That's roughly <strong>{result.annualChurnRate.toFixed(1)}%</strong> annual churn.
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Customers lost / month</p>
                <p className="text-3xl font-bold text-white">{result.churnedPerMonth.toFixed(1)}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Revenue lost / month</p>
                <p className="text-3xl font-bold text-red-400">${result.revenueLostPerMonth.toFixed(0)}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Customers after 12 months</p>
                <p className="text-3xl font-bold text-white">{result.customers12m.toFixed(0)}</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-sm text-slate-400 mb-1">If churn dropped 20%</p>
                <p className="text-3xl font-bold text-green-400">{result.customers12mIfImproved.toFixed(0)}</p>
              </div>
            </div>

            {/* The insight */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
              <p className="text-sm text-violet-300 font-medium mb-2">The real cost of churn</p>
              <p className="text-lg text-white leading-relaxed">
                Reducing churn by just 20% would save you{' '}
                <strong className="text-green-400">${result.annualRevenueSaved.toFixed(0)}/year</strong>.
                That's real money walking out the door.
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <h2 className="text-2xl font-bold mb-4">
            But do you know <em>why</em> they're leaving?
          </h2>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Most founders guess. The answers are usually not "too expensive" — they're quieter than that.
            RetainPulse asks one question right before a customer cancels, and shows you the real reasons.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)' }}
          >
            See how RetainPulse works →
          </Link>
        </div>

        {/* Benchmark reference */}
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