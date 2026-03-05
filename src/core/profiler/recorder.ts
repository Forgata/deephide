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
    }
    const maskingMap = processSTFT(buffer);
    console.log(maskingMap);
  } catch (error: unknown) {
    pvRecorder.stop();
    console.error(error);
  } finally {
    pvRecorder.release();
  }
}
