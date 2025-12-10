# n8n Workflow: Backup Old → Import New

**Goal:** Safely backup your existing WhatsApp workflow, then import the new persona-aware workflow.

**Time:** 5-10 minutes

---

## Step 1: Backup Your Old Workflow

### 1a. Export Current Workflow from n8n

1. Go to your n8n instance: `https://n8n-latest-4dbq.onrender.com`
2. Click **Workflows** in the top menu
3. Find your WhatsApp workflow (look for one with a **Webhook** node at the start)
4. Click on it to open it
5. At the top-right corner, click the **three dots menu** (⋯)
6. Click **Download** or **Export** (exact wording depends on n8n version)
   - A `.json` file will download to your computer
   - Name it something like `whatsapp-old-backup.json`
7. **Move the downloaded file** to this location for safekeeping:
   ```
   workflows/backups/whatsapp-old-backup.json
   ```

### 1b. Create Backup Folder (First Time Only)

If the `workflows/backups/` folder doesn't exist, create it:

**Windows (PowerShell):**
```powershell
cd 'C:\Users\USER\Desktop\josh\whatsapp-ai-platform-beeline-main\whatsapp-ai-platform-beeline-main'
mkdir workflows\backups -Force
```

Then move your exported file into it.

### 1c. Deactivate Old Workflow (Optional but Recommended)

To prevent confusion, deactivate the old workflow:

1. In n8n, open the old workflow
2. At the top, click the **Active toggle** (should be green) to turn it **OFF** (gray)
3. Click **Save**

**Why:** If you keep both active on the same webhook path, n8n might execute both, causing duplicate responses.

---

## Step 2: Import New Workflow

### 2a. Access n8n Import Feature

1. Go to n8n: `https://n8n-latest-4dbq.onrender.com`
2. Click **Workflows** in the top menu (or the hamburger icon)
3. Click **+ New** or look for an **Import** button/option
4. Select **Import from file** (or similar option)

### 2b. Choose the New Workflow File

1. A file browser will appear
2. Navigate to this file on your computer:
   ```
   C:\Users\USER\Desktop\josh\whatsapp-ai-platform-beeline-main\whatsapp-ai-platform-beeline-main\workflows\n8n-groq-workflow.json
   ```
3. Select it and click **Open** or **Import**

### 2c. Verify Webhook Path

After import, the workflow will appear in your n8n with these nodes:
- ✅ **Webhook** (incoming messages)
- ✅ **Build Prompt (Code)** (vendor persona + history)
- ✅ **Call Groq (HTTP Request)** (LLM call)
- ✅ **Extract Reply (Code)** (parse response)
- ✅ **Respond to Webhook** (return to bridge)

**Check the Webhook node:**
1. Click the **Webhook** node (the first one)
2. Look at the **Path** field → should be `whatsapp`
3. If it's different, **change it to `whatsapp`** (to match your bridge's `N8N_WEBHOOK_URL`)

### 2d. Set Groq API Credentials

The workflow needs your Groq API key to call the LLM:

