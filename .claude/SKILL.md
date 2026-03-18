---
name: finance-bot
description: Dashboard financeira pessoal integrada com WhatsApp e OpenClaw. Dois servicos: Gateway (bot WhatsApp + AI agent + plugin finance-db) e Dashboard (Next.js 14 com tema dark luxuoso). Deploy no Railway com PostgreSQL compartilhado.
---

# Finance Bot — Project Skill

## Quick Reference

| Key | Value |
|-----|-------|
| **Owner** | Ph (timezone America/Sao_Paulo) |
| **Repo** | github.com/phlima3/finance-bot |
| **Deploy** | Railway (auto-deploy on push to main) |
| **Dashboard URL** | https://dashboard-production-b855.up.railway.app |
| **Gateway URL** | https://gateway-production-1080.up.railway.app |
| **Railway Project** | `d8230117-7e92-45f0-b8f5-08087e8a2588` |
| **Gateway Service** | `af54054a-a2c2-4b60-b4aa-2bd233451927` |
| **Environment** | `456ad498-7a3f-43c1-9eca-de6fb128e223` |
| **WhatsApp Phone** | +5515998601308 |

---

## Architecture Overview

```
┌─────────────────── RAILWAY ───────────────────────┐
│                                                     │
│  Gateway          Dashboard         PostgreSQL      │
│  (OpenClaw)       (Next.js 14)      (shared DB)     │
│  port 8080        port 3000                         │
│  Volume:          Standalone        Transaction     │
│  /data/whatsapp-  output            table           │
│  session                                            │
│       │                                             │
└───────┼─────────────────────────────────────────────┘
        │ WebSocket (Baileys)
        ▼
   WhatsApp (+5515998601308)
```

Two independent services sharing ONE PostgreSQL database. Gateway handles WhatsApp AI agent. Dashboard handles web UI. Both use Prisma ORM with IDENTICAL schemas.

---

## Project Structure

```
finance-bot/
├── gateway/                          # OpenClaw WhatsApp AI agent
│   ├── Dockerfile                    # FROM ghcr.io/openclaw/openclaw:latest
│   ├── start.sh                      # Runs as root → chown volume → drop to node
│   ├── openclaw.production.json      # Agent config, channels, plugins, bindings
│   ├── skills/finance/SKILL.md       # Agent prompt (PT-BR, categories, flow)
│   └── extensions/finance-db/        # OpenClaw plugin (4 tools)
│       ├── package.json              # @prisma/client, @sinclair/typebox, zod
│       ├── prisma/schema.prisma      # Transaction model (SOURCE OF TRUTH)
│       └── src/
│           ├── index.ts              # Registers 4 tools via api.registerTool()
│           ├── db/client.ts          # Prisma singleton
│           ├── schemas/
│           │   ├── transaction.ts    # Zod: SaveTransactionSchema, CATEGORIES
│           │   └── query.ts          # Zod: QuerySchema
│           └── tools/
│               ├── save-transaction.ts    # finance_save_transaction
│               ├── check-alerts.ts        # finance_check_alerts
│               ├── query.ts               # finance_query
│               └── transcribe-audio.ts    # finance_transcribe_audio
│
├── dashboard/                        # Next.js 14 web dashboard
│   ├── Dockerfile                    # Standalone output
│   ├── prisma/schema.prisma          # MUST MATCH gateway schema exactly
│   └── src/
│       ├── app/
│       │   ├── layout.tsx            # Outfit + JetBrains Mono fonts, dark body
│       │   ├── globals.css           # CSS custom properties, animations, scrollbar
│       │   ├── page.tsx              # Dashboard: cards + chart + table (server)
│       │   ├── error.tsx             # Error boundary
│       │   ├── transactions/
│       │   │   ├── page.tsx          # Suspense wrapper (server)
│       │   │   └── transactions-content.tsx  # CRUD client component
│       │   └── api/
│       │       ├── transactions/
│       │       │   ├── route.ts      # GET (filters/pagination) + POST
│       │       │   └── [id]/route.ts # GET + PATCH + DELETE
│       │       └── export/
│       │           ├── csv/route.ts  # CSV download
│       │           └── pdf/route.ts  # Print-friendly HTML
│       ├── components/
│       │   ├── navbar.tsx            # Client: nav with active state
│       │   ├── monthly-totals.tsx    # Server: 3 summary cards
│       │   ├── category-chart.tsx    # Client: Recharts donut chart
│       │   ├── transaction-list.tsx  # Server: recent transactions table
│       │   ├── transactions-table.tsx # Client: CRUD table
│       │   ├── transaction-form.tsx  # Client: create/edit modal
│       │   ├── confirm-dialog.tsx    # Client: delete confirmation
│       │   ├── pagination.tsx        # Client: page navigation
│       │   └── filters.tsx           # Client: date/category/type filters
│       └── lib/
│           ├── db.ts                 # Prisma singleton
│           ├── schemas.ts            # Zod: Create/Update/Filter schemas
│           └── formatters.ts         # formatCurrency, formatDate, formatCategory
│
├── docker-compose.yml                # Local dev (postgres only)
├── ARCHITECTURE.md                   # Flow diagrams
└── .env.example                      # Required env vars
```

