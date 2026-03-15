import { describe, it, expect } from "vitest";
import { processFFT } from "../fft.js";

describe("FFT processing", () => {
  const FRAME_SIZE = 1024;
  const SAMPLE_RATE = 16000;

  it("should return a power spectrum of length FRAME_SIZE / 2", () => {
    const mockframe = new Float32Array(FRAME_SIZE).fill(1.0);
    const { powerSpectrum } = processFFT(mockframe);
    expect(powerSpectrum.length).toBe(FRAME_SIZE / 2);
  });

  it("detect a pure sine wave in the correct bin", () => {
    const frequency = 1000;
    const input = new Float32Array(FRAME_SIZE);

    for (let i = 0; i < FRAME_SIZE; i++) {
      input[i] = Math.sin(2 * Math.PI * frequency * (i / SAMPLE_RATE));
    }
    const { powerSpectrum } = processFFT(input);
    let maxEnergy = -1;
    let maxBin = -1;
    for (let i = 0; i < powerSpectrum.length; i++) {
      if (powerSpectrum[i]! > maxEnergy) {
        maxEnergy = powerSpectrum[i]!;
        maxBin = i;
      }
    }
    const expectedBin = Math.round((frequency * FRAME_SIZE) / SAMPLE_RATE);
    expect(maxBin).toBe(expectedBin);
  });

  it("should produce higher power for a higher amplitude signal", () => {
    const quiet = new Float32Array(FRAME_SIZE).fill(0.1);
    const loud = new Float32Array(FRAME_SIZE).fill(0.5);
    const resQuiet = processFFT(quiet);
    const resLoud = processFFT(loud);

    expect(resLoud.powerSpectrum[0]).toBeGreaterThan(
      resQuiet.powerSpectrum[0]!,
    );
  });
});
