# Expense Tracker

![Node.js](https://img.shields.io/badge/Node.js-24.x-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-informational)
![Express](https://img.shields.io/badge/Express-5.x-informational)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-informational)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Expense Tracker is an **API-first** backend project for personal finance management.

The application was built as a REST API designed to be consumed by frontend clients, such as web or mobile applications. Besides the API, I also implemented a personal Telegram integration, allowing users to interact with some features through a bot.

The interactive API documentation is available at [expenses.fecarneiro.dev/docs](https://expenses.fecarneiro.dev/docs).

The Telegram usage documentation can be found in the [Telegram Bot](#telegram-bot) section.

## Table of Contents

* [Features](#features)
* [Stack](#stack)
* [Getting Started](#getting-started)
* [Useful Commands](#useful-commands)
* [API Documentation](#api-documentation)
* [Main Resources](#main-resources)
* [Quick Example](#quick-example)
* [Authentication](#authentication)
* [Error Format](#error-format)
* [Telegram Bot](#telegram-bot)
* [Architecture](#architecture)
* [Project Structure](#project-structure)
* [Technical Decisions](#technical-decisions)
* [Tests](#tests)
* [How to Contribute](#how-to-contribute)
* [Author](#author)
* [License](#license)

## Features

* User registration and authentication
* Authenticated user profile management
* Category creation, listing, update and deletion
* Income and expense registration
* User transaction querying
* Monthly reports with income, expense and balance summaries
* Interactive API documentation with OpenAPI and Scalar
* Optional Telegram Bot integration

## Stack

* **Node.js 24**
* **TypeScript**
* **Express 5**
* **PostgreSQL**
* **Drizzle ORM**
* **Zod**
* **JWT with JOSE**
* **OpenAPI + Scalar**
* **Vitest + Supertest**
* **Biome**
* **Husky**, for Git hooks
* **grammY**, for the optional Telegram integration

## Getting Started

### Requirements

Before starting, make sure you have installed:

* Node.js 24.x
* pnpm 11.x
* PostgreSQL

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/fecarneiro/expense-tracker.git
cd expense-tracker
pnpm install
```

Create the environment variables file:

```bash
cp .env.example .env
```

### Environment variables

Configure the `.env` file with your local environment values.

```env
# Core API
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
JWT_SECRET=a-string-secret-at-least-256-bits-long

# Telegram Bot
# Optional. If empty, the API runs without the Telegram bot.
# Required in both development and production if you want to enable the bot.
# In development, the bot uses polling.
# In production, the bot uses webhook.
TELEGRAM_BOT_TOKEN=

# Telegram Webhook
# Required only when NODE_ENV=production and TELEGRAM_BOT_TOKEN is defined.
# Not required in development because polling is used instead of webhook.
APP_URL=
TELEGRAM_WEBHOOK_SECRET=
```

`APP_URL` and `TELEGRAM_WEBHOOK_SECRET` are required only when `NODE_ENV=production` and `TELEGRAM_BOT_TOKEN` is defined.

In development, the bot uses polling instead of webhook, so `APP_URL` and `TELEGRAM_WEBHOOK_SECRET` are not required.

You can generate secure values for `JWT_SECRET` and `TELEGRAM_WEBHOOK_SECRET` with:

```bash
openssl rand -hex 32
```

### Database

Configure `DATABASE_URL` in the `.env` file to point to a valid PostgreSQL database.

Example:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
```

In the example above, the expected database name is `expense_tracker`. You can create this database locally with:

```bash
createdb expense_tracker
```

Then, run the migrations:

```bash
pnpm db:migrate
```

### Running the application

Start the application in development mode:

```bash
pnpm dev
```

The API will be available at:

```txt
http://localhost:3000
```

The local documentation can be accessed at:

```txt
http://localhost:3000/docs
```

## Useful Commands

| Command                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `pnpm dev`               | Starts the application in development mode           |
| `pnpm build`             | Compiles the project to the `dist/` folder           |
| `pnpm start`             | Starts the compiled application                      |
| `pnpm test`              | Runs the test suite                                  |
| `pnpm test:watch`        | Runs the tests in watch mode                         |
| `pnpm typecheck`         | Runs TypeScript type checking                        |
| `pnpm check`             | Runs Biome checks                                    |
| `pnpm check:fix`         | Runs Biome and applies automatic fixes               |
| `pnpm validate`          | Runs type checking, linting and tests                |
| `pnpm db:migrate`        | Runs database migrations                             |
| `pnpm db:migrate:deploy` | Runs migrations using the compiled production script |
| `pnpm db:generate`       | Generates a new Drizzle migration                    |
| `pnpm db:studio`         | Opens Drizzle Studio                                 |

## API Documentation

The API provides interactive documentation generated from the OpenAPI contract.

| Resource             | URL                                          |
| -------------------- | -------------------------------------------- |
| Hosted documentation | https://expenses.fecarneiro.dev/docs         |
| Hosted OpenAPI JSON  | https://expenses.fecarneiro.dev/openapi.json |
| Local documentation  | http://localhost:3000/docs                   |
| Local OpenAPI JSON   | http://localhost:3000/openapi.json           |
| Local health check   | http://localhost:3000/health                 |

The health check endpoint can be used to verify that the application is responding:

```bash
curl http://localhost:3000/health
```

## Main Resources

| Resource        | Description                                     |
| --------------- | ----------------------------------------------- |
| `/auth`         | User registration, login and authentication     |
| `/users`        | Authenticated user profile management           |
| `/categories`   | Category creation, listing, update and deletion |
| `/transactions` | Income and expense registration and querying    |
| `/analytics`    | Financial reports and monthly summaries         |
| `/telegram`     | Optional Telegram Bot integration               |

## Quick Example

Below is a minimal flow to test the API using `curl`.

### Create a user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Log in

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Store the `accessToken` returned by the login request:

```bash
ACCESS_TOKEN="<access_token>"
```

### Create a category

```bash
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food"
  }'
```

## Authentication

The API uses JWT-based authentication.

After logging in through `/auth/login`, the API returns an `accessToken`. This token must be sent in the `Authorization` header to access protected routes.

Header format:

```http
Authorization: Bearer <access_token>
```

Example:

```bash
curl http://localhost:3000/users/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Access tokens expire in 2 hours.

Currently, the API does not use refresh tokens. When the token expires, the user must log in again to obtain a new `accessToken`.

## Error Format

The API returns errors in a simple and consistent format.

Application errors return a descriptive message:

```json
{
  "message": "Unauthorized"
}
```

Validation errors return a general message and a list of invalid fields:

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

This format makes it easier for frontend clients, mobile applications or external integrations to handle API errors.

## Telegram Bot

Besides the REST API, the project includes an optional Telegram Bot integration using [grammY](https://grammy.dev/).

This integration was created as an alternative way to interact with some Expense Tracker features without depending on a frontend interface. The goal is to allow users to register or query financial information directly from Telegram.

The integration is optional. If `TELEGRAM_BOT_TOKEN` is not defined, the application runs normally as a REST API only.

### Available commands

| Command        | Description                                           |
| -------------- | ----------------------------------------------------- |
| `/start`       | Starts the interaction with the bot                   |
| `/link <code>` | Links the Telegram account to an existing API account |
| `/expense`     | Registers a new expense                               |
| `/income`      | Registers a new income                                |
| `/last`        | Lists the latest transactions                         |
| `/report`      | Shows the monthly financial summary                   |

### Linking with the API account

To use the protected bot commands, the Telegram account must first be linked to an existing API user.

The flow works as follows:

1. The user generates a linking code through the API.
2. In Telegram, the user sends the `/link` command with the generated code.
3. The bot validates the code and associates the `telegramId` with the API user.
4. After linking, the user can use commands such as `/expense`, `/income`, `/last` and `/report`.

Example:

```txt
/link 123456
```

The linking code must contain 6 digits.

### Execution modes

The bot can run in two modes:

* **Polling**, used in development
* **Webhook**, used in production

In development, with `NODE_ENV=development`, the bot uses polling. In this mode, the application fetches updates directly from Telegram and does not require a public URL.

In production, with `NODE_ENV=production`, the bot uses webhook. In this mode, Telegram sends updates to a public URL exposed by the application.

### Required variables

To enable the bot in any environment, define `TELEGRAM_BOT_TOKEN`.

In production, besides the bot token, also define `APP_URL` and `TELEGRAM_WEBHOOK_SECRET`.

The webhook endpoint follows this format:

```txt
{APP_URL}/{TELEGRAM_WEBHOOK_SECRET}
```

### General flow

In a simplified view, the integration flow is:

```txt
Telegram user
  -> Telegram Bot
  -> Webhook or polling
  -> Expense Tracker API
  -> Database
```

## Architecture

The application is organized by domain modules, with a separation between the HTTP layer, business rules and data access.

The main request flow follows this structure:

```txt
HTTP Request
  -> Router
  -> Controller
  -> Service
  -> Repository / Query
  -> Database
```

Each layer has a specific responsibility:

| Layer              | Responsibility                                                    |
| ------------------ | ----------------------------------------------------------------- |
| Router             | Defines routes and applies specific middlewares                   |
| Controller         | Receives the request, calls services and builds the HTTP response |
| Service            | Contains the application business rules                           |
| Repository / Query | Encapsulates database access                                      |
| Middleware         | Handles authentication, rate limiting, parsing and errors         |
| OpenAPI            | Documents the API HTTP contracts                                  |

Dependency composition is centralized in the application container. This avoids instantiating services and repositories directly inside routes, keeping the code more organized and easier to test and maintain.

The modular structure also helps keep each domain isolated, such as `auth`, `users`, `categories`, `transactions`, `analytics` and `telegram`.

## Project Structure

The main project structure is organized inside the `src/` folder:

```txt
src/
├── config/          # Application and infrastructure configuration
├── database/        # Database connection, schemas and migrations
├── middlewares/     # Express middlewares
├── modules/         # Domain modules
│   ├── analytics/
│   ├── auth/
│   ├── categories/
│   ├── telegram/
│   ├── transactions/
│   └── users/
├── openapi/         # OpenAPI document composition
├── shared/          # Shared utilities and helpers
├── app.ts           # Express application factory
├── container.ts     # Dependency composition
└── server.ts        # HTTP entry point
```

Inside each module, the HTTP layer is separated from business rules and data access. In general, a module follows this structure:

```txt
modules/
└── example/
    ├── http/                 # Controllers, routes and HTTP schemas
    ├── example.service.ts    # Business rules
    └── example.repository.ts # Database access
```

This separation keeps the HTTP entry point isolated from business logic. Controllers and routes handle request-specific details, while services and repositories concentrate domain rules and persistence.

In practice, this makes automated testing easier and allows other application entry points, such as the Telegram Bot, to reuse the same services without going through the HTTP layer.

## Technical Decisions

Some project decisions were made to keep the API simple to run, easy to test and ready to be consumed by different types of clients.

### API-first

I chose to build the project as API-first to separate the backend from the user interface.

This allows the same API to be consumed by different clients, such as a web application, a mobile application or the Telegram Bot. This approach also makes it easier to test HTTP contracts through the interactive documentation before having a dedicated frontend.

### Modular organization

The application was organized by domain modules, such as `auth`, `users`, `categories`, `transactions`, `analytics` and `telegram`.

This choice keeps responsibilities close to the domain they belong to, avoiding a structure based only on technical file types.

### Separation between HTTP and business rules

Inside the modules, the HTTP layer is separated from services and repositories.

This separation prevents business rules from depending directly on Express, requests or responses. In practice, it improves testability and allows other application entry points, such as the Telegram Bot, to reuse the same services.

### PostgreSQL and Drizzle ORM

I chose PostgreSQL because it is a relational database well suited for a domain with users, categories and financial transactions.

I used Drizzle ORM to work with schemas and versioned migrations while keeping the implementation close to the relational model and with good TypeScript support.

### Validation with Zod

API inputs are validated with Zod before reaching the business rules.

This centralizes input validation, improves consistency in error responses and reduces the chance of invalid data reaching the services.

### OpenAPI and Scalar

The API documentation is exposed with OpenAPI and visualized with Scalar.

This decision makes it easier to test endpoints, understand API contracts and use the backend independently from a specific frontend.

### JWT authentication

Authentication uses JWT access tokens to protect private routes.

This approach keeps the API stateless, but requires care with token expiration, token signing and `JWT_SECRET` protection.

### Rate limiting

The API uses rate limiting to reduce abuse and protect sensitive endpoints.

Rate limiting is enabled in both development and production. It is skipped only in the test environment to keep automated tests deterministic.

Common routes use a global limit of 100 requests per 15 minutes. Authentication routes use a stricter limit of 10 requests per 15 minutes, since login and registration endpoints are more sensitive.

The Telegram account linking flow also has its own in-memory rate limiter. Each Telegram user can fail linking code verification up to 3 times within a 10-minute window. This helps reduce brute-force attempts against 6-digit linking codes.

## Tests

Automated tests use **Vitest** and **Supertest**.

The project includes tests focused on validating business rules and HTTP endpoint behavior. For tests that depend on the database, it uses **PGlite**, allowing a PostgreSQL-compatible database to run in memory during tests without depending on a local PostgreSQL instance.

To run the test suite:

```bash
pnpm test
```

To run tests in watch mode:

```bash
pnpm test:watch
```

Before opening a pull request or publishing changes, run:

```bash
pnpm validate
```

This command runs type checking, linting and automated tests.

### Git hooks

The project uses Husky to run checks before pushing changes.

The `pre-push` hook runs:

```bash
pnpm typecheck && pnpm test
```

This helps prevent pushing code with TypeScript errors or failing tests.

## How to Contribute

Contributions are welcome. Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request targeting the `main` branch

Before opening a pull request, run:

```bash
pnpm validate
```

## Author

Developed by [Felipe Carneiro](https://github.com/fecarneiro).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
