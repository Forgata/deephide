import { describe, it, expect } from "vitest";
import { DSSS_Spreader } from "../dsss.js";

describe("Phase 3: DSSS Spreader Logic", () => {
  it("should return an identical sequence when the symbol is +1", () => {
    const pn = new Float32Array([1, -1, 1, 1, -1]);
    const result = DSSS_Spreader.spread(1, pn);

    expect(result).toEqual(pn);
  });

  it("should return a perfectly inverted sequence when the symbol is -1", () => {
    const pn = new Float32Array([1, -1, 1, 1, -1]);
    const expected = new Float32Array([-1, 1, -1, -1, 1]);
    const result = DSSS_Spreader.spread(-1, pn);

    expect(result).toEqual(expected);
  });

  it("should handle an empty PN sequence without crashing", () => {
    const result = DSSS_Spreader.spread(1, new Float32Array(0));
    expect(result.length).toBe(0);
  });

  it("should scale correctly if the symbol is 0 (silence)", () => {
    const pn = new Float32Array([1, -1, 1]);
    const result = DSSS_Spreader.spread(0, pn);

    expect(result.every((val) => val === 0)).toBe(true);
  });
});
