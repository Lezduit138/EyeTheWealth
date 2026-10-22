# ETW — Eye The Wealth

ETW is a financial and socioeconomic transparency web platform. It aggregates public data from credible sources, preserves original source and methodology, and clearly separates official data from ETW analysis.

## Core Modules

1. **ROVER**: Socioeconomic and wealth statistics across 217 countries / 41 indicators. Data is sourced from the World Bank API.
2. **CONTRIBUTOR**: Maharashtra NGO directory tracking public financial records, fund-flow graphs, and disaster-response intelligence. Razorpay donations (INR).
3. **DE BASEMENT**: Educational module on legal financial structures and transparency challenges.

## Technology Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS (strictly black/white WCAG AA palette in `globals.css`)
- **Database**: Prisma ORM with SQLite (portable to PostgreSQL)
- **Authentication**: Auth.js (NextAuth v5) for admin/editor access
- **Visualizations**: Recharts (charts), Dagre/React Flow (fund-flow diagrams), react-globe.gl (3D globe)
- **Payments**: Razorpay (INR only, HMAC webhook verification)

## Quick Setup

> **Full step-by-step guide (including AI-assistant-friendly instructions) is in [LOCAL_SETUP.md](./LOCAL_SETUP.md)**

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env   # Windows: Copy-Item .env.example .env
# Edit .env — set AUTH_SECRET to a random 32-char string

# 3. Initialize DB schema
npx prisma db push
npx prisma generate

# 4. Seed reference data (districts + categories)
node scripts/seed-reference.cjs

# 5. Seed Rover indicators
npx ts-node scripts/migrate-indicators.ts

# 6. Ingest World Bank data (217 countries)
npx ts-node scripts/ingest-worldbank.ts

# 7. Import real Maharashtra NGOs
npx ts-node scripts/import-ngos-csv.ts --file=data/raw/real_maharashtra_ngos.csv

# 8. Start dev server
npm run dev
```

Open **http://localhost:3000**

## Architecture

```
app/
  rover/          — Macro Monitor (Globe, Compare, Country profiles)
  contributor/    — NGO Directory, profiles, Fund Flow, donations
  de-basement/    — Educational content
  admin/          — Protected admin dashboard (coverage, donations)
  api/v1/         — REST API (rate-limited, paginated)
components/
  layout/         — Header, Footer
  ui/             — ETW design-system components (Card, DataTable, StatusBadge…)
  rover/          — Globe, IndicatorHistoryChart, ComparisonMatrix
  contributor/    — NGO cards, FundFlowGraph, DonationModal
lib/              — Prisma singleton, auth helpers, API response utils
prisma/           — schema.prisma (SQLite → PostgreSQL portable)
scripts/          — Data ingestion & seed scripts
tests/            — Unit tests (20 tests; npm test)
docs/             — ETW_RULES.md, architecture decisions
```

## Data Integrity Policy

- **Zero fictional data**: No dummy/sample NGOs exist in Contributor. Test fixtures are strictly in `tests/`.
- **Source-cited**: Every data point requires a cited source URL.
- **Official data first**: World Bank API, NITI Aayog NGO Darpan IDs, official charity registrations.
- Where data is unavailable, the UI shows "Not publicly disclosed" — never invented values.

## Verification

```bash
npm test        # 20 unit tests (fund flow, payments HMAC, emergency, imports, RBAC)
npm run lint    # ESLint — zero errors
npm run build   # Next.js production build
```

## Design System

- Strictly monochrome: `#000` / `#FFF` — no colour gradients except the ROVER globe heatmap.
- Font: Inter (Google Fonts).
- Thick borders, uppercase tracking, stark contrasts — investigative, not decorative.
