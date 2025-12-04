# Vercel Environment Variables Setup

## Quick Setup Guide

Your Paystack API keys are ready. Follow these steps to configure Vercel:

### 1. Add Environment Variables to Vercel

Go to: https://vercel.com/dashboard → Select your project → Settings → Environment Variables

Add these **3 variables** for **Production, Preview, and Development**:

#### Variable 1: NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
```
pk_test_cf6359045b18e7c7141a67ca3fd4c6837cc7d6f1
```
**Environments:** ✅ Production ✅ Preview ✅ Development

#### Variable 2: PAYSTACK_SECRET_KEY
```
sk_test_f6a1c8d88643475abdbf16f3c6249278554e8e87
```
**Environments:** ✅ Production ✅ Preview ✅ Development

#### Variable 3: PAYSTACK_WEBHOOK_SECRET
```
(Get this from Paystack dashboard - see step 2 below)
```
**Environments:** ✅ Production ✅ Preview ✅ Development

### 2. Set Up Paystack Webhook

1. Go to: https://dashboard.paystack.com/#/settings/developers
2. Click "API Keys & Webhooks" tab
3. Scroll to "Webhooks" section
4. Click "Add Webhook URL"
5. Enter webhook URL:
   ```
   https://beeline.works/api/paystack/webhook
   ```
6. Select these events:
   - ✅ charge.success
   - ✅ subscription.create
   - ✅ subscription.disable
   - ✅ invoice.create
   - ✅ invoice.update

7. **Copy the Webhook Secret** that appears
8. Go back to Vercel and add it as `PAYSTACK_WEBHOOK_SECRET`

### 3. Redeploy

After adding environment variables:

**Option A - Via Dashboard:**
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

**Option B - Via Git:**
```bash
git commit --allow-empty -m "Trigger redeploy with Paystack env vars"
git push
```

### 4. Test Payment Flow

Once deployed, test the payment:

1. Go to: https://beeline.works/signup
2. Fill in the signup form (steps 1-3)
3. Click "Pay GHS 99 & Continue"
4. Use Paystack test card:
   - **Card Number:** 5060666666666666666
   - **CVV:** 123
   - **Expiry:** 12/25 (any future date)
   - **PIN:** 1234 (if prompted)

5. After successful payment:
   - You should see the QR code (step 4)
   - Check webhook was received in Paystack dashboard
   - Verify n8n received the vendor data

## Environment Variables Reference

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Public | Used in browser for Paystack Popup |
| `PAYSTACK_SECRET_KEY` | Secret | Used server-side for API calls |
| `PAYSTACK_WEBHOOK_SECRET` | Secret | Used to verify webhook signatures |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | Public | Already configured |
| `NEXT_PUBLIC_SITE_URL` | Public | Already configured |

## Troubleshooting

### Payment popup not opening?
- Check browser console for errors
- Verify `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set in Vercel
- Ensure you redeployed after adding env vars

### Payment verification fails?
- Check `PAYSTACK_SECRET_KEY` is correct
- Look at Vercel function logs for errors

### Webhook not working?
- Verify webhook URL is correct: `https://beeline.works/api/paystack/webhook`
- Check `PAYSTACK_WEBHOOK_SECRET` matches Paystack dashboard
- Test webhook in Paystack dashboard (they have a test button)

## Next Steps After Testing

Once payment works in test mode:

1. **Switch to Live Mode** (when ready for real payments):
   - Get live API keys from Paystack dashboard
   - Update Vercel environment variables with live keys (pk_live_..., sk_live_...)
   - Update webhook URL in Paystack to use live mode

2. **Enable Recurring Subscriptions**:
   - Create subscription plan in Paystack
   - Modify webhook to subscribe customer after first payment
   - Set start date to 7 days after payment (free trial period)

3. **Monitor Payments**:
   - Check Paystack dashboard regularly
   - Set up email notifications in Paystack
   - Monitor Vercel function logs

## Support

If you encounter issues:
- Check [PAYSTACK_SETUP.md](PAYSTACK_SETUP.md) for detailed documentation
- Review Vercel function logs for errors
- Check Paystack dashboard for failed webhooks
