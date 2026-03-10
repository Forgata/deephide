import wavefile from "wavefile";
import fs from "node:fs";

let pcmAccumulator: Int16Array[] = [];

export function collectOutput(pcmFrame: Int16Array): void {
  // const newBuffer = new Int16Array(pcmAccumulator.length + pcmFrame.length);
  // newBuffer.set(pcmAccumulator);
  // newBuffer.set(pcmFrame, pcmAccumulator.length);
  // pcmAccumulator = newBuffer;

  pcmAccumulator.push(pcmFrame.slice());
}

export function saveWAV(filename: string = "output.wav"): void {
  const wav = new wavefile.WaveFile();
  wav.fromScratch(1, 16000, "16", pcmAccumulator);
  fs.writeFileSync(filename, wav.toBuffer());
  console.log(`\n stealth audio saved: ${filename}`);
  // pcmAccumulator = new Int16Array(0);
}
