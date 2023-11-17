import type * as es from "estree";
import { literal } from "~/src/codegen/builders/expressions";
import type { EmitContext } from "~/src/codegen/context";
import type { Expression, StringLiteralExpression } from "~/src/convert/ast";

function emitStringLiteral(
  _context: EmitContext,
  expression: StringLiteralExpression
): es.Expression {
  return literal(expression.value);
}

function emitExpression(
  context: EmitContext,
  expression: Expression
): es.Expression {
  switch (expression.type) {
    case "StringLiteralExpression":
      return emitStringLiteral(context, expression);

    default:
      throw new Error(`Expression type ${expression.type} not implemented.`);
  }
}

export { emitExpression };
