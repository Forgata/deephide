const RS = require("@ronomon/reed-solomon");

/**
 * Forward Error Correction (FEC)
 *
 * Groups packets into blocks and adds shard for recovery
 *
 * @param packets
 * @param dataShards
 * @param parityShards
 */

export function applyFEC(
  packets: Uint8Array[],
  dataShards: number,
  parityShards: number = 3,
) {
  const totalShard = dataShards + parityShards;
  const encodedStream: Uint8Array[] = [];

  for (let i = 0; i < packets.length; i += dataShards) {
    const block = packets.slice(i, i + dataShards);

    while (block.length < totalShard) {
      block.push(new Uint8Array(packets[0]!.length).fill(0));
    }

    const shardLength = block[0]!.length;
    const buffer = Buffer.alloc(totalShard * shardLength);

    for (let j = 0; j < totalShard; j++) {
      Buffer.from(block[j]!).copy(buffer, j * shardLength);
    }

    RS.encode(buffer, dataShards, parityShards);

    for (let k = 0; k < totalShard; k++) {
      const shard = new Uint8Array(shardLength);
      shard.set(buffer.subarray(k * shardLength, (k + 1) * shardLength));
      encodedStream.push(shard);
    }
  }

  return encodedStream;
}
