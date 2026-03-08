/**
 * Serializes an array of byte shards into a flat bit array.
 *
 * Each input shard is processed in order and each byte is expanded into eight elements
 * containing `0` or `1`. Bits for a single byte are emitted from least-significant to
 * most-significant (LSB first).
 *
 * @param interleadShards - Array of `Uint8Array` shards whose bytes will be unpacked into bits
 * @returns A `Uint8Array` of `0`/`1` values representing the concatenated bits of all input bytes
 */

export function serialiseBits(interleadShards: Uint8Array[]): Uint8Array {
  const totalBytes = interleadShards.reduce(
    (acc, shard) => acc + shard.length,
    0,
  );
  const bitstream = new Uint8Array(totalBytes * 8);

  let bitIndex = 0;
  for (const shard of interleadShards) {
    for (let i = 0; i < shard.length; i++) {
      const byte = shard[i];

      for (let shift = 0; shift < 8; shift++) {
        bitstream[bitIndex++] = (byte! >> shift) & 1;
      }
    }
  }
  return bitstream;
}
