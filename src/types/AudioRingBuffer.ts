interface Buffer {
  peek(): number | undefined;
  push(item: Int16Array): void;
  pop(): number | undefined;
  isEmpty(): boolean;
  clear(): void;
  [Symbol.iterator](): Iterator<number>;
}

export class AudioRingBuffer implements Buffer {
  private buffer: ArrayBuffer;
  private i16: Int16Array;
  private f32: Float32Array;
  private capacity: number;
  private writePtr: number = 0;
  private readPtr: number = 0;

  public size: number = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new ArrayBuffer(capacity * 4);
    this.i16 = new Int16Array(this.buffer);
    this.f32 = new Float32Array(this.buffer);
  }

  public *[Symbol.iterator](): Iterator<number> {
    let count = 0;
    if (!this.buffer) return;
    while (count < this.size) {
      const idx = (this.readPtr + count) % this.capacity;
      if (idx >= 0 && idx < this.capacity) {
        yield this.f32[idx]!;
      }
      count++;
    }
  }

  public push(frame: Int16Array) {
    // console.log(Math.max(...frame.map(Math.abs)));

    const frameLength = frame.length;
    if (this.writePtr + frameLength <= this.capacity) {
      this.i16.set(frame, this.writePtr);
    } else {
      const firstPartLen = this.capacity - this.writePtr;
      this.i16.set(frame.subarray(0, firstPartLen), this.writePtr);
      this.i16.set(frame.subarray(firstPartLen), 0);
    }

    // float32 conversion
    for (let i = frameLength - 1; i >= 0; i--) {
      const idx = (this.writePtr + i) % this.capacity;
      this.f32[idx] = this.i16[idx]! / 32768.0;
    }

    // this.writePtr = (this.writePtr + frameLength) % this.capacity;
    // this.size = Math.min(this.capacity, this.size + frameLength);

    // if (this.size === this.capacity) this.readPtr = this.writePtr;
    const isOverflowing = this.size + frameLength > this.capacity;

    this.writePtr = (this.writePtr + frameLength) % this.capacity;
    this.size = Math.min(this.capacity, this.size + frameLength);

    if (isOverflowing) this.readPtr = this.writePtr;
  }

  /**
   * Returns a view of the internal Float32 data.
   */
  public peek() {
    return this.size > 0 ? this.f32[this.readPtr] : undefined;
  }

  public pop() {
    if (this.size === 0) return undefined;

    const item = this.f32[this.readPtr];
    this.readPtr = (this.readPtr + 1) % this.capacity;
    this.size--;
    return item;
  }

  public isEmpty() {
    return this.size === 0;
  }

  public clear() {
    this.writePtr = 0;
    this.readPtr = 0;
    this.size = 0;
  }
}

export const buffer = new AudioRingBuffer(1024);
