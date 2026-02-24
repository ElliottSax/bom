# Supabase Migration Guide

Complete guide to migrating BOM Study Tools from Fly.io to Supabase.

## Overview

This migration moves:
- PostgreSQL database from Fly.io to Supabase
- GraphQL API from Python/Fly.io to Supabase auto-generated APIs
- Web app deployment to Vercel (with Supabase integration)
- Mobile app configuration to use Supabase client

## Why Supabase?

- **Free Tier**: 500MB database, 2GB bandwidth, 50k API requests/month
- **Auto-generated APIs**: REST and GraphQL APIs from database schema
- **Real-time**: Built-in subscriptions for live updates
- **Authentication**: Built-in auth with JWT tokens
- **Row Level Security**: Database-level security policies
- **No Credit Card**: Free tier doesn't require payment info

## Migration Strategy: Option A (Recommended)

**Use Supabase Auto-Generated APIs**

This is the simplest approach:
1. Migrate Prisma schema to Supabase migrations
2. Use Supabase's auto-generated REST/GraphQL APIs
3. Update web and mobile apps to use Supabase client
4. Deploy web app to Vercel
5. Mobile apps continue to work with new endpoint

### Pros:
- Fastest migration (1-2 hours)
- No API server to maintain
- Real-time subscriptions out of the box
- Built-in authentication
- Automatic API documentation

### Cons:
- Less control over API logic
- Need to migrate custom GraphQL resolvers to database functions
- Some complex queries may need to be simplified

## Prerequisites

1. **Node.js 18+** and npm
2. **Supabase Account** (free) - https://supabase.com/dashboard
3. **Supabase CLI** - Will be installed by setup script
4. **Vercel Account** (free) - https://vercel.com

## Quick Start

### 1. Run Setup Script

```bash
cd /mnt/e/projects/bom
./scripts/supabase/setup-supabase.sh
```

This will:
- Install Supabase CLI
- Initialize Supabase project
- Generate migration files from Prisma schema
- Set up local development environment

### 2. Create Supabase Project

```bash
# Option A: Create via CLI
./scripts/supabase/create-supabase-project.sh

# Option B: Create via Dashboard
# Visit https://supabase.com/dashboard
# Click "New Project"
# Name: bom-study-tools
# Database Password: [save this!]
# Region: Choose closest to users
```

### 3. Link Local Project to Cloud

```bash
cd /mnt/e/projects/bom
supabase link --project-ref your-project-ref
```

### 4. Run Migrations

```bash
./scripts/supabase/migrate-to-supabase.sh
```

This will:
- Push schema to Supabase
- Set up Row Level Security policies
- Create database functions for complex queries
- Seed initial data if needed

### 5. Update Environment Variables

```bash
# Copy Supabase credentials
./scripts/supabase/update-env-vars.sh
```

This creates:
- `.env.supabase` - Supabase credentials
- `.env.local` - Local development
- `.env.production` - Production deployment

### 6. Test Locally

```bash
# Start Supabase local stack
supabase start

# Test web app
cd apps/web
npm run dev

# Test mobile app
cd apps/mobile
npm start
```

### 7. Deploy to Production

```bash
# Deploy database migrations
supabase db push

# Deploy web app to Vercel
./scripts/supabase/deploy-web-vercel.sh

# Mobile apps - update with new API endpoint
./scripts/supabase/update-mobile-config.sh
```

## Detailed Migration Steps

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
supabase --version
```

### Step 2: Initialize Supabase

```bash
cd /mnt/e/projects/bom
supabase init
```

This creates:
```
supabase/
├── config.toml           # Supabase configuration
├── migrations/           # Database migrations
└── seed.sql             # Seed data
```

### Step 3: Convert Prisma Schema to Supabase Migration

The script `scripts/supabase/convert-prisma-to-sql.js` will:
1. Read `services/api/prisma/schema.prisma`
2. Generate SQL migration files
3. Add indexes and constraints
4. Set up Row Level Security

```bash
node scripts/supabase/convert-prisma-to-sql.js
```

### Step 4: Create Supabase Project

**Via Dashboard:**
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `bom-study-tools`
   - Database Password: [generate strong password]
   - Region: `us-east-1` (or closest to users)
4. Wait ~2 minutes for provisioning
5. Copy Project URL and API keys

**Via CLI:**
```bash
supabase projects create bom-study-tools --region us-east-1
```

### Step 5: Link Local to Cloud

```bash
supabase link --project-ref your-project-ref
```

Get project ref from dashboard: Settings > General > Reference ID

### Step 6: Push Schema to Supabase

```bash
# Run migrations
supabase db push

# Or apply specific migration
supabase migration up
```

### Step 7: Set Up Row Level Security (RLS)

RLS policies ensure users can only access their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

The migration script automatically creates all necessary policies.

### Step 8: Update Application Code

**Web App (Next.js):**

```bash
# Install Supabase client
cd apps/web
npm install @supabase/supabase-js
```

Update API configuration:
```typescript
// apps/web/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Mobile App (React Native):**

```bash
# Install Supabase client
cd apps/mobile
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
```

