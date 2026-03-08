import { readFile } from "node:fs/promises";
import path from "node:path";
export async function loadFileToUint8(filename: string): Promise<Uint8Array> {
  const filepath = path.join(process.cwd(), "data", filename);
  try {
    const buffer = await readFile(filepath);
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } catch (error) {
    throw new Error(`Failed to read file: ${filepath}`);
  }
}
