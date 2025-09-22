import { prisma } from "../../config/prisma";
import * as argon2 from "argon2";
import { signJwt } from "./jwt";

export type PublicUser = {
  id: string;
  email: string;
  displayName: string;
  houseId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type SignupInput = { email: string; password: string; displayName: string };
type LoginInput = { email: string; password: string };

function toPublicUser(u: any): PublicUser {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    houseId: u.houseId,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function signup(
  input: SignupInput,
): Promise<{ user: PublicUser; token: string }> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  if (!input.password || input.password.length < 6) {
    throw new Error("Password too short");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already in use");

  const passwordHash = await argon2.hash(input.password);
  const user = await prisma.user.create({
    data: { email, displayName, passwordHash },
  });

  const token = signJwt({
    sub: user.id,
    email: user.email,
    houseId: user.houseId,
  });
  return { user: toPublicUser(user), token };
}

export async function login(
  input: LoginInput,
): Promise<{ user: PublicUser; token: string }> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const ok = await argon2.verify(user.passwordHash, input.password);
  if (!ok) throw new Error("Invalid credentials");

  const token = signJwt({
    sub: user.id,
    email: user.email,
    houseId: user.houseId,
  });
  return { user: toPublicUser(user), token };
}
