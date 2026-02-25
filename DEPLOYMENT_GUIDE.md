# BOM Study Tools - Deployment Guide

Complete step-by-step guide to deploy your app to production.

## Prerequisites

✅ Supabase project created (`pxcnvcagyvoafytwvngr`)
✅ Database schema migrated
⏳ Scripture data imported (run `complete-import.sql` first)
✅ Vercel CLI installed (`vercel --version`)

## Step 1: Import Scripture Data (2 minutes)

If not done already:

1. Open Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/pxcnvcagyvoafytwvngr/sql/new
   ```

2. Copy entire `complete-import.sql` file (3.34 MB)

3. Paste into SQL Editor and click **RUN**

4. Verify import:
   ```bash
   curl "https://pxcnvcagyvoafytwvngr.supabase.co/rest/v1/verses?select=id&limit=0" \
     -H "apikey: $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.supabase | cut -d= -f2)" \
     -H "Prefer: count=exact"
   ```

   Expected: `content-range: 0-0/11640` (or similar)

## Step 2: Test Locally (5 minutes)

```bash
cd apps/web

# Install dependencies (if needed)
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000 and verify:
- [ ] Home page loads
- [ ] Can browse scripture books
- [ ] Can read verses
- [ ] Can create highlights/notes
- [ ] Achievements display correctly
- [ ] Word study works
- [ ] Quiz system loads

## Step 3: Deploy to Vercel (5 minutes)

### Configure Environment

Ensure `apps/web/.env.local` has:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://pxcnvcagyvoafytwvngr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Deploy

```bash
cd apps/web

# Deploy to production
vercel --prod

# Or deploy to preview first
vercel
```

### Set Environment Variables in Vercel

After first deployment, add environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://pxcnvcagyvoafytwvngr.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: your anon key from .env.supabase
```

Or via Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add both variables for Production, Preview, and Development

### Redeploy with Environment Variables

```bash
vercel --prod
```

## Step 4: Verify Production (5 minutes)

Once deployed, Vercel will give you a URL like:
```
https://bom-study-tools.vercel.app
```

Test production site:
- [ ] Home page loads without errors
- [ ] Scripture content displays
- [ ] Can read verses from database
- [ ] User features work (highlights, notes, bookmarks)
- [ ] Achievements track progress
- [ ] Word study modal works
- [ ] Courses and quizzes load
- [ ] Mobile responsive design works

## Step 5: Configure Custom Domain (Optional)

1. **Add domain in Vercel:**
   ```bash
   vercel domains add yourdomain.com
   ```

2. **Update DNS records:**
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`

   And/or:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

3. **Wait for DNS propagation** (5-30 minutes)

4. **Enable HTTPS** (automatic via Vercel)

## Post-Deployment Checklist

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.0s

### Functionality
- [ ] All 25 achievements functional
- [ ] Word study search works
- [ ] Course quizzes save progress
- [ ] Memorization spaced repetition works
- [ ] Reading streaks track correctly
- [ ] Cross-references display
- [ ] Daily verses load

### Mobile
- [ ] Responsive layout on mobile
- [ ] Touch interactions work
- [ ] Navigation menu accessible
- [ ] Text readable without zoom

### Analytics (Optional)
- [ ] Add Vercel Analytics
- [ ] Add Google Analytics
- [ ] Add Sentry error tracking

## Troubleshooting

### "Failed to fetch" errors
- Check environment variables are set correctly
- Verify Supabase URL doesn't have trailing slash
- Confirm anon key is correct

### "No verses found"
- Verify scripture data imported (Step 1)
- Check database has 11,640+ verses
- Test API endpoint directly

### Build fails
- Check for TypeScript errors: `npm run type-check`
- Verify dependencies installed: `npm install`
- Review build logs in Vercel dashboard

### Slow page loads
- Enable Vercel Edge Functions
- Add caching headers
- Optimize images with Next.js Image component

## Rollback

If deployment has issues:

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Project Issues**: https://github.com/ElliottSax/bom/issues

## Success! 🎉

Once deployed, share your app:
- Post to social media
- Share in Community of Christ groups
- Gather user feedback
- Monitor analytics
- Plan future features

---

**Deployment Time:** ~15 minutes total
**Cost:** $0/month (free tiers)
**Scalability:** Handles 1000+ daily users on free tier
