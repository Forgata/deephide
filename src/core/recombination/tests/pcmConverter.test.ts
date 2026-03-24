import { describe, it, expect } from "vitest";
import { floatToInt16 } from "../pcmConverter.js";

describe("Phase 4: PCM Conversion (Float to Int16)", () => {
  it("should scale 1.0 to 32767", () => {
    const input = new Float32Array([1.0, 0.0, -1.0]);
    const result = floatToInt16(input);

    expect(result[0]).toBe(32767);
    expect(result[1]).toBe(0);
    expect(result[2]).toBe(-32767); // Note: -1.0 * 32767 = -32767
  });

  it("should clamp values exceeding 1.0 or -1.0", () => {
    const input = new Float32Array([2.0, -2.0]);
    const result = floatToInt16(input);

    expect(result[0]).toBe(32767);
    expect(result[1]).toBe(-32768); // Lowest possible Int16
  });

  it("should round fractional values correctly", () => {
    // 0.0001 * 32767 = 3.2767 -> should round to 3
    const input = new Float32Array([0.0001]);
    const result = floatToInt16(input);
    expect(result[0]).toBe(3);
  });
});
