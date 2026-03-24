import { describe, it, expect } from "vitest";
import { applyFEC } from "../../embedding/fec/readSolomon.js";
import { decodeFEC } from "../decodeFEC.js";

describe("FEC Round-trip (Healing)", () => {
  it("should encode, corrupt, and successfully heal data", async () => {
    const shard1 = new Uint8Array(32).fill(0x11);
    const shard2 = new Uint8Array(32).fill(0x22);
    const shard3 = new Uint8Array(32).fill(0x33);

    const encodedShards = await applyFEC([shard1, shard2, shard3], 3, 3);

    const flatPacket = new Uint8Array(192);
    encodedShards.forEach((s, i) => flatPacket.set(s, i * 32));

    const noisyPacket = new Uint8Array(flatPacket);
    noisyPacket[5] = 0x00;
    noisyPacket[100] = 0x00;

    const erasures = [false, true, true, false, true, true];
    const healedData = await decodeFEC(noisyPacket, 3, 3, erasures);

    expect(healedData.length).toBe(96);
    expect(healedData[5]).toBe(0x11);
    expect(healedData[32]).toBe(0x22);
  });
});
