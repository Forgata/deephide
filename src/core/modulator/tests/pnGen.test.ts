import { describe, it, expect } from "vitest";
import { PNGenerator } from "../pnGen.js";

describe("PN Generator (LFSR)", () => {
  it("should be deterministic for the same seed", () => {
    const gen1 = new PNGenerator(0x1234);
    const gen2 = new PNGenerator(0x1234);

    const seq1 = gen1.generateSequence(64);
    const seq2 = gen2.generateSequence(64);

    expect(seq1).toEqual(seq2);
  });

  it("should only produce bipolar chips ", () => {
    const gen = new PNGenerator();
    const seq = gen.generateSequence(100);

    const allValid = Array.from(seq).every((chip) => chip === 1 || chip === -1);
    expect(allValid).toBe(true);
  });

  it("should change state after every call", () => {
    const gen = new PNGenerator(0xace1);
    const first64 = gen.generateSequence(64);
    const next64 = gen.generateSequence(64);

    expect(first64).not.toEqual(next64);
  });

  it("should recover from a seed of 0 by using the default", () => {
    const gen = new PNGenerator(0);
    const seq = gen.generateSequence(4);
    expect(seq.every((c) => c === 0)).toBe(false);
  });
});
