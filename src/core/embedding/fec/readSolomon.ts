import { ReedSolomonErasure } from "@subspace/reed-solomon-erasure.wasm";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let rsInstance: ReedSolomonErasure | null = null;

/**
 * Returns an instance of the Reed-Solomon Erasure algorithm.
 * If the instance has not been created yet, it will be created by loading the WASM module.
 * If the WASM file is missing, it will throw an error.
 * @returns {Promise<ReedSolomonErasure>} A promise which resolves with the instance of the Reed-Solomon Erasure algorithm.
 */
export async function getRSEngine(): Promise<ReedSolomonErasure> {
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
 * Applies Forward Error Correction (FEC) to a series of packets.
 * Groups packets into blocks and adds parity shards for recovery.
 * @param packets - The packets to be encoded
 * @param dataShards - The number of data shards per block
 * @param parityShards - The number of parity shards per block (defaults to 3)
 * @returns A promise resolving to an array of encoded packets
 * @throws Error if the WASM encoding fails with an internal code
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
