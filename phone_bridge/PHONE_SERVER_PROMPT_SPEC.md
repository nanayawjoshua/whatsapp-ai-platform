<document filename="PHONE_SERVER_PROMPT_SPEC.md">
# Phone Server Bridge Specification for Claude Code

**Date:** December 12, 2025  
**Version:** 1.1 (With Pi Integration)  
**Purpose:** This is a comprehensive, self-contained prompt for you, Claude Code, to implement the "Phone Server" bridge—running Beeline's core logic (bridge-server.js with Baileys sessions) on old Android phones as concurrent addon nodes alongside the existing Pi (primary node). The goal is to test a single phone bridge independently (away from Pi), verify stability (no disconnections), then integrate for concurrency (parallel sessions like CUDA principles). Use the user's TCL 50SE (T611B) as the first addon phone—specs: Helio G88 octa-core, 6-12GB RAM (virtual), 5010mAh battery, capable of 75-150 sessions. Tie into current architecture (Dec 3 CLOUD-HYBRID-SUMMARY.md, Dec 4 BEELINE_COMPLETE_ARCHITECTURE.md)—keep own number moat, HITL (Dec 4), personas (Dec 9), enterprise tiers (Dec 9). Focus on residential/mobile IP for bypass, battery efficiency, and concurrency. If unclear, ask before coding.

## 1. Project Overview & Vision
Phone Server turns old Android phones into full Beeline bridges—handling sessions, logic, AI calls locally. Start with one phone (TCL 50SE) for testing (independent of Pi), then cluster for concurrency (Ghana Pi primary + London/USA phones). This solves IP disconnections (mobile SIM rotates naturally), outages (built-in battery), and scales cheaply (used phones $20 each). Aligns with first principles: Cheapest loop ($0 proxies), resilient (battery > Pi), viral (crowdsource phones).

**Current State (Dec 9 TEAM_PROGRESS.md)**: 72% complete—bridge ready on Pi, but cloud hops cause blocks. This pivot: Phones as addon hives, Pi as primary node.

**Vision**: 10 phones = 1,000 sessions. Global: Crowdsource used phones via app (reward free months)—infinite residential hive for 200M users.

## 2. Core Architecture
Phones as concurrent "addon nodes" in a cluster with Pi as primary. Each runs full bridge (Baileys + logic). Sync via Redis. Load balance with Cloudflare. No cloud for sessions—only optional Groq fallback.

**Stack**:
- **Runtime**: Termux (Linux shell on Android) + Node.js.
- **Sync**: Redis for state (sessions, HITL timers, personas).
- **Balancing**: Cloudflare DNS (health pings, route to fastest node).
- **AI**: Local ML Kit (Phi-3.5-mini for simple replies) + Groq fallback.
- **IP Bypass**: Mobile SIM (dynamic residential) + Wi-Fi backup.

**Diagram (ASCII)**:
```
QR Scan → Cloudflare Balancer (pings nodes)  
        ↓
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│ Pi Ghana (Primary) │ ↔ │ TCL 50SE Phone     │ ↔ │ Android Phone London│ ↔ │ Android Phone USA  │
│ - Sessions: 75     │   │ - Sessions: 75-150 │   │ - Sessions: 75-150 │   │ - Sessions: 75-150 │
│ - Local Logic/AI   │   │ - Addon Node       │   │ - Sync Replica     │   │ - Sync Replica     │
│ - Master Sync      │   │ - Battery Uptime   │   │ - Failover         │   │ - Failover         │
└────────────────────┘   └────────────────────┘   └────────────────────┘   └────────────────────┘
        ↑↓ Redis Sync (state, graph cache)
Optional Groq Cloud (complex AI only)
        ↑↓
User Phone (Messages route through active node)
```

**Flow**:
1. QR bind → routes to balancer → assigns to available node (Pi primary, TCL addon for overflow).
2. Message arrives → node processes locally (Baileys session).
3. Logic: HITL/persona check → local AI if simple → reply.
4. Complex? Fallback to Groq (proxied if needed).
5. Sync: Redis pushes state from Pi master to addon nodes every 30s.
6. If node down (e.g., Pi outage), balancer reroutes.

## 3. Implementation Roadmap for Claude
**Phase 1: Single Phone Prototype (1-2 Hours – Test Away from Pi)**  
- Install Termux + Node.js on TCL 50SE (pkg install nodejs-lts git).  
- Clone repo, copy .env (keys, N8N_WEBHOOK_URL).  
- Run `node bridge-server.js` — test QR bind, 50 messages (no disconnections).  
- Background: Use Termux-wake-lock + & for persistence. Optimize for TCL specs (Helio G88: Use 4 threads for parallelism).

**Phase 2: Concurrent Clustering with Pi (3-5 Hours)**  
- Add OpenMP/OpenCL for parallel sessions (pkg install libomp libclblast on phone).  
- Modify bridge-server.js: Use worker_threads for concurrency (e.g., 4 threads per phone CPU core).  
- Setup Redis sync (pkg install redis-tools)—phone subscribes to Pi master.  
- Code Snippet for Parallelism:
```js
const { Worker } = require('worker_threads');

// In bridge-server.js: Parallel session handler
function handleMessage(msg) {
  return new Promise((resolve) => {
    const worker = new Worker('./session-worker.js', { workerData: msg });
    worker.on('message', resolve);
  });
}

// session-worker.js: Process HITL/persona/AI in thread
```
- Balancer: Cloudflare DNS setup (add phone IP as A record, health checks).

**Phase 3: Phone-Specific Optimizations (2 Hours)**  
- Battery Guard: App monitors (if >80% load, pause non-essential).  
- IP Rotation: Auto-switch SIM data/Wi-Fi every 100 sessions.  
- Uptime Monitor: Telegram bot alerts if node down.

**Phase 4: Testing & Scale (1 Hour)**  
- Test: 100 concurrent sessions across Pi + TCL—no blocks.  
- Scale: Add London/USA phones (same setup). Crowdsource: Dashboard for users to "host" (reward logic in enterprise tier).

**Tech Constraints:**  
- Android 9+ (TCL 50SE qualifies).  
- Models: <500 MB for local AI.  
- No iOS (limited background)—Android only for phones.

**First Principles Check:**  
- Saves minutes: Local processing <200ms.  
- Moat: Own number bind.  
- Resilient: Battery survives outages.  
- Cheapest: $20/phone one-time.  
- Vision: Phones scale to 200M hives.

Claude: Build this step-by-step. Start with single phone prototype on TCL 50SE. Commit to feature/phone-bridge. Test on real device. Report in SESSION_CHECKPOINT format.

Elon out. 🐝
</document>
