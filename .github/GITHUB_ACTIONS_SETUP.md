# GitHub Actions Setup (Optional)

This guide explains how to set up automated deployments to Vercel using GitHub Actions.

## Why Use GitHub Actions?

- **Automated Deployments**: Push to main branch = automatic deployment
- **Preview Deployments**: Pull requests get preview URLs
- **Build Verification**: Catch build errors before deployment
- **CI/CD Pipeline**: Professional development workflow

## Prerequisites

1. GitHub repository with your LexiLedger code
2. Vercel account with a project created
3. Vercel CLI installed: `npm i -g vercel`

## Setup Steps

### 1. Get Vercel Credentials

```bash
# Login to Vercel
vercel login

# Link your project
cd lexiledger
vercel link

# This creates .vercel/project.json with your IDs
```

### 2. Get Vercel Token

1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Copy the token (you won't see it again!)

### 3. Get Project IDs

After running `vercel link`, check `.vercel/project.json`:

```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

### 4. Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add these secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `VERCEL_TOKEN` | Your Vercel token | Created in step 2 |
| `VERCEL_ORG_ID` | Your org ID | From `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Your project ID | From `.vercel/project.json` |
| `GEMINI_API_KEY` | Your Gemini API key | From Google AI Studio |
| `VITE_SUPABASE_URL` | Your Supabase URL | From Supabase dashboard |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | From Supabase dashboard |

### 5. Commit and Push

```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push
```

### 6. Verify Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see your workflow running
4. Click on it to see the progress
5. Once complete, your app is deployed!

## How It Works

### On Push to Main Branch:
1. Code is checked out
2. Dependencies are installed
3. Project is built with your environment variables
4. Built project is deployed to Vercel production
5. You get a notification with the deployment URL

### On Pull Request:
1. Same build steps
2. Deployed to a preview URL
3. Preview URL is commented on the PR
4. Perfect for testing before merging!

## Workflow File

The workflow is defined in `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Build project
      - Deploy to Vercel
```

## Troubleshooting

### Build Fails

**Check logs:**
1. Go to Actions tab
2. Click the failed workflow
3. Click the failed job
4. Expand the failing step

**Common issues:**
- Missing secrets: Add all required secrets
- Wrong Node version: Update in workflow file
- Dependencies error: Check package.json

### Deployment Fails

**Verify secrets:**
```bash
# Test locally with Vercel CLI
vercel --prod
```

**Check Vercel token:**
- Generate a new token if expired
- Update GitHub secret

### Environment Variables Not Working

**Remember the `VITE_` prefix:**
- ✅ `VITE_SUPABASE_URL`
- ❌ `SUPABASE_URL`

**Check in Vercel dashboard:**
1. Go to your project settings
2. Check Environment Variables
3. They should match your GitHub secrets

## Disable GitHub Actions

If you prefer manual deployments:

1. Delete `.github/workflows/deploy.yml`
2. Or rename it to `deploy.yml.disabled`
3. Commit and push

You can still deploy manually:
```bash
vercel --prod
```

## Alternative: Vercel Git Integration

Vercel can also deploy automatically via Git integration:

1. Go to Vercel dashboard
2. Import your GitHub repository
3. Vercel handles deployments automatically
4. No GitHub Actions needed

**GitHub Actions vs Vercel Git:**

| Feature | GitHub Actions | Vercel Git |
|---------|----------------|------------|
| Setup | More steps | Easier |
| Control | More control | Less control |
| Custom CI | Yes | Limited |
| Build logs | In GitHub | In Vercel |
| Best for | Advanced users | Quick setup |

Choose what works best for you! Both are excellent options.

## Next Steps

- Set up branch protection rules
- Add status checks to PRs
- Configure deployment notifications
- Add automated tests
- Set up staging environment

Happy deploying! 🚀


