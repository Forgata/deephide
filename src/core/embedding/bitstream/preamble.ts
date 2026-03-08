/**
 * Prepends a fixed high-entropy sync preamble to a bitstream.
 *
 * @param payloadBits - Bit array of 0/1 values to append after the preamble.
 * @returns A new Uint8Array containing the preamble followed by `payloadBits`.
 */

export function injectPreamble(payloadBits: Uint8Array) {
  const PREAMBLE = new Uint8Array([
    1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1,
    0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0,
    0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0,
    1, 0, 1, 1, 1,
  ]);

  const totalBits = PREAMBLE.length + payloadBits.length;
  const syncStream = new Uint8Array(totalBits);

  syncStream.set(PREAMBLE, 0);
  syncStream.set(payloadBits, PREAMBLE.length);

  return syncStream;
}
