import { describe, it, expect } from "vitest";
import { embedFrameChips } from "../embedChips.js";

describe("Chip Embedding (Phase Modulation)", () => {
  const N = 1024;
  const fftLength = N * 2;

  it("should shift the phase of a bin by exactly Delta", () => {
    const mockFFT = new Float32Array(fftLength).fill(0);
    mockFFT[20] = 1.0;
    mockFFT[21] = 0.0;

    const chipMap = new Map([[10, 1]]);
    const delta = 0.1;

    const result = embedFrameChips(mockFFT, chipMap, N, delta);

    const newReal = result[20]!;
    const newImag = result[21]!;
    const newPhase = Math.atan2(newImag, newReal);
    expect(newPhase).toBeCloseTo(0.1, 5);
  });

  it("should maintain the magnitude of the modified bin", () => {
    const mockFFT = new Float32Array(fftLength).fill(0);
    mockFFT[20] = 0.6;
    mockFFT[21] = 0.8;

    const chipMap = new Map([[10, -1]]);
    const result = embedFrameChips(mockFFT, chipMap, N, 0.02);

    const mag = Math.sqrt(result[20]! ** 2 + result[21]! ** 2);
    expect(mag).toBeCloseTo(1.0, 5);
  });

  it("should maintain conjugate symmetry (Mirror Bins)", () => {
    const mockFFT = new Float32Array(fftLength).fill(0);
    mockFFT[20] = 1.0;

    const chipMap = new Map([[10, 1]]);
    const result = embedFrameChips(mockFFT, chipMap, N, 0.5);

    const bin10Imag = result[21]!;
    const mirrorBinIndex = N - 10;
    const mirrorImag = result[mirrorBinIndex * 2 + 1];
    expect(mirrorImag).toBeCloseTo(-bin10Imag, 5);
  });
});
