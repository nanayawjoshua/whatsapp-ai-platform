'use client';

import Link from "next/link";
import { FaWhatsapp, FaCheckCircle, FaClock, FaShieldAlt } from "react-icons/fa";
import { MdQrCode2, MdPsychology, MdFlashOn } from "react-icons/md";
import BeelineLogo from "./components/BeelineLogo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Header - Sticky, Minimal, Premium */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-cream-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <BeelineLogo size="md" />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#how-it-works" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
                How it works
              </a>
              <a href="#pricing" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
                Pricing
              </a>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="hidden sm:inline-block text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-gradient-beeline text-white text-sm font-semibold rounded-full hover:shadow-hover transition-all"
              >
                Get started →
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section - Jobs Style: Massive headline, minimal text */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        {/* Subtle gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-mesh pointer-events-none opacity-50"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* The Hook - Massive, Simple */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-light tracking-tight mb-6 text-text-primary">
            Your WhatsApp.
            <br />
            <span className="bg-gradient-beeline bg-clip-text text-transparent font-normal">
              But it never sleeps.
            </span>
          </h1>

          {/* Subheadline - Tiny, Understated */}
          <p className="text-xl sm:text-2xl text-text-secondary mb-12 font-light max-w-3xl mx-auto">
            Beeline turns every message into an opportunity.
            <br className="hidden sm:block" />
            While you focus on what matters.
          </p>

          {/* Single CTA - No clutter */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="px-8 py-4 bg-gradient-beeline text-white text-base font-semibold rounded-full hover:scale-105 hover:shadow-hover transition-all shadow-medium"
            >
              Start free trial →
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 bg-surface text-text-primary text-base font-semibold rounded-full hover:bg-surface-hover transition-all border border-cream-border"
            >
              See how it works
            </Link>
          </div>

          {/* Social Proof - Subtle */}
          <p className="text-sm text-text-tertiary flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse"></span>
            847 businesses using Beeline right now
          </p>
        </div>

        {/* Hero Visual - WhatsApp Conversation Demo */}
        <div className="max-w-4xl mx-auto mt-20 relative z-10">
          <div className="bg-surface rounded-3xl shadow-large p-6 border border-cream-border animate-float">
            <div className="aspect-video bg-gradient-cream rounded-2xl overflow-hidden border border-cream-border flex items-center justify-center relative">
              {/* WhatsApp Chat Mockup */}
              <div className="w-full h-full flex flex-col bg-gradient-to-b from-surface to-cream-dark p-8">
                {/* Chat Header */}
                <div className="flex items-center gap-3 pb-6 border-b border-cream-border">
                  <div className="w-12 h-12 rounded-full bg-gradient-beeline flex items-center justify-center shadow-soft">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary">Sarah's Jewelry</p>
                    <p className="text-xs text-success flex items-center gap-1">
                      <span className="w-2 h-2 bg-success rounded-full"></span>
                      Active now
                    </p>
                  </div>
                  <div className="text-text-tertiary text-xs">3:47 AM</div>
                </div>

                {/* Messages */}
                <div className="flex-1 py-6 space-y-4">
                  {/* Customer Message */}
                  <div className="flex justify-start">
                    <div className="bg-surface border border-cream-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs shadow-soft">
                      <p className="text-sm text-text-primary">Hi! Do you have gold earrings in stock?</p>
                      <p className="text-xs text-text-tertiary mt-1">3:47 AM</p>
                    </div>
                  </div>

                  {/* AI Response - Instant */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-beeline rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs shadow-soft">
                      <p className="text-sm text-white">Yes! We have beautiful 18k gold hoops and studs. Would you like to see photos? 📸</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
                        <FaCheckCircle className="w-3 h-3" />
                        <span>Delivered • 3:47 AM</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Indicator */}
                  <div className="flex justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream-dark border border-cream-border rounded-full shadow-sm">
                      <div className="w-2 h-2 bg-beeline-orange rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-text-secondary">AI responded instantly • Sarah was asleep</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section - Create emotional tension */}
      <section className="py-20 px-6 bg-cream-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-6 text-text-primary">
            You're losing money
            <br />
            <span className="text-text-secondary">while you sleep.</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-12">
            Every unanswered message is a missed sale. Every delayed response is a customer going to your competitor.
          </p>

          {/* Stats Grid - Painful truths */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { stat: "67%", label: "of customers expect replies within 1 hour" },
              { stat: "3AM", label: "when most businesses lose sales" },
              { stat: "₵450", label: "average value of a missed WhatsApp lead" }
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

      {/* The Solution - How It Works (Jobs' 3-Step Rule) */}
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

          {/* Steps - Visual, Minimal Text */}
          <div className="space-y-24">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-block px-3 py-1 bg-cream-dark rounded-full text-xs font-semibold text-text-secondary mb-4">
                  STEP 1
                </div>
                <h3 className="text-4xl font-light mb-4 text-text-primary">
                  Scan.
                </h3>
                <p className="text-lg text-text-secondary mb-6">
                  Connect your WhatsApp number with a QR code. No downloads. No new apps. Just scan.
                </p>
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <FaShieldAlt className="text-success" />
                  <span>100% secure. We never see your messages without permission.</span>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="bg-gradient-cream rounded-3xl p-12 border border-cream-border shadow-medium flex items-center justify-center">
                  <MdQrCode2 className="w-48 h-48 text-beeline-yellow opacity-30" />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="bg-gradient-cream rounded-3xl p-12 border border-cream-border shadow-medium flex items-center justify-center">
                <MdPsychology className="w-48 h-48 text-beeline-orange opacity-30" />
              </div>
              <div>
                <div className="inline-block px-3 py-1 bg-cream-dark rounded-full text-xs font-semibold text-text-secondary mb-4">
                  STEP 2
                </div>
                <h3 className="text-4xl font-light mb-4 text-text-primary">
                  Choose.
                </h3>
                <p className="text-lg text-text-secondary mb-6">
                  Pick your AI's personality. Professional? Friendly? Funny? Or train it with your own voice notes.
                </p>
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <FaClock className="text-beeline-orange" />
                  <span>Takes 15 seconds. Sounds like you.</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="inline-block px-3 py-1 bg-cream-dark rounded-full text-xs font-semibold text-text-secondary mb-4">
                  STEP 3
                </div>
                <h3 className="text-4xl font-light mb-4 text-text-primary">
                  Sell.
                </h3>
                <p className="text-lg text-text-secondary mb-6">
                  Your AI handles inquiries 24/7. You take over when needed. Watch sales grow while you sleep.
                </p>
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <MdFlashOn className="text-success" />
                  <span>Average response time: <strong>0.8 seconds</strong></span>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="bg-gradient-beeline rounded-3xl p-12 border border-beeline-orange/20 shadow-glow flex items-center justify-center">
                  <FaWhatsapp className="w-48 h-48 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Real Story (Jobs always used real testimonials) */}
      <section className="py-20 px-6 bg-gradient-cream">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface rounded-3xl p-12 border border-cream-border shadow-large">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-beeline flex-shrink-0 flex items-center justify-center shadow-medium">
                <span className="text-white font-bold text-3xl">S</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-2xl font-light text-text-primary mb-6 leading-relaxed">
                  "Last month, Beeline handled <strong className="font-semibold">412 conversations</strong> while I was sleeping, spending time with family, or running my business. It's like hiring the world's best employee for ₵49."
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

      {/* Pricing - Jobs Style: Simple, Two Options */}
      <section id="pricing" className="py-32 px-6 bg-cream">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-light tracking-tight mb-6 text-text-primary">
            Two plans.
            <br />
            <span className="text-text-secondary">One choice.</span>
          </h2>
          <p className="text-xl text-text-secondary mb-16 max-w-2xl mx-auto">
            Less than hiring someone for a single day. Cancel anytime.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                Start free trial
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
                  "Voice note training",
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
                Start free trial
              </Link>
            </div>
          </div>

          <p className="text-sm text-text-tertiary mt-12">
            7-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Final CTA - The "One More Thing" Moment */}
      <section className="py-32 px-6 bg-text-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-beeline opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold tracking-wider mb-4 text-white/60">ONE MORE THING</p>
          <h2 className="text-5xl sm:text-6xl font-light tracking-tight mb-6">
            It sounds like you.
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Train your AI with a 15-second voice note. It learns your style, your tone, your personality. Customers won't know the difference.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-5 bg-white text-text-primary text-lg font-semibold rounded-full hover:scale-105 transition-all shadow-large"
          >
            Try it free for 7 days →
          </Link>
        </div>
      </section>

      {/* Footer - Minimal, Clean */}
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
            <p>© 2025 Beeline. Built in Ghana. 🇬🇭</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
