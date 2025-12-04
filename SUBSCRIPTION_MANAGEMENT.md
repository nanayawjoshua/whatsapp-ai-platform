# Subscription Management System

**Date:** December 4, 2025
**Status:** ✅ Implemented - Ready for Testing

---

## Overview

The Beeline platform now has a complete subscription management system that automatically converts one-time payments into recurring subscriptions with a 7-day free trial period.

## How It Works

### Payment Flow with Subscription

```
User completes signup (Steps 1-3)
  ↓
Clicks "Pay GHS 99 & Continue"
  ↓
Makes first payment via Paystack
  ↓
Payment success webhook received
  ↓
System auto-creates subscription with 7-day trial
  ↓
User gets QR code (Step 4)
  ↓
After 7 days: First recurring charge
  ↓
Every 30 days: Subsequent recurring charges
```

## Key Features

### 1. **Automatic Subscription Creation**
- After first successful payment, system automatically subscribes the customer
- Uses the same card authorization from the initial payment
- No additional action required from the user

### 2. **7-Day Free Trial**
- First recurring charge happens 7 days after initial signup
- Gives vendors time to set up and test the AI assistant
- Trial period is implemented via `start_date` parameter

### 3. **Auto-Plan Creation**
- If the monthly plan doesn't exist, it's created automatically
- Plan details:
  - **Name:** Beeline Monthly Subscription
  - **Amount:** GHS 99/month
  - **Interval:** Monthly
  - **Currency:** GHS

### 4. **Webhook Integration**
- All subscription events are forwarded to n8n for processing
- Events tracked:
  - `subscription_auto_created` - When subscription is created
  - `subscription.create` - Paystack confirmation
  - `subscription.disable` - When user cancels
  - `invoice.create` - Recurring payment initiated
  - `invoice.update` - Recurring payment status change

## API Endpoints

### 1. Create Subscription Plan

**Endpoint:** `POST /api/paystack/subscription/create-plan`

**Request Body:**
```json
{
  "name": "Beeline Monthly Subscription",
  "amount": 99,
  "interval": "monthly",
  "description": "Monthly AI WhatsApp Assistant subscription"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Plan created successfully",
  "data": {
    "plan_code": "PLN_xxxxxx",
    "name": "Beeline Monthly Subscription",
    "amount": 99,
    "interval": "monthly"
  }
}
```

**Usage:**
```bash
curl https://beeline.works/api/paystack/subscription/create-plan \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Beeline Monthly","amount":99,"interval":"monthly"}'
```

### 2. Get All Plans

**Endpoint:** `GET /api/paystack/subscription/create-plan`

**Response:**
```json
{
  "status": true,
  "data": [
    {
      "plan_code": "PLN_xxxxxx",
      "name": "Beeline Monthly Subscription",
      "amount": 99,
      "interval": "monthly",
      "currency": "GHS"
    }
  ]
}
```

### 3. Subscribe Customer to Plan

**Endpoint:** `POST /api/paystack/subscription/subscribe`

**Request Body:**
```json
{
  "customer": "customer@email.com",
  "plan": "PLN_xxxxxx",
  "start_date": "2025-12-11T00:00:00Z"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Subscription created successfully",
  "data": {
    "subscription_code": "SUB_xxxxxx",
    "customer": {...},
    "plan": {...},
    "status": "active",
    "amount": 99,
    "next_payment_date": "2025-12-11T00:00:00Z",
    "email_token": "xxxxxx"
  }
}
```

### 4. Get Subscription Details

**Endpoint:** `GET /api/paystack/subscription/subscribe?subscription_code=SUB_xxxxxx`

**Response:**
```json
{
  "status": true,
  "data": {
    "subscription_code": "SUB_xxxxxx",
    "customer": {...},
    "plan": {...},
    "status": "active",
    "amount": 99,
    "next_payment_date": "2025-12-11T00:00:00Z",
    "invoices_history": [...]
  }
}
```

## Environment Variables

Add this new variable to both `.env.local` and Vercel:

```bash
PAYSTACK_MONTHLY_PLAN_CODE=PLN_beeline_monthly_99
```

**Note:** If this variable is not set or the plan doesn't exist, the system will auto-create it on the first payment.

## Webhook Events

### Events Sent to n8n:

#### 1. `payment_success`
Sent when initial payment succeeds (existing functionality)

```json
{
  "event": "payment_success",
  "reference": "xxx",
  "amount": 99,
  "currency": "GHS",
  "customer": {...},
  "vendorData": {...},
  "paid_at": "2025-12-04T10:00:00Z"
}
```

#### 2. `subscription_auto_created`
Sent when subscription is automatically created after payment

```json
{
  "event": "subscription_auto_created",
  "subscription_code": "SUB_xxxxxx",
  "customer": {...},
  "plan": {...},
  "next_payment_date": "2025-12-11T00:00:00Z",
  "status": "active",
  "initial_payment": {
    "reference": "xxx",
    "amount": 99
  }
}
```

#### 3. `subscription_created`
Sent when Paystack confirms subscription creation

```json
{
  "event": "subscription_created",
  "subscription_code": "SUB_xxxxxx",
  "customer": {...},
  "plan": {...},
  "next_payment_date": "2025-12-11T00:00:00Z"
}
```

#### 4. `subscription_cancelled`
Sent when user cancels subscription

```json
{
  "event": "subscription_cancelled",
  "subscription_code": "SUB_xxxxxx",
  "customer": {...}
}
```

