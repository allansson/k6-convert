import { scenario, test, type Scenario, type Test } from "~/src/convert/ast";
import type * as Input from "~/src/inputs/test/types";

function toScenario(input: Input.Scenario): Scenario {
  return scenario(input.name, []);
}

function toIntermediateAST(input: Input.Test): Test {
  const defaultScenario = input.defaultScenario
    ? [toScenario(input.defaultScenario)]
    : [];

  const namedScenarios = Object.values(input.scenarios).map(toScenario);

  return test([...namedScenarios, ...defaultScenario]);
}

export { toIntermediateAST };
