#!/bin/bash

# n8n Backup Script
# Creates a timestamped backup of n8n data

set -e

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="n8n-backups"
BACKUP_NAME="n8n_backup_${TIMESTAMP}.tar.gz"

echo "📦 Creating n8n backup..."

# Check if container is running
if ! docker ps | grep -q car-wash-n8n; then
    echo "⚠️  n8n container is not running. Starting it first..."
    docker-compose up -d
    sleep 3
fi

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Export workflows from n8n
echo "Exporting workflows..."
docker exec car-wash-n8n n8n export:workflow --all --output=/backups/workflows_${TIMESTAMP}.json 2>/dev/null || true

# Export credentials (encrypted)
echo "Exporting credentials..."
docker exec car-wash-n8n n8n export:credentials --all --output=/backups/credentials_${TIMESTAMP}.json 2>/dev/null || true

# Backup the entire n8n data volume
echo "Backing up n8n data volume..."
docker run --rm \
    -v car-wash-ai-agent-mvp_n8n_data:/data \
    -v "$(pwd)/${BACKUP_DIR}":/backup \
    alpine tar czf /backup/${BACKUP_NAME} /data

echo ""
echo "✅ Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}"
echo ""
echo "💡 To restore:"
echo "   1. Stop n8n: docker-compose down"
echo "   2. Extract backup: tar xzf ${BACKUP_DIR}/${BACKUP_NAME}"
echo "   3. Start n8n: docker-compose up -d"
echo ""

# Keep only last 5 backups
cd ${BACKUP_DIR}
ls -t n8n_backup_*.tar.gz | tail -n +6 | xargs rm -f 2>/dev/null || true
echo "🧹 Cleaned up old backups (keeping last 5)"
