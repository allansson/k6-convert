import { fail, ok, type Result } from "~/src/context";
import type { HarInput } from "~/src/convert/har";
import type { TestInput } from "~/src/convert/test";
import { TestSchema } from "~/src/convert/test/schema";
import type { ParseError } from "~/src/validation";

interface InvalidTestSchemaError {
  type: "InvalidTestSchemaError";
  content: string;
  errors: ParseError[];
}

interface InvalidJsonError {
  type: "InvalidJson";
  content: string;
  error: unknown;
}

type JsonDecodeError = InvalidTestSchemaError | InvalidJsonError;

type JsonDecodeResult<Value> = Result<Value, never, JsonDecodeError>;

interface JsonEncodedHarInput {
  source: "json-encoded-har";
  target: "test" | "script";
  content: string;
}

interface JsonEncodedTestInput {
  source: "json-encoded-test";
  target: "script";
  content: string;
}

function toHarInput(input: JsonEncodedHarInput): JsonDecodeResult<HarInput> {
  try {
    return ok({
      source: "har",
      target: input.target,
      har: JSON.parse(input.content),
    });
  } catch (error) {
    return fail({
      type: "InvalidJson",
      content: input.content,
      error,
    });
  }
}

function toTestInput(input: JsonEncodedTestInput): JsonDecodeResult<TestInput> {
  try {
    const content = JSON.parse(input.content);
    const result = TestSchema.parse(content);

    if (!result.ok) {
      return fail({
        type: "InvalidTestSchemaError",
        content: input.content,
        errors: result.errors,
      });
    }

    return ok({
      source: "test",
      target: input.target,
      test: result.value,
    });
  } catch (error) {
    return fail({
      type: "InvalidJson",
      content: input.content,
      error,
    });
  }
}

function fromJson(input: JsonEncodedTestInput): JsonDecodeResult<TestInput>;
function fromJson(input: JsonEncodedHarInput): JsonDecodeResult<HarInput>;
function fromJson(
  input: JsonEncodedTestInput | JsonEncodedHarInput,
): JsonDecodeResult<TestInput> | JsonDecodeResult<HarInput> {
  switch (input.source) {
    case "json-encoded-har":
      return toHarInput(input);

    case "json-encoded-test":
      return toTestInput(input);
  }
}

export { fromJson, type JsonEncodedHarInput, type JsonEncodedTestInput };
