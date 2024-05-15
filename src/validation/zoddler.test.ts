import { describe, expect, it } from "vitest";
import {
  array,
  boolean,
  literal,
  number,
  object,
  record,
  string,
  tuple,
  type ParseResult,
} from "~/src/validation/zoddler";

describe("string", () => {
  it("should succeed when input is a string", () => {
    const result = string().parse("hello") satisfies ParseResult<string>;

    expect(result.ok && result.value).toEqual("hello");
  });

  it("should fail when input is not a string", () => {
    const parser = string();

    const inputs = [undefined, null, 0, 1, true, false, {}, []];
    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });
});

describe("number", () => {
  it("should succeed when input is a number", () => {
    const result = number().parse(1) satisfies ParseResult<number>;

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual(1);
  });

  it("should fail when input is not a number", () => {
    const parser = number();

    const inputs = [undefined, null, "hello", true, false, {}, []];
    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });
});

describe("boolean", () => {
  it("should succeed when input is a boolean", () => {
    const result = boolean().parse(true) satisfies ParseResult<boolean>;

    expect(result.ok && result.value).toBe(true);
  });

  it("should fail when input is not a boolean", () => {
    const parser = boolean();

    const inputs = [undefined, null, 0, 1, "hello", {}, []];
    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });
});

describe("literal", () => {
  it("should succeed when input is the expected value", () => {
    const result = literal("hello").parse(
      "hello",
    ) satisfies ParseResult<"hello">;

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual("hello");
  });

  it("should fail when input is not the expected value", () => {
    const parser = literal("hello");

    const inputs = [undefined, null, 0, 1, true, false, {}, []];
    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });
});

describe("object", () => {
  it("should parse the empty object", () => {
    const result = object({}).parse({}) satisfies ParseResult<EmptyObject>;

    expect(result.ok && result.value).toEqual({});
  });

  it("should parse each property using it's corresponding parser", () => {
    const parser = object({
      a: string(),
      b: number(),
      c: boolean(),
    });

    const input = {
      a: "hello",
      b: 1,
      c: true,
    };

    const result = parser.parse(input) satisfies ParseResult<{
      a: string;
      b: number;
      c: boolean;
    }>;

    expect(result.ok && result.value).toEqual({
      a: "hello",
      b: 1,
      c: true,
    });
  });

  it("should fail when input is not an object", () => {
    const parser = object({});

    const inputs = [undefined, null, 0, 1, "hello", true, false, []];
    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });

  it("should fail when one of the properties fails to parse", () => {
    const parser = object({
      a: string(),
      b: number(),
      c: boolean(),
    });

    const inputs = [
      { a: 1, b: 2, c: 3 },
      { a: "hello", b: "world", c: "!" },
      { a: "hello", b: 1, c: "!" },
      { a: "hello", b: 1, c: 2 },
    ];

    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });

  it("should emit an error when input is missing a property", () => {
    const parser = object({
      a: string(),
      b: number(),
      c: boolean(),
    });

    const input = {
      a: "hello",
      b: 1,
    };

    const result = parser.parse(input);

    expect(result.ok).toEqual(false);
  });

  it("should return all errors of all failed properties", () => {
    const parser = object({
      a: string(),
      b: number(),
      c: boolean(),
    });

    const input = {
      a: 1,
      b: "hello",
      c: "world",
    };

    const result = parser.parse(input);

    expect(result.ok).toEqual(false);
    expect(!result.ok && result.errors).toEqual([
      expect.objectContaining({
        path: "$.a",
      }),
      expect.objectContaining({
        path: "$.b",
      }),
      expect.objectContaining({
        path: "$.c",
      }),
    ]);
  });

  it("should allow optional properties to be omitted", () => {
    const parser = object({
      a: string(),
      b: number(),
      c: boolean().optional(),
    });

    const input = {
      a: "hello",
      b: 1,
    };

    const result = parser.parse(input) satisfies ParseResult<{
      a: string;
      b: number;
      c?: boolean;
    }>;

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual({
      a: "hello",
      b: 1,
    });
  });
});

