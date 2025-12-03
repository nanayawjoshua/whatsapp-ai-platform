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
    <div className="min-h-screen bg-gradient-to-b from-beeline-yellow/20 to-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
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
        <div className="w-24 h-24 bg-beeline-yellow rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <FaGift className="text-5xl text-beeline-black" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-beeline-black mb-6">
          You've Been Invited! 🎉
        </h1>

        <p className="text-xl sm:text-2xl text-gray-700 mb-4">
          A fellow vendor thinks you'd love Beeline
        </p>

        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          They're using Beeline to handle customers 24/7 with an AI employee on WhatsApp.
          Now it's your turn!
        </p>

        {/* Benefits */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12 max-w-2xl mx-auto border-4 border-beeline-yellow">
          <h2 className="text-2xl font-bold text-beeline-black mb-6">
            Your Special Offer
          </h2>

          <div className="space-y-4 text-left mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-beeline-yellow/20 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">7 Days Completely Free</h3>
                <p className="text-gray-600">
                  Full access to everything. No credit card needed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-beeline-yellow/20 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Setup in 2 Minutes</h3>
                <p className="text-gray-600">
                  Scan a QR code with WhatsApp and you're live.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-beeline-yellow/20 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✓</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Your Referrer Gets 7 Days Free</h3>
                <p className="text-gray-600">
                  When you sign up, vendor <span className="font-mono bg-beeline-yellow/30 px-2 py-1 rounded">{referrerId}</span> gets 7 extra days free!
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
        <div className="bg-beeline-gray rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-beeline-black mb-6">
            What You Get with Beeline
          </h3>

          <div className="grid sm:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="font-bold text-lg mb-2">🤖 24/7 AI Employee</h4>
              <p className="text-gray-600 text-sm">
                Answers customers instantly, even at 3am
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2">💬 English & Twi</h4>
              <p className="text-gray-600 text-sm">
                Speaks naturally with your customers
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2">📱 Your WhatsApp Number</h4>
              <p className="text-gray-600 text-sm">
                No new number needed - use what you have
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2">💰 Just GHS 99/month</h4>
              <p className="text-gray-600 text-sm">
                Cheaper than hiring anyone
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2">🛒 Takes Orders</h4>
              <p className="text-gray-600 text-sm">
                Handles product questions & orders
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-2">🚫 Cancel Anytime</h4>
              <p className="text-gray-600 text-sm">
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