# BEELINE GHANA - VISUAL DIAGRAMS & SCHEMAS

This document contains all visual diagrams in Mermaid format. You can render these as images using:
- GitHub (auto-renders in README)
- Mermaid Live Editor: https://mermaid.live
- VS Code with Mermaid extension
- Export to PNG/SVG/PDF

---

## 1. CURRENT SYSTEM ARCHITECTURE

```mermaid
graph TB
    subgraph Customer["👤 CUSTOMER (Ghana)"]
        A[WhatsApp Message:<br/>'I want to buy oranges']
    end

    subgraph PiHouse["🏠 JOSHUA'S HOUSE - 192.168.8.28"]
        subgraph Pi["🥧 RASPBERRY PI 4"]
            B[Docker Container<br/>beeline-pi:latest]
            C[Baileys Multi-Session<br/>50 Vendor Capacity]
            D[Session Storage<br/>/beeline-sessions/]
            E[Conversation Memory<br/>Last 10 messages]
        end
    end

    subgraph Cloud1["☁️ N8N (Render Cloud)"]
        F[Webhook Endpoint<br/>/webhook/whatsapp]
        G[Code Node<br/>Extract History]
        H[HTTP Request<br/>Call Groq API]
        I[Respond to Webhook<br/>Return AI Reply]
    end

    subgraph Cloud2["☁️ GROQ AI"]
        J[Llama-3.3-70B<br/>Generate Response]
    end

    A -->|WhatsApp Web Protocol| B
    B --> C
    C --> D
    C --> E
    C -->|HTTPS POST| F
    F --> G
    G --> H
    H --> J
    J -->|AI Response| H
    H --> I
    I -->|JSON Reply| C
    C -->|WhatsApp| A

    style A fill:#25D366,color:#fff
    style B fill:#C51A4A,color:#fff
    style F fill:#EA4B71,color:#fff
    style J fill:#F55036,color:#fff
    style PiHouse fill:#FFE5E5,stroke:#C51A4A
    style Cloud1 fill:#E8F5F8,stroke:#EA4B71
    style Cloud2 fill:#FFF4E6,stroke:#F55036
```

---

## 2. FUTURE CLOUD ARCHITECTURE

```mermaid
graph TB
    subgraph Onboarding["🆕 VENDOR ONBOARDING"]
        A1[Web UI: beeline.works/signup]
        A2[Vendor Scans QR in Browser]
        A3[Session → PostgreSQL]
    end

    subgraph CloudBridge["☁️ CLOUD BRIDGE<br/>(Railway/Render)"]
        B1[Docker: beeline-bridge]
        %% Baileys is a WhatsApp Web API library for Node.js
        B2[Baileys Multi-Session<br/>1000+ Capacity]
        B3[PostgreSQL Session Storage]
        B4[Redis Conversation Cache]
    end

        C1[AI Processing (Same as Web UI)]
        C1[AI Processing Same as Current]
    end

    subgraph Backup["🔄 FAILOVER (Optional)"]
        D1[Raspberry Pi Home Backup]
        %% D2 monitors the cloud health and automatically takes over operations if the cloud service is down, ensuring seamless failover.
        D2[Monitors Cloud Health Takes Over if Down]
    end

    A1 --> A2
    A2 --> A3
    A3 --> B3

    B1 --> B2
    B2 --> B3
    B2 --> B4

    B2 -->|HTTPS| C1
    C1 -->|Reply| B2

    C1 -.->|If Cloud Fails| D1
    D1 -.->|Backup Connection| B3

    style CloudBridge fill:#E8F5F8,stroke:#0066CC,stroke-width:3px
    style Backup fill:#FFF4E6,stroke:#FFA500,stroke-dasharray: 5 5
    style Onboarding fill:#E8FFE8,stroke:#00AA00
```

---

## 3. MESSAGE FLOW SEQUENCE

```mermaid
sequenceDiagram
    participant C as 👤 Customer<br/>(WhatsApp)
    participant P as 🥧 Pi Bridge
    participant M as 📝 Memory<br/>(Map)
    participant N as ☁️ n8n
    participant G as 🤖 Groq AI

    C->>P: "I want oranges"
    P->>M: Load conversation history<br/>(last 10 messages)
    M-->>P: [{user: "Hello"}, {ai: "Akwaaba"}]

    P->>N: POST /webhook/whatsapp<br/>{message, conversationHistory}

    N->>N: Code Node:<br/>isFirstMessage = false
    N->>N: Build system prompt<br/>"DO NOT greet again"

    N->>G: POST /chat/completions<br/>{model, messages[]}
    G->>G: Generate contextual response
    G-->>N: "We have fresh oranges!<br/>GHS 20 for 10 pieces"

    N-->>P: {reply: "We have..."}

    P->>M: Save AI response to history
    M-->>P: ✓ Saved

    P->>C: Send via WhatsApp
    C->>C: Receives AI reply ✅

    Note over C,G: ⚠️ CURRENT BUG:<br/>AI ignores "DO NOT greet"<br/>and says "Akwaaba" again
```

