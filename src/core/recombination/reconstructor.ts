import { HAMMING_WINDOW } from "../profiler/window.js";

const FRAME_SIZE = 1024;
const HOP_SIZE = 512;

let overlapBuffer = new Float32Array(FRAME_SIZE).fill(0);
let windowEnergy = new Float32Array(FRAME_SIZE).fill(0);

/**
 * Stitches IFFT frames using Overlap-Add logic.
 * @param timeFrame 1024 samples
 * @returns 512 samples of finished PCM
 */

export function overlapAdd(timeFrame: Float32Array): Float32Array {
  const output = new Float32Array(HOP_SIZE);

  for (let i = 0; i < FRAME_SIZE; i++) {
    const window = HAMMING_WINDOW[i];
    const sample = timeFrame[i]! * window!;

    overlapBuffer[i]! += sample;
    windowEnergy[i]! += window! * window!;
  }

  for (let i = 0; i < HOP_SIZE; i++) {
    const energy = windowEnergy[i]!;
    if (energy > 0) {
      output[i] = overlapBuffer[i]! / energy;
    } else {
      output[i] = overlapBuffer[i]!;
    }
  }

  overlapBuffer.copyWithin(0, HOP_SIZE);
  overlapBuffer.fill(0, FRAME_SIZE - HOP_SIZE);

  windowEnergy.copyWithin(0, HOP_SIZE);
  windowEnergy.fill(0, FRAME_SIZE - HOP_SIZE);

  return output;
}
