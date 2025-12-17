'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { FaGoogle } from 'react-icons/fa';
import BeelineLogoNew from '../components/BeelineLogoNew';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!phone.match(/^\+?[0-9\s\-()]{8,}$/)) {
        throw new Error('Please enter a valid phone number');
      }

      // Look up vendor by phone number
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();

      // Sign in with vendorId
      const result = await signIn('credentials', {
        vendorId: data.vendorId,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Authentication failed');
      }

      router.push('/dashboard');
      router.refresh();
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

          {/* Login Card */}
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
