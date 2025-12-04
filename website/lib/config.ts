/**
 * Client-side configuration
 *
 * Environment variables prefixed with NEXT_PUBLIC_ are embedded in the
 * client bundle at build time. Access them here for use in client components.
 */

export const config = {
  paystack: {
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://beeline.works',
  },
  n8n: {
    webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '',
  },
} as const;
