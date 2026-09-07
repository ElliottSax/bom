# Deployment Guide - Supabase + Vercel

Complete deployment instructions for BOM Study Tools on Supabase and Vercel.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Production Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │   Vercel     │      │   Supabase   │      │  Mobile  │ │
│  │  (Web App)   │─────▶│  (Database   │◀─────│   Apps   │ │
│  │              │      │   + API)     │      │          │ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│        │                      │                     │       │
│        │                      │                     │       │
│        ▼                      ▼                     ▼       │
│  Users access via      Auto-generated         Native iOS   │
│  bomstudytools.com    REST/GraphQL APIs      & Android     │
│                       + Authentication                      │
└─────────────────────────────────────────────────────────────┘
```

## Quick Deploy

```bash
cd /mnt/e/projects/bom
./scripts/supabase/migrate-all.sh
```

This automated script handles:

1. Supabase setup
2. Database migration
3. Data import
4. Web deployment
5. Mobile configuration

Estimated time: 30-45 minutes

## Manual Deployment

### Part 1: Supabase Setup (Database + API)

#### 1.1 Create Supabase Project

**Via Dashboard**:

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Configure:
   - Name: `bom-study-tools`
   - Database Password: [save securely]
   - Region: `us-east-1` (or closest)
4. Wait ~2 minutes for provisioning

**Via CLI**:

```bash
npm install -g supabase
supabase projects create bom-study-tools --region us-east-1
```

#### 1.2 Initialize Local Project

```bash
cd /mnt/e/projects/bom
supabase init
```

#### 1.3 Link to Cloud Project

```bash
# Get project ref from dashboard: Settings > General > Reference ID
supabase link --project-ref YOUR_PROJECT_REF
```

#### 1.4 Create Migration

```bash
node scripts/supabase/convert-prisma-to-sql.js
```

This creates: `supabase/migrations/TIMESTAMP_initial_schema.sql`

#### 1.5 Push Schema

```bash
supabase db push
```

Verify at: https://supabase.com/dashboard/project/YOUR_PROJECT/editor

#### 1.6 Import Scripture Data

```bash
./scripts/supabase/import-data-to-supabase.sh
```

Or manually via dashboard:

1. Go to Table Editor
2. Select `verses` table
3. Click "Insert" > "Import CSV"
4. Upload scripture data

#### 1.7 Configure Row Level Security

RLS policies are automatically created by the migration. Verify:

```bash
supabase db remote list
```

Check that all user tables have RLS enabled.

#### 1.8 Get API Credentials

Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

Copy:

- Project URL: `https://YOUR_PROJECT_REF.supabase.co`
- Anon (public) key
- Service role key (keep secret!)

### Part 2: Web App Deployment (Vercel)

#### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 2.2 Configure Environment Variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 2.3 Test Locally

```bash
cd apps/web
npm install
npm run dev
```

Visit: http://localhost:3000

Verify:

- Home page loads
- Can view verses
- Authentication works

#### 2.4 Deploy to Vercel

**Via CLI**:

```bash
cd apps/web
vercel --prod
```

Follow prompts:

- Set up and deploy: Yes
- Which scope: Your account
- Link to existing project: No
- Project name: bom-study-tools
- Directory: ./
- Override settings: No

**Via Dashboard**:

1. Go to https://vercel.com/new
2. Import Git repository
3. Configure:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

#### 2.5 Configure Custom Domain (Optional)

```bash
vercel domains add bomstudytools.com
```

Or via dashboard:

1. Go to Project Settings > Domains
2. Add domain
3. Configure DNS records as shown

### Part 3: Mobile App Configuration

#### 3.1 Update Configuration

```bash
./scripts/supabase/update-mobile-config.sh
```

This:

- Installs Supabase client
- Creates configuration files
- Generates example hooks

#### 3.2 Update API Endpoints

Edit `apps/mobile/.env`:

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

#### 3.3 Update Components

Replace Apollo Client queries with Supabase:

**Before (Apollo)**:

```typescript
const { data } = useQuery(GET_VERSES, {
  variables: { book: '1 Nephi', chapter: 1 },
});
```

**After (Supabase)**:

```typescript
import { useVerses } from './hooks/useVerses';

const { verses, loading } = useVerses('1 Nephi', 1);
```

#### 3.4 Test Mobile App

**iOS**:

```bash
cd apps/mobile
npm start
npx react-native run-ios
```

**Android**:

```bash
cd apps/mobile
npm start
npx react-native run-android
```

#### 3.5 Build for Production

**iOS (App Store)**:

```bash
cd apps/mobile/ios
pod install
xcodebuild -workspace BOMStudyTools.xcworkspace -scheme BOMStudyTools -configuration Release
```

**Android (Play Store)**:

```bash
cd apps/mobile/android
./gradlew assembleRelease
```

## Environment Variables

### Development (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Production (Vercel Environment Variables)

Add in Vercel Dashboard > Settings > Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Mobile (.env)

