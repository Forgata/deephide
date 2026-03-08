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

  private generatePN(length: number, seed: number): Int8Array {
    const pn = new Int8Array(length);
    let lsfr = seed;

    for (let i = 0; i < length; i++) {
      lsfr ^= lsfr >> 7;
      lsfr ^= lsfr << 9;
      lsfr ^= lsfr >> 13;

      pn[i] = (lsfr & 1) === 1 ? 1 : -1;
    }
    return pn;
  }

  /**
   * @returns the next modulation chip for the bit stream
   */

  public getNextChip(
    bitstream: Uint8Array,
    bitPtr: { index: number },
  ): number | null {
    if (bitPtr.index >= bitstream.length) return null;

    if (this.currentBit === 0)
      this.currentBit = bitstream[bitPtr.index++] === 1 ? 1 : -1;

    const pnChip = this.pnSequence[this.chipIndex % this.pnSequence.length]!;

    const modulatedChip = this.currentBit! * pnChip;
    this.chipIndex++;

    if (this.chipIndex > this.SF) {
      this.chipIndex = 0;
      bitPtr.index++;
    }

    return modulatedChip;
  }
}
