/**
 * Splits the encrypted payload into frames of a specified size (default 512 bytes) and
 * assigns each frame a unique identifier. The frames are then returned as an array of
 * Uint8Arrays, where each frame has the following structure: [frameId (4 bytes), chunk (n bytes)]
 *
 * @param {Uint8Array} encryptedData - The encrypted payload to be split into frames
 * @param {number} [frameSize=512] - The size of each frame in bytes
 * @returns {Uint8Array[]} - An array of frames, each containing a frameId and a chunk of the encrypted data
 */
export function packetize(
  encryptedData: Uint8Array,
  frameSize: number = 512,
): Uint8Array[] {
  const frames: Uint8Array[] = [];
  const totalBytes = encryptedData.length;

  let offset = 0;
  let frameId = 0;

  while (offset < totalBytes) {
    const end = Math.min(offset + frameSize, totalBytes);
    const chunk = encryptedData.slice(offset, end);

    const frame = new Uint8Array(4 + chunk.length);
    const view = new DataView(frame.buffer);

    view.setUint32(0, frameId, false);
    frame.set(chunk, 4);
    frames.push(frame);

    offset += frameSize;
    frameId++;
  }

  return frames;
}
