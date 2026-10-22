/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * ETW — Reference Data Seed
 * Seeds: 36 Maharashtra districts (with aliases + adjacency) + NGO categories
 * This is reference/config data, NOT real NGO records.
 * Run: node scripts/seed-reference.cjs
 */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// 36 Maharashtra districts with canonical names, aliases, and adjacency
const DISTRICTS = [
  {
    name: "Ahmednagar",
    aliases: ["Ahilyanagar", "Nagar"],
    adjacentTo: ["Nashik", "Pune", "Solapur", "Beed", "Aurangabad"],
    division: "Pune",
    headquarters: "Ahmednagar"
  },
  {
    name: "Akola",
    aliases: [],
    adjacentTo: ["Buldhana", "Washim", "Amravati", "Hingoli"],
    division: "Amravati",
    headquarters: "Akola"
  },
  {
    name: "Amravati",
    aliases: [],
    adjacentTo: ["Akola", "Washim", "Yavatmal", "Wardha", "Nagpur"],
    division: "Amravati",
    headquarters: "Amravati"
  },
  {
    name: "Aurangabad",
    aliases: ["Chhatrapati Sambhajinagar", "Sambhajinagar"],
    adjacentTo: ["Jalgaon", "Jalna", "Beed", "Ahmednagar", "Nashik"],
    division: "Aurangabad",
    headquarters: "Aurangabad"
  },
  {
    name: "Beed",
    aliases: ["Bid"],
    adjacentTo: ["Aurangabad", "Jalna", "Parbhani", "Latur", "Osmanabad", "Ahmednagar", "Solapur"],
    division: "Aurangabad",
    headquarters: "Beed"
  },
  {
    name: "Bhandara",
    aliases: [],
    adjacentTo: ["Nagpur", "Gondia"],
    division: "Nagpur",
    headquarters: "Bhandara"
  },
  {
    name: "Buldhana",
    aliases: [],
    adjacentTo: ["Jalgaon", "Jalna", "Akola", "Washim"],
    division: "Amravati",
    headquarters: "Buldhana"
  },
  {
    name: "Chandrapur",
    aliases: [],
    adjacentTo: ["Yavatmal", "Wardha", "Nagpur", "Gadchiroli"],
    division: "Nagpur",
    headquarters: "Chandrapur"
  },
  {
    name: "Dhule",
    aliases: [],
    adjacentTo: ["Nashik", "Jalgaon", "Nandurbar"],
    division: "Nashik",
    headquarters: "Dhule"
  },
  {
    name: "Gadchiroli",
    aliases: [],
    adjacentTo: ["Chandrapur", "Gondia"],
    division: "Nagpur",
    headquarters: "Gadchiroli"
  },
  {
    name: "Gondia",
    aliases: [],
    adjacentTo: ["Nagpur", "Bhandara", "Gadchiroli"],
    division: "Nagpur",
    headquarters: "Gondia"
  },
  {
    name: "Hingoli",
    aliases: [],
    adjacentTo: ["Parbhani", "Washim", "Nanded", "Akola"],
    division: "Aurangabad",
    headquarters: "Hingoli"
  },
  {
    name: "Jalgaon",
    aliases: [],
    adjacentTo: ["Dhule", "Nandurbar", "Nashik", "Aurangabad", "Buldhana"],
    division: "Nashik",
    headquarters: "Jalgaon"
  },
  {
    name: "Jalna",
    aliases: [],
    adjacentTo: ["Aurangabad", "Parbhani", "Beed", "Buldhana"],
    division: "Aurangabad",
    headquarters: "Jalna"
  },
  {
    name: "Kolhapur",
    aliases: [],
    adjacentTo: ["Sangli", "Satara", "Ratnagiri", "Sindhudurg"],
    division: "Pune",
    headquarters: "Kolhapur"
  },
  {
    name: "Latur",
    aliases: [],
    adjacentTo: ["Nanded", "Osmanabad", "Beed", "Parbhani"],
    division: "Aurangabad",
    headquarters: "Latur"
  },
  {
    name: "Mumbai City",
    aliases: ["Greater Mumbai", "Bombay", "Mumbai"],
    adjacentTo: ["Mumbai Suburban", "Thane", "Raigad"],
    division: "Konkan",
    headquarters: "Mumbai"
  },
  {
    name: "Mumbai Suburban",
    aliases: ["Mumbai Suburbs"],
    adjacentTo: ["Mumbai City", "Thane", "Raigad", "Palghar"],
    division: "Konkan",
    headquarters: "Mumbai"
  },
  {
    name: "Nagpur",
    aliases: [],
    adjacentTo: ["Amravati", "Wardha", "Chandrapur", "Bhandara", "Gondia"],
    division: "Nagpur",
    headquarters: "Nagpur"
  },
  {
    name: "Nanded",
    aliases: [],
    adjacentTo: ["Parbhani", "Hingoli", "Latur", "Osmanabad", "Yavatmal"],
    division: "Aurangabad",
    headquarters: "Nanded"
  },
  {
    name: "Nandurbar",
    aliases: [],
    adjacentTo: ["Dhule", "Jalgaon"],
    division: "Nashik",
    headquarters: "Nandurbar"
  },
  {
    name: "Nashik",
    aliases: ["Nasik"],
    adjacentTo: ["Dhule", "Jalgaon", "Ahmednagar", "Pune", "Thane", "Palghar", "Aurangabad"],
    division: "Nashik",
    headquarters: "Nashik"
  },
  {
    name: "Osmanabad",
    aliases: ["Dharashiv"],
    adjacentTo: ["Latur", "Nanded", "Solapur", "Beed"],
    division: "Aurangabad",
    headquarters: "Osmanabad"
  },
  {
    name: "Palghar",
    aliases: [],
    adjacentTo: ["Thane", "Nashik", "Mumbai Suburban"],
    division: "Konkan",
    headquarters: "Palghar"
  },
  {
    name: "Parbhani",
    aliases: [],
    adjacentTo: ["Jalna", "Hingoli", "Nanded", "Latur", "Beed"],
    division: "Aurangabad",
    headquarters: "Parbhani"
  },
  {
    name: "Pune",
    aliases: [],
    adjacentTo: ["Raigad", "Nashik", "Ahmednagar", "Solapur", "Satara", "Ratnagiri"],
    division: "Pune",
    headquarters: "Pune"
  },
  {
    name: "Raigad",
    aliases: [],
    adjacentTo: ["Mumbai City", "Mumbai Suburban", "Thane", "Pune", "Ratnagiri"],
    division: "Konkan",
    headquarters: "Alibag"
  },
  {
    name: "Ratnagiri",
    aliases: [],
    adjacentTo: ["Raigad", "Pune", "Satara", "Kolhapur", "Sindhudurg"],
    division: "Konkan",
    headquarters: "Ratnagiri"
  },
  {
    name: "Sangli",
    aliases: [],
    adjacentTo: ["Satara", "Solapur", "Kolhapur"],
    division: "Pune",
    headquarters: "Sangli"
  },
  {
    name: "Satara",
    aliases: [],
    adjacentTo: ["Pune", "Solapur", "Sangli", "Kolhapur", "Ratnagiri"],
    division: "Pune",
    headquarters: "Satara"
  },
  {
    name: "Sindhudurg",
    aliases: [],
    adjacentTo: ["Ratnagiri", "Kolhapur"],
    division: "Konkan",
    headquarters: "Oras (Sindhudurg)"
  },
  {
    name: "Solapur",
    aliases: [],
    adjacentTo: ["Ahmednagar", "Beed", "Osmanabad", "Pune", "Sangli", "Satara"],
    division: "Pune",
    headquarters: "Solapur"
  },
  {
    name: "Thane",
    aliases: [],
    adjacentTo: ["Mumbai City", "Mumbai Suburban", "Raigad", "Palghar", "Nashik"],
    division: "Konkan",
    headquarters: "Thane"
  },
  {
    name: "Wardha",
    aliases: [],
    adjacentTo: ["Amravati", "Yavatmal", "Chandrapur", "Nagpur"],
    division: "Nagpur",
    headquarters: "Wardha"
  },
  {
    name: "Washim",
    aliases: [],
    adjacentTo: ["Akola", "Buldhana", "Hingoli", "Yavatmal", "Amravati"],
    division: "Amravati",
    headquarters: "Washim"
  },
  {
    name: "Yavatmal",
    aliases: [],
    adjacentTo: ["Washim", "Amravati", "Wardha", "Chandrapur", "Nanded"],
    division: "Amravati",
    headquarters: "Yavatmal"
  },
];

