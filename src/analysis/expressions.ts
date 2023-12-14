import {
  report,
  type AnalysisContext,
  type DeclarationInfo,
} from "~/src/analysis/analysis";
import type {
  Expression,
  IdentifierExpression,
  NullExpression,
  SafeHttpExpression,
  StringLiteralExpression,
  UnsafeHttpExpression,
  UrlEncodedBodyExpression,
} from "~/src/convert/ast";
import { exhaustive } from "~/src/utils";

function analyzeIdentifierExpression(
  context: AnalysisContext,
  expression: IdentifierExpression
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

function analyzeSafeHttpExpression(
  context: AnalysisContext,
  _expression: SafeHttpExpression
): AnalysisContext {
  return context;
}

function analyseUnsafeHttpExpression(
  context: AnalysisContext,
  expression: UnsafeHttpExpression
): AnalysisContext {
  return analyzeExpression(context, expression.body);
}

function analyzeStringLiteralExpression(
  context: AnalysisContext,
  _expression: StringLiteralExpression
): AnalysisContext {
  return context;
}

function analyzeUrlEncodedBodyExpression(
  context: AnalysisContext,
  expression: UrlEncodedBodyExpression
): AnalysisContext {
  return Object.values(expression.fields).reduce(analyzeExpression, context);
}

function analyzeNullExpression(
  context: AnalysisContext,
  _expression: NullExpression
): AnalysisContext {
  return context;
}

function analyzeExpression(
  context: AnalysisContext,
  expression: Expression
): AnalysisContext {
  switch (expression.type) {
    case "IdentifierExpression":
      return analyzeIdentifierExpression(context, expression);

    case "SafeHttpExpression":
      return analyzeSafeHttpExpression(context, expression);

    case "UnsafeHttpExpression":
      return analyseUnsafeHttpExpression(context, expression);

    case "StringLiteralExpression":
      return analyzeStringLiteralExpression(context, expression);

    case "UrlEncodedBodyExpression":
      return analyzeUrlEncodedBodyExpression(context, expression);

    case "NullExpression":
      return analyzeNullExpression(context, expression);

    default:
      return exhaustive(expression);
  }
}

export { analyzeExpression };
