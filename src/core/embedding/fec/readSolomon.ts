import { ReedSolomonErasure } from "@subspace/reed-solomon-erasure.wasm";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let rsInstance: ReedSolomonErasure | null = null;

/**
 * Lazily initializes and returns a singleton ReedSolomonErasure engine loaded from the package's WASM binary.
 *
 * Loads "reed_solomon_erasure_bg.wasm" from the installed @subspace/reed-solomon-erasure.wasm package, caches the created instance, and reuses it for subsequent calls. Throws an Error if the wasm file is not found at the expected location.
 *
 * @returns A cached or newly created ReedSolomonErasure instance
 */
async function getRSEngine(): Promise<ReedSolomonErasure> {
  if (!rsInstance) {
    const pkgPath = require.resolve("@subspace/reed-solomon-erasure.wasm");
    const pkgDir = path.dirname(pkgPath);

    const wasmPath = path.join(pkgDir, "reed_solomon_erasure_bg.wasm");
    if (!fs.existsSync(wasmPath)) {
      throw new Error(`WASM file missing! Looked for it at: ${wasmPath}`);
    }

    const wasmBuffer = fs.readFileSync(wasmPath);
    rsInstance = ReedSolomonErasure.fromBytes(wasmBuffer);
  }
  return rsInstance;
}

/**
 * Encode an array of packets into data and parity shards using Reed–Solomon FEC.
 *
 * Encodes the input packets in sequential blocks of `dataShards`, producing `dataShards + parityShards`
 * fixed-size shards per block and returning them as a flat array (data shards followed by parity shards
 * for each block).
 *
 * @param packets - Array of equal-length `Uint8Array` packets to encode. An empty array returns an empty result.
 * @param dataShards - Number of data shards per block.
 * @param parityShards - Number of parity shards to produce per block (default: 3).
 * @returns A flat `Uint8Array[]` containing all encoded shards; for each input block the first `dataShards`
 * are the original data shards (padded as needed) followed by `parityShards` parity shards.
 * @throws Error if the underlying WASM Reed–Solomon encoder returns a non-OK result.
 */

export async function applyFEC(
  packets: Uint8Array[],
  dataShards: number,
  parityShards: number = 3,
): Promise<Uint8Array[]> {
  if (packets.length === 0) return [];

  const rs = await getRSEngine();
  const shardLength = packets[0]!.length;
  const encodedStream: Uint8Array[] = [];

  for (let i = 0; i < packets.length; i += dataShards) {
    const block = packets.slice(i, i + dataShards);

    const totalShards = dataShards + parityShards;
    const contiguousBuffer = new Uint8Array(totalShards * shardLength);

    for (let j = 0; j < dataShards; j++) {
      if (block[j]) {
        contiguousBuffer.set(block[j]!, j * shardLength);
      }
    }

    const result = rs.encode(contiguousBuffer, dataShards, parityShards);

    if (result !== ReedSolomonErasure.RESULT_OK) {
      throw new Error(`WASM FEC Encoding failed with internal code: ${result}`);
    }

    for (let j = 0; j < totalShards; j++) {
      const shard = contiguousBuffer.slice(
        j * shardLength,
        (j + 1) * shardLength,
      );
      encodedStream.push(shard);
    }
  }

  return encodedStream;
}
