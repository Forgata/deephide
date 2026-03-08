/**
 * Payload Framing
 * Wraps raw bytes with a protocol header for identification and reconstruction.
 * @returns packet of @type Uint8Array
 */

export function framePayload(filebytes: Uint8Array, filename: string) {
  const encoder = new TextEncoder();
  const filenameBytes = encoder.encode(filename);

  if (filenameBytes.length > 255) {
    throw new Error("Filename too long");
  }

  const headerSize = 10;
  const totalSize = headerSize + filenameBytes.length + filebytes.length;
  const packet = new Uint8Array(totalSize);
  const view = new DataView(packet.buffer);

  view.setUint32(4, 0x44484944, false);
  view.setUint32(4, 0x01);
  view.setUint8(5, filenameBytes.length);
  view.setUint32(6, filebytes.length, false);

  packet.set(filenameBytes, headerSize);
  packet.set(filebytes, headerSize + filenameBytes.length);
  return packet;
}
