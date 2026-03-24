import { describe, it, expect, vi, beforeEach } from "vitest";
import { collectOutput, saveWAV } from "../writer.js";
import fs from "node:fs";

vi.mock("node:fs");

describe("Phase 4: WAV Writer & Accumulator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should correctly merge multiple PCM frames", () => {
    collectOutput(new Int16Array([1, 2, 3]));
    saveWAV("test.wav");

    expect(fs.writeFileSync).toHaveBeenCalled();
    const [path, data] = vi.mocked(fs.writeFileSync).mock.calls[0]!;

    expect(path).toBe("test.wav");
    expect(data).toBeInstanceOf(Uint8Array);
    expect((data as Uint8Array).length).toBeGreaterThan(44);
  });

  it("should clear the accumulator after saving", () => {
    collectOutput(new Int16Array([1, 2, 3]));
    saveWAV("test1.wav");
    const warnSpy = vi.spyOn(console, "warn");
    saveWAV("test2.wav");
    expect(warnSpy).toHaveBeenCalledWith("No data to save.");
  });
});
