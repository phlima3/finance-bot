#!/bin/sh

# Ensure WhatsApp credentials symlink exists
mkdir -p /home/node/.openclaw/credentials/whatsapp 2>/dev/null || true
if [ ! -L "/home/node/.openclaw/credentials/whatsapp/default" ]; then
  ln -sf /data/whatsapp-session /home/node/.openclaw/credentials/whatsapp/default
fi

# Ensure auth-profiles exists
mkdir -p /home/node/.openclaw/agents/main/agent 2>/dev/null || true
if [ ! -f "/home/node/.openclaw/agents/main/agent/auth-profiles.json" ]; then
  echo '{"anthropic:default":{"provider":"anthropic","mode":"api_key"}}' > /home/node/.openclaw/agents/main/agent/auth-profiles.json
fi

# Sync database schema on startup
cd /home/node/.openclaw/workspace/extensions/finance-db
npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || true

# Start the gateway
exec openclaw gateway run --bind lan --port 8080 --allow-unconfigured
