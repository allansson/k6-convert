import type * as es from "estree";

import {
  defaultExport,
  functionDeclaration,
  namedExport,
  program,
} from "~/src/codegen/builders/modules";
import { EmitContext } from "~/src/codegen/context";
import { format } from "~/src/codegen/formatter";
import type { DefaultScenario, Scenario, Test } from "~/src/convert/ast";

function spaceBetween<Node extends es.Node>(nodes: Node[]): Node[] {
  const newNodes = [...nodes];

  for (let i = 0; i < newNodes.length - 1; i++) {
    const node = newNodes[i];

    if (node === null || node === undefined) {
      continue;
    }

    newNodes[i] = {
      ...node,
      newLine: "after",
    };
  }

  return newNodes;
}

function emitNamedScenario(
  _context: EmitContext,
  scenario: Scenario
): es.ExportNamedDeclaration {
  return namedExport(functionDeclaration(scenario.name, []));
}

function emitDefaultScenario(
  _context: EmitContext,
  scenario: DefaultScenario
): es.ExportDefaultDeclaration {
  return defaultExport(functionDeclaration(scenario.name, []));
}

function emit(test: Test): Promise<string> {
  const context = new EmitContext();

  const defaultScenario = test.defaultScenario
    ? [emitDefaultScenario(context, test.defaultScenario)]
    : [];

  const namedScenarios = test.scenarios.map((scenario) => {
    return emitNamedScenario(context, scenario);
  });

  const scenarios = [...namedScenarios, ...defaultScenario];
  const ast = program(spaceBetween(scenarios));

  return format(ast);
}

export { emit };