---

## 4. DATA MODEL SCHEMA

```mermaid
erDiagram
    VENDOR ||--o{ SESSION : has
    VENDOR ||--o{ CONVERSATION : handles
    CONVERSATION ||--|{ MESSAGE : contains
    VENDOR ||--o{ PRODUCT : sells

    VENDOR {
        string vendor_id PK
        string name
        string phone
        string business_type
        json persona_config
        string personality_style
        timestamp created_at
        boolean is_active
    }

    SESSION {
        string vendor_id FK
        string session_id PK
        json whatsapp_creds
        json auth_state
        timestamp last_active
        string status
    }

    CONVERSATION {
        string conversation_id PK
        string vendor_id FK
        string customer_id
        timestamp started_at
        timestamp last_message_at
        int message_count
        boolean order_completed
    }

    MESSAGE {
        string message_id PK
        string conversation_id FK
        string role "user|assistant"
        text content
        timestamp sent_at
        json metadata
    }

    PRODUCT {
        int product_id PK
        string vendor_id FK
        string name
        string category
        decimal price
        int quantity
        string sku
        int low_stock_warning
    }
```

---

## 5. VENDOR ONBOARDING FLOW

```mermaid
flowchart TD
    Start([Vendor Visits<br/>beeline.works]) --> Form[Fill Sign-Up Form<br/>Name, Phone, Business]
    Form --> Voice[Record Voice Note:<br/>'What do you sell?']
    Voice --> Upload[Upload to n8n]

    Upload --> STT[Groq STT:<br/>Transcribe Audio]
    STT --> AI[Groq AI:<br/>Generate Persona]

    AI --> Persona{Persona Generated}
    Persona --> Style[Show 3 Styles:<br/>Casual | Formal | Twi-heavy]

    Style --> Pick[Vendor Picks Style]
    Pick --> Save[Save to PostgreSQL]

    Save --> QR[Generate QR Code]
    QR --> Display[Display QR in Browser]

    Display --> Scan{Vendor Scans<br/>with WhatsApp?}
    Scan -->|Yes| Connected[✅ Connected!<br/>AI Employee Live]
    Scan -->|No| Wait[Wait for Scan...]
    Wait --> Scan

    Connected --> End([Vendor Dashboard])

    style Start fill:#90EE90
    style Connected fill:#00FF00,color:#000
    style End fill:#FFD700
    style Scan fill:#FFA500
```

---

## 6. DOWNTIME SCENARIOS MIND MAP

```mermaid
mindmap
  root((BEELINE<br/>DOWNTIME<br/>SCENARIOS))
    Power Outage
      Impact
        All vendors offline
        No messages processed
      Solutions
        UPS backup 2-4hrs
        Auto-restart on boot
        Sessions persist
    Internet Outage
      Impact
        Can't reach WhatsApp
        Can't reach n8n
      Solutions
        4G LTE failover
        Message queue retry
        SMS alerts
    n8n Cloud Down
      Impact
        No AI responses
        Customers see typing
      Solutions
        Backup n8n instance
        Direct Groq fallback
        Error message to customer
    Groq API Limit
      Impact
        Rate limit 30/min
        Temporary downtime
      Solutions
        Fallback to OpenAI
        Queue requests
        Upgrade to paid tier
    WhatsApp Ban
      Impact
        One vendor loses access
        Number banned
      Solutions
        Use Business accounts
        Human-like delays
        Backup SIM ready
        Meta Cloud API
    Pi Hardware Fail
      Impact
        All sessions lost
        Complete downtime
      Solutions
        Daily backups to cloud
        Hot spare Pi ready
        Boot from SSD not SD
    Docker Crash
      Impact
        WhatsApp disconnects
        10s downtime
      Solutions
        Auto-restart policy
        Health checks
        Monitoring alerts
```

---

## 7. COST BREAKDOWN COMPARISON

```mermaid
%% title Cost Comparison: Current vs Cloud
graph LR
    subgraph Current["💰 CURRENT (Pi Setup)"]
        A1["Hardware: $75"] --> Total1
        A2["Power: $5/mo"] --> Total1
        A3["Internet: $20/mo"] --> Total1
        A4["UPS: $50"] --> Total1
        A5["n8n: $7/mo"] --> Total1
        Total1["Total: $150 upfront<br/>+ $38/month"]
    end

    subgraph Cloud["☁️ CLOUD (Future)"]
        B1["Hardware: $0"] --> Total2
        B2["Railway: $5/mo"] --> Total2
        B3["PostgreSQL: $0"] --> Total2
        B4["Redis: $0"] --> Total2
        B5["n8n: $7/mo"] --> Total2
        Total2["Total: $0 upfront<br/>+ $18/month"]
    end

    Total1 -.->|"After 20 vendors<br/>Migrate"| Total2
    %% Migration occurs after onboarding 20 vendors.
    
    subgraph Legend["Legend"]
        L1["🔴 Red: Current setup cost"]
        L2["🟢 Green: Cloud setup cost"]
    end
    
    style Total1 fill:#FFD6D6,stroke:#B22222
    style Total2 fill:#D6FFD6,stroke:#228B22
```

