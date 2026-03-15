/**
 * Safe Bin Mapping
 *
 * Maps chips to safe FFT bins using the PN-based shuffle
 */

export class BinMapper {
  /**
   * Maps 64 chips to a randomized subset of safe FFT bins using the PN-based shuffle.
   * The mapping is frame-specific and can be reproduced by providing the same seed.
   * @param chips 64 spread chips
   * @param safeBins List of indices of safe FFT bins
   * @param seed Frame-specific or shared seed for shuffling
   * @returns A map of safe bin indices to chip values
   */
  static mapToBins(
    chips: Float32Array,
    safeBins: number[],
    seed: number,
  ): Map<number, number> {
    const map = new Map<number, number>();

    const shuffledBins = [...safeBins];
    let tempSeed = seed;

    for (let i = shuffledBins.length - 1; i > 0; i--) {
      tempSeed = (tempSeed * 1680721) % 2147483647;
      const j = tempSeed % (i + 1);

      [shuffledBins[i], shuffledBins[j]] = [shuffledBins[j]!, shuffledBins[i]!];
    }

    for (let i = 0; i < chips.length; i++) {
      const binIndex = shuffledBins[i % shuffledBins.length]!;
      map.set(binIndex, chips[i]!);
    }

    return map;
  }
}
