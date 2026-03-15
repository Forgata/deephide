/**
 * Unpacks an array of interleaved shards into a bitstream.
 * Iterates over each shard and extracts each byte into its constituent bits.
 * The resulting bitstream is a flattened array of bits.
 * @param interleadShards The array of interleaved shard to be unpacked
 * @returns The unpacked bitstream
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
