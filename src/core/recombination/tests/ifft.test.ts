import { describe, it, expect } from "vitest";
import { processFFT } from "../../profiler/fft.js";
import { processIFFT } from "../ifft.js";

describe("Inverse FFT Reconstruction", () => {
  it("should reconstruct a pure sine wave from its spectrum", () => {
    const FRAME_SIZE = 1024;
    const freq = 440;
    const sampleRate = 44100;
    const input = new Float32Array(FRAME_SIZE);

    for (let i = 0; i < FRAME_SIZE; i++) {
      input[i] = Math.sin(2 * Math.PI * freq * (i / sampleRate));
    }

    const { fftComplex } = processFFT(input);
    const reconstructed = processIFFT(fftComplex as any);

    expect(reconstructed[512]).toBeCloseTo(input[512]!, 2);
  });

  it("should return an array of exactly FRAME_SIZE (1024)", () => {
    const mockSpectrum = new Float32Array(2048).fill(0);
    const result = processIFFT(mockSpectrum);
    expect(result.length).toBe(1024);
  });
});
