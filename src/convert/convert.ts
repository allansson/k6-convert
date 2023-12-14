import {
  defaultScenario,
  scenario,
  test,
  type DefaultScenarioDeclaration,
  type ScenarioDeclaration,
  type TestDefinition,
} from "~/src/convert/ast";
import type * as Input from "~/src/convert/test/types";

function toDefaultScenario(
  input: Input.DefaultScenario
): DefaultScenarioDeclaration {
  return defaultScenario(input.name, []);
}

function toScenario(input: Input.Scenario): ScenarioDeclaration {
  return scenario(input.name, []);
}

function toIntermediateAST(input: Input.Test): TestDefinition {
  const defaultScenario =
    input.defaultScenario && toDefaultScenario(input.defaultScenario);

  const namedScenarios = Object.values(input.scenarios).map(toScenario);

  return test(namedScenarios, defaultScenario);
}

export { toIntermediateAST };
