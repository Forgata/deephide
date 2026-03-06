/**
 * Packetization
 * Slices the encrypted payload into manageable frames with IDs.
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
