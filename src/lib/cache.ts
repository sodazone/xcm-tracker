// Adapted from https://github.com/polkadot-js/api/blob/master/packages/rpc-provider/src/lru.ts

// Copyright 2017-2024 @polkadot/rpc-provider authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const DEFAULT_CAPACITY = 64;

class FixSizedCacheNode {
  readonly key: string;

  public next: FixSizedCacheNode;
  public prev: FixSizedCacheNode;

  constructor(key: string) {
    this.key = key;
    this.next = this.prev = this;
  }
}

export class FixedSizedCache<T> {
  readonly capacity: number;

  readonly #data = new Map<string, T>();
  readonly #refs = new Map<string, FixSizedCacheNode>();

  #length = 0;
  #head: FixSizedCacheNode;
  #tail: FixSizedCacheNode;

  constructor(capacity = DEFAULT_CAPACITY) {
    this.capacity = capacity;
    this.#head = this.#tail = new FixSizedCacheNode("<empty>");
  }

  get length(): number {
    return this.#length;
  }

  get lengthData(): number {
    return this.#data.size;
  }

  get lengthRefs(): number {
    return this.#refs.size;
  }

  entries(): [string, T][] {
    const keys = this.keys();
    const count = keys.length;
    const entries = new Array<[string, T]>(count);

    for (let i = 0; i < count; i++) {
      const key = keys[i];

      entries[i] = [key, this.#data.get(key)];
    }

    return entries;
  }

  keys(): string[] {
    const keys: string[] = [];

    if (this.#length) {
      let curr = this.#head;

      while (curr !== this.#tail) {
        keys.push(curr.key);
        curr = curr.prev;
      }

      keys.push(curr.key);
    }

    return keys;
  }

  get(key: string): T | undefined {
    const data = this.#data.get(key);

    if (data) {
      return data;
    }

    return undefined;
  }

  set(key: string, value: T): void {
    if (!this.#data.has(key)) {
      const node = new FixSizedCacheNode(key);

      this.#refs.set(node.key, node);

      if (this.length === 0) {
        this.#head = this.#tail = node;
      } else {
        this.#head.next = node;
        node.prev = this.#head;
        this.#head = node;
      }

      if (this.#length === this.capacity) {
        this.#data.delete(this.#tail.key);
        this.#refs.delete(this.#tail.key);

        this.#tail = this.#tail.next;
        this.#tail.prev = this.#head;
      } else {
        this.#length += 1;
      }
    }

    this.#data.set(key, value);
  }

  delete(key: string) {
    const node = this.#refs.get(key);
    const { prev: prevNode, next: nextNode } = node;
    if (node === this.#head) {
      if (prevNode.key !== "<empty>") {
        prevNode.next = prevNode;
        this.#head = prevNode;
      }
    } else if (node === this.#tail) {
      nextNode.prev = nextNode;
      this.#tail = nextNode;
    } else {
      nextNode.prev = prevNode;
      prevNode.next = nextNode;
    }
    this.#data.delete(key);
    this.#refs.delete(key);
    this.#length -= 1;
  }
}
