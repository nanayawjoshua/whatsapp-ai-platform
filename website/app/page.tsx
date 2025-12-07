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
                <path strokeLinecap="round" strokeLinejoin="width" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6 bg-gradient-beeline bg-clip-text text-transparent">
            AI-Powered WhatsApp<br />Assistant for Your Business
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            Automate conversations, boost sales 24/7, and deliver exceptional customer service with intelligent AI agents tailored to your business.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-beeline text-black font-semibold rounded-xl shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all"
            >
              <MdFlashOn className="w-5 h-5" />
              Get Started - Personal
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-glass-bg backdrop-blur-md border border-glass-border rounded-xl text-beeline-yellow hover:bg-dark-bg-tertiary/80 hover:border-beeline-yellow/30 transition-all"
            >
              <FaWhatsapp className="w-5 h-5" />
              Start Free Trial - Business
            </Link>
          </div>

          {/* Demo Screenshot Card */}
          <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-4 max-w-4xl mx-auto shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow transition-all duration-300 animate-float">
            <div className="aspect-video bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-lg overflow-hidden border border-dark-border flex items-center justify-center">
              {/* Placeholder for WhatsApp Chat Screenshot */}
              <div className="text-center">
                <FaWhatsapp className="w-24 h-24 text-beeline-yellow/30 mx-auto mb-4" />
                <p className="text-dark-text-tertiary">WhatsApp AI Chat Demo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Banner */}
      <section className="py-12 px-6 border-y border-dark-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {/* Trust Badges */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-beeline-yellow/5 border border-beeline-yellow/20 rounded-lg text-dark-text-secondary text-sm">
              <FaShieldAlt className="w-4 h-4 text-beeline-yellow" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-beeline-yellow/5 border border-beeline-yellow/20 rounded-lg text-dark-text-secondary text-sm">
              <FaCheckCircle className="w-4 h-4 text-beeline-yellow" />
              <span>WhatsApp Business API</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-beeline-yellow/5 border border-beeline-yellow/20 rounded-lg text-dark-text-secondary text-sm">
              <FaLock className="w-4 h-4 text-beeline-yellow" />
              <span>End-to-End Encrypted</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-beeline-yellow/5 border border-beeline-yellow/20 rounded-lg text-dark-text-secondary text-sm">
              <FaGlobe className="w-4 h-4 text-beeline-yellow" />
              <span>GDPR Compliant</span>
            </div>

            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-4 text-dark-text">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-center text-dark-text-secondary mb-16 max-w-2xl mx-auto">
            Set up your AI assistant in minutes, not hours
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 mb-6 inline-flex items-center justify-center w-24 h-24 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow transition-all">
                <MdQrCode2 className="w-12 h-12 text-beeline-yellow" />
              </div>
              <div className="text-beeline-yellow font-mono text-sm mb-2">STEP 01</div>
              <h3 className="text-2xl font-semibold mb-3 text-dark-text">Connect WhatsApp</h3>
              <p className="text-dark-text-secondary leading-relaxed">
                Scan QR code to link your WhatsApp Business account securely in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 mb-6 inline-flex items-center justify-center w-24 h-24 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow transition-all">
                <MdPsychology className="w-12 h-12 text-beeline-yellow" />
              </div>
              <div className="text-beeline-yellow font-mono text-sm mb-2">STEP 02</div>
              <h3 className="text-2xl font-semibold mb-3 text-dark-text">Choose AI Personality</h3>
              <p className="text-dark-text-secondary leading-relaxed">
                Customize your AI assistant's tone, expertise, and personality to match your brand.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 mb-6 inline-flex items-center justify-center w-24 h-24 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow transition-all">
                <FaRocket className="w-12 h-12 text-beeline-yellow" />
              </div>
              <div className="text-beeline-yellow font-mono text-sm mb-2">STEP 03</div>
              <h3 className="text-2xl font-semibold mb-3 text-dark-text">Go Live</h3>
              <p className="text-dark-text-secondary leading-relaxed">
                Your AI assistant starts handling customer conversations 24/7 instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-dark-bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-4 text-dark-text">
            Powerful Features for Modern Businesses
          </h2>
          <p className="text-center text-dark-text-secondary mb-16 max-w-2xl mx-auto">
            Everything you need to automate customer conversations and scale your business on WhatsApp.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow hover:-translate-y-1 transition-all">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-xl bg-beeline-yellow/20 border border-beeline-yellow/20 flex items-center justify-center mb-4">
                  <MdFlashOn className="w-8 h-8 text-beeline-yellow" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-dark-text">Real-time AI Responses</h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Instant, intelligent replies to customer inquiries powered by advanced AI models.
                </p>
              </div>
              <div className="aspect-video bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-lg border border-dark-border flex items-center justify-center">
                <FaWhatsapp className="w-12 h-12 text-beeline-yellow/30" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow hover:-translate-y-1 transition-all">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-xl bg-beeline-yellow/20 border border-beeline-yellow/20 flex items-center justify-center mb-4">
                  <FaClock className="w-8 h-8 text-beeline-yellow" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-dark-text">24/7 Support</h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Never miss a customer. Your AI assistant works around the clock, every day.
                </p>
              </div>
              <div className="aspect-video bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-lg border border-dark-border flex items-center justify-center">
                <MdNightlight className="w-12 h-12 text-beeline-yellow/30" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow hover:-translate-y-1 transition-all">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-xl bg-beeline-yellow/20 border border-beeline-yellow/20 flex items-center justify-center mb-4">
                  <MdPsychology className="w-8 h-8 text-beeline-yellow" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-dark-text">Custom Personalities</h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Create unique AI personalities that reflect your brand voice and values.
                </p>
              </div>
              <div className="aspect-video bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-lg border border-dark-border flex items-center justify-center">
                <MdPsychology className="w-12 h-12 text-beeline-yellow/30" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow hover:-translate-y-1 transition-all">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-xl bg-beeline-yellow/20 border border-beeline-yellow/20 flex items-center justify-center mb-4">
                  <MdBarChart className="w-8 h-8 text-beeline-yellow" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-dark-text">Analytics & Insights</h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Track conversations, customer satisfaction, and business metrics in real-time.
                </p>
              </div>
              <div className="aspect-video bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-lg border border-dark-border flex items-center justify-center">
                <MdBarChart className="w-12 h-12 text-beeline-yellow/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-4 text-dark-text">
            Simple, Transparent Pricing
          </h2>
          <p className="text-center text-dark-text-secondary mb-16 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs. All plans include core AI features.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Personal Tier */}
            <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow hover:scale-105 transition-all">
              <div className="text-beeline-yellow font-mono text-sm mb-2">PERSONAL</div>
              <h3 className="text-4xl font-bold mb-2 text-dark-text">GHS 49</h3>
              <p className="text-dark-text-secondary mb-6">per month</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>1 WhatsApp Number</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>Basic AI Personality</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>500 Messages/Month</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>Email Support</span>
                </li>
              </ul>

              <Link
                href="/signup"
                className="block w-full text-center px-6 py-3 bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg text-beeline-yellow hover:bg-dark-bg-tertiary/80 hover:border-beeline-yellow/30 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Business Tier */}
            <div className="bg-glass-bg backdrop-blur-xl border-2 border-beeline-yellow/30 rounded-2xl p-8 shadow-glow relative overflow-hidden hover:shadow-glow-lg hover:scale-105 transition-all">
              <div className="absolute top-4 right-4 bg-gradient-beeline text-black text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="text-beeline-yellow font-mono text-sm mb-2">BUSINESS</div>
              <h3 className="text-4xl font-bold mb-2 text-dark-text">GHS 99</h3>
              <p className="text-dark-text-secondary mb-6">per month</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>3 WhatsApp Numbers</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>Custom AI Personalities</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>2,000 Messages/Month</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>Analytics Dashboard</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>Priority Support</span>
                </li>
              </ul>

              <Link
                href="/signup"
                className="block w-full text-center px-6 py-3 bg-gradient-beeline text-black font-semibold rounded-lg shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 shadow-glass hover:border-beeline-yellow/30 hover:shadow-glow hover:scale-105 transition-all">
              <div className="text-beeline-yellow font-mono text-sm mb-2">ENTERPRISE</div>
              <h3 className="text-4xl font-bold mb-2 text-dark-text">GHS 299</h3>
              <p className="text-dark-text-secondary mb-6">per month</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>Unlimited Numbers</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>Advanced AI + Voice</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>Unlimited Messages</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>Advanced Analytics</span>
                </li>
                <li className="flex items-center gap-2 text-dark-text-secondary">
                  <FaCheckCircle className="w-5 h-5 text-beeline-yellow flex-shrink-0" />
                  <span>Dedicated Support</span>
                </li>
              </ul>

              <Link
                href="/signup"
                className="block w-full text-center px-6 py-3 bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg text-beeline-yellow hover:bg-dark-bg-tertiary/80 hover:border-beeline-yellow/30 transition-all"
              >
                Contact Sales
              </Link>
            </div>
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
      `}</style>
    </main>
  );
}
