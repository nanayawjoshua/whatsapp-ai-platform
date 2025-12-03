import Link from "next/link";
import { FaWhatsapp, FaRocket, FaClock, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { GiHoneypot } from "react-icons/gi";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GiHoneypot className="text-4xl text-beeline-yellow" />
              <span className="text-2xl font-bold text-beeline-black">Beeline</span>
            </div>
            <Link href="/signup" className="btn-primary text-sm sm:text-base py-2 sm:py-3 px-4 sm:px-6">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-beeline-gray to-white">
        <div className="section-container">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-beeline-yellow/20 px-4 py-2 rounded-full mb-6">
              <GiHoneypot className="text-xl text-beeline-yellow" />
              <span className="text-sm font-semibold text-beeline-black">
                Your AI Employee Lives in Your Phone Number
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-beeline-black mb-6 text-balance">
              Never Miss a Sale Again
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Turn your WhatsApp into a 24/7 AI employee. Answer customers, take orders,
              and close deals while you sleep. For just <span className="font-bold text-beeline-black">GHS 99/month</span>.
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

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FaClock className="text-beeline-yellow" />
                <span>Setup in 2 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaMoneyBillWave className="text-beeline-yellow" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaRocket className="text-beeline-yellow" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-beeline-black mb-6">
              The Problem Every Vendor Faces
            </h2>
            <div className="grid sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-5xl mb-4">Sleeping Face</div>
                <h3 className="font-semibold text-lg mb-2">You Sleep</h3>
                <p className="text-gray-600">Customer messages at 2am. No response until morning.</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">Money with Wings</div>
                <h3 className="font-semibold text-lg mb-2">Sales Lost</h3>
                <p className="text-gray-600">By morning, they bought from your competitor.</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">Repeat</div>
                <h3 className="font-semibold text-lg mb-2">Repeat Daily</h3>
                <p className="text-gray-600">Lose 20-30% of potential sales every month.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-20 bg-beeline-gray">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-beeline-black mb-6">
              Meet Your AI Employee
            </h2>
            <p className="text-lg text-gray-600">
              Beeline connects to your WhatsApp number. When customers message you,
              our AI responds instantly - day or night, in English or Twi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="bg-beeline-yellow/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <FaWhatsapp className="text-2xl text-beeline-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Use Your Own Number</h3>
              <p className="text-gray-600">
                Keep your trusted WhatsApp number. No new SIM, no app to download.
                Your customers message the same number they always have.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="bg-beeline-yellow/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <FaClock className="text-2xl text-beeline-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Availability</h3>
              <p className="text-gray-600">
                AI responds in under 4 seconds. Answers questions, checks stock,
                takes orders, and processes payments - even at 3am.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="bg-beeline-yellow/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <FaChartLine className="text-2xl text-beeline-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart & Personalized</h3>
              <p className="text-gray-600">
                Learns your products, your prices, your style. Speaks Twi and English.
                Remembers customer conversations.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="bg-beeline-yellow/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <FaMoneyBillWave className="text-2xl text-beeline-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dirt Cheap</h3>
              <p className="text-gray-600">
                GHS 99/month flat. No per-message fees. Cheaper than hiring anyone.
                Pay for itself with just 5-10 extra sales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-beeline-black mb-6">
              Get Started in 2 Minutes
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-beeline-yellow rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Sign Up</h3>
                  <p className="text-gray-600">
                    Enter your name, phone number, and what you sell. Takes 30 seconds.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-beeline-yellow rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Scan QR Code</h3>
                  <p className="text-gray-600">
                    Open WhatsApp, scan the QR code we show you. Your AI employee connects to your number.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-beeline-yellow rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">You're Live!</h3>
                  <p className="text-gray-600">
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
      <section className="py-20 bg-beeline-gray">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-beeline-black mb-6">
              Simple, Honest Pricing
            </h2>
            <p className="text-lg text-gray-600">
              One price. Everything included. No surprises.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-beeline-yellow">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">AI Employee</h3>
                <div className="flex items-baseline justify-center gap-2 mb-6">
                  <span className="text-5xl font-bold">GHS 99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-gray-600 mb-8">or $9 USD</p>

                <ul className="text-left space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <span className="text-beeline-yellow text-xl">Checkmark</span>
                    <span>Unlimited messages & conversations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-beeline-yellow text-xl">Checkmark</span>
                    <span>24/7 availability, no breaks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-beeline-yellow text-xl">Checkmark</span>
                    <span>English & Twi support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-beeline-yellow text-xl">Checkmark</span>
                    <span>Your own WhatsApp number</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-beeline-yellow text-xl">Checkmark</span>
                    <span>7-day free trial</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-beeline-yellow text-xl">Checkmark</span>
                    <span>Cancel anytime</span>
                  </li>
                </ul>

                <Link href="/signup" className="btn-primary w-full text-center block text-lg">
                  Start Free Trial
                </Link>

                <p className="text-sm text-gray-500 mt-4">
                  No credit card required for trial
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-beeline-black text-white">
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
                Making African vendors unstoppable.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}