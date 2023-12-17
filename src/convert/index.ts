import { emit } from "~/src/codegen";
import type { AsyncResult, Result } from "~/src/context";
import { fromHar, type HarInput } from "~/src/convert/har";
import {
  fromJson,
  type JsonEncodedHarInput,
  type JsonEncodedTestInput,
} from "~/src/convert/json";
import { fromTest, type TestInput } from "~/src/convert/test";
import type { ConverterIssue } from "~/src/convert/test/context";
import type { Test } from "~/src/convert/test/types";
import type { JsonDecodeError } from "~/src/convert/types";

type ToTestInput = HarInput | JsonEncodedHarInput | JsonEncodedTestInput;

type ToScriptInput =
  | TestInput
  | HarInput
  | JsonEncodedTestInput
  | JsonEncodedHarInput;

type Script = string;

function toTest(
  input: ToTestInput,
): Result<Test, ConverterIssue, JsonDecodeError> {
  switch (input.source) {
    case "json-encoded-har":
      return fromJson(input).andThen(toTest);

    case "json-encoded-test":
      return fromJson(input).map((input) => input.test);

    case "har":
      return fromHar(input.har);
  }
}

function toScript(
  input: ToScriptInput,
): AsyncResult<Script, ConverterIssue, JsonDecodeError> {
  switch (input.source) {
    case "json-encoded-har":
      return fromJson(input).andThen(toScript);

    case "json-encoded-test":
      return fromJson(input).andThen(toScript);

    case "har":
      return fromHar(input.har).andThen((har) => toScript({ ...input, har }));

    case "test":
      return fromTest(input.test).andThen(emit);
  }
}

export { toScript, toTest };
