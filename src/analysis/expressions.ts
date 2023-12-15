import {
  report,
  type AnalysisContext,
  type DeclarationInfo,
} from "~/src/analysis/analysis";
import type {
  ArrayLiteralExpression,
  BooleanLiteralExpression,
  Expression,
  IdentifierExpression,
  JsonEncodedBodyExpression,
  NullExpression,
  NumberLiteralExpression,
  ObjectLiteralExpression,
  SafeHttpExpression,
  StringLiteralExpression,
  UnsafeHttpExpression,
  UrlEncodedBodyExpression,
} from "~/src/convert/ast";
import { exhaustive } from "~/src/utils";

function analyzeIdentifierExpression(
  context: AnalysisContext,
  expression: IdentifierExpression,
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
      declaration.id === newDeclaration.id ? newDeclaration : declaration,
    ),
  };
}

function analyzeSafeHttpExpression(
  context: AnalysisContext,
  _expression: SafeHttpExpression,
): AnalysisContext {
  return context;
}

function analyseUnsafeHttpExpression(
  context: AnalysisContext,
  expression: UnsafeHttpExpression,
): AnalysisContext {
  return analyzeExpression(context, expression.body);
}

function analyzeUrlEncodedBodyExpression(
  context: AnalysisContext,
  expression: UrlEncodedBodyExpression,
): AnalysisContext {
  return Object.values(expression.fields).reduce(analyzeExpression, context);
}

function analyzeJsonEncodedBodyExpression(
  context: AnalysisContext,
  expression: JsonEncodedBodyExpression,
): AnalysisContext {
  return analyzeExpression(context, expression.content);
}

function analyzeStringLiteralExpression(
  context: AnalysisContext,
  _expression: StringLiteralExpression,
): AnalysisContext {
  return context;
}

function analyzeBooleanLiteralExpression(
  context: AnalysisContext,
  _expression: BooleanLiteralExpression,
): AnalysisContext {
  return context;
}

function analyzeNumberLiteralExpression(
  context: AnalysisContext,
  _expression: NumberLiteralExpression,
): AnalysisContext {
  return context;
}

function analyzeArrayLiteralExpression(
  context: AnalysisContext,
  expression: ArrayLiteralExpression,
): AnalysisContext {
  return expression.elements.reduce(analyzeExpression, context);
}

function analyzeObjectLiteralExpression(
  context: AnalysisContext,
  expression: ObjectLiteralExpression,
): AnalysisContext {
  return Object.values(expression.fields).reduce(analyzeExpression, context);
}

function analyzeNullExpression(
  context: AnalysisContext,
  _expression: NullExpression,
): AnalysisContext {
  return context;
}

function analyzeExpression(
  context: AnalysisContext,
  expression: Expression,
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

    case "JsonEncodedBodyExpression":
      return analyzeJsonEncodedBodyExpression(context, expression);

    case "BooleanLiteralExpression":
      return analyzeBooleanLiteralExpression(context, expression);

    case "NumberLiteralExpression":
      return analyzeNumberLiteralExpression(context, expression);

    case "ArrayLiteralExpression":
      return analyzeArrayLiteralExpression(context, expression);

    case "ObjectLiteralExpression":
      return analyzeObjectLiteralExpression(context, expression);

    case "NullExpression":
      return analyzeNullExpression(context, expression);

    default:
      return exhaustive(expression);
  }
}

export { analyzeExpression };
