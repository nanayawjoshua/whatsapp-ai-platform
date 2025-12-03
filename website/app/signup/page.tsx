'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GiHoneypot } from 'react-icons/gi';
import { FaWhatsapp, FaPhone, FaUser, FaStore, FaMicrophone } from 'react-icons/fa';

type PersonalityStyle = 'casual' | 'formal' | 'twi-heavy';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    businessType: '',
    voiceNote: '',
  });
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityStyle | null>(null);
  const [isRecording, setIsRecording] = useState(false);

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

  const handleSubmit = async () => {
    // TODO: Send data to backend API
    console.log('Submitting:', { ...formData, personality: selectedPersonality });
    setStep(4); // Go to QR code step
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
    <div className="min-h-screen bg-gradient-to-b from-beeline-gray to-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <GiHoneypot className="text-4xl text-beeline-yellow" />
              <span className="text-2xl font-bold text-beeline-black">Beeline</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-beeline-black">
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= num ? 'bg-beeline-yellow text-beeline-black' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {num}
                </div>
                {num < 4 && (
                  <div
                    className={`w-16 sm:w-24 h-1 ${step > num ? 'bg-beeline-yellow' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-beeline-black font-semibold' : 'text-gray-500'}>
              Info
            </span>
            <span className={step >= 2 ? 'text-beeline-black font-semibold' : 'text-gray-500'}>
              Voice
            </span>
            <span className={step >= 3 ? 'text-beeline-black font-semibold' : 'text-gray-500'}>
              Style
            </span>
            <span className={step >= 4 ? 'text-beeline-black font-semibold' : 'text-gray-500'}>
              Connect
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-beeline-black mb-2">
              Tell Us About Your Business
            </h2>
            <p className="text-gray-600 mb-8">This helps us create your perfect AI employee</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="inline mr-2" />
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Kwame Mensah"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaPhone className="inline mr-2" />
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g., +233 24 123 4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This is the number customers already use to reach you
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaStore className="inline mr-2" />
                  What Do You Sell?
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beeline-yellow focus:border-transparent"
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
                disabled={!formData.name || !formData.phone || !formData.businessType}
                className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Voice Note */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-beeline-black mb-2">
              Tell Us What You Sell
            </h2>
            <p className="text-gray-600 mb-8">
              Record a quick voice note (30 seconds) describing your products or services.
              This helps your AI learn what to talk about.
            </p>

            <div className="bg-beeline-gray rounded-xl p-8 text-center mb-6">
              <FaMicrophone
                className={`text-6xl mx-auto mb-4 ${
                  isRecording ? 'text-red-500 animate-pulse' : 'text-beeline-yellow'
                }`}
              />
              <button
                onClick={handleVoiceRecording}
                className={`${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-beeline-yellow hover:bg-yellow-400'
                } text-beeline-black font-bold px-8 py-4 rounded-lg transition-all`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              <p className="text-sm text-gray-500 mt-4">
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
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-beeline-black mb-2">
              Choose Your AI's Personality
            </h2>
            <p className="text-gray-600 mb-8">
              How should your AI employee talk to customers?
            </p>

            <div className="space-y-4 mb-6">
              {personalities.map((personality) => (
                <div
                  key={personality.id}
                  onClick={() => setSelectedPersonality(personality.id)}
                  className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                    selectedPersonality === personality.id
                      ? 'border-beeline-yellow bg-beeline-yellow/10'
                      : 'border-gray-200 hover:border-beeline-yellow/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-beeline-black">{personality.name}</h3>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPersonality === personality.id
                          ? 'border-beeline-yellow bg-beeline-yellow'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedPersonality === personality.id && (
                        <div className="w-3 h-3 bg-beeline-black rounded-full" />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{personality.description}</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 italic">{personality.example}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={handlePrevStep} className="btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedPersonality}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create My AI Employee
              </button>
            </div>
          </div>
        )}

        {/* Step 4: QR Code */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-3xl font-bold text-beeline-black mb-2">
                Almost There!
              </h2>
              <p className="text-gray-600">
                Scan this QR code with your WhatsApp to connect your AI employee
              </p>
            </div>

            <div className="bg-white border-4 border-beeline-yellow rounded-2xl p-8 mb-6 inline-block">
              <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 text-center px-4">
                  QR Code will appear here
                  <br />
                  <span className="text-sm">(Generated by backend API)</span>
                </p>
              </div>
            </div>

            <div className="bg-beeline-gray rounded-xl p-6 text-left mb-6">
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

            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-sm text-green-900">
                <strong>Your 7-day free trial starts now!</strong> You won't be charged until
                the trial ends. Cancel anytime.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
