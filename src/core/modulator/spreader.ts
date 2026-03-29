/**
 * DSSS Spreading Algorithm
 * Transforms bits into a spreading signal (chips) for injection
 */

export class Spreader {
  private readonly SF: number = 64;
  private chipIndex: number = 0;
  private currentBit: number | null = null;
  private pnSequence: Int8Array;

  constructor(seed: number = 0xaec2) {
    this.pnSequence = this.generatePN(1024, seed);
  }

  /**
   * Generates a PN sequence of the given length using the provided seed.
   * The generated PN sequence is an array of 64-bit signed integers.
   * The seed value is used to initialize the LFSR.
   * @param length The length of the PN sequence to be generated
   * @param seed The seed value to initialize the LFSR
   * @returns An array of 64-bit signed integers representing the generated PN sequence
   */
  private generatePN(length: number, seed: number): Int8Array {
    const pn = new Int8Array(length);
    let lfsr = seed || 0xaec2;

    for (let i = 0; i < length; i++) {
      lfsr ^= lfsr << 13;
      lfsr ^= lfsr >> 17;
      lfsr ^= lfsr << 5;
      pn[i] = lfsr & 1 ? 1 : -1;
    }
    return pn;
  }

  /**
   * Retrieves the next modulation chip for the given bit stream at the current bit index.
   * The method will move to the next bit in the bit stream after generating 64 chips.
   * @param bitstream The bit stream containing the data to be injected
   * @param bitPtr The current index of the bit stream
   * @returns The next modulation chip or null if the bit index has reached the end of the bit stream
   */
  public getNextChip(
    bitstream: Uint8Array,
    bitPtr: { index: number },
  ): number | null {
    if (bitPtr.index >= bitstream.length) return null;

    const symbol = bitstream[bitPtr.index] === 1 ? 1 : -1;
    const pnChip = this.pnSequence[this.chipIndex % this.pnSequence.length]!;
    const modulatedChip = symbol * pnChip;

    this.chipIndex++;
    if (this.chipIndex >= this.SF) {
      this.chipIndex = 0;
      bitPtr.index++;
    }

    return modulatedChip;
  }
}