---

## Code Patterns (MUST FOLLOW)

### Gateway — OpenClaw Plugin Tools

Every tool follows this EXACT structure:

```typescript
import { Type } from '@sinclair/typebox'

export const myTool = {
  name: 'finance_tool_name',           // Always prefix with finance_
  description: 'Description in Portuguese',
  parameters: Type.Object({
    param1: Type.String({ description: 'Param description' }),
    param2: Type.Optional(Type.Number({ description: 'Optional param' })),
  }),
  async execute(_id: string, params: Record<string, unknown>) {
    // _id is conversation ID (usually ignored)
    // params are raw — cast with `as` or validate with Zod

    // ALWAYS return this shape:
    return {
      content: [{ type: 'text' as const, text: 'Result message' }],
    }
  },
}
```

Registration in `index.ts`:
```typescript
import { myTool } from './tools/my-tool.js'  // .js extension required (ESM)
export default function (api: PluginApi) {
  api.registerTool(myTool)
}
```

**Key patterns:**
- TypeBox for parameter schemas (OpenClaw requirement)
- Zod for runtime validation inside execute()
- Dual validation: TypeBox defines shape for LLM, Zod validates at runtime
- Return format: `{ content: [{ type: 'text', text: string }] }` — NEVER deviate
- Error handling: return error as text content, NEVER throw
- ESM: `"type": "module"` in package.json, use `.js` extension in imports

### Dashboard — Components

```typescript
// Server components (default): NO 'use client'
interface MyComponentProps {
  readonly data: ReadonlyArray<Transaction>  // Immutable props
}

export function MyComponent({ data }: MyComponentProps) {
  // Direct Prisma queries OK in server components
  // Named exports, PascalCase
}

// Client components: 'use client' at top
'use client'
export function InteractiveComponent({ ... }) {
  // useState, useEffect, event handlers
  // Fetch from /api routes, NOT direct Prisma
}
```

**Key patterns:**
- Named exports (NOT default)
- `interface XProps { readonly ... }` for props
- `ReadonlyArray<T>` for array props (immutability)
- Server components for data display, client for interactivity
- Formatters always from `@/lib/formatters`
- Tailwind utility classes — NO inline styles, NO CSS modules

### Dashboard — API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // ... Prisma query
    return NextResponse.json({ data, meta })
  } catch (error) {
    console.error('Description:', error)
    return NextResponse.json({ error: 'Message' }, { status: 500 })
  }
}
```

**Response format:**
- List: `{ data: T[], meta: { total, page, limit, totalPages } }`
- Single: `T` (the object directly)
- Error: `{ error: string, details?: ZodIssue[] }`
- Create: status 201
- Delete: status 204 (empty body)

---

## Database Schema

```prisma
model Transaction {
  id          String          @id @default(uuid())
  amount      Float
  type        TransactionType // EXPENSE | INCOME
  category    String          // 12 categories (see below)
  description String
  date        DateTime
  phone       String          // "5515998601308" (no +)
  rawMessage  String?         // Original WhatsApp message or transcribed audio
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  @@index([phone, category, date])
  @@index([date])
  @@index([type])
}
```

**12 Categories:**
`alimentacao`, `transporte`, `moradia`, `lazer`, `saude`, `educacao`, `vestuario`, `servicos`, `salario`, `freelance`, `investimento`, `outros`

**CRITICAL:** TWO identical prisma schemas exist:
- `gateway/extensions/finance-db/prisma/schema.prisma` (SOURCE OF TRUTH)
- `dashboard/prisma/schema.prisma` (MUST MATCH)

Gateway runs `prisma db push` on startup. Dashboard only reads. Any schema change MUST update BOTH files.

---

## Design System (Dashboard)

### CSS Custom Properties (globals.css)

```css
/* Backgrounds */
--bg-primary: #0a0a0f       --bg-secondary: #0f0f17
--bg-card: #12121a          --bg-card-hover: #1a1a2e

/* Gold accent */
--accent-gold: #d4af37      --accent-gold-dim: #b8962e
--accent-gold-glow: rgba(212, 175, 55, 0.15)

/* Text */
--text-primary: #e8e6e3     --text-secondary: #8a8a8a     --text-muted: #4a4a4a

