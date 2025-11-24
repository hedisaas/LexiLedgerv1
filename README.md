<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LexiLedger - Translation Management System

A comprehensive financial dashboard and translation management system designed for sworn translators to track jobs, manage expenses, analyze revenue, and generate invoices.

## Features

- 🔐 **Multi-Role Authentication** (Admin, Secretary, Client Portal)
- 📋 **Translation Job Management** with status tracking
- 💰 **Expense Tracking & Financial Analytics**
- 📊 **Real-time Dashboard** with charts and insights
- 📄 **Quote Management** with conversion to jobs
- 🧾 **Invoice Generation** with printable templates
- 👥 **Client Management** system
- 🤖 **AI Assistant** powered by Google Gemini
- 🌍 **Multi-language Support** (English/French)
- ☁️ **Cloud Storage** with Supabase
- 📱 **Responsive Design** for mobile and desktop

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Google Gemini API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account ([sign up here](https://supabase.com))
- Google Gemini API key ([get one here](https://ai.google.dev))
- Vercel account for deployment ([sign up here](https://vercel.com))

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd lexiledger
npm install
```

### 2. Supabase Setup

#### Step 2.1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: LexiLedger
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Wait for the project to be created (~2 minutes)

#### Step 2.2: Run Database Migration

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor and click "Run"
5. Verify the tables were created by going to **Database** → **Tables**

#### Step 2.3: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Environment Variables Setup

Create a `.env.local` file in the project root:

```bash
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Important**: Never commit `.env.local` to version control!

### 4. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Create Your First Account

1. Open the app in your browser
2. Click "Don't have an account? Sign up"
3. Fill in your details:
   - **Full Name**: Your name
   - **Role**: Admin (for full access)
   - **Email**: Your email
   - **Password**: Choose a secure password
4. Check your email for verification link
5. Click the verification link
6. Sign in with your credentials

## Deploy to Vercel

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your GitHub repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - `GEMINI_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`

## Supabase Configuration

### Row Level Security (RLS)

The database uses Row Level Security to ensure users can only access their own data. RLS policies are automatically created by the migration script.

### User Roles

Three roles are supported:
- **Admin**: Full access to all features
- **Secretary**: Limited access (no expenses view)
- **Client**: Read-only access via client portal

### Email Authentication

Supabase handles email/password authentication. Configure email templates:

1. Go to **Authentication** → **Email Templates** in Supabase
2. Customize the confirmation and password reset emails

## Development

### Project Structure

```
lexiledger/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── TranslationManager.tsx
│   ├── ExpenseManager.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   └── useSupabaseData.ts
├── lib/                # Library configurations
│   └── supabase.ts
├── services/           # External services
│   ├── geminiService.ts
│   └── tmService.ts
├── supabase/           # Database migrations
│   └── migrations/
├── App.tsx             # Main application component
├── types.ts            # TypeScript type definitions
└── locales.ts          # Internationalization
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

### Supabase Connection Issues

- Verify your environment variables are correct
- Check that RLS policies are enabled
- Ensure email verification is complete

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

### Authentication Issues

- Check Supabase Auth logs in the dashboard
- Verify email templates are configured
- Check spam folder for verification emails

## Support

For issues or questions:
1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Check the [Vercel Documentation](https://vercel.com/docs)
3. Open an issue in this repository

## License

MIT License - feel free to use this project for your own translation business!
