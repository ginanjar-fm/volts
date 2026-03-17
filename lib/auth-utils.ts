import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
}) {
  const passwordHash = await hashPassword(input.password);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase().trim(),
      name: input.name ?? null,
      passwordHash,
      emailVerified: null,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
    });

  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .limit(1);

  return user ?? null;
}
