import { pbkdf2 } from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);

/**
 * Derives a 256-bit cryptographic key from a password using PBKDF2.
 *
 * @param password - The human-readable password to derive the key from.
 * @param salt - A cryptographic salt (unique and unpredictable) used during derivation.
 * @returns The derived 32-byte (256-bit) key as a `Uint8Array`.
 * @throws If key derivation fails.
 */
export async function deriveKey(password: string, salt: Uint8Array) {
  const iterations = 600_000;
  const keyLength = 32;
  const digest = "sha256";

  try {
    const derivedKey = await pbkdf2Async(
      password,
      salt,
      iterations,
      keyLength,
      digest,
    );
    return new Uint8Array(derivedKey);
  } catch (error) {
    throw new Error("Failed to derive key");
  }
}
