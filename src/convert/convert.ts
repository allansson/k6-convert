import {
  defaultScenario,
  scenario,
  test,
  type DefaultScenario,
  type Scenario,
  type Test,
} from "~/src/convert/ast";
import type * as Input from "~/src/inputs/test/types";

function toDefaultScenario(input: Input.DefaultScenario): DefaultScenario {
  return defaultScenario(input.name, []);
}

function toScenario(input: Input.Scenario): Scenario {
  return scenario(input.name, []);
}

function toIntermediateAST(input: Input.Test): Test {
  const defaultScenario =
    input.defaultScenario && toDefaultScenario(input.defaultScenario);

  const namedScenarios = Object.values(input.scenarios).map(toScenario);

  return test(namedScenarios, defaultScenario);
}

export { toIntermediateAST };
