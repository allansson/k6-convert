import type * as es from "estree";
import { literal } from "~/src/codegen/builders/expressions";
import type { EmitContext } from "~/src/codegen/context";
import type {
  Expression,
  NullExpression,
  StringLiteralExpression,
} from "~/src/convert/ast";

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
    case "StringLiteralExpression":
      return emitStringLiteral(context, expression);

    case "NullExpression":
      return emitNull(context, expression);

    default:
      throw new Error(`Expression type ${expression.type} not implemented.`);
  }
}

export { emitExpression };
