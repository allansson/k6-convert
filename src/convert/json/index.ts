import type { HarInput } from "~/src/convert/har";
import type { TestInput } from "~/src/convert/test";
import { TestSchema } from "~/src/convert/test/schema";

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

function toHarInput(input: JsonEncodedHarInput): HarInput {
  return {
    source: "har",
    target: input.target,
    har: JSON.parse(input.content),
  };
}

function toTestInput(input: JsonEncodedTestInput): TestInput {
  const content = JSON.parse(input.content);
  const result = TestSchema.parse(content);

  if (!result.ok) {
    const errors = result.errors
      .map((error) => `   ${error.path} - ${error.message}`)
      .join("\n");

    throw new Error(`Failed to parse JSON as a test: \n${errors}`);
  }

  return {
    source: "test",
    target: input.target,
    test: result.value,
  };
}

function fromJson(input: JsonEncodedTestInput): TestInput;
function fromJson(input: JsonEncodedHarInput): HarInput;
function fromJson(
  input: JsonEncodedTestInput | JsonEncodedHarInput,
): TestInput | HarInput {
  switch (input.source) {
    case "json-encoded-har":
      return toHarInput(input);

    case "json-encoded-test":
      return toTestInput(input);
  }
}

export { fromJson, type JsonEncodedHarInput, type JsonEncodedTestInput };
