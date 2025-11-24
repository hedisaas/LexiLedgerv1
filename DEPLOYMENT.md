# LexiLedger Deployment Guide

This guide walks you through deploying LexiLedger to production using Supabase and Vercel.

## Table of Contents

1. [Supabase Setup](#supabase-setup)
2. [Vercel Deployment](#vercel-deployment)
3. [Post-Deployment Configuration](#post-deployment-configuration)
4. [Custom Domain Setup](#custom-domain-setup)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Configure your project:
   - **Organization**: Select or create one
   - **Name**: `lexiledger-prod` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Start with Free tier (upgrade as needed)
5. Click "Create new project"
6. Wait 2-3 minutes for provisioning

### Step 2: Configure Database

1. Navigate to **SQL Editor** in the Supabase dashboard
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click "Run" (or press Ctrl/Cmd + Enter)
6. Verify success - you should see "Success. No rows returned"

### Step 3: Verify Database Tables

1. Go to **Database** → **Tables**
2. You should see these tables:
   - `business_profiles`
   - `translation_jobs`
   - `quotes`
   - `expenses`
   - `glossary_terms`
   - `tm_units`
   - `user_roles`
   - `client_access`

### Step 4: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Ensure "Email" is enabled
3. Configure email templates:
   - Go to **Authentication** → **Email Templates**
   - Customize "Confirm signup" template (optional)
   - Customize "Magic Link" template (optional)
   - Customize "Change Email Address" template (optional)

### Step 5: Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

### Step 6: Configure Security Settings (Optional)

1. Go to **Authentication** → **Policies**
2. Review Row Level Security policies (already configured by migration)
3. Go to **Settings** → **Auth**
4. Configure:
   - **Site URL**: Your Vercel domain (update after deployment)
   - **Redirect URLs**: Add your Vercel domain

## Vercel Deployment

### Method 1: Deploy via GitHub (Recommended)

#### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with Supabase integration"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/lexiledger.git
git branch -M main
git push -u origin main
```

#### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `lexiledger` repository
5. Configure the project:
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)

#### Step 3: Add Environment Variables

In the Vercel project configuration, add these environment variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_anon_key_here
```

**Important**: Make sure to use `VITE_` prefix for Vite to expose them to the client.

#### Step 4: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for the build to complete
3. You'll get a URL like `https://lexiledger-xxxx.vercel.app`

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# ? Set up and deploy "~/lexiledger"? [Y/n] y
# ? Which scope do you want to deploy to? [Your account]
# ? Link to existing project? [y/N] n
# ? What's your project's name? lexiledger
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] n

# Add environment variables
vercel env add GEMINI_API_KEY
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

## Post-Deployment Configuration

### 1. Update Supabase Auth Settings

1. Go to your Supabase project
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: Add `https://your-app.vercel.app/**`

### 2. Test Authentication

1. Visit your deployed app
2. Try to sign up with a test email
3. Check email for verification link
4. Verify the link works and redirects properly
5. Sign in and test the app functionality

### 3. Create Your Admin Account

1. Go to your deployed app
2. Click "Sign up"
3. Fill in:
   - **Full Name**: Your name
   - **Role**: Admin
   - **Email**: Your email
   - **Password**: Strong password
4. Verify your email
5. Sign in

### 4. Optional: Add Seed Data

If you want sample data for testing:

1. Go to Supabase SQL Editor
2. Run: `SELECT id FROM auth.users WHERE email = 'your@email.com';`
3. Copy your user ID
4. Open `supabase/migrations/002_seed_data.sql`
5. Replace all `YOUR_USER_ID` with your actual ID
6. Uncomment the INSERT statements
7. Run the modified SQL in Supabase

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your Vercel project
2. Click **Settings** → **Domains**
3. Enter your domain (e.g., `lexiledger.com`)
4. Click "Add"

### Step 2: Configure DNS

Add these records in your domain registrar:

**For root domain (example.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Update Supabase URLs

1. Go to Supabase **Authentication** → **URL Configuration**
2. Update **Site URL** to your custom domain
3. Update **Redirect URLs** to include your custom domain

### Step 4: Wait for SSL

- SSL certificates are automatically provisioned
- Usually takes 5-10 minutes
- Your site will be accessible via HTTPS

## Monitoring and Maintenance

### Vercel Monitoring

1. **Analytics**: Go to your project → **Analytics**
   - Track page views, visitors, and performance
2. **Logs**: Go to **Deployments** → Click a deployment → **Logs**
   - View build and runtime logs
3. **Speed Insights**: Enable in project settings
   - Monitor real user performance metrics

### Supabase Monitoring

1. **Database Health**: **Database** → **Overview**
   - Monitor connections, size, and load
2. **Auth Metrics**: **Authentication** → **Users**
   - Track signups and active users
3. **API Usage**: **Settings** → **Usage**
   - Monitor API requests and bandwidth

### Regular Maintenance

1. **Update Dependencies**:
   ```bash
   npm update
   npm audit fix
   git commit -am "Update dependencies"
   git push
   ```

2. **Database Backups**:
   - Supabase Free: Daily automated backups (7-day retention)
   - Supabase Pro: Point-in-time recovery

3. **Monitor Errors**:
   - Check Vercel logs regularly
   - Check Supabase logs for database errors

### Scaling Considerations

**When to upgrade Supabase:**
- Free tier: 500 MB database, 50,000 monthly active users
- Pro tier: 8 GB database, 100,000 monthly active users
- Consider upgrading when approaching limits

**Vercel limits:**
- Free tier: 100 GB bandwidth/month
- Pro tier: 1 TB bandwidth/month
- Enterprise: Unlimited

## Troubleshooting

### Build Failures

**Error: Module not found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

**Error: Environment variables not found**
- Verify variables in Vercel dashboard
- Ensure `VITE_` prefix is used
- Redeploy after adding variables

### Authentication Issues

**Email not sending:**
1. Check Supabase Auth settings
2. Verify SMTP configuration (if custom)
3. Check spam folder
4. Check Supabase logs

**Redirect not working:**
1. Verify Site URL in Supabase
2. Check Redirect URLs include your domain
3. Clear browser cache and cookies

### Database Connection Issues

**Error: "Failed to fetch"**
1. Check VITE_SUPABASE_URL is correct
2. Verify VITE_SUPABASE_ANON_KEY is correct
3. Check Supabase project is not paused

**Row Level Security errors:**
1. Verify user is authenticated
2. Check RLS policies in Supabase
3. Review SQL logs in Supabase

## Support

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Community**: https://github.com/yourusername/lexiledger/issues

## Security Checklist

- [ ] Environment variables are set in Vercel (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] Row Level Security is enabled on all tables
- [ ] Supabase API keys are the anon key (not service role key)
- [ ] SSL/HTTPS is enabled (automatic with Vercel)
- [ ] Strong passwords required for authentication
- [ ] Email verification is enabled
- [ ] Regular backups are configured
- [ ] Dependencies are up to date
- [ ] Error logging is set up

## Next Steps

1. Set up custom domain
2. Configure email templates with your branding
3. Add your business logo in Settings
4. Invite team members (secretary accounts)
5. Set up client portal access for clients
6. Configure automated backups
7. Set up monitoring alerts
8. Plan for scaling as user base grows

Congratulations! Your LexiLedger app is now live! 🎉


