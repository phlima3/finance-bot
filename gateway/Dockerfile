FROM ghcr.io/openclaw/openclaw:latest

USER root

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

# Create volume mount point with correct ownership
RUN mkdir -p /data/whatsapp-session && chown -R node:node /data/whatsapp-session

# Fix ownership of all openclaw files
RUN chown -R node:node /home/node/.openclaw

# Startup script
COPY --chmod=755 start.sh /home/node/start.sh

USER node
WORKDIR /home/node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["/home/node/start.sh"]
