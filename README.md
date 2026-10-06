# ETW — Eye The Wealth

ETW is a financial and socioeconomic transparency web platform. It aggregates public data from credible sources, preserves original source and methodology, and clearly separates official data from ETW analysis.

## Core Modules

1. **ROVER**: Socioeconomic and wealth statistics across 8 countries. Data is fetched primarily from the World Bank API.
2. **CONTRIBUTOR**: NGO directory for Maharashtra tracking public financial records and disaster response. Uses React Flow for fund-flow visualization.
3. **DE BASEMENT**: Educational module on legal financial structures and transparency challenges.

## Technology Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS (configured strictly to black and white palette in `globals.css`)
- **Database**: Prisma ORM with SQLite (portable to PostgreSQL)
- **Authentication**: Auth.js (NextAuth) for admin/editor access
- **Visualizations**: Recharts (charts), React Flow (fund-flow diagrams)
- **Data Fetching**: Axios, standard fetch for APIs.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in necessary keys (AUTH_SECRET, etc.).
   ```bash
   cp .env.example .env
   ```

3. **Database Setup:**
   Run Prisma migrations to build the SQLite DB and seed it with baseline structures and sample data.
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   *(Note: The seed script creates an admin user `admin@etw.local` with password `etw-admin-2026`)*

4. **Data Ingestion (Rover):**
   Fetch live data from the World Bank API to populate the socioeconomic indicators.
   ```bash
   npm run ingest:worldbank
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## Architecture

- **`app/`**: Next.js App Router. Contains pages, API routes, and layouts.
  - `/rover`: Module 1
  - `/contributor`: Module 2
  - `/de-basement`: Module 3
  - `/admin`: Protected admin dashboard
  - `/api/v1`: REST API routes (rate limited, paginated)
- **`components/`**: Reusable React components.
  - `/layout`: Header, Footer
  - `/ui`: Standard ETW styled components (Card, DataTable, FundFlow, SourcePanel, StatusBadge)
  - `/rover`: Specific components like `IndicatorHistoryChart`
- **`lib/`**: Utilities (prisma singleton, auth, standard api responses).
- **`prisma/`**: Database schema (`schema.prisma`) and seeding logic (`seed.ts`).
- **`scripts/`**: Background worker scripts (e.g., `ingest-worldbank.ts`).

## Data Sources & Integrity

- **Official Data First**: Every data point on the platform requires a cited source URL.
- **World Bank API**: Integrated via `scripts/ingest-worldbank.ts`.
- **Manual Data**: Wealth estimates (UBS, Forbes) lack a free API and require manual insertion via Prisma Studio or Admin tools.
- **Sample Data**: The seed script populates the database with some Sample NGOs and Illustrative De Basement cases for development purposes. These are flagged with specific status badges on the frontend.

## Design System
- Strictly monochrome: #FFF background, #000 text.
- No gradients, shadows, or heavy animations.
- Font: Inter (from Google Fonts).
- Components utilize thick borders, uppercase tracking, and stark contrasts to convey a robust, investigative feel.
