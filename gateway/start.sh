#!/bin/sh

# Seed WhatsApp session into volume if empty
if [ ! -f "/data/whatsapp-session/creds.json" ] && [ -d "/home/node/.openclaw/credentials-seed/whatsapp/default" ]; then
  echo "Seeding WhatsApp session from image into volume..."
  cp -r /home/node/.openclaw/credentials-seed/whatsapp/default/* /data/whatsapp-session/ 2>/dev/null || true
fi

# Symlink volume to where OpenClaw expects credentials
mkdir -p /home/node/.openclaw/credentials/whatsapp 2>/dev/null || true
rm -rf /home/node/.openclaw/credentials/whatsapp/default 2>/dev/null || true
ln -sf /data/whatsapp-session /home/node/.openclaw/credentials/whatsapp/default

# Sync database schema on startup
cd /home/node/.openclaw/workspace/extensions/finance-db
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || true

# Start the gateway
exec openclaw gateway run --bind lan --port 8080 --allow-unconfigured
