/**
 * DSSS Spreader
 * Multiplies a bipolar symbol by a PN sequence.
 */

export class DSSS_Spreader {
  /**
   * Spreads a symbol into a chip array.
   * @param symbol bipolar symbol
   * @param pnSequence 64-chip PN sequence
   * @returns Float32Array of 64 spread chips
   */

  static spread(symbol: number, pnSequence: Float32Array): Float32Array {
    const spreadChips = new Float32Array(pnSequence.length);

    for (let i = 0; i < pnSequence.length; i++)
      spreadChips[i] = pnSequence[i]! * symbol;

    return spreadChips;
  }
}
