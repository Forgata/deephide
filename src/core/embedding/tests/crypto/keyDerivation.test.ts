import { describe, it, expect } from "vitest";
import { deriveKey } from "../../crypto/keyDerivation.js";

describe("Key Derivation wit PBKDF2", () => {
  const password = "correct-horse-battery-staple";
  const salt = new Uint8Array(16).fill(0xaf);

  it("should generate a 32-byte 256-bit key", async () => {
    const key = await deriveKey(password, salt);
    expect(key).toBeInstanceOf(Uint8Array);
    expect(key.byteLength).toBe(32);
  });

  it("should be deterministic of input", async () => {
    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey(password, salt);
    expect(key1).toEqual(key2);
  });

  it("should produce a different key for a different salt", async () => {
    const salt2 = new Uint8Array(16).fill(0xbf);
    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey(password, salt2);
    expect(key1).not.toEqual(key2);
  });

  it("should produce a different key for a different password", async () => {
    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey("wrong-password", salt);
    expect(key1).not.toEqual(key2);
  });

  it("should handle empty passwords gracefully", async () => {
    const key = await deriveKey("", salt);
    expect(key.byteLength).toBe(32);
  });
});
