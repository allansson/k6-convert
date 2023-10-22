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

function isObject(input: unknown): input is object {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

type ParserObject<T> = { [K in keyof T]: Parser<T[K]> };
type ParsedObject<T extends object> = {
  [K in keyof T as T[K] extends Parser<any, false>
    ? K
    : never]: T[K] extends Parser<infer U> ? U : never;
} & {
  [K in keyof T as T[K] extends Parser<any, true>
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
        input: (context.input as any)[key],
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

function object<T extends ParserObject<any>>(
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

    const result: any = {};

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
        input: (context.input as any)[key],
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
      value: result,
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

function tuple<E extends [...Parser<any>[]]>(...parsers: E) {
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

    const result: { [K in keyof E]: E[K] extends Parser<infer U> ? U : never } =
      [] as any;
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
      value: result,
    };
  });
}

type WithOptionalProps<T> = {
  [K in keyof T as T[K] extends Parser<any, infer Opt>
    ? Opt extends false
      ? K
      : never
    : never]: Infer<T[K]>;
} & {
  [K in keyof T as T[K] extends Parser<any, infer Opt>
    ? Opt extends true
      ? K
      : never
    : never]?: Infer<T[K]>;
};

type Infer<T> = T extends Parser<infer U>
  ? U extends Array<infer I>
    ? [] extends U
      ? Array<
          I extends ParsedObject<infer O>
            ? { [K in keyof WithOptionalProps<O>]: WithOptionalProps<O>[K] }
            : I
        >
      : { [K in keyof U]: Infer<U[K]> }
    : U extends ParsedObject<infer O>
    ? { [K in keyof WithOptionalProps<O>]: WithOptionalProps<O>[K] }
    : U
  : T;

export {
  array,
  boolean,
  literal,
  number,
  object,
  record,
  string,
  tuple,
  type Infer,
  type ParseResult,
};
