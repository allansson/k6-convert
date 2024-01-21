import {
  withIndex,
  type AnalysisContext,
  type AnalysisResult,
  type DeclarationInfo,
  type NodeId,
  type NodePath,
  type ScopeInfo,
  type StatementInfo,
} from "~/src/analysis/analysis";
import { analyzeExpression } from "~/src/analysis/expressions";
import { reduceContext } from "~/src/analysis/utils";
import { ok } from "~/src/context";
import type {
  AssignStatement,
  ExpressionStatement,
  GroupStatement,
  LogStatement,
  SleepStatement,
  Statement,
  UserVariableDeclaration,
} from "~/src/convert/ast";
import { exhaustive } from "~/src/utils";

function toNodeId(path: NodePath): NodeId {
  return "/" + path.join("/");
}

function analyzeStatements(
  context: AnalysisContext,
  statements: Statement[],
): AnalysisResult {
  return reduceContext(context, statements, (result, statement, index) => {
    const childPath = [...context.self.path, index];
    const childId = toNodeId(childPath);

    const childScope: StatementInfo = {
      id: childId,
      path: childPath,
      scope: context.scope,
      parent: context.self,
      node: statement,
    };

    const newContext = {
      ...result,
      self: childScope,
    };

    return analyzeStatement(newContext, statement);
  });
}

function analyzeGroupStatement(
  context: AnalysisContext,
  statement: GroupStatement,
): AnalysisResult {
  const scope: ScopeInfo = {
    id: context.self.id,
    path: context.self.path,
    node: statement,
  };

  const newContext = analyzeStatement(
    {
      ...context,
      scope,
    },
    statement.body,
  );

  return newContext.map((newContext) => {
    return {
      ...newContext,
      self: context.self,
      scope: context.scope,
      scopes: {
        ...newContext.scopes,
        [context.self.id]: scope,
      },
    };
  });
}

function analyzeUserVariableDeclaration(
  context: AnalysisContext,
  statement: UserVariableDeclaration,
): AnalysisResult {
  const isRedclared = statement.name in context.frame;

  const declarationInfo: DeclarationInfo = {
    id: context.self.id,
    path: context.self.path,
    scope: context.self.scope,
    parent: context.self.parent,
    node: statement,
    references: [],
  };

  const newContext = {
    ...context,
    frame: {
      ...context.frame,
      [statement.name]: declarationInfo,
    },
    declarations: [...context.declarations, declarationInfo],
  };

  const analyzedExpression = analyzeExpression(
    newContext,
    statement.expression,
  );

  if (isRedclared) {
    return analyzedExpression.report({
      type: "DuplicateVariableDeclaration",
      others: context.declarations
        .filter((declaration) => declaration.node.name === statement.name)
        .map((declaration) => declaration.node),
      node: statement,
    });
  }

  return analyzedExpression;
}

function analyzeAssignStatement(
  context: AnalysisContext,
  statement: AssignStatement,
): AnalysisResult {
  return analyzeExpression(context, statement.expression);
}

function analyzeLogStatement(
  context: AnalysisContext,
  statement: LogStatement,
): AnalysisResult {
  return analyzeExpression(context, statement.expression);
}

function analyseExpressionStatement(
  context: AnalysisContext,
  statement: ExpressionStatement,
): AnalysisResult {
  return analyzeExpression(context, statement.expression);
}

function analyzeSleepStatement(
  context: AnalysisContext,
  _statement: SleepStatement,
): AnalysisResult {
  return ok(context);
}

const analyzeStatement = withIndex(
  (context: AnalysisContext, statement: Statement) => {
    switch (statement.type) {
      case "BlockStatement":
        return analyzeStatements(context, statement.statements);

      case "GroupStatement":
        return analyzeGroupStatement(context, statement);

      case "UserVariableDeclaration":
        return analyzeUserVariableDeclaration(context, statement);

      case "AssignStatement":
        return analyzeAssignStatement(context, statement);

      case "LogStatement":
        return analyzeLogStatement(context, statement);

      case "ExpressionStatement":
        return analyseExpressionStatement(context, statement);

      case "SleepStatement":
        return analyzeSleepStatement(context, statement);

      case "Fragment":
        return analyzeStatements(context, statement.statements);

      default:
        return exhaustive(statement);
    }
  },
);

export { analyzeStatements };
