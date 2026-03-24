import { describe, it, expect } from "vitest";
import { decryptPayload } from "../decryptor.js";
import { createCipheriv, randomBytes } from "node:crypto";

describe("decryptor", () => {
  it("should decrypt a valid AES-GCM packet", () => {
    const key = randomBytes(32);
    const nonce = randomBytes(12);
    const plaintext = Buffer.from("Hello DeepHide");

    // Create a mock encrypted packet
    const cipher = createCipheriv("aes-256-gcm", key, nonce);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    const packet = new Uint8Array(Buffer.concat([nonce, ciphertext, tag]));

    const result = decryptPayload(packet, key);
    expect(new TextDecoder().decode(result)).toBe("Hello DeepHide");
  });

  it("should throw error if data is tampered with", () => {
    const key = randomBytes(32);
    const nonce = randomBytes(12);
    const plaintext = Buffer.from("Sensitive Data");

    const cipher = createCipheriv("aes-256-gcm", key, nonce);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    const packet = new Uint8Array(Buffer.concat([nonce, ciphertext, tag]));

    // Tamper with one byte of the ciphertext
    packet[15]! ^= 0xff;

    expect(() => decryptPayload(packet, key)).toThrow("DECRYPTION FAILED");
  });
});
