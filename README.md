# Expense Tracker API

A personal finance REST API for managing users, categories, income, expenses and monthly
balance reports.

Built with Node.js, Express, TypeScript, PostgreSQL, Drizzle ORM and JWT authentication.
Includes OpenAPI documentation, Zod validation, rate limiting, tests and optional Telegram bot
integration.

![Node.js](https://img.shields.io/badge/Node.js-24.x-informational)
![Express](https://img.shields.io/badge/Express-5.x-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-informational)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-informational)

## Links

| Service | URL |
|---|---|
| API Docs | https://expenses.fecarneiro.dev/docs |
| OpenAPI JSON | https://expenses.fecarneiro.dev/openapi.json |
| Telegram Bot | Search for `@expenses_fecarneiro_bot` in Telegram |

## Features

- Email/password authentication with JWT access tokens
- Authenticated user profile and password management
- Category and transaction CRUD
- Monthly balance analytics grouped by month
- OpenAPI 3.1 documentation with Scalar
- Request validation with Zod
- PostgreSQL persistence with Drizzle migrations
- Optional Telegram account linking and bot runtime
- Automated tests with Vitest and Supertest

## Stack

- Node.js 24, TypeScript, Express 5
- PostgreSQL, Drizzle ORM
- Zod, JOSE, express-rate-limit
- OpenAPI + Scalar
- Vitest, Supertest, Biome

## Getting Started

### Requirements

- Node.js 24.x
- pnpm 11.x
- PostgreSQL

### Installation

```bash
git clone https://github.com/fecarneiro/expense-tracker.git
cd expense-tracker
pnpm install
cp .env.example .env
```

Update `.env` with your local database URL and secrets:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
JWT_SECRET=a-string-secret-at-least-256-bits-long

# Optional Telegram bot
TELEGRAM_BOT_TOKEN=

# Required in production when TELEGRAM_BOT_TOKEN is defined
APP_URL=
TELEGRAM_WEBHOOK_SECRET=
```

Generate strong values for `JWT_SECRET` and `TELEGRAM_WEBHOOK_SECRET` with:

```bash
openssl rand -hex 32
```

### Database

Create your local PostgreSQL database, then run the versioned migrations:

```bash
pnpm db:migrate
```

When changing database schemas, generate a new migration with:

```bash
pnpm db:generate
```

### Run

```bash
pnpm dev
```

The API runs at `http://localhost:3000`.

## API Documentation

- Hosted docs: `https://expenses.fecarneiro.dev/docs`
- Local docs: `http://localhost:3000/docs`
- Raw OpenAPI: `http://localhost:3000/openapi.json`
- Health check: `GET /health`

## Main Resources

| Resource | Description |
|---|---|
| `/auth` | User registration and login |
| `/users` | Authenticated user profile |
| `/categories` | Transaction categories |
| `/transactions` | Income and expense records |
| `/analytics` | Financial reports and summaries |
| `/telegram` | Telegram account linking |

## Quick API Example

The interactive docs use Scalar's `{{$randomEmail}}` variable for email examples. If you run
the curl examples below, replace `john@example.com` with an unused email.

```bash
curl -X POST https://expenses.fecarneiro.dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

```bash
curl -X POST https://expenses.fecarneiro.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Use the returned access token on protected routes:

```bash
ACCESS_TOKEN="<access_token>"

curl -X POST https://expenses.fecarneiro.dev/categories \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food"
  }'
```

## Authentication

Protected routes require:

```http
Authorization: Bearer <access_token>
```

Access tokens expire in 2 hours.

## Error Format

Application errors:

```json
{
  "message": "Unauthorized"
}
```

Validation errors:

```json
{
  "message": "Validation error",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## Telegram

Telegram integration is optional. When `TELEGRAM_BOT_TOKEN` is not configured, the API runs
normally without the bot.

In development, the bot runs in polling mode. In production, it uses webhook mode:

```txt
{APP_URL}/{TELEGRAM_WEBHOOK_SECRET}
```

To try the hosted bot, search for `@expenses_fecarneiro_bot` inside Telegram.

## Common Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Compile to `dist/` |
| `pnpm start` | Start the compiled server |
| `pnpm test` | Run tests |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm check` | Run Biome checks |
| `pnpm validate` | Run typecheck, lint and tests |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:generate` | Generate a Drizzle migration |
| `pnpm db:studio` | Open Drizzle Studio |

## Project Structure

```txt
src/
├── config/          # Application and infrastructure configuration
├── database/        # Database connection, schemas and migrations
├── middlewares/     # Express middlewares
├── modules/         # Feature modules
│   ├── analytics/
│   ├── auth/
│   ├── categories/
│   ├── telegram/
│   ├── transactions/
│   └── users/
├── openapi/         # OpenAPI document composition
├── shared/          # Shared utilities and domain helpers
├── app.ts           # Express app factory
├── container.ts     # Dependency composition
└── server.ts        # HTTP server entrypoint
```

## Support

Maintained by Felipe Carneiro. For questions, bugs or suggestions, open a GitHub issue.
