import { describe, it, expect } from "vitest";
import { framePayload } from "../../payload/framing.js";

describe("Payload Framing Verification", () => {
  it("should correctly structure the 10-byte header", () => {
    const filename = "secret.bin";
    const content = new Uint8Array([0xaa, 0xbb, 0xcc]);
    const result = framePayload(content, filename);
    const view = new DataView(result.buffer);

    expect(view.getUint32(0, false)).toBe(0x44484944);
    expect(result[4]).toBe(1);
    expect(result[5]).toBe(filename.length);
    expect(view.getUint32(6, false)).toBe(content.length);
    expect(result.length).toBe(23);
  });

  it("should place filename and content at correct offsets", () => {
    const filename = "abc";
    const content = new TextEncoder().encode("data");
    const result = framePayload(content, filename);

    const extractedName = new TextDecoder().decode(result.slice(10, 13));
    expect(extractedName).toBe("abc");

    const extractedContent = new TextDecoder().decode(result.slice(13));
    expect(extractedContent).toBe("data");
  });

  it("should prevent filenames longer than 255 bytes", () => {
    const longName = "x".repeat(256);
    const content = new Uint8Array(1);

    expect(() => framePayload(content, longName)).toThrow("Filename too long");
  });
});
