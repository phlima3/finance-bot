# Finance Bot — Arquitetura

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            RAILWAY CLOUD                                │
│                                                                         │
│  ┌──────────────────────┐    ┌──────────────────────┐    ┌───────────┐ │
│  │     📱 Gateway        │    │    📊 Dashboard       │    │ 🐘 Postgres│ │
│  │   (OpenClaw Agent)    │    │     (Next.js 14)      │    │           │ │
│  │                       │◄──►│                       │◄──►│ Transaction│ │
│  │  Port 8080            │    │  Port 3000            │    │ table     │ │
│  │  Volume: /data/       │    │                       │    │           │ │
│  │  whatsapp-session     │    │                       │    │           │ │
│  └───────────┬───────────┘    └───────────────────────┘    └───────────┘ │
│              │                                                           │
└──────────────┼───────────────────────────────────────────────────────────┘
               │ WebSocket (Baileys)
               ▼
        ┌──────────────┐
        │  📲 WhatsApp   │
        │   (Celular)    │
        │ +5515998601308 │
        └──────────────┘
```

---

## Fluxo: Mensagem de Texto

```
 Usuário envia                    OpenClaw                          Banco
 "gastei 50 no uber"              Gateway                         PostgreSQL
       │                             │                               │
       │  ① WhatsApp msg (texto)     │                               │
       ├────────────────────────────►│                               │
       │                             │                               │
       │                  ② Claude Haiku 4.5                        │
       │                  interpreta a mensagem                     │
       │                  usando SKILL.md                           │
       │                             │                               │
       │                  ③ Chama finance_save_transaction           │
       │                     amount: 50                              │
       │                     type: EXPENSE                           │
       │                     category: transporte                    │
       │                     description: "Uber"                     │
       │                     date: 2026-03-18                        │
       │                             │         ④ INSERT              │
       │                             ├──────────────────────────────►│
       │                             │         ✅ Salvo              │
       │                             │◄──────────────────────────────┤
       │                             │                               │
       │                  ⑤ Chama finance_check_alerts               │
       │                     (verifica limites da categoria)         │
       │                             │         ⑥ SELECT              │
       │                             ├──────────────────────────────►│
       │                             │         📊 Total: R$350       │
       │                             │◄──────────────────────────────┤
       │                             │                               │
       │  ⑦ "✅ R$50 Uber            │                               │
       │     categoria transporte.   │                               │
       │     Sem alertas! 🚗"        │                               │
       │◄────────────────────────────┤                               │
       │                             │                               │
```

---

## Fluxo: Mensagem de Áudio

```
 Usuário envia                    OpenClaw                  Groq        Banco
 🎤 áudio (5s)                    Gateway                  Whisper     PostgreSQL
       │                             │                        │           │
       │  ① WhatsApp voice note      │                        │           │
       │     (.ogg, audio/opus)      │                        │           │
       ├────────────────────────────►│                        │           │
       │                             │                        │           │
       │              ② Salva em /home/node/.openclaw/        │           │
       │                 media/inbound/{uuid}.ogg             │           │
       │                             │                        │           │
       │              ③ Claude Haiku vê <media:audio>         │           │
       │                 + mediaPath do arquivo                │           │
       │                             │                        │           │
       │              ④ Chama finance_transcribe_audio         │           │
       │                 mediaPath: /home/node/...uuid.ogg    │           │
       │                             │                        │           │
       │                             │  ⑤ POST /v1/audio/     │           │
       │                             │     transcriptions     │           │
       │                             │     model: whisper-    │           │
       │                             │     large-v3-turbo     │           │
       │                             │     language: pt       │           │
       │                             ├───────────────────────►│           │
       │                             │                        │           │
       │                             │  ⑥ "gastei cinquenta   │           │
       │                             │     reais no uber"     │           │
       │                             │◄───────────────────────┤           │
       │                             │                        │           │
       │              ⑦ Processa texto transcrito              │           │
       │                 como mensagem normal                  │           │
       │                 (mesmo fluxo de texto acima)          │           │
       │                             │                        │           │
       │                             │      ⑧ INSERT                      │
       │                             ├───────────────────────────────────►│
       │                             │      ✅ Salvo                      │
       │                             │◄───────────────────────────────────┤
       │                             │                                    │
       │  ⑨ "✅ R$50 Uber             │                                    │
       │     categoria transporte."   │                                    │
       │◄────────────────────────────┤                                    │
       │                             │                                    │
