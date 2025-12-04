/**
 * Paystack Integration Utilities
 */

export interface PaymentMetadata {
  name: string;
  phone: string;
  businessType: string;
  personality: string;
  referrerId?: string;
}

export interface InitializePaymentParams {
  email: string;
  amount: number;
  metadata: PaymentMetadata;
}

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata: PaymentMetadata;
    paid_at: string;
    channel: string;
  };
}

/**
 * Initialize a Paystack payment
 */
export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  const response = await fetch('/api/paystack/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to initialize payment');
  }

  return data;
}

/**
 * Verify a Paystack payment
 */
export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResponse> {
  const response = await fetch(`/api/paystack/verify?reference=${reference}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to verify payment');
  }

  return data;
}

/**
 * Load Paystack Popup JS
 */
export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already loaded
    if ((window as any).PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
  });
}

/**
 * Open Paystack payment popup
 */
export async function openPaystackPopup(
  params: InitializePaymentParams,
  onSuccess: (reference: string) => void,
  onClose: () => void
): Promise<void> {
  try {
    // Load Paystack script
    await loadPaystackScript();

    // Initialize payment
    const initResponse = await initializePayment(params);

    // Use hardcoded public key for now (will be replaced with env var)
    const publicKey = 'pk_test_cf6359045b18e7c7141a67ca3fd4c6837cc7d6f1';

    console.log('Initializing Paystack with key:', publicKey.substring(0, 15) + '...');

    // Open popup
    const handler = (window as any).PaystackPop.setup({
      key: publicKey,
      email: params.email,
      amount: params.amount * 100, // Convert to pesewas
      currency: 'GHS',
      ref: initResponse.data.reference,
      metadata: params.metadata,
      onClose: () => {
        console.log('Payment popup closed');
        onClose();
      },
      callback: (response: any) => {
        console.log('Payment successful:', response.reference);
        onSuccess(response.reference);
      },
    });

    handler.openIframe();
  } catch (error) {
    console.error('Paystack popup error:', error);
    throw error;
  }
}
