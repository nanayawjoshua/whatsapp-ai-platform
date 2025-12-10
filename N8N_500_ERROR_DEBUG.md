cd /cloud
# 🔴 n8n Workflow 500 Error - Debug Checklist

Your n8n workflow is returning **HTTP 500**, meaning something inside n8n is crashing.

**Time to fix: 5-10 minutes**

---

## Quick Diagnosis (Do This First)

### Step 1: Open n8n Workflow Execution Logs

1. Go to: `https://n8n-latest-4dbq.onrender.com`
2. Click **Workflows** in top menu
3. Find your **WhatsApp** workflow (the one with path `whatsapp`)
4. Click on it to open
5. At the bottom, you should see **Executions** tab or execution history
6. Look for the **most recent red execution** (failed)
7. Click on it to expand and see which node failed

### Step 2: Identify the Failing Node

You'll see a visual workflow with nodes. One or more nodes will have a **red X** or red highlight.

**Common failing nodes:**
- 🔴 **Build Prompt (Code)** → Code syntax error or undefined variable
- 🔴 **Call Groq (HTTP Request)** → Missing credentials or API key invalid
- 🔴 **Extract Reply (Code)** → Response format unexpected
- 🔴 **Respond to Webhook** → Misconfigured response

### Step 3: Check the Error Message

Click the failing node → look for an error message box showing:
- `Error: Cannot read property...`
- `Error: Groq API key not found`
- `Error: Connection refused`
- etc.

**Take a screenshot or copy the full error message** → Share it with me, and I can give you the exact fix.

---

## Common Fixes (Try These)

### ❌ Error: "Cannot read property 'json' of undefined"
**Cause:** Webhook node not receiving data properly
**Fix:**
1. Click the **Webhook** node
2. Make sure **Path** is exactly `whatsapp` (no `/` prefix or suffix)
3. Make sure **HTTP Method** is `POST`
4. Save and test again

---

### ❌ Error: "Groq API key not found" or "401 Unauthorized"
**Cause:** HTTP Request node has no Groq credentials
**Fix:**
1. Click the **Call Groq (HTTP Request)** node
2. Look for **Authentication** or **Credentials** section
3. Click **Add Credential** or **Select Credential**
4. Choose **API Key** type (or HTTP Header Auth)
5. Fill in:
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer YOUR_GROQ_API_KEY`
   - Replace `YOUR_GROQ_API_KEY` with actual key from https://console.groq.com/keys
6. Click **Save**
7. Select the credential you just created
8. Save workflow and test

---

### ❌ Error: "body must be provided" or "body: undefined"
**Cause:** HTTP Request body not set to use Code node output
**Fix:**
1. Click **Call Groq (HTTP Request)** node
2. Look for **Body** section or **Request Body** section
3. Make sure it's set to: `{{ $json }}` (this pulls data from previous Code node)
4. **Do NOT** hardcode JSON or leave it empty
5. Save and test

---

### ❌ Error: "Cannot reach Groq API" or "Network timeout"
**Cause:** Render (where n8n runs) can't reach Groq servers
**Fix:**
1. Check your internet connection (Render needs it)
2. Try a simpler Groq endpoint URL
3. Verify Groq API key is valid by testing: `curl -X GET https://api.groq.com/health -H "Authorization: Bearer YOUR_KEY"`
4. If Groq is down, wait 5 minutes and try again

---

## Manual Workflow Test (Bypass n8n UI)

If you can't easily see the error in n8n, test directly from PowerShell:

```powershell
$payload = @{
    message = "Hello, my name is Joshua"
    channel = "whatsapp"
    conversationHistory = @()
    vendor = @{
        name = "Test Business"
        businessType = "general"
        personalityTone = "friendly"
    }
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "https://n8n-latest-4dbq.onrender.com/webhook/whatsapp" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $payload `
  -ErrorAction Continue

Write-Host "Status: $($response.StatusCode)"
Write-Host "Body: $($response.Content)"
```

If you get **200**, the workflow is working.
If you get **500**, copy the response content and share it.

---

## Step-by-Step Node Verification

If you want to verify each node manually:

### Node 1: Webhook
- [ ] Path = `whatsapp`
- [ ] HTTP Method = `POST`
- [ ] Response Mode = `lastNode` or `responseNode`
- [ ] Status = Active

### Node 2: Build Prompt (Code)
- [ ] Type = `Function` or `Code`
- [ ] Has function code (should be multi-line JavaScript)
- [ ] No syntax errors (red underlines in code editor)

### Node 3: Call Groq (HTTP Request)
- [ ] URL = valid Groq API endpoint
- [ ] Method = `POST`
- [ ] Has Groq API Key credential selected
- [ ] Body = `{{ $json }}`
- [ ] Headers: `Content-Type: application/json`

### Node 4: Extract Reply (Code)
- [ ] Type = `Function` or `Code`
- [ ] Has function code to extract `reply` field
- [ ] Returns `{ json: { reply: "..." } }`

### Node 5: Respond to Webhook
- [ ] Connected from Extract Reply node
- [ ] Response Body includes the `reply` field

---

## If You're Still Stuck

**Option A:** Share a screenshot of the workflow with the red error
- I can see exactly which node failed and what the error is

**Option B:** Copy the full error message from n8n
- Click the failing node → copy the full error text → paste here

**Option C:** Check n8n Service Logs (Render)
- If n8n service itself is down, that's separate from the workflow
- Go to Render dashboard → n8n service → Logs tab
- Look for any `ERROR` or `FATAL` messages

---

## Next Action

1. **Open n8n and check execution logs** (Step 1-3 above)
2. **Find which node has a red X**
3. **Copy the error message**
4. **Paste it here** → I'll give you the exact fix
5. **Or try one of the "Common Fixes"** if they match your error

Once the 500 error is fixed, the diagnostic script will pass and the E2E tests should work!

---

**Let me know:**
- Which node is failing (red X)?
- What's the exact error message?
- Or just run the diagnostic steps and report back!
