# 🗓️ 7-Day MVP Sprint Plan — Car Wash AI Agent

> Inspired by Elon’s Law: “If you have a project, combat Hofstadter's Law by setting a ridiculously ambitious deadline.”

---

## ⚙️ Day 1 — Foundation & Environment Setup
**Goals:**
- Finalize architecture (cloud + local)
- Set up GitHub repo (✅ done)
- Install and configure:
  - Node.js
  - n8n (cloud or local)
  - WhatsApp Web listener (Node.js + Baileys or Venom)
  - Google Sheets access
- Test first message capture from WhatsApp → n8n webhook

**Deliverables:**
- Running local environment
- WhatsApp messages appearing in n8n test workflow

---

## ⚙️ Day 2 — AI Agent & Intent Flow
**Goals:**
- Define agent persona (AI Car Wash Assistant)
- Build LLM system prompt
- Connect LLM (ChatGPT or Claude) via n8n
- Parse WhatsApp message → detect intent (e.g., booking, price inquiry, etc.)
- Basic reply from LLM via WhatsApp

**Deliverables:**
- Working AI agent that responds intelligently to basic customer queries

---

## ⚙️ Day 3 — Booking & Scheduling System
**Goals:**
- Create booking schema (Name, Service Type, Date, Time, Location)
- Store booking in Google Sheets
- Confirm booking via WhatsApp message
- Send notification to owner (Telegram or WhatsApp)

**Deliverables:**
- Customer can book via chat
- Bookings appear in Google Sheets

---

## ⚙️ Day 4 — Invoice & Payment Flow
**Goals:**
- Auto-generate PDF invoice (Google Docs or Node.js PDF)
- Send invoice link or attachment
- Integrate with mobile money/bank API (mocked first)
- Mark payment status in Google Sheets

**Deliverables:**
- Customer receives invoice
- Payment verification placeholder works

---

## ⚙️ Day 5 — Service Completion & Review
**Goals:**
- Trigger “service completed” status update
- Ask customer for feedback
- Store rating + comments
- Notify owner

**Deliverables:**
- AI agent collects review post-service

---

## ⚙️ Day 6 — Accounting & Summary Reports
**Goals:**
- Summarize all transactions in Google Sheets
- Daily/weekly report generation
- Optionally send summary to Telegram or email

**Deliverables:**
- Automated daily accounting summary

---

## ⚙️ Day 7 — Local + Cloud Deployment
**Goals:**
- Deploy n8n and listener on cloud (Railway/Fly.io)
- Set up local mirror (Docker/Raspberry Pi)
- Test failover and uptime
- Clean codebase + finalize MVP documentation

**Deliverables:**
- Fully functional hybrid deployment
- Demo-ready AI WhatsApp booking system

---

## 🧩 Stretch Goals (After MVP)
- Add natural language payment verification (Momo API)
- Add analytics dashboard (Streamlit or Retool)
- Support multiple businesses (multi-tenant system)
- Integrate voice assistant (Twilio or WhatsApp voice messages)
