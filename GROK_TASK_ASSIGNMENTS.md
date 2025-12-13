# GROK TASK ASSIGNMENTS
## Coding Tasks for Grok (OpenCode TUI)
**Date:** December 13, 2025
**Status:** Ready for dispatch
**Coordination:** Claude Code (Haiku) + Grok (OpenCode TUI)

---

## 🎯 GROK'S ROLE IN BUZZ

**Grok is now assigned to:**
1. Planning & Architecture (existing)
2. **CODE GENERATION** (new assignments below)
3. Testing & Verification (new assignments below)

**Why Grok for coding?**
- Free tier available
- Fast iteration for non-complex tasks
- Handles routine coding efficiently
- Frees Claude Code for complex integrations
- 70/20/10 rule: Free tools first, then Cursor, then Claude Code

**Important Note on Grok's Limitations:**
Grok (and any AI) cannot:
- ❌ Access external websites or dashboards
- ❌ Log into accounts or services
- ❌ Click buttons in web UIs
- ❌ Make HTTP requests to external APIs
- ❌ Handle authentication flows

**What Grok CAN do:**
- ✅ Write complete code files
- ✅ Generate SQL queries and scripts
- ✅ Create configuration files
- ✅ Review and optimize code
- ✅ Provide step-by-step instructions for YOU to execute
- ✅ Analyze problems and debug issues

**Our Workflow (Highly Effective):**
1. **Grok** → Writes code, creates SQL, provides exact instructions
2. **You** → Executes in dashboard/terminal, tests functionality
3. **You Report** → Share results, errors, screenshots
4. **Grok** → Iterates, fixes, optimizes

This approach is BETTER than traditional because:
- You have full visibility and control
- Instant feedback loop (you test immediately)
- No credential sharing or security risks
- You can learn and maintain the system yourself

---

## 📋 PHASE 2: SUPABASE SETUP (IMMEDIATE - TODAY)

### GROK Task 2.2A: Create Schema Verification Script
**Status:** READY FOR DISPATCH (WHAT GROK WILL WRITE)
**Complexity:** Routine (SQL queries + Node.js test script)
**Duration:** 15 minutes (for Grok to write)

**WHAT GROK WRITES (NOT Execute):**

Grok will create:
1. **verification_queries.sql** - All SQL queries to test the database
2. **test_supabase_connection.js** - Automated Node.js test script
3. **PHASE_2_VERIFICATION_TEMPLATE.md** - Documentation template for results

**GROK TASK:**
```
Create the following files for BUZZ Phase 2 verification:

FILE 1: verification_queries.sql
A SQL file with all verification queries to test the Supabase database.
Include:
- Query to count tables (expect 7)
- Query to list all table names
- Query to check vendors table is empty
- Query to verify columns exist
- Query to check RLS policies are enabled
- Query to test each table has proper indexes
- Query to verify storage bucket

Format: Each query clearly labeled with expected result

FILE 2: test_supabase_connection.js
A Node.js script that:
- Connects to Supabase using credentials
- Tests connection
- Verifies all 7 tables exist
- Checks table structure
- Verifies RLS is enabled
- Lists all policies
- Tests CRUD operations (create, read, update)
- Generates a detailed report
- Exit with 0 if all tests pass, 1 if any fail

FILE 3: PHASE_2_VERIFICATION_TEMPLATE.md
A markdown template for documenting results:
- Timestamp of when tests ran
- Test results for each check
- Any errors encountered
- Screenshots/output to paste
- Sign-off checklist

All files ready for USER to run.
```

**HUMAN TASK (What YOU Will Do):**
1. Go to Supabase dashboard
2. Import schema from shared/supabase-schema.sql
3. Run verification queries from verification_queries.sql
4. Run Node.js test script: `node test_supabase_connection.js`
5. Fill out PHASE_2_VERIFICATION_TEMPLATE.md with results
6. Report results back to Grok

**DELIVERABLES FROM GROK:**
☐ verification_queries.sql created (all test queries)
☐ test_supabase_connection.js created (automated test)
☐ PHASE_2_VERIFICATION_TEMPLATE.md created (results template)

---

### GROK Task 2.2B: Create Supabase Client Library
**Status:** READY FOR DISPATCH
**Complexity:** Routine (boilerplate client wrapper)
**Duration:** 15 minutes
**Files to create:** `shared/supabase-client.ts` and `website/lib/supabase.ts`

