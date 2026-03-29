import { createCipheriv, randomBytes } from "node:crypto";

/**
 * Encrypts the framed payload and adds the authentication tag.
 * @param {Uint8Array} framedPayload The payload to be encrypted.
 * @param {Uint8Array} key The 32-byte secret key used for encryption.
 * @returns {Uint8Array} The encrypted packet including the nonce, ciphertext, and authentication tag.
 */
export function encryptPayload(framedPayload: Uint8Array, key: Uint8Array) {
  if (key.length !== 32) {
    throw new Error("Key must be exactly 32 bytes for AES-256-GCM encryption");
  }
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
