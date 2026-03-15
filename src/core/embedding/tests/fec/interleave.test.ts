import { describe, it, expect } from "vitest";
import { interleave } from "../../fec/interleave.js";

describe("Interleaving", () => {
  it("should correctly transpose a small block of shards", () => {
    const shards = [
      new Uint8Array([1]),
      new Uint8Array([2]),
      new Uint8Array([3]), // Block A
      new Uint8Array([4]),
      new Uint8Array([5]),
      new Uint8Array([6]), // Block B
    ];

    const result = interleave(shards, 2, 1);

    expect(result[0]).toEqual(new Uint8Array([1]));
    expect(result[1]).toEqual(new Uint8Array([4]));
    expect(result[2]).toEqual(new Uint8Array([2]));
    expect(result[3]).toEqual(new Uint8Array([5]));
    expect(result[4]).toEqual(new Uint8Array([3]));
    expect(result[5]).toEqual(new Uint8Array([6]));
  });

  it("should maintain the total number of shards", () => {
    const shards = Array.from({ length: 18 }, () => new Uint8Array(10));
    const result = interleave(shards, 6, 3);

    expect(result.length).toBe(18);
    expect(result.every((s) => s !== undefined)).toBe(true);
  });

  it("should handle uneven blocks if the last block is incomplete", () => {
    const shards = Array.from({ length: 7 }, (_, i) => new Uint8Array([i]));
    const result = interleave(shards, 2, 1);

    expect(result.length).toBe(7);
    expect(result[0]).toEqual(new Uint8Array([0]));
  });
});
