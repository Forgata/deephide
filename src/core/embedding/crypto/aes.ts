import { createCipheriv, randomBytes } from "node:crypto";

/**
 * Encrypts a payload using AES-256-GCM and returns a single packet containing the nonce, ciphertext, and authentication tag.
 *
 * @param framedPayload - Plaintext bytes to encrypt.
 * @param key - 32-byte AES-256 key.
 * @returns A Uint8Array structured as [nonce (12 bytes) | ciphertext | authTag (16 bytes)].
 */

export function encryptPayload(framedPayload: Uint8Array, key: Uint8Array) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);

  const cipherText = Buffer.concat([
    cipher.update(framedPayload),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const encryptedPacket = Buffer.concat([nonce, cipherText, authTag]);
  return new Uint8Array(encryptedPacket);
}
