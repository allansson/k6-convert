import type * as es from "estree";
import { call, literal, member } from "~/src/codegen/builders/expressions";
import type { EmitContext } from "~/src/codegen/context";
import type {
  Expression,
  HttpGetExpression,
  NullExpression,
  StringLiteralExpression,
} from "~/src/convert/ast";

function emitHttpGetExpression(
  context: EmitContext,
  expression: HttpGetExpression
): es.Expression {
  context.importDefault("http", "k6/http");

  const url = emitExpression(context, expression.url);

  return call(member("http", "get"), [url]);
}

function emitStringLiteral(
  _context: EmitContext,
  expression: StringLiteralExpression
): es.Expression {
  return literal(expression.value);
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
    case "HttpGetExpression":
      return emitHttpGetExpression(context, expression);

    case "StringLiteralExpression":
      return emitStringLiteral(context, expression);

    case "NullExpression":
      return emitNull(context, expression);

    default:
      throw new Error(`Expression type ${expression.type} not implemented.`);
  }
}

export { emitExpression };
