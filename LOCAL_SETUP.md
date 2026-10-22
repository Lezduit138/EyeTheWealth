# ETW (Eye The Wealth) — Local Setup & Verification Guide

This guide contains everything required to clone, configure, seed, and run ETW locally on any machine (Windows PowerShell or macOS/Linux). 

> **Note for AI Assistants (Antigravity):** You can execute the steps in section 3 sequentially to get the entire site (Rover + Contributor + Payments) running from scratch.

---

## 1. Prerequisites
- **Node.js**: v20+ or v24+
- **Package Manager**: `npm`
- **Operating System**: Windows (PowerShell) or macOS/Linux (Bash)

---

## 2. Environment Setup

Create `.env` by copying `.env.example`:
```powershell
# Windows PowerShell
Copy-Item .env.example .env

# Bash (macOS/Linux)
cp .env.example .env
```

Ensure `.env` contains at minimum:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="any_random_32_character_string_for_local_testing"
AUTH_URL="http://localhost:3000"
ADMIN_EMAILS="admin@etw.local"
PAYMENTS_MODE="test"
DONATION_MIN_INR=100
DONATION_MAX_INR=100000
ENABLE_SIMULATION=false
```

---

## 3. Quickstart: Step-by-Step Execution

Run these commands in the project root:

### Step 3.1: Install Dependencies
```bash
npm install
```

### Step 3.2: Initialize Database Schema
Sync the Prisma schema to the local SQLite database (`prisma/dev.db`):
```bash
npx prisma db push
npx prisma generate
```

### Step 3.3: Seed Reference Data (Canonical Districts & Categories)
Seeds the 36 Maharashtra districts (with canonical names, aliases, and adjacency) and 12 Contributor categories:
```bash
node scripts/seed-reference.cjs
```

### Step 3.4: Seed Macro Indicators (Rover Module)
Upserts all 41 World Bank macro indicators into the database:
```powershell
# Windows PowerShell
$env:TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS"}'; npx ts-node scripts/migrate-indicators.ts

# Bash (macOS/Linux)
TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS"}' npx ts-node scripts/migrate-indicators.ts
```

### Step 3.5: Ingest Real World Bank Data (Rover Map & Timeseries)
Ingests live World Bank macro data across 217 countries:
```powershell
# Windows PowerShell
$env:TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS"}'; npx ts-node scripts/ingest-worldbank.ts

# Bash (macOS/Linux)
TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS"}' npx ts-node scripts/ingest-worldbank.ts
```

### Step 3.6: Import Real Maharashtra NGOs (Contributor Module)
Imports verified Maharashtra NGOs (including Shree Siddhivinayak, Shree Saibaba Sansthan, CRY, Pratham, Snehalaya, etc.) with official NITI Aayog NGO Darpan IDs and charity registrations:
```powershell
# Windows PowerShell
$env:TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS"}'; npx ts-node scripts/import-ngos-csv.ts --file=data/raw/real_maharashtra_ngos.csv

# Bash (macOS/Linux)
TS_NODE_COMPILER_OPTIONS='{"module":"CommonJS"}' npx ts-node scripts/import-ngos-csv.ts --file=data/raw/real_maharashtra_ngos.csv
```

### Step 3.7: Start Local Development Server
```bash
npm run dev
```

The application is now live at:
**http://localhost:3000**

---

## 4. Key Application Routes to Verify

| Route | Description |
|---|---|
| `http://localhost:3000/` | Main Landing Page |
| `http://localhost:3000/rover` | Global Macro Monitor (217 countries, 41 indicators) |
| `http://localhost:3000/contributor` | Maharashtra NGO Directory (36 districts, filters, cards/table view) |
| `http://localhost:3000/contributor/ngo/shree-siddhivinayak-temple-trust` | NGO Profile with 4 Data Layers, Fund Flow Graph, and Razorpay donation modal |
| `http://localhost:3000/admin/coverage` | Admin Coverage & Completeness Dashboard (Funnel, stale records, district audit) |
| `http://localhost:3000/admin/donations` | Admin Platform Donations Ledger & Refund Tool |
| `http://localhost:3000/donation-terms` | Public Intermediary Terms & DPDP Act Notice |

---

## 5. Verification Commands

To verify code quality, tests, and production build:

```bash
# 1. Run all 20 unit tests (Fund flow mapper, emergency fixtures, payments HMAC, importer, RBAC)
npm test

# 2. Run ESLint (zero errors/warnings)
npm run lint

# 3. Build Next.js production bundle
npm run build
```

---

## 6. Important Notes & Policies

1. **Zero Fictional Data Rule:**
   No dummy, fictional, or simulated NGOs exist in Contributor. Test fixtures are strictly confined to `tests/fixtures/`.
2. **NGO Darpan Automated Scraping:**
   The official portal `ngodarpan.gov.in` enforces Cloudflare bot protection (HTTP 403). Per our compliance guidelines, automated scraping that violates terms is disabled. Real data is imported via `scripts/import-ngos-csv.ts` from official public documents.
3. **Payments (Razorpay):**
   By default, `PAYMENTS_MODE="test"` operates in simulation mode. Live payment processing requires official board consent documentation, linked bank settlement, and `LIVE_PAYMENTS_CONFIRMED=true`.
