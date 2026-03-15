import { readFile } from "node:fs/promises";
import path from "node:path";
/**
 * Loads a file from the "data" directory and returns its contents as a Uint8Array
 * @param {string} filename - the name of the file to load
 * @returns {Promise<Uint8Array>} - a promise that resolves to the file contents as a Uint8Array
 * @throws {Error} - if the file cannot be read
 */
export async function loadFileToUint8(filename: string): Promise<Uint8Array> {
  const filepath = path.join(process.cwd(), "data", filename);
  try {
    const buffer = await readFile(filepath);
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } catch (error) {
    throw new Error(`Failed to read file: ${filepath}`);
  }
}
