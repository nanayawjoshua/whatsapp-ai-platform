'use client';

import Link from 'next/link';
import { FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import BeelineLogo from './components/BeelineLogo';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Header - Minimal, Like Apple */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-cream-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <BeelineLogo size="md" />
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">How it works</a>
              <a href="#pricing" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
            </div>
            <Link
              href="/signup"
              className="px-6 py-2.5 bg-gradient-beeline text-white text-sm font-semibold rounded-full hover:shadow-hover transition-all"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero - Jobs Style: One Big Idea */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-warm pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight mb-6 text-text-primary">
            Your WhatsApp.
            <br />
            <span className="bg-gradient-beeline bg-clip-text text-transparent font-normal">
              But it never sleeps.
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto font-light">
            AI that handles sales and customer service on WhatsApp. 24/7. In your voice.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/signup"
              className="inline-block px-10 py-5 bg-gradient-beeline text-white text-lg font-semibold rounded-full hover:scale-105 transition-all shadow-medium"
            >
              Try 10 conversations free →
            </Link>
            <a
              href="#how-it-works"
              className="inline-block px-10 py-5 bg-surface text-text-primary text-lg font-semibold rounded-full border border-cream-border hover:bg-cream-dark transition-all"
            >
              See how it works
            </a>
          </div>

          {/* WhatsApp Conversation Demo - Concrete, Visual */}
          <div className="max-w-md mx-auto">
            <div className="bg-surface rounded-3xl shadow-large p-6 border border-cream-border animate-float">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cream-border">
                <div className="w-10 h-10 bg-gradient-beeline rounded-full flex items-center justify-center">
                  <FaWhatsapp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary text-sm">Your Business</p>
                  <p className="text-xs text-success">Online</p>
                </div>
              </div>

              {/* Customer message */}
              <div className="mb-4">
                <div className="bg-cream-dark rounded-2xl rounded-tl-sm p-4 inline-block max-w-[80%]">
                  <p className="text-sm text-text-primary">Do you have the black shoes in size 42?</p>
                  <p className="text-xs text-text-tertiary mt-1">3:24 AM</p>
                </div>
              </div>

              {/* AI response */}
              <div className="flex justify-end">
                <div className="bg-gradient-beeline rounded-2xl rounded-tr-sm p-4 inline-block max-w-[80%]">
                  <p className="text-sm text-white">Yes! We have 3 pairs left. ₵280. Can deliver today if you order now 🚚</p>
                  <p className="text-xs text-white/70 mt-1">3:24 AM ✓✓</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-cream-border text-center">
                <p className="text-xs text-text-tertiary">
                  <span className="inline-block w-2 h-2 bg-success rounded-full mr-2"></span>
                  Responded in 0.8 seconds. While you were sleeping.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem - Jobs always showed the pain first */}
      <section className="py-20 px-6 bg-cream-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-6 text-text-primary">
            You're losing money
            <br />
            <span className="text-text-secondary">while you sleep.</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-12">
            Every unanswered message is a missed sale. Every delayed customer service question drives them to your competitor.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { stat: "67%", label: "of customers expect replies within 1 hour" },
              { stat: "3AM", label: "when most sales & support requests happen" },
              { stat: "₵450", label: "average value of a missed customer inquiry" }
            ].map((item, i) => (
              <div key={i} className="bg-surface rounded-2xl p-8 border border-cream-border shadow-soft">
                <div className="text-4xl font-bold bg-gradient-beeline bg-clip-text text-transparent mb-2">
                  {item.stat}
                </div>
                <div className="text-sm text-text-secondary">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Jobs' "Three Things" Rule */}
      <section id="how-it-works" className="py-32 px-6 bg-cream">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl sm:text-6xl font-light tracking-tight mb-6 text-text-primary">
              Three steps.
              <br />
              <span className="bg-gradient-beeline bg-clip-text text-transparent">That's it.</span>
            </h2>
            <p className="text-xl text-text-secondary">
              From signup to your first AI conversation in 60 seconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-beeline rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4">Scan</h3>
              <p className="text-text-secondary leading-relaxed">
                Scan a QR code with WhatsApp. Your AI connects to your number in 5 seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-beeline rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4">Train</h3>
              <p className="text-text-secondary leading-relaxed">
                Tell it about your products, pricing, and personality. Upload your knowledge base.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-beeline rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4">Sell</h3>
              <p className="text-text-secondary leading-relaxed">
                Your AI handles sales and customer service. You take over anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Real Story (Jobs used real testimonials) */}
      <section className="py-20 px-6 bg-gradient-cream">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface rounded-3xl p-12 border border-cream-border shadow-large">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-beeline flex-shrink-0 flex items-center justify-center shadow-medium">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-2xl font-light text-text-primary mb-6 leading-relaxed">
                  "Last month, Beeline handled <strong className="font-semibold">412 conversations</strong> while I was sleeping, with family, or running my business. It's like hiring the world's best employee for ₵49."
                </p>
                <div>
                  <p className="font-semibold text-text-primary">Sarah Mensah</p>
                  <p className="text-text-secondary text-sm">Owner, Sarah's Jewelry • Accra</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Jobs Style: Three Clear Choices */}
      <section id="pricing" className="py-32 px-6 bg-cream">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-light tracking-tight mb-6 text-text-primary">
            Three plans.
            <br />
            <span className="text-text-secondary">Pick yours.</span>
          </h2>
          <p className="text-xl text-text-secondary mb-16 max-w-2xl mx-auto">
            Less than hiring someone for a single day. Cancel anytime.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Personal */}
            <div className="bg-surface rounded-3xl p-10 border border-cream-border shadow-soft hover:shadow-medium transition-all">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-text-primary mb-2">Personal</h3>
                <p className="text-text-secondary text-sm mb-6">For individuals and side hustles</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-text-primary">₵49</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 text-left">
                {[
                  "1 WhatsApp number",
                  "Unlimited conversations",
                  "Custom personality",
                  "24/7 AI responses",
                  "Basic analytics"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-secondary">
                    <FaCheckCircle className="text-success w-5 h-5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=personal"
                className="block w-full px-6 py-3 bg-cream-dark text-text-primary font-semibold rounded-full hover:bg-text-primary hover:text-white transition-all border border-cream-border"
              >
                Start free
              </Link>
            </div>

            {/* Business - Highlighted */}
            <div className="bg-gradient-beeline rounded-3xl p-10 shadow-glow relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-text-primary text-white text-xs font-bold rounded-full">
                MOST POPULAR
              </div>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-white mb-2">Business</h3>
                <p className="text-white/80 text-sm mb-6">For serious sellers</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">₵99</span>
                  <span className="text-white/80">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 text-left">
                {[
                  "Everything in Personal",
                  "Product catalog",
                  "Advanced analytics",
                  "Priority support",
                  "Human takeover controls"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-white">
                    <FaCheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=business"
                className="block w-full px-6 py-3 bg-white text-beeline-orange font-semibold rounded-full hover:bg-cream transition-all shadow-medium"
              >
                Start free
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-surface rounded-3xl p-10 border-2 border-beeline-yellow/30 shadow-soft hover:shadow-medium transition-all">
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-text-primary mb-2">Enterprise</h3>
                <p className="text-text-secondary text-sm mb-6">For chains & teams</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-text-primary">₵599</span>
                  <span className="text-text-secondary">/month</span>
                </div>
                <p className="text-xs text-text-tertiary mt-2">5-60 locations</p>
              </div>
              <ul className="space-y-4 mb-8 text-left">
                {[
                  "Everything in Business",
                  "Multi-location dashboard",
                  "Knowledge base (upload docs)",
                  "Team management",
                  "Volume discounts (up to 50%)",
                  "Dedicated account manager"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-secondary">
                    <FaCheckCircle className="text-success w-5 h-5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=enterprise"
                className="block w-full px-6 py-3 bg-cream-dark text-text-primary font-semibold rounded-full hover:bg-text-primary hover:text-white transition-all border border-cream-border"
              >
                Contact sales
              </Link>
            </div>
          </div>

          <p className="text-sm text-text-tertiary mt-12">
            First 10 conversations free. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* "One More Thing" - Jobs' signature move */}
      <section className="py-32 px-6 bg-text-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-beeline opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold tracking-wider mb-4 text-white/60">ONE MORE THING</p>
          <h2 className="text-5xl sm:text-6xl font-light tracking-tight mb-6">
            It learns your business.
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Upload your menu, pricing, FAQs, policies—anything. Your AI becomes an expert on YOUR business. Perfect for customer service at scale.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-5 bg-white text-text-primary text-lg font-semibold rounded-full hover:scale-105 transition-all shadow-large"
          >
            Try 10 conversations free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream-dark border-t border-cream-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <BeelineLogo size="sm" className="mb-4" />
              <p className="text-sm text-text-secondary max-w-xs">
                AI-powered WhatsApp assistant for businesses in Ghana.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#how-it-works" className="hover:text-text-primary">How it works</a></li>
                <li><a href="#pricing" className="hover:text-text-primary">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-text-primary">About</a></li>
                <li><a href="#" className="hover:text-text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-text-primary">Privacy</a></li>
                <li><a href="#" className="hover:text-text-primary">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-cream-border text-center text-sm text-text-tertiary">
            <p>© 2025 Beeline. Made in Ghana with 🐝</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
