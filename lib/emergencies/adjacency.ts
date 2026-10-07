// ETW — Maharashtra District Adjacency Table
// Used for Tier 2 NGO matching: NGOs in neighbouring districts to an affected district
// ⚠️ FLAG FOR MANUAL VERIFICATION — adjacency is based on geographic proximity.
// Please cross-check with official Maharashtra district maps before deploying to production.

export const DISTRICT_ADJACENCY: Record<string, string[]> = {
  "Mumbai City":      ["Mumbai Suburban", "Thane", "Raigad"],
  "Mumbai Suburban":  ["Mumbai City", "Thane", "Raigad", "Palghar"],
  "Thane":            ["Mumbai City", "Mumbai Suburban", "Raigad", "Palghar", "Nashik"],
  "Palghar":          ["Thane", "Nashik", "Raigad"],
  "Raigad":           ["Mumbai City", "Mumbai Suburban", "Thane", "Pune", "Ratnagiri"],
  "Ratnagiri":        ["Raigad", "Pune", "Satara", "Kolhapur", "Sindhudurg"],
  "Sindhudurg":       ["Ratnagiri", "Kolhapur"],
  "Nashik":           ["Dhule", "Jalgaon", "Ahmednagar", "Pune", "Thane", "Palghar"],
  "Dhule":            ["Nashik", "Jalgaon", "Nandurbar"],
  "Nandurbar":        ["Dhule", "Jalgaon"],
  "Jalgaon":          ["Dhule", "Nandurbar", "Nashik", "Aurangabad", "Buldhana"],
  "Aurangabad":       ["Jalgaon", "Jalna", "Beed", "Ahmednagar", "Nashik"],
  "Jalna":            ["Aurangabad", "Parbhani", "Beed", "Buldhana"],
  "Parbhani":         ["Jalna", "Hingoli", "Nanded", "Latur", "Beed"],
  "Hingoli":          ["Parbhani", "Washim", "Nanded", "Akola"],
  "Nanded":           ["Parbhani", "Hingoli", "Latur", "Osmanabad", "Yavatmal"],
  "Latur":            ["Nanded", "Osmanabad", "Beed", "Parbhani"],
  "Osmanabad":        ["Latur", "Nanded", "Solapur", "Beed"],
  "Beed":             ["Aurangabad", "Jalna", "Parbhani", "Latur", "Osmanabad", "Ahmednagar", "Solapur"],
  "Ahmednagar":       ["Nashik", "Aurangabad", "Beed", "Solapur", "Pune"],
  "Solapur":          ["Ahmednagar", "Beed", "Osmanabad", "Pune", "Sangli", "Satara"],
  "Pune":             ["Raigad", "Nashik", "Ahmednagar", "Solapur", "Satara", "Ratnagiri"],
  "Satara":           ["Pune", "Solapur", "Sangli", "Kolhapur", "Ratnagiri"],
  "Sangli":           ["Satara", "Solapur", "Kolhapur"],
  "Kolhapur":         ["Sangli", "Satara", "Ratnagiri", "Sindhudurg"],
  "Buldhana":         ["Jalgaon", "Jalna", "Akola", "Washim"],
  "Akola":            ["Buldhana", "Washim", "Amravati", "Hingoli"],
  "Washim":           ["Akola", "Buldhana", "Hingoli", "Yavatmal", "Amravati"],
  "Amravati":         ["Akola", "Washim", "Yavatmal", "Wardha", "Nagpur"],
  "Yavatmal":         ["Washim", "Amravati", "Wardha", "Chandrapur", "Nanded"],
  "Wardha":           ["Amravati", "Yavatmal", "Chandrapur", "Nagpur"],
  "Nagpur":           ["Amravati", "Wardha", "Chandrapur", "Bhandara", "Gondia"],
  "Chandrapur":       ["Yavatmal", "Wardha", "Nagpur", "Gadchiroli"],
  "Gadchiroli":       ["Chandrapur", "Gondia"],
  "Gondia":           ["Nagpur", "Bhandara", "Gadchiroli"],
  "Bhandara":         ["Nagpur", "Gondia"],
};

/**
 * Get all districts neighbouring the given list of affected districts.
 * Returns an array of unique districts not in the already-affected set.
 */
export function getNeighbouringDistricts(affectedDistricts: string[]): string[] {
  const affectedSet = new Set(affectedDistricts);
  const neighbours = new Set<string>();

  for (const d of affectedDistricts) {
    const adj = DISTRICT_ADJACENCY[d] || [];
    for (const n of adj) {
      if (!affectedSet.has(n)) {
        neighbours.add(n);
      }
    }
  }

  return Array.from(neighbours);
}
