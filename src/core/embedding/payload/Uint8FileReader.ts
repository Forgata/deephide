import { readFile } from "node:fs/promises";
import path from "node:path";
/**
 * Load a file from the project's "data" directory and return its contents as a Uint8Array.
 *
 * @param filename - Name of the file located inside the project's "data" directory
 * @returns A Uint8Array view over the file's contents
 * @throws Error if the file cannot be read (message: "Failed to read file: <filepath>")
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
