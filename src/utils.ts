function exhaustive(value: never): never {
  return value;
}

function groupBy<T, K extends string>(
  items: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return items.reduce(
    (result, item) => ({
      ...result,
      [key(item)]: [...(result[key(item)] ?? []), item],
    }),
    {} as Record<K, T[]>
  );
}

function* reverse<T>(array: T[]): Generator<T> {
  for (let i = array.length - 1; i >= 0; i--) {
    const element = array[i];

    if (element === undefined) {
      return;
    }

    yield element;
  }
}

class Chain<T> {
  static from<T>(value: T): Chain<T> {
    return new Chain(value);
  }

  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  log(message: string): Chain<T> {
    console.log(message, JSON.stringify(this.value, null, 2));

    return this;
  }

  map<R>(f: (value: T) => R): Chain<R> {
    return new Chain(f(this.value));
  }

  unwrap(): T {
    return this.value;
  }
}

export { Chain, exhaustive, groupBy, reverse };
