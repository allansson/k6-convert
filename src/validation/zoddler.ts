/**
 * A tiny version of zod...
 */

interface ParseError {
  path: string;
  message: string;
}

interface ParseContext {
  input: unknown;
  path: string;
}

interface ParseOk<T> {
  ok: true;
  value: T;
}

interface ParseFail {
  ok: false;
  errors: ParseError[];
}

type ParseResult<T> = ParseOk<T> | ParseFail;

class Parser<T, Optional extends boolean = false> {
  required;
  parseFn: (context: ParseContext) => ParseResult<T>;

  constructor(
    parseFn: (context: ParseContext) => ParseResult<T>,
    required = true
  ) {
    this.required = required;
    this.parseFn = parseFn;
  }

  parse = (input: unknown): ParseResult<T> => {
    return this.parseFn({
      input,
      path: "$",
    });
  };

  optional() {
    return new Parser<T | undefined, true>((context) => {
      if (context.input === undefined) {
        return {
          ok: true,
          value: undefined,
        };
      }

      return this.parseFn(context);
    }, false);
  }

  nullable() {
    return new Parser<T | null, Optional>((context) => {
      if (context.input === null) {
        return {
          ok: true,
          value: null,
        };
      }

      return this.parseFn(context);
    }, this.required);
  }

  or<R>(parser: Parser<R>) {
    return new Parser<T | R, Optional>((context) => {
      const result = this.parseFn(context);

      if (result.ok) {
        return result;
      }

      return parser.parseFn(context);
    });
  }
}

function lazy<T, Optional extends boolean>(fn: () => Parser<T, Optional>) {
  let cached: Parser<T, Optional> | null = null;

  return new Parser<T, Optional>((context) => {
    if (cached === null) {
      cached = fn();
    }

    return cached.parseFn(context);
  });
}

function string() {
  return new Parser<string>((context) => {
    if (typeof context.input === "string") {
      return {
        ok: true,
        value: context.input,
      };
    }

    return {
      ok: false,
      errors: [
        {
          path: context.path,
          message: "Expected a string",
        },
      ],
    };
  });
}

function number() {
  return new Parser<number>((context) => {
    if (typeof context.input === "number") {
      return {
        ok: true,
        value: context.input,
      };
    }

    return {
      ok: false,
      errors: [
        {
          path: context.path,
          message: "Expected a number",
        },
      ],
    };
  });
}

function boolean() {
  return new Parser<boolean>((context) => {
    if (typeof context.input === "boolean") {
      return {
        ok: true,
        value: context.input,
      };
    }

    return {
      ok: false,
      errors: [
        {
          path: context.path,
          message: "Expected a boolean",
        },
      ],
    };
  });
}

function isObject(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

type ParserObject<T> = { [K in keyof T]: Parser<T[K]> };

type ParsedObject<T extends object> = {
  [K in keyof T as T[K] extends Parser<unknown, false>
    ? K
    : never]: T[K] extends Parser<infer U> ? U : never;
} & {
  [K in keyof T as T[K] extends Parser<unknown, true>
    ? K
    : never]?: T[K] extends Parser<infer U> ? U : never;
};

function record<T>(parser: Parser<T>) {
  return new Parser<Record<string, T>>((context) => {
    if (!isObject(context.input)) {
      return {
        ok: false,
        errors: [
          {
            path: context.path,
            message: "Expected a record",
          },
        ],
      };
    }

    const result: Record<string, T> = {};
    const errors: ParseError[] = [];

    for (const key in context.input) {
      const value = parser.parseFn({
        input: context.input[key],
        path: `${context.path}.${key}`,
      });

      if (value.ok) {
        result[key] = value.value;
      } else {
        errors.push(...value.errors);
      }
    }

    if (errors.length > 0) {
      return {
        ok: false,
        errors,
      };
    }

    return {
      ok: true,
      value: result,
    };
  });
}

function object<T extends ParserObject<unknown>>(
  parsers: T
): Parser<ParsedObject<T>> {
  return new Parser((context) => {
    if (!isObject(context.input)) {
      return {
        ok: false,
        errors: [
          {
            path: context.path,
            message: "Expected an object",
          },
        ],
      };
    }

    const result: Record<string, unknown> = {};

    const errors: ParseError[] = [];

    for (const key in parsers) {
      const parser = parsers[key];

      if (!(parser instanceof Parser)) {
        continue;
      }

      const path = context.path + "." + key;

      if (key in context.input === false) {
        if (parser.required) {
          errors.push({
            path,
            message: `Missing property "${key}"`,
          });
        }

        continue;
      }

      const value = parser.parseFn({
        input: context.input[key],
        path,
      });

      if (value.ok) {
        result[key] = value.value;
      } else {
        errors.push(...value.errors);
      }
    }

    if (errors.length > 0) {
      return {
        ok: false,
        errors,
      };
    }

    return {
      ok: true,
      value: result as ParsedObject<T>,
    };
  });
}

function literal<T extends string>(value: T) {
  return new Parser<T>((context) => {
    if (context.input === value) {
      return {
        ok: true,
        value,
      };
    }

    return {
      ok: false,
      errors: [
        {
          path: context.path,
          message: `Expected "${value}"`,
        },
      ],
    };
  });
}

function array<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser((context) => {
    if (!Array.isArray(context.input)) {
      return {
        ok: false,
        errors: [
          {
            path: context.path,
            message: "Expected an array",
          },
        ],
      };
    }

    const result: T[] = [];
    const errors: ParseError[] = [];

    for (let i = 0; i < context.input.length; i++) {
      const value = parser.parseFn({
        input: context.input[i],
        path: `${context.path}[${i}]`,
      });

      if (value.ok) {
        result.push(value.value);
      } else {
        errors.push(...value.errors);
      }
    }

    if (errors.length > 0) {
      return {
        ok: false,
        errors,
      };
    }

    return {
      ok: true,
      value: result,
    };
  });
}

