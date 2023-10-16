import type { Expression, IdentifierExpression } from "../ast";
import { report, type AnalysisContext } from "./analysis";

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
