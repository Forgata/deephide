import { NUM_BARK_BANDS } from "./freqBarkMap.js";
const maskingFactor = 0.15;

const maskingThreshold = new Float32Array(NUM_BARK_BANDS);

export function estimateMasking(barkEnergy: Float32Array): Float32Array {
  for (let i = 0; i < NUM_BARK_BANDS; i++) {
    maskingThreshold[i] = barkEnergy[i]! * maskingFactor;
  }
  return maskingThreshold;
}
