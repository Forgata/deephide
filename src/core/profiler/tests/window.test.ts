import { describe, it, expect } from "vitest";
import { hammingWindow, HAMMING_WINDOW } from "../window.js";

describe("hammingWindow logic", () => {
  it("generate a window of requested size", () => {
    const size = 512;
    const result = hammingWindow(size);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(size);
  });

  it("perfectly symmetrical", () => {
    const length = HAMMING_WINDOW.length;
    for (let i = 0; i < 100; i++) {
      const mirrorIndex = length - 1 - i;
      expect(HAMMING_WINDOW[i]).toBeCloseTo(HAMMING_WINDOW[mirrorIndex]!, 10);
    }
  });

  it("should correctly scale a mock audio frame", () => {
    const mockFrame = new Float32Array(1024).fill(1.0);
    const windowed = mockFrame.map((val, i) => val * HAMMING_WINDOW[i]!);
    expect(windowed[0]).toBeCloseTo(0.08, 5);
    expect(windowed[512]).toBeCloseTo(1.0, 2);
  });
});
