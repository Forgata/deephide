import { PvRecorder } from "@picovoice/pvrecorder-node";
import { buffer } from "../../types/AudioRingBuffer.js";
import { processSTFT } from "./processFrame.js";

export async function recorder(bitstream: Uint8Array) {
  const frameSize = 512;
  const pvRecorder = new PvRecorder(frameSize, -1);
  let bitPtr = 0;

  pvRecorder.start();

  try {
    while (pvRecorder.isRecording) {
      const frames = await pvRecorder.read();
      buffer.push(frames);

      if (buffer.size >= 1024) {
        const maskingMap = processSTFT(buffer);

        if (maskingMap.length > 0) {
          const latestFrame = maskingMap[maskingMap.length - 1]!;
          const safebins = latestFrame.safeBins;

          if (safebins.length > 0 && bitPtr < bitstream.length) {
            for (const bitIndex of safebins) {
              if (bitPtr >= bitstream.length) break;

              const currentBit = bitstream[bitPtr];

              bitPtr++;
            }
          }

          console.log(
            `Frame: ${latestFrame.frameIndex} | Safe Bins: ${safebins.length} | Progress: ${bitPtr}/${bitstream.length} bits`,
          );
          if (bitPtr >= bitstream.length)
            console.log("SUCCESS! entire bitstream injected");
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
