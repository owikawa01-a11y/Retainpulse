import './globals.css';
import { Analytics } from '@vercel/analytics/react';

// ===========================================
//  RetainPulse — Root Layout
//  Complete SEO + Social metadata
// ===========================================

export const metadata = {
  // ─── Base ───────────────────────────────
  metadataBase: new URL('https://retainpulse.pro'),

  // ─── Title ──────────────────────────────
  title: {
    default: 'RetainPulse — Stop Losing Customers Silently',
    template: '%s · RetainPulse',
  },

  // ─── Description ────────────────────────
  description:
    'RetainPulse installs a smarter cancellation flow on your SaaS in 48 hours — uncover the real reason customers leave and give each cancellation one relevant chance to recover.',

  // ─── Keywords ───────────────────────────
  keywords: [
    'SaaS churn',
    'customer retention',
    'cancellation flow',
    'churn reduction',
    'retention offer',
    'indie SaaS',
    'cancellation feedback',
    'churn analytics',
    'retain customers',
    'SaaS retention',
  ],

  // ─── Authors ────────────────────────────
  authors: [{ name: 'RetainPulse', url: 'https://retainpulse.pro' }],
  creator: 'RetainPulse',
  publisher: 'RetainPulse',

  // ─── Category ───────────────────────────
  category: 'SaaS',
  applicationName: 'RetainPulse',

  // ─── Icons ──────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/logo-mark.svg',
  },

  // ─── OpenGraph ──────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://retainpulse.pro',
    siteName: 'RetainPulse',
    title: 'RetainPulse — Stop Losing Customers Silently',
    description:
      'I install RetainPulse on your SaaS in 48 hours — then manage it for 30 days. Know exactly why your customers cancel, and get a real shot at keeping them.',
  },

  // ─── Twitter ────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'RetainPulse — Stop Losing Customers Silently',
    description:
      'I install RetainPulse on your SaaS in 48 hours — then manage it for 30 days. Know why customers cancel, and win some back.',
    creator: '@Retainpulse',
    site: '@Retainpulse',
  },

  // ─── Robots ─────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ─── Verification ───────────────────────
  // ⚠️ ضيف Google Search Console verification code هنا لما تجهزه
  // verification: {
  //   google: 'your-google-verification-code',
  // },

  // ─── Other ──────────────────────────────
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

// ===========================================
//  Viewport
// ===========================================
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b5cf6' },
    { media: '(prefers-color-scheme: dark)', color: '#05050c' },
  ],
  colorScheme: 'dark',
};

// ===========================================
//  Root Layout
// ===========================================
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Extra meta tags for compatibility */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#05050c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RetainPulse" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased bg-[#05050c] text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}