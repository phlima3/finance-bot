#!/bin/sh
set -e

# Sync database schema on startup
cd /home/node/.openclaw/workspace/extensions/finance-db
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || true

# Start the gateway
exec openclaw gateway run --bind 0.0.0.0 --port 8080 --allow-unconfigured
