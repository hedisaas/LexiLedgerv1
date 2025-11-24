# Quick Start Guide

Get LexiLedger running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project (takes ~2 min)
3. Go to SQL Editor → New Query
4. Copy/paste contents of `supabase/migrations/001_initial_schema.sql`
5. Click "Run"

### 3. Get Your Credentials

**Supabase** (Settings → API):
- Project URL
- Anon key

**Gemini** (Get free key at [ai.google.dev](https://ai.google.dev)):
- API key

### 4. Create `.env.local`

Create a file named `.env.local` in project root:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_key_here
```

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 6. Create Account

1. Click "Sign up"
2. Fill in details (use Admin role)
3. Check email for verification
4. Sign in

Done! 🎉

## 📦 Deploy to Production

### Quick Deploy to Vercel

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/lexiledger.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Add same environment variables
5. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🆘 Need Help?

- **Database issues?** Check Supabase dashboard → SQL Editor → Run test query
- **Auth not working?** Verify email in Supabase Auth → Users
- **Build errors?** Run `rm -rf node_modules && npm install`
- **Environment variables?** They must start with `VITE_` for Vite apps

## 📚 Full Documentation

- [README.md](README.md) - Complete setup guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide

## ✨ Features to Try

1. **Dashboard** - View revenue and expense analytics
2. **Translations** - Add a translation job
3. **Quotes** - Create a quote and convert it to a job
4. **Expenses** - Track business expenses
5. **Clients** - View all client interactions
6. **Settings** - Add your business info and logo
7. **AI Assistant** - Get help with translations (coming soon)

## 🔐 Default Test Credentials

After signup, you can create multiple accounts for different roles:
- **Admin**: Full access
- **Secretary**: Limited access (no expenses)
- **Client Portal**: Use access code "1234" for testing

Enjoy using LexiLedger! 💼✨


