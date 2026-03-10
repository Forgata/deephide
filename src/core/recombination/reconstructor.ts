const FRAME_SIZE = 1024;
const HOP_SIZE = 512;

let overlapBuffer = new Float32Array(HOP_SIZE).fill(0);

/**
 * Stitches IFFT frames using Overlap-Add logic.
 * @param timeFrame 1024 samples
 * @returns 512 samples of finished PCM
 */

export function overlapAdd(timeFrame: Float32Array): Float32Array {
  const output = new Float32Array(HOP_SIZE);

  for (let i = 0; i < HOP_SIZE; i++) {
    output[i] = (overlapBuffer[i]! + timeFrame[i]!) / 1.08;
    overlapBuffer[i] = timeFrame[i + HOP_SIZE]!;
  }

  return output;
}
