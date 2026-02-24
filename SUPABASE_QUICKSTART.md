# Supabase Migration - Quick Start

Get your BOM Study Tools running on Supabase in under 1 hour.

## TL;DR - One Command Migration

```bash
cd /mnt/e/projects/bom
./scripts/supabase/migrate-all.sh
```

This interactive script handles everything. Estimated time: 30-45 minutes.

## Prerequisites (5 minutes)

1. **Node.js 18+** - Check: `node -v`
2. **Free Supabase account** - Sign up: https://supabase.com
3. **Free Vercel account** - Sign up: https://vercel.com

That's it. No credit card needed.

## Step-by-Step Migration (Manual)

### Step 1: Setup (5 minutes)

```bash
cd /mnt/e/projects/bom
./scripts/supabase/setup-supabase.sh
```

This installs Supabase CLI and creates migration files.

### Step 2: Create Supabase Project (3 minutes)

**Via Dashboard (Easiest)**:
1. Visit: https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `bom-study-tools`
   - Database Password: [generate & save securely]
   - Region: `us-east-1` (or closest to you)
4. Click "Create project"
5. Wait ~2 minutes for provisioning

### Step 3: Link Project (1 minute)

```bash
# Get project ref from dashboard (Settings > General > Reference ID)
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 4: Configure Environment (2 minutes)

Get credentials from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

Create `.env.supabase`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_PROJECT_REF=YOUR_PROJECT_REF
```

### Step 5: Migrate Database (5 minutes)

```bash
./scripts/supabase/migrate-to-supabase.sh
```

This creates all tables, indexes, and security policies.

### Step 6: Import Data (10-20 minutes)

```bash
./scripts/supabase/import-data-to-supabase.sh
```

Imports ~11,787 scripture verses. Time varies by data size.

### Step 7: Deploy Web App (5 minutes)

```bash
./scripts/supabase/deploy-web-vercel.sh
```

Deploys to Vercel. You'll get a live URL.

### Step 8: Update Mobile App (3 minutes)

```bash
./scripts/supabase/update-mobile-config.sh
```

Configures React Native app with Supabase client.

### Step 9: Test (5 minutes)

```bash
# Test connection
./scripts/supabase/test-connection.sh

# Test web app locally
cd apps/web
npm run dev
# Visit: http://localhost:3000

# Test mobile app
cd apps/mobile
npm start
```

## What Gets Migrated

### Database
- [x] 24 tables (users, verses, highlights, notes, etc.)
- [x] All indexes and constraints
- [x] Row Level Security policies
- [x] Database functions and triggers
- [x] Scripture data (11,787 verses)

### Applications
- [x] Web app → Vercel (free hosting)
- [x] Mobile app → Updated to use Supabase
- [x] API → Supabase auto-generated REST/GraphQL

### Authentication
- [x] Migrated to Supabase Auth
- [x] JWT tokens handled by Supabase
- [x] Session management built-in

## Free Tier Limits

**Supabase Free Tier**:
- 500MB database storage (plenty for scripture data)
- 2GB bandwidth/month (~20k API requests)
- 50k monthly active users
- Unlimited API requests
- Paused after 7 days inactivity (auto-resumes on request)

**Vercel Free Tier**:
- 100GB bandwidth/month
- Unlimited websites
- Automatic HTTPS

**Total Cost: $0/month** ✅

## Rollback Plan

If something goes wrong:

```bash
# Option 1: Reset Supabase database
supabase db reset
./scripts/supabase/migrate-to-supabase.sh

# Option 2: Delete and recreate project
# In Supabase dashboard: Settings > General > Delete Project
# Then start over from Step 2

# Option 3: Continue using Fly.io
# (If you add credit card to Fly.io)
```

## Common Issues

### "Command not found: supabase"
```bash
npm install -g supabase
```

### "Migration failed: relation already exists"
```bash
supabase db reset
supabase db push
```

### "Authentication failed"
Check `.env.supabase` has correct credentials from:
https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

### "No scripture data found"
Ensure you have one of:
- `scripture-data.json`
- `scripture-data.sql`
- `data/scriptures/` directory with CSV files

### "Vercel deployment failed"
```bash
# Login to Vercel
vercel login

# Try manual deployment
cd apps/web
vercel --prod
```

## What's Different from Fly.io?

### Before (Fly.io)
- Custom Python GraphQL API
- Manual database management
- Requires credit card (even for free tier)
- Apps suspended without payment info

### After (Supabase)
- Auto-generated REST/GraphQL APIs
- Managed PostgreSQL database
- Built-in authentication
- No credit card needed
- Real-time subscriptions included
- Better developer experience

## Performance

Supabase free tier is suitable for:
- Small to medium apps (< 50k MAU)
- Scripture study apps (mostly reads)
- Development and testing

For production at scale, consider:
- Supabase Pro: $25/month (8GB database, 250GB bandwidth)
- Supabase Team: $599/month (dedicated resources)

## Next Steps After Migration

1. **Test thoroughly**:
   - Create test user account
   - Read verses
   - Create highlights and notes
   - Test search functionality

2. **Update mobile apps**:
   - Replace Apollo Client with Supabase client
   - Update authentication flow
   - Test offline sync

3. **Monitor usage**:
   - Dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/usage
   - Set up email alerts for approaching limits

4. **Optimize**:
   - Add database indexes for slow queries
   - Enable caching on Vercel
   - Optimize image loading

5. **Deploy mobile apps**:
   - Update API endpoints in app
   - Test on real devices
   - Submit to App Store / Play Store

## Getting Help

- **Documentation**: See SUPABASE_MIGRATION_GUIDE.md
- **Scripts Documentation**: See scripts/supabase/README.md
- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Vercel Support**: https://vercel.com/support

## Success Checklist

Migration is complete when:

- [ ] Supabase project created
- [ ] Database schema migrated (24 tables)
- [ ] Scripture data imported (~11,787 verses)
- [ ] Web app deployed to Vercel
- [ ] Web app loads and shows verses
- [ ] Authentication works
- [ ] Mobile app configured
- [ ] Mobile app connects to Supabase
- [ ] All tests pass
- [ ] No errors in logs

## Estimated Timeline

| Task | Time | Cumulative |
|------|------|------------|
| Prerequisites | 5 min | 5 min |
| Setup | 5 min | 10 min |
| Create Supabase project | 3 min | 13 min |
| Link project | 1 min | 14 min |
| Configure environment | 2 min | 16 min |
| Migrate database | 5 min | 21 min |
| Import data | 15 min | 36 min |
| Deploy web app | 5 min | 41 min |
| Update mobile app | 3 min | 44 min |
| Testing | 5 min | 49 min |
| **Total** | **~50 minutes** | |

With the automated script: **30-45 minutes**

---

**Ready to migrate?**

```bash
cd /mnt/e/projects/bom
./scripts/supabase/migrate-all.sh
```

Good luck! 🚀
