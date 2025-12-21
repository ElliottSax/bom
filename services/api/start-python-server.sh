#!/bin/bash
# Quick start script for Python GraphQL server

set -e

cd "$(dirname "$0")"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Running setup..."
    echo ""
    ./setup-python-server.sh
    echo ""
fi

# Activate venv
source venv/bin/activate

# Start server
echo "🚀 Starting Python GraphQL Server..."
echo ""
python3 server-python.py
