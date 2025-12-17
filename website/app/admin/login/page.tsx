'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BeelineLogoNew from '../../components/BeelineLogoNew';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();

      // Store admin session
      localStorage.setItem('adminToken', data.token);

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
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

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@beeline.works"
                  className="w-full text-lg px-4 py-3.5 bg-surface border-2 border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all text-text-primary placeholder:text-text-tertiary"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-lg px-4 py-3.5 bg-surface border-2 border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all text-text-primary placeholder:text-text-tertiary"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="w-full px-8 py-4 bg-gradient-beeline text-white font-semibold rounded-full shadow-medium hover:shadow-hover hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

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
