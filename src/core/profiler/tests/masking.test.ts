import { describe, it, expect } from "vitest";
import { estimateMasking } from "../masking.js";
import { NUM_BARK_BANDS } from "../freqBarkMap.js";

describe("masking threshold estimation", () => {
  it("should return an array of masking thresholds of correct length", () => {
    const mockEnergy = new Float32Array(NUM_BARK_BANDS).fill(1.0);
    const thresholds = estimateMasking(mockEnergy);

    expect(thresholds).toBeInstanceOf(Float32Array);
    expect(thresholds.length).toBe(NUM_BARK_BANDS);
  });

  it("should calculate exactly 15% of the input energy", () => {
    const mockEnergy = new Float32Array(NUM_BARK_BANDS).fill(100.0);
    const thresholds = estimateMasking(mockEnergy);
    expect(thresholds[0]).toBeCloseTo(15.0, 5);
    expect(thresholds[10]).toBeCloseTo(15.0, 5);
    expect(thresholds[23]).toBeCloseTo(15.0, 5);
  });

  it("should handle silent bands by setting 0 threshold", () => {
    const mockEnergy = new Float32Array(NUM_BARK_BANDS).fill(0);
    const thresholds = estimateMasking(mockEnergy);

    expect(thresholds[0]).toBe(0);
    expect(Math.max(...thresholds)).toBe(0);
  });

  it("should be isolated (energy in Band A should not affect Threshold B)", () => {
    const mockEnergy = new Float32Array(NUM_BARK_BANDS).fill(0);
    mockEnergy[5] = 1000.0;

    const thresholds = estimateMasking(mockEnergy);

    expect(thresholds[5]).toBe(150.0);
    expect(thresholds[4]).toBe(0);
    expect(thresholds[6]).toBe(0);
  });
});
