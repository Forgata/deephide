import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadFileToUint8 } from "../../payload/Uint8FileReader.js";
import { readFile } from "node:fs/promises";

vi.mock("node:fs/promises");

describe("File loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a Uint8Array when file exists", async () => {
    const mockContent = Buffer.from("whatever its just a test");
    vi.mocked(readFile).mockResolvedValue(mockContent);

    const result = await loadFileToUint8("test.txt");

    expect(result).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(result)).toBe("whatever its just a test");
    expect(readFile).toHaveBeenCalledWith(expect.stringContaining("test.txt"));
  });

  it("should throw a custom error if the file is missing", async () => {
    vi.mocked(readFile).mockRejectedValue(new Error("ENOENT"));
    await expect(loadFileToUint8("missing.txt")).rejects.toThrow(
      "Failed to read file:",
    );
  });
  it("should maintain correct byte offset and length", async () => {
    const raw = new Uint8Array([0, 1, 2, 3]);
    vi.mocked(readFile).mockResolvedValue(Buffer.from(raw.buffer));
    const result = await loadFileToUint8("bytes.bin");
    expect(result[0]).toBe(0);
    expect(result.length).toBe(4);
  });
});
