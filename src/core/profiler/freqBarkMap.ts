const FRAME_SIZE = 1024;
const SAMPLE_RATE = 16000;
export const NUM_BARK_BANDS = 24;

const binToBarkMap = new Int32Array(FRAME_SIZE / 2);

for (let i = 0; i < FRAME_SIZE / 2; i++) {
  const freq = (i * SAMPLE_RATE) / FRAME_SIZE;
  const bark =
    13.0 * Math.atan(0.00076 * freq) +
    3.5 * Math.atan(Math.pow(freq / 7500.0, 2));

  binToBarkMap[i] = Math.min(NUM_BARK_BANDS - 1, Math.max(0, Math.floor(bark)));
}

const barkEnergy = new Float32Array(NUM_BARK_BANDS);
export function computeBarkEnergy(powerSpectrum: Float32Array): Float32Array {
  barkEnergy.fill(0);
  for (let i = 0; i < powerSpectrum.length; i++) {
    const bandIndex = binToBarkMap[i]!;
    barkEnergy[bandIndex]! += powerSpectrum[i]!;
  }
  return barkEnergy;
}

/**
 * Identify FFT bin indices whose power is below their corresponding Bark-band threshold.
 *
 * @param powerSpectrum - Power values for each FFT bin.
 * @param thresholds - Threshold values for each Bark band (indexed by band); used to compare against each bin's power.
 * @returns An array of FFT bin indices where the bin power is less than its Bark-band threshold.
 */
export function identifySafeBins(
  powerSpectrum: Float32Array,
  thresholds: Float32Array,
) {
  const result: number[] = [];

  for (let i = 0; i < powerSpectrum.length; i++) {
    const bandIndex = binToBarkMap[i]!;
    const binPower = powerSpectrum[i]!;
    const bandThreshold = thresholds[bandIndex]!;

    if (binPower < bandThreshold) {
      result.push(i);
    }
  }
  return result;
}
