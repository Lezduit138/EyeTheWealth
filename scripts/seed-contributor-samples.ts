import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Contributor Module Samples...");

  const sampleNgos = [
    {
      name: "Sample Religious Trust Maharashtra",
      slug: "sample-religious-trust-maha",
      district: "Nashik",
      city: "Nashik",
      categories: JSON.stringify(["Religious", "Food"]),
      areasOfWork: JSON.stringify(["Temple management", "Free meals", "Pilgrimage support"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Disaster Relief Network",
      slug: "sample-disaster-relief-network",
      district: "Kolhapur",
      city: "Kolhapur",
      categories: JSON.stringify(["Disaster relief", "Health"]),
      areasOfWork: JSON.stringify(["Flood relief", "Emergency food distribution"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Education Trust Pune",
      slug: "sample-education-trust-pune",
      district: "Pune",
      city: "Pune",
      categories: JSON.stringify(["Education", "Children"]),
      areasOfWork: JSON.stringify(["School infrastructure", "Scholarships"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Rural Development Society",
      slug: "sample-rural-development-society",
      district: "Gadchiroli",
      city: "Gadchiroli",
      categories: JSON.stringify(["Rural development", "Environment"]),
      areasOfWork: JSON.stringify(["Water conservation", "Farming techniques"]),
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
      areasOfWork: JSON.stringify(["Microfinance", "Skill development"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Coastal Conservation Foundation",
      slug: "sample-coastal-conservation",
      district: "Sindhudurg",
      city: "Malvan",
      categories: JSON.stringify(["Environment", "Rural development"]),
      areasOfWork: JSON.stringify(["Mangrove restoration", "Fisheries"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Urban Health Initiative",
      slug: "sample-urban-health-initiative",
      district: "Mumbai City",
      city: "Mumbai",
      categories: JSON.stringify(["Health", "Poverty"]),
      areasOfWork: JSON.stringify(["Slum clinics", "Sanitation"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Disability Support Group",
      slug: "sample-disability-support-group",
      district: "Thane",
      city: "Thane",
      categories: JSON.stringify(["Disability", "Education"]),
      areasOfWork: JSON.stringify(["Vocational training", "Assistive devices"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Orphanage Care Trust",
      slug: "sample-orphanage-care-trust",
      district: "Aurangabad",
      city: "Aurangabad",
      categories: JSON.stringify(["Children", "Poverty"]),
      areasOfWork: JSON.stringify(["Housing", "Primary education"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Animal Welfare Society",
      slug: "sample-animal-welfare-society",
      district: "Pune",
      city: "Pune",
      categories: JSON.stringify(["Environment", "Other"]),
      areasOfWork: JSON.stringify(["Stray care", "Vaccinations"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Drought Relief Mission",
      slug: "sample-drought-relief-mission",
      district: "Latur",
      city: "Latur",
      categories: JSON.stringify(["Disaster relief", "Rural development"]),
      areasOfWork: JSON.stringify(["Water tankers", "Fodder camps"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    },
    {
      name: "Sample Heritage Trust",
      slug: "sample-heritage-trust",
      district: "Kolhapur",
      city: "Kolhapur",
      categories: JSON.stringify(["Religious", "Other"]),
      areasOfWork: JSON.stringify(["Temple restoration", "Cultural events"]),
      isActive: true,
      isSampleData: true,
      verificationStatus: "SAMPLE",
    }
  ];

  for (const ngo of sampleNgos) {
    const createdNgo = await prisma.ngo.upsert({
      where: { slug: ngo.slug },
      create: ngo,
      update: { 
        categories: ngo.categories,
        areasOfWork: ngo.areasOfWork,
        district: ngo.district
      },
    });

    // Create 3 years of financials
    for (const year of ["2020-21", "2021-22", "2022-23"]) {
      const baseIncome = Math.floor(Math.random() * 50000000) + 10000000;
      await prisma.ngoFinancialYear.upsert({
        where: { id: `fy-${createdNgo.id}-${year}` },
        create: {
          id: `fy-${createdNgo.id}-${year}`,
          ngoId: createdNgo.id,
          financialYear: year,
          totalIncome: baseIncome,
          totalExpenditure: baseIncome * 0.9,
          donations: baseIncome * 0.4,
          grants: baseIncome * 0.3,
          isSampleData: true,
          verificationStatus: "SAMPLE",
        },
        update: {}
      });
    }

    // Create some transactions
    await prisma.transaction.upsert({
      where: { id: `tx-1-${createdNgo.id}` },
      create: {
        id: `tx-1-${createdNgo.id}`,
        ngoId: createdNgo.id,
        date: new Date("2023-01-15"),
        amount: Math.floor(Math.random() * 5000000) + 500000,
        senderName: "Sample Corporate CSR Fund",
        senderType: "Corporate",
        transactionType: "CSR",
        isSampleData: true,
        verificationStatus: "SAMPLE"
      },
      update: {}
    });

    await prisma.transaction.upsert({
      where: { id: `tx-2-${createdNgo.id}` },
      create: {
        id: `tx-2-${createdNgo.id}`,
        ngoId: createdNgo.id,
        date: new Date("2022-08-22"),
        amount: Math.floor(Math.random() * 10000000) + 1000000,
        senderName: ngo.categories.includes("Religious") ? "Anonymous Devotees" : "Sample International Foundation",
        senderType: ngo.categories.includes("Religious") ? "Individual" : "Foreign",
        transactionType: ngo.categories.includes("Religious") ? "Donation" : "FCRA",
        isSampleData: true,
        verificationStatus: "SAMPLE"
      },
      update: {}
    });
  }

  console.log(`✓ ${sampleNgos.length} NGOs seeded with financials and transactions`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
