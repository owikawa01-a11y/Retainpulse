"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ===========================================
//  Brand Logo
// ===========================================
const Logo = () => (
  <div className="flex items-center justify-center gap-3">
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-lg opacity-40"></div>
      <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-fuchsia-500 flex items-center justify-center shadow-xl">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/25 to-transparent"></div>
        <svg className="w-6 h-6 text-white relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h3l2-7 4 14 2-7h7" />
        </svg>
      </div>
    </div>
    <span className="text-2xl font-bold tracking-tight">
      Retain<span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Pulse</span>
    </span>
  </div>
);

// ===========================================
//  SVG Icons
// ===========================================
const IconMail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconLock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

// ===========================================
//  Main Component
// ===========================================
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05050c] flex items-center justify-center p-4 overflow-hidden">

      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/[0.15] rounded-full blur-[130px]"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/[0.08] rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="mb-8">
          <Logo />
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl shadow-black/50">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Log in to your RetainPulse dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-slate-400 text-sm block mb-2 font-medium">Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <IconMail />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-400 text-sm block mb-2 font-medium">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <IconLock />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3.5 rounded-2xl font-semibold text-white overflow-hidden transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-500"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 transition-opacity duration-300"></div>
              <div className="absolute inset-0 rounded-2xl shadow-lg shadow-violet-500/30"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <IconArrowRight />
                  </>
                )}
              </span>
            </button>

          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm">
              <Link href="/forgot-password" className="text-slate-500 hover:text-violet-300 transition-colors">
                Forgot password?
              </Link>
            </p>
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link href="/signup" className="text-violet-300 hover:text-violet-200 font-medium transition-colors">
                Sign Up
              </Link>
            </p>
          </div>

        </div>

        {/* Bottom Trust Line */}
        <p className="text-center text-xs text-slate-600 mt-6 tracking-wider">
          🔒 Protected by authenticated access controls
        </p>

      </div>
    </div>
  );
}