'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GiHoneypot } from 'react-icons/gi';
import { FaWhatsapp, FaGift } from 'react-icons/fa';

function ReferralContent() {
  const searchParams = useSearchParams();
  const referrerId = searchParams.get('ref') || 'vendor';

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <GiHoneypot className="text-4xl text-beeline-yellow" />
              <span className="text-2xl font-bold text-beeline-black">Beeline</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        {/* Gift Icon */}
        <div className="w-28 h-28 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-hover">
          <FaGift className="text-6xl text-white" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-beeline-black mb-6 leading-tight">
          You've Been Invited! 🎉
        </h1>

        <p className="text-xl sm:text-2xl text-gray-800 mb-4 font-semibold">
          A fellow vendor thinks you'd love Beeline
        </p>

        <p className="text-lg text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
          They're using Beeline to handle customers 24/7 with an AI employee on WhatsApp.
          Now it's your turn!
        </p>

        {/* Benefits */}
        <div className="card p-10 mb-12 max-w-2xl mx-auto border-2 border-beeline-yellow relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg shadow-medium">
            SPECIAL INVITE
          </div>
          <h2 className="text-2xl font-bold text-beeline-black mb-6">
            Your Special Offer
          </h2>

          <div className="space-y-6 text-left mb-8">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-beeline-yellow-light to-beeline-cream rounded-xl transition-all duration-300 hover:shadow-medium">
              <div className="bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-medium">
                <span className="text-2xl text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-beeline-black">7 Days Completely Free</h3>
                <p className="text-gray-600 leading-relaxed">
                  Full access to everything. No credit card needed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-beeline-yellow-light to-beeline-cream rounded-xl transition-all duration-300 hover:shadow-medium">
              <div className="bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-medium">
                <span className="text-2xl text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-beeline-black">Setup in 2 Minutes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Scan a QR code with WhatsApp and you're live.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-beeline-yellow-light to-beeline-cream rounded-xl transition-all duration-300 hover:shadow-medium">
              <div className="bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-medium">
                <span className="text-2xl text-white font-bold">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 text-beeline-black">Your Referrer Gets 7 Days Free</h3>
                <p className="text-gray-600 leading-relaxed">
                  When you sign up, vendor <span className="font-mono bg-beeline-yellow px-2 py-1 rounded shadow-soft">{referrerId}</span> gets 7 extra days free!
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/signup?ref=${referrerId}`}
            className="btn-primary w-full text-lg flex items-center justify-center gap-2"
          >
            <FaWhatsapp className="text-2xl" />
            Claim Your Free Trial
          </Link>
        </div>

        {/* What You Get */}
        <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto shadow-soft">
          <h3 className="text-2xl font-bold text-beeline-black mb-8">
            What You Get with Beeline
          </h3>

          <div className="grid sm:grid-cols-2 gap-5 text-left">
            <div className="p-4 bg-gradient-to-br from-beeline-cream to-white rounded-xl border border-beeline-yellow/20 hover:shadow-medium transition-all duration-300">
              <h4 className="font-bold text-lg mb-2 text-beeline-black">🤖 24/7 AI Employee</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Answers customers instantly, even at 3am
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-beeline-cream to-white rounded-xl border border-beeline-yellow/20 hover:shadow-medium transition-all duration-300">
              <h4 className="font-bold text-lg mb-2 text-beeline-black">💬 English & Twi</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Speaks naturally with your customers
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-beeline-cream to-white rounded-xl border border-beeline-yellow/20 hover:shadow-medium transition-all duration-300">
              <h4 className="font-bold text-lg mb-2 text-beeline-black">📱 Your WhatsApp Number</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                No new number needed - use what you have
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-beeline-cream to-white rounded-xl border border-beeline-yellow/20 hover:shadow-medium transition-all duration-300">
              <h4 className="font-bold text-lg mb-2 text-beeline-black">💰 Just GHS 99/month</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Cheaper than hiring anyone
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-beeline-cream to-white rounded-xl border border-beeline-yellow/20 hover:shadow-medium transition-all duration-300">
              <h4 className="font-bold text-lg mb-2 text-beeline-black">🛒 Takes Orders</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Handles product questions & orders
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-beeline-cream to-white rounded-xl border border-beeline-yellow/20 hover:shadow-medium transition-all duration-300">
              <h4 className="font-bold text-lg mb-2 text-beeline-black">🚫 Cancel Anytime</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                No long-term commitment required
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-gray-600">
          <p className="mb-2">Trusted by hundreds of vendors across Ghana</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span>🐝 Built in Accra</span>
            <span>•</span>
            <span>⚡ &lt;4s Response Time</span>
            <span>•</span>
            <span>🔒 Secure & Private</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-beeline-black text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GiHoneypot className="text-3xl text-beeline-yellow" />
            <span className="text-xl font-bold">Beeline</span>
          </div>
          <p className="text-gray-400">
            &copy; 2025 Beeline Ghana. Making vendors unstoppable.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ReferralPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReferralContent />
    </Suspense>
  );
}