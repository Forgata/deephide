import { describe, it, expect } from "vitest";
import { serialiseBits } from "../../bitstream/serialiser.js";

describe("Bit Serialisation", () => {
  it("should expand shards into a bitstream 8x the size of the input bytes", () => {
    const shard1 = new Uint8Array([0x00, 0xff]);
    const shard2 = new Uint8Array([0xaa]);
    const result = serialiseBits([shard1, shard2]);

    expect(result.length).toBe(24);
  });

  it("should extract bits in LSB-first order", () => {
    const shard = new Uint8Array([0x01]);
    const result = serialiseBits([shard]);

    expect(result[0]).toBe(1);
    expect(result[1]).toBe(0);
    expect(result[7]).toBe(0);
  });

  it("should correctly serialise a complex byte", () => {
    const shard = new Uint8Array([0xad]);
    const result = serialiseBits([shard]);

    const expected = [1, 0, 1, 1, 0, 1, 0, 1];
    expect(Array.from(result)).toEqual(expected);
  });

  it("should handle empty shard arrays", () => {
    const result = serialiseBits([]);
    expect(result.length).toBe(0);
  });
});
