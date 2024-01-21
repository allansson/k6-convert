import { flatten, map2, ok } from "~/src/context";
import {
  defaultScenario,
  scenario,
  test,
  type DefaultScenarioDeclaration,
  type NamedScenarioDeclaration,
  type TestDefinition,
} from "~/src/convert/ast";
import {
  ConverterContext,
  type ConverterResult,
} from "~/src/convert/test/context";
import { fromSteps } from "~/src/convert/test/steps";
import type { DefaultScenario, Scenario, Test } from "~/src/convert/test/types";

interface TestInput {
  source: "test";
  target: "script";
  test: Test;
}

function fromDefaultScenario(
  context: ConverterContext,
  input: DefaultScenario,
): ConverterResult<DefaultScenarioDeclaration> {
  return fromSteps(context, input.steps).map((steps) =>
    defaultScenario(input.name, steps),
  );
}

function fromScenario(
  context: ConverterContext,
  input: Scenario,
): ConverterResult<NamedScenarioDeclaration> {
  return fromSteps(context, input.steps).map((steps) =>
    scenario(input.name, steps),
  );
}

function fromTest(
  input: Test,
  context = new ConverterContext(),
): ConverterResult<TestDefinition> {
  const defaultScenario = ok(input.defaultScenario).andThen((scenario) =>
    scenario ? fromDefaultScenario(context, scenario) : ok(scenario),
  );

  const namedScenarios = Object.values(input.scenarios).map((scenario) =>
    fromScenario(context, scenario),
  );

  return map2(flatten(namedScenarios), defaultScenario, test);
}

export { fromTest, type TestInput };
