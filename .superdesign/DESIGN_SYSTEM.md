# Beeline Design System
## Dark Glassmorphism Theme - Inspired by Cluely, Linear, and Vercel

**Created:** December 2025
**For:** Monday Hospital Demo
**MCP Tools Used:** Firecrawl, Superdesign

---

## 🎨 Color Palette

### Brand Colors
- **Beeline Yellow:** `#F9C74F` - Primary brand color (gradient start)
- **Beeline Orange:** `#F3722C` - Secondary brand color (gradient end)
- **Beeline Amber:** `#C97E2F` - Accent/hover states
- **Beeline Cream:** `#FFF4E6` - Light backgrounds

### Dark Mode Colors
- **Dark BG:** `#0F0F0F` - Main background (darker than before!)
- **Dark BG Secondary:** `#1A1A1A` - Secondary surfaces
- **Dark BG Tertiary:** `#242424` - Elevated surfaces
- **Dark Text:** `#FFFFFF` - Primary text
- **Dark Text Secondary:** `rgba(255, 255, 255, 0.7)` - Secondary text
- **Dark Text Tertiary:** `rgba(255, 255, 255, 0.5)` - Tertiary text
- **Dark Border:** `rgba(249, 199, 79, 0.1)` - Subtle yellow borders

### Glass Colors
- **Glass BG:** `rgba(26, 26, 26, 0.6)` - Translucent backgrounds
- **Glass Border:** `rgba(249, 199, 79, 0.1)` - Glass borders

---

## 🌈 Gradients

### Primary Gradient
```css
background: linear-gradient(135deg, #F9C74F 0%, #F3722C 100%);
```
Used for: CTAs, active states, highlights

### Dark Glow Gradient
```css
background: radial-gradient(circle at 50% 0%, rgba(249, 199, 79, 0.15) 0%, transparent 50%);
```
Used for: Hero section atmospheric glow

---

## 💫 Shadows

### Glass Shadow
```css
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
```

### Glow Effects
```css
/* Normal Glow */
box-shadow: 0 0 40px rgba(249, 199, 79, 0.3);

/* Large Glow (Hover) */
box-shadow: 0 0 60px rgba(249, 199, 79, 0.5);
```

---

## 📐 Typography

### Font Family
- **Sans:** Inter, system-ui, sans-serif
- **Mono:** JetBrains Mono (for codes, badges)

### Hierarchy
- **Hero (h1):** 5xl-7xl, font-light, tracking-tight, gradient text
- **Section (h2):** 4xl-5xl, font-light
- **Subsection (h3):** 2xl, font-semibold
- **Body:** text-xl, leading-relaxed
- **Small:** text-sm
- **Tiny:** text-xs

---

## 🧱 Components

### Glassmorphism Cards
```tsx
className="bg-glass-bg backdrop-blur-xl border border-glass-border
          rounded-2xl shadow-glass hover:border-beeline-yellow/30
          hover:shadow-glow transition-all"
```

### KPI Cards (Admin Dashboard)
- Icon badge with color coding
- Large value display (3xl font)
- Trend indicators with up/down arrows
- Subtitle for context

### Progress Bars
- Full-width track with rounded ends
- Colored fill with smooth transitions
- Percentage display
- Color variants: blue, green, purple, yellow, red

### Status Badges
```tsx
// Operational
className="bg-green-500/20 text-green-400 border border-green-500/30"

// Warning
className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"

// Error
className="bg-red-500/20 text-red-400 border border-red-500/30"
```

### Buttons
```tsx
// Primary (Gradient)
className="bg-gradient-beeline text-black font-semibold
          shadow-glow hover:shadow-glow-lg hover:scale-105"

// Secondary (Glass)
className="bg-glass-bg backdrop-blur-md border border-glass-border
          text-beeline-yellow hover:bg-dark-bg-tertiary/80"
```

---

## 🏗️ Layout Patterns

### Sticky Glass Header
- Fixed position with backdrop blur
- Translucent dark background
- Subtle yellow border-bottom

### Sidebar Navigation
- Collapsible (264px → 80px)
- Active state: yellow background + border
- Hover state: subtle bg change
- Icons always visible

