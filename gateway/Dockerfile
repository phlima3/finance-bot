FROM ghcr.io/openclaw/openclaw:latest

# Install plugin dependencies
WORKDIR /home/node/.openclaw/workspace/extensions/finance-db
COPY extensions/finance-db/package.json extensions/finance-db/package-lock.json* ./
RUN npm ci --omit=dev

# Copy plugin source + prisma schema
COPY extensions/finance-db/ ./
RUN npx prisma generate

# Copy skill
COPY skills/finance/ /home/node/.openclaw/workspace/skills/finance/

# Copy production config
COPY openclaw.production.json /home/node/.openclaw/openclaw.json

# Seed WhatsApp session (copied to volume on first boot via start.sh)
COPY credentials/whatsapp/ /home/node/.openclaw/credentials-seed/whatsapp/

# Startup script
COPY --chmod=755 start.sh /home/node/start.sh

WORKDIR /home/node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["/home/node/start.sh"]
