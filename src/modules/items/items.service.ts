import { prisma } from "../../config/prisma";
type Obj = {
  houseId: string;
  q?: string;
  category?: string;
  archived?: boolean;
};

export async function list(obj: Obj): Promise<any[]> {
  const q = obj.q?.trim() || undefined;
  const category = obj.category?.trim() || undefined;
  const archived = obj.archived ?? false;
  const houseId = obj.houseId;
  const where: any = { houseId, isArchived: archived };
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (category) where.category = category;
  const items = await prisma.item.findMany({
    where,
    orderBy: { name: "asc" },
  });
  return items;
}
