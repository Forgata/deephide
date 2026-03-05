import { PvRecorder } from "@picovoice/pvrecorder-node";
import { buffer } from "../../types/AudioRingBuffer.js";
import { processSTFT } from "./processFrame.js";

export async function recorder() {
  const frameSize = 512;
  const pvRecorder = new PvRecorder(frameSize, -1);

  pvRecorder.start();

  try {
    while (pvRecorder.isRecording) {
      const frames = await pvRecorder.read();
      buffer.push(frames);

      if (buffer.size >= 1024) {
        const maskingMap = processSTFT(buffer);
        if (maskingMap.length > 0) {
          console.log(
            "Processed Frame Index:",
            maskingMap[maskingMap.length - 1]!.frameIndex,
          );
          console.log(
            "Safe Bins:",
            maskingMap[maskingMap.length - 1]!.safeBins.length,
          );
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
