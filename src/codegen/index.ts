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
import { emitBody } from "~/src/codegen/statements";
import type {
  DefaultScenarioDeclaration,
  ScenarioDeclaration,
  TestDefinition,
} from "~/src/convert/ast";

function emitImport(target: Import): es.ImportDeclaration {
  const defaultSpecifier =
    target.default !== undefined ? [defaultImport(target.default)] : [];
  const namedSpecifiers = [...target.named].map((name) => namedImport(name));

  return importDeclaration(
    [...defaultSpecifier, ...namedSpecifiers],
    target.from
  );
}

function emitNamedScenario(
  context: EmitContext,
  scenario: ScenarioDeclaration
): es.ExportNamedDeclaration {
  return namedExport(
    func(scenario.name, emitBody(context, scenario.statements))
  );
}

function emitDefaultScenario(
  context: EmitContext,
  scenario: DefaultScenarioDeclaration
): es.ExportDefaultDeclaration {
  return defaultExport(
    func(scenario.name, emitBody(context, scenario.statements))
  );
}

function emit(test: TestDefinition): Promise<string> {
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

  return format(ast);
}

export { emit };