**GROK TASK:**
```
Create two TypeScript files for Supabase client initialization
that can be used across the project.

FILE 1: shared/supabase-client.ts
Purpose: Shared Supabase client for server-side operations
Write this file with:
- Import @supabase/supabase-js
- Initialize client with SUPABASE_URL and SUPABASE_SERVICE_KEY
- Export client for use in backend functions
- Add error handling for missing environment variables
- Add JSDoc comments explaining usage

Example structure:
import { createClient } from '@supabase/supabase-js';

// Initialize with service key for admin operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Add helper functions:
export async function getVendor(vendorId: string) { ... }
export async function updateVendorWallet(vendorId: string, amount: number) { ... }

FILE 2: website/lib/supabase.ts
Purpose: Client-side Supabase client for browser operations
Write this file with:
- Import @supabase/supabase-js
- Initialize client with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY
- Export client for use in React components
- Add type definitions for custom tables
- Add JSDoc comments

Example structure:
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

// Type definitions
export type Vendor = { id: string; phone: string; ... };
export type Product = { ... };

REQUIREMENTS:
✓ Both files use proper TypeScript types
✓ Environment variables validated
✓ Error messages are helpful
✓ Can be imported easily: import { supabase } from '@/lib/supabase'
✓ Includes JSDoc comments for all functions
✓ Follows existing project structure and naming conventions

DELIVERABLES:
☐ shared/supabase-client.ts created with admin client
☐ website/lib/supabase.ts created with public client
☐ Both files have proper TypeScript types
☐ Environment variables validated
☐ JSDoc comments added
☐ Files committed to buzz branch
```

**GROK SPECIFIC INSTRUCTIONS:**
- Write complete, production-ready code
- Include error handling
- Add type definitions for database tables
- Follow TypeScript best practices
- Assume the project uses Next.js 14+

---

## 📋 PHASE 3: WEBSITE MIGRATION (NEXT 2 DAYS)

### GROK Task 3.1: Update website/package.json
**Status:** READY FOR DISPATCH (after Phase 2)
**Complexity:** Very Routine (dependency management)
**Duration:** 10 minutes

**GROK TASK:**
```
Update website/package.json to include Supabase client and remove old dependencies.

CURRENT STATE:
- Project likely has Render PostgreSQL driver
- May have old environment variables for Render

NEW STATE SHOULD HAVE:
- @supabase/supabase-js (for database access)
- Remove: Any direct PostgreSQL drivers (pg, postgres)
- Keep: All existing Next.js dependencies

STEPS:
1. Read current website/package.json
2. Add to dependencies: "@supabase/supabase-js": "^2.38.0"
3. Remove any of these if present:
   - pg
   - postgres
   - postgresql
   - @types/pg
4. Keep all other dependencies unchanged
5. Run: npm install (test locally)
6. Document changes in commit message

FILE: website/package.json

DELIVERABLES:
☐ Supabase client added to dependencies
☐ Old PostgreSQL drivers removed
☐ Dependencies can be installed without errors
☐ Changes committed to buzz branch
```

---

### GROK Task 3.2: Migrate /api/vendor/dashboard endpoint
**Status:** READY FOR DISPATCH (after 3.1)
**Complexity:** Routine (SQL to Supabase client rewrite)
**Duration:** 30 minutes
**Current file:** website/app/api/vendor/dashboard/route.ts

**GROK TASK:**
```
Migrate /api/vendor/dashboard from Render PostgreSQL to Supabase.

CURRENT ENDPOINT:
- Located at: website/app/api/vendor/dashboard/route.ts
- Currently uses: Render PostgreSQL connection
- Returns: { vendors: [...], total_earnings: X, product_count: Y }

NEW ENDPOINT SHOULD:
- Use Supabase client from shared/supabase-client.ts
- Query vendors table for authenticated user
- Query products table for user's products
- Query transactions table for user's earnings
- Return same response format

CHANGES NEEDED:
1. Replace PostgreSQL client with Supabase
2. Update queries:
   a) Get vendor info:
      SELECT * FROM vendors WHERE id = $1
   b) Get product count:
      SELECT COUNT(*) FROM products WHERE vendor_id = $1
   c) Get total earnings:
      SELECT SUM(net_amount) FROM transactions WHERE vendor_id = $1
   d) Get recent transactions:
      SELECT * FROM transactions WHERE vendor_id = $1 ORDER BY created_at DESC LIMIT 10

3. Update error handling
4. Test with curl or Postman

DELIVERABLES:
☐ File migrated to use Supabase
☐ All queries work without errors
☐ Response format unchanged
☐ Tested locally: curl http://localhost:3000/api/vendor/dashboard
☐ Committed to buzz branch
```

---

### GROK Task 3.3: Migrate /api/products/create endpoint
**Status:** READY FOR DISPATCH (after 3.1)
**Complexity:** Routine (SQL to Supabase insert)
**Duration:** 20 minutes

