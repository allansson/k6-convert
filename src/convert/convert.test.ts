import { expect, it } from "@jest/globals";
import { scenario, test } from "~/src/convert/ast";
import { toIntermediateAST } from "~/src/convert/convert";
import { type Test } from "~/src/inputs/test/types";

it("should return an empty test when the input is empty", () => {
  const input: Test = {
    scenarios: {},
  };

  expect(toIntermediateAST(input)).toEqual(test([]));
});

it("should return a test with a default scenario", () => {
  const input: Test = {
    defaultScenario: {
      name: "default",
      steps: [],
    },
    scenarios: {},
  };

  expect(toIntermediateAST(input)).toEqual(test([scenario("default", [])]));
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

  expect(toIntermediateAST(input)).toEqual(test([scenario("scenario1", [])]));
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

  expect(toIntermediateAST(input)).toEqual(
    test([scenario("scenario1", []), scenario("default", [])])
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

  expect(toIntermediateAST(input)).toEqual(
    test([scenario("scenario1", []), scenario("scenario2", [])])
  );
});
