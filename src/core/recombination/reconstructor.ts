import { HAMMING_WINDOW } from "../profiler/window.js";

const FRAME_SIZE = 1024;
const HOP_SIZE = 512;

let overlapBuffer = new Float32Array(FRAME_SIZE).fill(0);
let windowEnergy = new Float32Array(FRAME_SIZE).fill(0);

/**
 * Stitches IFFT frames using Overlap-Add logic.
 * The overlap buffer is used to store the residual energy from the previous frame.
 * This energy is then added to the current frame, and the resulting frame is
 * returned as the output.
 * @param timeFrame 1024 samples of the current IFFT frame
 * @returns 512 samples of finished PCM
 */
export function overlapAdd(timeFrame: Float32Array): Float32Array {
  const output = new Float32Array(HOP_SIZE);

  for (let i = 0; i < FRAME_SIZE; i++) {
    overlapBuffer[i]! += timeFrame[i]!;
  }

  for (let i = 0; i < HOP_SIZE; i++) {
    output[i]! += overlapBuffer[i]!;
  }

  overlapBuffer.set(overlapBuffer.subarray(HOP_SIZE));
  overlapBuffer.fill(0, HOP_SIZE);

  // windowEnergy.copyWithin(0, HOP_SIZE);
  // windowEnergy.fill(0, FRAME_SIZE - HOP_SIZE);

  return output;
}
