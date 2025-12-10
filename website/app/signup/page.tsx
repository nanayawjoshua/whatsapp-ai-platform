'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';
import { MdQrCode2 } from 'react-icons/md';
import BeelineLogo from '../components/BeelineLogo';

function SignupContent() {
  const { data: session } = useSession();
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<'input' | 'qr' | 'success'>('input');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'google' | 'phone' | null>(null);

  // If user is signed in with Google but no phone, start with phone input
  const isCompletingGoogleSignup = session?.user && !session.user.phone;

  const handleGoogleSignin = async () => {
    setAuthMethod('google');
    setIsSubmitting(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthMethod('phone');
    setIsSubmitting(true);
    setError(null);

    try {
      if (!phone.match(/^\+?[0-9\s\-()]{8,}$/)) {
        throw new Error('Please enter a valid phone number');
      }

      const body: any = { phone };
      if (isCompletingGoogleSignup && session?.user?.vendorId) {
        body.vendorId = session.user.vendorId;
      }

      const response = await fetch('/api/auth/initiate-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Try to get detailed error message from response
        let errorMsg = 'Failed to initiate WhatsApp connection';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          errorMsg = `Error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setVendorId(data.vendorId);
      setStage('qr');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text flex flex-col">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <BeelineLogo size="md" />
            </Link>
            <Link href="/" className="text-dark-text-secondary hover:text-dark-text transition-colors text-sm">
              ← Back to Home
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-8">
        <div className="w-full max-w-md">
          {/* STEP INDICATOR */}
          <div className="mb-12 text-center">
             <p className="text-xs text-dark-text-tertiary uppercase tracking-wider mb-8">
               {stage === 'input' && (isCompletingGoogleSignup ? 'Step 1 of 2: Connect WhatsApp' : `Step ${authMethod ? '1' : '0'} of 3: ${authMethod === 'google' ? 'Google' : 'Connect'}`)}
               {stage === 'qr' && (isCompletingGoogleSignup ? 'Step 2 of 2: Scan QR Code' : 'Step 2 of 3: Scan QR Code')}
               {stage === 'success' && (isCompletingGoogleSignup ? 'Complete!' : 'Step 3 of 3: Complete!')}
             </p>
          </div>

           {/* STAGE 1: Input */}
           {stage === 'input' && (
             <>
               {isCompletingGoogleSignup ? (
                 <>
                   <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
                     Complete your signup
                   </h1>
                   <p className="text-lg text-dark-text-secondary mb-12 font-light">
                     Welcome! Just enter your phone number to connect WhatsApp.
                   </p>
                 </>
               ) : (
                 <>
                   <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-4">
                     Let's get started.
                   </h1>
                   <p className="text-lg text-dark-text-secondary mb-12 font-light">
                     Your AI meets you on WhatsApp. Choose how to begin.
                   </p>

                   {/* Google Sign-In */}
                   <button
                     onClick={handleGoogleSignin}
                     disabled={isSubmitting}
                     className="w-full px-6 py-4 mb-4 bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg text-dark-text font-semibold flex items-center justify-center gap-3 hover:bg-dark-bg-tertiary/80 hover:border-beeline-yellow/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <FaGoogle className="text-lg" />
                     Sign in with Google
                   </button>

                   {/* Divider */}
                   <div className="relative my-6">
                     <div className="absolute inset-0 flex items-center">
                       <div className="w-full border-t border-dark-border/50"></div>
                     </div>
                     <div className="relative flex justify-center text-xs">
                       <span className="px-2 bg-dark-bg text-dark-text-tertiary">or</span>
                     </div>
                   </div>
                 </>
               )}

              {/* Phone Input */}
              <form onSubmit={handlePhoneSubmit}>
                <div className="mb-4">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 24 123 4567"
                    className="w-full text-center text-lg px-6 py-4 bg-dark-bg-secondary border-2 border-dark-border rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-beeline-yellow transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !phone}
                  className="w-full px-8 py-4 bg-gradient-beeline text-black font-semibold rounded-lg shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Connecting...' : 'Connect WhatsApp'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </>
          )}

          {/* STAGE 2: QR Code */}
          {stage === 'qr' && (
            <>
              <h1 className="text-4xl font-light tracking-tight mb-4 text-center">
                Scan to connect
              </h1>
              <p className="text-center text-dark-text-secondary mb-8">
                Open WhatsApp on your phone and scan this QR code.
              </p>

              <div className="bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl p-8 mb-8">
                <div className="bg-white rounded-lg p-4 flex items-center justify-center aspect-square">
                  {qrCode ? (
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <MdQrCode2 className="w-16 h-16 text-beeline-yellow/20 mb-2" />
                      <p className="text-sm text-gray-400">Generating QR code...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-dark-text-tertiary">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
                  Waiting for connection...
                </p>
              </div>

              <button
                onClick={() => {
                  setStage('input');
                  setPhone('');
                  setQrCode(null);
                  setAuthMethod(null);
                  setError(null);
                }}
                className="w-full mt-8 px-6 py-3 text-dark-text-secondary hover:text-dark-text transition-colors text-sm"
              >
                Try another method
              </button>
            </>
          )}

           {/* STAGE 3: Success */}
           {stage === 'success' && (
             <>
               <div className="text-center">
                 <div className="mb-8">
                   <div className="inline-block w-16 h-16 bg-gradient-beeline rounded-full flex items-center justify-center">
                     <span className="text-3xl">✨</span>
                   </div>
                 </div>
                 <h1 className="text-4xl font-light tracking-tight mb-4">
                   You're all set!
                 </h1>
                 <p className="text-lg text-dark-text-secondary mb-8 font-light">
                   Your AI assistant is ready. Check your WhatsApp.
                 </p>
                 <button
                   onClick={async () => {
                     if (authMethod === 'phone' && vendorId) {
                       // For phone signup, sign in with vendorId
                       await signIn('credentials', {
                         vendorId,
                         redirect: false,
                       });
                     }
                     window.location.href = '/dashboard';
                   }}
                   className="inline-block px-12 py-4 bg-gradient-beeline text-black font-semibold rounded-lg shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all"
                 >
                   Go to Dashboard →
                 </button>
               </div>
             </>
           )}

          {/* Privacy & Terms Footer */}
          <p className="text-center text-xs text-dark-text-tertiary mt-12">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:no-underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:no-underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-bg flex items-center justify-center"><p className="text-dark-text">Loading...</p></div>}>
      <SignupContent />
    </Suspense>
  );
}
