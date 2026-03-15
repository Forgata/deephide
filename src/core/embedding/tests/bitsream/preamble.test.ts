import { describe, it, expect } from "vitest";
import { injectPreamble } from "../../bitstream/preamble.js";
describe("Preamble Injection", () => {
  it("should prepend the sync pattern to the start of the bitstream", () => {
    const mockPayload = new Uint8Array([0, 0, 1, 1]);
    const result = injectPreamble(mockPayload);

    expect(result[0]).toBe(1);
    expect(result[1]).toBe(0);
    expect(result[2]).toBe(1);
    expect(result[3]).toBe(0);

    const payloadPart = result.slice(result.length - 4);
    expect(Array.from(payloadPart)).toEqual([0, 0, 1, 1]);
  });

  it("should result in a length equal to PREAMBLE + Payload", () => {
    const PREAMBLE_LEN = 80;
    const mockPayload = new Uint8Array(100);
    const result = injectPreamble(mockPayload);

    expect(result.length).toBe(PREAMBLE_LEN + 100);
  });

  it("should not contain any values other than 0 or 1", () => {
    const mockPayload = new Uint8Array([1, 0, 1]);
    const result = injectPreamble(mockPayload);

    const isValid = Array.from(result).every((bit) => bit === 0 || bit === 1);
    expect(isValid).toBe(true);
  });
});
