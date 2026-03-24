import { describe, it, expect, vi } from "vitest";
import { startReceiver } from "../receiver.js";
import { AudioRingBuffer } from "../../../types/AudioRingBuffer.js";
import { applyFEC } from "../../embedding/fec/readSolomon.js";
import { createCipheriv, randomBytes } from "node:crypto";
import fs from "node:fs";

vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});

describe("Receiver E2E Integration", () => {
  // Use the same key as your runTest script for consistency
  const KEY = new Uint8Array(32).fill(0x01);
  const IV = randomBytes(12);
  const PREAMBLE = [
    1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1,
    0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0,
    0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0,
    1, 0, 1, 1, 1,
  ];

  it("should successfully recover data from a simulated bitstream", async () => {
    // --- 1. PREPARE ENCRYPTED DATA ---
    const plaintext = Buffer.from("DeepHide_Success");
    const cipher = createCipheriv("aes-256-gcm", KEY, IV);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    const encryptedPacket = Buffer.concat([IV, ciphertext, tag]);

    const padded = new Uint8Array(96).fill(0);
    padded.set(new Uint8Array(encryptedPacket));
    const shards = await applyFEC(
      [padded.slice(0, 32), padded.slice(32, 64), padded.slice(64, 96)],
      3,
      3,
    );

    const bits: number[] = [...PREAMBLE];
    for (const shard of shards) {
      for (const byte of shard) {
        for (let i = 7; i >= 0; i--) bits.push((byte >> i) & 1);
      }
    }

    // --- 2. SETUP BUFFER ---
    // We need enough room for the bits. Synced advance is 512.
    const HOP = 512;
    const totalSamples = (bits.length + 1) * HOP;
    const audioBuffer = new AudioRingBuffer(totalSamples + 2048);
    audioBuffer.push(new Int16Array(totalSamples + 1024).fill(0));

    // --- 3. MOCK DSP LAYER ---
    const binExtractor = await import("../binExtractor.js");
    const despreader = await import("../despreader.js");

    // Important: Use a closure variable to track bit progress manually
    let bitIndex = 0;

    vi.spyOn(binExtractor, "extractHiddenBin").mockImplementation(() => {
      // If we've served all bits, stop the loop by returning null
      // which eventually hits buffer.size < 1024
      if (bitIndex >= bits.length) return null;

      return {
        extractedComplexChip: new Float32Array(128).fill(0),
        safeBins: new Array(64).fill(0),
      };
    });

    vi.spyOn(despreader, "despreadBit").mockImplementation(() => {
      const bit = bits[bitIndex] ?? 0;
      bitIndex++; // Advance the "clock" every time a bit is successfully read
      return bit;
    });

    // --- 4. RUN ---
    // Increase timeout to 15s to avoid worker jitters
    await startReceiver(audioBuffer, KEY);

    // --- 5. ASSERT ---
    expect(fs.writeFileSync).toHaveBeenCalled();
    const result = vi.mocked(fs.writeFileSync).mock.calls[0]![1] as Uint8Array;
    expect(new TextDecoder().decode(result)).toContain("DeepHide_Success");
  }, 15000);
});
