import type * as es from "estree";
import {
  call,
  literal,
  member,
  object,
} from "~/src/codegen/builders/expressions";
import type { EmitContext } from "~/src/codegen/context";
import type {
  Expression,
  HttpMethod,
  IdentifierExpression,
  NullExpression,
  SafeHttpExpression,
  StringLiteralExpression,
  UnsafeHttpExpression,
  UrlEncodedBodyExpression,
} from "~/src/convert/ast";

function toHttpFunction(method: HttpMethod): string {
  return method.toLowerCase();
}

function emitSafeHttp(
  context: EmitContext,
  expression: SafeHttpExpression
): es.Expression {
  context.importDefault("http", "k6/http");

  const url = emitExpression(context, expression.url);

  return call(member("http", toHttpFunction(expression.method)), [url]);
}

function emitUnsafeHttp(
  context: EmitContext,
  expression: UnsafeHttpExpression
) {
  context.importDefault("http", "k6/http");

  const url = emitExpression(context, expression.url);
  const body = emitExpression(context, expression.body);

  return call(member("http", toHttpFunction(expression.method)), [url, body]);
}

function emitUrlEncodedBody(
  context: EmitContext,
  expression: UrlEncodedBodyExpression
): es.Expression {
  const properties: Array<[string, es.Expression]> = Object.entries(
    expression.fields
  ).map(([key, value]) => {
    return [key, emitExpression(context, value)];
  });

  return object(properties);
}

function emitStringLiteral(
  _context: EmitContext,
  expression: StringLiteralExpression
): es.Expression {
  return literal(expression.value);
}

function emitIdentifier(
  _context: EmitContext,
  expression: IdentifierExpression
): es.Expression {
  return {
    type: "Identifier",
    name: expression.name,
  };
}

function emitNull(
  _context: EmitContext,
  _expression: NullExpression
): es.Expression {
  return literal(null);
}

function emitExpression(
  context: EmitContext,
  expression: Expression
): es.Expression {
  switch (expression.type) {
    case "SafeHttpExpression":
      return emitSafeHttp(context, expression);

    case "UnsafeHttpExpression":
      return emitUnsafeHttp(context, expression);

    case "StringLiteralExpression":
      return emitStringLiteral(context, expression);

    case "NullExpression":
      return emitNull(context, expression);

    case "IdentifierExpression":
      return emitIdentifier(context, expression);

    case "UrlEncodedBodyExpression":
      return emitUrlEncodedBody(context, expression);
  }
}

export { emitExpression };