describe("record", () => {
  it("should parse the empty record", () => {
    const result = record(string()).parse({}) satisfies ParseResult<
      Record<string, string>
    >;

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual({});
  });

  it("should parse each property using the given parser", () => {
    const parser = record(string());

    const input = {
      a: "hello",
      b: "world",
    };

    const result = parser.parse(input) satisfies ParseResult<
      Record<string, string>
    >;

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual({
      a: "hello",
      b: "world",
    });
  });

  it("should fail when input is not an object", () => {
    const parser = record(string());

    const inputs = [undefined, null, 0, 1, "hello", true, false, []];
    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });

  it("should fail when one of the properties fails to parse", () => {
    const parser = record(string());

    const inputs = [
      { a: 1, b: 2, c: 3 },
      { a: false, b: "world", c: "!" },
      { a: "hello", b: 1, c: "!" },
      { a: "hello", b: 1, c: 2 },
    ];

    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });

  it("should return errors for each property that failed to parse", () => {
    const parser = record(string());

    const input = {
      a: 1,
      b: "hello",
      c: "world",
      d: true,
    };

    const result = parser.parse(input);

    expect(result.ok).toEqual(false);
    expect(!result.ok && result.errors).toEqual([
      expect.objectContaining({
        path: "$.a",
      }),
      expect.objectContaining({
        path: "$.d",
      }),
    ]);
  });
});

describe("array", () => {
  it("should parse the empty array", () => {
    const result = array(string()).parse([]) satisfies ParseResult<string[]>;

    expect(result.ok && result.value).toEqual([]);
  });

  it("should parse each item using the given parser", () => {
    const parser = array(string());

    const input = ["hello", "world"];

    const result = parser.parse(input) satisfies ParseResult<string[]>;

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual(["hello", "world"]);
  });

  it("should fail when input is not an array", () => {
    const parser = array(string());

    const inputs = [undefined, null, 0, 1, "hello", true, false, {}];
    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });

  it("should fail when one of the items fails to parse", () => {
    const parser = array(string());

    const inputs = [1, true, false, {}];
    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });

  it("should return errors for each item that failed to parse", () => {
    const parser = array(string());

    const input = [1, "Yay!", true, false, {}, "Hoorah!"];

    const result = parser.parse(input);

    expect(result.ok).toEqual(false);
    expect(!result.ok && result.errors).toEqual([
      expect.objectContaining({
        path: "$[0]",
      }),
      expect.objectContaining({
        path: "$[2]",
      }),
      expect.objectContaining({
        path: "$[3]",
      }),
      expect.objectContaining({
        path: "$[4]",
      }),
    ]);
  });
});

describe("tuple", () => {
  it("should parse each element using its parser", () => {
    const parser = tuple(string(), number(), boolean());

    const input = ["hello", 1, true];

    const result = parser.parse(input) satisfies ParseResult<
      [string, number, boolean]
    >;

    expect(result.ok).toBe(true);
    expect(result.ok && result.value).toEqual(["hello", 1, true]);
  });

  it("should fail when input is not an array", () => {
    const parser = tuple(string(), number(), boolean());

    const inputs = [undefined, null, 0, 1, "hello", true, false, {}];
    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });

  it("should fail when one of the items fails to parse", () => {
    const parser = tuple(string(), number(), boolean());

    const inputs = [
      ["hello", 1, "world"],
      ["hello", "world", true],
      [1, 2, 3],
    ];

    const results = inputs.map(parser.parse);

    expect(results.map((result) => result.ok)).toEqual(inputs.map(() => false));
  });

  it("should return errors for each item that failed to parse", () => {
    const parser = tuple(string(), number(), boolean());

    const input = ["hello", "world", 12];

    const result = parser.parse(input);

    expect(result.ok).toEqual(false);
    expect(!result.ok && result.errors).toEqual([
      expect.objectContaining({
        path: "$[1]",
      }),
      expect.objectContaining({
        path: "$[2]",
      }),
    ]);
  });
});
