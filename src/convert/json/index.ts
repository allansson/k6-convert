import { HarInput } from "~/src/convert/har";
import { TestInput } from "~/src/convert/test";
import { TestSchema } from "~/src/convert/test/types";
import { exhaustive } from "~/src/utils";

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
    throw new Error("Input JSON does not appear to be a valid test.");
  }

  return {
    source: "test",
    target: input.target,
    test: result.value,
  };
}

function fromJson(input: JsonEncodedTestInput): TestInput;
function fromJson(input: JsonEncodedHarInput): HarInput;
function fromJson(input: JsonEncodedTestInput | JsonEncodedHarInput) {
  switch (input.source) {
    case "json-encoded-har":
      return toHarInput(input);

    case "json-encoded-test":
      return toTestInput(input);

    default:
      return exhaustive(input);
  }
}

export { fromJson, type JsonEncodedHarInput, type JsonEncodedTestInput };
