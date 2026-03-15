/**
 * Reorders shard so that consecutive physical errors are distributed
 * across different logical RS blocks.
 *
 * @param shard - The shards array to be interleaved
 * @param dataShards - The number of data shard per block
 * @param parityShards - The number of parity shard per block
 * @returns The interleaved shard array
 */
export function interleave(
  shards: Uint8Array[],
  dataShards: number,
  parityShards: number,
) {
  const totalShardsPerBlock = dataShards + parityShards;
  const numBlocks = Math.ceil(shards.length / totalShardsPerBlock);
  const interleaved: Uint8Array[] = new Array(shards.length);

  let index = 0;
  for (let col = 0; col < totalShardsPerBlock; col++) {
    for (let row = 0; row < numBlocks; row++) {
      const sourceIdx = row * totalShardsPerBlock + col;

      if (sourceIdx < shards.length) {
        interleaved[index++] = shards[sourceIdx]!;
      }
    }
  }

  return interleaved;
}
