#!/bin/sh

# Fix Railway volume permissions (mounted as root:root)
chown -R node:node /data/whatsapp-session 2>/dev/null || true

# Ensure WhatsApp credentials symlink exists
su -s /bin/sh node -c '
  mkdir -p /home/node/.openclaw/credentials/whatsapp 2>/dev/null || true
  if [ ! -L "/home/node/.openclaw/credentials/whatsapp/default" ]; then
    ln -sf /data/whatsapp-session /home/node/.openclaw/credentials/whatsapp/default
  fi

  mkdir -p /home/node/.openclaw/agents/main/agent 2>/dev/null || true
  if [ ! -f "/home/node/.openclaw/agents/main/agent/auth-profiles.json" ]; then
    echo '"'"'{"anthropic:default":{"provider":"anthropic","mode":"api_key"}}'"'"' > /home/node/.openclaw/agents/main/agent/auth-profiles.json
  fi

  cd /home/node/.openclaw/workspace/extensions/finance-db
  npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || true
'

exec su -s /bin/sh node -c 'exec openclaw gateway run --bind lan --port 8080 --allow-unconfigured'
