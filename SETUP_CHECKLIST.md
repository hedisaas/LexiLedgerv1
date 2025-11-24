# LexiLedger Setup Checklist

Use this checklist to ensure everything is set up correctly.

## ✅ Development Setup

### Prerequisites
- [ ] Node.js v18+ installed
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### Accounts Created
- [ ] Supabase account created at [supabase.com](https://supabase.com)
- [ ] Google account for Gemini API
- [ ] GitHub account (for deployment)
- [ ] Vercel account at [vercel.com](https://vercel.com)

### API Keys Obtained
- [ ] Supabase Project URL
- [ ] Supabase Anon Key
- [ ] Gemini API Key from [ai.google.dev](https://ai.google.dev)

### Local Setup
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` file created with all keys
- [ ] App runs locally (`npm run dev`)

## ✅ Supabase Configuration

### Database Setup
- [ ] Supabase project created
- [ ] Database migration `001_initial_schema.sql` executed
- [ ] All 8 tables created successfully
- [ ] Row Level Security policies enabled

### Authentication Setup
- [ ] Email provider enabled
- [ ] Email templates reviewed
- [ ] Test signup completed
- [ ] Email verification working
- [ ] Test signin successful

### Test Account Created
- [ ] Admin account created
- [ ] Email verified
- [ ] Can login successfully
- [ ] Can access all features

### Optional: Seed Data
- [ ] User ID obtained from auth.users
- [ ] Seed data script modified
- [ ] Sample data inserted
- [ ] Dashboard shows data

## ✅ Local Testing

### Features Tested
- [ ] Dashboard loads with charts
- [ ] Can add translation job
- [ ] Can add expense
- [ ] Can create quote
- [ ] Can convert quote to job
- [ ] Can view client list
- [ ] Can update business profile
- [ ] Can generate invoice
- [ ] Language toggle works (EN/FR)
- [ ] Data persists after refresh

### Authentication Tested
- [ ] Can sign up
- [ ] Can sign in
- [ ] Can sign out
- [ ] Session persists
- [ ] Protected routes work

## ✅ Production Deployment

### Code Repository
- [ ] Code pushed to GitHub
- [ ] `.env.local` NOT in repository
- [ ] `.gitignore` properly configured
- [ ] All changes committed

### Vercel Setup
- [ ] Vercel project created
- [ ] Repository linked to Vercel
- [ ] Environment variables added:
  - [ ] `GEMINI_API_KEY`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Build successful
- [ ] Deployment successful

### Post-Deployment
- [ ] Production URL works
- [ ] Can access login page
- [ ] Can create new account
- [ ] Email verification works in production
- [ ] All features work in production
- [ ] No console errors
- [ ] Mobile responsive checked

### Supabase Production Config
- [ ] Site URL updated to Vercel domain
- [ ] Redirect URLs include Vercel domain
- [ ] RLS policies verified
- [ ] Database backed up

## ✅ Optional Enhancements

### Custom Domain
- [ ] Domain purchased
- [ ] DNS configured
- [ ] Domain added in Vercel
- [ ] SSL certificate active
- [ ] Supabase URLs updated

### GitHub Actions (Optional)
- [ ] Workflow file added
- [ ] GitHub secrets configured
- [ ] Test deployment successful
- [ ] Auto-deploy on push working

### Monitoring
- [ ] Vercel analytics enabled
- [ ] Supabase monitoring checked
- [ ] Error tracking set up
- [ ] Performance baselines recorded

### Customization
- [ ] Business logo uploaded
- [ ] Business profile updated
- [ ] Invoice template customized
- [ ] Email templates branded

## ✅ Security Review

### Environment Variables
- [ ] No secrets in code
- [ ] `.env.local` in `.gitignore`
- [ ] Vercel env vars set
- [ ] Using anon key (not service role key)

### Database Security
- [ ] RLS enabled on all tables
- [ ] RLS policies tested
- [ ] No public write access
- [ ] User isolation verified

### Authentication
- [ ] Email verification required
- [ ] Strong password enforced
- [ ] Session timeout configured
- [ ] No hardcoded credentials

## ✅ User Documentation

### Team Onboarding
- [ ] Admin login shared
- [ ] Secretary accounts created (if needed)
- [ ] User guide prepared
- [ ] Training scheduled

### Client Setup
- [ ] Client portal tested
- [ ] Access code shared
- [ ] Invoice template approved
- [ ] Client feedback collected

## 🎉 Launch Checklist

### Pre-Launch
- [ ] All features tested
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Mobile experience good
- [ ] Browser compatibility checked

### Launch Day
- [ ] Monitoring active
- [ ] Team notified
- [ ] Clients notified (if applicable)
- [ ] Backup plan ready

### Post-Launch
- [ ] Monitor for errors
- [ ] Check performance metrics
- [ ] Gather user feedback
- [ ] Plan next features

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/
- **React Docs**: https://react.dev/

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check environment variables |
| Auth doesn't work | Verify Supabase URL config |
| Data not saving | Check RLS policies |
| 404 on refresh | Verify Vercel rewrites |
| Slow loading | Check bundle size |

## 📝 Notes

Use this space to track any custom configurations or issues:

```
Date: ___________
Notes:








```

---

✨ **Congratulations on setting up LexiLedger!** ✨

Once all checkboxes are ticked, you're ready to manage your translation business professionally!


