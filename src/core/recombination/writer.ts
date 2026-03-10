import wavefile from "wavefile";
import fs from "node:fs";

let pcmAccumulator: Int16Array[] = [];

export function collectOutput(pcmFrame: Int16Array): void {
  pcmAccumulator.push(pcmFrame.slice());
}

export function saveWAV(filename: string = "output.wav"): void {
  const wav = new wavefile.WaveFile();
  wav.fromScratch(1, 16000, "16", pcmAccumulator);
  fs.writeFileSync(filename, wav.toBuffer());
  console.log(`\n stealth audio saved: ${filename}`);
}