#### 5. `recurring_payment_success`
Sent when recurring payment succeeds

```json
{
  "event": "recurring_payment_success",
  "invoice_id": "INV_xxxxxx",
  "amount": 99,
  "customer": {...},
  "subscription": {...}
}
```

## Testing

### Manual Testing Steps:

1. **Create a Test Payment:**
   - Go to https://beeline.works/signup
   - Fill in signup form
   - Complete payment with real card (LIVE mode)

2. **Verify Subscription Created:**
   - Check Vercel function logs for:
     - "Auto-subscribing customer: [email]"
     - "Subscription created successfully: SUB_xxxxx"
   - Check Paystack dashboard under Subscriptions
   - Verify next payment date is 7 days from signup

3. **Check n8n Webhook:**
   - Verify n8n received `subscription_auto_created` event
   - Check vendor record has subscription_code

4. **Monitor First Recurring Charge:**
   - Wait 7 days (or manually trigger in Paystack)
   - Verify `invoice.create` webhook received
   - Verify `recurring_payment_success` sent to n8n

### Using the API Directly:

#### Create a Plan:
```bash
curl https://beeline.works/api/paystack/subscription/create-plan \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Plan",
    "amount": 99,
    "interval": "monthly",
    "description": "Test monthly plan"
  }'
```

#### Get All Plans:
```bash
curl https://beeline.works/api/paystack/subscription/create-plan
```

#### Subscribe a Customer:
```bash
curl https://beeline.works/api/paystack/subscription/subscribe \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "test@example.com",
    "plan": "PLN_xxxxxx",
    "start_date": "2025-12-11T00:00:00Z"
  }'
```

#### Get Subscription Details:
```bash
curl "https://beeline.works/api/paystack/subscription/subscribe?subscription_code=SUB_xxxxxx"
```

## Paystack Dashboard

### View Subscriptions:
1. Go to https://dashboard.paystack.com
2. Navigate to **Subscriptions** in the left menu
3. See all active/cancelled subscriptions
4. View subscription details, invoices, and payment history

### Create Plan Manually (Alternative):
1. Go to **Plans** in Paystack dashboard
2. Click **Create Plan**
3. Fill in:
   - Name: Beeline Monthly Subscription
   - Amount: 9900 (GHS 99 in pesewas)
   - Interval: Monthly
   - Currency: GHS
4. Copy the plan_code
5. Add to Vercel as `PAYSTACK_MONTHLY_PLAN_CODE`

### Monitor Recurring Payments:
1. Go to **Transactions** → **Live**
2. Filter by "Subscription" type
3. See all recurring charges

## Error Handling

### Common Issues and Solutions:

#### 1. "Plan not found"
- **Cause:** Plan doesn't exist in Paystack
- **Solution:** System will auto-create it. Check logs for new plan_code.
- **Manual Fix:** Create plan in Paystack dashboard

#### 2. "No authorization found"
- **Cause:** Customer hasn't made a successful payment yet
- **Solution:** Ensure webhook is called only after `charge.success`
- **Check:** Verify authorization_code exists in payment data

#### 3. "Subscription already exists"
- **Cause:** Customer is already subscribed
- **Solution:** Update existing subscription instead of creating new
- **Check:** Query customer's subscriptions before creating

#### 4. "Invalid start_date"
- **Cause:** Date is in the past or wrong format
- **Solution:** Use ISO 8601 format: `2025-12-11T00:00:00Z`
- **Check:** Date calculation in webhook handler

## Subscription Lifecycle

### 1. Active State
- User is subscribed and card is being charged monthly
- Status: `active`
- Actions: Can cancel, update card

### 2. Cancelled State
- User or admin cancelled subscription
- Status: `cancelled`
- Actions: Can resubscribe

### 3. Failed Payment
- Recurring charge failed (insufficient funds, expired card)
- Status: `non-renewing` or `attention`
- Actions: User should update card details

## Next Steps

### Immediate:
1. ✅ Add `PAYSTACK_MONTHLY_PLAN_CODE` to Vercel environment variables
2. Deploy updated webhook handler
3. Test with a real payment
4. Monitor Vercel logs for subscription creation

### Future Enhancements:
1. **Vendor Dashboard** - Display subscription status
2. **Cancel Subscription** - Allow vendors to cancel from dashboard
3. **Update Payment Method** - Let users update card details
4. **Subscription Pause** - Temporary suspension feature
5. **Email Notifications** - Alert users before recurring charges
6. **Failed Payment Retry Logic** - Auto-retry failed payments
7. **Proration** - Handle plan upgrades/downgrades

## Support

### Check Logs:
- **Vercel:** https://vercel.com/dashboard → Your Project → Functions → Filter by `/api/paystack/webhook`
- **Paystack:** https://dashboard.paystack.com → Logs → Webhooks
- **n8n:** https://n8n-latest-4dbq.onrender.com → Executions

### Debug Webhook:
```javascript
// In webhook handler, add detailed logging:
console.log('Payment data:', JSON.stringify(data, null, 2));
console.log('Authorization:', data.authorization);
console.log('Customer:', data.customer);
```

---

## Summary

The subscription system is now fully implemented with:
- ✅ Automatic subscription creation after first payment
- ✅ 7-day free trial period
- ✅ Auto-plan creation if needed
- ✅ Webhook integration with n8n
- ✅ API endpoints for manual management
- ✅ Comprehensive error handling

**Status:** Ready for deployment and testing!

---

**Last Updated:** December 4, 2025
**Version:** 1.0