function tuple<E extends [...Parser<unknown>[]]>(...parsers: E) {
  return new Parser<{
    [K in keyof E]: E[K] extends Parser<infer U> ? U : never;
  }>((context) => {
    if (!Array.isArray(context.input)) {
      return {
        ok: false,
        errors: [
          {
            path: context.path,
            message: "Expected an array",
          },
        ],
      };
    }

    const result: unknown[] = [];
    const errors: ParseError[] = [];

    for (let i = 0; i < parsers.length; i++) {
      const parser = parsers[i];

      if (!(parser instanceof Parser)) {
        continue;
      }

      const path = context.path + "[" + i + "]";

      if (i in context.input === false) {
        errors.push({
          path,
          message: `Missing tuple-element at index ${i}`,
        });

        continue;
      }

      const value = parser.parseFn({
        input: context.input[i],
        path,
      });

      if (value.ok) {
        result.push(value.value);
      } else {
        errors.push(...value.errors);
      }
    }

    if (errors.length > 0) {
      return {
        ok: false,
        errors,
      };
    }

    return {
      ok: true,
      value: result as {
        [K in keyof E]: E[K] extends Parser<infer U> ? U : never;
      },
    };
  });
}

type InferUnion<
  T extends [Parser<unknown>, Parser<unknown>, ...Parser<unknown>[]],
> = {
  [K in keyof T]: T[K] extends Parser<infer U> ? U : never;
}[number];

function union<
  T extends [Parser<unknown>, Parser<unknown>, ...Parser<unknown>[]],
>(parsers: T): Parser<InferUnion<T>> {
  return new Parser<InferUnion<T>>((context) => {
    const errors: ParseError[] = [];

    for (let i = 0; i < parsers.length; i++) {
      const parser = parsers[i];

      if (!(parser instanceof Parser)) {
        continue;
      }

      const value = parser.parseFn(context);

      if (value.ok) {
        return value as ParseResult<InferUnion<T>>;
      }

      errors.push(...value.errors);
    }

    return {
      ok: false,
      errors,
    };
  });
}

type WithOptionalProps<T> = {
  [K in keyof T as T[K] extends Parser<unknown, infer Opt>
    ? Opt extends false
      ? K
      : never
    : never]: Infer<T[K]>;
} & {
  [K in keyof T as T[K] extends Parser<unknown, infer Opt>
    ? Opt extends true
      ? K
      : never
    : never]?: Infer<T[K]>;
};

type Infer<T> = T extends Parser<infer U>
  ? U extends Array<infer I>
    ? // If typescript knows that an array has an item, then it must be a tuple. If so, we just return
      // the type as-is. Otherwise, e.g. [string, boolean] will become Array<string, boolean>
      U extends { 0: unknown }
      ? U
      : I[]
    : // This checks if U accepts "arbitrary" keys, meaning it should be a record. A more robust
    // solution would probably be to forward this information as a generic like optionals.
    { $$recordCheck: unknown } extends U
    ? U extends Record<string, infer E>
      ? Record<string, Infer<Parser<E>>>
      : never
    : U extends ParsedObject<infer O>
    ? { [P in keyof WithOptionalProps<O>]: WithOptionalProps<O>[P] }
    : U
  : never;

export {
  array,
  boolean,
  lazy,
  literal,
  number,
  object,
  record,
  string,
  tuple,
  union,
  type Infer,
  type ParseResult,
  type Parser,
};