Update API configuration:
```typescript
// apps/mobile/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

### Step 9: Migrate API Queries

**Old (Apollo Client + GraphQL):**
```typescript
const { data } = await apolloClient.query({
  query: GET_VERSES,
  variables: { book: '1 Nephi', chapter: 1 }
})
```

**New (Supabase Client):**
```typescript
const { data, error } = await supabase
  .from('verses')
  .select('*')
  .eq('book', '1 Nephi')
  .eq('chapter', 1)
```

### Step 10: Deploy Web App to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd apps/web
vercel --prod
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Environment Variables

### Supabase Credentials

Get from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

```env
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Mobile App (.env)

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

## Data Migration

### Export Data from Fly.io

```bash
# Export from Fly.io Postgres
./scripts/supabase/export-flyio-data.sh
```

This creates:
- `migrations/data/verses.sql` - Scripture verses
- `migrations/data/users.sql` - User data (if any)
- `migrations/data/highlights.sql` - User highlights

### Import to Supabase

```bash
# Import data
./scripts/supabase/import-data-to-supabase.sh
```

Or use Supabase dashboard:
1. Go to Database > Tables
2. Select table
3. Click "Insert" > "Import from CSV"

## Authentication Migration

### Current: JWT Tokens
Fly.io API uses custom JWT authentication.

### New: Supabase Auth
Supabase provides built-in authentication:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Get session
const { data: { session } } = await supabase.auth.getSession()
```

## Testing

### Local Development

```bash
# Start Supabase locally
supabase start

# Access local dashboard
# http://localhost:54323

# Test web app
cd apps/web
npm run dev

# Run tests
npm test
```

### Production Testing

```bash
# Test API endpoints
./scripts/supabase/test-api.sh

# Test authentication
./scripts/supabase/test-auth.sh

# Load test
./scripts/supabase/load-test.sh
```

## Rollback Plan

If migration fails, you can rollback:

```bash
# Restore Fly.io API
fly apps resume bom-api

# Restore database connection
# Update .env.production with Fly.io DATABASE_URL

# Redeploy web app with old config
cd apps/web
vercel --prod
```

## Cost Comparison

### Fly.io (Current - Suspended)
- Database: $0/month (free tier) - but suspended
- API: $0/month (free tier) - but suspended
- **Issue**: Requires credit card, apps suspended

### Supabase (Recommended)
- Database: $0/month (500MB, free tier)
- API: $0/month (included)
- Bandwidth: 2GB/month free
- **No credit card required** for free tier

### Vercel (Web Hosting)
- Web App: $0/month (free tier)
- Bandwidth: 100GB/month free
- Serverless Functions: Free tier generous

**Total Cost: $0/month** (stays within free tiers)

## Performance Considerations

### Free Tier Limits

**Supabase Free:**
- 500MB database storage
- 2GB bandwidth/month
- 50k API requests/month
- 50k Edge Function invocations/month
- Paused after 7 days inactivity (auto-resumes on request)

**Vercel Free:**
- 100GB bandwidth/month
- 100k serverless function executions/month
- 6000 build minutes/month

### Optimization Tips

1. **Enable caching**: Use Vercel Edge Caching
2. **Paginate results**: Limit verses returned per request
3. **Use indexes**: Ensure all queries use database indexes
4. **CDN for static assets**: Use Vercel CDN
5. **Lazy load data**: Only fetch data when needed

## Monitoring

### Supabase Dashboard
- Database size: Settings > Usage
- API requests: Settings > Usage
- Performance: Database > Performance

### Vercel Dashboard
- Build status: Deployments
- Function logs: Functions
- Analytics: Analytics tab

## Support and Troubleshooting

### Common Issues

**Issue**: Migration fails with "relation already exists"
**Solution**: Drop and recreate database:
```bash
supabase db reset
supabase db push
```

**Issue**: RLS policies block queries
**Solution**: Check policies:
```bash
supabase db diff
```

**Issue**: Authentication fails
**Solution**: Verify anon key in environment variables

### Getting Help

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

## Next Steps After Migration

1. **Set up CI/CD**: Automate deployments
2. **Add monitoring**: Set up error tracking (Sentry)
3. **Performance testing**: Load test with realistic data
4. **User migration**: Migrate existing users to Supabase Auth
5. **Feature parity**: Ensure all Fly.io features work on Supabase

## Automated Migration Script

For a fully automated migration, run:

```bash
./scripts/supabase/migrate-all.sh
```

This script:
1. Checks prerequisites
2. Installs Supabase CLI
3. Initializes Supabase project
4. Converts schema
5. Pushes migrations
6. Imports data
7. Updates environment variables
8. Tests endpoints
9. Deploys to production

**Estimated time**: 30-45 minutes

## Success Criteria

Migration is successful when:
- [ ] All database tables exist in Supabase
- [ ] Row Level Security policies are active
- [ ] Web app connects to Supabase
- [ ] Mobile app connects to Supabase
- [ ] Authentication works
- [ ] All verses are queryable
- [ ] User data is preserved
- [ ] No errors in logs

## Documentation Updates

After migration, update:
- [ ] README.md - New setup instructions
- [ ] DEPLOYMENT_GUIDE.md - Supabase deployment
- [ ] ARCHITECTURE.md - Updated architecture diagram
- [ ] API_SPECIFICATION.md - Supabase API docs

---

**Ready to migrate?** Run `./scripts/supabase/setup-supabase.sh` to begin!
