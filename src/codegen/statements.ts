import type * as es from "estree";
import {
  arrow,
  call,
  identifier,
  literal,
  member,
} from "~/src/codegen/builders/expressions";
import {
  assign,
  declare,
  expressionStatement,
} from "~/src/codegen/builders/statements";
import type { EmitContext } from "~/src/codegen/context";
import { emitExpression } from "~/src/codegen/expressions";
import { spaceBetween } from "~/src/codegen/spacing";
import type {
  AssignStatement,
  ExpressionStatement,
  GroupStatement,
  LogStatement,
  SleepStatement,
  Statement,
  UserVariableDeclaration,
} from "~/src/convert/ast";

function emitBody(
  context: EmitContext,
  statements: Statement[]
): es.Statement[] {
  const body = statements.map((statement) => {
    return emitStatement(context, statement);
  });

  return spaceBetween(body);
}

function emitGroupStatement(
  context: EmitContext,
  statement: GroupStatement
): es.Statement {
  context.import("group", "k6");

  const expression = call(identifier("group"), [
    literal(statement.name),
    arrow([], emitBody(context, statement.statements)),
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

function emitLogStatement(
  context: EmitContext,
  statement: LogStatement
): es.Statement {
  const expression = call(member("console", "log"), [
    emitExpression(context, statement.expression),
  ]);

  return expressionStatement(expression);
}

function emitAssignStatement(
  context: EmitContext,
  statement: AssignStatement
): es.Statement {
  const expression = assign(
    statement.name,
    emitExpression(context, statement.expression)
  );

  return expressionStatement(expression);
}

function emitUserVariableDeclaration(
  context: EmitContext,
  statement: UserVariableDeclaration
): es.Statement {
  return declare(
    statement.kind,
    statement.name,
    emitExpression(context, statement.expression)
  );
}

function emitExpressionStatement(
  context: EmitContext,
  statement: ExpressionStatement
): es.Statement {
  const expression = emitExpression(context, statement.expression);

  return expressionStatement(expression);
}

function emitStatement(
  context: EmitContext,
  statement: Statement
): es.Statement {
  switch (statement.type) {
    case "ExpressionStatement":
      return emitExpressionStatement(context, statement);

    case "GroupStatement":
      return emitGroupStatement(context, statement);

    case "SleepStatement":
      return emitSleepStatement(context, statement);

    case "LogStatement":
      return emitLogStatement(context, statement);

    case "AssignStatement":
      return emitAssignStatement(context, statement);

    case "UserVariableDeclaration":
      return emitUserVariableDeclaration(context, statement);
  }
}

export { emitBody, emitStatement };
