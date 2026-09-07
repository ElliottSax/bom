#!/bin/bash
# Update Mobile App Configuration for Supabase
# Updates React Native app to use Supabase client

set -e  # Exit on error

echo "=========================================="
echo "BOM Study Tools - Mobile App Update"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Change to project root
cd "$(dirname "$0")/../.."

echo "Step 1: Checking environment variables..."
echo ""

if [ ! -f ".env.supabase" ]; then
    echo -e "${RED}❌ .env.supabase not found${NC}"
    echo "Run: ./scripts/supabase/setup-supabase.sh"
    exit 1
fi

# Load Supabase env vars
export $(cat .env.supabase | xargs)

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables loaded${NC}"

echo ""
echo "Step 2: Installing Supabase client..."
echo ""

cd apps/mobile

# Install Supabase client
echo "Installing @supabase/supabase-js..."
npm install @supabase/supabase-js

echo -e "${GREEN}✓ Supabase client installed${NC}"

echo ""
echo "Step 3: Creating Supabase client configuration..."
echo ""

# Create lib directory if it doesn't exist
mkdir -p src/lib

# Create Supabase client
cat > src/lib/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
EOF

echo -e "${GREEN}✓ Created src/lib/supabase.ts${NC}"

echo ""
echo "Step 4: Creating environment configuration..."
echo ""

# Create .env file for mobile
cat > .env << EOF
SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
EOF

echo -e "${GREEN}✓ Created .env${NC}"

echo ""
echo "Step 5: Creating example API hooks..."
echo ""

# Create hooks directory
mkdir -p src/hooks

# Create example hooks
cat > src/hooks/useVerses.ts << 'EOF'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Verse {
  id: string
  book: string
  chapter: number
  verse: number
  text: string
}

export function useVerses(book: string, chapter: number) {
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchVerses() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('verses')
          .select('*')
          .eq('book', book)
          .eq('chapter', chapter)
          .order('verse', { ascending: true })

        if (error) throw error
        setVerses(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchVerses()
  }, [book, chapter])

  return { verses, loading, error }
}
EOF

cat > src/hooks/useAuth.ts << 'EOF'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }
}
EOF

echo -e "${GREEN}✓ Created example hooks${NC}"
echo "  - src/hooks/useVerses.ts"
echo "  - src/hooks/useAuth.ts"

echo ""
echo "=========================================="
echo "Mobile App Update Complete! ✅"
echo "=========================================="
echo ""
echo "Changes made:"
echo "✓ Installed @supabase/supabase-js"
echo "✓ Created src/lib/supabase.ts (Supabase client)"
echo "✓ Created .env with Supabase credentials"
echo "✓ Created example hooks (useVerses, useAuth)"
echo ""
echo "Next steps:"
echo ""
echo "1. Update your components to use Supabase hooks:"
echo ""
echo "   import { useVerses } from './hooks/useVerses'"
echo "   import { useAuth } from './hooks/useAuth'"
echo ""
echo "2. Example usage:"
echo ""
echo "   const { verses, loading } = useVerses('1 Nephi', 1)"
echo "   const { user, signIn, signOut } = useAuth()"
echo ""
echo "3. Test the mobile app:"
echo "   npm start"
echo ""
echo "4. Update remaining components:"
echo "   - Replace Apollo Client queries with Supabase"
echo "   - Replace custom auth with useAuth hook"
echo "   - Update offline sync strategy"
echo ""
echo "Documentation:"
echo "- Supabase React Native docs:"
echo "  https://supabase.com/docs/guides/getting-started/quickstarts/react-native"
echo ""
