#!/bin/bash

# n8n Docker Startup Script
# Usage: ./start.sh

set -e

echo "🚀 Starting Car Wash n8n Setup..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your credentials!"
    echo ""
    echo "📝 Edit deployment/.env and set:"
    echo "   - N8N_USER (default: admin)"
    echo "   - N8N_PASSWORD (CHANGE THIS!)"
    echo ""
    read -p "Press Enter after updating .env file to continue..."
fi

# Create backup directory if it doesn't exist
mkdir -p n8n-backups

echo ""
echo "🐳 Starting n8n container..."
docker-compose up -d

echo ""
echo "⏳ Waiting for n8n to be ready..."
sleep 5

# Check if container is running
if docker ps | grep -q car-wash-n8n; then
    echo ""
    echo "✅ n8n is running!"
    echo ""
    echo "📍 Access n8n at: http://localhost:5678"
    echo ""
    echo "🔐 Login credentials:"
    echo "   Username: $(grep N8N_USER .env | cut -d '=' -f2)"
    echo "   Password: (check your .env file)"
    echo ""
    echo "📊 Useful commands:"
    echo "   View logs:    docker-compose logs -f n8n"
    echo "   Stop n8n:     docker-compose down"
    echo "   Restart:      docker-compose restart"
    echo "   Backup data:  ./backup.sh"
    echo ""
else
    echo "❌ Failed to start n8n. Check logs with: docker-compose logs"
    exit 1
fi