1. Click the **Call Groq (HTTP Request)** node
2. In the node settings, look for **Authentication** or **Credentials** section
3. Either:
   - **Select existing credential** if you already have a Groq API key configured, or
   - **Add new credential**:
     - Type: `API Key` or `HTTP Header Auth` (depends on n8n version)
     - Name: `Groq API`
     - Header Name: `Authorization`
     - Header Value: `Bearer YOUR_GROQ_API_KEY` (replace with your actual key from https://console.groq.com/keys)
     - Click **Save**
4. Back in the node, select the credential you just created

### 2e. Activate the New Workflow

1. At the top of the workflow, click the **Active toggle** to turn it **ON** (should be green)
2. Click **Save**
3. You should see a message like "Workflow activated" or "Now listening on webhook"

---

## Step 3: Verify the Workflow Is Working

### 3a. Quick Webhook Test (from n8n UI)

1. Click the **Webhook** node
2. Click **Listen for test event** (or similar button)
3. Open a new terminal/PowerShell and run:

```powershell
$body = @{
    vendorId = "test_hospital"
    customerId = "233501234567@s.whatsapp.net"
    message = "My name is Joshua"
    channel = "whatsapp"
    conversationHistory = @()
    timestamp = [int64](Get-Date -UFormat %s)
    vendor = @{
        name = "Test Hospital"
        businessType = "hospitality"
        personalityTone = "friendly"
        systemPromptOverride = $null
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://n8n-latest-4dbq.onrender.com/webhook/whatsapp" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body
```

4. Check n8n:
   - The workflow should execute (you'll see it in the execution log)
   - If successful, you'll see a green checkmark on each node
   - The **Respond to Webhook** node output should show `"reply": "..."` with an AI response

5. If there's an error:
   - Check the **Call Groq** node for credential issues
   - Check Render logs for bridge-side errors
   - Verify Groq API key is correct

---

## Step 4: Test with Full Conversation Memory

### 4a. Run the E2E Test (Proves Memory Works)

Once the workflow is imported and active, run the full test:

```powershell
cd 'C:\Users\USER\Desktop\josh\whatsapp-ai-platform-beeline-main\whatsapp-ai-platform-beeline-main\cloud'
node test-conversation-memory-e2e.js
```

**Expected Results:**
- ✅ Step 1: "My name is Joshua" → AI replies (e.g., "Hello Joshua!")
- ✅ Step 2: "What is my name?" (with history) → AI replies "Joshua" (remembers!)
- ✅ Step 3: "Do you remember..." (with full history) → AI demonstrates memory

If all 3 pass, **conversation memory is working correctly!**

### 4b: If Tests Fail

**Scenario A: Bridge shows `redis: timeout`**
- Redis connectivity issue (separate from workflow)
- Bridge still forwards messages but can't save history
- Workflow will receive empty `conversationHistory` in payload
- **Fix:** Follow Redis troubleshooting in main guide

**Scenario B: n8n returns canned response**
- Workflow's Code node or Groq call is failing
- Check n8n execution logs for errors
- Verify Groq API key is set correctly
- **Fix:** Step 2d above

**Scenario C: n8n returns different format**
- Extract Reply (Code) node may need adjustment
- Try posting directly to webhook and checking the response format
- Update the extraction logic if Groq's response shape changed
- **Fix:** Step 3a test, then debug the Code node

---

## Step 5: Cleanup (Optional)

Once you confirm the new workflow is working:

### Delete or Archive Old Workflow

1. In n8n, go to **Workflows**
2. Find the old workflow (should be **Deactivated** from Step 1c)
3. Click the **three dots** (⋯) next to it
4. Click **Delete** or **Archive**
5. Confirm the action

**Result:** Only the new workflow handles messages on `/webhook/whatsapp` path.

---

## Rollback Plan (If Something Goes Wrong)

If the new workflow doesn't work and you need to revert:

1. **Deactivate the new workflow** (toggle OFF)
2. In the old workflow (if you didn't delete it):
   - Click **Active toggle** to turn it **ON**
   - Click **Save**
3. Bridge will automatically use the old workflow again (same webhook path)
4. Contact support with the new workflow's execution logs

**Backed-up file location:** `workflows/backups/whatsapp-old-backup.json`
- Keep this safe for future reference

---

## Summary of What Changed

| Aspect | Old Workflow | New Workflow |
|--------|------------|-------------|
| **Vendor Persona** | ❌ Ignored | ✅ Uses `vendor.personalityTone`, `businessType`, etc. |
| **Conversation History** | ❌ Ignored | ✅ Injects into messages array |
| **System Prompt** | Hardcoded or missing | ✅ Built dynamically from vendor config |
| **Context Awareness** | ❌ No | ✅ Yes (AI remembers previous messages) |
| **Response Format** | Unpredictable | ✅ Always returns `"reply": "..."` |

---

## Checkpoint: You're Ready When...

- [x] Old workflow backed up to `workflows/backups/`
- [x] Old workflow deactivated in n8n
- [x] New workflow imported
- [x] Webhook path is `whatsapp`
- [x] Groq API credential is set
- [x] New workflow is **Active** (green toggle)
- [x] Quick webhook test returns a `reply` field
- [x] Full E2E test shows 3/3 passing

---

## Questions?

- **Webhook won't respond?** → Check n8n execution logs (red X on nodes)
- **Groq API errors?** → Verify key from https://console.groq.com/keys
- **Memory still not working?** → Likely Redis issue, not workflow issue
- **Want to keep both workflows?** → Import with different webhook path (e.g., `/webhook/whatsapp-v2`)

---

**Next:** After confirming the E2E test passes, redis connectivity issue is the remaining blocker for full production use.
