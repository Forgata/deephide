import { describe, it, expect } from "vitest";
import {
  computeBarkEnergy,
  identifySafeBins,
  NUM_BARK_BANDS,
} from "../freqBarkMap.js";

describe("bark scale and safety mapping", () => {
  const FRAME_SIZE = 1024;
  const nyBins = FRAME_SIZE / 2;

  it("should compute engery for exactly 24 bands", () => {
    const mockPower = new Float32Array(nyBins).fill(0.1);
    const energy = computeBarkEnergy(mockPower);
    expect(energy.length).toBe(NUM_BARK_BANDS);
    expect(energy[0]).toBeGreaterThan(0);
  });

  it("should map Bin 0 to Bark Band 0", () => {
    const mockPower = new Float32Array(nyBins).fill(0);
    mockPower[0] = 10.0;

    const energy = computeBarkEnergy(mockPower);
    expect(energy[0]).toBe(10.0);
    expect(energy[10]).toBe(0);
  });

  it('should identify a bin as "safe" if its power is below the threshold', () => {
    const mockPower = new Float32Array(nyBins).fill(100.0);
    const thresholds = new Float32Array(NUM_BARK_BANDS).fill(150.0);
    const safeBins = identifySafeBins(mockPower, thresholds);
    expect(safeBins.length).toBe(nyBins);
  });

  it("should reject bins that exceed the masking threshold", () => {
    const mockPower = new Float32Array(nyBins).fill(0);
    mockPower[50] = 500.0;
    const thresholds = new Float32Array(NUM_BARK_BANDS).fill(100.0);
    const safeBins = identifySafeBins(mockPower, thresholds);

    expect(safeBins.includes(50)).toBe(false);
    expect(safeBins.includes(0)).toBe(true);
  });
});