**GROK TASK:**
```
Migrate /api/products/create from Render PostgreSQL to Supabase.

CURRENT ENDPOINT:
- Located at: website/app/api/products/create/route.ts
- Accepts: { title, description, price, category, vendor_id }
- Inserts into products table

NEW ENDPOINT SHOULD:
- Use Supabase client
- Insert product into Supabase products table
- Return created product with ID
- Handle errors (vendor doesn't exist, missing fields, etc.)

CHANGES NEEDED:
1. Replace PostgreSQL with Supabase
2. Update insert statement:
   const { data, error } = await supabase
     .from('products')
     .insert({
       vendor_id,
       title,
       description,
       price,
       category,
       status: 'active'
     })
     .select()
     .single();
3. Add proper error handling
4. Return created product with ID

DELIVERABLES:
☐ File migrated to use Supabase
☐ Products can be inserted successfully
☐ Returns product ID and all fields
☐ Tested locally with sample data
☐ Committed to buzz branch
```

---

## 📋 PHASE 4: PHONE BRIDGE (DAYS 3-4)

### GROK Task 4.1: Create phone_bridge/config.ts
**Status:** READY FOR DISPATCH (after Supabase live)
**Complexity:** Routine (configuration management)
**Duration:** 15 minutes

**GROK TASK:**
```
Create phone bridge configuration file with all environment variables
and default settings.

FILE: phone_bridge/config.ts

SHOULD INCLUDE:
1. Port configuration
2. Supabase configuration
3. Groq API configuration
4. WhatsApp settings
5. Logging configuration

EXAMPLE STRUCTURE:
export const config = {
  port: process.env.PORT || 3001,
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'mixtral-8x7b-32768',
  },
  whatsapp: {
    sessionId: 'beeline-mvp',
    qrTimeout: 60000,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};

REQUIREMENTS:
✓ Validates all required environment variables
✓ Has sensible defaults
✓ Exports TypeScript types
✓ Includes JSDoc comments
✓ Can be imported: import { config } from './config'

DELIVERABLES:
☐ phone_bridge/config.ts created
☐ All config options included
☐ Environment variables validated
☐ TypeScript types defined
☐ Committed to buzz branch
```

---

### GROK Task 4.2: Create phone_bridge/utils/database.ts
**Status:** READY FOR DISPATCH
**Complexity:** Routine (database utility functions)
**Duration:** 20 minutes

**GROK TASK:**
```
Create utility functions for phone bridge to interact with Supabase.

FILE: phone_bridge/utils/database.ts

FUNCTIONS NEEDED:
1. async logMessage(vendorId, message, type)
   - Insert message into messages table
   - type: 'received' | 'sent'

2. async getVendor(vendorId)
   - Get vendor details from vendors table
   - Return: { id, phone, name, category, whatsapp_connected }

3. async updateVendorStatus(vendorId, status)
   - Update vendor.whatsapp_connected flag
   - status: true | false

4. async createTransaction(vendorId, amount, buyerPhone)
   - Insert transaction into transactions table
   - Calculate commission (5%)
   - Update vendor wallet

5. async getVendorMessages(vendorId, limit = 20)
   - Get recent messages for vendor
   - Ordered by newest first

REQUIREMENTS:
✓ All functions are async
✓ Error handling included
✓ TypeScript types for all parameters
✓ JSDoc comments for each function
✓ Uses Supabase client from shared/supabase-client.ts

DELIVERABLES:
☐ phone_bridge/utils/database.ts created with all 5 functions
☐ All functions tested with sample data
☐ Error handling in place
☐ TypeScript types defined
☐ Committed to buzz branch
```

---

## 📋 PHASE 5: GROK INTEGRATION (DAY 4)

### GROK Task 5.1: Create phone_bridge/utils/grok-client.ts
**Status:** READY FOR DISPATCH (after Groq API key obtained)
**Complexity:** Routine (API client wrapper)
**Duration:** 15 minutes

**GROK TASK:**
```
Create Groq API client wrapper for message classification.

FILE: phone_bridge/utils/grok-client.ts

FUNCTIONALITY:
- Initialize Groq client with API key
- Implement classifyMessage(text) function
- Return classification: { type, category, confidence }

TYPES OF CLASSIFICATIONS:
1. product_upload: "I have shoes, size 10, GHS 150"
2. buyer_inquiry: "Do you have this product available?"
3. status_update: "I'll have new stock tomorrow"
4. other: Anything else

EXAMPLE:
async function classifyMessage(messageText: string) {
  const response = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `Classify this vendor message:
      "${messageText}"

      Return JSON: {
        "type": "product_upload"|"buyer_inquiry"|"status_update"|"other",
        "category": "electronics"|"fashion"|"services"|"other",
        "confidence": 0-100
      }
      Only return valid JSON.`
    }]
  });

  return JSON.parse(response.choices[0].message.content);
}

REQUIREMENTS:
✓ Handles API errors gracefully
✓ Has retry logic (1-2 retries)
✓ Validates Groq response
✓ TypeScript types for all returns
✓ JSDoc comments

DELIVERABLES:
☐ phone_bridge/utils/grok-client.ts created
☐ classifyMessage() function works
☐ Error handling in place
☐ Tested with sample messages
☐ Committed to buzz branch
```

