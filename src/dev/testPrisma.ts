import { prisma } from "../config/prisma";

async function main() {
  const houses = await prisma.house.findMany();
  console.log("houses:", houses);
}

main().finally(() => prisma.$disconnect());
