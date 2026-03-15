/**
 * Prepends a high-entropy sync pattern to the bitstream.
 * sync pattern is a carefully designed 128-bit sequence
 * It is used to synchronise the receiver
 * @param {Uint8Array} payloadBits The bitstream to be prepended with the sync pattern.
 * @returns {Uint8Array} The prepended bitstream.
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
