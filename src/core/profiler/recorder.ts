import { PvRecorder } from "@picovoice/pvrecorder-node";
import { buffer } from "../../types/AudioRingBuffer.js";
import { processSTFT } from "./processFrame.js";
import { PNGenerator } from "../modulator/pnGen.js";
import { processIFFT } from "../recombination/ifft.js";
import { overlapAdd } from "../recombination/reconstructor.js";
import { floatToInt16 } from "../recombination/pcmConverter.js";
import { collectOutput, saveWAV } from "../recombination/writer.js";

export async function recorder(bitstream: Uint8Array) {
  const frameSize = 512;
  const pvRecorder = new PvRecorder(frameSize, -1);
  const pnGen = new PNGenerator(0xace1);
  const bitPtr = { index: 0 };

  pvRecorder.start();

  try {
    while (pvRecorder.isRecording) {
      const frames = await pvRecorder.read();
      buffer.push(frames);

      if (buffer.size >= 1024) {
        const modifiedFrames = processSTFT(buffer, bitstream, bitPtr, pnGen);

        for (const frame of modifiedFrames) {
          console.log(
            `Frame: ${frame.frameIndex} | Progress: ${bitPtr.index}/${bitstream.length}`,
          );

          const timeframe = processIFFT(frame.spectrum);
          const synthFrame = overlapAdd(timeframe);
          const pcmFrame = floatToInt16(synthFrame);

          collectOutput(pcmFrame);
        }

        if (bitPtr.index >= bitstream.length) {
          console.log("SUCCESS! Payload fully modulated into spectra.");
          saveWAV("output.wav");
          pvRecorder.stop();
        }
      }
    }
  } catch (error: unknown) {
    pvRecorder.stop();
    console.error(error);
  } finally {
    pvRecorder.release();
  }
}
