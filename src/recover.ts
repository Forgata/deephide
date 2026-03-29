import wavefile from "wavefile";
import fs from "node:fs";
import { AudioRingBuffer } from "./types/AudioRingBuffer.js";
import { startReceiver } from "./core/receiver/receiver.js";

async function runTest() {
  const fileBuffer = fs.readFileSync("output.wav");
  const wav = new wavefile.WaveFile(fileBuffer);

  const samples = wav.getSamples(false, Int16Array) as unknown as Int16Array;
  const ringBuffer = new AudioRingBuffer(samples.length);
  ringBuffer.push(samples);

  const key = new Uint8Array(32).fill(0x01);

  console.log("Scanning output.wav for hidden bitstream...");
  await startReceiver(ringBuffer, key);
}

runTest().catch(console.error);
