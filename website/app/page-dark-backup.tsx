'use client';

import Link from "next/link";
import { FaWhatsapp, FaRocket, FaClock, FaShieldAlt, FaLock, FaGlobe, FaCheckCircle } from "react-icons/fa";
import { MdQrCode2, MdPsychology, MdFlashOn, MdBarChart, MdNightlight } from "react-icons/md";
import BeelineLogo from "./components/BeelineLogo";

export default function HomeDark() {
  return (
    <main className="min-h-screen bg-dark-bg">
      {/* Sticky Glass Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <BeelineLogo size="md" />

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#pricing" className="text-dark-text-secondary hover:text-dark-text transition-colors">
                Pricing
              </a>
              <a href="#enterprise" className="text-dark-text-secondary hover:text-dark-text transition-colors">
                Enterprise
              </a>
              <a href="#business" className="text-dark-text-secondary hover:text-dark-text transition-colors">
                Business
              </a>
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-4 py-2 bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg text-beeline-yellow hover:bg-dark-bg-tertiary/80 hover:border-beeline-yellow/30 transition-all"
              >
                Dashboard
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden text-dark-text">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20">
        {/* Gradient Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-bg pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-dark-glow blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Hero Headline */}
          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-8 text-dark-text">
            Your WhatsApp.
            <br />
            <span className="bg-gradient-beeline bg-clip-text text-transparent">
              But brilliant.
            </span>
          </h1>

          {/* The Explanation - Tiny, Understated */}
          <p className="text-xl text-dark-text-secondary mb-12 font-light">
            Beeline turns every message into an opportunity.
            <br />
            While you focus on what matters.
          </p>

          {/* Single CTA - No clutter */}
          <Link href="/signup" className="inline-block px-12 py-5 bg-gradient-beeline text-black text-lg font-semibold rounded-full hover:scale-105 transition-transform">
            See it work →
          </Link>

          {/* The Proof - Subtle social proof */}
          <p className="mt-12 text-sm text-dark-text-tertiary">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
            847 businesses using Beeline right now
          </p>

          {/* Demo Screenshot Card - Real WhatsApp Experience */}
          <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-4 max-w-4xl mx-auto shadow-glow hover:shadow-glow hover:border-beeline-yellow/50 transition-all duration-300 animate-float">
            <div className="aspect-video bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-lg overflow-hidden border border-dark-border flex items-center justify-center relative">
              {/* WhatsApp Chat UI Mockup */}
              <div className="w-full h-full flex flex-col bg-gradient-to-b from-dark-bg-secondary/80 to-dark-bg-tertiary/80 p-6">
                {/* Chat Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-dark-border">
                  <div className="w-10 h-10 rounded-full bg-gradient-beeline flex items-center justify-center">
                    <span className="text-black font-bold">S</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-dark-text">Sarah's Store</p>
                    <p className="text-xs text-dark-text-tertiary">Active now</p>
                  </div>
                </div>
                {/* Messages */}
                <div className="flex-1 overflow-hidden py-4 space-y-4">
                  {/* Customer Message */}
                  <div className="flex justify-start">
                    <div className="bg-dark-bg-tertiary/60 text-dark-text-secondary px-4 py-2 rounded-2xl rounded-tl text-sm max-w-xs">
                      Hi, do you have the blue necklace in stock?
                    </div>
                  </div>
                  {/* AI Response */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-beeline text-black px-4 py-2 rounded-2xl rounded-tr text-sm max-w-xs">
                      Yes! We have 3 in stock. Send you details? 💎
                    </div>
                  </div>
                  {/* Customer */}
                  <div className="flex justify-start">
                    <div className="bg-dark-bg-tertiary/60 text-dark-text-secondary px-4 py-2 rounded-2xl rounded-tl text-sm max-w-xs">
                      Perfect! How much?
                    </div>
                  </div>
                  {/* AI */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-beeline text-black px-4 py-2 rounded-2xl rounded-tr text-sm max-w-xs">
                      GHS 89. Ready to order? 🛍
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-dark-text-tertiary text-sm mt-3">This happens while Sarah sleeps.</p>
          </div>
        </div>
      </section>



      {/* 3-Step Process */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-16 text-dark-text">
            60 seconds. That's it.
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 mb-6 inline-flex items-center justify-center w-24 h-24 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow transition-all">
                <MdQrCode2 className="w-12 h-12 text-beeline-yellow" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-dark-text">Scan.</h3>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 mb-6 inline-flex items-center justify-center w-24 h-24 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow transition-all">
                <MdPsychology className="w-12 h-12 text-beeline-yellow" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-dark-text">Choose.</h3>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 mb-6 inline-flex items-center justify-center w-24 h-24 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow transition-all">
                <FaRocket className="w-12 h-12 text-beeline-yellow" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-dark-text">Sell.</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Sarah's Story */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-dark-text mb-4">
              Meet Sarah. She sells jewelry.
            </h2>
            <p className="text-dark-text-secondary">
              Last month, Beeline handled 412 conversations. While Sarah handled life.
            </p>
          </div>

          <div className="space-y-8">
            {/* Story Point 1 */}
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 w-1/3">
                {/* Replace with an actual screenshot of a WhatsApp conversation */}
                <div className="aspect-square bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-lg border border-dark-border flex items-center justify-center">
                  <FaWhatsapp className="w-12 h-12 text-beeline-yellow/30" />
                </div>
              </div>
              <div className="w-2/3">
                <h3 className="text-2xl font-semibold text-dark-text mb-2">This is a customer at 3am.</h3>
                <p className="text-dark-text-secondary">
                  They want to know if a necklace is in stock. Sarah is asleep.
                </p>
              </div>
            </div>

            {/* Story Point 2 */}
            <div className="flex items-center gap-8 flex-row-reverse">
              <div className="flex-shrink-0 w-1/3">
                {/* Replace with a screenshot of the AI responding */}
                <div className="aspect-square bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-lg border border-dark-border flex items-center justify-center">
                  <MdPsychology className="w-12 h-12 text-beeline-yellow/30" />
                </div>
              </div>
              <div className="w-2/3 text-right">
                <h3 className="text-2xl font-semibold text-dark-text mb-2">This is her AI, Beeline.</h3>
                <p className="text-dark-text-secondary">
                  It instantly confirms the necklace is available and offers to take the order.
                </p>
              </div>
            </div>

            {/* Story Point 3 */}
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 w-1/3">
                {/* Replace with a screenshot of the order confirmation */}
                <div className="aspect-square bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-lg border border-dark-border flex items-center justify-center">
                  <FaCheckCircle className="w-12 h-12 text-beeline-yellow/30" />
                </div>
              </div>
              <div className="w-2/3">
                <h3 className="text-2xl font-semibold text-dark-text mb-2">This is a sale.</h3>
                <p className="text-dark-text-secondary">
                  A sale that Sarah would have missed. Beeline just closed it for her.
                </p>
              </div>
            </div>
            
            {/* Story Point 4 */}
            <div className="flex items-center gap-8 flex-row-reverse">
              <div className="flex-shrink-0 w-1/3">
                {/* Replace with a screenshot of a simple analytics dashboard */}
                <div className="aspect-square bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-lg border border-dark-border flex items-center justify-center">
                  <MdBarChart className="w-12 h-12 text-beeline-yellow/30" />
                </div>
              </div>
              <div className="w-2/3 text-right">
                <h3 className="text-2xl font-semibold text-dark-text mb-2">This is Sarah, winning.</h3>
                <p className="text-dark-text-secondary">
                  While she sleeps, her business grows. That's the power of Beeline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* One More Thing - Jobs-style */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-dark-bg-secondary/30 to-dark-bg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-glass-bg backdrop-blur-xl border border-glass-border rounded-full px-6 py-2 mb-8">
            <p className="text-beeline-yellow text-sm font-semibold">One more thing...</p>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-light text-dark-text mb-8 leading-tight">
            Beeline works in
            <br />
            <span className="bg-gradient-beeline bg-clip-text text-transparent">
              any language.
            </span>
          </h2>
          
          <p className="text-xl text-dark-text-secondary mb-12 font-light max-w-2xl mx-auto">
            Whether your customers speak English, Twi, Ga, or Ewe—Beeline understands them all. 
            <br />It responds in their language. Naturally.
          </p>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <span className="inline-block px-6 py-2 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-full text-dark-text-secondary text-sm">🇬🇭 Twi</span>
            <span className="inline-block px-6 py-2 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-full text-dark-text-secondary text-sm">🇬🇭 Ga</span>
            <span className="inline-block px-6 py-2 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-full text-dark-text-secondary text-sm">🇬🇭 Ewe</span>
            <span className="inline-block px-6 py-2 bg-glass-bg backdrop-blur-xl border border-glass-border rounded-full text-dark-text-secondary text-sm">🌍 50+ languages</span>
          </div>
          
          <div className="mt-16">
            <Link href="/signup" className="inline-block px-12 py-5 bg-gradient-beeline text-black text-lg font-semibold rounded-full hover:scale-105 transition-transform shadow-glow">
              See the magic →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light text-dark-text mb-4">
            Choose your plan.
          </h2>
          <p className="text-dark-text-secondary mb-16">
            Start with a free 14-day trial. No credit card required.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Personal Tier */}
            <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow hover:scale-105 transition-all">
              <h3 className="text-2xl font-semibold text-dark-text mb-4">Personal</h3>
              <p className="text-5xl font-bold text-dark-text mb-8">GHS 49</p>
              <Link
                href="/signup"
                className="block w-full text-center px-6 py-3 bg-gradient-beeline text-black font-semibold rounded-lg shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all"
              >
                Start free trial
              </Link>
            </div>

            {/* Business Tier */}
            <div className="bg-glass-bg backdrop-blur-xl border-2 border-beeline-yellow/30 rounded-2xl p-8 shadow-glow relative overflow-hidden hover:shadow-glow-lg hover:scale-105 transition-all">
              <div className="absolute top-4 right-4 bg-gradient-beeline text-black text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <h3 className="text-2xl font-semibold text-dark-text mb-4">Business</h3>
              <p className="text-5xl font-bold text-dark-text mb-8">GHS 99</p>
              <Link
                href="/signup"
                className="block w-full text-center px-6 py-3 bg-gradient-beeline text-black font-semibold rounded-lg shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all"
              >
                Start free trial
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow hover:scale-105 transition-all">
              <h3 className="text-2xl font-semibold text-dark-text mb-4">Enterprise</h3>
              <p className="text-5xl font-bold text-dark-text mb-8">Let's talk.</p>
              <Link
                href="/contact-sales"
                className="block w-full text-center px-6 py-3 bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg text-beeline-yellow hover:bg-dark-bg-tertiary/80 hover:border-beeline-yellow/30 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          <div className="mt-16">
            <a href="/compare-plans" className="text-beeline-yellow hover:underline">
              Compare all plans →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-dark-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-dark-text">Product</h4>
              <ul className="space-y-2 text-dark-text-secondary text-sm">
                <li><a href="#" className="hover:text-dark-text transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-dark-text transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-dark-text transition-colors">API</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4 text-dark-text">Company</h4>
              <ul className="space-y-2 text-dark-text-secondary text-sm">
                <li><a href="#" className="hover:text-dark-text transition-colors">About</a></li>
                <li><a href="#" className="hover:text-dark-text transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-dark-text transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4 text-dark-text">Resources</h4>
              <ul className="space-y-2 text-dark-text-secondary text-sm">
                <li><a href="#" className="hover:text-dark-text transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-dark-text transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-dark-text transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-dark-text">Legal</h4>
              <ul className="space-y-2 text-dark-text-secondary text-sm">
                <li><a href="#" className="hover:text-dark-text transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-dark-text transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-dark-text transition-colors">Security</a></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4 text-dark-text">Social</h4>
              <ul className="space-y-2 text-dark-text-secondary text-sm">
                <li><a href="#" className="hover:text-dark-text transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-dark-text transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-dark-text transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-dark-border flex flex-col md:flex-row justify-between items-center gap-4">
            <BeelineLogo size="sm" />
            <p className="text-dark-text-tertiary text-sm">© 2025 Beeline. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .shadow-glow {
          box-shadow: 0 0 40px rgba(249, 199, 79, 0.4), 0 0 20px rgba(243, 114, 44, 0.2);
        }
        .shadow-glow-lg {
          box-shadow: 0 0 60px rgba(249, 199, 79, 0.5), 0 0 30px rgba(243, 114, 44, 0.3);
        }
      `}</style>
    </main>
  );
}