```

---

## Fluxo: Dashboard (Browser)

```
 Usuário (Browser)                Dashboard                         Banco
 dashboard-production-            Next.js 14                      PostgreSQL
 b855.up.railway.app              App Router
       │                             │                               │
       │  ① GET /                    │                               │
       ├────────────────────────────►│                               │
       │                             │  ② Prisma query               │
       │                             │     (server component)        │
       │                             ├──────────────────────────────►│
       │                             │  ③ Transactions[]             │
       │                             │◄──────────────────────────────┤
       │  ④ HTML renderizado         │                               │
       │     - Cards (💰💸📊)        │                               │
       │     - Gráfico (donut)       │                               │
       │     - Tabela recente        │                               │
       │◄────────────────────────────┤                               │
       │                             │                               │
       │  ⑤ GET /transactions        │                               │
       ├────────────────────────────►│                               │
       │                             │  ⑥ GET /api/transactions      │
       │                             │     ?page=1&limit=20          │
       │                             │     &startDate=...&type=...   │
       │                             ├──────────────────────────────►│
       │                             │  ⑦ { data, meta }             │
       │                             │◄──────────────────────────────┤
       │  ⑧ Tabela CRUD              │                               │
       │     [Editar] [Excluir]      │                               │
       │     [Nova Transação]        │                               │
       │     [Filtros] [Export]      │                               │
       │◄────────────────────────────┤                               │
       │                             │                               │
```

---

## Componentes

### Gateway (OpenClaw)
```
gateway/
├── Dockerfile                    # Imagem base: ghcr.io/openclaw/openclaw:latest
├── start.sh                      # Startup: chown volume → prisma push → openclaw run
├── openclaw.production.json      # Config: agente, channels, plugins, bindings
├── skills/finance/SKILL.md       # Prompt do agente (pt-BR, regras, categorias)
└── extensions/finance-db/        # Plugin com 4 tools
    ├── src/index.ts              # Registra tools na API do OpenClaw
    ├── src/tools/
    │   ├── save-transaction.ts   # Salva transação no banco
    │   ├── check-alerts.ts       # Verifica limites por categoria
    │   ├── query.ts              # Consulta transações com filtros
    │   └── transcribe-audio.ts   # Transcreve áudio via Groq Whisper
    └── prisma/schema.prisma      # Schema do banco (Transaction)
```

### Dashboard (Next.js 14)
```
dashboard/
├── Dockerfile                    # Build standalone Next.js
├── src/app/
│   ├── layout.tsx                # Layout: Outfit + JetBrains Mono, dark theme
│   ├── globals.css               # Design tokens CSS, animações, scrollbar
│   ├── page.tsx                  # Dashboard: cards + gráfico + tabela recente
│   ├── error.tsx                 # Error boundary
│   ├── transactions/
│   │   ├── page.tsx              # Página CRUD (Suspense wrapper)
│   │   └── transactions-content.tsx  # Client: tabela + filtros + modais
│   └── api/
│       ├── transactions/
│       │   ├── route.ts          # GET (filtros/paginação) + POST
│       │   └── [id]/route.ts     # GET + PATCH + DELETE
│       └── export/
│           ├── csv/route.ts      # Export CSV
│           └── pdf/route.ts      # Export PDF (print-friendly)
├── src/components/
│   ├── navbar.tsx                # Navegação: Dashboard ↔ Transações
│   ├── monthly-totals.tsx        # Cards: 💰 Receitas 💸 Gastos 📊 Saldo
│   ├── category-chart.tsx        # Gráfico donut (Recharts)
│   ├── transaction-list.tsx      # Tabela resumida (dashboard)
│   ├── transactions-table.tsx    # Tabela CRUD (página transações)
│   ├── transaction-form.tsx      # Modal: criar/editar transação
│   ├── confirm-dialog.tsx        # Modal: confirmar exclusão
│   ├── pagination.tsx            # Navegação de páginas
│   └── filters.tsx               # Filtros: data, categoria, tipo
└── src/lib/
    ├── db.ts                     # Prisma client singleton
    ├── schemas.ts                # Zod schemas (validação)
    └── formatters.ts             # formatCurrency, formatDate, formatCategory
```

---

## Variáveis de Ambiente (Railway)

| Serviço   | Variável           | Descrição                          |
|-----------|--------------------|------------------------------------|
| Gateway   | ANTHROPIC_API_KEY  | Claude Haiku 4.5 (agente AI)      |
| Gateway   | DATABASE_URL       | PostgreSQL connection string       |
| Gateway   | GROQ_API_KEY       | Groq Whisper (transcrição áudio)   |
| Dashboard | DATABASE_URL       | PostgreSQL connection string       |

---

## Stack Técnica

| Componente      | Tecnologia                                         |
|-----------------|-----------------------------------------------------|
| AI Agent        | OpenClaw + Claude Haiku 4.5 (Anthropic)             |
| WhatsApp        | Baileys (via OpenClaw WhatsApp channel)              |
| Transcrição     | Groq Whisper (whisper-large-v3-turbo, grátis)        |
| Dashboard       | Next.js 14 (App Router, TypeScript, Tailwind CSS)    |
| Gráficos        | Recharts                                             |
| Banco de Dados  | PostgreSQL + Prisma ORM                              |
| Tema            | Dark Luxuoso (Outfit + JetBrains Mono, gold accents) |
| Deploy          | Railway (Docker containers + volume)                 |
| Repositório     | GitHub (phlima3/finance-bot)                         |
