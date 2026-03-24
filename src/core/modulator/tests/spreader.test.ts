import { describe, it, expect } from "vitest";
import { Spreader } from "../spreader.js";
describe("Spreader Integration", () => {
  it("should spread one bit across exactly 64 chips", () => {
    const spreader = new Spreader();
    const bitstream = new Uint8Array([1]);
    const bitPtr = { index: 0 };

    const chips: number[] = [];
    for (let i = 0; i < 64; i++) {
      chips.push(spreader.getNextChip(bitstream, bitPtr)!);
    }

    expect(chips.length).toBe(64);
    expect(bitPtr.index).toBe(1);
    expect(spreader.getNextChip(bitstream, bitPtr)).toBe(null);
  });

  it("should invert the PN sequence when the bit is 0", () => {
    const spreader = new Spreader(0x1234);
    const bitstream0 = new Uint8Array([0]);
    const bitstream1 = new Uint8Array([1]);

    const chip0 = spreader.getNextChip(bitstream0, { index: 0 });
    const spreader2 = new Spreader(0x1234);
    const chip1 = spreader2.getNextChip(bitstream1, { index: 0 });

    expect(chip0).toBe(-chip1!);
  });

  it("should maintain PN state across multiple bits", () => {
    const spreader = new Spreader();
    const bitstream = new Uint8Array([1, 1]);
    const bitPtr = { index: 0 };

    for (let i = 0; i < 64; i++) spreader.getNextChip(bitstream, bitPtr);

    const chip65 = spreader.getNextChip(bitstream, bitPtr);
    const manualPN = (spreader as any).pnSequence;

    expect(chip65).toBe(manualPN[64]);
  });
});
