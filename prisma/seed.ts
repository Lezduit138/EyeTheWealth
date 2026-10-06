// ETW — Prisma Seed Script
// Populates the database with:
// - Categories, Indicators (REAL definitions, no fabricated values)
// - Countries (REAL metadata)
// - Sources (REAL URLs)
// - Sample NGOs (LABELLED SAMPLE DATA — NOT REAL)
// - Illustrative De Basement cases (FICTIONAL ENTITIES — clearly labelled)
// - First admin user (from env vars)
// - ETW Interpretations (editorial analysis, labelled as such)

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ETW database seed...\n");

  // ─── Admin User ────────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@etw.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "AdminPass123!";
  const adminName = process.env.SEED_ADMIN_NAME ?? "ETW Administrator";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        role: "ADMIN",
        passwordHash,
      },
    });
    console.log(`✓ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ Admin user already exists: ${adminEmail}`);
  }

  // ─── Sources ───────────────────────────────────────────────────────────────
  const sources = [
    { name: "World Bank", shortName: "WB", url: "https://data.worldbank.org", description: "World Bank Open Data — free public data", isOfficial: true },
    { name: "International Monetary Fund", shortName: "IMF", url: "https://www.imf.org/en/Data", description: "IMF Data and Statistics", isOfficial: true },
    { name: "World Health Organization", shortName: "WHO", url: "https://www.who.int/data", description: "WHO Global Health Observatory", isOfficial: true },
    { name: "United Nations", shortName: "UN", url: "https://data.un.org", description: "UN Data — UN Statistical databases", isOfficial: true },
    { name: "OECD", shortName: "OECD", url: "https://stats.oecd.org", description: "OECD.Stat — Organisation for Economic Co-operation and Development", isOfficial: true },
    { name: "NITI Aayog NGO Darpan", shortName: "NGO Darpan", url: "https://ngodarpan.gov.in", description: "Government of India NGO registration portal", isOfficial: true },
    { name: "Ministry of Corporate Affairs", shortName: "MCA", url: "https://www.mca.gov.in", description: "MCA CSR filings and company data", isOfficial: true },
    { name: "FCRA Online", shortName: "FCRA", url: "https://fcraonline.nic.in", description: "Foreign Contribution Regulation Act portal, MHA", isOfficial: true },
    { name: "GDACS", shortName: "GDACS", url: "https://www.gdacs.org", description: "Global Disaster Alert and Coordination System", isOfficial: false },
    { name: "ReliefWeb", shortName: "ReliefWeb", url: "https://reliefweb.int", description: "UN OCHA humanitarian information service", isOfficial: false },
    { name: "NDMA SACHET", shortName: "NDMA", url: "https://sachet.ndma.gov.in", description: "National Disaster Management Authority — SACHET alert system", isOfficial: true },
  ];

  for (const src of sources) {
    await prisma.source.upsert({
      where: { name: src.name },
      create: src,
      update: { url: src.url, description: src.description },
    });
  }
  console.log(`✓ ${sources.length} sources created`);

  // ─── Categories ────────────────────────────────────────────────────────────
  const categories = [
    { name: "Economy", slug: "economy", description: "GDP, growth, government debt, and trade", displayOrder: 1 },
    { name: "Income & Wealth", slug: "income-wealth", description: "Income levels, wealth distribution, and billionaire data", displayOrder: 2 },
    { name: "Poverty & Inequality", slug: "poverty-inequality", description: "Poverty rates, Gini coefficient, and income shares", displayOrder: 3 },
    { name: "Health", slug: "health", description: "Life expectancy, mortality rates, and health expenditure", displayOrder: 4 },
    { name: "Education", slug: "education", description: "Literacy, school enrollment, and education expenditure", displayOrder: 5 },
    { name: "Employment", slug: "employment", description: "Unemployment, labour-force participation, and wages", displayOrder: 6 },
    { name: "Population", slug: "population", description: "Population, growth rates, and demographics", displayOrder: 7 },
    { name: "Living Standards", slug: "living-standards", description: "Access to services, infrastructure, and quality of life", displayOrder: 8 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { description: cat.description, displayOrder: cat.displayOrder },
    });
    categoryMap[cat.slug] = c.id;
  }
  console.log(`✓ ${categories.length} categories created`);

  // ─── Indicators ────────────────────────────────────────────────────────────
  // All definitions from World Bank / official sources. No fabricated definitions.
  const indicators = [
    // Economy
    {
      name: "GDP (Current USD)",
      slug: "gdp-current-usd",
      category: "economy",
      definition: "Gross domestic product at purchaser's prices is the sum of gross value added by all resident producers in the economy plus any product taxes and minus any subsidies not included in the value of the products.",
      methodology: "Uses expenditure approach: GDP = Private Consumption + Gross Investment + Government Spending + (Exports − Imports). Data in current USD using official exchange rates.",
      unit: "USD",
      worldBankCode: "NY.GDP.MKTP.CD",
      displayOrder: 1,
    },
    {
      name: "GDP per Capita (Current USD)",
      slug: "gdp-per-capita-usd",
      category: "economy",
      definition: "GDP divided by midyear population. GDP is the sum of gross value added by all resident producers plus product taxes minus subsidies.",
      methodology: "Derived by dividing GDP (current USD) by total midyear population.",
      unit: "USD",
      worldBankCode: "NY.GDP.PCAP.CD",
      displayOrder: 2,
    },
    {
      name: "GDP Growth (Annual %)",
      slug: "gdp-growth-annual",
      category: "economy",
      definition: "Annual percentage growth rate of GDP at market prices based on constant local currency.",
      methodology: "Calculated as the percentage change in real GDP from one year to the next.",
      unit: "% per year",
      worldBankCode: "NY.GDP.MKTP.KD.ZG",
      displayOrder: 3,
    },
    {
      name: "Inflation (Consumer Prices, Annual %)",
      slug: "inflation-consumer-prices",
      category: "economy",
      definition: "Inflation as measured by the consumer price index reflects the annual percentage change in the cost to the average consumer of acquiring a basket of goods and services.",
      methodology: "Based on CPI data reported by national statistical agencies, compiled by World Bank.",
      unit: "% per year",
      worldBankCode: "FP.CPI.TOTL.ZG",
      displayOrder: 4,
    },
    {
      name: "General Government Debt (% of GDP)",
      slug: "government-debt-gdp",
      category: "economy",
      definition: "Gross government debt as a percentage of GDP. Includes all liabilities that require future payment of interest or principal.",
      methodology: "IMF Government Finance Statistics (GFS) methodology. Compiled from national accounts and fiscal reports.",
      unit: "% of GDP",
      imfCode: "GGXWDG_NGDP",
      displayOrder: 5,
    },
    // Income & Wealth
    {
      name: "GNI per Capita (Atlas Method, Current USD)",
      slug: "gni-per-capita-atlas",
      category: "income-wealth",
      definition: "GNI per capita is gross national income, converted to US dollars using the World Bank Atlas method, divided by midyear population.",
      methodology: "World Bank Atlas method converts GNI to USD using a three-year average of exchange rates adjusted for inflation differences.",
      unit: "USD",
      worldBankCode: "NY.GNP.PCAP.CD",
      displayOrder: 1,
    },
    {
      name: "Number of Billionaires",
      slug: "billionaires-count",
      category: "income-wealth",
      definition: "Number of individuals with net worth exceeding USD 1 billion, as tracked by Forbes and other wealth monitoring sources.",
      methodology: "Based on Forbes World Billionaires List (annual) and Bloomberg Billionaires Index. Net worth is estimated using publicly available market data, asset valuations, and company ownership. Estimates, not verified totals.",
      unit: "individuals",
      isWealth: true,
      displayOrder: 2,
    },
    {
      name: "Total Billionaire Wealth (USD)",
      slug: "billionaires-total-wealth",
      category: "income-wealth",
      definition: "Aggregate estimated net worth of all billionaires in a country.",
      methodology: "Sum of Forbes-estimated individual net worths. All figures are estimates. See README for data sources that must be manually populated.",
      unit: "USD",
      isWealth: true,
      displayOrder: 3,
    },
    {
      name: "Wealth per Adult (Mean, USD)",
      slug: "wealth-per-adult-mean",
      category: "income-wealth",
      definition: "Mean (average) total wealth per adult, including financial assets, real estate, and other assets, minus debts.",
      methodology: "UBS/Credit Suisse Global Wealth Report methodology. Wealth = financial assets + non-financial assets (property, business equity) - debts. Exchange rates at year-end.",
      unit: "USD",
      isWealth: true,
      displayOrder: 4,
    },
    // Poverty & Inequality
    {
      name: "Poverty Headcount Ratio (< $2.15/day, % of population)",
      slug: "poverty-headcount-215",
      category: "poverty-inequality",
      definition: "Percentage of the population living on less than $2.15 a day at 2017 international prices (World Bank extreme poverty line).",
      methodology: "Derived from household surveys and aligned with the World Bank PovcalNet/Poverty and Inequality Platform. Uses purchasing power parity (PPP) conversions.",
      unit: "% of population",
      worldBankCode: "SI.POV.DDAY",
      displayOrder: 1,
    },
    {
      name: "Gini Coefficient",
      slug: "gini-coefficient",
      category: "poverty-inequality",
      definition: "The Gini index measures the extent to which the distribution of income among individuals or households within an economy deviates from a perfectly equal distribution. 0 = perfect equality, 100 = perfect inequality.",
      methodology: "Derived from household expenditure/income surveys. Based on World Bank's PovcalNet methodology using grouped or unit-record data.",
      unit: "Index (0-100)",
      worldBankCode: "SI.POV.GINI",
      displayOrder: 2,
    },
    {
      name: "Income Share of Top 10%",
      slug: "income-share-top10",
      category: "poverty-inequality",
      definition: "Percentage of total income accruing to the top 10% of income earners.",
      methodology: "Derived from household surveys (income/expenditure). Based on World Bank methodology. Survey years vary by country.",
      unit: "% of income",
      worldBankCode: "SI.DST.10TH.10",
      displayOrder: 3,
    },
    {
      name: "Income Share of Bottom 20%",
      slug: "income-share-bottom20",
      category: "poverty-inequality",
      definition: "Percentage of total income accruing to the bottom 20% (poorest quintile) of income earners.",
      methodology: "Derived from household surveys. Based on World Bank methodology. Survey years vary by country.",
      unit: "% of income",
      worldBankCode: "SI.DST.FRST.20",
      displayOrder: 4,
    },
    // Health
    {
      name: "Life Expectancy at Birth (Years)",
      slug: "life-expectancy-birth",
      category: "health",
      definition: "Life expectancy at birth indicates the number of years a newborn infant would live if prevailing patterns of mortality at the time of its birth were to stay the same throughout its life.",
      methodology: "Calculated from age-specific mortality rates. Compiled from national civil registration systems, censuses, and surveys by WHO and UN.",
      unit: "years",
      worldBankCode: "SP.DYN.LE00.IN",
      displayOrder: 1,
    },
    {
      name: "Infant Mortality Rate (per 1,000 live births)",
      slug: "infant-mortality-rate",
      category: "health",
      definition: "Number of infants dying before reaching one year of age, per 1,000 live births in a given year.",
      methodology: "Compiled from civil registration data supplemented by sample surveys, censuses. Uses UN IGME methodology where registration is incomplete.",
      unit: "per 1,000 live births",
      worldBankCode: "SP.DYN.IMRT.IN",
      displayOrder: 2,
    },
    {
      name: "Maternal Mortality Ratio (per 100,000 live births)",
      slug: "maternal-mortality-ratio",
      category: "health",
      definition: "Number of women who die from pregnancy-related causes while pregnant or within 42 days of termination of pregnancy, per 100,000 live births.",
      methodology: "WHO/UNICEF/UNFPA/World Bank joint estimates. Uses Bayesian model to combine data from civil registration, surveys, and censuses.",
      unit: "per 100,000 live births",
      worldBankCode: "SH.STA.MMRT",
      displayOrder: 3,
    },
    {
      name: "Current Health Expenditure (% of GDP)",
      slug: "health-expenditure-gdp",
      category: "health",
      definition: "Level of current health expenditure expressed as a percentage of GDP. It includes government, compulsory, voluntary, and out-of-pocket payments, but not capital health expenditures.",
      methodology: "WHO Global Health Expenditure Database. Compiled from national health accounts and financial records.",
      unit: "% of GDP",
      worldBankCode: "SH.XPD.CHEX.GD.ZS",
      displayOrder: 4,
    },
    // Education
    {
      name: "Adult Literacy Rate (% of population 15+)",
      slug: "adult-literacy-rate",
      category: "education",
      definition: "Percentage of people ages 15 and above who can both read and write with understanding a short simple statement about their everyday life.",
      methodology: "Based on national literacy surveys and population censuses. UNESCO Institute for Statistics compilation.",
      unit: "% of population 15+",
      worldBankCode: "SE.ADT.LITR.ZS",
      displayOrder: 1,
    },
    {
      name: "School Enrollment, Primary (% gross)",
      slug: "school-enrollment-primary",
      category: "education",
      definition: "Ratio of total enrollment, regardless of age, to the population of the age group that officially corresponds to the level of education shown.",
      methodology: "UNESCO UIS data. Gross enrollment includes students outside the official age group.",
      unit: "% gross",
      worldBankCode: "SE.PRM.ENRR",
      displayOrder: 2,
    },
    {
      name: "Government Expenditure on Education (% of GDP)",
      slug: "education-expenditure-gdp",
      category: "education",
      definition: "General government expenditure on education (current, capital, and transfers) as a percentage of GDP.",
      methodology: "UNESCO UIS data. Government expenditure includes spending by all levels of government (federal, state, and local).",
      unit: "% of GDP",
      worldBankCode: "SE.XPD.TOTL.GD.ZS",
      displayOrder: 3,
    },
    // Employment
    {
      name: "Unemployment Rate (% of labour force)",
      slug: "unemployment-rate",
      category: "employment",
      definition: "Share of the labor force that is without work but available for and seeking employment.",
      methodology: "ILO harmonized estimates based on national labour force surveys. Modelled estimates used where surveys are unavailable.",
      unit: "% of labour force",
      worldBankCode: "SL.UEM.TOTL.ZS",
      displayOrder: 1,
    },
    {
      name: "Labour Force Participation Rate (% of population 15+)",
      slug: "labour-force-participation",
      category: "employment",
      definition: "Proportion of the working-age population (15+) that engages actively in the labour market, either by working or looking for work.",
      methodology: "ILO modelled estimates. Based on national labour force surveys supplemented by statistical modelling.",
      unit: "% of population 15+",
      worldBankCode: "SL.TLF.ACTI.ZS",
      displayOrder: 2,
    },
    // Population
    {
      name: "Total Population",
      slug: "total-population",
      category: "population",
      definition: "Total population based on the de facto definition of population, which counts all residents regardless of legal status or citizenship.",
      methodology: "UN Population Division estimates based on national censuses, surveys, and administrative data. Midyear estimates.",
      unit: "persons",
      worldBankCode: "SP.POP.TOTL",
      displayOrder: 1,
    },
    {
      name: "Population Growth (Annual %)",
      slug: "population-growth-annual",
      category: "population",
      definition: "Annual population growth rate for year t is the exponential rate of growth of midyear population from year t-1 to t.",
      methodology: "Calculated from UN Population Division estimates.",
      unit: "% per year",
      worldBankCode: "SP.POP.GROW",
      displayOrder: 2,
    },
    {
      name: "Urban Population (% of total)",
      slug: "urban-population-pct",
      category: "population",
      definition: "Urban population refers to people living in urban areas as defined by national statistical offices.",
      methodology: "UN World Urbanization Prospects. Definitions of urban areas vary by country.",
      unit: "% of total",
      worldBankCode: "SP.URB.TOTL.IN.ZS",
      displayOrder: 3,
    },
  ];

  const indicatorMap: Record<string, string> = {};
  for (const ind of indicators) {
    const { category, ...rest } = ind;
    const categoryId = categoryMap[category];
    if (!categoryId) continue;
    const created = await prisma.indicator.upsert({
      where: { slug: rest.slug },
      create: { ...rest, categoryId },
      update: { name: rest.name, definition: rest.definition, methodology: rest.methodology ?? null, unit: rest.unit },
    });
    indicatorMap[rest.slug] = created.id;
  }
  console.log(`✓ ${indicators.length} indicators created`);

  // ─── Countries ─────────────────────────────────────────────────────────────
  const countries = [
    { code: "IND", code2: "IN", name: "India", region: "South Asia", incomeLevel: "Lower middle income", capitalCity: "New Delhi", flagEmoji: "🇮🇳" },
    { code: "USA", code2: "US", name: "United States", region: "North America", incomeLevel: "High income", capitalCity: "Washington D.C.", flagEmoji: "🇺🇸" },
    { code: "CHN", code2: "CN", name: "China", region: "East Asia & Pacific", incomeLevel: "Upper middle income", capitalCity: "Beijing", flagEmoji: "🇨🇳" },
    { code: "GBR", code2: "GB", name: "United Kingdom", region: "Europe & Central Asia", incomeLevel: "High income", capitalCity: "London", flagEmoji: "🇬🇧" },
    { code: "DEU", code2: "DE", name: "Germany", region: "Europe & Central Asia", incomeLevel: "High income", capitalCity: "Berlin", flagEmoji: "🇩🇪" },
    { code: "BRA", code2: "BR", name: "Brazil", region: "Latin America & Caribbean", incomeLevel: "Upper middle income", capitalCity: "Brasilia", flagEmoji: "🇧🇷" },
    { code: "JPN", code2: "JP", name: "Japan", region: "East Asia & Pacific", incomeLevel: "High income", capitalCity: "Tokyo", flagEmoji: "🇯🇵" },
    { code: "NGA", code2: "NG", name: "Nigeria", region: "Sub-Saharan Africa", incomeLevel: "Lower middle income", capitalCity: "Abuja", flagEmoji: "🇳🇬" },
  ];

  const countryMap: Record<string, string> = {};
  for (const c of countries) {
    const created = await prisma.country.upsert({
      where: { code: c.code },
      create: c,
      update: { name: c.name, region: c.region, incomeLevel: c.incomeLevel },
    });
    countryMap[c.code] = created.id;
  }
  console.log(`✓ ${countries.length} countries created`);

  // ─── ETW Interpretations ───────────────────────────────────────────────────
  // These are ETW editorial analysis — clearly labelled, not official statistics.
  const interpretations = [
    {
      slug: "gdp-per-capita-usd",
      text: "GDP per capita is one of the most widely cited economic measures, but it has significant limitations as a welfare indicator. It reflects the average output per person, not how income is distributed. A country with high GDP per capita can still have large portions of its population living in poverty if wealth is concentrated. ETW cross-references GDP per capita with Gini coefficient and poverty headcount data to provide a more complete picture.",
      factors: JSON.stringify([
        "Labour productivity and technological capacity",
        "Employment rate and workforce participation",
        "Industrial composition (services vs manufacturing vs agriculture)",
        "Trade balance and export competitiveness",
        "Population size (denominator effect)",
        "Government spending and fiscal policy",
        "Inflation and currency exchange rates used for USD conversion",
        "Natural resource endowments",
      ]),
    },
    {
      slug: "gini-coefficient",
      text: "The Gini coefficient captures income inequality within a country on a 0–100 scale, but it does not identify who is wealthy or who is poor — only the dispersion of incomes. Two countries can have the same Gini while having very different poverty rates. Gini data is also limited by survey quality: household surveys typically undercount top incomes and financial wealth. ETW notes these limitations alongside the data.",
      factors: JSON.stringify([
        "Tax policy and redistribution mechanisms",
        "Labour market structure (formal vs informal sector size)",
        "Education access and returns to education",
        "Regional disparities within the country",
        "Historical land and asset ownership patterns",
        "Social transfers (welfare, pensions, subsidies)",
        "Survey quality and coverage of top incomes",
      ]),
    },
  ];

  for (const interp of interpretations) {
    const { slug, text, factors } = interp;
    const indicatorId = indicatorMap[slug];
    if (!indicatorId) continue;
    await prisma.etwInterpretation.upsert({
      where: { id: `interp-${slug}` },
      create: { id: `interp-${slug}`, indicatorId, text, factors },
      update: { text, factors },
    });
  }
  console.log(`✓ ${interpretations.length} ETW interpretations created`);

  // ─── Sample NGOs ───────────────────────────────────────────────────────────
  // ALL clearly marked isSampleData: true — NEVER real data
  const sampleNgos = [
    {
      name: "Sample Rural Health Foundation",
      slug: "sample-rural-health-foundation",
      district: "Nashik",
      city: "Nashik",
      categories: JSON.stringify(["Health", "Rural development"]),
      areasOfWork: JSON.stringify(["Primary healthcare", "Maternal health", "Nutrition"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Education Trust Maharashtra",
      slug: "sample-education-trust-maha",
      district: "Pune",
      city: "Pune",
      categories: JSON.stringify(["Education", "Children"]),
      areasOfWork: JSON.stringify(["School infrastructure", "Scholarship", "Teacher training"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Disaster Relief Network",
      slug: "sample-disaster-relief-network",
      district: "Kolhapur",
      city: "Kolhapur",
      categories: JSON.stringify(["Disaster relief", "Food"]),
      areasOfWork: JSON.stringify(["Flood relief", "Emergency food distribution", "Shelter"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Women Empowerment Collective",
      slug: "sample-women-empowerment-collective",
      district: "Nagpur",
      city: "Nagpur",
      categories: JSON.stringify(["Women", "Poverty"]),
      areasOfWork: JSON.stringify(["Microfinance", "Skill development", "Legal aid"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
  ];

  for (const ngo of sampleNgos) {
    await prisma.ngo.upsert({
      where: { slug: ngo.slug },
      create: ngo,
      update: { isSampleData: true },
    });
  }
  console.log(`✓ ${sampleNgos.length} SAMPLE NGOs created (clearly labelled as not real)`);

  // ─── De Basement — Illustrative Cases (FICTIONAL) ─────────────────────────
  // ALL fictional entities, ALL labelled ILLUSTRATIVE. No real people or companies.
  const illustrativeCases = [
    {
      slug: "illustrative-holding-structure-alpha",
      title: "Illustrative: Multi-Tier Holding Company Structure",
      subtitle: "How layered ownership can limit public traceability",
      status: "ILLUSTRATIVE",
      legalMechanism: "A parent company in a low-disclosure jurisdiction holds shares in intermediate holding companies, which in turn hold operating entities. Each tier is a separate legal person. Dividend and loan flows between entities may not require full public disclosure.",
      transparencyGap: "In this illustrative structure, publicly available records (company filings) show ownership at the immediate parent level. The ultimate beneficial owner may be disclosed in some jurisdictions but not others. Inter-company loans and management fees between related entities are typically reported only as line items in consolidated accounts, with details not publicly accessible.",
      whatIsKnown: JSON.stringify([
        "Fictional Company Alpha Ltd is registered in Jurisdiction X (illustrative)",
        "Fictional Holdings Beta is listed as the shareholder in public filings",
        "Annual reports show inter-company transactions totalling a fictitious amount",
        "Auditors have certified the consolidated accounts",
      ]),
      whatCannotBeEstablished: JSON.stringify([
        "The identity of the ultimate beneficial owners beyond the holding company layer (in this illustrative example)",
        "The basis for inter-company transfer pricing",
        "Whether dividends flowed to natural persons and who those persons are",
        "The purpose of intra-group loans — whether arms-length or related-party",
      ]),
      educationalDisclaimer: "This case uses entirely fictional entities and amounts. It is designed to illustrate a general structure type, not to describe any real company or transaction. No accusations are made or implied.",
      isSampleData: true,
    },
    {
      slug: "illustrative-trust-structure-beta",
      title: "Illustrative: Discretionary Trust and Asset Holding",
      subtitle: "Why trust structures create legitimate traceability challenges",
      status: "ILLUSTRATIVE",
      legalMechanism: "A discretionary trust holds assets (property, shares, or other investments) for the benefit of a class of beneficiaries. The trustee has discretion over distributions. Because beneficiaries are defined as a class rather than individuals, public records may only show the trustee.",
      transparencyGap: "Trust deeds in many jurisdictions are not public documents. The register of trusts (where one exists) may record the trustee but not beneficiaries. Assets held in trust are not in the personal name of beneficiaries, making wealth attribution from public records alone impossible.",
      whatIsKnown: JSON.stringify([
        "A trust named 'Fictional Trust Gamma' (illustrative) is the registered holder of certain assets in public land/company records",
        "The appointed trustee is a registered corporate trustee (illustrative entity)",
        "No court order or regulatory disclosure has been triggered that would make beneficiaries public",
      ]),
      whatCannotBeEstablished: JSON.stringify([
        "The identity of beneficiaries from publicly available records",
        "The total value of assets held in trust from public sources",
        "Historical distributions made to beneficiaries",
        "Who the settlor of the trust was",
      ]),
      educationalDisclaimer: "This case uses entirely fictional entities. It explains why discretionary trusts create information gaps in public records — not how to exploit such gaps. This is an educational illustration only.",
      isSampleData: true,
    },
    {
      slug: "illustrative-cross-border-donations",
      title: "Illustrative: Cross-Border Donations and FCRA Compliance Gaps",
      subtitle: "Traceability of foreign contributions through NGO chains",
      status: "ILLUSTRATIVE",
      legalMechanism: "Foreign contributions to Indian NGOs are governed by FCRA. Registered entities must disclose foreign contributions in annual returns. However, where a domestic NGO passes funds to a sub-grantee, the sub-grantee's disclosure may be less complete. Multiple hop structures can reduce the traceability of original funding sources.",
      transparencyGap: "FCRA filings show the direct recipient and the foreign source. However, sub-grants to unregistered community organisations, or grants to entities with delayed/missing filings, create gaps in the public record of ultimate utilisation.",
      whatIsKnown: JSON.stringify([
        "Fictional NGO Delta (illustrative) received a foreign contribution and filed an FCRA return",
        "The FCRA return lists the foreign donor organisation",
        "A portion of funds was reported as passed to 'sub-grantees' in aggregate",
      ]),
      whatCannotBeEstablished: JSON.stringify([
        "The identity of each sub-grantee from the FCRA return alone",
        "How sub-grantees utilised funds, from public records",
        "Whether sub-grantees filed their own FCRA returns (if required)",
        "The purpose of each sub-grant at the project level",
      ]),
      educationalDisclaimer: "This is a fictional, educational example. It does not describe any real NGO or transaction. It is designed to explain structural gaps in FCRA disclosure, not to suggest wrongdoing by any entity.",
      isSampleData: true,
    },
  ];

  for (const c of illustrativeCases) {
    await prisma.case.upsert({
      where: { slug: c.slug },
      create: c,
      update: { title: c.title, status: c.status },
    });
  }
  console.log(`✓ ${illustrativeCases.length} ILLUSTRATIVE (HYPOTHETICAL) De Basement cases created`);

  console.log("\n✅ Seed complete.\n");
  console.log("⚠  DATA NOTES:");
  console.log("   - NGO data: SAMPLE, NOT REAL. Use admin import tools to load verified data.");
  console.log("   - De Basement cases: FICTIONAL. Real cases need your manual verification + legal review.");
  console.log("   - Indicators marked isWealth=true need manual data entry (see README).");
  console.log("   - DataPoints for indicators are empty — run npm run ingest:worldbank to fetch real data.\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
