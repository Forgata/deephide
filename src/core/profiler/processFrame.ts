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
interface FrameState {
  count: number;
}

export function processSTFT(
  audioBuffer: AudioRingBuffer,
  bitstream: Uint8Array,
  bitPtr: { index: number },
  pnGen: PNGenerator,
  frameState: FrameState = { count: 0 },
) {
  const outSpectra = [];

  while (audioBuffer.size >= FRAME_SIZE) {
    const rawFrames = audioBuffer.getFrames(FRAME_SIZE);
    const frames = new Float32Array(rawFrames);

    for (let i = 0; i < FRAME_SIZE; i++)
      frames[i] = frames[i]! * HAMMING_WINDOW[i]!;

    console.log("Frame min/max:", Math.min(...frames), Math.max(...frames));

    const { fftComplex, powerSpectrum } = processFFT(frames);
    const bandEnergy = computeBarkEnergy(powerSpectrum);
    const maskingThresholds = estimateMasking(bandEnergy);
    const safeBins = identifySafeBins(powerSpectrum, maskingThresholds);

    console.log(`Found ${safeBins.length} safe bins for data injection`);

    let finalSpectrum: Float32Array = new Float32Array(fftComplex);

    if (safeBins.length >= 64 && bitPtr.index < bitstream.length) {
      const bit = bitstream[bitPtr.index]!;
      const symbol = (bit << 1) - 1;
      const pnSequence = pnGen.generateSequence(64);
      const spreadChips = DSSS_Spreader.spread(symbol, pnSequence);

      const chipMap = BinMapper.mapToBins(
        spreadChips,
        safeBins,
        frameState.count,
      );
      finalSpectrum = embedFrameChips(fftComplex, chipMap, FRAME_SIZE, 0.02);
      bitPtr.index++;
    }

    const currentFrameIndex = frameState.count++;

    outSpectra.push({
      spectrum: finalSpectrum,
      frameIndex: currentFrameIndex,
      safeBins,
      bandEnergy: new Float32Array(bandEnergy),
      maskingThresholds: new Float32Array(maskingThresholds),
    });
    audioBuffer.advance(HOP_SIZE);
  }

  return outSpectra;
}
