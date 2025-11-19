# Book of Mormon Study Tools - Web Application

Next.js 14 web application with React Server Components.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
apps/web/
├── src/
│   ├── app/             # Next.js 14 App Router
│   ├── components/      # React components
│   ├── lib/             # Utilities, API clients
│   ├── hooks/           # Custom hooks
│   └── types/           # TypeScript types
├── public/              # Static assets
├── next.config.js       # Next.js configuration
└── package.json
```

## Features

- Server-side rendering with React Server Components
- GraphQL API integration
- Responsive design with Tailwind CSS
- Progressive Web App (PWA) support
- Accessibility (WCAG 2.1 AAA)

## Building for Production

```bash
npm run build
npm run start
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.gospellibrary.org/graphql
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Related Documentation

- [Technical Implementation Guide](../../LDS_STUDY_TOOLS_TECHNICAL_IMPLEMENTATION.md)
- [API Specification](../../API_SPECIFICATION.md)
