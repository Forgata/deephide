import { describe, it, expect, vi } from "vitest";
import { processSTFT } from "../processFrame.js";
import { PNGenerator } from "../../modulator/pnGen.js";

describe("Master Integration: processSTFT", () => {
  const createMockBuffer = (length: number) => {
    const state = { currentSize: length };
    return {
      get size() {
        return state.currentSize;
      },
      getFrames: vi.fn((n) => new Float32Array(n).fill(0.1)),
      advance: vi.fn((n) => {
        state.currentSize -= n;
      }),
    };
  };

  it("should process multiple frames and advance bit pointer correctly", () => {
    const mockAudio = createMockBuffer(2048) as any;
    const bitstream = new Uint8Array([1, 0]);
    const bitPtr = { index: 0 };
    const pnGen = new PNGenerator();
    const frameState = { count: 0 };

    const results = processSTFT(
      mockAudio,
      bitstream,
      bitPtr,
      pnGen,
      frameState,
    );

    expect(results.length).toBe(3);
    expect(frameState.count).toBe(3);
    expect(bitPtr.index).toBe(2);
    expect(mockAudio.advance).toHaveBeenCalledTimes(3);
    expect(mockAudio.advance).toHaveBeenCalledWith(512);
  });

  it("should NOT embed data if safeBins are insufficient", () => {
    const mockAudio = createMockBuffer(1024) as any;
    const bitstream = new Uint8Array([1]);
    const bitPtr = { index: 0 };
    const pnGen = new PNGenerator();
    const results = processSTFT(mockAudio, bitstream, bitPtr, pnGen);
    if (results[0]!.safeBins.length >= 64) {
      expect(bitPtr.index).toBe(1);
    } else {
      expect(bitPtr.index).toBe(0);
    }
  });

  it("should maintain spectral continuity (frameIndex mapping)", () => {
    const mockAudio = createMockBuffer(1536) as any;
    const results = processSTFT(
      mockAudio,
      new Uint8Array([1]),
      { index: 0 },
      new PNGenerator(),
    );
    expect(results[0]).toHaveProperty("spectrum");
    expect(results[0]).toHaveProperty("frameIndex", 0);
    expect(results[1]).toHaveProperty("frameIndex", 1);
    expect(results[0]!.spectrum.length).toBe(2048);
  });
});
