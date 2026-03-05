type Buffer<T> = {
  peek(): T | undefined;
  push(item: T): void;
  pop(): T | undefined;
  isEmpty(): boolean;
  clear(): void;
  [Symbol.iterator](): Iterator<T>;
};

export class CircularBuffer<T> implements Buffer<T> {
  buffer: T[];
  capacity: number;
  writePtr: number;
  readPtr: number;
  size: number;
  constructor(capacity: number) {
    this.buffer = new Array(capacity);
    this.capacity = capacity;
    this.writePtr = 0;
    this.readPtr = 0;
    this.size = 0;
  }

  public *[Symbol.iterator](): Iterator<T> {
    let current = 0;
    if (!this.buffer) return;
    while (current < this.size) {
      const item = this.buffer[(this.readPtr + current) % this.capacity];
      if (item !== undefined) {
        yield item;
      }
      current++;
    }
  }

  public peek() {
    return this.size > 0 ? this.buffer[this.readPtr] : undefined;
  }

  public push(item: T) {
    this.buffer[this.writePtr] = item;
    this.writePtr = (this.writePtr + 1) % this.capacity;

    if (this.size < this.capacity) this.size++;
    else this.readPtr = (this.readPtr + 1) % this.capacity;
  }

  public pop() {
    if (this.size === 0) return undefined;

    const item = this.buffer[this.readPtr];
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
