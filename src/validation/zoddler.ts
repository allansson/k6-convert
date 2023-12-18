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
  errors: [];
}

interface ParseFail {
  ok: false;
  errors: ParseError[];
}

function ok<T>(value: T): ParseOk<T> {
  return {
    ok: true,
    value,
    errors: [],
  };
}

function fail(errors: ParseError[] | ParseError): ParseFail {
  return {
    ok: false,
    errors: Array.isArray(errors) ? errors : [errors],
  };
}

type ParseResult<T> = ParseOk<T> | ParseFail;

class Parser<T, Optional extends boolean = false> {
  required;
  parseFn: (context: ParseContext) => ParseResult<T>;

  constructor(
    parseFn: (context: ParseContext) => ParseResult<T>,
    required = true,
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
        return ok(undefined);
      }

      return this.parseFn(context);
    }, false);
  }

  nullable() {
    return new Parser<T | null, Optional>((context) => {
      if (context.input === null) {
        return ok(null);
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
      return ok(context.input);
    }

    return fail({
      path: context.path,
      message: "Expected a string",
    });
  });
}

function number() {
  return new Parser<number>((context) => {
    if (typeof context.input === "number") {
      return ok(context.input);
    }

    return fail({
      path: context.path,
      message: "Expected a number",
    });
  });
}

function boolean() {
  return new Parser<boolean>((context) => {
    if (typeof context.input === "boolean") {
      return ok(context.input);
    }

    return fail({
      path: context.path,
      message: "Expected a boolean",
    });
  });
}

function isObject(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

type ParserObject<T> = { [K in keyof T]: Parser<T[K]> };

type ParsedObject<T extends object> = {
  [K in keyof T as T[K] extends Parser<unknown, infer Opt>
    ? false extends Opt
      ? K
      : never
    : never]: T[K] extends Parser<infer U> ? U : never;
} & {
  [K in keyof T as T[K] extends Parser<unknown, infer Opt>
    ? true extends Opt
      ? K
      : never
    : never]?: T[K] extends Parser<infer U> ? U : never;
};

function record<T>(parser: Parser<T>) {
  return new Parser<Record<string, T>>((context) => {
    if (!isObject(context.input)) {
      return fail({
        path: context.path,
        message: "Expected a record",
      });
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
      return fail(errors);
    }

    return ok(result);
  });
}

function object<T extends ParserObject<unknown>>(
  parsers: T,
): Parser<{ [P in keyof ParsedObject<T>]: ParsedObject<T>[P] }> {
  return new Parser((context) => {
    if (!isObject(context.input)) {
      return fail({
        path: context.path,
        message: "Expected an object",
      });
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
      return fail(errors);
    }

    return ok(result as ParsedObject<T>);
  });
}

type Extension<P extends object, E extends ParserObject<unknown>> = P & {
  [P in keyof ParsedObject<E>]: ParsedObject<E>[P];
};

function extend<T extends object, U extends ParserObject<unknown>>(
  baseSchema: Parser<T>,
  extension: U,
): Parser<{ [P in keyof Extension<T, U>]: Extension<T, U>[P] }> {
  const extensionParser = object(extension);

  return new Parser((context) => {
    const baseResult = baseSchema.parseFn(context);
    const extensionResult = extensionParser.parseFn(context);

    if (!baseResult.ok || !extensionResult.ok) {
      return fail([...baseResult.errors, ...extensionResult.errors]);
    }

    return ok({
      ...baseResult.value,
      ...extensionResult.value,
    });
  });
}

function literal<T extends string>(value: T) {
  return new Parser<T>((context) => {
    if (context.input === value) {
      return ok(value);
    }

    return fail({
      path: context.path,
      message: `Expected "${value}"`,
    });
  });
}

function array<T>(parser: Parser<T>): Parser<T[]> {
  return new Parser((context) => {
    if (!Array.isArray(context.input)) {
      return fail({
        path: context.path,
        message: "Expected an array",
      });
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
      return fail(errors);
    }

    return ok(result);
  });
}

function tuple<E extends [...Array<Parser<unknown>>]>(...parsers: E) {
  return new Parser<{
    [K in keyof E]: E[K] extends Parser<infer U> ? U : never;
  }>((context) => {
    if (!Array.isArray(context.input)) {
      return fail({
        path: context.path,
        message: "Expected an array",
      });
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
      return fail(errors);
    }

    return ok(
      result as {
        [K in keyof E]: E[K] extends Parser<infer U> ? U : never;
      },
    );
  });
}

type InferUnion<
  T extends [Parser<unknown>, Parser<unknown>, ...Array<Parser<unknown>>],
> = {
  [K in keyof T]: T[K] extends Parser<infer U> ? U : never;
}[number];

function union<
  T extends [Parser<unknown>, Parser<unknown>, ...Array<Parser<unknown>>],
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

type Infer<T> = T extends Parser<infer U>
  ? U extends Record<string, unknown>
    ? { [P in keyof U]: Infer<Parser<U[P]>> }
    : U
  : never;

export {
  array,
  boolean,
  extend,
  lazy,
  literal,
  number,
  object,
  record,
  string,
  tuple,
  union,
  type Infer,
  type ParseError,
  type ParseResult,
  type Parser,
};
