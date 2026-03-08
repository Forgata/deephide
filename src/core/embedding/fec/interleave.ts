/**
 * Distributes input shards so that shards from the same Reed–Solomon block are separated in the output order.
 *
 * @param shards - Input shard buffers in their original (block-consecutive) order.
 * @param dataShards - Number of data shards per Reed–Solomon block.
 * @param parityShards - Number of parity shards per Reed–Solomon block.
 * @returns The same shard buffers reordered into an interleaved array so consecutive physical errors affect different RS blocks.
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
