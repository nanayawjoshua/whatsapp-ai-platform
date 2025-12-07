import Link from "next/link";
import { FaWhatsapp, FaRocket, FaClock, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { GiHoneypot } from "react-icons/gi";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GiHoneypot className="text-4xl text-beeline-yellow" />
              <span className="text-2xl font-bold text-beeline-black dark:text-dark-text">Beeline</span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/signup" className="btn-primary text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-warm dark:bg-gradient-to-b dark:from-dark-bg dark:to-dark-bg-secondary">
        <div className="section-container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/90 dark:bg-dark-bg-tertiary/90 backdrop-blur-sm shadow-soft px-5 py-2.5 rounded-full mb-6 transition-all duration-300 hover:shadow-medium">
              <GiHoneypot className="text-xl text-beeline-yellow" />
              <span className="text-sm font-semibold text-beeline-black dark:text-dark-text">
                Your AI Employee Lives in Your Phone Number
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-beeline-black dark:text-dark-text mb-6 text-balance leading-tight">
              Never Miss a Sale Again
            </h1>

            <p className="text-lg sm:text-xl text-gray-700 dark:text-dark-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Turn your WhatsApp into a 24/7 AI employee. Answer customers, take orders,
              and close deals while you sleep. Starting from <span className="font-bold text-beeline-black dark:text-beeline-yellow">GHS 49/month</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/signup" className="btn-primary text-lg w-full sm:w-auto">
                <FaWhatsapp className="inline mr-2" />
                Start 7-Day Free Trial
              </Link>
              <a href="#how-it-works" className="btn-secondary text-lg w-full sm:w-auto">
                See How It Works
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-700 dark:text-dark-text-secondary">
              <div className="flex items-center space-x-2 bg-white/60 dark:bg-dark-bg-tertiary/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft">
                <FaClock className="text-beeline-yellow" />
                <span className="font-medium">Setup in 2 minutes</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 dark:bg-dark-bg-tertiary/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft">
                <FaMoneyBillWave className="text-beeline-yellow" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/60 dark:bg-dark-bg-tertiary/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft">
                <FaRocket className="text-beeline-yellow" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gradient-soft dark:bg-dark-bg-secondary">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-beeline-black dark:text-dark-text mb-4">
              The Problem Every Vendor Faces
            </h2>
            <p className="text-lg text-gray-600 dark:text-dark-text-secondary mb-12">Why you're losing sales without even knowing it</p>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-beeline-yellow-light to-beeline-cream dark:from-beeline-yellow/20 dark:to-beeline-yellow/10 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto">
                  😴
                </div>
                <h3 className="font-bold text-lg mb-3 dark:text-dark-text">You Sleep</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">Customer messages at 2am. No response until morning.</p>
              </div>
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-beeline-yellow-light to-beeline-cream dark:from-beeline-yellow/20 dark:to-beeline-yellow/10 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto">
                  💸
                </div>
                <h3 className="font-bold text-lg mb-3 dark:text-dark-text">Sales Lost</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">By morning, they bought from your competitor.</p>
              </div>
              <div className="card p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-beeline-yellow-light to-beeline-cream dark:from-beeline-yellow/20 dark:to-beeline-yellow/10 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto">
                  🔁
                </div>
                <h3 className="font-bold text-lg mb-3 dark:text-dark-text">Repeat Daily</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">Lose 20-30% of potential sales every month.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-dark-bg">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-beeline-black dark:text-dark-text mb-4">
              Meet Your AI Employee
            </h2>
            <p className="text-lg text-gray-600 dark:text-dark-text-secondary leading-relaxed">
              Beeline connects to your WhatsApp number. When customers message you,
              our AI responds instantly - day or night, in English or Twi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="card p-8">
              <div className="bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-medium">
                <FaWhatsapp className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-beeline-black dark:text-dark-text">Use Your Own Number</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                Keep your trusted WhatsApp number. No new SIM, no app to download.
                Your customers message the same number they always have.
              </p>
            </div>

            <div className="card p-8">
              <div className="bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-medium">
                <FaClock className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-beeline-black dark:text-dark-text">24/7 Availability</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                AI responds in under 4 seconds. Answers questions, checks stock,
                takes orders, and processes payments - even at 3am.
              </p>
            </div>

            <div className="card p-8">
              <div className="bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-medium">
                <FaChartLine className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-beeline-black dark:text-dark-text">Smart & Personalized</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                Learns your products, your prices, your style. Speaks Twi and English.
                Remembers customer conversations.
              </p>
            </div>

            <div className="card p-8">
              <div className="bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-medium">
                <FaMoneyBillWave className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-beeline-black">Dirt Cheap</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                From GHS 49/month flat. No per-message fees. Cheaper than hiring anyone.
                Pays for itself with just 5-10 extra sales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 bg-gradient-soft">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-beeline-black dark:text-dark-text mb-4">
              Get Started in 2 Minutes
            </h2>
            <p className="text-lg text-gray-600">Three simple steps to your AI employee</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="card p-8 flex gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-medium">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-beeline-black">Sign Up</h3>
                  <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                    Enter your name, phone number, and what you sell. Takes 30 seconds.
                  </p>
                </div>
              </div>

              <div className="card p-8 flex gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-medium">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-beeline-black">Scan QR Code</h3>
                  <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                    Open WhatsApp, scan the QR code we show you. Your AI employee connects to your number.
                  </p>
                </div>
              </div>

              <div className="card p-8 flex gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-medium">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 text-beeline-black">You're Live!</h3>
                  <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                    That's it. Your AI employee is now handling customers 24/7.
                    You'll get notifications for important stuff.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white dark:bg-dark-bg">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-beeline-black dark:text-dark-text mb-4">
              Simple, Honest Pricing
            </h2>
            <p className="text-lg text-gray-600">
              One price. Everything included. No surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Personal Tier */}
            <div className="card p-8 hover:shadow-hover transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2 text-beeline-black dark:text-dark-text">Personal</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-4xl font-bold text-beeline-yellow">GHS 49</span>
                  <span className="text-gray-600 dark:text-dark-text-secondary font-medium">/month</span>
                </div>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-6 text-sm">Your AI Assistant</p>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Proactive reminders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Message drafting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Schedule management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Context-aware responses</span>
                  </li>
                </ul>

                <Link href="/signup" className="btn-secondary w-full text-center block">
                  Get Started
                </Link>
              </div>
            </div>

            {/* Business Tier */}
            <div className="card p-8 border-2 border-beeline-yellow relative overflow-hidden hover:shadow-hover transition-all duration-300 transform md:scale-105">
              <div className="absolute top-0 right-0 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg shadow-medium">
                POPULAR
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2 text-beeline-black dark:text-dark-text">Business</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-beeline-yellow to-beeline-yellow-dark bg-clip-text text-transparent">GHS 99</span>
                  <span className="text-gray-600 dark:text-dark-text-secondary font-medium">/month</span>
                </div>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-6 text-sm">Your AI Employee</p>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">24/7 customer service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Product catalog</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Order handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Voice-trained personality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">English & Twi support</span>
                  </li>
                </ul>

                <Link href="/signup" className="btn-primary w-full text-center block">
                  Start Free Trial
                </Link>
              </div>
            </div>

            {/* Enterprise Tier */}
            <div className="card p-8 hover:shadow-hover transition-all duration-300">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2 text-beeline-black dark:text-dark-text">Enterprise</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-4xl font-bold text-beeline-yellow">GHS 599+</span>
                  <span className="text-gray-600 dark:text-dark-text-secondary font-medium">/month</span>
                </div>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-6 text-sm">Scale Without Limits</p>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Everything in Business</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Multi-location dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Unlimited team members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-dark-text-secondary text-sm leading-relaxed">Priority support</span>
                  </li>
                </ul>

                <Link href="/signup" className="btn-secondary w-full text-center block">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
              <strong>Enterprise Tiers:</strong> Up to 5 locations (GHS 599) • Up to 12 locations (GHS 999) • Up to 25 locations (GHS 1,499) • Up to 60 locations (GHS 2,999)
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
              Add unlimited locations within your tier - no extra charges!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-beeline-black dark:bg-dark-bg text-white">
        <div className="section-container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Stop Losing Sales?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of Ghanaian vendors already making more money with Beeline.
          </p>
          <Link href="/signup" className="btn-primary text-lg inline-block">
            <FaWhatsapp className="inline mr-2" />
            Get Your AI Employee Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <GiHoneypot className="text-3xl text-beeline-yellow" />
              <span className="text-xl font-bold text-white">Beeline</span>
            </div>
            <div className="text-center md:text-right">
              <p>© 2025 Beeline Ghana. Built with Honey in Accra.</p>
              <p className="text-sm mt-2">
                Powered by Beeline 🐝
              </p>
              <p className="text-sm mt-1 text-gray-500">
                Building Africa's commerce graph — one message at a time
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}