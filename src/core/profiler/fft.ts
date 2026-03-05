import FFT from "fft.js";
const FRAME_SIZE = 1024;
const f = new FFT(FRAME_SIZE);
const out = f.createComplexArray();

export function processFFT(windowedFrame: Float32Array) {
  f.realTransform(out, windowedFrame);
  const powerSpectrum = new Float32Array(FRAME_SIZE / 2);

  for (let i = 0; i < FRAME_SIZE / 2; i++) {
    const real = out[2 * i]!;
    const imag = out[2 * i + 1]!;

    powerSpectrum[i] = real * real + imag * imag;
  }

  return powerSpectrum;
}