/* Semantic */
--color-income: #22c55e     --color-expense: #ef4444

/* Borders */
--border-subtle: rgba(255,255,255,0.06)    --border-gold: rgba(212,175,55,0.2)
```

### Tailwind Utilities
```
bg-bg-primary  bg-bg-card  bg-bg-card-hover  bg-bg-secondary
text-accent-gold  text-text-primary  text-text-secondary  text-text-muted
text-income  text-expense
border-border-subtle  border-border-gold
font-sans (Outfit)  font-mono (JetBrains Mono)
```

### Typography
- **Outfit** — display/heading font (premium geometric sans-serif)
- **JetBrains Mono** — ALL financial values (R$), data tables, numbers
- NEVER use Inter, Arial, Roboto, Space Grotesk

### Animations (CSS-only, NO Framer Motion)
- `fadeInUp` — cards on page load with stagger delays
- `shimmer` — loading skeletons
- `.animate-fade-in-up-1` through `.animate-fade-in-up-5` for stagger
- `.card-dark` — base card class with hover glow
- `.transition-theme` — smooth color transitions

### Chart Colors (Recharts donut, neon palette on dark)
```typescript
['#d4af37', '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899',
 '#f59e0b', '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#e11d48']
```

---

## Environment Variables

| Service | Variable | Required | Description |
|---------|----------|----------|-------------|
| Gateway | `ANTHROPIC_API_KEY` | Yes | Claude Haiku 4.5 for the AI agent |
| Gateway | `DATABASE_URL` | Yes | PostgreSQL (Railway internal) |
| Gateway | `GROQ_API_KEY` | Yes | Groq Whisper for audio transcription |
| Dashboard | `DATABASE_URL` | Yes | PostgreSQL (same DB as gateway) |

**Railway CLI to set:**
```bash
railway link -p d8230117-7e92-45f0-b8f5-08087e8a2588 -e 456ad498-7a3f-43c1-9eca-de6fb128e223 -s af54054a-a2c2-4b60-b4aa-2bd233451927
railway variables --set "KEY=value"
railway redeploy --yes
```

---

## OpenClaw Configuration (openclaw.production.json)

```
Agent: anthropic/claude-haiku-4-5
Binding: agent "anthropic" → channel "whatsapp:default"
WhatsApp: selfChatMode=true, dmPolicy=allowlist, allowFrom=[+5515998601308]
Media: mediaMaxMb=50
Plugin: finance-db (4 tools)
Gateway: mode=local, port 8080, --allow-unconfigured
Auth: auto-generated token (changes on each deploy)
```

**How OpenClaw delivers media to agent:**
```json
{
  "body": "<media:audio>",
  "mediaPath": "/home/node/.openclaw/media/inbound/{uuid}.ogg",
  "mediaType": "audio/ogg; codecs=opus"
}
```
Agent sees `mediaPath` and `mediaType` in message context. Tools read files from disk.

---

## Deploy & Operations

### Deploy flow
1. Push to `main` on GitHub
2. Railway auto-builds both services (Docker)
3. Gateway: builds image → start.sh → chown volume → prisma push → openclaw run
4. Dashboard: builds Next.js standalone → serves on port 3000

### Railway Volume
- Mount path: `/data/whatsapp-session` (5GB, US West)
- Symlinked to: `/home/node/.openclaw/credentials/whatsapp/default`
- Contains: WhatsApp session creds (creds.json + pre-keys)
- **start.sh runs `chown -R node:node`** because Railway mounts as root

### WhatsApp Session
- Session persists across deploys via volume
- If disconnected: `railway ssh` → `openclaw channels login --channel whatsapp`
  (requires env vars: `OPENCLAW_GATEWAY_URL=ws://127.0.0.1:8080`, `OPENCLAW_GATEWAY_TOKEN=<token>`)
- Auth token: read from `/home/node/.openclaw/openclaw.json` → `gateway.auth.token`
- Token CHANGES on every deploy (auto-generated)

### Useful Commands
```bash
# Link CLI to gateway
railway link -p d8230117-7e92-45f0-b8f5-08087e8a2588 -e 456ad498-7a3f-43c1-9eca-de6fb128e223 -s af54054a-a2c2-4b60-b4aa-2bd233451927

# View logs
railway logs --lines 50

# SSH into container (runs as root)
railway ssh "command here"

# Run as node user
railway ssh "su -s /bin/sh node -c 'command here'"

# Check WhatsApp status
railway ssh "su -s /bin/sh node -c 'OPENCLAW_GATEWAY_URL=ws://127.0.0.1:8080 OPENCLAW_GATEWAY_TOKEN=\$(cat /home/node/.openclaw/openclaw.json | grep -o '\"token\":\"[^\"]*\"' | head -1 | cut -d'\"' -f4) openclaw channels status'"

# Check gateway health
curl -s https://gateway-production-1080.up.railway.app/healthz

# Check detailed logs
railway ssh "tail -50 /tmp/openclaw/openclaw-2026-03-18.log"

# Redeploy
railway redeploy --yes
```

