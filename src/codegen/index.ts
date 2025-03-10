import type * as es from "estree";

import {
  defaultExport,
  defaultImport,
  importDeclaration,
  namedExport,
  namedImport,
  program,
} from "~/src/codegen/builders/modules";
import { func } from "~/src/codegen/builders/statements";
import { EmitContext, type Import } from "~/src/codegen/context";
import { format } from "~/src/codegen/formatter";
import { spaceAfter, spaceBetween } from "~/src/codegen/spacing";
import { emitBlockStatement } from "~/src/codegen/statements";
import { fromPromise } from "~/src/context";
import type {
  DefaultScenarioDeclaration,
  NamedScenarioDeclaration,
  TestDefinition,
} from "~/src/convert/ast";

function emitImport(target: Import): es.ImportDeclaration {
  const defaultSpecifier =
    target.default !== undefined ? [defaultImport(target.default)] : [];
  const namedSpecifiers = [...target.named].map((name) => namedImport(name));

  return importDeclaration(
    [...defaultSpecifier, ...namedSpecifiers],
    target.from,
  );
}

function emitNamedScenario(
  context: EmitContext,
  scenario: NamedScenarioDeclaration,
): es.ExportNamedDeclaration {
  return namedExport(
    func(scenario.name, emitBlockStatement(context, scenario.body)),
  );
}

function emitDefaultScenario(
  context: EmitContext,
  scenario: DefaultScenarioDeclaration,
): es.ExportDefaultDeclaration {
  return defaultExport(
    func(scenario.name, emitBlockStatement(context, scenario.body)),
  );
}

function emit(test: TestDefinition) {
  const context = new EmitContext();

  const defaultScenario = test.defaultScenario
    ? [emitDefaultScenario(context, test.defaultScenario)]
    : [];

  const namedScenarios = test.scenarios.map((scenario) => {
    return emitNamedScenario(context, scenario);
  });

  const imports = context.getImports().map(emitImport);

  const scenarios = spaceBetween([...namedScenarios, ...defaultScenario]);
  const ast = program([...spaceAfter(imports), ...scenarios]);

  return fromPromise(format(ast));
}

export { emit };
