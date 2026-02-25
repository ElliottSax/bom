# Sentry Error Tracking Setup

Sentry is integrated for production error monitoring and tracking.

## Quick Setup

### 1. Install Dependencies

```bash
cd apps/web
npm install
```

The `@sentry/nextjs` package is already added to package.json.

### 2. Get Sentry DSN

1. Sign up at [sentry.io](https://sentry.io) (free tier available)
2. Create a new Next.js project
3. Copy your DSN (looks like: `https://xxxxx@sentry.io/xxxxx`)

### 3. Configure Environment Variables

Add to `.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id

# Optional: For source map uploads
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

### 4. Test Error Tracking

In development, errors are logged but not sent to Sentry (see `beforeSend` filter).

To test in production mode:

```bash
npm run build
npm start
```

Then trigger an error to verify Sentry captures it.

## Features Enabled

- ✅ **Client-side error tracking** - React errors, JS errors
- ✅ **Server-side error tracking** - API route errors, SSR errors
- ✅ **Edge runtime support** - Middleware and edge function errors
- ✅ **Session Replay** - Visual reproduction of user sessions (10% sampling)
- ✅ **Performance monitoring** - Track component render times
- ✅ **Error context** - Component stack, performance metrics
- ✅ **Source maps** - Readable stack traces in production
- ✅ **Development filter** - Errors not sent in dev mode

## Configuration Files

| File                      | Purpose                             |
| ------------------------- | ----------------------------------- |
| `sentry.client.config.ts` | Client-side (browser) configuration |
| `sentry.server.config.ts` | Server-side (Node.js) configuration |
| `sentry.edge.config.ts`   | Edge runtime configuration          |
| `next.config.js`          | Webpack plugin integration          |

## How It Works

### Error Boundary Integration

The `PerformanceErrorBoundary` component automatically sends errors to Sentry in production:

```tsx
import { PerformanceErrorBoundary } from './components/PerformanceErrorBoundary';

<PerformanceErrorBoundary componentName="MyComponent">
  <MyComponent />
</PerformanceErrorBoundary>;
```

### Manual Error Reporting

You can also manually report errors:

```tsx
import * as Sentry from '@sentry/nextjs';

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'data-import',
    },
    extra: {
      userId: user.id,
    },
  });
}
```

## Privacy & Performance

### What Gets Sent

- Error messages and stack traces
- User agent, OS, browser info
- URL where error occurred
- Component names and React stack
- Performance timing data

### What's Protected

- All text in session replays is masked (`maskAllText: true`)
- All media in replays is blocked (`blockAllMedia: true`)
- Errors filtered out in development
- 10% session sampling (90% of sessions not recorded)
- 100% error sampling (all errors captured)

## Monitoring & Alerts

Once configured, you can:

1. **View errors** - See all production errors in Sentry dashboard
2. **Set up alerts** - Email/Slack notifications for critical errors
3. **Track releases** - See which errors came from which deployment
4. **View session replays** - Watch what user did before error
5. **Performance insights** - Find slow components and routes

## Disable Sentry

To disable Sentry (not recommended for production):

1. Remove or comment out `NEXT_PUBLIC_SENTRY_DSN` from environment variables
2. Errors will only be logged to console

## Cost

- **Free tier**: 5,000 errors/month + 50 replay sessions/month
- **Paid tiers**: Start at $26/month for more events
- **Current usage**: Replays at 10% = ~100-500 replays/month (within free tier)

## Troubleshooting

### Errors not appearing in Sentry

1. Check `NEXT_PUBLIC_SENTRY_DSN` is set
2. Verify you're in production mode (`NODE_ENV=production`)
3. Check browser console for Sentry initialization logs (set `debug: true`)
4. Verify DSN is correct in Sentry project settings

### Build errors

If you get build errors about Sentry:

1. Ensure `npm install` has been run
2. Check `@sentry/nextjs` is in package.json dependencies
3. Temporarily disable source map upload by removing `SENTRY_AUTH_TOKEN`

### Too many events

Adjust sampling rates in config files:

```ts
// Reduce session replay sampling
replaysSessionSampleRate: 0.01,  // 1% instead of 10%

// Reduce performance traces
tracesSampleRate: 0.1,  // 10% instead of 100%
```

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Monitoring Best Practices](https://docs.sentry.io/product/best-practices/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
