import { describe, it, expect, vi } from "vitest";
import { preparePayload } from "../generator.js";
import * as fileReader from "../payload/Uint8FileReader.js";

describe("Integration Test: preparePayload", () => {
  it("should transform a file into a valid, preambled bitstream", async () => {
    const mockFileName = "file.txt";
    const mockContent = new TextEncoder().encode("whatever its just a test");
    vi.spyOn(fileReader, "loadFileToUint8").mockResolvedValue(mockContent);

    const password = "test1234";
    const { finalBitStream, salt } = await preparePayload(
      mockFileName,
      password,
    );

    expect(salt.length).toBe(16);

    const onlyBits = Array.from(finalBitStream).every(
      (b) => b === 0 || b === 1,
    );
    expect(onlyBits).toBe(true);

    expect(finalBitStream[0]).toBe(1);
    expect(finalBitStream[1]).toBe(0);
    expect(finalBitStream[2]).toBe(1);

    expect(finalBitStream.length).toBeGreaterThan(mockContent.length * 8);
  });

  it("should produce a different bitstream and salt on every call", async () => {
    vi.spyOn(fileReader, "loadFileToUint8").mockResolvedValue(
      new Uint8Array(10),
    );

    const res1 = await preparePayload("f.txt", "pass");
    const res2 = await preparePayload("f.txt", "pass");

    expect(res1.salt).not.toEqual(res2.salt);
    expect(res1.finalBitStream).not.toEqual(res2.finalBitStream);
  });
});
