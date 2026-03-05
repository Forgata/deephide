import type { AudioRingBuffer } from "../../types/AudioRingBuffer.js";
import { processFFT } from "./fft.js";
import { computeBarkEnergy, identifySafeBins } from "./freqBarkMap.js";
import { estimateMasking } from "./masking.js";
import { HAMMING_WINDOW } from "./window.js";

const HOP_SIZE = 512;
const FRAME_SIZE = 1024;

let frameCount = 0;

export function processSTFT(audioBuffer: AudioRingBuffer) {
  const maskingMap = [];

  while (audioBuffer.size >= FRAME_SIZE) {
    const frames = audioBuffer.getFrames(FRAME_SIZE);

    for (let i = 0; i < FRAME_SIZE; i++)
      frames[i] = frames[i]! * HAMMING_WINDOW[i]!;

    const powerSpectrum = processFFT(frames);

    const bandEnergy = new Float32Array(computeBarkEnergy(powerSpectrum));

    const maskingThresholds = new Float32Array(estimateMasking(bandEnergy));

    const safeBins = identifySafeBins(powerSpectrum, maskingThresholds);

    // console.log(`Found ${safeBins.length} safe bins for data injection`);

    const map = {
      frameIndex: frameCount++,
      safeBins,
      bandEnergy,
      maskingThresholds,
    };

    maskingMap.push(map);

    audioBuffer.advance(HOP_SIZE);
  }

  return maskingMap;
}