const NGO_CATEGORIES = [
  { name: "Health", slug: "health", description: "Healthcare services, medical camps, disease prevention", displayOrder: 1 },
  { name: "Education", slug: "education", description: "Schools, literacy programs, scholarships", displayOrder: 2 },
  { name: "Poverty", slug: "poverty", description: "Livelihood support, microfinance, food security", displayOrder: 3 },
  { name: "Women", slug: "women", description: "Women empowerment, self-help groups, gender equity", displayOrder: 4 },
  { name: "Children", slug: "children", description: "Child welfare, nutrition, protection from abuse", displayOrder: 5 },
  { name: "Disaster relief", slug: "disaster-relief", description: "Emergency response, flood and earthquake relief", displayOrder: 6 },
  { name: "Food", slug: "food", description: "Food distribution, nutrition programs, mid-day meals", displayOrder: 7 },
  { name: "Environment", slug: "environment", description: "Conservation, watershed management, afforestation", displayOrder: 8 },
  { name: "Disability", slug: "disability", description: "Services for persons with disabilities", displayOrder: 9 },
  { name: "Rural development", slug: "rural-development", description: "Village infrastructure, agriculture, tribal welfare", displayOrder: 10 },
  { name: "Religious", slug: "religious", description: "Faith-based organizations with registered charitable activities", displayOrder: 11 },
  { name: "Other", slug: "other", description: "Other registered charitable purposes", displayOrder: 12 },
];

