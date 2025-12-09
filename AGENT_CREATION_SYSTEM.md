# 🤖 Agent Creation System - Beeline Platform

**Status:** Architecture Designed | Implementation: 40% Complete  
**Document Version:** 1.0 | **Last Updated:** December 9, 2025

This document describes how the Beeline platform enables team members to create custom AI agents for different businesses and use cases, including how agents consume user input, build custom prompts, and deploy themselves.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Current State (What We Have)](#current-state-what-we-have)
3. [Agent Architecture (How It Works)](#agent-architecture-how-it-works)
4. [User Model & Input Types](#user-model--input-types)
5. [Agent Creation Flow](#agent-creation-flow)
6. [Prompt Engineering Engine](#prompt-engineering-engine)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Example: Creating a Salon Booking Agent](#example-creating-a-salon-booking-agent)

---

## 🎯 System Overview

### What is the Agent Creation System?

The Agent Creation System allows **any team member** (or future customer) to:

1. **Describe their business** (name, industry, goals)
2. **Specify their needs** (booking, ordering, payments, support)
3. **Provide business context** (products, services, pricing, tone)
4. **AI creates a custom agent** (system prompt + workflow configuration)
5. **Deploy immediately** (WhatsApp + Telegram + SMS ready to go)

### Core Philosophy: **Modularity + Configuration Over Code**

- **One codebase, unlimited agent variations**
- **JSON-based configuration** (no code required to customize)
- **LLM-generated prompts** (AI builds prompts for new agents)
- **Template-driven workflows** (n8n templates for each industry)

---

## 📊 Current State (What We Have)

### ✅ Foundation Already Built

#### 1. **Multi-Tenant Architecture** (Ready)
- Location: `docs/Multi-Tenant-Architecture.md`
- Each tenant = unique `tenant_id`
- Isolated configs in `ai-agents/business_configs/`
- Support for unlimited simultaneous businesses

#### 2. **Business Config Templates** (Ready)
```json
// ai-agents/business_configs/_template.json
{
  "tenant_id": "UUID",
  "business_info": {
    "name": "Business Name",
    "type": "retail|services|hospitality",
    "industry": "supermarket|car_wash|salon|restaurant",
    "language": "en",
    "timezone": "Africa/Accra"
  },
  "branding": {
    "tone": "friendly|professional|casual",
    "greeting_message": "Hello! Welcome to {{business_name}}.",
    "voice_preference": "empathetic|efficient|neutral"
  },
  "capabilities": {
    "product_catalog": true,
    "booking_system": true,
    "payment_processing": true,
    "order_tracking": true
  },
  "llm_config": {
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

#### 3. **Industry-Specific Templates** (Partially Complete)
- ✅ Supermarket template (ai-agents/business_configs/supermarket.json)
- ✅ Car Wash template (ai-agents/business_configs/car_wash.json)
- 🔨 Salon template (coming)
- 🔨 Restaurant template (coming)

#### 4. **System Prompt Framework** (Ready)
```javascript
// From backend/unified-inbound.js and n8n Code node
const systemPrompt = `You are a helpful shopping assistant for ${business.name}.
Answer customer questions directly and remember context.
If uncertain, be honest. If they ask about products, tell them about availability and pricing.
${business.tone === 'friendly' ? 'Be warm and conversational.' : 'Be professional and efficient.'}
Language: ${business.language}
`;
```

#### 5. **n8n Workflow Template** (Active)
- WhatsApp Webhook → Code Node (conversation history) → Groq API → Response back
- Fully functional for supermarket MVP
- Reusable for other industries with config changes

#### 6. **Conversation Memory** (Working)
- In-memory Map storage (ai-agents/system)
- Tracks last 10 messages per user
- Ready for Redis upgrade for production

---

## 🔧 Agent Architecture (How It Works)

### High-Level Flow

```
Team Member Input
    ↓
[Agent Creation Engine]
    ├─ Parse business info
    ├─ Validate capabilities
    ├─ Generate system prompt
    ├─ Select n8n template
    └─ Create config JSON
    ↓
Tenant Config Created
    ├─ Stored: ai-agents/business_configs/tenants/tenant_UUID.json
    ├─ Registered in tenant registry
    └─ Ready for deployment
    ↓
[Deployment Engine]
    ├─ Provision Google Sheets (if needed)
    ├─ Configure WhatsApp webhook
    ├─ Activate n8n workflow
    └─ Send onboarding guide
    ↓
Agent Live on WhatsApp 🎉
```

### Architecture Layers

#### Layer 1: **Configuration** (Tenant Level)
- **File**: `ai-agents/business_configs/tenants/tenant_UUID.json`
- **Contains**: Business info, capabilities, LLM settings, branding
- **Updated by**: Agent Creation Engine
- **Consumed by**: Backend + n8n

#### Layer 2: **Prompt Generation** (LLM Level)
- **Input**: Business config JSON
- **Process**: LLM-based prompt generation from template
- **Output**: System prompt for Groq
- **Used by**: n8n Code node before calling LLM

#### Layer 3: **Workflow** (n8n Level)
- **File**: n8n workflow (BSON export)
- **Structure**: Webhook → Code Node → HTTP Request (Groq) → Response
- **Dynamic**: Loads tenant config to customize behavior
- **Deployed in**: Docker n8n container

#### Layer 4: **Execution** (Backend Level)
- **File**: `backend/unified-inbound.js`
- **Function**: Listens to channels, routes to n8n, returns response
- **Tenant-aware**: Loads correct config per WhatsApp number

---

## 👤 User Model & Input Types

### 1. **User Roles**

| Role | Responsibilities | Example |
|------|------------------|---------|
| **Business Owner** | Provides business info + goals | Sarah (jewelry store) |
| **Team Agent** | Creates agents from owner requirements | Joshua or Claude |
| **Admin Agent** | Deploys + manages fleet of agents | Backend system |
| **AI System** | Generates prompts + configs | Groq LLM or Claude |

### 2. **Required User Input (What Team Provides)**

When creating a new agent, the system needs:

```typescript
interface AgentCreationRequest {
  // Business Info
  businessName: string;           // "Sarah's Jewelry Store"
  businessType: "retail" | "services" | "hospitality";
  industry: string;                // "jewelry_retail"
  country: string;                 // "GH"
  timezone: string;                // "Africa/Accra"
  
  // Contact Info
  ownerName: string;               // "Sarah Mensah"
  ownerPhone: string;              // "+233XXXXXXXXX"
  ownerEmail: string;              // "sarah@store.com"
  whatsappNumber: string;          // "+233XXXXXXXXX" (business number)
  
  // Business Context
  description: string;             // "We sell handmade necklaces and earrings"
  productsServices: string[];      // ["Necklaces", "Earrings", "Bracelets"]
  pricing: string;                 // "GHS 50-200 per item"
  operatingHours: string;          // "9am-6pm Mon-Fri"
  
  // Agent Customization
  desiredTone: "friendly" | "professional" | "casual" | "formal";
  languages: string[];             // ["en", "tw"] (English + Twi)
  capabilities: {
    productCatalog: boolean;        // true
    bookingSystem: boolean;         // false
    paymentProcessing: boolean;     // true
    orderTracking: boolean;         // true
    customerSupport: boolean;       // true
  };
  
  // Optional: Custom Prompt Instructions
  customInstructions?: string;     // "Always ask about ring size for rings"
  
  // Optional: Integration Preferences
  paymentProvider?: "paystack" | "stripe" | "momo";
  databasePreference?: "google_sheets" | "postgresql";
}
```

### 3. **Agent Description Types**

| Input Type | Example | Processed By |
|-----------|---------|--------------|
| **Text Description** | "We're a car wash that needs automated booking" | Claude/LLM → Parsed to structured config |
| **Questionnaire** | Form with 10 questions about business | Web form → Extracted to config |
| **Voice Note** | "We sell shoes, take orders via WhatsApp" | Groq transcription → Config generation |
| **Existing Business Profile** | API call to existing CRM | CRM → Mapped to config |

---

## 🛠 Agent Creation Flow

### Step-by-Step: From User Input to Live Agent

#### **Step 1: Input Collection**
```
Team Member or Customer provides:
- Business info (name, type, location)
- Goals & needs (what should the agent do?)
- Context (products, pricing, tone)
- Channel preferences (WhatsApp, Telegram, SMS?)
```

**Where this happens:**
- In this session: Manual briefing (Joshua describes business)
- Future: Web form at `/admin/create-agent`
- Also: API endpoint POST `/api/agents/create`

#### **Step 2: Validation & Standardization**
```typescript
// backend/core/agent_creator.js
function validateInput(userInput) {
  // Check required fields
  if (!userInput.businessName) throw new Error("Business name required");
  if (!userInput.industry) throw new Error("Industry required");
  
  // Standardize fields
  const tenant = {
    tenant_id: generateUUID(),
    business_info: {
      name: userInput.businessName,
      industry: normalizeIndustry(userInput.industry),
      // ... rest of mapping
    }
  };
  
  return tenant;
}
```

#### **Step 3: System Prompt Generation**
```typescript
// backend/core/prompt_generator.js (NEW - to be created)
async function generateSystemPrompt(tenantConfig) {
  // Template-based prompt for the industry
  const template = loadTemplate(tenantConfig.business_info.industry);
  
  // Build the system prompt
  const systemPrompt = `
You are a helpful AI assistant for ${tenantConfig.business_info.name}.
Industry: ${tenantConfig.business_info.industry}
Tone: ${tenantConfig.branding.tone}
Languages: ${tenantConfig.business_info.languages.join(", ")}

Business Details:
${tenantConfig.business_info.description}

Products/Services:
${tenantConfig.business_info.productsServices.join(", ")}

Pricing: ${tenantConfig.business_info.pricing}

Your Responsibilities:
${buildResponsibilities(tenantConfig.capabilities)}

Always:
- Be helpful and professional
- Remember context from previous messages
- Confirm details before processing orders
- If unsure, ask for clarification

${tenantConfig.customInstructions ? `\nSpecial Instructions:\n${tenantConfig.customInstructions}` : ""}
  `;
  
  return systemPrompt;
}
```

#### **Step 4: Config File Creation**
```json
// ai-agents/business_configs/tenants/tenant_abc123xyz.json
{
  "tenant_id": "abc123xyz",
  "business_info": {
    "name": "Sarah's Jewelry Store",
    "type": "retail",
    "industry": "jewelry_retail",
    "country": "GH",
    "timezone": "Africa/Accra",
    "description": "Handmade necklaces and earrings",
    "productsServices": ["Necklaces", "Earrings", "Bracelets"],
    "pricing": "GHS 50-200 per item",
    "operatingHours": "9am-6pm Mon-Fri",
    "languages": ["en", "tw"]
  },
  "contact": {
    "ownerName": "Sarah Mensah",
    "ownerPhone": "+233XXXXXXXXX",
    "ownerEmail": "sarah@store.com",
    "whatsappNumber": "+233XXXXXXXXX"
  },
  "branding": {
    "tone": "friendly",
    "voice_preference": "empathetic",
    "greeting_message": "Hi! Welcome to Sarah's Jewelry! 💎 How can I help you today?"
  },
  "capabilities": {
    "productCatalog": true,
    "bookingSystem": false,
    "paymentProcessing": true,
    "orderTracking": true,
    "customerSupport": true
  },
  "llm_config": {
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "temperature": 0.7,
    "max_tokens": 500,
    "system_prompt": "[Generated prompt from Step 3 above]"
  },
  "integrations": {
    "googleSheetsId": "SHEETS_ID_HERE",
    "paymentProvider": "paystack",
    "paymentApiKey": "encrypted_key_here"
  },
  "deployment": {
    "status": "active",
    "channels": ["whatsapp", "telegram"],
    "createdAt": "2025-12-09T10:00:00Z",
    "createdBy": "claude_agent"
  }
}
```

#### **Step 5: n8n Workflow Configuration**
```javascript
// backend/core/workflow_configurator.js (NEW - to be created)
async function configureWorkflow(tenantConfig) {
  // Load the industry template workflow
  const template = loadN8nTemplate(tenantConfig.business_info.industry);
  
  // Customize the workflow for this tenant
  const workflow = {
    ...template,
    name: `${tenantConfig.business_info.name} - AI Agent`,
    active: true,
    nodes: template.nodes.map(node => {
      // Replace placeholders with tenant config
      if (node.type === 'n8n-nodes-base.code') {
        return {
          ...node,
          parameters: {
            ...node.parameters,
            jsCode: generateCodeNode(tenantConfig)
          }
        };
      }
      if (node.type === 'n8n-nodes-base.httpRequest') {
        return {
          ...node,
          parameters: {
            ...node.parameters,
            headers: {
              'Authorization': `Bearer ${tenantConfig.llm_config.apiKey}`
            }
          }
        };
      }
      return node;
    })
  };
  
  return workflow;
}
```

#### **Step 6: Deployment**
```typescript
// backend/core/deployment_engine.js (NEW - to be created)
async function deployAgent(tenantConfig) {
  const result = {
    tenant_id: tenantConfig.tenant_id,
    steps: []
  };
  
  // Step 1: Create Google Sheet for this business
  const sheetId = await createGoogleSheet(tenantConfig);
  result.steps.push({ step: "Create Google Sheet", status: "✅", sheetId });
  
  // Step 2: Save config to file system
  await saveConfig(tenantConfig);
  result.steps.push({ step: "Save Config", status: "✅" });
  
  // Step 3: Configure n8n workflow
  const workflow = await configureWorkflow(tenantConfig);
  await deployToN8n(workflow);
  result.steps.push({ step: "Deploy n8n Workflow", status: "✅" });
  
  // Step 4: Register webhook for WhatsApp
  const webhookUrl = await registerWebhook(tenantConfig.contact.whatsappNumber);
  result.steps.push({ step: "Register WhatsApp Webhook", status: "✅", webhookUrl });
  
  // Step 5: Send onboarding email to owner
  await sendOnboardingEmail(tenantConfig.contact.ownerEmail, {
    businessName: tenantConfig.business_info.name,
    whatsappNumber: tenantConfig.contact.whatsappNumber,
    dashboardUrl: `/dashboard/${tenantConfig.tenant_id}`,
    firstSteps: ["Train your AI with products", "Set up payment gateway"]
  });
  result.steps.push({ step: "Send Onboarding Email", status: "✅" });
  
  return result;
}
```

#### **Step 7: Agent Live! 🎉**
```
WhatsApp customers can now:
1. Message the business number
2. Get responses from the AI agent
3. Browse products, place orders, track status
4. Pay via Paystack
5. All data logged to Google Sheets

Business owner can:
1. Log into dashboard
2. Monitor conversations
3. Update products/prices
4. View analytics
5. Manage orders
```

---

## 🧠 Prompt Engineering Engine

### How Prompts Are Generated

The system uses **template + context** approach:

#### **1. Industry Base Template**
```markdown
# Template: Retail (Jewelry)

You are a helpful shopping assistant for {business_name}.
Your goal is to help customers find and purchase jewelry.

## Your Knowledge Base
- Products: {products_list}
- Pricing: {pricing}
- Availability: Check Google Sheets for stock

## Conversation Style
Tone: {tone}
Language: {languages}

## Typical Tasks
1. Answer product questions
2. Check availability
3. Process orders
4. Handle payments
5. Track shipments
```

#### **2. Dynamic Customization**
```javascript
function generatePrompt(config) {
  const template = industryTemplates[config.industry];
  
  return template
    .replace(/{business_name}/g, config.business_info.name)
    .replace(/{products_list}/g, config.business_info.productsServices.join(", "))
    .replace(/{pricing}/g, config.business_info.pricing)
    .replace(/{tone}/g, config.branding.tone)
    .replace(/{languages}/g, config.business_info.languages.join(", "))
    .replace(/{custom_instructions}/g, config.customInstructions || "");
}
```

#### **3. Future: LLM-Generated Prompts** (To Be Implemented)
```typescript
async function generatePromptWithLLM(businessDescription: string) {
  // User says: "We sell shoes and take orders"
  // AI generates: A full system prompt tailored to shoe retail
  
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{
      role: "system",
      content: `You are an expert at creating AI agent system prompts. 
      Given a business description, generate a detailed, professional system prompt 
      for an AI agent to serve that business via WhatsApp.`
    }, {
      role: "user",
      content: businessDescription
    }],
    temperature: 0.7,
    max_tokens: 500
  });
  
  return response.choices[0].message.content;
}
```

---

## 🗺 Implementation Roadmap

### Phase 1: **Foundation** (Dec 9-10) ✅ Mostly Complete
- [x] Multi-tenant architecture documented
- [x] Business config templates created
- [x] n8n workflows active
- [ ] Agent creation engine (basic version)
- [ ] Prompt generation (template-based)

### Phase 2: **Automation** (Dec 11-15)
- [ ] Web form for agent creation (`/admin/create-agent`)
- [ ] API endpoint: `POST /api/agents/create`
- [ ] Deployment automation script
- [ ] LLM-based prompt generation
- [ ] Email notification system

### Phase 3: **Scaling** (Week 2-3)
- [ ] Agent management dashboard
- [ ] Industry template expansion (20+ templates)
- [ ] Advanced customization (webhook patterns, integrations)
- [ ] Performance monitoring + auto-scaling
- [ ] Multi-agent orchestration

### Phase 4: **Intelligence** (Month 2)
- [ ] Self-improving prompts (test variations)
- [ ] A/B testing UI for agent behavior
- [ ] Custom training data upload
- [ ] Agent analytics dashboard
- [ ] Automated optimization recommendations

---

## 💡 Example: Creating a Salon Booking Agent

### Scenario
A salon owner (Ama) wants to automate WhatsApp booking. She needs customers to:
1. Check available time slots
2. Book appointments
3. Receive reminders

### Step-by-Step Creation

#### **Step 1: User Input**
```
Name: Beauty by Ama
Type: Services
Industry: Salon
Location: Accra, Ghana
Services: Hair styling, Manicure, Pedicure
Pricing: GHS 20-80 per service
Hours: 9am-6pm Mon-Sat
Tone: Friendly & professional
Languages: English, Twi
Key Feature Needed: Appointment booking
```

#### **Step 2: System Generates Config**
```json
{
  "tenant_id": "salon_ama_001",
  "business_info": {
    "name": "Beauty by Ama",
    "industry": "salon",
    "services": ["Hair styling", "Manicure", "Pedicure"],
    "pricing": "GHS 20-80 per service"
  },
  "capabilities": {
    "bookingSystem": true,
    "paymentProcessing": true,
    "reminders": true
  }
}
```

#### **Step 3: AI Generates Prompt**
```
You are an appointment booking assistant for Beauty by Ama.

Services: Hair styling (GHS 50), Manicure (GHS 30), Pedicure (GHS 25)

Your job:
1. Greet customers warmly in Twi or English
2. Ask which service they want
3. Show available times for today/tomorrow
4. Confirm booking with customer name & phone
5. Send WhatsApp confirmation with time & price

Available Slots:
- 9:00am - 10:00am
- 10:30am - 11:30am
- 1:00pm - 2:00pm
- 3:00pm - 4:00pm

Always confirm: "So I have you down for [SERVICE] at [TIME] on [DATE]. GHS [PRICE]. Correct?"
```

#### **Step 4: Workflow Deployed**
```
Customer messages: "I want hair styling tomorrow"
  ↓
n8n receives via webhook
  ↓
Code node extracts: service="hair", date="tomorrow"
  ↓
Groq LLM with above prompt responds: "Great! Hair styling is GHS 50. I have these slots tomorrow: 9am, 10:30am, 1pm, 3pm. Which works for you?"
  ↓
Customer: "1pm please"
  ↓
AI books the slot, logs to Google Sheets
  ↓
Customer gets confirmation: "✅ Booked! Hair styling tomorrow at 1pm. Awaiting payment via Paystack link..."
```

#### **Step 5: Owner Benefits**
- ✅ Customers self-service book appointments
- ✅ Payments processed automatically
- ✅ Reminders sent 24hrs before
- ✅ All bookings logged in spreadsheet
- ✅ Dashboard shows today's schedule
- ✅ Owner can update prices/services in config

---

## 🚀 Next Steps for Implementation

### Immediate (This Week)
1. **Create `backend/core/agent_creator.js`**
   - Validate user input
   - Generate tenant config
   - Save to file system

2. **Create `backend/core/prompt_generator.js`**
   - Load industry templates
   - Generate system prompts
   - Test with various industries

3. **Create `/admin/create-agent` API endpoint**
   - Accept AgentCreationRequest
   - Call agent creator
   - Return tenant_id + deployment status

### Soon (Next Week)
4. **Create web form** at `/admin/create-agent`
   - Questionnaire for business info
   - Industry selector
   - Capability checkboxes
   - Custom instructions textarea

5. **Create `backend/core/deployment_engine.js`**
   - Orchestrate full deployment
   - Handle Google Sheets creation
   - Deploy n8n workflows
   - Send onboarding emails

### Future (Month 2+)
6. **Dashboard** at `/admin/agents`
   - List all active agents
   - Edit configs
   - View performance metrics
   - Auto-scaling controls

7. **Template marketplace** at `/templates`
   - Browse 20+ industry templates
   - Clone + customize
   - Community-shared prompts

---

## 📚 Related Documentation

- **Multi-Tenant Architecture**: `docs/Multi-Tenant-Architecture.md`
- **Design System**: `.superdesign/DESIGN_SYSTEM.md`
- **Current Configs**: `ai-agents/business_configs/`
- **n8n Setup**: `workflows/n8n-setup-guide.md`
- **Backend Code**: `backend/unified-inbound.js`

---

**Status:** Framework designed ✅ | Implementation in progress 🔄  
**Owner:** Joshua + Team  
**Questions?** Check TEAM_PROGRESS.md for blockers and contacts