### Main Content Grid
- Max-width containers (6xl, 7xl)
- Generous padding (p-8)
- Responsive grid gaps (gap-6, gap-8)

---

## 🎭 Animations

### Float Animation
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```
Used for: Demo cards, feature showcases

### Hover Transitions
- Card hover: `hover:-translate-y-1`
- Scale on click: `active:scale-95`
- Glow on hover: `hover:shadow-glow`

---

## 📱 Responsive Breakpoints

- **Mobile:** Default styles
- **Tablet (md):** 768px
- **Desktop (lg):** 1024px
- **Wide (xl):** 1280px

---

## 🎯 Design Inspirations

### From Cluely.com
- Trust signals banner (SOC 2, GDPR, etc.)
- 3-step visual process with numbers
- Generous spacing and breathing room
- Glassmorphism with subtle borders
- Persistent CTAs throughout

### From Linear/Vercel
- Dark mode color system
- Sidebar navigation pattern
- Provider-based architecture
- System status indicators
- Modular section layouts

---

## 📄 Page Implementations

### 1. Landing Page (`/`)
- Sticky glass header
- Hero with gradient text + floating demo card
- Trust signals banner
- 3-step process
- 4 feature cards
- Pricing tiers
- Footer with 5 columns

### 2. Vendor Dashboard (`/dashboard`)
- Collapsible sidebar
- Glass header with period selector
- 4 KPI cards with trends
- Recent conversations table
- Gradient avatars
- WhatsApp connection status

### 3. Super Admin Dashboard (`/admin`)
**Mission Control Center**
- Live connection monitor
- 4 top-level KPIs:
  - Total Vendors (with active %)
  - Live Connections (pulsing)
  - Total Conversations
  - Monthly Revenue
- 3 chart cards:
  - Account Type Distribution
  - Subscription Status
  - Platform Health
- Recent Vendors Table with search
- Auto-refresh every 30 seconds
- Export functionality

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with custom config
- **Icons:** React Icons (Fa*, Md*)
- **Fonts:** Google Fonts (Inter, JetBrains Mono)
- **MCP Tools:** Firecrawl (research), Superdesign (design)

---

## 📦 Files Modified

### Core Design System
- `tailwind.config.ts` - Extended with dark colors, glass utilities, gradients, shadows
- `app/components/BeelineLogo.tsx` - Reusable logo with hexagon icon

### Pages
- `app/page.tsx` - Dark landing page
- `app/dashboard/page.tsx` - Vendor dashboard
- `app/admin/page.tsx` - Super admin dashboard (needs creation)

### Backups
- `app/page-old.tsx` - Original light landing page
- `app/dashboard/page-old.tsx` - Original light dashboard
- `app/admin/page-old.tsx` - Original light admin dashboard

---

## 🚀 Next Steps for Monday Demo

### High Priority
1. ✅ Dark glassmorphism theme implemented
2. ✅ Vendor dashboard redesigned
3. ⏳ Super admin dashboard (create from scratch)
4. ⏳ Add real WhatsApp chat screenshots to hero
5. ⏳ Test responsive design on mobile/tablet

### Medium Priority
6. Add live system status API endpoint
7. Implement actual trend calculations (not hardcoded +12%)
8. Add export CSV functionality
9. Create vendor detail pages
10. Add conversation search/filter

### Low Priority (Post-Demo)
11. Add dark/light mode toggle
12. Implement dashboard charts (recharts)
13. Add email notification system
14. Create admin user management
15. Build analytics deep-dive page

---

## 💡 Design Philosophy

**"Darker, Translucent, Professional"**

The new Beeline design system embodies:
- **Confidence:** Dark backgrounds convey professionalism
- **Clarity:** High contrast text ensures readability
- **Depth:** Glassmorphism creates visual hierarchy
- **Energy:** Yellow-orange gradients inject warmth
- **Trust:** Security badges and status indicators build credibility

Inspired by the best SaaS dashboards (Vercel, Linear, Cluely), Beeline's interface is built for power users who need instant insights and seamless workflows.

---

**Built with 🐝 by Beeline Team**
**Powered by Claude Code + MCP Tools**