async function main() {
  console.log('🌱 Seeding reference data...\n');

  // Districts
  let distCreated = 0, distUpdated = 0;
  for (const d of DISTRICTS) {
    const existing = await p.district.findUnique({ where: { name: d.name } });
    if (existing) {
      await p.district.update({
        where: { name: d.name },
        data: {
          aliases: JSON.stringify(d.aliases),
          adjacentTo: JSON.stringify(d.adjacentTo),
          division: d.division,
          headquarters: d.headquarters,
        }
      });
      distUpdated++;
    } else {
      await p.district.create({
        data: {
          name: d.name,
          aliases: JSON.stringify(d.aliases),
          adjacentTo: JSON.stringify(d.adjacentTo),
          division: d.division,
          headquarters: d.headquarters,
        }
      });
      distCreated++;
    }
  }
  console.log(`  Districts: ${distCreated} created, ${distUpdated} updated`);

  // NGO Categories
  let catCreated = 0, catUpdated = 0;
  for (const c of NGO_CATEGORIES) {
    const existing = await p.ngoCategory.findUnique({ where: { slug: c.slug } });
    if (existing) {
      await p.ngoCategory.update({ where: { slug: c.slug }, data: c });
      catUpdated++;
    } else {
      await p.ngoCategory.create({ data: c });
      catCreated++;
    }
  }
  console.log(`  NGO Categories: ${catCreated} created, ${catUpdated} updated`);

  const totalDistricts = await p.district.count();
  console.log(`\n✅ Reference data ready: ${totalDistricts} districts, ${await p.ngoCategory.count()} categories`);
  console.log('   Zero NGOs in DB — ready for real data import.');
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => p.$disconnect());
