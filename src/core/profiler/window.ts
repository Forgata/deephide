export function hammingWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let n = 0; n < size; n++) {
    window[n] = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (size - 1));
  }
  return window;
}

export const HAMMING_WINDOW = hammingWindow(1024);
