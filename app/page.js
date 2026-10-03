import Link from 'next/link';

// ===========================================
//  Brand Logo
// ===========================================
const Logo = ({ size = "md" }) => {
  const dims = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const icon = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const text = size === "sm" ? "text-base" : "text-lg";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative ${dims} rounded-[10px] bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30`}>
        <div className="absolute inset-0 rounded-[10px] bg-gradient-to-tr from-transparent via-white/25 to-transparent"></div>
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

// ===========================================
//  Icons
// ===========================================
const IconArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
const IconCheck = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const IconClose = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconBrain = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);
const IconChart = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IconBolt = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const IconRocket = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const IconSpark = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

// ===========================================
//  Main Page
// ===========================================
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#05050c] text-white font-sans antialiased overflow-x-hidden">

      {/* Background layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 40%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 40%, transparent 75%)",
          }}
        />
        <div className="absolute top-[-25%] left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] bg-violet-600/[0.14] rounded-full blur-[160px]"></div>
        <div className="absolute top-[35%] right-[-15%] w-[700px] h-[700px] bg-fuchsia-600/[0.09] rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[700px] h-[700px] bg-emerald-600/[0.05] rounded-full blur-[130px]"></div>
      </div>

      <div className="relative z-10">

        {/* ═══════════ Navbar ═══════════ */}
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#05050c]/70 border-b border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Logo />

            <div className="hidden md:flex items-center gap-1 text-sm text-slate-400">
              {[
                ["How it works", "#how-it-works"],
                ["Features", "#features"],
                ["Pricing", "#pricing"],
                ["FAQ", "#faq"],
              ].map(([label, href]) => (
                <a key={href} href={href} className="px-3 py-2 rounded-lg hover:text-white hover:bg-white/[0.04] transition-all">
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link href="/demo">
                <button className="hidden sm:block px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                  Live demo
                </button>
              </Link>
              <Link href="/book">
                <button className="group relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative flex items-center gap-1.5">
                    Book installation
                    <IconArrowRight />
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ═══════════ Hero ═══════════ */}
        <section className="max-w-6xl mx-auto px-6 pt-20 md:pt-28 pb-20 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-8">
            <IconSpark />
            <span>Founding Members · 5 spots only</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.03em] leading-[0.98] mb-7">
            <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
              Stop losing customers
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              silently.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            I personally install RetainPulse on your site within 48 hours — then manage it for 30 days.
            You see exactly why customers cancel, and get a real shot at keeping some of them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/book">
              <button className="group relative px-7 py-4 rounded-2xl text-base font-semibold text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-violet-500/30">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-violet-600 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Book my installation — $249
                  <IconArrowRight />
                </span>
              </button>
            </Link>
            <Link href="/demo">
              <button className="px-7 py-4 rounded-2xl text-base font-medium text-slate-200 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.16] transition-all backdrop-blur-sm">
                See the live demo
              </button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>48-hour setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>No dev work needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>You own everything</span>
            </div>
          </div>
        </section>

        {/* ═══════════ Trust Bar ═══════════ */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <p className="text-center text-xs uppercase tracking-[0.25em] text-slate-500 mb-6">
            Built for indie SaaS founders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
            {["MicroSaaS", "SoloStack", "IndieHQ", "LaunchPad", "ShipFast"].map((name) => (
              <span key={name} className="text-lg font-bold text-slate-400 tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* ═══════════ Problem ═══════════ */}
        <section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.25em] mb-4">The Problem</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.05] mb-6">
              You're losing revenue
              <br />
              <span className="text-slate-500">and you don't know why.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Every month, customers cancel. Some leave a feedback form. Most just disappear. You're left
              guessing — while your MRR quietly shrinks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <IconClose />, color: "rose", title: "Silent churn", desc: "Customers often leave without telling you why. RetainPulse turns cancellations into actionable signals." },
              { icon: <IconChart />, color: "amber", title: "Generic surveys", desc: "Multi-choice forms give you data, not insight. You need to know the real reason behind the reason." },
              { icon: <IconBrain />, color: "violet", title: "No retention play", desc: "Without a way to intervene at the moment of cancellation, you never get a chance to save them." },
            ].map((item, i) => (
              <div key={i} className="relative p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center text-${item.color}-400 mb-5`}>
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ How It Works ═══════════ */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.25em] mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.05] mb-6">
              I install it. You watch it work.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              No SDK. No dev sprint. No backend changes. I do the entire setup for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { num: "01", icon: <IconBolt />, color: "violet", title: "I install it (48 hours)", desc: "You give me access. I install the widget, connect it to your cancellation flow, and test it end-to-end." },
              { num: "02", icon: <IconBrain />, color: "fuchsia", title: "AI asks the right question", desc: "When someone clicks cancel, RetainPulse asks a smart, contextual follow-up — not a generic survey." },
              { num: "03", icon: <IconRocket />, color: "emerald", title: "I manage it for 30 days", desc: "I monitor results, tweak the retention offers, and send you weekly insights — for 30 days." },
            ].map((step) => (
              <div key={step.num} className="relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] overflow-hidden">
                <div className="absolute top-5 right-6 text-7xl font-black text-white/[0.03] leading-none select-none">
                  {step.num}
                </div>
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-${step.color}-500/15 border border-${step.color}-500/25 flex items-center justify-center text-${step.color}-300 mb-6`}>
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2.5">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Code block */}
          <div className="mt-12 max-w-3xl mx-auto">
            <p className="text-center text-xs text-slate-500 mb-3">
              Or if you prefer to install it yourself — one script tag:
            </p>
            <div className="rounded-2xl bg-black/50 border border-white/[0.06] overflow-hidden shadow-2xl shadow-black/50">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70"></div>
                <span className="ml-3 text-xs text-slate-500 font-mono">install.html</span>
              </div>
              <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
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
        </section>

        {/* ═══════════ Stats ═══════════ */}
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/[0.04]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "Real-time", label: "cancellation insights" },
              { value: "48h", label: "installation time" },
              { value: "30 days", label: "hands-on management" },
              { value: "$0", label: "monthly fees" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-1.5">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ Features ═══════════ */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.25em] mb-4">What's included</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.05] mb-6">
              Everything you need.
              <br />
              <span className="text-slate-500">Nothing you don't.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Personal installation', desc: 'I install it myself within 48 hours. No dev work needed from you.' },
              { title: 'AI follow-up questions', desc: 'Goes deeper than the first reason. Understands the real why behind every cancellation.' },
              { title: 'One retention offer', desc: 'Reason-matched, respectful, and easy for customers to decline.' },
              { title: 'Recovered MRR estimates', desc: 'See estimated MRR retained when customer MRR is provided.' },
              { title: 'Save rate analytics', desc: 'Track the percentage of cancel attempts you actually save — per reason.' },
              { title: '30-day management', desc: 'I monitor, tweak, and send weekly insights. Direct access to me — no chatbot.' },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.03] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/15 to-fuchsia-500/10 border border-violet-500/20 flex items-center justify-center text-violet-300 mb-4 group-hover:scale-110 transition-transform">
                  <IconCheck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold mb-1.5">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ Pricing ═══════════ */}
        <section id="pricing" className="max-w-5xl mx-auto px-6 py-24 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.25em] mb-4">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.05] mb-6">
              Founding Member offer
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              One-time. No monthly fees. Only 5 spots at this price.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-violet-500/[0.10] to-fuchsia-500/[0.04] border-2 border-violet-500/40 shadow-2xl shadow-violet-500/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-[10px] font-bold tracking-widest uppercase shadow-lg">
                Founding Member · 50% off
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">RetainPulse Setup Service</h3>
                <p className="text-sm text-slate-400">Done-for-you. No SDK. 48 hours.</p>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-slate-500 line-through text-2xl">$499</span>
                  <span className="text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">$249</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">One-time · No recurring fees</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 text-center">
                  <p className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-1">Step 1</p>
                  <p className="text-lg font-bold text-white">$100</p>
                  <p className="text-xs text-slate-500 mt-1">Installation</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 text-center">
                  <p className="text-xs font-bold text-fuchsia-300 uppercase tracking-wider mb-1">Step 2</p>
                  <p className="text-lg font-bold text-white">$149</p>
                  <p className="text-xs text-slate-500 mt-1">30-day management</p>
                </div>
              </div>

              <Link href="/book">
                <button className="group w-full py-4 rounded-2xl font-semibold text-sm bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                  <span>Book my installation</span>
                  <IconArrowRight />
                </button>
              </Link>

              <p className="text-center text-sm mt-6">
                <Link href="/pricing" className="text-violet-400 hover:text-violet-300 transition-colors">
                  See full details and FAQ →
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════ FAQ ═══════════ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 py-24 border-t border-white/[0.04]">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.25em] mb-4">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em]">Common questions</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: 'Why so much cheaper than Churnkey or ProsperStack?', a: "Because I'm building this in public and you're one of my first 5 customers. In exchange for the discount, I'll use your results as a case study (anonymized if you prefer). Churnkey and ProsperStack charge $200-300+ per month. I charge $249 one-time." },
              { q: 'What if it doesn\'t work?', a: "You pay $100 upfront for the installation. If after 7 days you don't see the value, you don't pay the $149 management fee. Simple." },
              { q: 'Do I need a developer to install this?', a: "No. I do the entire installation myself within 48 hours. You just give me access (or send me the code snippet to paste)." },
              { q: 'How do I pay?', a: 'Payoneer payment link. Card or bank transfer. You get an invoice for both steps.' },
              { q: 'Can I cancel anytime?', a: "Yes. The service is one-time. After 30 days, you keep the widget and the dashboard forever — no recurring fees." },
            ].map((item, i) => (
              <details key={i} className="group rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <summary className="cursor-pointer list-none p-5 flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-white">{item.q}</span>
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 group-open:rotate-45 transition-transform duration-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* ═══════════ Final CTA ═══════════ */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <div className="relative p-10 md:p-16 rounded-3xl bg-gradient-to-br from-violet-500/[0.10] via-fuchsia-500/[0.05] to-transparent border border-violet-500/20 overflow-hidden text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-500/[0.18] rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>

            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.02em] leading-[1.05] mb-6">
                Only 5 spots available.
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                Once these are gone, the price returns to $499. Book your installation today.
              </p>

              <Link href="/book">
                <button className="group relative px-9 py-4 rounded-2xl text-base font-semibold text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-violet-500/40">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500"></div>
                  <span className="relative flex items-center gap-2">
                    Book my installation
                    <IconArrowRight />
                  </span>
                </button>
              </Link>

              <p className="text-xs text-slate-500 mt-6">
                $100 upfront · $149 after 7 days · No recurring fees
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════ Footer ═══════════ */}
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