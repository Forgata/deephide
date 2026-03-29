import { getRSEngine } from "../embedding/fec/readSolomon.js";

/**
 * Attempts to heal a flat, interleaved packet using Reed-Solomon error correction.
 * @param flatPacket The interleaved packet to be healed
 * @param dataShards The number of data shards per block
 * @param parityShards The number of parity shard per block (defaults to 3)
 * @param knownErasures An optional array of booleans indicating which shards are known to be erroneous
 * @returns A promise resolving to a healed packet, or throwing if the healing fails
 */
export async function decodeFEC(
  flatPacket: Uint8Array,
  dataShards: number,
  parityShards: number = 3,
  knownErasures?: boolean[], // Add this
): Promise<Uint8Array> {
  const rs = await getRSEngine();
  const totalShards = dataShards + parityShards;
  const shardLength = flatPacket.length / totalShards;

  const workBuffer = new Uint8Array(flatPacket);

  const shardPresent = knownErasures || new Array(totalShards).fill(true);

  const result = rs.reconstruct(
    workBuffer,
    dataShards,
    parityShards,
    shardPresent,
  );

  if (result !== 0) {
    throw new Error(`RS Reconstruct failed with code: ${result}`);
  }

  return workBuffer.slice(0, dataShards * shardLength);
}
