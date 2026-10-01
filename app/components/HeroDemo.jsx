"use client";

import { useEffect, useState } from 'react';

const STEPS = [
  { id: 1, label: 'Customer clicks cancel', color: 'rose', duration: 2200 },
  { id: 2, label: 'AI asks one question', color: 'violet', duration: 2600 },
  { id: 3, label: 'Retention offer shown', color: 'fuchsia', duration: 2600 },
  { id: 4, label: 'Customer saved', color: 'emerald', duration: 3000 },
];

const COLOR_MAP = {
  rose:    { dot: 'bg-rose-400',    ring: 'ring-rose-500/30',    glow: 'shadow-rose-500/40',    text: 'text-rose-300' },
  violet:  { dot: 'bg-violet-400',  ring: 'ring-violet-500/30',  glow: 'shadow-violet-500/40',  text: 'text-violet-300' },
  fuchsia: { dot: 'bg-fuchsia-400', ring: 'ring-fuchsia-500/30', glow: 'shadow-fuchsia-500/40', text: 'text-fuchsia-300' },
  emerald: { dot: 'bg-emerald-400', ring: 'ring-emerald-500/30', glow: 'shadow-emerald-500/40', text: 'text-emerald-300' },
};

export default function HeroDemo() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const current = STEPS[active];
    const t = setTimeout(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, current.duration);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow behind card */}
      <div className="absolute -inset-8 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/15 to-violet-600/20 rounded-[40px] blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative rounded-3xl border border-white/10 bg-[#0a0a14]/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
            live · cancellation event
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step, i) => {
            const colors = COLOR_MAP[step.color];
            const isActive = i === active;
            const isDone = i < active;

            return (
              <div
                key={step.id}
                className="flex items-center gap-4 transition-all duration-500"
                style={{
                  opacity: isActive ? 1 : isDone ? 0.5 : 0.3,
                  transform: isActive ? 'translateX(0)' : 'translateX(-4px)',
                }}
              >
                {/* Dot */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-3 h-3 rounded-full ${colors.dot} transition-all duration-500 ${
                      isActive ? `ring-4 ${colors.ring} shadow-lg ${colors.glow}` : ''
                    }`}
                  />
                  {isActive && (
                    <div className={`absolute inset-0 rounded-full ${colors.dot} animate-ping opacity-40`} />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-sm md:text-base font-medium transition-colors duration-500 ${
                    isActive ? 'text-white' : isDone ? colors.text : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    processing
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom result bar */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-slate-500">Result</span>
          <span
            className={`text-sm font-semibold transition-all duration-500 ${
              active === STEPS.length - 1 ? 'text-emerald-400' : 'text-slate-600'
            }`}
          >
            {active === STEPS.length - 1 ? '✓ Customer retained' : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}