#!/bin/bash
# Setup script for Python GraphQL server
# Solves WSL2 Node.js execution issues

set -e

echo "=============================================="
echo "Python GraphQL Server Setup"
echo "=============================================="
echo ""

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "✅ Python version: $PYTHON_VERSION"
echo ""

# Navigate to API directory
cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate
echo "✅ Virtual environment activated"
echo ""

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip --quiet
echo "✅ pip upgraded"
echo ""

# Install dependencies
echo "📦 Installing Python dependencies..."
echo "   - strawberry-graphql (GraphQL framework)"
echo "   - uvicorn (ASGI server)"
echo "   - asyncpg (PostgreSQL async driver)"
pip install strawberry-graphql uvicorn asyncpg --quiet
echo "✅ Dependencies installed"
echo ""

# Verify database connection
echo "🔄 Verifying database connection..."
python3 << 'PYEOF'
import asyncio
import asyncpg

async def test_connection():
    try:
        conn = await asyncpg.connect(
            "postgresql://postgres:postgres@localhost:5435/bom_study_tools_dev"
        )
        count = await conn.fetchval("SELECT COUNT(*) FROM verses")
        print(f"✅ Database connected - {count} verses available")
        await conn.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

result = asyncio.run(test_connection())
exit(0 if result else 1)
PYEOF

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Database connection failed. Make sure PostgreSQL is running:"
    echo "   docker start bom-postgres-dev"
    exit 1
fi

echo ""
echo "=============================================="
echo "✅ Setup Complete!"
echo "=============================================="
echo ""
echo "To start the GraphQL server:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Run server: python3 server-python.py"
echo ""
echo "Or use the shortcut:"
echo "  ./start-python-server.sh"
echo ""
echo "GraphQL Playground will be available at:"
echo "  http://localhost:4000/graphql"
echo ""
