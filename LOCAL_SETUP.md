# ETW (Eye The Wealth) - Local Setup Guide

This file provides instructions for setting up and running the ETW project locally.
If you are an AI assistant (like Antigravity), you can read these instructions to prepare the environment for the user.

## 1. Prerequisites
- Node.js v20+ (recommended)
- npm or yarn

## 2. Environment Variables
1. Copy `.env.example` to `.env`.
   ```bash
   cp .env.example .env
   ```
2. Make sure the database URL in `.env` is set correctly. The project uses Prisma with a SQLite database by default (`file:./dev.db`).
3. Add `CRON_SECRET=your_secret_here` to `.env` if you want to run the cron emergency sync.
4. Add `RELIEFWEB_APPNAME=your_app_name` to `.env` if you want ReliefWeb adapter to fetch real emergency data.

## 3. Installation
Install the project dependencies:
```bash
npm install
```

## 4. Database Setup
The project relies on Prisma and a database schema.

1. Generate Prisma client:
   ```bash
   npm run db:generate
   ```
2. Push the schema to the database (if not using migrations) or run migrations:
   ```bash
   npm run db:push
   # OR
   # npm run db:migrate
   ```
3. Seed the database with sample data (this includes samples for Contributor/NGOs):
   ```bash
   npm run db:seed
   ```
4. Seed real NGOs for Maharashtra:
   ```bash
   $env:TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS"}'; npx ts-node scripts/seed-real-ngos.ts
   ```
   *(Note: The above command uses PowerShell syntax. On bash, use: `TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS"}' npx ts-node scripts/seed-real-ngos.ts`)*

## 5. Ingestion (Optional)
If you want to pull WorldBank indicator data (for the Rover module):
```bash
npm run ingest:worldbank
```

If you have real NGO/financial data in CSV files, you can import them:
```bash
npm run import:ngos -- --file=your-ngos.csv
npm run import:financials -- --file=your-financials.csv
```

## 6. Running the Development Server
Start the Next.js application:
```bash
npm run dev
```

The application should now be running on `http://localhost:3000`.

## Modules Overview
- **/rover**: Macro-economic analysis across countries using WorldBank data.
- **/contributor**: Micro-economic tracker showing NGO flows and emergency intelligence.
- **/admin/emergencies**: Admin panel to review and approve emergencies.
