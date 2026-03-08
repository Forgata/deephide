/**
 * Spectral Embedding
 * Injects DSSS chips into the FFT spectrum.
 */

export function embedFrameChips(
  fftComplex: Float32Array,
  chipMap: Map<number, number>,
  N: number,
  delta: number = 0.02,
) {
  const modifiedFFT = new Float32Array(fftComplex);

  for (const [binIndex, chipValue] of chipMap.entries()) {
    const rIndex = binIndex * 2;
    const iIndex = rIndex + 1;

    const real = fftComplex[rIndex]!;
    const imag = fftComplex[iIndex]!;
    const magnitude = Math.sqrt(real * real + imag * imag);
    const originalPhase = Math.atan2(imag, real);

    const newPhase = originalPhase + (chipValue + delta);

    const newReal = magnitude * Math.cos(newPhase);
    const newImag = magnitude * Math.sin(newPhase);

    modifiedFFT[rIndex] = newReal;
    modifiedFFT[iIndex] = newImag;

    const mirrorBin = N - binIndex;
    if (mirrorBin > binIndex && mirrorBin < N) {
      const mirrorRIndex = mirrorBin * 2;
      const mirrorIIndex = mirrorRIndex + 1;

      modifiedFFT[mirrorRIndex] = newReal;
      modifiedFFT[mirrorIIndex] = -newImag;
    }
  }

  return modifiedFFT;
}
