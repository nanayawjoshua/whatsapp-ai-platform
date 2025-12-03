'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GiHoneypot } from 'react-icons/gi';
import { FaMobileAlt, FaCreditCard, FaCheckCircle } from 'react-icons/fa';

function PaymentContent() {
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const vendorId = searchParams.get('vendor');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId,
          paymentMethod,
          phone: paymentMethod === 'momo' ? phone : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Payment initiation failed');
      }

      const { checkoutUrl } = await response.json();

      // Redirect to Hubtel payment page
      window.location.href = checkoutUrl;
    } catch (err) {
      setError('Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Invalid payment link</p>
        <Link href="/" className="text-beeline-yellow underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-beeline-gray to-white">
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
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-beeline-yellow p-6 text-center">
            <h1 className="text-3xl font-bold text-beeline-black mb-2">
              Complete Your Subscription
            </h1>
            <p className="text-beeline-black/80">
              Continue with your AI employee for just GHS 99/month
            </p>
          </div>

          <div className="p-8">
            {/* Trial Info */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Your 7-day trial has ended.</strong> To continue using your AI employee,
                please complete the payment below.
              </p>
            </div>

            {/* What You Get */}
            <div className="mb-8">
              <h3 className="font-bold text-lg mb-4">What You Get:</h3>
              <div className="space-y-3">
                {[
                  'Unlimited WhatsApp messages',
                  '24/7 AI availability',
                  'English & Twi support',
                  'Product catalog management',
                  'Order processing',
                  'Cancel anytime'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-4">Choose Payment Method:</h3>
              <div className="space-y-3">
                {/* Mobile Money */}
                <button
                  onClick={() => setPaymentMethod('momo')}
                  className={`w-full p-5 border-2 rounded-xl transition-all ${
                    paymentMethod === 'momo'
                      ? 'border-beeline-yellow bg-beeline-yellow/10 shadow-md'
                      : 'border-gray-200 hover:border-beeline-yellow/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-beeline-yellow/20 p-3 rounded-full">
                      <FaMobileAlt className="text-2xl text-beeline-black" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-lg">Mobile Money</div>
                      <div className="text-sm text-gray-600">MTN, Vodafone, AirtelTigo</div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'momo' ? 'border-beeline-yellow bg-beeline-yellow' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'momo' && <div className="w-3 h-3 bg-beeline-black rounded-full" />}
                    </div>
                  </div>
                </button>

                {/* Credit Card */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-5 border-2 rounded-xl transition-all ${
                    paymentMethod === 'card'
                      ? 'border-beeline-yellow bg-beeline-yellow/10 shadow-md'
                      : 'border-gray-200 hover:border-beeline-yellow/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-beeline-yellow/20 p-3 rounded-full">
                      <FaCreditCard className="text-2xl text-beeline-black" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-lg">Debit/Credit Card</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard</div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'card' ? 'border-beeline-yellow bg-beeline-yellow' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'card' && <div className="w-3 h-3 bg-beeline-black rounded-full" />}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Money Phone Input */}
            {paymentMethod === 'momo' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Mobile Money Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="024 123 4567"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  You'll receive a prompt on your phone to approve the payment
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                {error}
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-beeline-gray rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Monthly Subscription</span>
                <span className="font-bold">GHS 99.00</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Processing fee</span>
                <span>Included</span>
              </div>
              <div className="border-t border-gray-300 mt-3 pt-3 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-beeline-black">GHS 99.00</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading || (paymentMethod === 'momo' && !phone)}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay GHS 99.00`}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              🔒 Secure payment powered by Hubtel. Your AI will be active immediately after payment.
              Cancel anytime.
            </p>
          </div>
        </div>

        {/* Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">Need help?</p>
          <a
            href="https://wa.me/233XXXXXXXXX"
            className="text-beeline-yellow hover:underline font-semibold"
          >
            Contact Support on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
