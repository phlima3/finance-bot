#!/bin/sh

# Seed WhatsApp session into volume if empty
if [ ! -d "/home/node/.openclaw/credentials/whatsapp/default" ] && [ -d "/home/node/.openclaw/credentials-seed/whatsapp/default" ]; then
  echo "Seeding WhatsApp session from image into volume..."
  mkdir -p /home/node/.openclaw/credentials/whatsapp 2>/dev/null || true
  cp -r /home/node/.openclaw/credentials-seed/whatsapp/* /home/node/.openclaw/credentials/whatsapp/ 2>/dev/null || true
fi

# Sync database schema on startup
cd /home/node/.openclaw/workspace/extensions/finance-db
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || true

# Start the gateway
exec openclaw gateway run --bind lan --port 8080 --allow-unconfigured
