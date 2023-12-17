import { expect, it } from "@jest/globals";
import { defaultScenario, scenario, test } from "~/src/convert/ast";
import { fromTest } from "~/src/convert/test";
import type {
  DefaultScenario,
  HttpRequestStep,
  JsonEncodedBody,
  Test,
} from "~/src/convert/test/types";

it("should return an empty test when the input is empty", () => {
  const input: Test = {
    scenarios: {},
  };

  expect(fromTest(input).unsafeUnwrap()).toEqual(test([]));
});

it("should return a test with a default scenario", () => {
  const input: Test = {
    defaultScenario: {
      name: "default",
      steps: [],
    },
    scenarios: {},
  };

  expect(fromTest(input).unsafeUnwrap()).toEqual(
    test([], defaultScenario("default", [])),
  );
});

it("should return a test with a named scenario", () => {
  const input: Test = {
    scenarios: {
      scenario1: {
        name: "scenario1",
        steps: [],
      },
    },
  };

  expect(fromTest(input).unsafeUnwrap()).toEqual(
    test([scenario("scenario1", [])]),
  );
});

it("should return a test with a default and a named scenario", () => {
  const input: Test = {
    defaultScenario: {
      name: "default",
      steps: [],
    },
    scenarios: {
      scenario1: {
        name: "scenario1",
        steps: [],
      },
    },
  };

  expect(fromTest(input).unsafeUnwrap()).toEqual(
    test([scenario("scenario1", [])], defaultScenario("default", [])),
  );
});

it("should return a test with multiple named scenarios", () => {
  const input: Test = {
    scenarios: {
      scenario1: {
        name: "scenario1",
        steps: [],
      },
      scenario2: {
        name: "scenario2",
        steps: [],
      },
    },
  };

  expect(fromTest(input).unsafeUnwrap()).toEqual(
    test([scenario("scenario1", []), scenario("scenario2", [])]),
  );
});

it("should report a problem when json body of a request is malformed", () => {
  const body: JsonEncodedBody = {
    mimeType: "application/json",
    content: "{",
  };

  const step: HttpRequestStep = {
    type: "http-request",
    method: "POST",
    url: "https://example.com",
    body,
  };

  const defaultScenario: DefaultScenario = {
    steps: [step],
  };

  const input: Test = {
    defaultScenario,
    scenarios: {},
  };

  const result = fromTest(input);

  expect(result.issues).toEqual([
    {
      type: "InvalidJsonBody",
      content: "{",
      node: body,
    },
  ]);
});
