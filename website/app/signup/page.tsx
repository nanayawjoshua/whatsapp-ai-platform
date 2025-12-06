'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GiHoneypot } from 'react-icons/gi';
import { FaWhatsapp, FaPhone, FaUser, FaStore, FaMicrophone } from 'react-icons/fa';
import ThemeToggle from '../components/ThemeToggle';
import { openPaystackPopup, verifyPayment } from '../../lib/paystack';
import { fetchVendorQRCode, checkVendorConnectionStatus } from '../../lib/qrcode-utils';

type PersonalityStyle = 'casual' | 'formal' | 'twi-heavy';

function SignupContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    businessType: '',
    voiceNote: '',
    locations: 1,
    accountType: 'business' as 'personal' | 'business' | 'enterprise',
  });
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityStyle | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording
    alert('Voice recording will be implemented with Web Audio API');
  };

  // Check for payment callback on mount
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const reference = searchParams.get('reference');

    if (paymentStatus === 'success' && reference) {
      // Payment successful, verify and show QR code
      handlePaymentSuccess(reference);
    } else if (paymentStatus === 'failed') {
      setPaymentError('Payment failed. Please try again.');
      setStep(3); // Go back to personality selection
    } else if (paymentStatus === 'error') {
      setPaymentError('An error occurred during payment. Please try again.');
      setStep(3);
    }
  }, [searchParams]);

  const handlePaymentSuccess = async (reference: string) => {
    try {
      setIsProcessingPayment(true);
      // Verify payment
      const verifyResponse = await verifyPayment(reference);

      if (verifyResponse.status) {
        setPaymentReference(reference);
        setStep(4); // Go to QR code step

        // Generate QR code for vendor
        await generateVendorQRCode(reference);
      } else {
        setPaymentError('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentError('Failed to verify payment. Please contact support.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const generateVendorQRCode = async (vendorId: string) => {
    try {
      setIsLoadingQR(true);
      setQrError(null);

      console.log('Generating QR code for vendor:', vendorId);

      const qrData = await fetchVendorQRCode(vendorId, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        businessType: formData.businessType,
        personality: selectedPersonality || 'casual',
        accountType: formData.accountType, // Pass account type to bridge server
      });

      setQrCodeImage(qrData.qrCodeImage);

      // Poll for connection status
      startConnectionPolling(vendorId);

    } catch (error: any) {
      console.error('QR generation error:', error);
      setQrError(error.message || 'Failed to generate QR code. Please refresh the page.');
    } finally {
      setIsLoadingQR(false);
    }
  };

  const startConnectionPolling = (vendorId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await checkVendorConnectionStatus(vendorId);

        if (status.connected) {
          setIsConnected(true);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Connection polling error:', error);
      }
    }, 3000); // Check every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const getPlanDetails = () => {
    const { accountType, locations } = formData;

    if (accountType === 'personal') {
      return {
        planCode: 'personal-monthly',
        amount: 49,
        planName: 'Personal',
      };
    }

    if (accountType === 'business') {
      return {
        planCode: 'business-monthly',
        amount: 99,
        planName: 'Business',
      };
    }

    // Enterprise tiers
    const numLocations = parseInt(String(locations));

    if (numLocations >= 61) {
      // Custom pricing - redirect to sales
      alert('For 61+ locations, please contact our sales team at sales@beeline.works');
      return null;
    } else if (numLocations >= 26) {
      return {
        planCode: 'enterprise-60',
        amount: 2999,
        planName: 'Enterprise (Up to 60 Locations)',
      };
    } else if (numLocations >= 13) {
      return {
        planCode: 'enterprise-25',
        amount: 1499,
        planName: 'Enterprise (Up to 25 Locations)',
      };
    } else if (numLocations >= 6) {
      return {
        planCode: 'enterprise-12',
        amount: 999,
        planName: 'Enterprise (Up to 12 Locations)',
      };
    } else {
      return {
        planCode: 'enterprise-5',
        amount: 599,
        planName: 'Enterprise (Up to 5 Locations)',
      };
    }
  };

  const handleSubmit = async () => {
    try {
      setIsProcessingPayment(true);
      setPaymentError(null);

      const planDetails = getPlanDetails();

      if (!planDetails) {
        setIsProcessingPayment(false);
        return;
      }

      // Get referrer ID from URL if exists
      const referrerId = searchParams.get('ref') || undefined;

      // Open Paystack payment popup
      await openPaystackPopup(
        {
          email: formData.email,
          amount: planDetails.amount,
          metadata: {
            name: formData.name,
            phone: formData.phone,
            businessType: formData.businessType,
            personality: selectedPersonality || 'casual',
            referrerId,
            accountType: formData.accountType,
            locations: formData.locations,
            planCode: planDetails.planCode,
            planName: planDetails.planName,
          },
        },
        // On success
        (reference) => {
          handlePaymentSuccess(reference);
        },
        // On close
        () => {
          setIsProcessingPayment(false);
        }
      );
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Failed to initialize payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const personalities = [
    {
      id: 'casual' as PersonalityStyle,
      name: 'Casual & Friendly',
      description: 'Charley, boss, Twi mix - like your favorite market vendor',
      example: '"Akwaaba boss! We get fresh tomatoes for GHS 5 per kilo. How many you need?"',
    },
    {
      id: 'formal' as PersonalityStyle,
      name: 'Professional',
      description: 'Polite English, business-like but warm',
      example: '"Good day! We have fresh tomatoes available at GHS 5 per kilogram. How may I assist you?"',
    },
    {
      id: 'twi-heavy' as PersonalityStyle,
      name: 'Twi-Heavy',
      description: 'Mostly Twi with some English - very local',
      example: '"Akwaaba! Yɛwɔ tomatoes foforɔ. GHS 5 per kilo. Wobɛhwehwɛ sɛn?"',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft dark:bg-dark-bg">
      {/* Header */}
      <nav className="bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm border-b border-gray-200 dark:border-dark-border shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <GiHoneypot className="text-4xl text-beeline-yellow" />
              <span className="text-2xl font-bold text-beeline-black dark:text-dark-text">Beeline</span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/" className="text-gray-600 dark:text-dark-text-secondary hover:text-beeline-black dark:hover:text-dark-text transition-colors duration-200">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-soft">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shadow-medium transition-all duration-300 ${
                    step >= num ? 'bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark text-white scale-110' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {num}
                </div>
                {num < 4 && (
                  <div
                    className={`w-16 sm:w-24 h-1.5 rounded-full transition-all duration-300 ${step > num ? 'bg-gradient-to-r from-beeline-yellow to-beeline-yellow-dark' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <span className={step >= 1 ? 'text-beeline-black font-bold' : 'text-gray-500 font-medium'}>
              Info
            </span>
            <span className={step >= 2 ? 'text-beeline-black font-bold' : 'text-gray-500 font-medium'}>
              Voice
            </span>
            <span className={step >= 3 ? 'text-beeline-black font-bold' : 'text-gray-500 font-medium'}>
              Style
            </span>
            <span className={step >= 4 ? 'text-beeline-black font-bold' : 'text-gray-500 font-medium'}>
              Connect
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="card p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-beeline-black dark:text-dark-text mb-2">
              Tell Us About Your Business
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">This helps us create your perfect AI employee</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-2">
                  <FaUser className="inline mr-2" />
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Kwame Mensah"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-beeline-yellow transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-2">
                  <FaPhone className="inline mr-2" />
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., +233 24 123 4567"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-beeline-yellow transition-all duration-200"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This is the number customers already use to reach you
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-2">
                  <FaUser className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g., kwame@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-beeline-yellow transition-all duration-200"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  For payment confirmation and account updates
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-2">
                  <FaUser className="inline mr-2" />
                  Account Type
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={(e) => {
                    const accountType = e.target.value as 'personal' | 'business' | 'enterprise';
                    setFormData({
                      ...formData,
                      accountType,
                      locations: accountType === 'enterprise' ? 3 : 1,
                    });
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-beeline-yellow transition-all duration-200"
                  required
                >
                  <option value="personal">Personal - GHS 49/month (AI assistant for individuals)</option>
                  <option value="business">Business - GHS 99/month (Single-location vendor)</option>
                  <option value="enterprise">Enterprise - Starting GHS 599/month (Multi-location business)</option>
                </select>
              </div>

              {formData.accountType === 'enterprise' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-2">
                    <FaStore className="inline mr-2" />
                    How Many Locations?
                  </label>
                  <select
                    name="locations"
                    value={formData.locations}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-beeline-yellow transition-all duration-200"
                    required
                  >
                    <option value="3">3-5 locations - GHS 599/month</option>
                    <option value="8">6-12 locations - GHS 999/month</option>
                    <option value="15">13-25 locations - GHS 1,499/month</option>
                    <option value="30">26-60 locations - GHS 2,999/month</option>
                    <option value="61">61+ locations - Contact sales</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Flat fee - add unlimited locations within your tier!
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text-secondary mb-2">
                  <FaStore className="inline mr-2" />
                  What Do You Sell?
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-beeline-yellow transition-all duration-200"
                  required
                >
                  <option value="">Choose your business type</option>
                  <option value="supermarket">Supermarket / Shop</option>
                  <option value="restaurant">Food / Restaurant</option>
                  <option value="fashion">Fashion / Clothing</option>
                  <option value="salon">Salon / Barbershop</option>
                  <option value="electronics">Electronics</option>
                  <option value="services">Services (Car wash, cleaning, etc.)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                onClick={handleNextStep}
                disabled={!formData.name || !formData.phone || !formData.email || !formData.businessType}
                className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Voice Note */}
        {step === 2 && (
          <div className="card p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-beeline-black dark:text-dark-text mb-2">
              Tell Us What You Sell
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Record a quick voice note (30 seconds) describing your products or services.
              This helps your AI learn what to talk about.
            </p>

            <div className="bg-gradient-to-br from-beeline-yellow-light to-beeline-cream rounded-2xl p-8 text-center mb-6 shadow-soft">
              <div className="w-20 h-20 bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-medium">
                <FaMicrophone
                  className={`text-4xl text-white ${
                    isRecording ? 'animate-pulse' : ''
                  }`}
                />
              </div>
              <button
                onClick={handleVoiceRecording}
                className={`${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'btn-primary'
                } text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 shadow-medium hover:shadow-hover transform hover:scale-105`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              <p className="text-sm text-gray-700 mt-4 font-medium">
                {isRecording ? 'Recording... Speak clearly!' : 'Click to start recording'}
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Example:</strong> "I sell fresh fruits and vegetables. We have oranges,
                tomatoes, onions, and garden eggs. Everything is fresh daily. Prices range from
                GHS 5 to GHS 50."
              </p>
            </div>

            <div className="flex gap-4">
              <button onClick={handlePrevStep} className="btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="btn-primary flex-1"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Personality Selection */}
        {step === 3 && (
          <div className="card p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-beeline-black dark:text-dark-text mb-2">
              Choose Your AI's Personality
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              How should your AI employee talk to customers?
            </p>

            <div className="space-y-4 mb-6">
              {personalities.map((personality) => (
                <div
                  key={personality.id}
                  onClick={() => setSelectedPersonality(personality.id)}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                    selectedPersonality === personality.id
                      ? 'border-beeline-yellow bg-gradient-to-br from-beeline-yellow-light to-beeline-cream shadow-hover'
                      : 'border-gray-200 dark:border-dark-border hover:border-beeline-yellow/50 hover:shadow-medium bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-beeline-black dark:text-dark-text">{personality.name}</h3>
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedPersonality === personality.id
                          ? 'border-beeline-yellow bg-gradient-to-br from-beeline-yellow to-beeline-yellow-dark shadow-medium'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPersonality === personality.id && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3 leading-relaxed">{personality.description}</p>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-soft">
                    <p className="text-sm text-gray-700 italic leading-relaxed">{personality.example}</p>
                  </div>
                </div>
              ))}
            </div>

            {paymentError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-sm text-red-900">
                  <strong>Payment Error:</strong> {paymentError}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handlePrevStep}
                className="btn-secondary flex-1"
                disabled={isProcessingPayment}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedPersonality || isProcessingPayment}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? 'Processing Payment...' : `Pay GHS ${getPlanDetails()?.amount || 99} & Continue`}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: QR Code */}
        {step === 4 && (
          <div className="card p-8 sm:p-10 text-center">
            <div className="mb-6">
              <div className={`w-20 h-20 bg-gradient-to-br ${isConnected ? 'from-green-400 to-green-600' : 'from-beeline-yellow to-beeline-yellow-dark'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-medium transition-all duration-500`}>
                <span className="text-4xl text-white">{isConnected ? '✓' : '⏳'}</span>
              </div>
              <h2 className="text-3xl font-bold text-beeline-black dark:text-dark-text mb-2">
                {isConnected ? 'Connected!' : 'Almost There!'}
              </h2>
              <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                {isConnected
                  ? 'Your AI employee is now active and ready to chat with customers!'
                  : 'Scan this QR code with your WhatsApp to connect your AI employee'}
              </p>
            </div>

            {/* QR Code Display */}
            <div className="bg-gradient-to-br from-beeline-yellow-light to-white border-4 border-beeline-yellow rounded-2xl p-8 mb-6 inline-block shadow-hover">
              <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center shadow-soft">
                {isLoadingQR && (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-beeline-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Generating QR Code...</p>
                  </div>
                )}

                {!isLoadingQR && qrError && (
                  <div className="text-center px-4">
                    <p className="text-red-500 text-sm mb-2">⚠️ {qrError}</p>
                    <button
                      onClick={() => paymentReference && generateVendorQRCode(paymentReference)}
                      className="btn-primary text-sm py-2 px-4 mt-2"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!isLoadingQR && !qrError && qrCodeImage && (
                  <img
                    src={qrCodeImage}
                    alt="WhatsApp QR Code"
                    className={`w-full h-full object-contain ${isConnected ? 'opacity-30' : 'opacity-100'} transition-opacity duration-500`}
                  />
                )}

                {!isLoadingQR && !qrError && !qrCodeImage && (
                  <p className="text-gray-500 text-center px-4">
                    Initializing...
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-beeline-cream to-beeline-yellow-light rounded-xl p-6 text-left mb-6 shadow-soft">
              <h3 className="font-bold mb-3 text-lg">How to Scan:</h3>
              <ol className="space-y-2 text-gray-700">
                <li className="flex gap-3">
                  <span className="font-bold text-beeline-yellow">1.</span>
                  <span>Open WhatsApp on your phone</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-beeline-yellow">2.</span>
                  <span>Tap the three dots (⋮) at the top right</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-beeline-yellow">3.</span>
                  <span>Select "Linked Devices"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-beeline-yellow">4.</span>
                  <span>Tap "Link a Device" and scan this QR code</span>
                </li>
              </ol>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-sm text-green-900">
                <strong>Payment Confirmed!</strong> Your payment of GHS 99 was successful.
                {paymentReference && (
                  <span className="block mt-1 text-xs font-mono">
                    Reference: {paymentReference}
                  </span>
                )}
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-blue-900">
                <strong>Your subscription includes:</strong> Unlimited messages, 24/7 support,
                English & Twi languages, and free updates. Cancel anytime via WhatsApp.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-soft dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-beeline-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
