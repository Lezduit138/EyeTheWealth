// ETW — Rover Module Landing Page
// Socioeconomic & Wealth Statistics Dashboard
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ClientDashboard from "./ClientDashboard";

export const metadata: Metadata = {
  title: "ROVER — Socioeconomic & Wealth Statistics",
  description:
    "Explore GDP, poverty, inequality, health, and education data across all countries. Compare indicators. Trace methodology.",
};

async function getCategories() {
  return prisma.category.findMany({
    include: {
      indicators: {
        select: { id: true, name: true, slug: true },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { displayOrder: "asc" },
  });
}

export default async function RoverPage() {
  const categories = await getCategories();

  return (
    <div className="w-full h-full overflow-hidden">
      <ClientDashboard categories={categories} />
    </div>
  );
}
