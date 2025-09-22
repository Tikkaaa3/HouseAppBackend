import { signup } from "../modules/auth/auth.service";
import { prisma } from "../config/prisma";

async function main() {
  try {
    const user = await signup({
      email: "tikkaaa3@gmail.com",
      password: "1234567",
      displayName: "Tolga",
    });
    console.log("Created user:", user);
  } catch (err) {
    console.error("Signup failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
