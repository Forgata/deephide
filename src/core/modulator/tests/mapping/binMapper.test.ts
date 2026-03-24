import { describe, it, expect } from "vitest";
import { BinMapper } from "../../mapping/binMapper.js";
describe("Bin Mapping & Frequency Hopping", () => {
  it("should map all 64 chips to unique safe bins", () => {
    const chips = new Float32Array(64).fill(1);
    const safeBins = Array.from({ length: 128 }, (_, i) => i + 10);
    const seed = 12345;

    const map = BinMapper.mapToBins(chips, safeBins, seed);

    expect(map.size).toBe(64);
    for (const binIndex of map.keys()) {
      expect(safeBins).toContain(binIndex);
    }
  });

  it("should be deterministic (same seed = same map)", () => {
    const chips = new Float32Array(64).fill(1);
    const safeBins = [10, 20, 30, 40, 50, 60, 70, 80];
    const seed = 99;

    const map1 = BinMapper.mapToBins(chips, safeBins, seed);
    const map2 = BinMapper.mapToBins(chips, safeBins, seed);

    expect(Array.from(map1.entries())).toEqual(Array.from(map2.entries()));
  });

  it("should produce different mappings for different seeds (Hopping)", () => {
    const chips = new Float32Array(64).fill(1);
    const safeBins = Array.from({ length: 100 }, (_, i) => i);

    const mapFrame0 = BinMapper.mapToBins(chips, safeBins, 0);
    const mapFrame1 = BinMapper.mapToBins(chips, safeBins, 1);

    expect(mapFrame0).not.toEqual(mapFrame1);
  });

  it("should wrap around if there are fewer safe bins than chips", () => {
    const chips = new Float32Array(64).fill(1);
    const safeBins = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const map = BinMapper.mapToBins(chips, safeBins, 42);
    expect(map.size).toBe(10);
  });
});