---

## 8. GROWTH PROJECTIONS

```mermaid
graph TD
    subgraph Week1["📅 WEEK 1"]
        W1[5 Vendors<br/>$45 MRR<br/>Break-even ✅]
    end

    subgraph Week2["📅 WEEK 2"]
        W2[50 Vendors<br/>$450 MRR<br/>First Pi Full 🎉]
    end

    subgraph Month1["📅 MONTH 1"]
        M1[100 Vendors<br/>$900 MRR<br/>Second Pi Added]
    end

    subgraph Month2["📅 MONTH 2"]
        M2[250 Vendors<br/>$2,250 MRR<br/>Profitable Scale 💰]
    end

    subgraph Q1_2026["📅 Q1 2026"]
        Q1[1,000 Vendors<br/>$9,000 MRR<br/>Cloud Migration ☁️]
    end

    W1 --> W2
    W2 --> M1
    M1 --> M2
    M2 --> Q1

    style W1 fill:#FFE5E5
    style W2 fill:#FFF4E6
    style M1 fill:#E8F5F8
    style M2 fill:#E8FFE8
    style Q1 fill:#FFD700,stroke:#FF6600,stroke-width:3px
```

---

## 9. VIRALITY LOOP

```mermaid
graph LR
    A[Vendor Uses<br/>Beeline AI] --> B[Customer Orders<br/>via WhatsApp]
    B --> C[AI Includes Footer:<br/>'Want your own AI?<br/>Reply BUZZ 🐝']
    C --> D{Customer<br/>Says BUZZ?}
    D -->|2% conversion| E[New Vendor Signup]
    D -->|98% ignore| B
    E --> F[Referrer Gets<br/>7 Days Free]
    E --> A

    B -.->|Only shown after<br/>payment detected| C

    style C fill:#FFD700
    style E fill:#90EE90
    style F fill:#00FF00,color:#000

    Note1[Conservative Growth:<br/>50 vendors × 250 paid orders × 2%<br/>= 5 new vendors/month<br/>= 10% monthly growth 🐝]

    Note1 -.-> E
```

---

## 10. PRODUCT INTEGRATION FLOW

```mermaid
sequenceDiagram
    participant C as 👤 Customer
    participant P as 🥧 Pi
    participant N as ☁️ n8n
    participant DB as 🗄️ Products DB<br/>(708 items)
    participant AI as 🤖 Groq

    C->>P: "Do you have Coca Cola?"
    P->>N: Forward message

    N->>DB: Search products<br/>query: "coca cola"
    DB-->>N: Found:<br/>Coca Cola 300ml<br/>GHS 5.50<br/>Stock: 24

    N->>N: Update system prompt:<br/>"PRODUCTS FOUND:<br/>- Coca Cola 300ml: GHS 5.50<br/>  In stock: 24"

    N->>AI: Generate response with product data
    AI-->>N: "Yes! We have Coca Cola 300ml<br/>for GHS 5.50. We have 24 bottles<br/>in stock. How many would you like?"

    N-->>P: {reply: "Yes! We have..."}
    P->>C: Send reply

    Note over C,AI: AI has real inventory data!<br/>No hallucinations about products
```

---

## 11. PAYMENT DETECTION LOGIC

```mermaid
flowchart TD
    Start[Customer Message<br/>Received] --> Process[AI Generates<br/>Response]

    Process --> Check{Response Contains<br/>'MoMo' or 'GHS'?}

    Check -->|Yes| Payment[Payment Mentioned!]
    Check -->|No| NoPayment[Regular Message]

    Payment --> Flag[Set: orderComplete = true]
    Flag --> Footer[Add Virality Footer:<br/>'Powered by Beeline 🐝<br/>Reply BUZZ for your own AI']

    NoPayment --> NoFooter[No Footer]

    Footer --> Send[Send to Customer]
    NoFooter --> Send

    Send --> End([Message Sent])

    style Payment fill:#90EE90
    style Flag fill:#FFD700
    style Footer fill:#00FF00,color:#000
```

---

## HOW TO USE THESE DIAGRAMS

### 1. **View in GitHub**
Just push this file to your repo - GitHub auto-renders Mermaid diagrams.

### 2. **Export as Images**
- Copy any diagram
- Go to https://mermaid.live
- Paste code
- Click "Actions" → "Export PNG/SVG/PDF"

### 3. **Use in Presentations**
- Export as PNG with transparent background
- Insert into PowerPoint/Google Slides
- Professional diagrams ready!

### 4. **Interactive Diagrams**
- Use Mermaid Live Editor for presentations
- Click nodes to highlight relationships
- Zoom in/out for details

---

**Created:** December 2, 2025
**For:** Beeline Ghana Platform
**By:** Claude Code + Joshua
