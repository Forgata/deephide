import { NUM_BARK_BANDS } from "./freqBarkMap.js";
const maskingFactor = 0.15;

const maskingThreshold = new Float32Array(NUM_BARK_BANDS);

/**
 * Estimates the masking threshold for each bark band based on the
 * energy in each bark band. The masking threshold is set to
 * 15% of the energy in each bark band.
 * @param {Float32Array} barkEnergy - the energy in each bark band
 * @returns {Float32Array} - the estimated masking thresholds for each bark band
 */
export function estimateMasking(barkEnergy: Float32Array): Float32Array {
  for (let i = 0; i < NUM_BARK_BANDS; i++) {
    maskingThreshold[i] = barkEnergy[i]! * maskingFactor;
  }
  return maskingThreshold;
}
