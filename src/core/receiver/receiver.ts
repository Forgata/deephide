import fs from "node:fs";
import { AudioRingBuffer } from "../../types/AudioRingBuffer.js";
import { processFFT } from "../profiler/fft.js";
import { PNGenerator } from "../modulator/pnGen.js";
import { despreadBit } from "./despreader.js";
import { decryptPayload } from "./decryptor.js";
import { decodeFEC } from "./decodeFEC.js";
import { extractHiddenBin } from "./binExtractor.js";
import { BitStreamReconstructor } from "./bitReconstructor.js";

const FRAME_SIZE = 1024;
const HOP_SIZE = 512;
const CHIP_COUNT = 64;

/**
 * Robust Receiver Orchestrator
 * Matches the STFT logic of the transmitter.
 */
export async function startReceiver(buffer: AudioRingBuffer, key: Uint8Array) {
  const reconstructor = new BitStreamReconstructor();
  const pnGen = new PNGenerator(0xace1);
  const pnSequence = pnGen.generateSequence(CHIP_COUNT);

  console.log("DeepHide Receiver: Scanning for Preamble...");
  console.log(
    `Config: Frame=${FRAME_SIZE}, Hop=${HOP_SIZE}, Mode=Differential Phase`,
  );

  let lockedBins: number[] | null = null;
  let bestMatch = 0;

  while (buffer.size >= FRAME_SIZE) {
    const rawFrames = buffer.getFrames(FRAME_SIZE);
    const windowedFrames = new Float32Array(rawFrames);
    for (let i = 0; i < FRAME_SIZE; i++) {
      windowedFrames[i]! *=
        0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (FRAME_SIZE - 1));
    }

    const fftResult = processFFT(windowedFrames);
    const extraction = extractHiddenBin(fftResult, lockedBins);

    if (extraction) {
      const bit = despreadBit(extraction.extractedComplexChip, pnSequence);
      const packet = reconstructor.processBit(bit);

      if (reconstructor.getSyncStatus() && !lockedBins) {
        lockedBins = extraction.safeBins;
        console.log(`\n[!] SYNC ACQUIRED!`);
        console.log(
          `[!] Bins Locked: ${lockedBins.length} frequencies identified.`,
        );

        buffer.advance(HOP_SIZE);
        continue;
      }

      if (packet) {
        console.log("\n[+] Full Packet Bufferized. Healing via FEC...");
        try {
          const healedData = await decodeFEC(packet, 3, 3);
          const originalFile = decryptPayload(healedData, key);

          fs.writeFileSync("recovered_file.txt", originalFile);

          console.log(">>> SUCCESS: FILE FULLY RECOVERED <<<");

          return;
        } catch (error: any) {
          console.error(`\n[!] Pipeline Crash: ${error.message}`);
          console.log("[!] Resetting to Hunt Mode...");
          reconstructor.reset();
          lockedBins = null;
        }
      }
    }

    if (reconstructor.getSyncStatus()) {
      buffer.advance(HOP_SIZE);
    } else {
      buffer.advance(1);

      if (buffer.size % 50000 === 0) {
        process.stdout.write(".");
      }
    }

    if (buffer.size % (FRAME_SIZE * 5) === 0) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  }

  console.log("\n[!] Stream end reached. No preamble detected.");
}