---

## Known Issues & Gotchas

### Railway Volume Permissions
Railway mounts volumes as `root:root`. The `start.sh` runs as root and does `chown -R node:node /data/whatsapp-session` before dropping to node via `exec su`. If you change the Dockerfile to `USER node` before CMD, the chown will fail silently and WhatsApp creds won't persist.

### Dual Prisma Schemas
Gateway and dashboard have separate `schema.prisma` files pointing to the same DB. Any model change requires editing BOTH. Gateway runs `prisma db push` on startup, dashboard does not. Never use `prisma migrate` — stick with `prisma db push`.

### OpenClaw Auth Token
Auto-generated on every deploy. Not configurable via env var in current setup. To access Control UI: `https://gateway-production-1080.up.railway.app/__openclaw__/` requires Bearer token from config file.

### Zod Versions
Gateway uses Zod v3 (`^3.24.2`). Dashboard uses Zod v4 (`^4.3.6`). APIs are slightly different: v3 has `.errors`, v4 has `.issues`. Keep both in sync with their respective versions.

### WhatsApp selfChatMode
Bot is configured to respond to messages the user sends TO THEMSELVES (selfChatMode). The phone +5515998601308 is both sender and receiver. `dmPolicy: "allowlist"` restricts to only this number.

### Agent Language
OpenClaw's base agent may respond in English by default. The `SKILL.md` has explicit rules at the top forcing Portuguese. If the agent reverts to English, check if the skill is properly loaded (look for skill registration in gateway logs).

---

## Adding New Features (Patterns)

### New Gateway Tool
1. Create `gateway/extensions/finance-db/src/tools/my-tool.ts`
2. Follow TypeBox params + execute pattern (see save-transaction.ts)
3. Import and register in `src/index.ts`: `api.registerTool(myTool)`
4. Update `gateway/skills/finance/SKILL.md` with usage instructions
5. Push → Railway auto-deploys

### New Dashboard Page
1. Create `dashboard/src/app/my-page/page.tsx`
2. Server component for data, wrap interactive parts in client components
3. Use design tokens from Tailwind config
4. Add nav link in `components/navbar.tsx`
5. Run `npx next build` to verify

### New Dashboard API Route
1. Create `dashboard/src/app/api/my-route/route.ts`
2. Follow existing pattern: try/catch, NextResponse.json, Prisma queries
3. Add Zod schemas in `lib/schemas.ts` if needed
4. Status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 500 Error

### Schema Change
1. Edit `gateway/extensions/finance-db/prisma/schema.prisma` (source of truth)
2. Copy EXACT same change to `dashboard/prisma/schema.prisma`
3. Gateway runs `prisma db push` on next deploy — applies migration
4. Dashboard needs `npx prisma generate` to update client

---

## Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| AI Agent | OpenClaw + Claude Haiku 4.5 | latest |
| WhatsApp | Baileys (via OpenClaw) | built-in |
| Audio Transcription | Groq Whisper (`whisper-large-v3-turbo`) | free tier |
| Dashboard | Next.js (App Router) | 14.2 |
| Styling | Tailwind CSS | 3.4 |
| Charts | Recharts | 2.15 |
| ORM | Prisma | 6.4 |
| Database | PostgreSQL | 16 |
| Validation (gateway) | Zod v3 + TypeBox | 3.24 / 0.34 |
| Validation (dashboard) | Zod v4 | 4.3 |
| Deploy | Railway (Docker) | — |
| Fonts | Outfit + JetBrains Mono | Google Fonts |

---

## Guardrails (DO NOT VIOLATE)

- **NO** shadcn/ui, Radix, or component libraries — Tailwind pure
- **NO** Framer Motion — CSS animations only
- **NO** replacing Recharts — only restyle
- **NO** `prisma migrate` — only `prisma db push`
- **NO** `groq-sdk` or `openai` packages — use native fetch
- **NO** Inter, Arial, Roboto, Space Grotesk fonts
- **NO** `as any`, `@ts-ignore`, `@ts-expect-error`
- **NO** auth (currently public)
- **ALWAYS** respond in Portuguese (pt-BR) in the WhatsApp bot
- **ALWAYS** use immutable patterns (spread, ReadonlyArray)
- **ALWAYS** update BOTH prisma schemas on model changes
- **ALWAYS** test with `npx next build` before pushing dashboard changes