```env
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## Monitoring

### Supabase Dashboard

Monitor at: https://supabase.com/dashboard/project/YOUR_PROJECT

**Database Usage**:

- Settings > Usage > Database
- Monitor storage (500MB free tier)
- Check connection count

**API Usage**:

- Settings > Usage > API
- Monitor bandwidth (2GB/month free)
- Check request count

**Performance**:

- Database > Performance
- Slow query log
- Connection pool stats

### Vercel Dashboard

Monitor at: https://vercel.com/dashboard

**Deployments**:

- View build logs
- Check deployment status
- Monitor function execution time

**Analytics**:

- Page views
- User locations
- Performance metrics

**Functions**:

- Execution count
- Average duration
- Error rate

### Logs

**Supabase Logs**:

```bash
supabase functions logs
```

**Vercel Logs**:

```bash
vercel logs
```

## Performance Optimization

### Database Indexes

Indexes are automatically created by migration. Verify with:

```sql
SELECT * FROM pg_indexes WHERE schemaname = 'public';
```

Add custom indexes for slow queries:

```sql
CREATE INDEX idx_verses_text_search ON verses USING GIN (to_tsvector('english', text));
```

### Caching

**Vercel Edge Caching**:

Add to `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=60, stale-while-revalidate',
          },
        ],
      },
    ];
  },
};
```

**Supabase Caching**:

Use React Query for client-side caching:

```typescript
const { data } = useVerses('1 Nephi', 1);
// Automatically cached for 5 minutes
```

### Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image';

<Image src="/images/hero.jpg" width={800} height={600} alt="Book of Mormon" />;
```

## Security

### API Keys

- **Anon Key**: Safe to expose in client-side code (public)
- **Service Role Key**: NEVER expose to client (server-only)

### Row Level Security

All user tables have RLS enabled:

```sql
-- Example: Users can only read their own data
CREATE POLICY "Users can view own data"
  ON highlights FOR SELECT
  USING (auth.uid() = user_id);
```

### Rate Limiting

Supabase automatically rate limits:

- 100 requests per second per IP
- Configurable in dashboard

Add application-level rate limiting:

```typescript
import { rateLimit } from '@/lib/rate-limit';

export default async function handler(req, res) {
  try {
    await rateLimit(req);
    // Handle request
  } catch {
    res.status(429).json({ error: 'Too many requests' });
  }
}
```

### CORS Configuration

Configure in Supabase dashboard:

1. Settings > API
2. Add allowed origins:
   - `https://bomstudytools.com`
   - `http://localhost:3000` (development)

## Scaling

### Free Tier Limits

**Supabase**:

- 500MB database
- 2GB bandwidth/month
- 50k monthly active users
- Unlimited API requests

**Vercel**:

- 100GB bandwidth/month
- 100k serverless function executions
- Unlimited deployments

### Upgrading

When you outgrow free tier:

**Supabase Pro** ($25/month):

- 8GB database
- 250GB bandwidth
- 100k MAU
- Daily backups
- Email support

**Vercel Pro** ($20/month):

- Unlimited bandwidth
- Advanced analytics
- Team collaboration
- Priority support

## Troubleshooting

### "Project paused" error

**Cause**: Supabase projects pause after 7 days of inactivity on free tier
**Solution**: Visit dashboard to unpause, or upgrade to Pro

### "RLS policy violation"

**Cause**: Row Level Security blocking query
**Solution**: Check that user is authenticated and owns the data

### "API key invalid"

**Cause**: Wrong API key or expired
**Solution**: Get new key from dashboard

### Build fails on Vercel

**Cause**: Missing environment variables
**Solution**: Add variables in Vercel dashboard

### Mobile app can't connect

**Cause**: Wrong Supabase URL
**Solution**: Verify `.env` file has correct URL

## Rollback

If deployment fails:

### Rollback Database

```bash
# Reset to previous migration
supabase migration down

# Or reset completely
supabase db reset
```

### Rollback Web App

```bash
# Via CLI
vercel rollback

# Or redeploy previous commit
vercel --prod
```

### Restore from Backup

Supabase Pro includes daily backups:

1. Dashboard > Database > Backups
2. Select backup
3. Click "Restore"

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      - run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Automatic Deployments

Vercel automatically deploys:

- `main` branch → Production
- Pull requests → Preview deployments

## Cost Estimation

### Current Usage (Free Tier)

```
Supabase:
- Database: 100MB / 500MB (20%)
- Bandwidth: 500MB / 2GB (25%)
- API Requests: 10k / unlimited
Total: $0/month

Vercel:
- Bandwidth: 5GB / 100GB (5%)
- Functions: 5k / 100k (5%)
Total: $0/month

TOTAL: $0/month ✅
```

### Projected at Scale

**10,000 monthly users**:

- Supabase: $25/month (Pro)
- Vercel: $20/month (Pro)
- **Total: $45/month**

**100,000 monthly users**:

- Supabase: $599/month (Team)
- Vercel: $20/month (Pro)
- **Total: $619/month**

## Support

- **Supabase**: https://supabase.com/docs
- **Vercel**: https://vercel.com/docs
- **Discord**: https://discord.supabase.com

---

**Deployment completed?** Test with:

```bash
./scripts/supabase/test-connection.sh
```
