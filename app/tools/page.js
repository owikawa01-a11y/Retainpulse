// app/tools/page.js
import Link from 'next/link';

export const metadata = {
  title: 'Free Tools for SaaS Founders | RetainPulse',
  description: 'Free tools to help you understand your churn, retention, and growth.',
};

const TOOLS = [
  {
    slug: 'churn-calculator',
    title: 'Churn Calculator',
    description: 'See your real churn rate, 12-month projection, and revenue impact.',
    icon: '📊',
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-[#05050C] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Free Tools</h1>
        <p className="text-lg text-slate-400 mb-12">
          Simple tools to help you understand your SaaS numbers. No signup.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-colors group"
            >
              <div className="text-3xl mb-3">{tool.icon}</div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-violet-400 transition-colors">
                {tool.title}
              </h2>
              <p className="text-sm text-slate-400">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}