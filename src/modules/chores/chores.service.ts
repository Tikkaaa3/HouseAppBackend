import { Chore, ChoreCompletion, ChoreFrequency } from "@prisma/client";
import { prisma } from "../../config/prisma";

export async function createChore(input: {
  houseId: string;
  title: string;
  frequency: ChoreFrequency;
  assignedToId?: string | null;
}): Promise<Chore> {
  const title = input.title?.trim();
  if (!title) throw new Error("invalid_title");

  if (input.assignedToId) {
    const u = await prisma.user.findUnique({
      where: { id: input.assignedToId },
    });
    if (!u || u.houseId !== input.houseId) throw new Error("assignee_invalid");
  }

  return prisma.chore.create({
    data: {
      houseId: input.houseId,
      title,
      frequency: input.frequency,
      assignedToId: input.assignedToId ?? null,
    },
  });
}

export async function listChores(input: {
  houseId: string;
  archived?: boolean;
}): Promise<Chore[]> {
  const archived = input.archived ?? false;
  return prisma.chore.findMany({
    where: { houseId: input.houseId, isArchived: archived },
    orderBy: [{ isArchived: "asc" }, { updatedAt: "desc" }],
  });
}

export async function completeChore(input: {
  houseId: string;
  choreId: string;
  userId: string;
  note?: string;
}): Promise<ChoreCompletion> {
  const chore = await prisma.chore.findUnique({ where: { id: input.choreId } });
  if (!chore || chore.houseId !== input.houseId)
    throw new Error("chore_not_found");
  if (chore.isArchived) throw new Error("chore_archived");

  const note = input.note?.trim() || null;

  return prisma.choreCompletion.create({
    data: {
      choreId: input.choreId,
      completedById: input.userId,
      note,
    },
  });
}

export async function archiveChore(input: {
  houseId: string;
  choreId: string;
}): Promise<void> {
  const chore = await prisma.chore.findUnique({ where: { id: input.choreId } });
  if (!chore || chore.houseId !== input.houseId)
    throw new Error("chore_not_found");

  await prisma.chore.update({
    where: { id: input.choreId },
    data: { isArchived: true },
  });
}

export async function reassignChore(input: {
  houseId: string;
  choreId: string;
  assignedToId: string | null;
}): Promise<Chore> {
  const chore = await prisma.chore.findUnique({ where: { id: input.choreId } });
  if (!chore || chore.houseId !== input.houseId)
    throw new Error("chore_not_found");

  if (input.assignedToId) {
    const u = await prisma.user.findUnique({
      where: { id: input.assignedToId },
    });
    if (!u || u.houseId !== input.houseId) throw new Error("assignee_invalid");
  }

  return prisma.chore.update({
    where: { id: input.choreId },
    data: { assignedToId: input.assignedToId },
  });
}
