import { describe, it, expect, beforeEach } from "vitest";
import { BitStreamReconstructor } from "../bitReconstructor.js";

describe("BitStreamReconstructor", () => {
  let reconstructor: BitStreamReconstructor;

  const PREAMBLE = [
    1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1,
    0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0,
    0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0,
    1, 0, 1, 1, 1,
  ];

  beforeEach(() => {
    reconstructor = new BitStreamReconstructor();
  });

  it("should ignore noise and sync when the preamble appears", () => {
    for (let i = 0; i < 50; i++) {
      reconstructor.processBit(Math.random() > 0.5 ? 1 : 0);
    }
    expect(reconstructor.getSyncStatus()).toBe(false);

    for (const bit of PREAMBLE) {
      reconstructor.processBit(bit);
    }
    expect(reconstructor.getSyncStatus()).toBe(true);
  });

  it("should allow for a few bit errors in the preamble (Fuzzy Sync)", () => {
    const corruptedPreamble = [...PREAMBLE];
    corruptedPreamble[0] = corruptedPreamble[0] === 1 ? 0 : 1;
    corruptedPreamble[10] = corruptedPreamble[10] === 1 ? 0 : 1;

    for (const bit of corruptedPreamble) {
      reconstructor.processBit(bit);
    }
    expect(reconstructor.getSyncStatus()).toBe(true);
  });

  it("should return a byte array once a full packet is collected", () => {
    for (const bit of PREAMBLE) reconstructor.processBit(bit);

    let result: Uint8Array | null = null;
    for (let i = 0; i < 2048; i++) {
      result = reconstructor.processBit(i % 2);
    }

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result?.length).toBe(256);
    expect(reconstructor.getSyncStatus()).toBe(false);
  });
});
