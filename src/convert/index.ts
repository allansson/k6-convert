import { emit } from "~/src/codegen";
import { fromHar, type HarInput } from "~/src/convert/har";
import {
  fromJson,
  JsonEncodedHarInput,
  JsonEncodedTestInput,
} from "~/src/convert/json";
import { fromTest, TestInput } from "~/src/convert/test";
import { type Test } from "~/src/convert/test/types";
import { Chain } from "~/src/utils";

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
function convert(input: ScriptTargetInput): Promise<Script>;
function convert(input: ConvertInput): Test | Promise<Script> {
  switch (input.source) {
    case "json-encoded-har":
      return convert(fromJson(input));

    case "json-encoded-test":
      return convert(fromJson(input));

    case "har":
      if (input.target === "test") {
        return fromHar(input.har);
      }

      return convert({
        source: "test",
        target: "script",
        test: fromHar(input.har),
      });

    case "test":
      return Chain.from(input.test).map(fromTest).map(emit).unwrap();
  }
}

export { convert };
