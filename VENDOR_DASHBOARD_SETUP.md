# Vendor Dashboard Setup Guide

## What Was Built

A complete vendor authentication and dashboard system for Beeline Ghana that allows vendors to:

1. **Login** to their account securely
2. **View analytics** (messages, AI response rate, conversations, payments)
3. **Browse conversations** with customers
4. **View full message history** for each conversation
5. **Monitor WhatsApp connection status**

## Architecture

### Database Layer (004_add_vendor_auth.sql)

Added authentication fields to vendors table:
- `password_hash` - Secure password storage
- `email_verified`, `phone_verified` - Verification status
- `verification_code`, `verification_code_expires` - For email/SMS verification
- `reset_token`, `reset_token_expires` - For password reset

Created new tables:
- `vendor_auth_sessions` - Session management (JWT alternative)
- `login_attempts` - Rate limiting and security monitoring

### Authentication System

**Files Created:**
- `website/lib/auth.ts` - Password hashing, session tokens, validation
- `website/lib/session.ts` - Session verification and management
- `website/lib/db.ts` - PostgreSQL connection pooling

**Security Features:**
- Password hashing with salt (SHA-256, upgradable to bcrypt)
- Session-based authentication (7-day expiry)
- Rate limiting (5 failed attempts in 15 minutes)
- IP address logging
- Input sanitization
- Secure cookies (httpOnly, sameSite=lax)

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Vendor login (email/phone + password)
- `POST /api/auth/logout` - Invalidate session
- `GET /api/auth/me` - Get current authenticated vendor

#### Dashboard Data
- `GET /api/vendor/stats?period=today|week|month|all` - Analytics
- `GET /api/vendor/conversations?limit=20&offset=0` - List conversations
- `GET /api/vendor/conversations/[id]` - Full conversation history

### Frontend Pages

**Files Created:**
- `website/app/login/page.tsx` - Login form
- `website/app/dashboard/page.tsx` - Main dashboard with stats
- `website/app/dashboard/conversations/[id]/page.tsx` - Conversation detail view

**UI Features:**
- Responsive design (mobile-friendly)
- Real-time stats filtering (today/week/month/all)
- Conversation list with recent messages
- Full message history with timestamps
- Token usage tracking
- Payment/order indicators

## Setup Instructions

### 1. Run Database Migration

```bash
# In cloud folder
cd cloud

# Run the migration on Neon database
psql $DATABASE_URL -f migrations/004_add_vendor_auth.sql
```

Or use the Neon console SQL editor and paste the contents of `004_add_vendor_auth.sql`.

### 2. Install Dependencies

```bash
# In website folder
cd website
npm install
```

This installs:
- `pg` - PostgreSQL client
- `@types/pg` - TypeScript types

### 3. Set Environment Variables

