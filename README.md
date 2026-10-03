# RetainPulse

> **Understand why your customers actually cancel — and win some of them back.**

RetainPulse is a **done-for-you cancellation flow for indie SaaS founders**.

Instead of losing customers silently, RetainPulse helps you understand why customers leave, uncover the real reason behind cancellations, and give each customer one relevant retention option.

### What you get

* 📊 **Real cancellation reasons** — not just generic survey answers
* 🤖 **AI follow-up questions** — uncover the reason behind the reason
* 🎯 **One smart retention offer** — matched to the cancellation reason
* 💰 **Recovered Revenue tracking** — see estimated MRR retained when customer MRR is provided

> **Installed in 48 hours. Managed for 30 days.**
> No SDK. No developer sprint.

---

## 🎯 The Problem

Customers often cancel without giving you enough information to understand why.

You see the cancellation.

You see the MRR drop.

But you don't know what actually caused it:

* Was the product too expensive?
* Was a feature missing?
* Did they switch to a competitor?
* Was it a temporary problem?
* Is the same issue affecting other customers?

Traditional cancellation surveys often don't go deep enough. Customers select an option and leave.

### RetainPulse takes one extra step.

After a customer selects their cancellation reason, RetainPulse uses AI to ask **one contextual follow-up question** designed to uncover the underlying reason.

That gives SaaS founders more useful cancellation data — without forcing customers through a long survey.

---

## ⚙️ How It Works

The entire cancellation flow takes place in a simple, focused sequence:

```text
Customer clicks "Cancel"
        ↓
5 cancellation reasons are displayed
        ↓
Customer selects a reason
        ↓
AI generates ONE contextual follow-up question
        ↓
Customer provides an answer
        ↓
One relevant retention offer is shown
        ↓
Keep / Pause / Cancel
        ↓
Founder receives an email alert
```

### The customer experience

1. Customer clicks **Cancel**
2. RetainPulse displays **5 cancellation reasons**
3. Customer selects a reason
4. AI asks **one contextual follow-up question**
5. Customer types their answer
6. RetainPulse presents **one relevant retention offer**
7. Customer chooses:

   * **Keep**
   * **Pause**
   * **Cancel**
8. The SaaS owner receives an **instant email notification**

The goal is simple:

> **Understand the cancellation without making the cancellation difficult.**

---

## 🛡️ Compliance-First Design

RetainPulse is designed around a transparent cancellation experience.

There are:

* No hidden cancellation buttons
* No fake urgency
* No misleading UI
* No intentionally confusing cancellation paths
* No forced retention loops

The customer can always complete their cancellation.

> **Retention should come from relevance — not friction.**

---

## 🧠 AI-Powered Follow-Ups

Generic questions produce generic answers.

RetainPulse uses AI to generate a single follow-up question based on the customer's selected cancellation reason.

### Example

**Customer selects:**

> "Too expensive"

**RetainPulse asks:**

> "Was the price itself the issue, or did you feel the value you were getting wasn't enough for the cost?"

This helps turn a basic cancellation reason into more actionable feedback.

---

## 💰 Retention & Revenue Recovery

When appropriate, RetainPulse can present **one retention offer** based on the customer's reason for cancelling.

Examples include:

* 💵 Discount
* ⏸️ Pause subscription
* 🔄 Alternative plan
* 🎁 Temporary incentive

The customer can accept the offer or continue with cancellation.

RetainPulse then tracks the outcome so founders can see:

* Cancellation reason
* Follow-up response
* Offer shown
* Customer decision
* Recovered subscription
* Estimated recovered MRR

---

## 🛠️ Tech Stack

| Layer              | Technology                   |
| ------------------ | ---------------------------- |
| **Framework**      | Next.js 14 — App Router      |
| **Styling**        | Tailwind CSS                 |
| **Database**       | Supabase — PostgreSQL        |
| **Authentication** | Supabase Auth                |
| **AI**             | Groq — `openai/gpt-oss-120b` |
| **Rate Limiting**  | Upstash Redis                |
| **Email**          | Resend                       |
| **Hosting**        | Vercel                       |

---

## 📁 Project Structure

```text
retainpulse/
│
├── app/
│   ├── api/
│   │   ├── follow-up/
│   │   ├── answer/
│   │   ├── retention/
│   │   ├── decision/
│   │   └── account/
│   │       └── status/
│   │
│   ├── dashboard/
│   │   └── embed/
│   │
│   ├── demo/
│   ├── login/
│   ├── signup/
│   ├── pricing/
│   ├── terms/
│   ├── privacy/
│   └── refund/
│
├── lib/
│   ├── supabaseClient.js
│   ├── sendEmail.js
│   ├── ratelimit.js
│   └── trial.js
│
├── public/
│   └── widget.js
│
├── .env.local
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/owikawa01-a11y/retainpulse.git

cd retainpulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://retainpulse.pro

GROQ_API_KEY=your_groq_key

UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

RESEND_API_KEY=your_resend_key
OWNER_EMAIL=your_owner_email
```

> **Important:** Never commit `.env.local` or expose your service-role key publicly.

### 4. Start the development server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## 🗄️ Database

RetainPulse currently uses three primary Supabase tables:

### `accounts`

Stores SaaS owner account information and account-level metadata.

### `widgets`

Stores widget installation information, including:

* Public widget key
* Domain
* Account relationship
* Installation data

### `cancellation_events`

Stores cancellation activity and the associated customer journey.

This includes information such as:

* Cancellation reason
* AI follow-up
* Customer response
* Retention offer
* Final decision
* Recovery outcome

---

## 🧪 Testing the Widget

You can test the complete cancellation experience using the demo environment.

### Local demo

Open:

```text
http://localhost:3000/demo
```

Then:

1. Click **Try the live demo**
2. Select a cancellation reason
3. Answer the AI-generated follow-up question
4. Review the retention offer
5. Choose the final action

This allows you to test the complete flow without connecting a production SaaS application.

---

## 🚢 Deployment

RetainPulse is deployed using **Vercel**.

The production workflow is:

```text
Local development
       ↓
Git commit
       ↓
Push to main
       ↓
Vercel deployment
       ↓
Production
```

To deploy a new version:

```bash
git add .
git commit -m "Update RetainPulse"
git push origin main
```

Vercel automatically builds and deploys the latest version.

---

## 🔐 Security Notes

Before deploying to production:

* Keep all secrets in environment variables
* Never expose `SUPABASE_SERVICE_ROLE_KEY`
* Never commit `.env.local`
* Keep database Row Level Security enabled
* Dashboard data is additionally scoped server-side to the authenticated account
* Validate widget requests server-side
* Rate-limit public API endpoints
* Validate domains and widget identifiers
* Avoid exposing internal database information to the client

---

## 📄 License

**Private — All Rights Reserved.**

This project and its source code are proprietary.

Unauthorized copying, redistribution, or commercial use is not permitted.

---

## 🌐 Links

**Website:**
https://retainpulse.pro

**X / Twitter:**
https://x.com/Retainpulse

**Email:**
[hello@retainpulse.pro](mailto:hello@retainpulse.pro)

---

## 📬 Contact

For questions, partnerships, or product inquiries:

**[hello@retainpulse.pro](mailto:hello@retainpulse.pro)**

---

<p align="center">
  <strong>RetainPulse</strong><br>
  Understand why customers leave. Recover the ones you can.
</p>
