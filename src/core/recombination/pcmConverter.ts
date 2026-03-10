/**
 * Converts Float32 audio samples to Int16 PCM
 * Clamps values to prevent wrap-around distortion.
 */

export function floatToInt16(floatFrame: Float32Array): Int16Array {
  const intFrame = new Int16Array(floatFrame.length);

  for (let i = 0; i < floatFrame.length; i++) {
    let s = floatFrame[i]! * 32767.0;

    if (s > 32767.0) s = 32767.0;
    if (s < -32768.0) s = -32768.0;

    intFrame[i] = Math.round(s);
  }

  return intFrame;
}
