# Supabase Migration Scripts

Automated scripts for migrating BOM Study Tools from Fly.io to Supabase.

## Quick Start

### One-Command Migration

```bash
./scripts/supabase/migrate-all.sh
```

This single command performs the complete migration (30-45 minutes).

### Step-by-Step Migration

If you prefer more control, run scripts individually:

```bash
# 1. Setup
./scripts/supabase/setup-supabase.sh

# 2. Create Supabase project (manual - via dashboard)
# Visit: https://supabase.com/dashboard

# 3. Migrate database schema
./scripts/supabase/migrate-to-supabase.sh

# 4. Import scripture data
./scripts/supabase/import-data-to-supabase.sh

# 5. Deploy web app
./scripts/supabase/deploy-web-vercel.sh

# 6. Update mobile app
./scripts/supabase/update-mobile-config.sh

# 7. Test connection
./scripts/supabase/test-connection.sh
```

## Scripts Overview

### setup-supabase.sh

**Purpose**: Initial setup and prerequisite checks

**What it does**:

- Installs Supabase CLI
- Initializes Supabase project
- Creates migration from Prisma schema
- Sets up environment variable templates

**Usage**:

```bash
./scripts/supabase/setup-supabase.sh
```

**Outputs**:

- `supabase/` directory
- `supabase/migrations/*.sql`
- `.env.supabase.example`

### convert-prisma-to-sql.js

**Purpose**: Convert Prisma schema to SQL migration

**What it does**:

- Reads `services/api/prisma/schema.prisma`
- Generates SQL DDL statements
- Creates indexes and constraints
- Adds Row Level Security policies
- Creates triggers for updated_at columns

**Usage**:

```bash
node scripts/supabase/convert-prisma-to-sql.js
```

**Output**:

- `supabase/migrations/TIMESTAMP_initial_schema.sql`

### migrate-to-supabase.sh

**Purpose**: Push database schema to Supabase

**What it does**:

- Verifies Supabase connection
- Pushes migrations to cloud database
- Creates all tables and indexes
- Enables Row Level Security
- Applies seed data

**Usage**:

```bash
./scripts/supabase/migrate-to-supabase.sh
```

**Prerequisites**:

- Supabase project created
- Project linked: `supabase link --project-ref YOUR_REF`

### import-data-to-supabase.sh

**Purpose**: Import scripture data to Supabase

**What it does**:

- Detects data format (JSON, SQL, CSV)
- Converts to SQL if needed
- Imports verses and scripture metadata
- Verifies record counts

**Usage**:

```bash
./scripts/supabase/import-data-to-supabase.sh
```

**Supported formats**:

- JSON: `scripture-data.json`
- SQL: `scripture-data.sql`
- CSV: `data/scriptures/*.csv`

### deploy-web-vercel.sh

**Purpose**: Deploy web app to Vercel

**What it does**:

- Installs Vercel CLI
- Builds Next.js app
- Deploys to Vercel production
- Sets environment variables

**Usage**:

```bash
./scripts/supabase/deploy-web-vercel.sh
```

**Prerequisites**:

- Vercel account (free)
- `.env.supabase` configured

### update-mobile-config.sh

**Purpose**: Configure mobile app for Supabase

**What it does**:

- Installs @supabase/supabase-js
- Creates Supabase client configuration
- Generates example hooks (useVerses, useAuth)
- Updates environment variables

**Usage**:

```bash
./scripts/supabase/update-mobile-config.sh
```

**Outputs**:

- `apps/mobile/src/lib/supabase.ts`
- `apps/mobile/src/hooks/useVerses.ts`
- `apps/mobile/src/hooks/useAuth.ts`
- `apps/mobile/.env`

### test-connection.sh

**Purpose**: Verify Supabase configuration

**What it does**:

- Tests database connection
- Verifies REST API endpoints
- Queries sample data
- Checks authentication service

**Usage**:

```bash
./scripts/supabase/test-connection.sh
```

### migrate-all.sh

**Purpose**: Complete automated migration

**What it does**:

- Runs all migration steps
- Interactive prompts for credentials
- Creates all configuration files
- Tests endpoints
- Deploys applications

**Usage**:

```bash
./scripts/supabase/migrate-all.sh
```

**Duration**: 30-45 minutes

## Environment Variables

All scripts use these environment variables from `.env.supabase`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_REF=your-project-ref
```

Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

## Troubleshooting

### "Supabase CLI not installed"

```bash
npm install -g supabase
```

### "Not linked to Supabase project"

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### "Migration fails with duplicate table"

```bash
supabase db reset  # Caution: deletes all data
supabase db push
```

### "Permission denied"

```bash
chmod +x scripts/supabase/*.sh
```

### "No scripture data found"

Provide data in one of these formats:

- `scripture-data.json`
- `scripture-data.sql`
- `data/scriptures/*.csv`

## Common Issues

### Issue: RLS policies block queries

**Solution**: Check that `auth.uid()` matches the user ID in your data.

### Issue: Authentication fails

**Solution**: Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct.

### Issue: Import takes too long

**Solution**: Import in batches or use `COPY` command for large datasets.

## Next Steps After Migration

1. **Test thoroughly**:

   ```bash
   ./scripts/supabase/test-connection.sh
   cd apps/web && npm run dev
   cd apps/mobile && npm start
   ```

2. **Update documentation**:
   - Update README.md
   - Update API docs
   - Update deployment guides

3. **Monitor usage**:
   - Visit: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/usage
   - Set up alerts for approaching limits

4. **Configure CI/CD**:
   - Add Supabase migrations to CI
   - Automate deployments

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **Migration Guide**: ../../SUPABASE_MIGRATION_GUIDE.md
- **Supabase Discord**: https://discord.supabase.com
- **Vercel Docs**: https://vercel.com/docs

## Script Maintenance

### Adding New Scripts

1. Create script in `scripts/supabase/`
2. Make executable: `chmod +x script-name.sh`
3. Add to this README
4. Update `migrate-all.sh` if needed

### Testing Scripts

```bash
# Test in dry-run mode
bash -n scripts/supabase/script-name.sh

# Test with verbose output
bash -x scripts/supabase/script-name.sh
```

## Support

For issues with these scripts:

1. Check this README
2. Review SUPABASE_MIGRATION_GUIDE.md
3. Check Supabase docs
4. Open GitHub issue

---

**Last Updated**: 2026-02-24
**Supabase CLI Version**: Latest
**Node.js Version**: 18+
