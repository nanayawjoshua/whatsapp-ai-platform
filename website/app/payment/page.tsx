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
    <div className="min-h-screen bg-gradient-soft">
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
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Complete Your Subscription
            </h1>
            <p className="text-white/90 text-lg">
              Continue with your AI employee for just GHS 99/month
            </p>
          </div>

          <div className="p-8 sm:p-10">
            {/* Trial Info */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-6 rounded-r-lg shadow-soft">
              <p className="text-sm text-blue-900 leading-relaxed">
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
                  className={`w-full p-6 border-2 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
                    paymentMethod === 'momo'
                      ? 'border-beeline-yellow bg-gradient-to-br from-beeline-yellow-light to-beeline-cream shadow-hover'
                      : 'border-gray-200 hover:border-beeline-yellow/50 hover:shadow-medium bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark p-3 rounded-xl shadow-medium">
                      <FaMobileAlt className="text-2xl text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-lg text-beeline-black">Mobile Money</div>
                      <div className="text-sm text-gray-600">MTN, Vodafone, AirtelTigo</div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        paymentMethod === 'momo' ? 'border-beeline-yellow bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark shadow-medium' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'momo' && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>
                  </div>
                </button>

                {/* Credit Card */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-6 border-2 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
                    paymentMethod === 'card'
                      ? 'border-beeline-yellow bg-gradient-to-br from-beeline-yellow-light to-beeline-cream shadow-hover'
                      : 'border-gray-200 hover:border-beeline-yellow/50 hover:shadow-medium bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark p-3 rounded-xl shadow-medium">
                      <FaCreditCard className="text-2xl text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-lg text-beeline-black">Debit/Credit Card</div>
                      <div className="text-sm text-gray-600">Visa, Mastercard</div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        paymentMethod === 'card' ? 'border-beeline-yellow bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark shadow-medium' : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'card' && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Money Phone Input */}
            {paymentMethod === 'momo' && (
              <div className="mb-6 p-5 bg-gradient-to-br from-beeline-yellow-light to-beeline-cream rounded-xl shadow-soft">
                <label className="block text-sm font-bold mb-2 text-gray-700">
                  Mobile Money Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="024 123 4567"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-beeline-yellow transition-all duration-200"
                />
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
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
            <div className="bg-gradient-to-br from-beeline-cream to-beeline-yellow-light rounded-xl p-6 mb-6 shadow-soft border border-beeline-yellow/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Monthly Subscription</span>
                <span className="font-bold text-beeline-black">GHS 99.00</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Processing fee</span>
                <span className="font-semibold">Included</span>
              </div>
              <div className="border-t-2 border-beeline-yellow mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-lg text-beeline-black">Total</span>
                <span className="font-bold text-3xl bg-gradient-to-r from-beeline-yellow to-beeline-yellow-dark bg-clip-text text-transparent">GHS 99.00</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading || (paymentMethod === 'momo' && !phone)}
              className="btn-primary w-full text-lg py-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay GHS 99.00`}
            </button>

            <div className="mt-4 text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <p className="text-xs text-gray-700 leading-relaxed">
                🔒 Secure payment powered by Hubtel. Your AI will be active immediately after payment.
                Cancel anytime.
              </p>
            </div>
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