---

## 📋 PHASE 6: JIJI LEAD GENERATION (WEEK 2)

### GROK Task 6.1: Create n8n webhook handler (website)
**Status:** READY FOR DISPATCH (after n8n setup)
**Complexity:** Routine (webhook endpoint)
**Duration:** 20 minutes

**GROK TASK:**
```
Create API endpoint for n8n to send WhatsApp messages and track responses.

FILE: website/app/api/n8n/webhook/route.ts

PURPOSE:
n8n workflow will call this endpoint to:
1. Send WhatsApp message via phone bridge
2. Log the outreach in database
3. Track response in jiji_leads table

ENDPOINT: POST /api/n8n/webhook

REQUEST BODY:
{
  "phone": "+233501234567",
  "name": "Vendor Name",
  "category": "electronics",
  "jiji_url": "https://jiji.ng/...",
  "quality_score": 85,
  "message": "Hi! Selling on Jiji? Join Beeline..."
}

RESPONSE:
{
  "success": true,
  "messageId": "uuid",
  "timestamp": "2025-12-13T10:30:00Z"
}

WHAT IT DOES:
1. Calls phone bridge to send WhatsApp message
2. Inserts into jiji_leads table
3. Logs in outreach_campaigns table
4. Returns success/failure

DELIVERABLES:
☐ website/app/api/n8n/webhook/route.ts created
☐ Accepts POST requests from n8n
☐ Sends WhatsApp via phone bridge
☐ Logs to jiji_leads table
☐ Returns proper response
☐ Committed to buzz branch
```

---

## 🚀 EXECUTION SCHEDULE

**TODAY (Dec 13):**
- Grok Task 2.2A: Schema import & verification → 20 min
- Grok Task 2.2B: Supabase client library → 15 min
- **Status: Phase 2 COMPLETE**

**TOMORROW (Dec 14):**
- Grok Task 3.1: Update package.json → 10 min
- Grok Task 3.2: Migrate dashboard API → 30 min
- Grok Task 3.3: Migrate products API → 20 min
- Claude Code: Test integrations & deploy → 1-2 hours
- **Status: Phase 3 COMPLETE**

**Day 3 (Dec 15):**
- Grok Task 4.1: Phone bridge config → 15 min
- Grok Task 4.2: Database utilities → 20 min
- Claude Code: Deploy phone bridge → 2 hours
- **Status: Phase 4 COMPLETE**

**Day 4 (Dec 16):**
- Grok Task 5.1: Grok client wrapper → 15 min
- Claude Code: Integrate into phone bridge → 1 hour
- **Status: Phase 5 COMPLETE**

**Week 2 (Dec 20-27):**
- Grok Task 6.1: n8n webhook handler → 20 min
- Claude Code: n8n workflow setup + testing → 2 hours
- You: Launch first batch (50 vendors) → 1 hour
- **Status: Phase 6 COMPLETE**

---

## 💾 HOW TO DISPATCH TASKS TO GROK

**Format for each task dispatch:**

```
GROK TASK DISPATCH:

Task: [Task Name]
File(s): [Files to create/modify]
Complexity: [Routine/Moderate/Complex]
Duration: [Estimate]
Context: [Brief background]

INSTRUCTIONS:
[Copy the GROK TASK content from this document]

ACCEPTANCE CRITERIA:
☐ [Criterion 1]
☐ [Criterion 2]
☐ [Criterion 3]

When complete, reply with:
- File path and content
- Testing results
- Any issues encountered
- Ready for commit
```

---

## 📊 WORKLOAD DISTRIBUTION

**Total Tasks: 11**

| Phase | Grok Tasks | Claude Tasks | Human Tasks | Hours |
|-------|-----------|--------------|------------|-------|
| 2 | 2 | 0 | 1 (approval) | 1 |
| 3 | 3 | 1 | 0 | 2 |
| 4 | 2 | 1 | 1 (setup) | 3 |
| 5 | 1 | 1 | 1 (Groq key) | 1 |
| 6 | 1 | 1 | 1 (n8n setup) | 2 |
| **Total** | **9** | **4** | **4** | **9** |

**Cost:**
- Grok: FREE
- Claude Code: ~$40 (4 moderate sessions)
- Groq API: ~$5 (message classification)
- **Total: $45 vs. $2,450/month saved** ✅

---

*GROK Task Assignments | Ready for Dispatch | Immediate Execution*
