import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  const seedFile = process.env.SEED_FILE || path.resolve(process.cwd(), "seed-data", "deals.json");
  if (!fs.existsSync(seedFile)) {
    console.error("Seed file not found:", seedFile);
    process.exit(1);
  }
  const rows = JSON.parse(fs.readFileSync(seedFile, "utf-8"));
  if (!Array.isArray(rows)) {
    console.error("Seed file must be an array");
    process.exit(1);
  }
  for (const d of rows) {
    await prisma.deal.upsert({
      where: { id: d.id },
      update: { ...d, deletedAt: null },
      create: d
    });
  }
  console.log(`Seeded ${rows.length} deals from ${seedFile}`);
}

main().finally(async () => prisma.$disconnect());
