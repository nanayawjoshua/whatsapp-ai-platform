'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';
import BeelineLogoNew from '../../components/BeelineLogoNew';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signIn('google', {
        callbackUrl: '/admin',
      });
    } catch (err: any) {
      setError('Google sign-in failed. Please try again.');
      setIsSubmitting(false);
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
      <main className="flex-grow flex items-center justify-center px-4 pt-16 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-3xl shadow-medium border border-cream-border p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-beeline rounded-2xl shadow-glow mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h1 className="text-4xl font-light tracking-tight mb-3 text-text-primary">
                Admin Access
              </h1>
              <p className="text-text-secondary">
                Platform administration login
              </p>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full px-6 py-4 mb-6 bg-surface border-2 border-cream-border rounded-2xl text-text-primary font-semibold flex items-center justify-center gap-3 hover:border-beeline-yellow hover:shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="text-xl text-beeline-orange" />
              Continue with Google
            </button>

            <div className="text-center">
              <p className="text-sm text-text-tertiary">
                Admin access requires Google authentication
              </p>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <p className="text-center text-xs text-text-tertiary mt-6">
            This area is restricted to authorized personnel only.
          </p>
        </div>
      </main>
    </div>
  );
}
