import { pbkdf2 } from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);

/**
 * Key Derivation
 * Transforms a human password into a high-entropy 256-bit key.
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
