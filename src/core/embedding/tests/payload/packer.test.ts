import { describe, it, expect } from "vitest";
import { packetize } from "../../payload/packer.js";

describe("Packetization", () => {
  it("should split data into correctly sized chunks with 4-byte headers", () => {
    const data = new Uint8Array(1000);
    const frameSize = 400;
    const result = packetize(data, frameSize);

    expect(result.length).toBe(3);
    expect(result[0]!.length).toBe(404);
    expect(result[2]!.length).toBe(204);
  });

  it("should increment Frame IDs sequentially", () => {
    const data = new Uint8Array(100);
    const result = packetize(data, 40);

    const view0 = new DataView(
      result[0]!!.buffer,
      result[0]!!.byteOffset,
      result[0]!!.byteLength,
    );
    const view1 = new DataView(
      result[1]!!.buffer,
      result[1]!!.byteOffset,
      result[1]!!.byteLength,
    );
    const view2 = new DataView(
      result[2]!!.buffer,
      result[2]!!.byteOffset,
      result[2]!!.byteLength,
    );

    expect(view0.getUint32(0, false)).toBe(0);
    expect(view1.getUint32(0, false)).toBe(1);
    expect(view2.getUint32(0, false)).toBe(2);
  });

  it("should preserve the original data content after chunking", () => {
    const data = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const result = packetize(data, 2);

    expect(result[0]!.slice(4)).toEqual(new Uint8Array([0xde, 0xad]));

    expect(result[1]!.slice(4)).toEqual(new Uint8Array([0xbe, 0xef]));
  });

  it("should handle data smaller than the frameSize", () => {
    const data = new Uint8Array(10);
    const result = packetize(data, 512);

    expect(result.length).toBe(1);
    expect(result[0]!.length).toBe(14);
  });
});
