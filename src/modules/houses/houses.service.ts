import { prisma } from "../../config/prisma";

type CreateHouseInput = { userId: string; name: string };
type HouseDTO = { id: string; name: string; createdAt: Date; updatedAt: Date };
type JoinHouseInput = { userId: string; houseId: string };
type LeaveHouseInput = { userId: string };

export async function createHouse(input: CreateHouseInput): Promise<HouseDTO> {
  const userId = input.userId;
  const houseName = input.name.trim();
  if (!houseName) throw new Error("invalid_name");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("user_not_found");
  if (user.houseId) throw new Error("already_in_house");
  const house = await prisma.house.create({
    data: { name: houseName },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { houseId: house.id },
  });
  return {
    id: house.id,
    name: house.name,
    createdAt: house.createdAt,
    updatedAt: house.updatedAt,
  };
}

export async function joinHouse(
  input: JoinHouseInput,
): Promise<{ houseId: string }> {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error("user_not_found");
  if (user.houseId) throw new Error("already_in_house");
  const house = await prisma.house.findUnique({ where: { id: input.houseId } });
  if (!house) throw new Error("house_not_found");
  await prisma.user.update({
    where: { id: input.userId },
    data: { houseId: input.houseId },
  });
  return { houseId: input.houseId };
}

export async function leaveHouse(input: LeaveHouseInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error("user_not_found");
  if (user.houseId === null) return;

  await prisma.user.update({
    where: { id: input.userId },
    data: { houseId: null },
  });
}
