'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { GiHoneypot } from 'react-icons/gi';
import ThemeToggle from '../components/ThemeToggle';

function SignupContent() {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Implement backend call to initiate WhatsApp onboarding
      console.log(`Initiating onboarding for ${phone}`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request
      setIsSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <GiHoneypot className="text-4xl text-beeline-yellow" />
              <span className="text-2xl font-bold text-dark-text">Beeline</span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/" className="text-dark-text-secondary hover:text-dark-text transition-colors">
                Back to Home
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {!isSubmitted ? (
            <>
              <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
                Let's get started.
              </h1>
              <p className="text-lg text-dark-text-secondary mb-8">
                Enter your WhatsApp number. Your AI assistant will meet you there.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 123 4567"
                    className="w-full text-center text-lg px-6 py-4 bg-dark-bg-secondary border-2 border-dark-border rounded-xl focus:ring-2 focus:ring-beeline-yellow focus:border-beeline-yellow transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !phone}
                  className="w-full mt-6 px-8 py-4 bg-gradient-beeline text-black font-semibold rounded-xl shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Starting...' : 'Continue'}
                </button>
              </form>
              {error && <p className="text-red-500 mt-4">{error}</p>}
            </>
          ) : (
            <div className="bg-glass-bg border border-glass-border rounded-2xl p-8 shadow-glass">
              <div className="w-20 h-20 bg-gradient-beeline rounded-full flex items-center justify-center mx-auto mb-6">
                <GiHoneypot className="text-4xl text-black" />
              </div>
              <h2 className="text-3xl font-bold text-dark-text mb-2">Check your WhatsApp!</h2>
              <p className="text-dark-text-secondary">
                Your new AI assistant has sent you a message to finish setup. It’ll only take a minute.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-beeline-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
