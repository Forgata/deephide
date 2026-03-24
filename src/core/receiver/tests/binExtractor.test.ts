import { describe, it, expect, vi } from "vitest";
import { extractHiddenBin } from "../binExtractor.js";
import { BinMapper } from "../../modulator/mapping/binMapper.js";
import { identifySafeBins } from "../../profiler/freqBarkMap.js";

vi.mock("../../profiler/freqBarkMap.js", () => ({
  computeBarkEnergy: vi.fn(),
  identifySafeBins: vi.fn(),
}));

vi.mock("../../profiler/masking.js", () => ({
  estimateMasking: vi.fn(),
}));

describe("binExtractor testing", () => {
  it("should extract correct complex chips from designated safe bins", () => {
    const mockSafeBins = Array.from({ length: 64 }, (_, i) => i + 10);
    vi.mocked(identifySafeBins).mockReturnValue(mockSafeBins);

    const fftComplex = new Float32Array(2048).fill(0);
    const powerSpectrum = new Float32Array(1024).fill(0.1);

    mockSafeBins.forEach((binIdx) => {
      fftComplex[binIdx * 2] = 1.0;
      fftComplex[binIdx * 2 + 1] = -1.0;
    });

    const mockFFT = { fftComplex, powerSpectrum };

    const result = extractHiddenBin(mockFFT);

    expect(result).not.toBeNull();
    if (result) {
      expect(result.safeBins).toEqual(mockSafeBins);
      expect(result.extractedComplexChip[0]).toBe(1.0);
      expect(result.extractedComplexChip[1]).toBe(-1.0);
    }
  });

  it("should return null if fewer than 64 safe bins are found", () => {
    const mockSafeBins = Array.from({ length: 30 }, (_, i) => i);
    vi.mocked(identifySafeBins).mockReturnValue(mockSafeBins);

    const mockFFT = {
      fftComplex: new Float32Array(2048),
      powerSpectrum: new Float32Array(1024),
    };

    const result = extractHiddenBin(mockFFT);
    expect(result).toBeNull();
  });
});
