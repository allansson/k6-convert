import { emit } from "~/src/codegen";
import { toIntermediateAST } from "~/src/convert/convert";
import { fromHar, type HarInput } from "~/src/convert/har";
import {
  fromJson,
  JsonEncodedHarInput,
  JsonEncodedTestInput,
} from "~/src/convert/json";
import { TestInput } from "~/src/convert/test";
import { type Test } from "~/src/convert/test/types";
import { Chain, exhaustive } from "~/src/utils";

type ScriptTargetInput =
  | JsonEncodedHarInput
  | JsonEncodedTestInput
  | TestInput
  | HarInput;

type TestTargetInput = JsonEncodedHarInput | HarInput;

type ConvertInput =
  | TestInput
  | HarInput
  | JsonEncodedTestInput
  | JsonEncodedHarInput;

type Script = string;

function convert(input: TestTargetInput): Test;
function convert(input: ScriptTargetInput): Script;
function convert(input: ConvertInput) {
  switch (input.source) {
    case "json-encoded-har":
      return convert(fromJson(input));

    case "json-encoded-test":
      return convert(fromJson(input));

    case "test":
      return Chain.from(input.test).map(toIntermediateAST).map(emit).unwrap();

    case "har":
      if (input.target === "test") {
        return fromHar(input.har);
      }

      return Chain.from(input.har)
        .map(fromHar)
        .map(toIntermediateAST)
        .map(emit)
        .unwrap();

    default:
      return exhaustive(input);
  }
}

export { convert };
