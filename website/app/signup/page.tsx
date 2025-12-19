'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { FaGoogle, FaCheckCircle } from 'react-icons/fa';
import { MdQrCode2 } from 'react-icons/md';
import BeelineLogoNew from '../components/BeelineLogoNew';

function SignupContent() {
  const { data: session } = useSession();
  const [countryCode, setCountryCode] = useState('+233');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<'input' | 'qr' | 'success'>('input');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'google' | 'phone' | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [startTime, setStartTime] = useState<number | null>(null);

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
      // Validation
      if (!phone || phone.length < 8) {
        throw new Error('Please enter a valid phone number');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Combine country code and phone number
      const fullPhone = `${countryCode}${phone}`;

      const body: any = {
        phone: fullPhone,
        password,
        authMethod: 'password'
      };

      if (isCompletingGoogleSignup && session?.user?.vendorId) {
        body.vendorId = session.user.vendorId;
      }

      const response = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to create account';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMsg = errorData.error;
            // Include detailed diagnostics if available
            if (errorData.details) {
              const details = errorData.details;
              errorMsg += `\n\nDiagnostics:\n`;
              errorMsg += `- Bridge URL: ${details.bridgeUrl || 'N/A'}\n`;
              errorMsg += `- Endpoint: ${details.endpoint || 'N/A'}\n`;
              errorMsg += `- Status: ${details.status || 'N/A'}\n`;
              if (details.responseBody) {
                errorMsg += `- Response: ${details.responseBody.substring(0, 200)}`;
              }
            }
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

  // Poll for connection status and QR updates when showing QR
  useEffect(() => {
    if (stage === 'qr' && vendorId && startTime) {
      const pollConnection = async () => {
        // Check for timeout (5 minutes)
        if (Date.now() - startTime > 5 * 60 * 1000) {
          setConnectionStatus('failed');
          return;
        }

        try {
          const bridgeUrl = process.env.NEXT_PUBLIC_PHONE_BRIDGE_URL || 'https://bridge.beeline.works';
          const response = await fetch(`${bridgeUrl}/vendor/${vendorId}/status`);
          const status = await response.json();

          // Update QR code if a new one is available
          if (status.qrCode && status.qrCode !== qrCode) {
            setQrCode(status.qrCode);
            // Reset start time for new QR
            setStartTime(Date.now());
          }

          if (status.connected) {
            setConnectionStatus('connected');
            setStage('success');
          } else {
            setConnectionStatus('checking');
          }
        } catch (error) {
          console.error('Failed to check connection status:', error);
          setConnectionStatus('failed');
        }
      };

      // Poll every 3 seconds for faster updates
      const interval = setInterval(pollConnection, 3000);

      // Initial check
      pollConnection();

      return () => clearInterval(interval);
    }
  }, [stage, vendorId, qrCode, startTime]);

  // Auto-sign in when reaching success stage
  useEffect(() => {
    if (stage === 'success' && authMethod === 'phone' && vendorId) {
      const autoSignIn = async () => {
        try {
          await signIn('credentials', {
            vendorId,
            redirect: false,
          });
          // Redirect after a short delay to show success message
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        } catch (error) {
          console.error('Auto sign-in failed:', error);
        }
      };
      autoSignIn();
    }
  }, [stage, authMethod, vendorId]);

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
              <div className={`w-12 h-0.5 ${stage === 'success' ? 'bg-success' : 'bg-cream-border'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                stage === 'success' ? 'bg-success text-white' : 'bg-cream-dark text-text-tertiary'
              }`}>
                {stage === 'success' ? <FaCheckCircle /> : '3'}
              </div>
            </div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide">
              {stage === 'input' && 'Choose sign-in method'}
              {stage === 'qr' && 'Connect WhatsApp'}
              {stage === 'success' && 'All set!'}
            </p>
          </div>

          {/* STAGE 1: Input */}
          {stage === 'input' && (
            <div className="bg-surface rounded-3xl shadow-medium border border-cream-border p-8">
              {isCompletingGoogleSignup ? (
                <>
                  <h1 className="text-4xl font-light tracking-tight mb-3 text-text-primary text-center">
                    One more step
                  </h1>
                  <p className="text-text-secondary mb-8 text-center">
                    Enter your WhatsApp number to connect
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-light tracking-tight mb-3 text-text-primary text-center">
                    Get started free
                  </h1>
                  <p className="text-text-secondary mb-8 text-center">
                    7-day trial. No credit card required.
                  </p>

                  {/* Google Sign-In */}
                  <button
                    onClick={handleGoogleSignin}
                    disabled={isSubmitting}
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
                </>
              )}

              {/* Signup Form */}
              <form onSubmit={handlePhoneSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    WhatsApp Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-3.5 bg-surface border-2 border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all text-text-primary text-sm font-medium min-w-[100px]"
                    >
                      <option value="+233">🇬🇭 +233</option>
                      <option value="+234">🇳🇬 +234</option>
                      <option value="+225">🇨🇮 +225</option>
                      <option value="+228">🇹🇬 +228</option>
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="501234567"
                      className="flex-1 text-lg px-4 py-3.5 bg-surface border-2 border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all text-text-primary placeholder:text-text-tertiary"
                      required
                      maxLength={10}
                    />
                  </div>
                  <p className="mt-2 text-xs text-text-tertiary">
                    Your business WhatsApp number (without country code)
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full text-lg px-4 py-3.5 bg-surface border-2 border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all text-text-primary placeholder:text-text-tertiary"
                    required
                    minLength={8}
                  />
                  <p className="mt-2 text-xs text-text-tertiary">
                    Minimum 8 characters
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full text-lg px-4 py-3.5 bg-surface border-2 border-cream-border rounded-xl focus:ring-2 focus:ring-beeline-yellow/20 focus:border-beeline-yellow transition-all text-text-primary placeholder:text-text-tertiary"
                    required
                    minLength={8}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !countryCode || !phone || !password || !confirmPassword}
                  className="w-full px-8 py-4 bg-gradient-beeline text-white font-semibold rounded-full shadow-medium hover:shadow-hover hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account →'}
                </button>
              </form>

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
                Scan with WhatsApp
              </h1>
              <p className="text-center text-text-secondary mb-8">
                Open WhatsApp → Settings → Linked Devices → Link a Device
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
                   <span className={`inline-block w-2 h-2 rounded-full animate-pulse ${
                     connectionStatus === 'connected' ? 'bg-success' :
                     connectionStatus === 'failed' ? 'bg-error' : 'bg-beeline-yellow'
                   }`}></span>
                   {connectionStatus === 'connected' ? 'Connected! Setting up your account...' :
                    connectionStatus === 'failed' ? 'Connection timed out. The QR code may have expired.' :
                    startTime && Date.now() - startTime > 5 * 60 * 1000 ? 'Taking longer than expected. QR codes refresh automatically.' :
                    'Waiting for you to scan and connect...'}
                 </p>
                 {connectionStatus === 'failed' && (
                   <p className="text-xs text-text-tertiary mt-2">
                     QR codes expire after 60 seconds and refresh automatically. Try scanning again.
                   </p>
                 )}
               </div>

               <button
                 onClick={() => {
                   setStage('input');
                   setPhone('');
                   setQrCode(null);
                   setAuthMethod(null);
                   setError(null);
                   setConnectionStatus('checking');
                   setStartTime(null);
                 }}
                 className="w-full px-6 py-3 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
               >
                ← Try another method
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
                You're all set!
              </h1>
               <p className="text-lg text-text-secondary mb-8">
                 Your AI assistant is ready and waiting for customers.
               </p>
               <div className="flex items-center justify-center gap-2 text-sm text-text-secondary mb-4">
                 <span className="inline-block w-2 h-2 bg-success rounded-full animate-pulse"></span>
                 Setting up your account and redirecting...
               </div>
            </div>
          )}

          {/* Footer Links */}
          <p className="text-center text-xs text-text-tertiary mt-8">
            By continuing, you agree to our{' '}
            <Link href="#" className="text-text-secondary hover:text-text-primary underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-text-secondary hover:text-text-primary underline">
              Privacy Policy
            </Link>
          </p>

          {!isCompletingGoogleSignup && (
            <p className="text-center text-sm text-text-secondary mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-text-primary font-semibold hover:underline">
                Log in
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-text-secondary">Loading...</p>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
