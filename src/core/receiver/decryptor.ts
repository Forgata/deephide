import { createDecipheriv } from "node:crypto";

/**
 * AES-256-GCM Decryption
 * Handles the extraction of Nonce (12 bytes), Ciphertext, and Auth Tag (16 bytes).
 */

export function decryptPayload(
  encryptedPacket: Uint8Array,
  key: Uint8Array,
): Uint8Array {
  if (key.length !== 32) {
    throw new Error("Key must be 32 bytes for AES-256.");
  }

  const buffer = Buffer.from(encryptedPacket);

  if (buffer.length < 28) {
    throw new Error("Encrypted packet is too short to be valid AES-GCM.");
  }

  const nonce = buffer.subarray(0, 12);
  const authTag = buffer.subarray(buffer.length - 16);
  const cipherText = buffer.subarray(12, buffer.length - 16);

  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(cipherText),
      decipher.final(),
    ]);

    return new Uint8Array(decrypted);
  } catch (error) {
    throw new Error(
      "DECRYPTION FAILED: Integrity check failed (corrupted data or wrong key).",
    );
  }
}
