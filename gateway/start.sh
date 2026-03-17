#!/bin/sh
set -e

# Sync database schema on startup
cd /home/node/.openclaw/workspace/extensions/finance-db
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || true

# Start the gateway
cd /home/node
exec node dist/index.js gateway --bind 0.0.0.0 --port 8080 --allow-unconfigured
