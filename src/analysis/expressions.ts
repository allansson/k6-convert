import {
  report,
  type AnalysisContext,
  type DeclarationInfo,
} from "src/analysis/analysis";
import type { Expression, IdentifierExpression } from "src/convert/ast";

function analyzeIdentifierExpression(
  expression: IdentifierExpression,
  context: AnalysisContext
): AnalysisContext {
  const declaration = context.frame[expression.name];

  if (declaration === undefined) {
    return report(context, {
      type: "UndeclaredVariable",
      node: expression,
    });
  }

  const newDeclaration: DeclarationInfo = {
    ...declaration,
    references: [
      ...declaration.references,
      {
        id: context.self.id,
        path: context.self.path,
        scope: context.scope,
        node: expression,
      },
    ],
  };

  return {
    ...context,
    frame: {
      ...context.frame,
      [expression.name]: newDeclaration,
    },
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
