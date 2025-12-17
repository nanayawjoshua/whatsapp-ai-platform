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
            Never miss a customer again.
          </h1>
          <p className="text-xl sm:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto font-light">
            Your phone number now works 24/7. Answers every message. Closes sales while you sleep. You only pay when you make money.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/signup"
              className="inline-block px-10 py-5 bg-gradient-beeline text-white text-lg font-semibold rounded-full hover:scale-105 transition-all shadow-medium"
            >
              Start Selling 24/7 →
            </Link>
            <a
              href="#how-it-works"
              className="inline-block px-10 py-5 bg-surface text-text-primary text-lg font-semibold rounded-full border border-cream-border hover:bg-cream-dark transition-all"
            >
              See how it works (2 min)
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
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-6 text-text-primary">
            You're losing sales right now.
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            Every day, customers message your business number. They want to buy. They have questions. They're ready to spend money. But you're with another customer. Or it's 11 PM. Or it's Sunday. So they message your competitor instead.
          </p>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto mb-12 font-semibold">
            The average small business loses 67% of potential sales just because someone wasn't available to respond.
          </p>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            That's not a business problem. That's a tragedy. You work too hard to let money walk away because you can't be in two places at once.
          </p>
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
              <h3 className="text-2xl font-semibold text-text-primary mb-4">Connect your business number</h3>
              <p className="text-text-secondary leading-relaxed">
                It takes 30 seconds - just scan a code with your phone.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-beeline rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4">Your number starts working for you</h3>
              <p className="text-text-secondary leading-relaxed">
                Every customer message gets answered instantly, naturally, like you would respond.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-beeline rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-4">You step in only when it matters</h3>
              <p className="text-text-secondary leading-relaxed">
                Get a notification when someone's ready to buy - you close the deal, we handle everything else.
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

      {/* Pricing - Pay Per Sale Model */}
      <section id="pricing" className="py-32 px-6 bg-cream">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-light tracking-tight mb-6 text-text-primary">
            You only pay when you earn.
          </h2>
          <p className="text-xl text-text-secondary mb-16 max-w-3xl mx-auto">
            Here's how it works: For every sale that comes through a conversation your number handled, we take 15%. That's it.
          </p>

          {/* Pricing Card */}
          <div className="bg-gradient-beeline rounded-3xl p-12 shadow-glow mb-12 max-w-2xl mx-auto">
            <div className="mb-8">
              <h3 className="text-3xl font-semibold text-white mb-4">Standard Pricing</h3>
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span className="text-5xl font-bold text-white">15%</span>
                <span className="text-white/80 text-xl">per sale</span>
              </div>
              <p className="text-white/70 text-sm">No setup fees. No monthly subscriptions. No contracts.</p>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-surface rounded-3xl p-12 border border-cream-border shadow-medium mb-8">
            <h3 className="text-2xl font-semibold text-text-primary mb-8">What's Included:</h3>
            <ul className="grid md:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
              {[
                "Unlimited messages answered",
                "24/7 availability, every day of the year",
                "Works with your existing phone number",
                "Notifications when customers are ready to buy",
                "You close the deals, we handle the rest",
                "Real-time conversation analytics"
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary">
                  <FaCheckCircle className="text-success w-5 h-5 flex-shrink-0 mt-1" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What's NOT Included */}
          <div className="bg-cream-dark rounded-3xl p-8 border border-cream-border mb-12">
            <h3 className="text-lg font-semibold text-text-primary mb-4">What's NOT Included:</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-text-secondary max-w-2xl mx-auto">
              <div>No setup fees</div>
              <div>No monthly subscriptions</div>
              <div>No per-message charges</div>
              <div>No contracts or commitments</div>
              <div>No hidden costs</div>
            </div>
          </div>

          <p className="text-lg font-semibold text-text-primary mb-8">
            If you don't make money, we don't make money. Simple as that.
          </p>

          <Link
            href="/signup"
            className="inline-block px-10 py-5 bg-gradient-beeline text-white text-lg font-semibold rounded-full hover:scale-105 transition-all shadow-medium"
          >
            Start Selling 24/7 →
          </Link>
        </div>
      </section>

      {/* "One More Thing" - Jobs' signature move */}
      <section className="py-32 px-6 bg-text-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-beeline opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold tracking-wider mb-4 text-white/60">THE PROMISE</p>
          <h2 className="text-5xl sm:text-6xl font-light tracking-tight mb-6">
            Your phone number should work as hard as you do.
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            While you sleep. While you're with another customer. While you're on vacation. Your AI is selling. Your phone number never stops working.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-5 bg-white text-text-primary text-lg font-semibold rounded-full hover:scale-105 transition-all shadow-large"
          >
            Start Selling 24/7 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cream-dark border-t border-cream-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <BeelineLogo size="sm" className="mb-4" />
              <p className="text-sm text-text-secondary max-w-xs font-semibold mb-4">
                Every message answered. Every sale captured.
              </p>
              <p className="text-sm text-text-tertiary max-w-xs">
                Your phone number should work as hard as you do.
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
