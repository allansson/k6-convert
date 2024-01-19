import type {
  AnalysisContext,
  AnalysisResult,
  DeclarationInfo,
} from "~/src/analysis/analysis";
import { reduceContext } from "~/src/analysis/utils";
import { ok } from "~/src/context";
import type {
  ArrayLiteralExpression,
  BooleanLiteralExpression,
  Expression,
  IdentifierExpression,
  JsonEncodedBodyExpression,
  MemberExpression,
  NullExpression,
  NumberLiteralExpression,
  ObjectLiteralExpression,
  RegexMatchExpression,
  SafeHttpExpression,
  StringLiteralExpression,
  UnsafeHttpExpression,
  UrlEncodedBodyExpression,
} from "~/src/convert/ast";
import { exhaustive } from "~/src/utils";

function analyzeIdentifierExpression(
  context: AnalysisContext,
  expression: IdentifierExpression,
): AnalysisResult {
  const declaration = context.frame[expression.name];

  if (declaration === undefined) {
    return ok(context).report({
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

  return ok({
    ...context,
    frame: {
      ...context.frame,
      [expression.name]: newDeclaration,
    },
    declarations: context.declarations.map((declaration) =>
      declaration.id === newDeclaration.id ? newDeclaration : declaration,
    ),
  });
}

function analyzeSafeHttpExpression(
  context: AnalysisContext,
  _expression: SafeHttpExpression,
): AnalysisResult {
  return ok(context);
}

function analyseUnsafeHttpExpression(
  context: AnalysisContext,
  expression: UnsafeHttpExpression,
): AnalysisResult {
  return analyzeExpression(context, expression.body);
}

function analyzeUrlEncodedBodyExpression(
  context: AnalysisContext,
  expression: UrlEncodedBodyExpression,
): AnalysisResult {
  return reduceContext(
    context,
    Object.values(expression.fields),
    analyzeExpression,
  );
}

function analyzeJsonEncodedBodyExpression(
  context: AnalysisContext,
  expression: JsonEncodedBodyExpression,
): AnalysisResult {
  return analyzeExpression(context, expression.content);
}

function analyzeStringLiteralExpression(
  context: AnalysisContext,
  expression: StringLiteralExpression,
): AnalysisResult {
  return reduceContext(context, expression.expressions, analyzeExpression);
}

function analyzeBooleanLiteralExpression(
  context: AnalysisContext,
  _expression: BooleanLiteralExpression,
): AnalysisResult {
  return ok(context);
}

function analyzeNumberLiteralExpression(
  context: AnalysisContext,
  _expression: NumberLiteralExpression,
): AnalysisResult {
  return ok(context);
}

function analyzeArrayLiteralExpression(
  context: AnalysisContext,
  expression: ArrayLiteralExpression,
): AnalysisResult {
  return reduceContext(context, expression.elements, analyzeExpression);
}

function analyzeObjectLiteralExpression(
  context: AnalysisContext,
  expression: ObjectLiteralExpression,
): AnalysisResult {
  return reduceContext(
    context,
    Object.values(expression.fields),
    analyzeExpression,
  );
}

function analyzeNullExpression(
  context: AnalysisContext,
  _expression: NullExpression,
): AnalysisResult {
  return ok(context);
}

function analyzeMemberExpression(
  context: AnalysisContext,
  expression: MemberExpression,
): AnalysisResult {
  return analyzeExpression(context, expression.object).andThen((context) =>
    analyzeExpression(context, expression.property),
  );
}

function analyzeRegexMatchExpression(
  context: AnalysisContext,
  expression: RegexMatchExpression,
): AnalysisResult {
  return analyzeExpression(context, expression.target);
}

function analyzeExpression(
  context: AnalysisContext,
  expression: Expression,
): AnalysisResult {
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

    case "MemberExpression":
      return analyzeMemberExpression(context, expression);

    case "RegexMatchExpression":
      return analyzeRegexMatchExpression(context, expression);

    default:
      return exhaustive(expression);
  }
}

export { analyzeExpression };
