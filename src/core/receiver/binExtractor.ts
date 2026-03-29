import {
  computeBarkEnergy,
  identifySafeBins,
} from "../profiler/freqBarkMap.js";
import { estimateMasking } from "../profiler/masking.js";
import { BinMapper } from "../modulator/mapping/binMapper.js";

/**
 * Identifies and extracts the complex values from the masked bins.
 * @param fftResult The result from processFFT (complex + power)
 * @returns The 64 complex chips [Real, Imag, Real, Imag...]
 */

interface FFTResult {
  fftComplex: Float32Array | any[];
  powerSpectrum: Float32Array;
}

interface ExtractionResult {
  extractedComplexChip: Float32Array;
  safeBins: number[];
}
/**
 * Identifies and extracts the complex values from the masked bins.
 * Must match the modulator's bin selection logic exactly.
 */

export function extractHiddenBin(
  fftResult: FFTResult,
  forcedBins: number[] | null = null,
) {
  const { fftComplex, powerSpectrum } = fftResult;

  // const barkEnergy = computeBarkEnergy(powerSpectrum);
  // const maskingThresholds = estimateMasking(barkEnergy);
  // const safeBins = identifySafeBins(powerSpectrum, maskingThresholds);

  let safeBins: number[];
  if (forcedBins) {
    safeBins = forcedBins;
  } else {
    const barkEnergy = computeBarkEnergy(powerSpectrum);
    const maskingThresholds = estimateMasking(barkEnergy);
    safeBins = identifySafeBins(powerSpectrum, maskingThresholds);
  }

  if (safeBins.length < 64) return null;

  const dummyChips = new Float32Array(64);
  const binMap = BinMapper.mapToBins(dummyChips, safeBins, 0);

  const extractedComplexChip = new Float32Array(64 * 2);
  let i = 0;
  for (const [binIndex] of binMap.entries()) {
    if (i >= 64) break;
    extractedComplexChip[i * 2] = fftComplex[binIndex! * 2]!;
    extractedComplexChip[i * 2 + 1] = fftComplex[binIndex! * 2 + 1]!;
    i++;
  }

  return { extractedComplexChip, safeBins };
}
