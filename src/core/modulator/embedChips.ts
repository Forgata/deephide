/**
 * Embeds DSSS chips into the FFT spectrum of a frame.
 * @param fftComplex The complex FFT of the frame to be modified
 * @param chipMap A map of bin indices to chip values to be embedded
 * @param N The number of frequency bins in the FFT
 * @param delta The phase shift in radians per chip
 * @returns The modified FFT with the chips embedded
 */
export function embedFrameChips(
  fftComplex: Float32Array | number[],
  chipMap: Map<number, number>,
  N: number,
  delta: number = 0.02,
) {
  const modifiedFFT = new Float32Array(fftComplex);

  for (const [binIndex, chipValue] of chipMap.entries()) {
    const rIndex = binIndex * 2;
    const iIndex = rIndex + 1;

    if (iIndex >= fftComplex.length) {
      continue;
    }

    const real = fftComplex[rIndex]!;
    const imag = fftComplex[iIndex]!;
    const magnitude = Math.sqrt(real * real + imag * imag);
    const originalPhase = Math.atan2(imag, real);

    const newPhase = originalPhase + chipValue * delta;

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
