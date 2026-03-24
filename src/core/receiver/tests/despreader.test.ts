import { describe, it, expect } from "vitest";
import { despreadBit } from "../despreader.js";

describe("Phase 5: Despreader (Recovery)", () => {
  it("should recover a 1 when chips align with PN nudges", () => {
    const pn = new Float32Array([1, -1, 1, -1]);
    const chips = new Float32Array([1.0, 0.5, 1.0, -0.5, 1.0, 0.5, 1.0, -0.5]);

    const result = despreadBit(chips, pn);
    expect(result).toBe(1); // Sum should be 2.0
  });

  it("should recover a 0 when the chips are inverted", () => {
    const pn = new Float32Array([1, 1]);
    const chips = new Float32Array([1.0, -0.02, 1.0, -0.02]);

    const result = despreadBit(chips, pn);
    expect(result).toBe(0);
  });
});
