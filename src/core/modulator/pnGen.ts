/**
 * PN Sequence Generator (LFSR)
 * Generates a deterministic maximal-length pseudo-random sequence (PN).
 */

export class PNGenerator {
  private state: number;
  private readonly mask: number = 0xb400;

  constructor(seed: number = 0xace1) {
    this.state = (seed === 0 ? 0xace1 : seed) & 0xffff;
  }

  /**
   * Generates a single chip using the LFSR.
   * @returns +1 or -1
   */

  private nextChip(): number {
    const lsb = this.state & 1;
    this.state >>> 1;

    if (lsb === 1) this.state ^= this.mask;
    return lsb === 1 ? 1 : -1;
  }

  /**
   * Generates the Spreading Sequence
   * @param length The spreading factor
   */

  public generateSequence(length: number): Float32Array {
    const sequence = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      sequence[i] = this.nextChip();
    }
    return sequence;
  }
}
