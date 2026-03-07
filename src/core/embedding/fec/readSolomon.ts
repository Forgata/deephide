import { ReedSolomonErasure } from "@subspace/reed-solomon-erasure.wasm";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
let rsInstance: ReedSolomonErasure | null = null;

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
