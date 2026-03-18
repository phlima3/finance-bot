# 💰 Finance Bot

**Assistente financeiro pessoal via WhatsApp com dashboard premium.**

Envie mensagens de texto ou áudio pelo WhatsApp para registrar seus gastos e receitas. Visualize tudo em uma dashboard dark luxuosa com gráficos, filtros e exportação.

<br>

## Como Funciona

```
📱 WhatsApp                    🤖 AI Agent                    📊 Dashboard
"gastei 50 no uber"  ──►  Claude Haiku processa  ──►  Gráficos + CRUD
🎤 áudio (voz)       ──►  Groq Whisper transcreve ──►  Filtros + Export
```

**Texto** → Você envia uma mensagem, a IA extrai valor, categoria e descrição, salva no banco, e confirma.

**Áudio** → Você manda um áudio, o bot transcreve automaticamente com Whisper, e processa como texto.

**Dashboard** → Visualize gastos por categoria, período, tipo. Edite, exclua, adicione transações. Exporte CSV/PDF.

<br>

## Stack

| Componente | Tecnologia |
|-----------|-----------|
| AI Agent | [OpenClaw](https://openclaw.ai) + Claude Haiku 4.5 |
| WhatsApp | Baileys (via OpenClaw) |
| Transcrição | Groq Whisper (gratuito) |
| Dashboard | Next.js 14, TypeScript, Tailwind CSS |
| Gráficos | Recharts |
| Banco de Dados | PostgreSQL + Prisma ORM |
| Deploy | Railway |

<br>

## Features

### WhatsApp Bot
- ✅ Registro de gastos e receitas por texto
- ✅ Transcrição de áudio (voice notes) via Groq Whisper
- ✅ 12 categorias automáticas (alimentação, transporte, moradia, etc.)
- ✅ Consultas financeiras ("quanto gastei este mês?")
- ✅ Alertas de gastos excessivos por categoria
- ✅ Inferência inteligente de datas ("ontem", "segunda passada")

### Dashboard
- ✅ Tema dark luxuoso (Outfit + JetBrains Mono, gold accents)
- ✅ Cards de resumo: receitas, gastos, saldo
- ✅ Gráfico donut por categoria
- ✅ CRUD completo de transações (criar, editar, excluir)
- ✅ Filtros por período, categoria e tipo
- ✅ Paginação
- ✅ Export CSV e PDF
- ✅ Responsivo (mobile + desktop)

<br>

## Setup Local

### Pré-requisitos
- Node.js 20+
- Docker (para PostgreSQL)
- [OpenClaw CLI](https://docs.openclaw.ai)
- Chave da API Anthropic
- Chave da API Groq (gratuita em [groq.com](https://groq.com))

### 1. Clone e configure

```bash
git clone https://github.com/phlima3/finance-bot.git
cd finance-bot
cp .env.example .env
# Edite .env com suas API keys
```

### 2. Suba o banco de dados

```bash
docker-compose up -d postgres
```

### 3. Dashboard

```bash
cd dashboard
npm install
npx prisma db push
npm run dev
# Acesse http://localhost:3000
```

### 4. Gateway (OpenClaw)

```bash
cd gateway/extensions/finance-db
npm install
npx prisma generate

# Na raiz do projeto
openclaw gateway run --port 8080
# Escaneie o QR code do WhatsApp quando solicitado
```

<br>

## Deploy (Railway)

O projeto está configurado para deploy automático no Railway via GitHub.

### Serviços necessários
1. **PostgreSQL** — banco de dados compartilhado
2. **Gateway** — Docker build de `gateway/Dockerfile`
3. **Dashboard** — Docker build de `dashboard/Dockerfile`

### Variáveis de ambiente

| Serviço | Variável | Descrição |
|---------|----------|-----------|
| Gateway | `ANTHROPIC_API_KEY` | API key da Anthropic |
| Gateway | `DATABASE_URL` | PostgreSQL connection string |
| Gateway | `GROQ_API_KEY` | API key do Groq (gratuita) |
| Dashboard | `DATABASE_URL` | PostgreSQL connection string |

### Volume
O gateway precisa de um volume montado em `/data/whatsapp-session` para persistir a sessão do WhatsApp entre deploys.

<br>

## Arquitetura

```
┌─────────────────── RAILWAY ───────────────────────┐
│                                                     │
│  Gateway          Dashboard         PostgreSQL      │
│  (OpenClaw)       (Next.js 14)      (shared DB)     │
│  port 8080        port 3000                         │
│       │                 │                │          │
│       │    Prisma ORM   └────────────────┘          │
│       │                                             │
└───────┼─────────────────────────────────────────────┘
        │ WebSocket (Baileys)
        ▼
   📱 WhatsApp
```

Veja detalhes completos em [ARCHITECTURE.md](./ARCHITECTURE.md).

<br>

## Categorias

| Categoria | Exemplos |
|-----------|----------|
| 🍔 Alimentação | Restaurante, mercado, iFood, padaria |
| 🚗 Transporte | Uber, 99, gasolina, estacionamento |
| 🏠 Moradia | Aluguel, luz, água, internet |
| 🎮 Lazer | Cinema, Netflix, Spotify, viagem |
| 💊 Saúde | Farmácia, médico, academia |
| 📚 Educação | Curso, livro, faculdade |
| 👕 Vestuário | Roupa, sapato, acessório |
| 🔧 Serviços | Cabeleireiro, conserto, lavanderia |
| 💵 Salário | Salário, pagamento mensal |
| 💼 Freelance | Trabalho extra, projeto, bico |
| 📈 Investimento | Aplicação, rendimento, dividendo |
| 📦 Outros | Tudo que não se encaixa acima |

<br>

## Licença

MIT
