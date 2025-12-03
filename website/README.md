# Beeline Website

Landing page and vendor onboarding portal for Beeline Ghana - Your AI Employee Lives in Your Phone Number.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
website/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── signup/            # Vendor signup flow
│   │   └── page.tsx
│   ├── ref/               # Referral landing page
│   │   └── page.tsx
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable components (future)
├── public/               # Static assets
├── package.json          # Dependencies
└── tailwind.config.ts    # Tailwind configuration
```

## Pages

### 1. Landing Page (`/`)
- Hero section with value proposition
- Problem/Solution sections
- How it works
- Pricing
- CTA sections

### 2. Signup Flow (`/signup`)
Multi-step vendor onboarding:
- Step 1: Basic info (name, phone, business type)
- Step 2: Voice note (describe products)
- Step 3: Personality selection (casual/formal/twi-heavy)
- Step 4: QR code to connect WhatsApp

### 3. Referral Page (`/ref?ref=vendor-id`)
- Special landing for referred vendors
- 7-day free trial offer
- Benefits showcase
- Links to signup with referral tracking

## Key Features

- 🎨 **Responsive Design**: Mobile-first, works on all devices
- ⚡ **Fast Loading**: Optimized with Next.js
- 🐝 **Brand Colors**: Yellow (#FFD700) and Black (#1a1a1a)
- 🌍 **Ghana-focused**: GHS pricing, Twi language support
- 🔗 **Referral System**: Built-in viral growth mechanism

## Deployment to Vercel

### Quick Deploy

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy!

### Vercel Configuration

Create `vercel.json` (optional):
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Environment Variables on Vercel

Set these in your Vercel project settings:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_N8N_WEBHOOK_URL`
- `NEXT_PUBLIC_SITE_URL`

### Custom Domain

1. Go to Vercel project settings
2. Add custom domain: `beeline.works`
3. Update DNS records as instructed
4. SSL certificate auto-generated

## TODO / Next Steps

- [ ] Implement actual voice recording (Web Audio API)
- [ ] Connect signup form to backend API
- [ ] Implement QR code generation
- [ ] Add analytics (Vercel Analytics or Google Analytics)
- [ ] Add testimonials section
- [ ] Create vendor dashboard
- [ ] Implement payment integration
- [ ] Add FAQ section
- [ ] Add blog for SEO

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Design System

### Colors
- **Beeline Yellow**: `#FFD700` - Primary brand color
- **Beeline Black**: `#1a1a1a` - Text and secondary
- **Beeline Gray**: `#f5f5f5` - Backgrounds

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, 2xl-6xl
- **Body**: Regular, base-lg

### Components
- `btn-primary`: Yellow button with hover effect
- `btn-secondary`: Black button with hover effect
- `section-container`: Max-width container with padding

## Support

For issues or questions:
- GitHub: [github.com/nanayawjoshua/whatsapp-ai-platform-beeline](https://github.com/nanayawjoshua/whatsapp-ai-platform-beeline)
- Email: support@beeline.works (when available)

---

Built with 🐝 in Ghana
