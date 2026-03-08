import type { AudioRingBuffer } from "../../types/AudioRingBuffer.js";
import { DSSS_Spreader } from "../modulator/dsss.js";
import { embedFrameChips } from "../modulator/embedChips.js";
import { BinMapper } from "../modulator/mapping/binMapper.js";
import type { PNGenerator } from "../modulator/pnGen.js";
import { processFFT } from "./fft.js";
import { computeBarkEnergy, identifySafeBins } from "./freqBarkMap.js";
import { estimateMasking } from "./masking.js";
import { HAMMING_WINDOW } from "./window.js";

const HOP_SIZE = 512;
const FRAME_SIZE = 1024;

let frameCount = 0;

export function processSTFT(
  audioBuffer: AudioRingBuffer,
  bitstream: Uint8Array,
  bitPtr: { index: number },
  pnGen: PNGenerator,
) {
  const outSpectra = [];

  while (audioBuffer.size >= FRAME_SIZE) {
    const frames = audioBuffer.getFrames(FRAME_SIZE);

    for (let i = 0; i < FRAME_SIZE; i++)
      frames[i] = frames[i]! * HAMMING_WINDOW[i]!;

    console.log("Frame min/max:", Math.min(...frames), Math.max(...frames));

    const fftComplex = processFFT(frames);
    const bandEnergy = computeBarkEnergy(fftComplex);
    const maskingThresholds = estimateMasking(bandEnergy);
    const safeBins = identifySafeBins(fftComplex, maskingThresholds);

    console.log(`Found ${safeBins.length} safe bins for data injection`);

    let finalSpectrum = fftComplex;

    if (safeBins.length >= 64 && bitPtr.index < bitstream.length) {
      const bit = bitstream[bitPtr.index]!;
      const symbol = (bit << 1) - 1;
      const pnSequence = pnGen.generateSequence(64);
      const spreadChips = DSSS_Spreader.spread(symbol, pnSequence);

      const chipMap = BinMapper.mapToBins(spreadChips, safeBins, frameCount);
      finalSpectrum = embedFrameChips(fftComplex, chipMap, FRAME_SIZE, 0.02);
      bitPtr.index++;
    }

    const map = {
      frameIndex: frameCount++,
      safeBins,
      bandEnergy: new Float32Array(bandEnergy),
      maskingThresholds: new Float32Array(maskingThresholds),
    };

    outSpectra.push({
      spectrum: finalSpectrum,
      frameIndex: frameCount++,
    });

    audioBuffer.advance(HOP_SIZE);
  }

  return outSpectra;
}
