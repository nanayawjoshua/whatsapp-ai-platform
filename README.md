# Car Wash AI Agent MVP 🚗💦🤖

## 📌 Project Overview
This project is an MVP (Minimum Viable Product) for an AI-powered mobile car wash automation system.  
It enables customers to book services via WhatsApp, where an AI agent handles:

✅ Customer inquiry response  
✅ Booking scheduling  
✅ Location capture  
✅ Price calculation & invoicing  
✅ Mobile money or bank payment verification  
✅ Receipt generation  
✅ Service reminders  
✅ Review collection  
✅ Revenue logging & basic accounting  

The system is modular and built using first principles thinking, focusing on speed, automation, and reliability.

---

## 🏗️ High-Level Architecture (MVP Version)
| Component | Role |
|-----------|------|
| WhatsApp listener | Captures incoming messages (via Meta API or Web automation) |
| AI Agent (LLM) | Conversational brain (Claude / GPT) |
| Orchestrator (n8n or custom backend) | Manages workflows + logic |
| Google Sheets / DB | Logs customers, bookings, payments |
| PDF Generator | Creates invoices & receipts |
| Telegram/Email Alerts | Notifies business owner |
| Mobile Money/Bank API | Validates payments |

---

## 📂 Project Structure
car-wash-ai-agent-mvp/
├─ backend/ # Core logic (Node.js or Python)
├─ workflows/ # n8n / automation JSON files
├─ ai-agent/ # Agent prompts, personas & tool logic
│ ├─ system_prompts/
│ └─ tool_instructions/
├─ deployment/ # Docker, cloud configs
├─ docs/ # Documentation & development plan
└─ README.md # This file


---

## 📆 MVP Sprint Goal (Inspired by Elon’s Law)
> "If you have a project, combat Hofstadter's Law by setting a ridiculously ambitious deadline."

⏳ Target: **7 days** (working ~2 hours per day)  
✅ Outcome: A working MVP that can book a car wash via WhatsApp and log all interactions.

---

## ✅ Tech Stacks (To Be Finalized)
| Function | Possible Tools |
|----------|----------------|
| LLM Agent | OpenAI GPT-5 / Claude |
| Workflows | n8n / Node orchestrator |
| Backend | Node.js / Python |
| WhatsApp Integration | WhatsApp API / Web session |
| Database (MVP) | Google Sheets |
| Deployment | Local (Docker) + Cloud (Railway/Fly.io) |
| Version Control | Git + GitHub |

---

## 🚀 Next Step
We will create a Day-by-Day development roadmap (`docs/Day-by-day-plan.md`) and finalize stack choices before building.

---

## 👨‍💻 Developer Notes
- Git version control via GitHub Desktop.
- All changes will be committed with clear commit messages.
- ChatGPT & Claude Code will serve as development copilots.
