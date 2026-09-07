# Web Application

Next.js 14 web application for Book of Mormon study tools.

## Features

- Scripture reading with highlighting and notes
- Cross-references and daily verses
- Reading goals and progress tracking
- Course management
- Responsive design for desktop and mobile web

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Data Fetching**: TanStack Query (React Query)
- **GraphQL**: Apollo Client
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Running API server (see `services/api`)

### Installation

```bash
# From project root
npm install

# Or from this directory
cd apps/web
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql
```

### Development

```bash
# From project root
make web-dev

# Or from this directory
npm run dev
```

Visit http://localhost:3000

### Build

```bash
# Production build
npm run build

# Start production server
npm start
```

## Project Structure

```
apps/web/
├── app/                    # Next.js 14 App Router
│   ├── (authenticated)/   # Protected routes
│   ├── (public)/          # Public routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── modals/           # Modal components
│   ├── reader/           # Scripture reader
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities
│   ├── apollo.ts        # Apollo Client setup
│   └── utils.ts         # Utility functions
├── styles/              # Global styles
└── public/              # Static assets
```

## Key Components

### Scripture Reader

Located in `components/reader/`, handles:

- Verse display and navigation
- Highlighting and note-taking
- Cross-reference display
- Responsive text sizing

### Modals

Located in `components/modals/`:

- `WelcomeOnboardingModal.tsx` - First-time user onboarding
- `FeedbackModal.tsx` - User feedback collection
- `NoteModal.tsx` - Note creation/editing
- `HighlightModal.tsx` - Highlight color selection

### Hooks

Custom hooks in `hooks/`:

- `useWordStudy` - Word study functionality
- `useReadingGoals` - Reading goal management
- `useMemorization` - Spaced repetition memorization
- `useDailyVerse` - Daily verse rotation
- `useCrossReferences` - Cross-reference lookups

## Styling

Uses Tailwind CSS with custom configuration:

```js
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      }
    }
  }
}
```

## Data Fetching

### GraphQL Queries

Example query:

```typescript
import { gql, useQuery } from '@apollo/client';

const GET_CHAPTER = gql`
  query GetChapter($editionId: String!, $book: String!, $chapter: Int!) {
    chapter(editionId: $editionId, book: $book, chapter: $chapter) {
      verses {
        id
        verse
        text
      }
    }
  }
`;

function ChapterView() {
  const { data, loading } = useQuery(GET_CHAPTER, {
    variables: { editionId: 'coc-bom-1908', book: 'I Nephi', chapter: 1 },
  });

  // ...
}
```

### Server Components

Use server components for static content:

```typescript
// app/scriptures/[book]/[chapter]/page.tsx
export default async function ChapterPage({ params }) {
  // Fetch data on server
  const chapter = await getChapter(params.book, params.chapter);

  return <ChapterView chapter={chapter} />;
}
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ChapterView', () => {
  it('renders verses', () => {
    render(<ChapterView chapter={mockChapter} />);
    expect(screen.getByText('I Nephi 1:1')).toBeInTheDocument();
  });

  it('handles highlight clicks', async () => {
    const user = userEvent.setup();
    render(<ChapterView chapter={mockChapter} />);
    await user.click(screen.getByText('Highlight'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

## Deployment

### Vercel (Recommended)

```bash
# From project root
./deploy-web-to-vercel.sh
```

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Set in Vercel dashboard:

- `NEXT_PUBLIC_API_URL` - Production API URL
- `NEXT_PUBLIC_WS_URL` - Production WebSocket URL

### Build Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## Performance Optimization

### Code Splitting

Next.js automatically code-splits by route. For large components:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

### Image Optimization

Use Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/scripture-icon.png"
  width={500}
  height={300}
  alt="Scripture"
/>
```

### Caching

Apollo Client caching:

```typescript
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          chapter: {
            keyArgs: ['editionId', 'book', 'chapter'],
            merge: true,
          },
        },
      },
    },
  }),
});
```

## Accessibility

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader tested
- Color contrast WCAG AA compliant

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Build Errors

**Error**: `Module not found`

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
```

**Error**: `API not responding`

```bash
# Check API is running
curl http://localhost:4000/health
# Start API if needed
cd ../../services/api && npm run dev
```

### Development Issues

**Hot reload not working**

```bash
# Check file watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**TypeScript errors**

```bash
# Regenerate types
npm run type-check
```

## Contributing

1. Follow the component structure in `components/`
2. Add tests for new features
3. Update Storybook stories if applicable
4. Run `npm run lint` and `npm run format` before committing

## Related Documentation

- [Main README](../../README.md)
- [API Documentation](../../services/api/README.md)
- [Architecture Overview](../../ARCHITECTURE.md)
