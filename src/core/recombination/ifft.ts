import FFT from "fft.js";

const FRAME_SIZE = 1024;
const f = new FFT(FRAME_SIZE);

/**
 * Converts the frequency domain into the time domain PCM samples
 * @param complexSpectrum interleaved Float32Array
 * @returns real-valued Float32Array (PCM)
 */

export function processIFFT(complexSpectrum: Float32Array): Float32Array {
  const outTimeDomain = f.createComplexArray();
  const realOutput = new Float32Array(FRAME_SIZE);

  f.inverseTransform(outTimeDomain, complexSpectrum);

  for (let i = 0; i < FRAME_SIZE; i++) {
    const amplitude = outTimeDomain[i * 2];
    realOutput[i] = amplitude / FRAME_SIZE;
  }

  return realOutput;
}
