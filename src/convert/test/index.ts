import {
  defaultScenario,
  scenario,
  test,
  type DefaultScenarioDeclaration,
  type ScenarioDeclaration,
  type TestDefinition,
} from "~/src/convert/ast";
import { fromStep } from "~/src/convert/test/steps";
import type * as Input from "~/src/convert/test/types";

interface TestInput {
  source: "test";
  target: "script";
  test: Input.Test;
}

function fromDefaultScenario(
  input: Input.DefaultScenario,
): DefaultScenarioDeclaration {
  return defaultScenario(input.name, input.steps.flatMap(fromStep));
}

function fromScenario(input: Input.Scenario): ScenarioDeclaration {
  return scenario(input.name, input.steps.flatMap(fromStep));
}

function fromTest(input: Input.Test): TestDefinition {
  const defaultScenario =
    input.defaultScenario && fromDefaultScenario(input.defaultScenario);

  const namedScenarios = Object.values(input.scenarios).map(fromScenario);

  return test(namedScenarios, defaultScenario);
}

export { fromTest, type TestInput };
