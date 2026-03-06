import { createCipheriv, randomBytes } from "node:crypto";

/**
 * AES-256-GCM Encryption
 * Encrypts the framed payload and adds the authentication tag.
 * @returns packet of @type Uint8Array
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
