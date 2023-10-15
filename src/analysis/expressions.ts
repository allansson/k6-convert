import type { Expression, IdentifierExpression } from "../ast";
import { reverse } from "../utils";
import { report, type AnalysisContext, type DeclarationInfo } from "./analysis";

function findDeclaration(
  name: string,
  context: AnalysisContext
): DeclarationInfo | null {
  for (const declaration of reverse(context.declarations)) {
    if (declaration.node.name === name) {
      return declaration;
    }
  }

  return null;
}

function analyzeIdentifierExpression(
  expression: IdentifierExpression,
  context: AnalysisContext
): AnalysisContext {
  const declaration = findDeclaration(expression.name, context);

  if (declaration === null) {
    return report(context, {
      type: "UndeclaredVariableIssue",
      node: expression,
    });
  }

  const newDeclaration = {
    ...declaration,
    references: [
      ...declaration.references,
      {
        path: context.self.path,
        node: expression,
      },
    ],
  };

  return {
    ...context,
    declarations: context.declarations.map((declaration) =>
      declaration.id === newDeclaration.id ? newDeclaration : declaration
    ),
  };
}

function analyzeExpression(
  expression: Expression,
  context: AnalysisContext
): AnalysisContext {
  switch (expression.type) {
    case "IdentifierExpression":
      return analyzeIdentifierExpression(expression, context);

    default:
      return context;
  }
}

export { analyzeExpression };
