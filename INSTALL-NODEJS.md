# Install Node.js for Beeline Website Development

## Quick Installation Steps

### Step 1: Download Node.js

1. Go to: **https://nodejs.org/en/download/**
2. Click the big green button: **"Windows Installer (.msi)"**
3. Choose: **LTS (Long Term Support)** version
   - Currently: Node.js 20.x or 22.x
   - File size: ~30 MB
   - This is the stable, recommended version

### Step 2: Install

1. **Run the downloaded .msi file**
2. Click "Next" through the installer
3. **IMPORTANT**: Check the box that says:
   - ✅ "Automatically install the necessary tools"
   - This installs build tools you might need

4. Accept all defaults
5. Click "Install"
6. Wait 2-3 minutes
7. Click "Finish"

### Step 3: Verify Installation

1. **Close ALL PowerShell/Terminal windows**
2. Open a **NEW** PowerShell window
3. Type these commands to verify:

```powershell
node --version
# Should show: v20.x.x or v22.x.x

npm --version
# Should show: 10.x.x or higher
```

If you see version numbers, you're good! ✅

---

## Then Run the Website

Once Node.js is installed:

```powershell
# Navigate to website folder
cd C:\Users\USER\Desktop\josh\whatsapp-ai-platform-beeline-main\whatsapp-ai-platform-beeline-main\website

# Install dependencies (first time only, takes 2-3 minutes)
npm install

# Start development server
npm run dev
```

You'll see:
```
> beeline-website@0.1.0 dev
> next dev

  ▲ Next.js 14.2.18
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

✓ Ready in 2.1s
```

Then open: **http://localhost:3000** in your browser 🎉

---

## Troubleshooting

### "npm still not recognized"
- **Solution**: Close PowerShell and open a NEW window
- Node.js adds to PATH, but old terminals don't see it

### "npm install takes forever"
- **Normal**: First install takes 2-3 minutes (downloading ~200 packages)
- **Watch for**: Green checkmarks ✓ as packages install

### "Build errors about TypeScript"
- **Solution**: Install TypeScript globally
  ```powershell
  npm install -g typescript
  ```

### "Port 3000 already in use"
- **Solution**: Kill whatever's using it, or Next.js will auto-pick port 3001
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <process_id> /F
  ```

---

## Alternative: Skip Local Setup, Deploy to Vercel

If Node.js installation fails or you want to skip it:

1. **Just push to GitHub**:
   ```bash
   git push origin website
   ```

2. **Deploy on Vercel** (they handle Node.js for you)
   - Visit vercel.com
   - Connect GitHub repo
   - Vercel builds and deploys
   - See live site immediately

**This is actually the recommended workflow for Next.js!** 🚀

---

## After Installation

Once npm install finishes successfully, you can:

```powershell
# Start dev server
npm run dev          # http://localhost:3000

# Build for production
npm run build        # Creates optimized .next folder

# Run production build locally
npm start            # Must run npm build first

# Check for code issues
npm run lint         # ESLint checking
```

---

## Expected First Run Output

When you run `npm run dev` for the first time:

```
> beeline-website@0.1.0 dev
> next dev

  ▲ Next.js 14.2.18
  - Local:        http://localhost:3000

 ✓ Ready in 2435ms
 ○ Compiling / ...
 ✓ Compiled / in 3.2s
```

Open **http://localhost:3000** and you'll see your beautiful landing page! 🐝

---

## What You're Installing

- **Node.js**: JavaScript runtime (runs Next.js)
- **npm**: Package manager (installs dependencies)
- **270+ packages** including:
  - next (framework)
  - react (UI library)
  - tailwindcss (styling)
  - typescript (type safety)
  - Total size: ~350 MB in node_modules/

**Don't worry about the size** - this is normal for modern web development. None of this goes to production (Vercel handles that).

---

## Quick Commands Reference

```powershell
# Check versions
node -v
npm -v

# Install dependencies
npm install          # or: npm i

# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Run production build

# Clean up
rm -r node_modules   # Remove packages
rm -r .next          # Remove build cache
npm install          # Reinstall fresh
```

---

**Ready?** Download Node.js and you'll be running the site in 5 minutes! 🚀
