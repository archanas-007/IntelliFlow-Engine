#!/bin/bash

# AI Workflow Automation - Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up AI Workflow Automation Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env backend/.env.local 2>/dev/null || true
fi

# Create frontend .env if it doesn't exist
if [ ! -f frontend/.env.local ]; then
    echo "📝 Frontend .env.local already exists"
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Initialize database
echo "🗄️  Initializing database..."
docker-compose exec backend python -c "
import asyncio
from app.core.database import init_db
asyncio.run(init_db())
print('Database initialized!')
" || echo "⚠️  Database initialization will happen on first run"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Services:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "📝 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Create an account"
echo "   3. Start building workflows!"
echo ""
echo "🛑 To stop services: docker-compose down"
echo "📋 To view logs: docker-compose logs -f"
