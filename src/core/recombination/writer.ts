import wavefile from "wavefile";
import fs from "node:fs";

let pcmAccumulator: Int16Array[] = [];

export function collectOutput(pcmFrame: Int16Array): void {
  // const newBuffer = new Int16Array(pcmAccumulator.length + pcmFrame.length);
  // newBuffer.set(pcmAccumulator);
  // newBuffer.set(pcmFrame, pcmAccumulator.length);
  // pcmAccumulator = newBuffer;

  pcmAccumulator.push(new Int16Array(pcmFrame));
}

export function saveWAV(filename: string = "output.wav"): void {
  if (pcmAccumulator.length === 0) {
    console.warn("No data to save.");
    return;
  }
  let totalLength = 0;
  for (const frame of pcmAccumulator) totalLength += frame.length;
  const merged = new Int16Array(totalLength);

  let offset = 0;
  for (const frame of pcmAccumulator) {
    merged.set(frame, offset);
    offset += frame.length;
  }
  const wav = new wavefile.WaveFile();
  wav.fromScratch(1, 16000, "16", merged);
  fs.writeFileSync(filename, wav.toBuffer());
  console.log(`\n stealth audio saved: ${filename}`);
  pcmAccumulator = [];
}
