// lib/auth.ts
import crypto from "crypto";

/**
 * Very simple password hashing using SHA-256.
 * (Good enough for this playground app – not production-grade.)
 */
export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}
