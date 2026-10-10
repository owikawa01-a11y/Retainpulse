// app/tools/churn-calculator/page.js
import Calculator from './Calculator';

export const metadata = {
  title: 'Free SaaS Churn Calculator — See Your Real Churn Rate | RetainPulse',
  description: 'Calculate your SaaS churn rate, 12-month customer projection, and revenue impact of reducing churn. Free, no signup required.',
  keywords: ['churn calculator', 'SaaS churn rate', 'customer churn', 'revenue churn', 'MRR calculator'],
  openGraph: {
    title: 'Free SaaS Churn Calculator',
    description: 'See your real churn rate and how much revenue you lose every month.',
    type: 'website',
    url: 'https://retainpulse.pro/tools/churn-calculator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free SaaS Churn Calculator',
    description: 'See your real churn rate and how much revenue you lose every month.',
  },
};

export default function Page() {
  return <Calculator />;
}