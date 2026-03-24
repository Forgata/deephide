import { describe, it, expect, beforeEach } from "vitest";
import { overlapAdd } from "../reconstructor.js";

describe("Phase 4: Overlap-Add (OLA) Synthesis", () => {
  it("should return a chunk of exactly HOP_SIZE (512)", () => {
    const mockFrame = new Float32Array(1024).fill(0.1);
    const result = overlapAdd(mockFrame);
    expect(result.length).toBe(512);
  });

  it("should produce non-zero output after initial buffer fill", () => {
    const mockFrame = new Float32Array(1024).fill(0.5);
    overlapAdd(mockFrame); // First hop (fills buffer)
    const secondHop = overlapAdd(mockFrame); // Second hop (should be active)

    const average = secondHop.reduce((a, b) => a + b, 0) / 512;
    expect(average).toBeGreaterThan(0.1);
  });

  it("should maintain state across calls (Circular Shift)", () => {
    const frame1 = new Float32Array(1024).fill(0);
    frame1[800] = 1.0; // Pulse in the "tail" of frame 1

    overlapAdd(frame1); // This pulse is now at index (800-512) = 288 in overlapBuffer
    const result2 = overlapAdd(new Float32Array(1024).fill(0));

    // The pulse from the tail of frame 1 should appear in the output of frame 2
    expect(result2[288]).toBeCloseTo(1.0, 5);
  });
});
