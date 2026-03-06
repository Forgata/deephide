/**
 * Sync Preamble
 * Prepends a high-entropy sync pattern to the bitstream.
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
