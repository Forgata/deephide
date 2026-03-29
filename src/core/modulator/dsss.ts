/**
 * DSSS Spreader
 * Multiplies a bipolar symbol by a PN sequence.
 */

export class DSSS_Spreader {
  /**
   * Spreads a symbol into a chip array by multiplying it with a PN sequence.
   * @param symbol bipolar symbol to be spread
   * @param pnSequence 64-chip PN sequence to spread the symbol with
   * @returns Float32Array of 64 spread chips
   */
  static spread(symbol: number, pnSequence: Float32Array): Float32Array {
    const spreadChips = new Float32Array(pnSequence.length);

    for (let i = 0; i < pnSequence.length; i++)
      spreadChips[i] = pnSequence[i]! * symbol;

    return spreadChips;
  }
}
