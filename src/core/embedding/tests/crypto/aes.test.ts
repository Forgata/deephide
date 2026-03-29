import { describe, it, expect } from "vitest";
import { encryptPayload } from "../../crypto/aes.js";

describe("Phase 2: AES-256-GCM Encryption", () => {
  const mockKey = new Uint8Array(32).fill(0x01);
  const mockPayload = new TextEncoder().encode("Top Secret Data");

  it("should return a Uint8Array of the correct length", () => {
    const encrypted = encryptPayload(mockPayload, mockKey);
    const expectedLength = 12 + mockPayload.length + 16;
    expect(encrypted.length).toBe(expectedLength);
  });

  it("should be non-deterministic (different nonces for same input)", () => {
    const enc1 = encryptPayload(mockPayload, mockKey);
    const enc2 = encryptPayload(mockPayload, mockKey);
    expect(enc1).not.toEqual(enc2);
  });

  it("should not contain the plaintext in the ciphertext", () => {
    const encrypted = encryptPayload(mockPayload, mockKey);
    const ciphertextOnly = encrypted.slice(12); // Skip nonce
    const containsPlaintext = ciphertextOnly.some((_, i) =>
      mockPayload.every((byte, j) => ciphertextOnly[i + j] === byte),
    );
    expect(containsPlaintext).toBe(false);
  });
  it("should have the nonce as the first 12 bytes", () => {
    const encrypted1 = encryptPayload(mockPayload, mockKey);
    const encrypted2 = encryptPayload(mockPayload, mockKey);
    const nonce1 = encrypted1.slice(0, 12);
    const nonce2 = encrypted2.slice(0, 12);
    expect(nonce1).not.toEqual(nonce2);
  });
});
