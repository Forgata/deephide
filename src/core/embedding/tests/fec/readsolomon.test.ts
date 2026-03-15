import { describe, it, expect, beforeAll } from "vitest";
import { applyFEC } from "../../fec/readSolomon.js";

describe("Phase 2: Reed-Solomon FEC", () => {
  it("should expand 6 data shards into 9 total shards (6 data + 3 parity)", async () => {
    const shardSize = 256;
    const mockPackets = Array.from({ length: 6 }, (_, i) =>
      new Uint8Array(shardSize).fill(i),
    );

    const result = await applyFEC(mockPackets, 6, 3);
    expect(result.length).toBe(9);
    expect(result[0]!.length).toBe(shardSize);
  });

  it("should be systematic (first shards match input)", async () => {
    const data = new Uint8Array(256).fill(0x42);
    const mockPackets = [data, data, data, data, data, data];

    const result = await applyFEC(mockPackets, 6, 3);
    expect(result[0]).toEqual(data);
  });

  it("should generate non-zero parity shards", async () => {
    const mockPackets = Array.from({ length: 6 }, () =>
      new Uint8Array(256).fill(Math.random() * 255),
    );

    const result = await applyFEC(mockPackets, 6, 3);
    const parityShard = result[6];
    const isAllZeros = parityShard!.every((byte) => byte === 0);
    expect(isAllZeros).toBe(false);
  });

  it("should handle multiple blocks", async () => {
    const mockPackets = Array.from({ length: 12 }, () => new Uint8Array(128));
    const result = await applyFEC(mockPackets, 6, 3);

    expect(result.length).toBe(18);
  });
});
