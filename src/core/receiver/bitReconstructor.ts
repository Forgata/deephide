import { bitsToBytes } from "./bitConverter.js";

const PREAMBLE = new Uint8Array([
  1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0,
  1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1,
  1, 1,
]);

export class BitStreamReconstructor {
  private bitBuffer: number[] = [];
  private isSynchronised = false;
  private readonly PACKET_SIZE_BITS = 1536;

  /**
   * Buffers raw recovered bits and scans for the Preamble.
   * Once synced, it collects the full packet for FEC and AES.
   * @param {number} bit - the raw recovered bit
   * @returns {Uint8Array | null} - either the reconstructed packet or null if not enough data is collected
   */
  public processBit(bit: number): Uint8Array | null {
    this.bitBuffer.push(bit);

    if (!this.isSynchronised) {
      if (this.bitBuffer.length >= PREAMBLE.length) {
        const window = this.bitBuffer.slice(-PREAMBLE.length);

        let matches = 0;
        for (let i = 0; i < PREAMBLE.length; i++) {
          if (window[i] === PREAMBLE[i]) matches++;
        }

        if (matches >= 72) {
          console.log(
            `[Sync] Sync acquired: PREAMBLE detected (${matches}/80)`,
          );
          this.isSynchronised = true;
          this.bitBuffer = [];
        } else {
          if (this.bitBuffer.length > 512) {
            this.bitBuffer.shift();
          }
        }
      }
      return null;
    }

    if (this.isSynchronised && this.bitBuffer.length >= this.PACKET_SIZE_BITS) {
      const packet = bitsToBytes(this.bitBuffer);
      this.reset();
      return packet;
    }

    return null;
  }

  /**
   * Returns the current synchronisation status of the bit stream.
   * True if the preamble has been detected and the receiver is currently
   * synchronised with the transmitter, false otherwise.
   * @returns {boolean} The synchronisation status.
   */
  getSyncStatus(): boolean {
    return this.isSynchronised;
  }

  /**
   * Resets the state of the bitReconstructor.
   * Sets isSynchronised to false and clears the bitBuffer.
   */
  reset(): void {
    this.isSynchronised = false;
    this.bitBuffer = [];
  }
}
