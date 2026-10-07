import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#05050c] text-white font-sans antialiased">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-slate-400 hover:text-white text-sm mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-slate-400 text-sm mb-12">Last updated: October 7, 2026</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using RetainPulse ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">2. Description of Service</h2>
            <p>RetainPulse is a done-for-you service that installs and manages a cancellation feedback flow on your SaaS product. I help you understand why your customers cancel and provide one tailored retention offer per cancellation. The service includes a 48-hour installation and 30 days of hands-on management.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">3. Account Registration</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">4. Service Fees and Payment</h2>
            <p>RetainPulse is a one-time service, not a recurring subscription. Fees are structured in two milestones:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Installation fee:</strong> $100 (or the Founding Member rate) — payable upfront before installation begins.</li>
              <li><strong>Management fee:</strong> $149 (or the Founding Member rate of $99) — payable after 7 days of the installation, once you have seen the value.</li>
            </ul>
            <p className="mt-3">Payments are processed through Payoneer. You will receive an invoice for each milestone. After the 30-day management period ends, you keep the widget and dashboard forever with no recurring fees.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">5. Refunds</h2>
            <p>Please refer to my <Link href="/refund" className="text-violet-400 hover:text-violet-300">Refund Policy</Link> for details on eligibility and the refund process.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">6. Acceptable Use</h2>
            <p>You agree not to use the Service for any illegal purpose, to attempt to gain unauthorized access to my systems, or to interfere with the Service's operation. You also agree not to use RetainPulse to deceive, mislead, or manipulate your customers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">7. Intellectual Property</h2>
            <p>RetainPulse and its original content, features, and functionality are owned by me and are protected by international copyright laws. You retain ownership of your own data and any customer data processed through the widget.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">8. Limitation of Liability</h2>
            <p>The Service is provided "as is" without warranties. I am not liable for any indirect, incidental, or consequential damages arising from your use of the Service, including loss of revenue or customer data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">9. Termination</h2>
            <p>I may terminate or suspend your account at any time for violations of these terms. You may request termination of your account by contacting me at the email below.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">10. Changes to Terms</h2>
            <p>I reserve the right to modify these terms. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mt-8 mb-3">11. Contact</h2>
            <p>For questions about these Terms, contact me at <a href="mailto:hello@retainpulse.pro" className="text-violet-400 hover:text-violet-300">hello@retainpulse.pro</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}