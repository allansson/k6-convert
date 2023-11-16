import type * as es from "estree";
import {
  arrow,
  call,
  identifier,
  literal,
} from "~/src/codegen/builders/expressions";
import { expressionStatement } from "~/src/codegen/builders/statements";
import type { EmitContext } from "~/src/codegen/context";
import {
  type GroupStatement,
  type SleepStatement,
  type Statement,
} from "~/src/convert/ast";

function emitGroupStatement(
  context: EmitContext,
  statement: GroupStatement
): es.Statement {
  context.import("group", "k6");

  const expression = call(identifier("group"), [
    literal(statement.name),
    arrow(
      [],
      statement.statements.map((statement) => {
        return emitStatement(context, statement);
      })
    ),
  ]);

  return expressionStatement(expression);
}

function emitSleepStatement(
  context: EmitContext,
  statement: SleepStatement
): es.Statement {
  context.import("sleep", "k6");

  const expression = call(identifier("sleep"), [literal(statement.seconds)]);

  return expressionStatement(expression);
}

function emitStatement(
  context: EmitContext,
  statement: Statement
): es.Statement {
  switch (statement.type) {
    case "GroupStatement":
      return emitGroupStatement(context, statement);

    case "SleepStatement":
      return emitSleepStatement(context, statement);

    default:
      throw new Error(`Statement ${statement.type} not implemented`);
  }
}

export { emitStatement };
