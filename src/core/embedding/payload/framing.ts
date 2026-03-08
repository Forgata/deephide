/**
 * Wraps file bytes and filename with a 10-byte protocol header to produce a single packet.
 *
 * The resulting packet layout is: 10-byte header, filename bytes, then file bytes.
 *
 * @param filebytes - Raw file data to place into the packet
 * @param filename - File name which will be UTF-8 encoded and included immediately after the header (encoded length must be <= 255)
 * @returns A Uint8Array containing the header followed by the filename bytes and the file bytes
 * @throws Error when the UTF-8 encoded `filename` is longer than 255 bytes
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
