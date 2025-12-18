'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { FaGoogle, FaCheckCircle } from 'react-icons/fa';
import { MdQrCode2 } from 'react-icons/md';
import BeelineLogoNew from '../components/BeelineLogoNew';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'input' | 'qr' | 'success'>('input');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!phone.match(/^\+?[0-9\s\-()]{8,}$/)) {
        throw new Error('Please enter a valid phone number');
      }

      // Normalize phone number
      const normalizedPhone = phone.replace(/[\s\-()]/g, '');

      // Initiate login verification via WhatsApp
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();

      // Show QR code for WhatsApp verification
      setQrCode(data.qrCode);
      setVendorId(data.vendorId);
      setStage('qr');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn('google', {
        callbackUrl: '/dashboard',
      });
    } catch (err) {
      setError('Failed to sign in with Google');
      setLoading(false);
    }
  };

  // Poll for connection status when showing QR
  useEffect(() => {
    if (stage === 'qr' && vendorId) {
      const pollConnection = async () => {
        try {
          const bridgeUrl = process.env.NEXT_PUBLIC_PHONE_BRIDGE_URL || 'https://bridge.beeline.works';
          const response = await fetch(`${bridgeUrl}/vendor/${vendorId}/status`);
          const status = await response.json();

          if (status.connected) {
            setStage('success');
            // Auto sign in after successful connection
            setTimeout(async () => {
              const result = await signIn('credentials', {
                vendorId,
                redirect: false,
              });
              if (result?.error) {
                setError('Authentication failed');
              } else {
                router.push('/dashboard');
                router.refresh();
              }
            }, 1000);
          }
        } catch (error) {
          console.error('Failed to check connection status:', error);
        }
      };

      // Poll every 3 seconds
      const interval = setInterval(pollConnection, 3000);

      // Initial check
      pollConnection();

      return () => clearInterval(interval);
    }
  }, [stage, vendorId, router]);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-cream-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <BeelineLogoNew size="md" />
            </Link>
            <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
              ← Back
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light tracking-tight mb-3 text-text-primary">
              Welcome back
            </h1>
            <p className="text-text-secondary">
              Log in to manage your AI assistant
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                stage === 'input' ? 'bg-gradient-beeline text-white' : 'bg-success text-white'
              }`}>
                {stage !== 'input' ? <FaCheckCircle /> : '1'}
              </div>
              <div className={`w-12 h-0.5 ${stage !== 'input' ? 'bg-success' : 'bg-cream-border'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                stage === 'qr' ? 'bg-gradient-beeline text-white' : stage === 'success' ? 'bg-success text-white' : 'bg-cream-dark text-text-tertiary'
              }`}>
                {stage === 'success' ? <FaCheckCircle /> : '2'}
              </div>
            </div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
              {stage === 'input' && 'Enter your phone number'}
              {stage === 'qr' && 'Verify with WhatsApp'}
              {stage === 'success' && 'Logging you in...'}
            </p>
          </div>

          {/* STAGE 1: Input */}
          {stage === 'input' && (
            <div className="bg-surface rounded-3xl shadow-medium border border-cream-border p-8">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full px-6 py-4 mb-6 bg-surface border-2 border-cream-border rounded-2xl text-text-primary font-semibold flex items-center justify-center gap-3 hover:border-beeline-yellow hover:shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-xl text-beeline-orange" />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cream-border"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-surface text-text-tertiary font-medium">or with phone number</span>
              </div>
            </div>

            {/* Phone Login Form */}
            <form onSubmit={handlePhoneLogin}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full text-lg px-4 py-3.5 bg-surface border-2 border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all text-text-primary placeholder:text-text-tertiary"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full px-8 py-4 bg-gradient-beeline text-white font-semibold rounded-full shadow-medium hover:shadow-hover hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: QR Code */}
          {stage === 'qr' && (
            <div className="bg-surface rounded-3xl shadow-large border border-cream-border p-8">
              <h1 className="text-4xl font-light tracking-tight mb-3 text-center text-text-primary">
                Verify with WhatsApp
              </h1>
              <p className="text-center text-text-secondary mb-8">
                Scan this code with the WhatsApp account connected to your business
              </p>

              <div className="bg-cream-dark rounded-2xl p-6 mb-6">
                <div className="bg-white rounded-xl p-6 flex items-center justify-center aspect-square shadow-inner">
                  {qrCode ? (
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <MdQrCode2 className="w-20 h-20 text-beeline-yellow/30 mb-3 animate-pulse" />
                      <p className="text-sm text-text-tertiary">Generating QR code...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-text-secondary flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 bg-beeline-yellow rounded-full animate-pulse"></span>
                  Waiting for WhatsApp verification...
                </p>
              </div>

              <button
                onClick={() => {
                  setStage('input');
                  setPhone('');
                  setQrCode(null);
                  setVendorId(null);
                  setError('');
                }}
                className="w-full px-6 py-3 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                ← Try different number
              </button>
            </div>
          )}

          {/* STAGE 3: Success */}
          {stage === 'success' && (
            <div className="bg-surface rounded-3xl shadow-large border border-cream-border p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex w-20 h-20 bg-gradient-beeline rounded-full items-center justify-center shadow-glow">
                  <span className="text-4xl">✨</span>
                </div>
              </div>
              <h1 className="text-4xl font-light tracking-tight mb-3 text-text-primary">
                Welcome back!
              </h1>
              <p className="text-lg text-text-secondary mb-8">
                Taking you to your dashboard...
              </p>
            </div>
          )}

          {/* Signup Link */}
          <p className="text-center text-sm text-text-secondary mt-8">
            Don't have an account?{' '}
            <Link href="/signup" className="text-text-primary font-semibold hover:underline">
              Sign up free
            </Link>
          </p>

          {/* Help Text */}
          <p className="text-center text-xs text-text-tertiary mt-6">
            Need help? Contact{' '}
            <a href="mailto:support@beeline.works" className="text-text-secondary hover:text-text-primary underline">
              support@beeline.works
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
