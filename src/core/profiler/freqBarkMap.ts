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
/**
 * Computes the energy in each bark band by summing up the power in each frequency bin
 * that maps to the same bark band.
 * @param {Float32Array} powerSpectrum - the power spectrum of the audio frame
 * @returns {Float32Array} - an array containing the energy in each bark band
 */
export function computeBarkEnergy(powerSpectrum: Float32Array): Float32Array {
  barkEnergy.fill(0);
  for (let i = 0; i < powerSpectrum.length; i++) {
    const bandIndex = binToBarkMap[i]!;
    barkEnergy[bandIndex]! += powerSpectrum[i]!;
  }
  return barkEnergy;
}

/**
 * Identifies the safe bins in the power spectrum for data injection.
 * A safe bin is defined as a bin whose power is below the
 * corresponding masking threshold.
 * @param {Float32Array} powerSpectrum - the power spectrum of the audio frame
 * @param {Float32Array} thresholds - the masking thresholds for each bark band
 * @returns {number[]} - an array of indices of the safe bins in the power spectrum
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
