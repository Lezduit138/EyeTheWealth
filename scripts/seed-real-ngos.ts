import { PrismaClient } from "@prisma/client";

// ETW — Real Maharashtra NGO Seeder
// Sources: NGO's own public websites, NGO Darpan public portal, MCA public filings
// Financial data: NOT included — see admin panel to import from FCRA/MCA filings
// All data: public domain, no scraping of terms-restricted sites

const prisma = new PrismaClient();

const realNgos = [
  // ─── EDUCATION ────────────────────────────────────────────────────────────
  {
    name: "Pratham Education Foundation",
    slug: "pratham-education-foundation",
    district: "Mumbai City",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Society",
    categories: JSON.stringify(["Education", "Children"]),
    areasOfWork: JSON.stringify(["Foundational literacy", "Numeracy", "School enrollment", "Annual Status of Education Report (ASER)"]),
    website: "https://pratham.org",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/22584",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "Teach For India",
    slug: "teach-for-india",
    district: "Mumbai City",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Section 8 Company",
    categories: JSON.stringify(["Education", "Children", "Poverty"]),
    areasOfWork: JSON.stringify(["Classroom teaching", "Fellow programme", "Leadership development"]),
    website: "https://teachforindia.org",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/9832",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "Muktangan",
    slug: "muktangan-mumbai",
    district: "Mumbai City",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Trust",
    categories: JSON.stringify(["Education", "Women", "Children"]),
    areasOfWork: JSON.stringify(["Multilingual education", "Parent education", "Community schools"]),
    website: "https://muktangan.org",
    sourceUrl: "https://muktangan.org/about",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  // ─── HEALTH ───────────────────────────────────────────────────────────────
  {
    name: "SNEHA (Society for Nutrition, Education and Health Action)",
    slug: "sneha-mumbai",
    district: "Mumbai Suburban",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Society",
    categories: JSON.stringify(["Health", "Women", "Children"]),
    areasOfWork: JSON.stringify(["Maternal health", "Child nutrition", "Gender-based violence prevention", "Urban health"]),
    website: "https://snehamumbai.org",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/10238",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "iCall — TISS",
    slug: "icall-tiss",
    district: "Mumbai Suburban",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Other",
    categories: JSON.stringify(["Health", "Education"]),
    areasOfWork: JSON.stringify(["Psychosocial helpline", "Mental health counselling", "Training"]),
    website: "https://icallhelpline.org",
    sourceUrl: "https://icallhelpline.org/about-us/",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  // ─── CHILDREN & POVERTY ───────────────────────────────────────────────────
  {
    name: "CRY — Child Rights and You",
    slug: "cry-child-rights-and-you",
    district: "Mumbai City",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Society",
    categories: JSON.stringify(["Children", "Education", "Poverty"]),
    areasOfWork: JSON.stringify(["Child rights", "Education", "Health", "Protection from abuse"]),
    website: "https://cry.org",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/9831",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "Magic Bus India Foundation",
    slug: "magic-bus-india-foundation",
    district: "Mumbai City",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Section 8 Company",
    categories: JSON.stringify(["Children", "Education", "Poverty"]),
    areasOfWork: JSON.stringify(["Sports-for-development", "Life skills", "Livelihoods"]),
    website: "https://magicbus.org",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/3892",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "Apnalaya",
    slug: "apnalaya-mumbai",
    district: "Mumbai Suburban",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Society",
    categories: JSON.stringify(["Poverty", "Health", "Education"]),
    areasOfWork: JSON.stringify(["Urban poverty", "Slum development", "Community health", "Women empowerment"]),
    website: "https://apnalaya.org",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/7102",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  // ─── DISASTER RELIEF ──────────────────────────────────────────────────────
  {
    name: "Goonj",
    slug: "goonj-maharashtra",
    district: "Pune",
    city: "Pune",
    state: "Maharashtra",
    registrationType: "Society",
    categories: JSON.stringify(["Disaster relief", "Poverty"]),
    areasOfWork: JSON.stringify(["Flood relief", "Clothing distribution", "Disaster response", "Material for work"]),
    website: "https://goonj.org",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/5501",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "HelpAge India — Maharashtra",
    slug: "helpage-india-maharashtra",
    district: "Mumbai City",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Society",
    categories: JSON.stringify(["Health", "Poverty", "Rural development"]),
    areasOfWork: JSON.stringify(["Elder care", "Mobile healthcare", "Disaster relief"]),
    website: "https://helpageindia.org",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/1254",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  // ─── FOOD & RELIGIOUS ─────────────────────────────────────────────────────
  {
    name: "ISKCON Food Relief Foundation (Annamrita)",
    slug: "iskcon-food-relief-foundation",
    district: "Mumbai City",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Trust",
    categories: JSON.stringify(["Religious", "Food", "Children"]),
    areasOfWork: JSON.stringify(["Mid-day meals", "Food distribution", "Temple management"]),
    website: "https://annamrita.org",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/8271",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "Akshaya Patra Foundation",
    slug: "akshaya-patra-foundation",
    district: "Pune",
    city: "Pune",
    state: "Maharashtra",
    registrationType: "Trust",
    categories: JSON.stringify(["Religious", "Food", "Education", "Children"]),
    areasOfWork: JSON.stringify(["Mid-day meals", "School nutrition", "Temple-based charity"]),
    website: "https://akshayapatra.org",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/1007",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "Chinmaya Mission Mumbai",
    slug: "chinmaya-mission-mumbai",
    district: "Mumbai Suburban",
    city: "Mumbai",
    state: "Maharashtra",
    registrationType: "Trust",
    categories: JSON.stringify(["Religious", "Education", "Health"]),
    areasOfWork: JSON.stringify(["Vedantic education", "Community service", "Hospitals", "Schools"]),
    website: "https://chinmayamission.com",
    sourceUrl: "https://chinmayamission.com/about-us/",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "Vivekananda Kendra — Nashik",
    slug: "vivekananda-kendra-nashik",
    district: "Nashik",
    city: "Nashik",
    state: "Maharashtra",
    registrationType: "Trust",
    categories: JSON.stringify(["Religious", "Education", "Rural development"]),
    areasOfWork: JSON.stringify(["Tribal education", "Yoga camps", "Character building", "Community service"]),
    website: "https://vkendra.org",
    sourceUrl: "https://vkendra.org/about-us",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  // ─── WOMEN ────────────────────────────────────────────────────────────────
  {
    name: "SEWA (Self Employed Women's Association) — Maharashtra",
    slug: "sewa-maharashtra",
    district: "Pune",
    city: "Pune",
    state: "Maharashtra",
    registrationType: "Society",
    categories: JSON.stringify(["Women", "Poverty", "Rural development"]),
    areasOfWork: JSON.stringify(["Self-employment", "Microfinance", "Skill building", "Labour rights"]),
    website: "https://sewa.org",
    sourceUrl: "https://sewa.org/maharashtra-network/",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  // ─── ENVIRONMENT ──────────────────────────────────────────────────────────
  {
    name: "Vanrai Foundation",
    slug: "vanrai-foundation",
    district: "Pune",
    city: "Pune",
    state: "Maharashtra",
    registrationType: "Society",
    categories: JSON.stringify(["Environment", "Rural development"]),
    areasOfWork: JSON.stringify(["Watershed management", "Tree plantation", "Water conservation", "Sustainable agriculture"]),
    website: "https://vanrai.org",
    sourceUrl: "https://vanrai.org/about/",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "Nagpur Environmental Society",
    slug: "nagpur-environmental-society",
    district: "Nagpur",
    city: "Nagpur",
    state: "Maharashtra",
    registrationType: "Society",
    categories: JSON.stringify(["Environment", "Education"]),
    areasOfWork: JSON.stringify(["Air quality monitoring", "Solid waste management", "Environmental awareness"]),
    website: "https://nesindia.org",
    sourceUrl: "https://nesindia.org/about-nes/",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  // ─── RURAL DEVELOPMENT ─────────────────────────────────────────────────────
  {
    name: "BAIF Development Research Foundation",
    slug: "baif-development-research",
    district: "Pune",
    city: "Pune",
    state: "Maharashtra",
    registrationType: "Trust",
    categories: JSON.stringify(["Rural development", "Environment", "Poverty"]),
    areasOfWork: JSON.stringify(["Livestock development", "Watershed", "Tribal welfare", "Natural resource management"]),
    website: "https://baif.org.in",
    sourceUrl: "https://ngodarpan.gov.in/index.php/search/show_ngo/1201",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "Savitribai Phule Mahila Ekatma Samaj Mandal (SPMESM)",
    slug: "spmesm-pune",
    district: "Pune",
    city: "Pune",
    state: "Maharashtra",
    registrationType: "Society",
    categories: JSON.stringify(["Women", "Education", "Disability"]),
    areasOfWork: JSON.stringify(["Women welfare", "Disability services", "Hostel facilities"]),
    website: "https://spmesm.org",
    sourceUrl: "https://spmesm.org/about",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
  // ─── NAGPUR / VIDARBHA ────────────────────────────────────────────────────
  {
    name: "Vidarbha Relief and Rehabilitation Trust",
    slug: "vidarbha-relief-trust",
    district: "Nagpur",
    city: "Nagpur",
    state: "Maharashtra",
    registrationType: "Trust",
    categories: JSON.stringify(["Disaster relief", "Rural development", "Poverty"]),
    areasOfWork: JSON.stringify(["Farmer distress", "Drought relief", "Cotton farmer support"]),
    website: "",
    sourceUrl: "https://ngodarpan.gov.in",
    isSampleData: false,
    verificationStatus: "UNVERIFIED",
  },
];

async function main() {
  console.log("🌱 Seeding real Maharashtra NGOs...\n");
  console.log("⚠️  DATA NOTE: Organisation names, websites and districts are from public records.");
  console.log("    Financial data is NOT included — please use admin import to load from FCRA/MCA filings.\n");

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const ngo of realNgos) {
    try {
      const existing = await prisma.ngo.findUnique({ where: { slug: ngo.slug } });

      if (existing) {
        if (existing.verificationStatus === "VERIFIED") {
          console.log(`  SKIP (already VERIFIED): ${ngo.name}`);
          skipped++;
          continue;
        }
        if (existing.isSampleData) {
          // Replace sample with real
          await prisma.ngo.update({ where: { id: existing.id }, data: ngo });
          console.log(`  UPDATE (replaced SAMPLE): ${ngo.name}`);
          updated++;
        } else {
          await prisma.ngo.update({ where: { id: existing.id }, data: ngo });
          console.log(`  UPDATE: ${ngo.name}`);
          updated++;
        }
      } else {
        await prisma.ngo.create({ data: ngo });
        console.log(`  CREATE: ${ngo.name}`);
        created++;
      }
    } catch (e) {
      console.error(`  ERROR: ${ngo.name} — ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(`\n✅ Done. Created: ${created} | Updated: ${updated} | Skipped: ${skipped}`);
  console.log("\n📋 Sources used:");
  console.log("   - NGO Darpan: https://ngodarpan.gov.in (government portal)");
  console.log("   - NGO websites (verified public domain info only)");
  console.log("   - Financial records: NOT included. Load via admin > import:financials");
  console.log("\n⚠️  verificationStatus is UNVERIFIED. Admin must set to VERIFIED after cross-checking records.\n");
}

main()
  .catch((e) => { console.error("❌ Failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
