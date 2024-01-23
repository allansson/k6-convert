import type * as es from "estree";
import {
  array,
  call,
  index,
  literal,
  logical,
  member,
  object,
  regex,
  templateString,
} from "~/src/codegen/builders/expressions";
import type { EmitContext } from "~/src/codegen/context";
import type {
  ArrayLiteralExpression,
  BooleanLiteralExpression,
  Expression,
  HttpMethod,
  Identifier,
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

function toHttpFunction(method: HttpMethod): string {
  return method.toLowerCase();
}

function emitSafeHttp(
  context: EmitContext,
  expression: SafeHttpExpression,
): es.Expression {
  context.importDefault("http", "k6/http");

  const url = emitExpression(context, expression.url);

  return call(member("http", toHttpFunction(expression.method)), [url]);
}

function emitUnsafeHttp(
  context: EmitContext,
  expression: UnsafeHttpExpression,
) {
  context.importDefault("http", "k6/http");

  const url = emitExpression(context, expression.url);
  const body = emitExpression(context, expression.body);

  const params =
    expression.headers !== undefined
      ? [object([["headers", emitExpression(context, expression.headers)]])]
      : [];

  return call(member("http", toHttpFunction(expression.method)), [
    url,
    body,
    ...params,
  ]);
}

function emitUrlEncodedBody(
  context: EmitContext,
  expression: UrlEncodedBodyExpression,
): es.Expression {
  const properties: Array<[string, es.Expression]> = Object.entries(
    expression.fields,
  ).map(([key, value]) => {
    return [key, emitExpression(context, value)];
  });

  return object(properties);
}

function emitJsonEncodedBodyExpression(
  context: EmitContext,
  expression: JsonEncodedBodyExpression,
): es.Expression {
  return call(member("JSON", "stringify"), [
    emitExpression(context, expression.content),
  ]);
}

function emitIdentifier(
  _context: EmitContext,
  expression: Identifier,
): es.Expression {
  return {
    type: "Identifier",
    name: expression.name,
  };
}

function emitStringLiteral(
  context: EmitContext,
  expression: StringLiteralExpression,
): es.Expression {
  if (expression.expressions.length === 0) {
    return literal(expression.strings.join(""));
  }

  if (
    expression.expressions.length === 1 &&
    expression.expressions[0] !== undefined
  ) {
    return emitExpression(context, expression.expressions[0]);
  }

  return templateString(
    expression.strings,
    expression.expressions.map((expression) =>
      emitExpression(context, expression),
    ),
  );
}

function emitNumberLiteralExpression(
  _context: EmitContext,
  expression: NumberLiteralExpression,
): es.Expression {
  return literal(expression.value);
}

function emitBooleanLiteralExpression(
  _context: EmitContext,
  expression: BooleanLiteralExpression,
): es.Expression {
  return literal(expression.value);
}

function emitObjectLiteralExpression(
  context: EmitContext,
  expression: ObjectLiteralExpression,
): es.Expression {
  const entries = Object.entries(expression.fields);

  const properties: Array<[string, es.Expression]> = entries.map(
    ([key, value]) => {
      return [key, emitExpression(context, value)] as const;
    },
  );

  return object(properties);
}

function emitArrayLiteralExpression(
  context: EmitContext,
  expression: ArrayLiteralExpression,
): es.Expression {
  const elements = expression.elements.map((element) => {
    return emitExpression(context, element);
  });

  return array(elements);
}

function emitNull(
  _context: EmitContext,
  _expression: NullExpression,
): es.Expression {
  return literal(null);
}

function emitMemberExpression(
  context: EmitContext,
  expression: MemberExpression,
): es.Expression {
  const object = emitExpression(context, expression.object);
  const property = emitExpression(context, expression.property);

  const result = expression.computed
    ? index(object, property)
    : member(object, property);

  if (expression.optional) {
    return logical(object, "&&", result);
  }

  return result;
}

function emitRegexMatchExpression(
  context: EmitContext,
  expression: RegexMatchExpression,
): es.Expression {
  const pattern = regex(expression.pattern);
  const target = emitExpression(context, expression.target);

  return call(member(pattern, "exec"), [target]);
}

function emitExpression(
  context: EmitContext,
  expression: Expression,
): es.Expression {
  switch (expression.type) {
    case "SafeHttpExpression":
      return emitSafeHttp(context, expression);

    case "UnsafeHttpExpression":
      return emitUnsafeHttp(context, expression);

    case "UrlEncodedBodyExpression":
      return emitUrlEncodedBody(context, expression);

    case "JsonEncodedBodyExpression":
      return emitJsonEncodedBodyExpression(context, expression);

    case "IdentifierExpression":
      return emitIdentifier(context, expression);

    case "StringLiteralExpression":
      return emitStringLiteral(context, expression);

    case "NumberLiteralExpression":
      return emitNumberLiteralExpression(context, expression);

    case "BooleanLiteralExpression":
      return emitBooleanLiteralExpression(context, expression);

    case "NullExpression":
      return emitNull(context, expression);

    case "ObjectLiteralExpression":
      return emitObjectLiteralExpression(context, expression);

    case "ArrayLiteralExpression":
      return emitArrayLiteralExpression(context, expression);

    case "MemberExpression":
      return emitMemberExpression(context, expression);

    case "RegexMatchExpression":
      return emitRegexMatchExpression(context, expression);

    default:
      return exhaustive(expression);
  }
}

export { emitExpression };