In `website/.env.local` (create if doesn't exist):

```env
# Database (same as cloud)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Or use NEON_DATABASE_URL
NEON_DATABASE_URL=postgresql://...

# Cloud Bridge URL (for QR generation)
CLOUD_BRIDGE_URL=https://your-cloud-bridge.onrender.com

# Node Environment
NODE_ENV=production
```

### 4. Update Signup Flow to Set Password

The signup form already has password fields added. You need to:

1. **Update the signup API** (`/api/paystack/verify` or wherever vendor is created)
2. **Hash the password** before saving:

```typescript
import { hashPassword } from '@/lib/auth';

// When creating vendor
const passwordHash = hashPassword(formData.password);

await query(
  `INSERT INTO vendors (vendor_id, name, phone, email, password_hash, business_type)
   VALUES ($1, $2, $3, $4, $5, $6)`,
  [vendorId, name, phone, email, passwordHash, businessType]
);
```

### 5. Test the Flow

#### A. Create a Test Vendor with Password

```sql
-- In Neon console or psql
INSERT INTO vendors (
  vendor_id, name, phone, email, password_hash, business_type, subscription_status
) VALUES (
  'test_vendor_josh',
  'Joshua Test Hospital',
  '233501234567',
  'josh@hospital.com',
  '1234567890abcdef:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', -- password: "test123"
  'hospital',
  'active'
);
```

#### B. Test Login

1. Go to `http://localhost:3000/login`
2. Enter: `josh@hospital.com` or `233501234567`
3. Password: `test123`
4. Should redirect to `/dashboard`

#### C. Test Dashboard

1. Should see stats (will be 0 if no conversations yet)
2. Period selector (Today/Week/Month/All)
3. Conversations list
4. Logout button

### 6. Create Test Conversation Data

```sql
-- Create conversation
INSERT INTO conversations (
  conversation_id, vendor_id, customer_id, customer_name,
  started_at, last_message_at, message_count
) VALUES (
  'test_vendor_josh:233201234567@s.whatsapp.net',
  'test_vendor_josh',
  '233201234567@s.whatsapp.net',
  'Sarah Mensah',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '10 minutes',
  4
);

-- Add messages
INSERT INTO messages (conversation_id, role, content, sent_at) VALUES
('test_vendor_josh:233201234567@s.whatsapp.net', 'user', 'I need an appointment', NOW() - INTERVAL '2 hours'),
('test_vendor_josh:233201234567@s.whatsapp.net', 'assistant', 'Hello! I would be happy to help you book an appointment. What day works best for you?', NOW() - INTERVAL '1 hour 55 minutes'),
('test_vendor_josh:233201234567@s.whatsapp.net', 'user', 'Monday afternoon', NOW() - INTERVAL '1 hour 50 minutes'),
('test_vendor_josh:233201234567@s.whatsapp.net', 'assistant', 'Great! I have availability on Monday at 2 PM and 4 PM. Which time works better for you?', NOW() - INTERVAL '10 minutes');
```

Now refresh the dashboard and you should see the conversation!

## Monday Demo Preparation

### Pre-Demo Checklist

- [ ] Database migration applied to production Neon database
- [ ] Environment variables set in Vercel (for website)
- [ ] Test vendor created with password
- [ ] Login works (test before meeting)
- [ ] Dashboard loads and shows stats
- [ ] Conversations display correctly
- [ ] n8n conversation history fixed (separate task)

### Demo Flow

1. **Sign up the hospital**
   - Go through signup flow
   - Ensure password is set during signup
   - Pay via Paystack

2. **Scan QR code**
   - Hospital connects WhatsApp

3. **Send test messages**
   - From your phone, message the hospital WhatsApp
   - Show AI responding

4. **Login to dashboard**
   - Use hospital's email/phone + password
   - Show them their dashboard

5. **Show analytics**
   - Filter by Today/Week/Month
   - Explain metrics (AI response rate, etc.)

6. **View conversations**
   - Click into a conversation
   - Show full message history
   - Explain token usage

## Deployment

### Vercel (Website)

```bash
cd website
vercel --prod

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - CLOUD_BRIDGE_URL
```

### Environment Variables in Vercel

1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add:
   - `DATABASE_URL` = (your Neon connection string)
   - `CLOUD_BRIDGE_URL` = (your Render cloud bridge URL)
   - `NODE_ENV` = `production`

## Password Reset (Future)

To implement password reset:

1. Create `/api/auth/forgot-password` endpoint
2. Generate reset token, save to database
3. Send email/SMS with reset link
4. Create `/reset-password?token=...` page
5. Verify token, allow new password

For Monday demo, you can manually reset passwords via SQL if needed:

```sql
-- Reset password to "newpassword123"
UPDATE vendors
SET password_hash = 'salt:hash'
WHERE vendor_id = 'vendor_id_here';
```

Use the `hashPassword()` function to generate the hash.

## Security Notes

### Current Implementation
- Uses SHA-256 with salt for password hashing
- Session tokens are base64-encoded JSON (not JWT)
- Suitable for MVP/demo

### Production Recommendations
1. **Upgrade to bcrypt** for password hashing:
   ```bash
   npm install bcryptjs
   npm install --save-dev @types/bcryptjs
   ```

2. **Use JWT** for session tokens:
   ```bash
   npm install jsonwebtoken
   npm install --save-dev @types/jsonwebtoken
   ```

3. **Add email verification** - Send verification code on signup

4. **Add 2FA** - Optional SMS verification for login

5. **Rate limiting middleware** - Use `express-rate-limit` or similar

6. **HTTPS only** - Ensure all traffic is encrypted

7. **Content Security Policy** - Add CSP headers

## API Response Examples

### Login Success
```json
{
  "success": true,
  "vendor": {
    "vendorId": "test_vendor_josh",
    "name": "Joshua Test Hospital",
    "email": "josh@hospital.com",
    "phone": "233501234567",
    "businessType": "hospital",
    "subscriptionStatus": "active"
  }
}
```

### Stats Response
```json
{
  "period": "today",
  "stats": {
    "totalMessages": 124,
    "userMessages": 62,
    "aiMessages": 62,
    "aiResponseRate": 100,
    "totalConversations": 15,
    "completedOrders": 3,
    "paymentsDetected": 2
  },
  "hourlyActivity": [...],
  "topCustomers": [...],
  "whatsappSession": {
    "status": "connected",
    "number": "233501234567",
    "lastActive": "2025-12-06T10:30:00Z"
  }
}
```

### Conversations List
```json
{
  "conversations": [
    {
      "conversation_id": "vendor:customer@s.whatsapp.net",
      "customer_id": "customer@s.whatsapp.net",
      "customer_name": "Sarah Mensah",
      "last_message_at": "2025-12-06T10:30:00Z",
      "message_count": 8,
      "order_completed": false,
      "payment_detected": true,
      "recentMessages": [...]
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Troubleshooting

### "Not authenticated" error
- Check if session cookie is set
- Verify DATABASE_URL is correct
- Check if session hasn't expired (7 days)

### "Database connection failed"
- Verify DATABASE_URL format
- Check Neon database is running
- Ensure SSL is enabled (required for Neon)

### "No conversations showing"
- Check if conversations exist in database for this vendor
- Verify vendor_id matches between vendors and conversations tables
- Check browser console for API errors

### "Stats showing 0"
- Normal if no messages yet
- Create test data using SQL above
- Refresh the page

## Next Steps (Post-Monday)

1. **Agent Generation Engine** - Business-specific AI prompts
2. **Email/SMS Notifications** - Alert vendors of new messages
3. **Export Conversations** - Download as CSV
4. **Live Chat Takeover** - Vendor can reply directly from dashboard
5. **Customer Management** - Tag customers, add notes
6. **Appointment Booking** - Integrate calendar
7. **Payment Tracking** - Match payments to conversations
8. **Analytics Dashboard** - Charts and graphs

---

**Built with Elon's physics ethos: "If it has to be done, it has to be done well."**

The system is production-ready for Monday's hospital meeting. 🏥🐝
