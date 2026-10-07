import { NextResponse } from "next/server";

const CATEGORIES = [
  "Health", "Education", "Poverty", "Women", "Children",
  "Disaster relief", "Food", "Environment", "Disability", "Rural development", "Religious", "Other"
];

export async function GET() {
  return NextResponse.json({ success: true, data: CATEGORIES });
}
