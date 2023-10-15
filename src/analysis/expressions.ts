import type { Expression, IdentifierExpression } from "../ast";
import type { AnalysisContext } from "./analysis";

function analyzeIdentifierExpression(
  expression: IdentifierExpression,
  context: AnalysisContext
): AnalysisContext {
  return context;
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
