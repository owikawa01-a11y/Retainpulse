"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ===========================================
//  Toast
// ===========================================
function showToast(message, type = 'info') {
  const existing = document.getElementById('rp-toast');
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

  const colors = {
    info: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  };

  const toast = document.createElement('div');
  toast.id = 'rp-toast';
  toast.style.cssText = [
    'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
    'max-width:420px', 'width:calc(100% - 40px)',
    'background:#ffffff', 'border-radius:14px', 'padding:16px 20px',
    'box-shadow:0 15px 40px rgba(0,0,0,0.25)',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
    'font-size:14px', 'color:#111827', 'line-height:1.5',
    'z-index:2147483647', 'display:flex', 'align-items:flex-start', 'gap:12px',
    'box-sizing:border-box',
  ].join(';');

  const icon = document.createElement('div');
  icon.style.cssText = `flex-shrink:0;width:24px;height:24px;border-radius:50%;background:${colors[type] || colors.info};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;`;
  icon.textContent = type === 'error' ? '!' : type === 'success' ? '✓' : 'i';
  toast.appendChild(icon);

  const text = document.createElement('div');
  text.style.cssText = 'flex:1;padding-top:2px;';
  text.textContent = message;
  toast.appendChild(text);

  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 4000);
}

// ===========================================
//  Icons
// ===========================================
const IconTrend = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const IconSpark = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364 6.364l-2.121-2.121M8.757 8.757L6.636 6.636m12.728 0l-2.121 2.121M8.757 15.243l-2.121 2.121" />
  </svg>
);
const IconKey = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);
const IconCopy = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
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
const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const IconShield = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const IconInbox = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);
const IconDollar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// ===========================================
//  Main Component
// ===========================================
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [publicKey, setPublicKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        router.replace('/login');
        return;
      }

      if (cancelled) return;
      setUser(session.user);

      try {
        const res = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: 'no-store',
        });

        if (res.status === 401) {
          await supabase.auth.signOut();
          router.replace('/login');
          return;
        }

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Could not load dashboard');
        }

        if (!cancelled) {
          setPublicKey(data.widget?.public_key || null);
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error('[Dashboard] Load failed:', error);
        if (!cancelled) showToast('Could not load dashboard data. Please refresh.', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const copyPublicKey = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateCancellation = () => {
    if (!publicKey) {
      showToast('Public key not found. Please contact support.', 'error');
      return;
    }

    window.RetainPulseConfig = {
      publicKey: publicKey,
      customerEmail: 'demo@customer.com',
      cancelUrl: '/dashboard',
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
    script.onerror = () => showToast('Failed to load widget. Please refresh.', 'error');
    document.body.appendChild(script);
  };

  const exportToCsv = () => {
    if (events.length === 0) return;

    const headers = ['Date', 'Customer Email', 'Reason', 'Status', 'Offer Shown', 'Customer MRR'];

    const rows = events.map((e) => {
      let status = 'pending';
      if (e.offer_accepted === true && e.final_action === 'paused') status = 'paused';
      else if (e.offer_accepted === true) status = 'saved';
      else if (e.offer_accepted === false) status = 'cancelled';

      return [
        new Date(e.created_at).toISOString(),
        e.customer_email || 'Anonymous',
        `"${(e.initial_reason || e.reason || '').replace(/"/g, '""')}"`,
        status,
        `"${(e.offer_shown || '').replace(/"/g, '""')}"`,
        e.customer_mrr != null ? e.customer_mrr : '',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `retainpulse-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050c] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-[3px] border-violet-500/20 border-t-violet-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-[3px] border-transparent border-b-fuchsia-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    );
  }

  // ===========================================
  //  Metrics
  // ===========================================
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayCount = events.filter(
    (e) => new Date(e.created_at).toDateString() === new Date().toDateString()
  ).length;

  const savedEvents = events.filter((e) => e.offer_accepted === true);
  const pausedEvents = events.filter((e) => e.final_action === 'paused');
  const cancelledEvents = events.filter((e) => e.offer_accepted === false);
  const decidedEvents = events.filter((e) => e.offer_accepted !== null && e.offer_accepted !== undefined);

  const savedThisMonth = savedEvents.filter((e) => new Date(e.created_at) >= startOfMonth).length;

  const revenueEvents = savedEvents.filter((e) => e.final_action === 'stayed' && Number.isFinite(Number(e.customer_mrr)) && Number(e.customer_mrr) > 0);
  const recoveredThisMonth = revenueEvents
    .filter((e) => new Date(e.created_at) >= startOfMonth)
    .reduce((sum, e) => sum + Number(e.customer_mrr), 0);

  const recoveredAllTime = revenueEvents.reduce(
    (sum, e) => sum + Number(e.customer_mrr),
    0
  );
  const hasRevenueData = revenueEvents.length > 0;

  const saveRate = decidedEvents.length > 0
    ? Math.round((savedEvents.length / decidedEvents.length) * 100)
    : 0;

  // Group events by date
  const groupedEvents = (() => {
    const groups = {};
    events.forEach((event) => {
      const d = new Date(event.created_at);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let label;
      if (d.toDateString() === today.toDateString()) label = 'Today';
      else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
      else label = d.toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric',
        year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });

      if (!groups[label]) groups[label] = [];
      groups[label].push(event);
    });
    return groups;
  })();

  // ===========================================
  //  Render
  // ===========================================
  return (
    <div className="relative min-h-screen bg-[#05050c] text-white font-sans antialiased overflow-x-hidden">

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-violet-600/[0.13] rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] bg-fuchsia-600/[0.07] rounded-full blur-[130px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 md:px-10 md:py-14">

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-lg opacity-40"></div>
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-500 flex items-center justify-center shadow-xl">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/25 to-transparent"></div>
                  <svg className="w-7 h-7 text-white relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h3l2-7 4 14 2-7h7" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Retain<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Pulse</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1 font-mono">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link href="/dashboard/embed">
                <button className="group px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white transition-all duration-200 flex items-center gap-2">
                  <span>Install Widget</span>
                  <IconArrowRight />
                </button>
              </Link>

              <button
                onClick={simulateCancellation}
                className="relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden group transition-transform duration-200 hover:scale-[1.02] active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 transition-opacity duration-300"></div>
                <span className="relative">Test Widget</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-500 bg-transparent border border-white/[0.06] hover:bg-white/[0.03] hover:text-slate-300 transition-all duration-200 flex items-center gap-2"
                title="Log Out"
              >
                <IconLogout />
              </button>
            </div>
          </div>
        </header>

        {/* Recovered Revenue */}
        <section className="mb-6">
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500/[0.08] via-violet-500/[0.04] to-fuchsia-500/[0.02] border-2 border-emerald-500/25 p-6 md:p-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.15] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                      <IconDollar />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-300/90 uppercase tracking-[0.15em]">Estimated Recovered MRR</p>
                      <p className="text-xs text-slate-500 mt-0.5">Saved this month</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-br from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                      {hasRevenueData ? `$${recoveredThisMonth.toFixed(0)}` : '—'}
                    </span>
                    <span className="text-slate-500 text-sm">{hasRevenueData ? 'estimated / month' : 'provide customer MRR to estimate'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 lg:gap-8 lg:border-l lg:border-white/[0.06] lg:pl-8">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Saved</p>
                    <p className="text-3xl md:text-4xl font-bold text-emerald-300 tabular-nums">{savedThisMonth}</p>
                    <p className="text-[10px] text-slate-500 mt-1">this month</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Save Rate</p>
                    <p className="text-3xl md:text-4xl font-bold text-violet-300 tabular-nums">{saveRate}%</p>
                    <p className="text-[10px] text-slate-500 mt-1">success rate</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">All Time</p>
                    <p className="text-3xl md:text-4xl font-bold text-white tabular-nums">{hasRevenueData ? `$${recoveredAllTime.toFixed(0)}` : '—'}</p>
                    <p className="text-[10px] text-slate-500 mt-1">total saved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-violet-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-500/[0.15] transition-all duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Total Cancellations</span>
                <div className="w-9 h-9 rounded-lg bg-violet-500/[0.08] border border-violet-500/15 flex items-center justify-center text-violet-300">
                  <IconTrend />
                </div>
              </div>
              <p className="text-4xl font-bold tracking-tight text-white tabular-nums">{events.length}</p>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/[0.15] transition-all duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Today</span>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/15 flex items-center justify-center text-emerald-300">
                  <IconSpark />
                </div>
              </div>
              <p className="text-4xl font-bold tracking-tight text-white tabular-nums">{todayCount}</p>
              <p className="text-xs text-slate-500 mt-1">Since midnight</p>
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/30 transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/[0.06] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/[0.12] transition-all duration-500"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Public Key</span>
                <div className="w-9 h-9 rounded-lg bg-amber-500/[0.08] border border-amber-500/15 flex items-center justify-center text-amber-300">
                  <IconKey />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-slate-300 bg-black/30 px-3 py-2 rounded-lg border border-white/[0.06] truncate flex-1">
                  {publicKey || 'N/A'}
                </p>
                <button
                  onClick={copyPublicKey}
                  className={`p-2 rounded-lg border transition-all duration-200 flex-shrink-0 ${
                    copied
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                  title="Copy"
                >
                  {copied ? <IconCheck /> : <IconCopy />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {copied ? 'Copied to clipboard' : 'Your widget identifier'}
              </p>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="relative rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-slate-400">
                  <IconInbox />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white tracking-tight">Cancellation Reasons</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {events.length === 0
                      ? 'No feedback yet'
                      : `${events.length} total · ${savedEvents.length} saved · ${decidedEvents.length} decided`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {events.length > 0 && (
                  <>
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                      {savedEvents.length} Saved
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                      {pausedEvents.length} Paused
                    </span>
                    <span className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider">
                      {cancelledEvents.length} Cancelled
                    </span>
                  </>
                )}

                {events.length > 0 && (
                  <button
                    onClick={exportToCsv}
                    className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    title="Export as CSV"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                )}
              </div>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-5">
                  <IconInbox />
                </div>
                <p className="text-slate-300 font-medium">No cancellations recorded yet</p>
                <p className="text-slate-500 text-sm mt-1.5 max-w-sm mx-auto">
                  Try the <span className="text-violet-300">Test Widget</span> button above to simulate one.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedEvents).map(([dateLabel, dateEvents]) => (
                  <div key={dateLabel}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">{dateLabel}</span>
                      <div className="flex-1 h-px bg-white/[0.06]"></div>
                      <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                        {dateEvents.length} {dateEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {dateEvents.map((event) => {
                        const isSaved = event.offer_accepted === true && event.final_action !== 'paused';
                        const isPaused = event.offer_accepted === true && event.final_action === 'paused';
                        const isCancelled = event.offer_accepted === false;
                        const isPending = event.offer_accepted === null || event.offer_accepted === undefined;

                        const borderColor = isSaved ? 'border-l-emerald-500/60'
                          : isPaused ? 'border-l-blue-500/60'
                          : isCancelled ? 'border-l-red-500/60'
                          : 'border-l-amber-500/60';

                        return (
                          <div key={event.id} className={`group relative pl-4 pr-4 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06] border-l-4 ${borderColor} hover:bg-white/[0.04] transition-all duration-200`}>
                            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                              <div className="flex items-center gap-3 flex-shrink-0 md:w-56">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                  {event.customer_email ? event.customer_email.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-slate-200 font-mono text-xs truncate">
                                    {event.customer_email || 'Anonymous'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    {new Date(event.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason:</span>
                                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-white/[0.04] text-slate-200 border border-white/[0.06]">
                                    {event.initial_reason || event.reason || 'N/A'}
                                  </span>
                                </div>

                                {event.ai_follow_up_question && (
                                  <div className="text-[11px] text-slate-400 leading-relaxed">
                                    <span className="text-slate-500">Q:</span> {event.ai_follow_up_question}
                                  </div>
                                )}
                                {event.follow_up_answer && (
                                  <div className="text-[11px] text-violet-300/90 leading-relaxed">
                                    <span className="text-slate-500">A:</span> {event.follow_up_answer}
                                  </div>
                                )}

                                {event.offer_shown && (
                                  <div className="flex items-center gap-2 flex-wrap pt-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Offer:</span>
                                    <span className="text-[11px] text-emerald-300/80">{event.offer_shown}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex-shrink-0">
                                {isSaved && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Saved
                                  </span>
                                )}
                                {isPaused && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-blue-500/15 text-blue-300 border border-blue-500/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>Paused
                                  </span>
                                )}
                                {isCancelled && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-red-500/15 text-red-300 border border-red-500/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>Cancelled
                                  </span>
                                )}
                                {isPending && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse"></span>
          <IconShield />
          <span className="tracking-[0.15em] font-mono uppercase">Secured by Supabase RLS</span>
        </footer>
      </div>
    </div>
  );
}