import FFT from "fft.js";
const FRAME_SIZE = 1024;
const f = new FFT(FRAME_SIZE);

/**
 * Processes a windowed frame of audio samples using the Fast Fourier Transform (FFT)
 * @param {Float32Array} windowedFrame - a windowed frame of audio samples
 * @returns {Object} - an object containing the FFT complex array and power spectrum array
 * @property {number[]} fftComplex - the FFT complex array
 * @property {Float32Array} powerSpectrum - the power spectrum array
 */
export function processFFT(windowedFrame: Float32Array) {
  const fftComplex = f.createComplexArray();
  f.realTransform(fftComplex, windowedFrame);
  f.completeSpectrum(fftComplex);

  const powerSpectrum = new Float32Array(FRAME_SIZE / 2);

  for (let i = 0; i < FRAME_SIZE / 2; i++) {
    const real = fftComplex[2 * i]!;
    const imag = fftComplex[2 * i + 1]!;

    powerSpectrum[i] = real * real + imag * imag;
  }

  return { fftComplex, powerSpectrum };
}
